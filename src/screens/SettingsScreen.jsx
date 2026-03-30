// Settings screen — profile, appearance, security, notifications, data, about
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Moon, Sun, Monitor, Lock, Bell, Download, Upload, Trash2, Info, X } from 'lucide-react'
import TopHeader from '../components/shared/TopHeader'
import LockSetupModal from '../components/lock/LockSetupModal'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import ToastMessage from '../components/shared/ToastMessage'
import { useSettingsStore } from '../store/settingsStore'
import { useAppLock } from '../hooks/useAppLock'
import { CURRENCIES } from '../constants/currencies'
import { exportAllData } from '../services/exportData'
import { importBackupFile } from '../services/importData'
import { db, settingsService, secureWipe } from '../services/database'
import { ShieldCheck } from 'lucide-react'

const EMOJIS = ['😊','😎','🤩','🥳','🐻','🦁','🐼','🦊','🐸','🦋','🌟','💎','🚀','🎯','💪','🔥']
const THEMES = [{ id: 'light', label: 'Light', Icon: Sun }, { id: 'dark', label: 'Dark', Icon: Moon }, { id: 'auto', label: 'Auto', Icon: Monitor }]
const LOCK_TYPES = ['none', 'pin4', 'pin6', 'pattern', 'biometric']

function SettingRow({ icon: Icon, label, value, onClick, color = '#7C3AED' }) {
  return (
    <motion.button whileTap={{ scale: 0.98 }} onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-4 text-left active:bg-gray-50 dark:active:bg-[#242438]">
      <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '20' }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <span className="flex-1 text-[15px] text-gray-800 dark:text-white">{label}</span>
      {value && <span className="text-[13px] text-gray-400 mr-1">{value}</span>}
      <ChevronRight className="w-4 h-4 text-gray-300" />
    </motion.button>
  )
}

