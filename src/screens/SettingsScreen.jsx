// Settings screen — white premium settings
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Moon, Sun, Laptop, Lock, Bell, Download, Upload, Trash2, X, Wallet, CreditCard, Target, Plane, Trophy, ShieldCheck, Globe, Calculator, Gift, Shield, Check } from 'lucide-react'
import LockSetupModal from '../components/lock/LockSetupModal'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import ToastMessage from '../components/shared/ToastMessage'
import GSTCalculator from '../components/forms/GSTCalculator'
import { useSettingsStore } from '../store/settingsStore'
import { useSecurityStore } from '../store/securityStore'
import { useAppLock } from '../hooks/useAppLock'
import { CURRENCIES } from '../constants/currencies'
import { exportAllData } from '../services/exportData'
import { importBackupFile } from '../services/importData'
import { db, settingsService, secureWipe } from '../services/database'

const EMOJIS = ['😊','😎','🤑','💎','🚀','👑','✌️','✨']
const THEMES = [{ id: 'light', label: 'Light', Icon: Sun }, { id: 'dark', label: 'Dark', Icon: Moon }, { id: 'system', label: 'System', Icon: Laptop }]
const LOCK_OPTIONS = [
  { id: 'none', label: 'None', emoji: '🔓' },
  { id: 'pin4', label: '4-PIN', emoji: '🔢' },
  { id: 'pin6', label: '6-PIN', emoji: '🔐' },
  { id: 'pattern', label: 'Pattern', emoji: '🔣' },
  { id: 'biometric', label: 'Biometric', emoji: '👆' },
]
const LANGUAGE_OPTIONS = [
  { id: 'en', label: 'English', emoji: '🇺🇸' },
  { id: 'hi', label: 'हिंदी (Hindi)', emoji: '🇮🇳' },
  { id: 'gu', label: 'ગુજરાતી (Gujarati)', emoji: '🇮🇳' },
]

const S = { fontFamily: "'Nunito', sans-serif" }

