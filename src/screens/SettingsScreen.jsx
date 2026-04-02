// Settings screen — profile, appearance, security, notifications, data, about
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Moon, Sun, Monitor, Lock, Bell, Download, Upload, Trash2, Info, X, Wallet, CreditCard, Target, Plane, Trophy, ShieldCheck, Laptop, Globe, Calculator, Gift, Shield } from 'lucide-react'
import TopHeader from '../components/shared/TopHeader'
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
import { Check } from 'lucide-react'

const EMOJIS = ['😊','😎','🤩','🥳','🐻','🦁','🐼','🦊','🐸','🦋','🌟','💎','🚀','🎯','💪','🔥']
const THEMES = [{ id: 'light', label: 'Light', Icon: Sun }, { id: 'dark', label: 'Dark', Icon: Moon }, { id: 'auto', label: 'Auto', Icon: Monitor }]
const LOCK_TYPES = ['none', 'pin4', 'pin6', 'pattern', 'biometric']

function SettingRow({ icon: Icon, label, value, onClick, color = '#00D4FF' }) {
  return (
    <motion.button whileTap={{ scale: 0.98 }} onClick={onClick}
      className="w-full flex items-center gap-4 px-5 py-4 text-left active:bg-white/5 transition-colors group">
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 glass border-none group-hover:shadow-glow transition-all" style={{ background: `linear-gradient(135deg, ${color}20, ${color}05)` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <span className="flex-1 text-[15px] font-body font-bold text-[#F0F4FF]">{label}</span>
      {value && <span className="text-[13px] font-body text-[#7B8DB0] mr-1">{value}</span>}
      <ChevronRight className="w-4 h-4 text-[#3D4F70] group-hover:text-cyan-glow transition-colors" />
    </motion.button>
  )
}

function SectionCard({ title, children }) {
  return (
    <div className="mx-6 mb-8 glass-elevated border-white/5 rounded-[32px] overflow-hidden shadow-glowLg relative group">
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <p className="text-[11px] font-display font-bold text-[#3D4F70] uppercase tracking-[0.2em] px-6 pt-6 pb-2 relative z-10">{title}</p>
      <div className="divide-y divide-white/5 relative z-10">{children}</div>
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
  const EMOJIS = ['😊', '😎', '🤑', '💎', '🚀', '👑', '✌️', '✨']
  const THEMES = [
    { id: 'light', label: 'Light', Icon: Sun },
    { id: 'dark', label: 'Dark', Icon: Moon },
    { id: 'system', label: 'System', Icon: Laptop }
  ]
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

  const [showPinSetup, setShowPinSetup] = useState(false)
  const [showDecoySetup, setShowDecoySetup] = useState(false)
  const [showPatternSetup, setShowPatternSetup] = useState(false)
  const [showLanguagePicker, setShowLanguagePicker] = useState(false)
  const [showGST, setShowGST] = useState(false)
  const [lockSetupType, setLockSetupType] = useState(null)
  const [showLockPicker, setShowLockPicker] = useState(false)
  const [currencySearch, setCurrencySearch] = useState('')

  const handleLanguageSelect = async (lang) => {
    setShowLanguagePicker(false)
    await updateSetting('language', lang)
    window.location.reload() // Reload to apply translations globally easily
  }

  const handleSetLockType = useCallback(async (type) => {
    if (type === 'none') {
      await updateSetting('lockType', 'none')
    } else if (type === 'pin4' || type === 'pin6') {
      setShowPinSetup(type)
    } else if (type === 'pattern') {
      setShowPatternSetup(true)
    } else if (type === 'biometric') {
      if (!window.PublicKeyCredential) {
        alert('Biometric not supported or allowed on this device.')
        return
      }
      const success = await setupBiometric()
      if (success) {
        await updateSetting('lockType', 'biometric')
      } else {
        alert('Biometric setup failed')
      }
    }
  }, [updateSetting, setupBiometric])

  const handleDecoySetup = async (pin) => {
    await updateSetting('decoyPin', pin)
    setShowDecoySetup(false)
  }

  const handleLockTypeSelect = async (type) => {
    setShowLockPicker(false)
    if (['pin4', 'pin6', 'pattern'].includes(type)) {
      setLockSetupType(type)
    } else if (type === 'biometric') {
      const success = await setupBiometric()
      if (success) {
        updateSetting('lockType', type)
        setToast({ id: Date.now(), message: 'Biometric lock enabled' })
      } else {
        setToast({ id: Date.now(), message: 'Biometric setup failed or cancelled' })
      }
    } else {
      updateSetting('lockType', type)
      setToast({ id: Date.now(), message: 'Security updated' })
    }
  }

  const handleLockSave = (code) => {
    const key = lockSetupType === 'pattern' ? 'lockPattern' : 'lockPin'
    updateSetting(key, code)
    updateSetting('lockType', lockSetupType)
    setLockSetupType(null)
    setToast({ id: Date.now(), message: 'Security updated' })
  }

  const currency = CURRENCIES.find(c => c.code === settings?.currency) || CURRENCIES[0]

  const handleExport = async () => {
    if (!exportPwd) return setShowExportInput(true)
    try {
      const filename = await exportAllData(exportPwd)
      setShowExportInput(false)
      setExportPwd('')
      setToast({ id: Date.now(), type: 'success', message: `✅ Backup saved: ${filename}` })
    } catch (e) {
      console.error('Export error:', e)
      setToast({ id: Date.now(), type: 'error', message: 'Export failed' })
    }
  }

  const handleImport = async (mode) => {
    if (!importPwd || !importFile) return
    
    if (mode === 'replace') {
      const confirmation = prompt('⚠️ This will REPLACE all current data. Type "REPLACE" to confirm:')
      if (confirmation !== 'REPLACE') return
    } else {
      const ok = window.confirm('Merge imported data with current data? This will keep your current settings and append new records.')
      if (!ok) return
    }

    try {
      await importBackupFile(importFile, importPwd, mode)
      setShowImportInput(false)
      setImportFile(null)
      setImportPwd('')
      setToast({ id: Date.now(), type: 'success', message: '✅ Backup restored! Reloading...' })
      setTimeout(() => window.location.reload(), 1500)
    } catch (e) {
      console.error('Import error:', e)
      setToast({ id: Date.now(), type: 'error', message: 'Import failed. Invalid password or corrupted file.' })
    }
  }

  const handleClearAll = async () => {
    await secureWipe()
    setShowClearConfirm(false)
    window.location.reload()
  }

  return (
    <div className="flex flex-col min-h-dvh mb-tab">
      <TopHeader title="Options" />

      {/* Profile card */}
      <div className="mx-6 mb-8 glass-accent p-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-cyan-glow/10" />
        
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="relative group">
            <div className="w-24 h-24 rounded-[32px] glass-elevated flex items-center justify-center text-5xl shadow-glow group-hover:scale-105 transition-transform duration-300">
              {settings?.emoji || '😊'}
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => updateSetting('emoji', e)}
                className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all ${settings?.emoji === e ? 'bg-cyan-glow/20 ring-1 ring-cyan-glow' : 'bg-white/5 hover:bg-white/10'}`}>
                {e}
              </button>
            ))}
          </div>
          <div className="text-center w-full px-4 mt-2">
            <input 
              value={settings?.name || ''} 
              onChange={e => updateSetting('name', e.target.value)}
              placeholder="Your Name"
              className="text-[26px] font-display font-bold text-[#F0F4FF] text-center bg-transparent outline-none w-full placeholder-[#3D4F70] tracking-tight"
              spellCheck="false"
            />
            <p className="text-[14px] font-body text-[#7B8DB0] mt-1">{currency.flag} {currency.name} · {currency.code}</p>
          </div>
        </div>
      </div>

      {/* App Look */}
      <div className="mx-6 mb-6 glass border-white/5 rounded-[28px] p-6 shadow-glowLg">
        <p className="text-[12px] font-display font-bold text-[#7B8DB0] uppercase tracking-[0.1em] mb-5">Visual Experience</p>
        
        <div className="glass-elevated border-white/5 rounded-[22px] mb-6">
          <SettingRow 
            icon={Globe} 
            label="Preferred Language" 
            value={LANGUAGE_OPTIONS.find(o => o.id === (settings?.language || 'en'))?.label} 
            onClick={() => setShowLanguagePicker(true)} 
            color="#00D4FF" 
          />
        </div>

        <div className="flex gap-3">
          {THEMES.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => updateSetting('theme', id)}
              className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-[22px] border transition-all text-[13px] font-body font-bold ${
                settings?.theme === id 
                  ? 'bg-cyan-dim border-cyan-glow/30 text-cyan-glow shadow-glow' 
                  : 'bg-white/5 border-white/5 text-[#7B8DB0]'
              }`}>
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Links for New Features */}
      <SectionCard title="Extensions">
        <SettingRow icon={Wallet} label="Digital Wallets" onClick={() => navigate('/wallets')} color="#00FF87" />
        <SettingRow icon={CreditCard} label="Loans & EMIs" onClick={() => navigate('/emis')} color="#00D4FF" />
        <SettingRow icon={Target} label="Savings Goals" onClick={() => navigate('/goals')} color="#FF4D6D" />
        <SettingRow icon={Plane} label="Travel Planner" onClick={() => navigate('/trips')} color="#00D4FF" />
        <SettingRow icon={Gift} label="Event Budgets" onClick={() => navigate('/festivals')} color="#FF4D6D" />
        <SettingRow icon={Trophy} label="Rank & Rewards" onClick={() => navigate('/badges')} color="#00FF87" />
      </SectionCard>

      {/* Currency */}
      <SectionCard title="Finance Control">
        <SettingRow icon={Globe} label="Operational Currency" value={`${currency.flag} ${currency.code}`} onClick={() => setShowCurrencyPicker(true)} color="#00FF87" />
        <SettingRow icon={Target} label="Spending Limit" value={`${currency.symbol}${settings?.monthlyBudget || 2000}`} onClick={() => navigate('/budget')} color="#00FF87" />
      </SectionCard>

      {/* Tools Section */}
      <SectionCard title="Utilities">
        <SettingRow icon={Calculator} label="Taxes Calculator" onClick={() => setShowGST(true)} color="#00D4FF" />
      </SectionCard>

      {/* Security */}
      <SectionCard title="Privacy & Safety">
        <SettingRow icon={Shield} label="App Protection" value={LOCK_OPTIONS.find(o => o.id === (settings?.lockType || 'none'))?.label} onClick={() => setShowLockPicker(true)} color="#00D4FF" />
        {['pin4', 'pin6', 'pattern'].includes(settings?.lockType) && (
          <SettingRow icon={Lock} label="Reset Security Keys" onClick={() => setLockSetupType(settings.lockType)} color="#00D4FF" />
        )}
        <SettingRow icon={ShieldCheck} label="Ghost Mode (Decoy)" value={settings?.decoyPin ? 'System Ready' : 'Not Configured'} onClick={() => setShowDecoySetup(true)} color="#00FF87" />
      </SectionCard>

      {/* Notifications */}
      <SectionCard title="Communication">
        <div className="flex items-center justify-between px-5 py-5 group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-cyan-dim flex items-center justify-center glass border-none">
              <Bell className="w-5 h-5 text-cyan-glow" />
            </div>
            <div>
              <span className="text-[15px] font-body font-bold text-[#F0F4FF] block">Real-time Alerts</span>
              <p className="text-[11px] font-body text-[#7B8DB0] mt-0.5">Budget limit notifications</p>
            </div>
          </div>
          <button
            onClick={() => updateSetting('notificationsOn', !settings?.notificationsOn)}
            className={`w-14 h-8 rounded-full transition-all relative ${settings?.notificationsOn ? 'bg-gradient-to-r from-blue-glow to-cyan-glow shadow-glow' : 'bg-[#1A1A2E] border border-white/10'}`}
          >
            <motion.div 
               className={`w-6 h-6 rounded-full bg-white shadow-lg absolute top-1`}
               animate={{ left: settings?.notificationsOn ? 'calc(100% - 28px)' : '4px' }}
            />
          </button>
        </div>
      </SectionCard>

      {/* Data */}
      <SectionCard title="Data Infrastructure">
        {showExportInput ? (
          <div className="px-5 py-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <input value={exportPwd} onChange={e => setExportPwd(e.target.value)} type="password" placeholder="Set backup password..."
                className="flex-1 px-4 py-3 rounded-xl glass bg-white/5 text-[14px] text-[#F0F4FF] outline-none border border-white/10 focus:border-cyan-glow/50" />
              <button onClick={handleExport} className="px-5 py-3 bg-cyan-glow text-white text-[14px] rounded-xl font-bold shadow-glow">Export</button>
            </div>
            <button onClick={() => setShowExportInput(false)} className="text-[#7B8DB0] text-[13px] font-body">Dismiss</button>
          </div>
        ) : (
          <SettingRow icon={Download} label="Secure Backup (Export)" onClick={() => setShowExportInput(true)} color="#00D4FF" />
        )}
        
        {showImportInput ? (
          <div className="px-5 py-5 flex flex-col gap-4">
            <input type="file" accept=".spendly" 
              onClick={() => {
                useSecurityStore.getState().setPauseSecurity(true)
                window.addEventListener('focus', function unpause() {
                  useSecurityStore.getState().setPauseSecurity(false)
                  window.removeEventListener('focus', unpause)
                }, { once: true })
              }}
              onChange={e => setImportFile(e.target.files[0])}
              className="text-[13px] text-[#7B8DB0] file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-none file:text-[12px] file:font-bold file:bg-cyan-dim file:text-cyan-glow" />
            
            <div className="flex flex-col gap-3">
              <input value={importPwd} onChange={e => setImportPwd(e.target.value)} type="password" placeholder="Vault password..."
                className="w-full px-4 py-3.5 rounded-xl glass bg-white/5 text-[15px] text-[#F0F4FF] outline-none border border-white/10 focus:border-cyan-glow/50" />
              <div className="flex items-center gap-3">
                <button onClick={() => handleImport('replace')} className="flex-1 py-4 bg-expense text-white text-[14px] rounded-xl font-bold shadow-[0_0_15px_rgba(255,77,109,0.3)]">Overwrite</button>
                <button onClick={() => handleImport('merge')} className="flex-1 py-4 bg-cyan-glow text-white text-[14px] rounded-xl font-bold shadow-glow">Merge</button>
              </div>
              <button onClick={() => { setShowImportInput(false); setImportFile(null); setImportPwd(''); }} className="py-2 text-[#7B8DB0] text-[14px] font-medium">Cancel</button>
            </div>
          </div>
        ) : (
           <SettingRow icon={Upload} label="Restore Vault (Import)" onClick={() => setShowImportInput(true)} color="#00FF87" />
        )}

        <SettingRow icon={Trash2} label="Complete System Wipe" onClick={() => setShowClearConfirm(true)} color="#FF4D6D" />
      </SectionCard>

      {/* Privacy Promise */}
      <div className="mx-6 mb-8 p-6 rounded-[28px] glass shadow-glowLg relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-cyan-glow/5" />
        
        <div className="flex items-center gap-4 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-cyan-dim flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-cyan-glow" />
          </div>
          <p className="text-[20px] font-display font-bold text-[#F0F4FF] tracking-tight">Privacy Protocol</p>
        </div>
        
        <div className="space-y-4 mb-8">
          {[
            'Local-first data architecture',
            'Full end-to-end encryption',
            'Sovereign offline operationality',
            'Zero account / KYC dependency',
            'Absolute data invisibility',
            'Zero tracker / ad-network noise',
            'Irreversible secure deletion'
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-cyan-glow font-bold text-lg mt-[-2px]">✧</span>
              <div>
                <p className="text-[14px] text-[#F0F4FF] font-body font-medium">{text}</p>
                {text === 'Absolute data invisibility' && (
                  <p className="text-[11px] font-body text-[#7B8DB0] mt-0.5">Your financial fingerprint remains yours alone.</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-5 glass-elevated border-cyan-glow/10 rounded-2xl">
          <p className="text-cyan-glow/80 font-body font-medium italic text-[13px] text-center leading-relaxed">
            "Engineered for ultimate financial sovereignty."
          </p>
        </div>
      </div>

      {/* About */}
      <div className="mx-6 mb-12 text-center">
        <p className="text-[12px] font-display font-bold text-[#3D4F70] uppercase tracking-[0.2em] mb-4">Spendly Core v1.0.3</p>
        <div className="flex justify-center gap-4 text-[#3D4F70]">
           <button className="text-[13px] font-body hover:text-cyan-glow transition-colors">Privacy</button>
           <span className="opacity-20">|</span>
           <button className="text-[13px] font-body hover:text-cyan-glow transition-colors">Terms</button>
           <span className="opacity-20">|</span>
           <button className="text-[13px] font-body hover:text-cyan-glow transition-colors">Whitepaper</button>
        </div>
      </div>

      <AnimatePresence>
        {showCurrencyPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#050B18]/80 backdrop-blur-[40px] flex items-end sm:items-center justify-center">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="bg-[#070D1F]/95 pt-4 w-full max-w-md h-[85dvh] rounded-t-[32px] sm:rounded-[32px] flex flex-col overflow-hidden border-t border-white/5">
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />
              <div className="flex items-center justify-between px-6 mb-6">
                <h3 className="text-[20px] font-display font-bold text-[#F0F4FF]">Global Currency</h3>
                <button onClick={() => setShowCurrencyPicker(false)} className="w-9 h-9 rounded-full glass border-none flex items-center justify-center text-[#7B8DB0]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-6 mb-4">
                <input value={currencySearch} onChange={e => setCurrencySearch(e.target.value)} placeholder={`Search... (Current: ${currency.code})`}
                  className="w-full py-4 px-5 rounded-2xl glass-elevated border-white/5 outline-none text-[15px] text-[#F0F4FF] placeholder-[#3D4F70] focus:border-cyan-glow/30" />
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
                {CURRENCIES.filter(c => c.name.toLowerCase().includes(currencySearch.toLowerCase()) || c.code.toLowerCase().includes(currencySearch.toLowerCase())).map(c => (
                  <button key={c.code} onClick={() => { updateSetting('currency', c.code); setShowCurrencyPicker(false); setCurrencySearch('') }}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all border ${settings?.currency === c.code ? 'glass-accent border-cyan-glow/30 shadow-glow' : 'glass border-transparent hover:bg-white/5'}`}>
                    <span className="text-2xl shadow-md">{c.flag}</span>
                    <div className="flex-1 text-left">
                      <p className="text-[15px] font-body font-bold text-[#F0F4FF]">{c.code}</p>
                      <p className="text-[12px] font-body text-[#7B8DB0]">{c.name}</p>
                    </div>
                    {settings?.currency === c.code && <span className="text-cyan-glow text-lg">✓</span>}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLockPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#050B18]/80 backdrop-blur-[40px] flex items-end sm:items-center justify-center">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="bg-[#070D1F]/95 pt-4 w-full max-w-md max-h-[80dvh] rounded-t-[32px] sm:rounded-[32px] flex flex-col overflow-hidden border-t border-white/5">
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />
              <div className="flex items-center justify-between px-6 mb-6">
                <h3 className="text-[20px] font-display font-bold text-[#F0F4FF]">Protocol Lock</h3>
                <button onClick={() => setShowLockPicker(false)} className="w-9 h-9 rounded-full glass border-none flex items-center justify-center text-[#7B8DB0]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 flex flex-col gap-3 overflow-y-auto flex-1 min-h-0">
                {LOCK_OPTIONS.map(opt => (
                  <button key={opt.id} onClick={() => handleLockTypeSelect(opt.id)}
                    className={`w-full flex items-center justify-between px-5 py-5 rounded-2xl transition-all border ${
                      settings?.lockType === opt.id 
                        ? 'glass-accent border-cyan-glow/30 shadow-glow' 
                        : 'glass border-transparent hover:bg-white/5'
                    }`}>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl filter drop-shadow-md">{opt.emoji}</span>
                      <span className="font-display font-bold text-[#F0F4FF]">{opt.label}</span>
                    </div>
                    {settings?.lockType === opt.id && <Check className="w-5 h-5 text-cyan-glow" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLanguagePicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#050B18]/80 backdrop-blur-[40px] flex items-end sm:items-center justify-center">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="bg-[#070D1F]/95 pt-4 w-full max-w-md max-h-[80dvh] rounded-t-[32px] sm:rounded-[32px] flex flex-col overflow-hidden border-t border-white/5">
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />
              <div className="flex items-center justify-between px-6 mb-6">
                <h3 className="text-[20px] font-display font-bold text-[#F0F4FF]">Regional Interface</h3>
                <button onClick={() => setShowLanguagePicker(false)} className="w-9 h-9 rounded-full glass border-none flex items-center justify-center text-[#7B8DB0]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 flex flex-col gap-3 overflow-y-auto flex-1 min-h-0">
                {LANGUAGE_OPTIONS.map(opt => (
                  <button key={opt.id} onClick={() => handleLanguageSelect(opt.id)}
                    className={`w-full flex items-center justify-between px-5 py-5 rounded-2xl transition-all border ${
                      settings?.language === opt.id 
                        ? 'glass-accent border-cyan-glow/30 shadow-glow' 
                        : 'glass border-transparent hover:bg-white/5'
                    }`}>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl filter drop-shadow-md">{opt.emoji}</span>
                      <span className="font-display font-bold text-[#F0F4FF]">{opt.label}</span>
                    </div>
                    {settings?.language === opt.id && <Check className="w-5 h-5 text-cyan-glow" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
        <LockSetupModal 
          lockType={lockSetupType} 
          onSave={handleLockSave} 
          onCancel={() => setLockSetupType(null)} 
        />
      )}

      <ConfirmDialog show={showClearConfirm} title="Clear All Data?" message="This will permanently delete all your expenses, budgets, and settings. This cannot be undone." confirmText="Yes, clear it" onConfirm={handleClearAll} onCancel={() => setShowClearConfirm(false)} />
      <ToastMessage toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
