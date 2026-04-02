// Settings screen — white premium settings with #F8F9FF page bg
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
  { id: 'pin4', label: '4-Digit PIN', emoji: '🔢' },
  { id: 'pin6', label: '6-Digit PIN', emoji: '🔐' },
  { id: 'pattern', label: 'Pattern', emoji: '🔣' },
  { id: 'biometric', label: 'Biometric', emoji: '👆' },
]
const LANGUAGE_OPTIONS = [
  { id: 'en', label: 'English', emoji: '🇺🇸' },
  { id: 'hi', label: 'हिंदी (Hindi)', emoji: '🇮🇳' },
  { id: 'gu', label: 'ગુજરાતી (Gujarati)', emoji: '🇮🇳' },
]

const S = { fontFamily: "'Plus Jakarta Sans', sans-serif" }

function SettingRow({ icon: Icon, label, value, onClick, color = '#6366F1', subtitle }) {
  return (
    <motion.button whileTap={{ x: 3 }} onClick={onClick}
      className="w-full flex items-center gap-4 px-5 py-4 text-left active:bg-[#F8F9FF] transition-colors">
      <div className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="flex-1">
        <span className="text-[15px] font-medium text-[#0F172A] block" style={S}>{label}</span>
        {subtitle && <span className="text-[12px] text-[#94A3B8]" style={S}>{subtitle}</span>}
      </div>
      {value && <span className="text-[13px] text-[#94A3B8] mr-1" style={S}>{value}</span>}
      <ChevronRight className="w-4 h-4 text-[#CBD5E1]" />
    </motion.button>
  )
}

function SectionCard({ title, children }) {
  return (
    <div className="mx-5 mb-5">
      {title && <p className="text-[12px] font-semibold uppercase tracking-wider text-[#94A3B8] mb-2 ml-1" style={S}>{title}</p>}
      <div className="overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #F0F0F8', borderRadius: '20px', boxShadow: '0 2px 16px rgba(99,102,241,0.06)' }}>
        <div style={{ divide: 'solid', borderColor: '#F8F9FF' }}>{children}</div>
      </div>
    </div>
  )
}