function SettingRow({ icon: Icon, label, value, onClick, color = '#7C6FF7', subtitle }) {
  return (
    <motion.button whileTap={{ x: 3 }} onClick={onClick}
      className="w-full flex items-center gap-4 px-6 py-5 text-left active:bg-[#F8F7FF] transition-colors">
      <div className="w-11 h-11 rounded-[16px] flex items-center justify-center flex-shrink-0 shadow-sm"
        style={{ background: `${color}15`, border: `1px solid ${color}10` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="flex-1">
        <span className="text-[16px] font-[800] text-[#0F172A] block tracking-tight" style={S}>{label}</span>
        {subtitle && <span className="text-[12px] font-[700] text-[#94A3B8] uppercase tracking-wider mt-0.5" style={S}>{subtitle}</span>}
      </div>
      {value && <span className="text-[13px] font-[800] text-[var(--primary)] mr-1 truncate max-w-[80px]" style={S}>{value}</span>}
      <ChevronRight className="w-4 h-4 text-[#CBD5E1]" />
    </motion.button>
  )
}

function SectionCard({ title, children }) {
  return (
    <div className="mx-6 mb-6">
      {title && <p className="text-[12px] font-[800] uppercase tracking-widest text-[#94A3B8] mb-3 ml-1" style={S}>{title}</p>}
      <div className="overflow-hidden bg-white shadow-[0_4px_24px_rgba(124,111,247,0.05)] rounded-[28px] border border-[#F0F0F8]">
        <div className="divide-y divide-[#F8F9FF]">{children}</div>
      </div>
    </div>
  )
}

export default function SettingsScreen() {
  const navigate = useNavigate()
  const { settings, updateSetting } = useSettingsStore()
  const { setupBiometric } = useAppLock()
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [toast, setToast] = useState(null)
  const [exportPwd, setExportPwd] = useState('')
  const [showExportInput, setShowExportInput] = useState(false)
  const [importPwd, setImportPwd] = useState('')
  const [showImportInput, setShowImportInput] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)
  const [showLanguagePicker, setShowLanguagePicker] = useState(false)
  const [showGST, setShowGST] = useState(false)
  const [lockSetupType, setLockSetupType] = useState(null)
  const [showLockPicker, setShowLockPicker] = useState(false)
  const [currencySearch, setCurrencySearch] = useState('')
  const [showDecoySetup, setShowDecoySetup] = useState(false)

  const currency = CURRENCIES.find(c => c.code === settings?.currency) || CURRENCIES[0]

  const handleLanguageSelect = async (lang) => {
    setShowLanguagePicker(false)
    await updateSetting('language', lang)
    window.location.reload()
  }

  const handleLockTypeSelect = async (type) => {
    setShowLockPicker(false)
    if (['pin4', 'pin6', 'pattern'].includes(type)) {
      setLockSetupType(type)
    } else if (type === 'biometric') {
      const success = await setupBiometric()
      if (success) {
        updateSetting('lockType', type)
        setToast({ id: Date.now(), message: 'Biometric lock enabled', type: 'success' })
      } else {
        setToast({ id: Date.now(), message: 'Biometric setup failed', type: 'error' })
      }
    } else {
      updateSetting('lockType', type)
      setToast({ id: Date.now(), message: 'Security updated', type: 'success' })
    }
  }

  const handleLockSave = (code) => {
    const key = lockSetupType === 'pattern' ? 'lockPattern' : 'lockPin'
    updateSetting(key, code)
    updateSetting('lockType', lockSetupType)
    setLockSetupType(null)
    setToast({ id: Date.now(), message: 'Security updated', type: 'success' })
  }

  const handleDecoySetup = async (pin) => {
    await updateSetting('decoyPin', pin)
    setShowDecoySetup(false)
  }

  const handleExport = async () => {
    if (!exportPwd) return setShowExportInput(true)
    try {
      const filename = await exportAllData(exportPwd)
      setShowExportInput(false); setExportPwd('')
      setToast({ id: Date.now(), type: 'success', message: `Backup saved: ${filename}` })
    } catch (e) { setToast({ id: Date.now(), type: 'error', message: 'Export failed' }) }
  }

  const handleImport = async (mode) => {
    if (!importPwd || !importFile) return
    try {
      await importBackupFile(importFile, importPwd, mode)
      setShowImportInput(false); setImportFile(null); setImportPwd('')
      setToast({ id: Date.now(), type: 'success', message: 'Backup restored! Reloading...' })
      setTimeout(() => window.location.reload(), 1500)
    } catch (e) { setToast({ id: Date.now(), type: 'error', message: 'Import failed' }) }
  }

  const handleClearAll = async () => {
    await secureWipe()
    setShowClearConfirm(false)
    window.location.reload()
  }

  const BottomSheet = ({ show, onClose, title, children }) => (
    <AnimatePresence>
      {show && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-[60]" style={{ background: 'rgba(15,23,42,0.4)' }} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 350 }}
            className="fixed bottom-0 left-0 right-0 z-[61] pb-safe bg-white flex flex-col"
            style={{ borderRadius: '40px 40px 0 0', maxHeight: '90dvh', boxShadow: '0 -20px 40px rgba(0,0,0,0.1)' }}>
            <div className="w-12 h-1.5 bg-[#EEF2FF] rounded-full mx-auto mt-4 mb-4" />
            <div className="flex items-center justify-between px-6 mb-5">
              <h3 className="text-[22px] font-[800] text-[#0F172A] tracking-tight" style={S}>{title}</h3>
              <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} 
                className="w-11 h-11 rounded-full bg-[#F8F9FF] flex items-center justify-center border border-[#F0F0F8]">
                <X className="w-5 h-5 text-[#64748B]" />
              </motion.button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-8 scrollbar-hide">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return (
    <div className="flex flex-col min-h-dvh mb-tab bg-[#F8F7FF] safe-top">
      {/* Header */}
      <div className="px-6 pt-10 pb-6 flex items-center justify-between">
        <h1 className="text-[32px] font-[800] text-[#0F172A] tracking-tight" style={S}>Settings</h1>
        <div className="w-12 h-12 rounded-[18px] bg-white flex items-center justify-center shadow-sm border border-[#F0F0F8]">
            <Globe className="w-6 h-6 text-[var(--primary)]" />
        </div>
      </div>

      <div className="pt-2">
        {/* Profile card */}
        <div className="mx-6 mb-8 p-8 text-center bg-white shadow-[0_8px_32px_rgba(124,111,247,0.08)] rounded-[32px] border border-[#F0F0F8]">
          <motion.div whileTap={{ scale: 0.95 }} className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-[28px] flex items-center justify-center text-5xl mx-auto shadow-lg"
              style={{ background: 'var(--gradient-primary)' }}>
              {settings?.emoji || '😊'}
            </div>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => updateSetting('emoji', e)}
                className={`w-11 h-11 rounded-[16px] text-[20px] flex items-center justify-center transition-all bg-white border ${settings?.emoji === e ? 'border-[var(--primary)] shadow-md' : 'border-[#EEF2FF]'}`}>
                {e}
              </button>
            ))}
          </div>
          <input
            value={settings?.name || ''}
            onChange={e => updateSetting('name', e.target.value)}
            placeholder="Your Name"
            className="text-[26px] font-[800] text-[#0F172A] text-center bg-transparent outline-none w-full placeholder-[#CBD5E1] tracking-tight"
            style={S}
          />
          <p className="text-[13px] font-[800] text-[#94A3B8] mt-1.5 uppercase tracking-widest" style={S}>{currency.code} · {currency.name}</p>
        </div>

        <SectionCard title="Extensions">
          <SettingRow icon={Wallet} label="Digital Wallets" onClick={() => navigate('/wallets')} color="#10B981" subtitle="Manage your accounts" />
          <SettingRow icon={CreditCard} label="Loans & EMIs" onClick={() => navigate('/emis')} color="#06B6D4" subtitle="Track installments" />
          <SettingRow icon={Target} label="Savings Goals" onClick={() => navigate('/goals')} color="#F43F5E" subtitle="Plan your future" />
          <SettingRow icon={Plane} label="Travel Planner" onClick={() => navigate('/trips')} color="#3B82F6" subtitle="Trip budgeter" />
          <SettingRow icon={Gift} label="Event Budgets" onClick={() => navigate('/festivals')} color="#EC4899" subtitle="Gifting & more" />
          <SettingRow icon={Trophy} label="Rank & Rewards" onClick={() => navigate('/badges')} color="#F59E0B" subtitle="Stay motivated" />
        </SectionCard>

        <SectionCard title="Appearance">
          <SettingRow icon={Globe} label="Language"
            value={LANGUAGE_OPTIONS.find(o => o.id === (settings?.language || 'en'))?.label}
            onClick={() => setShowLanguagePicker(true)} color="#7C6FF7" />
          <div className="px-6 py-5">
            <p className="text-[14px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-4" style={S}>Theme Mode</p>
            <div className="flex gap-2.5 bg-[#F8F7FF] p-2 rounded-[22px] border border-[#F0F0F8]">
              {THEMES.map(({ id, label, Icon }) => (
                <button key={id} onClick={() => updateSetting('theme', id)}
                  className={`flex-1 flex flex-col items-center gap-2 py-3.5 rounded-[18px] transition-all ${settings?.theme === id ? 'bg-white text-[var(--primary)] shadow-md' : 'text-[#94A3B8]'}`}>
                  <Icon className="w-5 h-5" />
                  <span className="text-[12px] font-[800] uppercase tracking-wider" style={S}>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Finance">
          <SettingRow icon={Globe} label="Base Currency" value={`${currency.flag} ${currency.code}`} onClick={() => setShowCurrencyPicker(true)} color="#10B981" />
          <SettingRow icon={Target} label="Monthly Limit" value={`${currency.symbol}${settings?.monthlyBudget || 2000}`} onClick={() => navigate('/budget')} color="#7C6FF7" />
        </SectionCard>

        <SectionCard title="Security">
          <SettingRow icon={Shield} label="App Protection"
            value={LOCK_OPTIONS.find(o => o.id === (settings?.lockType || 'none'))?.label}
            onClick={() => setShowLockPicker(true)} color="#7C6FF7" />
          <SettingRow icon={ShieldCheck} label="Decoy Mode"
            value={settings?.decoyPin ? 'Active' : 'Setup'}
            onClick={() => setShowDecoySetup(true)} color="#10B981" />
        </SectionCard>

        <SectionCard title="Communications">
          <div className="flex items-center justify-between px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-[16px] flex items-center justify-center bg-[#F8F7FF] border border-[#F0F0F8]">
                <Bell className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <span className="text-[16px] font-[800] text-[#0F172A] block tracking-tight" style={S}>Budget Alerts</span>
                <span className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest mt-0.5" style={S}>Push notifications</span>
              </div>
            </div>
            <button onClick={() => updateSetting('notificationsOn', !settings?.notificationsOn)}
              className={`w-13 h-7.5 rounded-full transition-all relative border border-[#F0F0F8]`}
              style={{ background: settings?.notificationsOn ? 'var(--primary)' : '#EEF2FF', width: '52px', height: '30px' }}>
              <motion.div className="w-6 h-6 rounded-full bg-white shadow-md absolute top-[2px]"
                animate={{ left: settings?.notificationsOn ? '24px' : '2px' }} />
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Backup & Reset">
           <SettingRow icon={Download} label="Export Backup" onClick={() => setShowExportInput(true)} color="#7C6FF7" subtitle="Save encrypted file" />
           <SettingRow icon={Upload} label="Import Data" onClick={() => setShowImportInput(true)} color="#10B981" subtitle="Restore from file" />
           <SettingRow icon={Trash2} label="Factory Reset" onClick={() => setShowClearConfirm(true)} color="#F43F5E" subtitle="Delete everything" />
        </SectionCard>

        <div className="mx-6 mb-10 p-8 rounded-[32px] border border-[#F0F0F8] bg-white shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-[18px] flex items-center justify-center bg-[rgba(124,111,247,0.1)]">
              <ShieldCheck className="w-6 h-6 text-[var(--primary)]" />
            </div>
            <div>
                <p className="text-[18px] font-[800] text-[#0F172A] tracking-tight" style={S}>Private by Design</p>
                <p className="text-[12px] font-[700] text-[#94A3B8] uppercase tracking-widest" style={S}>Your data, your device</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['No Trackers', 'Max Security', 'Fully Offline', 'E2E Encrypted'].map((t) => (
              <div key={t} className="flex items-center gap-2 px-3 py-2.5 rounded-[14px] bg-[#F8F7FF] border border-[#F0F0F8]">
                <Check className="w-4 h-4 text-[var(--primary)]" />
                <span className="text-[11px] font-[800] text-[#64748B] uppercase tracking-wider" style={S}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center pb-24">
          <p className="text-[12px] font-[800] tracking-[0.2em] uppercase text-[#CBD5E1]" style={S}>Spendly Build v1.0.4</p>
        </div>
      </div>

      <BottomSheet show={showCurrencyPicker} onClose={() => setShowCurrencyPicker(false)} title="Select Currency">
        <div className="flex flex-col gap-3">
          <div className="relative">
              <Calculator className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
              <input value={currencySearch} onChange={e => setCurrencySearch(e.target.value)} placeholder="Search code or country..."
                className="w-full py-4.5 pl-12 pr-5 rounded-[20px] outline-none font-[700] text-[16px]"
                style={{ background: '#F8F7FF', border: '1px solid #F0F0F8', ...S, color: '#0F172A' }} />
          </div>
          <div className="grid grid-cols-1 gap-2.5 mt-2">
            {CURRENCIES.filter(c => c.name.toLowerCase().includes(currencySearch.toLowerCase()) || c.code.toLowerCase().includes(currencySearch.toLowerCase())).map(c => (
                <button key={c.code} onClick={() => { updateSetting('currency', c.code); setShowCurrencyPicker(false); setCurrencySearch('') }}
                  className={`flex items-center gap-4 px-5 py-4.5 rounded-[22px] transition-all border ${settings?.currency === c.code ? 'bg-[#EEF2FF] border-[var(--primary)] shadow-sm' : 'bg-[#F8F7FF] border-transparent'}`}>
                  <span className="text-3xl">{c.flag}</span>
                  <div className="flex-1 text-left">
                    <p className="text-[16px] font-[800] text-[#0F172A] tracking-tight" style={S}>{c.code}</p>
                    <p className="text-[12px] font-[700] text-[#94A3B8] uppercase tracking-widest" style={S}>{c.name}</p>
                  </div>
                  {settings?.currency === c.code && <div className="w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center"><Check className="w-4 h-4 text-white" strokeWidth={3} /></div>}
                </button>
            ))}
          </div>
        </div>
      </BottomSheet>

      <BottomSheet show={showLockPicker} onClose={() => setShowLockPicker(false)} title="Security Lock">
        <div className="grid grid-cols-1 gap-3">
          {LOCK_OPTIONS.map(opt => (
            <button key={opt.id} onClick={() => handleLockTypeSelect(opt.id)}
              className={`flex items-center justify-between px-6 py-5 rounded-[24px] transition-all bg-[#F8F7FF] border ${settings?.lockType === opt.id ? 'border-[var(--primary)] shadow-sm bg-white' : 'border-transparent'}`}>
              <div className="flex items-center gap-4">
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-[16px] font-[800] text-[#0F172A] tracking-tight" style={S}>{opt.label}</span>
              </div>
              {settings?.lockType === opt.id && <div className="w-5 h-5 rounded-full bg-[var(--primary)]" />}
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet show={showLanguagePicker} onClose={() => setShowLanguagePicker(false)} title="Language">
        <div className="grid grid-cols-1 gap-3">
          {LANGUAGE_OPTIONS.map(opt => (
            <button key={opt.id} onClick={() => handleLanguageSelect(opt.id)}
              className={`flex items-center justify-between px-6 py-5 rounded-[24px] transition-all bg-[#F8F7FF] border ${settings?.language === opt.id ? 'border-[var(--primary)] shadow-sm bg-white' : 'border-transparent'}`}>
              <div className="flex items-center gap-4">
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-[16px] font-[800] text-[#0F172A] tracking-tight" style={S}>{opt.label}</span>
              </div>
              {settings?.language === opt.id && <div className="w-5 h-5 rounded-full bg-[var(--primary)]" />}
            </button>
          ))}
        </div>
      </BottomSheet>

      <AnimatePresence>
        {showDecoySetup && (
          <LockSetupModal
            lockType={settings?.lockType === 'pattern' ? 'pattern' : (settings?.lockType === 'pin6' ? 'pin6' : 'pin4')}
            title="Set Decoy Lock"
            onSave={handleDecoySetup}
            onCancel={() => setShowDecoySetup(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showGST && <GSTCalculator onClose={() => setShowGST(false)} />}
      </AnimatePresence>
      {lockSetupType && (
        <LockSetupModal lockType={lockSetupType} onSave={handleLockSave} onCancel={() => setLockSetupType(null)} />
      )}
      <ConfirmDialog show={showClearConfirm} title="Wipe all data?" 
        message="This will permanently delete your entire history. This action cannot be reversed."
        confirmText="Yes, Wipe Data" onConfirm={handleClearAll} onCancel={() => setShowClearConfirm(false)} />
      
      {/* Mini Export/Import Inputs Inline (Simplification) */}
      <AnimatePresence>
        {showExportInput && (
            <BottomSheet show={showExportInput} onClose={() => setShowExportInput(false)} title="Secure Export">
                <p className="text-[14px] font-[700] text-[#94A3B8] mb-5" style={S}>Set a password to encrypt your backup file. You'll need this to restore it later.</p>
                <div className="flex flex-col gap-4">
                    <input value={exportPwd} onChange={e => setExportPwd(e.target.value)} type="password" placeholder="Backup Password"
                      className="w-full py-4.5 px-6 rounded-[22px] bg-[#F8F7FF] border border-[#F0F0F8] outline-none font-[800]" style={S} />
                    <motion.button whileTap={{ scale: 0.98 }} onClick={handleExport} className="w-full py-5 rounded-[22px] text-white font-[800] text-[16px] shadow-lg"
                      style={{ background: 'var(--gradient-primary)', ...S }}>Generate .spendly File</motion.button>
                </div>
            </BottomSheet>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showImportInput && (
            <BottomSheet show={showImportInput} onClose={() => setShowImportInput(false)} title="Restore Backup">
                <p className="text-[14px] font-[700] text-[#94A3B8] mb-5" style={S}>Select your .spendly file and enter the decryption password.</p>
                <div className="flex flex-col gap-4">
                    <div className="relative w-full py-4 px-6 rounded-[22px] bg-[#F8F7FF] border border-[#F0F0F8] overflow-hidden">
                        <input type="file" accept=".spendly" onChange={e => setImportFile(e.target.files[0])}
                            className="absolute inset-0 opacity-0 cursor-pointer" />
                        <div className="flex items-center gap-3">
                            <Upload className="w-5 h-5 text-[var(--primary)]" />
                            <span className="text-[15px] font-[800] text-[#0F172A] truncate" style={S}>
                                {importFile ? importFile.name : 'Choose backup file...'}
                            </span>
                        </div>
                    </div>
                    <input value={importPwd} onChange={e => setImportPwd(e.target.value)} type="password" placeholder="Encryption Password"
                      className="w-full py-4.5 px-6 rounded-[22px] bg-[#F8F7FF] border border-[#F0F0F8] outline-none font-[800]" style={S} />
                    <div className="flex gap-3 mt-2">
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleImport('replace')} className="flex-1 py-4 rounded-[18px] bg-[#F43F5E] text-white font-[800] text-[15px]" style={S}>Replace All</motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleImport('merge')} className="flex-1 py-4 rounded-[18px] bg-[var(--primary)] text-white font-[800] text-[15px]" style={S}>Merge Data</motion.button>
                    </div>
                </div>
            </BottomSheet>
        )}
      </AnimatePresence>

      <ToastMessage toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