function SectionCard({ title, children }) {
  return (
    <div className="mx-4 mb-4 bg-white dark:bg-[#1A1A2E] rounded-[20px] shadow-sm overflow-hidden">
      <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide px-4 pt-4 pb-1">{title}</p>
      <div className="divide-y divide-gray-50 dark:divide-[#242438]">{children}</div>
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
  const [currencySearch, setCurrencySearch] = useState('')
  const [lockSetupType, setLockSetupType] = useState(null)
  const [showLockPicker, setShowLockPicker] = useState(false)

  const LOCK_OPTIONS = [
    { id: 'none', label: 'None', emoji: '🔓' },
    { id: 'pin4', label: '4 Digit PIN', emoji: '🔢' },
    { id: 'pin6', label: '6 Digit PIN', emoji: '🔢' },
    { id: 'pattern', label: 'Pattern', emoji: '⬛' },
    { id: 'biometric', label: 'Biometric', emoji: '👆' },
  ]

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
      setToast({ id: Date.now(), type: 'error', message: 'Export failed' })
    }
  }

  const handleImport = async () => {
    if (!importPwd || !importFile) return
    
    const confirmation = prompt('⚠️ This will REPLACE all current data. Type "REPLACE" to confirm:')
    if (confirmation !== 'REPLACE') return

    try {
      await importBackupFile(importFile, importPwd)
      setShowImportInput(false)
      setImportFile(null)
      setImportPwd('')
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

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F5F5] dark:bg-[#0F0F1A] mb-tab">
      <TopHeader title="Settings" />

      {/* Profile card */}
      <div className="mx-4 mb-4 bg-white dark:bg-[#1A1A2E] rounded-[20px] p-5 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center text-4xl">
              {settings?.emoji || '😊'}
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => updateSetting('emoji', e)}
                className={`w-10 h-10 rounded-xl text-2xl flex items-center justify-center transition-all ${settings?.emoji === e ? 'bg-purple-100 ring-2 ring-purple-600' : 'bg-gray-50'}`}>
                {e}
              </button>
            ))}
          </div>
          <div className="text-center">
            <p className="text-[20px] font-sora font-bold text-gray-900 dark:text-white">{settings?.name || 'Friend'}</p>
            <p className="text-[13px] text-gray-400">{currency.flag} {currency.name}</p>
          </div>
        </div>
      </div>

      {/* App Look */}
      <div className="mx-4 mb-4 bg-white dark:bg-[#1A1A2E] rounded-[20px] p-4 shadow-sm">
        <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-3">🎨 App Look</p>
        <div className="flex gap-2">
          {THEMES.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => updateSetting('theme', id)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 text-[13px] font-medium transition-all ${
                settings?.theme === id ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-100 text-gray-500'
              }`}>
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Currency */}
      <SectionCard title="💰 Money">
        <SettingRow icon={ChevronRight} label="Currency" value={`${currency.flag} ${currency.code}`} onClick={() => setShowCurrencyPicker(true)} color="#22C55E" />
        <SettingRow icon={ChevronRight} label="Monthly Budget" value={`${currency.symbol}${settings?.monthlyBudget || 2000}`} onClick={() => navigate('/budget')} color="#22C55E" />
      </SectionCard>

      {/* Security */}
      <SectionCard title="🔒 Security">
        <SettingRow icon={Lock} label="App Lock" value={LOCK_OPTIONS.find(o => o.id === (settings?.lockType || 'none'))?.label} onClick={() => setShowLockPicker(true)} color="#7C3AED" />
        {['pin4', 'pin6', 'pattern'].includes(settings?.lockType) && (
          <SettingRow icon={Lock} label="Change PIN / Pattern" onClick={() => setLockSetupType(settings.lockType)} color="#7C3AED" />
        )}
      </SectionCard>

      {/* Notifications */}
      <SectionCard title="🔔 Alerts">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-orange-50 flex items-center justify-center">
              <Bell className="w-4 h-4 text-orange-500" />
            </div>
            <span className="text-[15px] text-gray-800 dark:text-white">Budget Alerts</span>
          </div>
          <button
            onClick={() => updateSetting('notificationsOn', !settings?.notificationsOn)}
            className={`w-12 h-6 rounded-full transition-colors ${settings?.notificationsOn ? 'bg-purple-600' : 'bg-gray-200'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform m-0.5 ${settings?.notificationsOn ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </SectionCard>

      {/* Data */}
      <SectionCard title="📂 My Data">
        {showExportInput ? (
          <div className="px-4 py-3 flex items-center gap-2">
            <input value={exportPwd} onChange={e => setExportPwd(e.target.value)} type="password" placeholder="Backup password..."
              autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
              className="flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#242438] text-sm dark:text-white outline-none border border-gray-200 dark:border-gray-800 focus:border-purple-400" />
            <button onClick={handleExport} className="px-4 py-2 bg-purple-600 text-white text-sm rounded-xl font-medium">Export</button>
            <button onClick={() => setShowExportInput(false)} className="text-gray-400 text-sm">Cancel</button>
          </div>
        ) : (
          <SettingRow icon={Download} label="Export My Data" onClick={() => setShowExportInput(true)} color="#3B82F6" />
        )}
        
        {showImportInput ? (
          <div className="px-4 py-3 flex flex-col gap-3 border-t border-gray-50 dark:border-gray-800">
            <input type="file" accept=".spendly" onChange={e => setImportFile(e.target.files[0])}
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
            <div className="flex gap-2">
              <input value={importPwd} onChange={e => setImportPwd(e.target.value)} type="password" placeholder="Backup password..."
                autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
                className="flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#242438] text-sm dark:text-white outline-none border border-gray-200 dark:border-gray-800 focus:border-purple-400" />
              <button onClick={handleImport} className="px-4 py-2 bg-green-500 text-white text-sm rounded-xl font-medium">Restore</button>
              <button onClick={() => { setShowImportInput(false); setImportFile(null); setImportPwd(''); }} className="text-gray-400 text-sm">Cancel</button>
            </div>
          </div>
        ) : (
           <SettingRow icon={Upload} label="Import Backup" onClick={() => setShowImportInput(true)} color="#22C55E" />
        )}

        <SettingRow icon={Trash2} label="Clear All Data" onClick={() => setShowClearConfirm(true)} color="#EF4444" />
      </SectionCard>

      {/* Privacy Promise */}
      <div className="mx-4 mb-6 p-6 rounded-[24px] bg-white dark:bg-[#1A1A2E] shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-[18px] font-sora font-bold text-gray-900 dark:text-white">Your Privacy Promise</p>
        </div>
        
        <div className="space-y-3 mb-6">
          {[
            'Data stays on your phone',
            'Encrypted with your PIN',
            'No internet needed',
            'No accounts or sign up',
            'Nobody can see your data',
            'No tracking or ads',
            'Delete anytime, gone forever'
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-green-500 font-bold mt-0.5">✅</span>
              <div>
                <p className="text-[14px] text-gray-700 dark:text-gray-300 font-medium">{text}</p>
                {text === 'Nobody can see your data' && (
                  <p className="text-[11px] text-gray-400 mt-0.5">Not Apple. Not Google. Not us. Not anyone.</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-900/30">
          <p className="text-purple-700 dark:text-purple-400 font-medium italic text-[13px] text-center leading-relaxed">
            "We built Spendly so that your money is your business and nobody else's."
          </p>
        </div>
      </div>

      {/* About */}
      <div className="mx-4 mb-10 bg-white dark:bg-[#1A1A2E] rounded-[20px] p-5 shadow-sm">
        <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-4">ℹ️ About</p>
        <p className="text-[13px] text-gray-400 text-center leading-relaxed">
          Version 1.0.0 · Spendly{'\n'}
          Made for maximum privacy.{'\n'}
          No internet needed. Ever.
        </p>
      </div>

      <AnimatePresence>
        {showCurrencyPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white dark:bg-[#1A1A2E] w-full max-w-md h-[80dvh] rounded-t-[30px] sm:rounded-[30px] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-[18px] font-sora font-bold text-gray-900 dark:text-white">Select Currency</h3>
                <button onClick={() => setShowCurrencyPicker(false)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-4 border-b border-gray-50 dark:border-gray-800/50">
                <input value={currencySearch} onChange={e => setCurrencySearch(e.target.value)} placeholder={`Search... (Currently: ${currency.code})`}
                  autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
                  className="w-full py-3.5 px-4 rounded-xl bg-gray-50 dark:bg-[#242438] outline-none text-[15px] dark:text-white" />
              </div>
              <div className="flex-1 overflow-y-auto px-2 py-2">
                {CURRENCIES.filter(c => c.name.toLowerCase().includes(currencySearch.toLowerCase()) || c.code.toLowerCase().includes(currencySearch.toLowerCase())).map(c => (
                  <button key={c.code} onClick={() => { updateSetting('currency', c.code); setShowCurrencyPicker(false); setCurrencySearch('') }}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-colors ${settings?.currency === c.code ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-50 dark:hover:bg-[#242438]'}`}>
                    <span className="text-2xl">{c.flag}</span>
                    <div className="flex-1 text-left">
                      <p className="text-[15px] font-semibold text-gray-900 dark:text-white">{c.code}</p>
                      <p className="text-[13px] text-gray-400">{c.name}</p>
                    </div>
                    {settings?.currency === c.code && <span className="text-purple-600 font-bold">✓</span>}
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
            className="fixed inset-0 z-[60] bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white dark:bg-[#1A1A2E] w-full max-w-md max-h-[80dvh] rounded-t-[30px] sm:rounded-[30px] flex flex-col overflow-hidden pb-safe">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-[18px] font-sora font-bold text-gray-900 dark:text-white">Select App Lock</h3>
                <button onClick={() => setShowLockPicker(false)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-4 flex flex-col gap-2 overflow-y-auto flex-1 min-h-0">
                {LOCK_OPTIONS.map(opt => (
                  <button key={opt.id} onClick={() => handleLockTypeSelect(opt.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-colors ${settings?.lockType === opt.id ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-600' : 'bg-gray-50 border-2 border-transparent dark:bg-[#242438] hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{opt.emoji}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{opt.label}</span>
                    </div>
                    {settings?.lockType === opt.id && <span className="text-purple-600 font-bold">✓</span>}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
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