function Divider() {
  return <div style={{ height: '1px', background: '#F8F9FF', margin: '0 20px' }} />
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
  const [showPinSetup, setShowPinSetup] = useState(false)
  const [showDecoySetup, setShowDecoySetup] = useState(false)
  const [showPatternSetup, setShowPatternSetup] = useState(false)
  const [showLanguagePicker, setShowLanguagePicker] = useState(false)
  const [showGST, setShowGST] = useState(false)
  const [lockSetupType, setLockSetupType] = useState(null)
  const [showLockPicker, setShowLockPicker] = useState(false)
  const [currencySearch, setCurrencySearch] = useState('')

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
      setShowExportInput(false)
      setExportPwd('')
      setToast({ id: Date.now(), type: 'success', message: `✅ Backup saved: ${filename}` })
    } catch (e) {
      setToast({ id: Date.now(), type: 'error', message: 'Export failed' })
    }
  }

  const handleImport = async (mode) => {
    if (!importPwd || !importFile) return
    if (mode === 'replace') {
      const ok = window.confirm('⚠️ This will REPLACE all current data. Are you sure?')
      if (!ok) return
    }
    try {
      await importBackupFile(importFile, importPwd, mode)
      setShowImportInput(false); setImportFile(null); setImportPwd('')
      setToast({ id: Date.now(), type: 'success', message: '✅ Backup restored! Reloading...' })
      setTimeout(() => window.location.reload(), 1500)
    } catch (e) {
      setToast({ id: Date.now(), type: 'error', message: 'Import failed. Invalid password or corrupted file.' })
    }
  }

  const handleClearAll = async () => {
    await secureWipe()
    setShowClearConfirm(false)
    window.location.reload()
  }

  const inputStyle = {
    background: '#F8F9FF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    color: '#0F172A',
    padding: '12px 16px',
    fontSize: '15px',
    outline: 'none',
    width: '100%',
    ...S
  }

  const BottomSheet = ({ show, onClose, title, children }) => (
    <AnimatePresence>
      {show && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-[60]" style={{ background: 'rgba(0,0,0,0.3)' }} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[61] pb-safe bg-white flex flex-col"
            style={{ borderRadius: '28px 28px 0 0', maxHeight: '85dvh', boxShadow: '0 -8px 40px rgba(0,0,0,0.1)' }}>
            <div className="w-9 h-1 bg-[#E2E8F0] rounded-full mx-auto mt-3 mb-4" />
            <div className="flex items-center justify-between px-5 mb-4">
              <h3 className="text-[20px] font-bold text-[#0F172A]" style={S}>{title}</h3>
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#F8F9FF] flex items-center justify-center">
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return (
    <div className="flex flex-col min-h-dvh mb-tab" style={{ background: '#F8F9FF' }}>
      {/* Header */}
      <div className="px-5 safe-top pt-6 pb-4 bg-white" style={{ borderBottom: '1px solid #F0F0F8' }}>
        <h1 className="text-[22px] font-bold text-[#0F172A]" style={S}>Settings</h1>
      </div>

      <div className="pt-5">
        {/* Profile card */}
        <div className="mx-5 mb-5 p-6 text-center" style={{ background: '#FFFFFF', border: '1px solid #F0F0F8', borderRadius: '24px', boxShadow: '0 2px 20px rgba(99,102,241,0.07)' }}>
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto"
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
              {settings?.emoji || '😊'}
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => updateSetting('emoji', e)}
                className="w-9 h-9 rounded-[10px] text-xl flex items-center justify-center transition-all"
                style={{
                  background: settings?.emoji === e ? '#EEF2FF' : '#F8F9FF',
                  border: `1px solid ${settings?.emoji === e ? '#6366F1' : '#E2E8F0'}`,
                }}>
                {e}
              </button>
            ))}
          </div>
          <input
            value={settings?.name || ''}
            onChange={e => updateSetting('name', e.target.value)}
            placeholder="Your Name"
            className="text-[22px] font-bold text-[#0F172A] text-center bg-transparent outline-none w-full placeholder-[#CBD5E1]"
            style={{ ...S }}
            spellCheck="false"
          />
          <p className="text-[14px] text-[#94A3B8] mt-1" style={S}>{currency.flag} {currency.name} · {currency.code}</p>
        </div>

        {/* Extensions */}
        <SectionCard title="Extensions">
          <SettingRow icon={Wallet} label="Digital Wallets" onClick={() => navigate('/wallets')} color="#10B981" />
          <Divider />
          <SettingRow icon={CreditCard} label="Loans & EMIs" onClick={() => navigate('/emis')} color="#06B6D4" />
          <Divider />
          <SettingRow icon={Target} label="Savings Goals" onClick={() => navigate('/goals')} color="#F43F5E" />
          <Divider />
          <SettingRow icon={Plane} label="Travel Planner" onClick={() => navigate('/trips')} color="#3B82F6" />
          <Divider />
          <SettingRow icon={Gift} label="Event Budgets" onClick={() => navigate('/festivals')} color="#EC4899" />
          <Divider />
          <SettingRow icon={Trophy} label="Rank & Rewards" onClick={() => navigate('/badges')} color="#F59E0B" />
        </SectionCard>

        {/* Appearance */}
        <SectionCard title="Appearance">
          <SettingRow icon={Globe} label="Language"
            value={LANGUAGE_OPTIONS.find(o => o.id === (settings?.language || 'en'))?.label}
            onClick={() => setShowLanguagePicker(true)} color="#6366F1" />
          <Divider />
          <div className="px-5 py-4">
            <p className="text-[14px] font-medium text-[#0F172A] mb-3" style={S}>Theme</p>
            <div className="flex gap-2">
              {THEMES.map(({ id, label, Icon }) => (
                <button key={id} onClick={() => updateSetting('theme', id)}
                  className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-[12px] transition-all"
                  style={{
                    background: settings?.theme === id ? '#EEF2FF' : '#F8F9FF',
                    border: `1px solid ${settings?.theme === id ? '#6366F1' : '#E2E8F0'}`,
                    color: settings?.theme === id ? '#6366F1' : '#94A3B8',
                  }}>
                  <Icon className="w-4 h-4" />
                  <span className="text-[12px] font-semibold" style={S}>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Finance */}
        <SectionCard title="Finance">
          <SettingRow icon={Globe} label="Currency" value={`${currency.flag} ${currency.code}`} onClick={() => setShowCurrencyPicker(true)} color="#10B981" />
          <Divider />
          <SettingRow icon={Target} label="Monthly Budget" value={`${currency.symbol}${settings?.monthlyBudget || 2000}`} onClick={() => navigate('/budget')} color="#6366F1" />
        </SectionCard>

        {/* Utilities */}
        <SectionCard title="Utilities">
          <SettingRow icon={Calculator} label="GST/Tax Calculator" onClick={() => setShowGST(true)} color="#06B6D4" />
        </SectionCard>

        {/* Security */}
        <SectionCard title="Privacy & Security">
          <SettingRow icon={Shield} label="App Lock"
            value={LOCK_OPTIONS.find(o => o.id === (settings?.lockType || 'none'))?.label}
            onClick={() => setShowLockPicker(true)} color="#6366F1" />
          {['pin4','pin6','pattern'].includes(settings?.lockType) && (
            <>
              <Divider />
              <SettingRow icon={Lock} label="Change PIN / Pattern" onClick={() => setLockSetupType(settings.lockType)} color="#6366F1" />
            </>
          )}
          <Divider />
          <SettingRow icon={ShieldCheck} label="Decoy Mode"
            value={settings?.decoyPin ? 'Active' : 'Not Set'}
            onClick={() => setShowDecoySetup(true)} color="#10B981" />
        </SectionCard>

        {/* Notifications */}
        <SectionCard title="Notifications">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: '#EEF2FF' }}>
                <Bell className="w-5 h-5 text-[#6366F1]" />
              </div>
              <div>
                <span className="text-[15px] font-medium text-[#0F172A] block" style={S}>Budget Alerts</span>
                <span className="text-[12px] text-[#94A3B8]" style={S}>Notify when near limit</span>
              </div>
            </div>
            <button onClick={() => updateSetting('notificationsOn', !settings?.notificationsOn)}
              className="w-14 h-8 rounded-full transition-all relative"
              style={{ background: settings?.notificationsOn ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : '#E2E8F0' }}>
              <motion.div className="w-6 h-6 rounded-full bg-white shadow-md absolute top-1"
                animate={{ left: settings?.notificationsOn ? 'calc(100% - 28px)' : '4px' }} />
            </button>
          </div>
        </SectionCard>

        {/* Data */}
        <SectionCard title="Your Data">
          {showExportInput ? (
            <div className="px-5 py-4 flex flex-col gap-3">
              <div className="flex gap-2">
                <input value={exportPwd} onChange={e => setExportPwd(e.target.value)} type="password" placeholder="Set backup password..."
                  style={inputStyle} className="flex-1" />
                <button onClick={handleExport} className="px-4 py-3 rounded-[12px] font-semibold text-white text-[14px]"
                  style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', ...S }}>Export</button>
              </div>
              <button onClick={() => setShowExportInput(false)} className="text-[#94A3B8] text-[13px]" style={S}>Cancel</button>
            </div>
          ) : (
            <SettingRow icon={Download} label="Export Backup" onClick={() => setShowExportInput(true)} color="#6366F1" />
          )}
          <Divider />
          {showImportInput ? (
            <div className="px-5 py-4 flex flex-col gap-3">
              <input type="file" accept=".spendly"
                onClick={() => {
                  useSecurityStore.getState().setPauseSecurity(true)
                  window.addEventListener('focus', function unpause() {
                    useSecurityStore.getState().setPauseSecurity(false)
                    window.removeEventListener('focus', unpause)
                  }, { once: true })
                }}
                onChange={e => setImportFile(e.target.files[0])}
                className="text-[13px] text-[#64748B] file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-none file:text-[12px] file:font-bold file:bg-[#EEF2FF] file:text-[#6366F1]" />
              <input value={importPwd} onChange={e => setImportPwd(e.target.value)} type="password" placeholder="Backup password..."
                style={inputStyle} />
              <div className="flex gap-2">
                <button onClick={() => handleImport('replace')} className="flex-1 py-3.5 rounded-[12px] text-white font-semibold text-[14px]"
                  style={{ background: '#F43F5E', ...S }}>Replace</button>
                <button onClick={() => handleImport('merge')} className="flex-1 py-3.5 rounded-[12px] text-white font-semibold text-[14px]"
                  style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', ...S }}>Merge</button>
              </div>
              <button onClick={() => { setShowImportInput(false); setImportFile(null); setImportPwd('') }}
                className="py-2 text-[#94A3B8] text-[13px]" style={S}>Cancel</button>
            </div>
          ) : (
            <SettingRow icon={Upload} label="Import Backup" onClick={() => setShowImportInput(true)} color="#10B981" />
          )}
          <Divider />
          <SettingRow icon={Trash2} label="Delete All Data" onClick={() => setShowClearConfirm(true)} color="#F43F5E" />
        </SectionCard>

        {/* Privacy note */}
        <div className="mx-5 mb-5 p-5 rounded-[20px]" style={{ background: '#EEF2FF', border: '1px solid rgba(99,102,241,0.15)' }}>
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck className="w-5 h-5 text-[#6366F1]" />
            <p className="text-[15px] font-bold text-[#3730A3]" style={S}>Privacy Promise</p>
          </div>
          {['Local-first data', 'End-to-end encrypted', 'Works offline', 'Zero accounts needed', 'No trackers'].map(t => (
            <div key={t} className="flex items-center gap-2 mb-2">
              <Check className="w-3.5 h-3.5 text-[#6366F1] flex-shrink-0" />
              <p className="text-[13px] text-[#3730A3]" style={S}>{t}</p>
            </div>
          ))}
        </div>

        <div className="text-center pb-8">
          <p className="text-[12px] text-[#CBD5E1]" style={S}>Spendly v1.0.3</p>
        </div>
      </div>

      {/* Bottom sheets */}
      <BottomSheet show={showCurrencyPicker} onClose={() => setShowCurrencyPicker(false)} title="Currency">
        <input value={currencySearch} onChange={e => setCurrencySearch(e.target.value)} placeholder={`Search... (${currency.code})`}
          className="w-full py-3 px-4 rounded-[12px] mb-4 outline-none"
          style={{ background: '#F8F9FF', border: '1px solid #E2E8F0', ...S }} />
        <div className="flex flex-col gap-2">
          {CURRENCIES.filter(c => c.name.toLowerCase().includes(currencySearch.toLowerCase()) || c.code.toLowerCase().includes(currencySearch.toLowerCase())).map(c => (
            <button key={c.code} onClick={() => { updateSetting('currency', c.code); setShowCurrencyPicker(false); setCurrencySearch('') }}
              className="flex items-center gap-4 px-4 py-3.5 rounded-[14px] transition-all"
              style={{ background: settings?.currency === c.code ? '#EEF2FF' : '#F8F9FF', border: `1px solid ${settings?.currency === c.code ? '#6366F1' : '#F0F0F8'}` }}>
              <span className="text-2xl">{c.flag}</span>
              <div className="flex-1 text-left">
                <p className="text-[15px] font-semibold text-[#0F172A]" style={S}>{c.code}</p>
                <p className="text-[12px] text-[#94A3B8]" style={S}>{c.name}</p>
              </div>
              {settings?.currency === c.code && <Check className="w-5 h-5 text-[#6366F1]" />}
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet show={showLockPicker} onClose={() => setShowLockPicker(false)} title="App Lock">
        <div className="flex flex-col gap-3">
          {LOCK_OPTIONS.map(opt => (
            <button key={opt.id} onClick={() => handleLockTypeSelect(opt.id)}
              className="flex items-center justify-between px-5 py-4 rounded-[16px] transition-all"
              style={{ background: settings?.lockType === opt.id ? '#EEF2FF' : '#F8F9FF', border: `1px solid ${settings?.lockType === opt.id ? '#6366F1' : '#E2E8F0'}` }}>
              <div className="flex items-center gap-4">
                <span className="text-2xl">{opt.emoji}</span>
                <span className="font-semibold text-[#0F172A]" style={S}>{opt.label}</span>
              </div>
              {settings?.lockType === opt.id && <Check className="w-5 h-5 text-[#6366F1]" />}
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet show={showLanguagePicker} onClose={() => setShowLanguagePicker(false)} title="Language">
        <div className="flex flex-col gap-3">
          {LANGUAGE_OPTIONS.map(opt => (
            <button key={opt.id} onClick={() => handleLanguageSelect(opt.id)}
              className="flex items-center justify-between px-5 py-4 rounded-[16px] transition-all"
              style={{ background: settings?.language === opt.id ? '#EEF2FF' : '#F8F9FF', border: `1px solid ${settings?.language === opt.id ? '#6366F1' : '#E2E8F0'}` }}>
              <div className="flex items-center gap-4">
                <span className="text-2xl">{opt.emoji}</span>
                <span className="font-semibold text-[#0F172A]" style={S}>{opt.label}</span>
              </div>
              {settings?.language === opt.id && <Check className="w-5 h-5 text-[#6366F1]" />}
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
      <ConfirmDialog show={showClearConfirm} title="Delete All Data?" message="This will permanently delete all expenses, budgets, and settings. This cannot be undone."
        confirmText="Yes, delete it" onConfirm={handleClearAll} onCancel={() => setShowClearConfirm(false)} />
      <ToastMessage toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
