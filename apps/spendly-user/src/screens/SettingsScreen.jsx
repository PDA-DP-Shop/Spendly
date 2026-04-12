import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, Moon, Sun, Laptop, Lock, Bell, Download, Upload, Trash2, X, Wallet, CreditCard, Target, Plane, Trophy, Smartphone, ShieldCheck, Globe, Calculator, Gift, Shield, Check, Plus, Search, Info, ScanLine, Camera } from 'lucide-react'
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
import { formatMoney } from '../utils/formatMoney'
import { permissionService } from '../services/permissionService'


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
  { id: 'es', label: 'Español', emoji: '🇪🇸' },
  { id: 'fr', label: 'Français', emoji: '🇫🇷' },
  { id: 'de', label: 'Deutsch', emoji: '🇩🇪' },
  { id: 'ja', label: '日本語', emoji: '🇯🇵' },
  { id: 'zh', label: '中文', emoji: '🇨🇳' },
  { id: 'ru', label: 'Русский', emoji: '🇷🇺' },
  { id: 'ar', label: 'العربية', emoji: '🇦🇪' },
]

const HAPTIC_TOUCH = {
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  }
}

function SettingRow({ icon: Icon, label, value, onClick, color = '#000000', subtitle }) {
  const S = { fontFamily: "'Inter', sans-serif" }
  return (
    <motion.button 
      variants={HAPTIC_TOUCH} 
      whileTap="tap" 
      onClick={(e) => {
        onClick?.(e)
      }}
      className="w-full flex items-center gap-4 px-6 py-5 text-left active:bg-[#F6F6F6] transition-colors touch-auto pointer-events-auto"
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[#F6F6F6] border border-[#EEEEEE] pointer-events-none">
        <Icon className="w-4.5 h-4.5 text-black" strokeWidth={2.5} />
      </div>
      <div className="flex-1 pointer-events-none">
        <span className="text-[15px] font-[700] text-black block tracking-tight" style={S}>{label}</span>
        {subtitle && <span className="text-[11px] font-[500] text-[#AFAFAF] mt-0.5 block" style={S}>{subtitle}</span>}
      </div>
      {value && <span className="text-[13px] font-[600] text-[#AFAFAF] mr-2 truncate max-w-[120px] pointer-events-none" style={S}>{value}</span>}
      <ChevronRight className="w-4 h-4 text-[#AFAFAF] pointer-events-none" strokeWidth={3} />
    </motion.button>
  )
}

function SectionCard({ title, children }) {
  const S = { fontFamily: "'Inter', sans-serif" }
  return (
    <div className="mx-6 mb-8">
      {title && <p className="text-[12px] font-[700] uppercase tracking-wider text-[#AFAFAF] mb-3 ml-2" style={S}>{title}</p>}
      <div className="overflow-hidden bg-white rounded-[24px] border border-[#EEEEEE] shadow-sm">
        <div className="divide-y divide-[#EEEEEE]">{children}</div>
      </div>
    </div>
  )
}

export default function SettingsScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { settings, updateSetting, setPWAInstallVisible } = useSettingsStore()
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
  const [permStatus, setPermStatus] = useState({ camera: 'prompt', notifications: 'prompt' })
  const S = { fontFamily: "'Inter', sans-serif" }

  // Load permission status on mount
  useEffect(() => {
    permissionService.checkStatus().then(s => setPermStatus(s))
  }, [])

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

  const handleLockSave = async (code) => {
    const key = lockSetupType === 'pattern' ? 'lockPattern' : 'lockPin'
    await updateSetting({
      [key]: code,
      lockType: lockSetupType
    })
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
            onClick={onClose} className="fixed inset-0 z-[60]" style={{ background: 'rgba(0,0,0,0.4)' }} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 350 }}
            className="fixed bottom-0 left-0 right-0 z-[61] pb-safe bg-white flex flex-col"
            style={{ borderRadius: '40px 40px 0 0', maxHeight: '90dvh' }}>
            <div className="w-12 h-1.5 bg-[#F6F6F6] rounded-full mx-auto mt-4 mb-4" />
            <div className="flex items-center justify-between px-8 mb-6 mt-2">
              <h3 className="text-[22px] font-[800] text-black tracking-tight" style={S}>{title}</h3>
              <motion.button variants={HAPTIC_TOUCH} whileTap="tap" onClick={onClose} 
                className="w-11 h-11 rounded-full bg-[#F6F6F6] flex items-center justify-center border border-[#EEEEEE]">
                <X className="w-5 h-5 text-black" strokeWidth={2.5} />
              </motion.button>
            </div>
            <div className="flex-1 overflow-y-auto px-8 pb-10 scrollbar-hide">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return (
    <div className="flex flex-col min-h-dvh mb-tab bg-white safe-top">
      <div className="px-7 pt-12 pb-6 flex items-center justify-between bg-white sticky top-0 z-20 border-b border-[#F6F6F6]">
        <h1 className="text-[28px] font-[800] text-black tracking-tight" style={S}>{t('settings.title')}</h1>
        <div className="w-11 h-11 rounded-full bg-[#F6F6F6] border border-[#EEEEEE] flex items-center justify-center">
            <Globe className="w-5 h-5 text-black" strokeWidth={2.5} />
        </div>
      </div>

      <div className="pt-8">
        <div className="mx-6 mb-12 p-10 text-center bg-white border border-[#EEEEEE] rounded-[40px] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-black/5" />
          <div className="w-28 h-28 rounded-full bg-[#F6F6F6] border-2 border-[#EEEEEE] flex items-center justify-center text-[48px] font-[800] text-black mx-auto mb-8 shadow-inner">
            {settings?.profileName ? settings.profileName.charAt(0).toUpperCase() : <Globe className="w-12 h-12 text-[#D8D8D8]" />}
          </div>
          <input
            value={settings?.profileName || ''}
            onChange={e => updateSetting('profileName', e.target.value)}
            placeholder={t('settings.profile')}
            className="text-[28px] font-[800] text-black text-center bg-transparent outline-none w-full placeholder-[#D8D8D8] tracking-tight"
            style={S}
          />
          <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-[0.2em] mt-3" style={S}>
            {currency.code} • {currency.name}
          </p>
        </div>

        <SectionCard title={t('settings.finance')}>
          <SettingRow icon={Wallet} label={t('common.wallets')} onClick={() => navigate('/wallets')} subtitle={t('settings.manageWallets')} />
          <SettingRow icon={CreditCard} label={t('common.emis')} onClick={() => navigate('/emis')} subtitle={t('settings.trackLoans')} />
          <SettingRow icon={Target} label={t('common.goals')} onClick={() => navigate('/goals')} subtitle={t('settings.planGoals')} />
          <SettingRow icon={Plane} label={t('common.trips')} onClick={() => navigate('/trips')} subtitle={t('settings.tripBudgets')} />
          <SettingRow icon={Gift} label={t('common.festivals')} onClick={() => navigate('/festivals')} subtitle={t('settings.eventBudgets')} />
          <SettingRow icon={Trophy} label={t('common.badges')} onClick={() => navigate('/badges')} subtitle={t('settings.achievements')} />
        </SectionCard>

        <SectionCard title={t('settings.preferences')}>
          <SettingRow icon={Globe} label={t('settings.language')}
            value={LANGUAGE_OPTIONS.find(o => o.id === (settings?.language || 'en'))?.label}
            onClick={() => setShowLanguagePicker(true)} />
          <SettingRow icon={Globe} label={t('settings.currency')} value={`${currency.flag} ${currency.code}`} onClick={() => setShowCurrencyPicker(true)} />
        </SectionCard>

        <SectionCard title={t('settings.limits')}>
          <SettingRow icon={Target} label={t('settings.monthlyLimit')} value={formatMoney(settings?.monthlyBudget || 2000, currency.code)} onClick={() => navigate('/budget')} />
          <SettingRow icon={Calculator} label={t('settings.gstCalc')} onClick={() => setShowGST(true)} />
        </SectionCard>

        <SectionCard title={t('settings.security')}>
          <SettingRow icon={Shield} label={t('settings.lock')}
            value={LOCK_OPTIONS.find(o => o.id === (settings?.lockType || 'none'))?.label}
            onClick={() => setShowLockPicker(true)} />
          <SettingRow icon={ShieldCheck} label={t('settings.decoy')}
            value={settings?.decoyPin ? t('common.active') : t('common.setup')}
            onClick={() => setShowDecoySetup(true)} />
          <SettingRow icon={Shield} label={t('settings.terms')} onClick={() => navigate('/terms')} />
          <SettingRow icon={ShieldCheck} label={t('settings.privacy')} onClick={() => navigate('/privacy')} />
        </SectionCard>

        <SectionCard title="Permissions">
          <div className="flex items-center gap-4 px-6 py-5">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#F6F6F6] border border-[#EEEEEE] flex-shrink-0">
              <ScanLine className="w-4.5 h-4.5 text-black" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <span className="text-[15px] font-[700] text-black block tracking-tight" style={S}>Camera (Scanner)</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${permissionService.dotColor(permStatus.camera)}`} />
                <span className={`text-[11px] font-[600] ${permissionService.color(permStatus.camera)}`} style={S}>
                  {permissionService.label(permStatus.camera)}
                </span>
              </div>
            </div>
            {permStatus.camera !== 'granted' && (
              <motion.button variants={HAPTIC_TOUCH} whileTap="tap"
                onClick={async () => {
                  const ok = await permissionService.requestCamera()
                  setPermStatus(s => ({ ...s, camera: ok ? 'granted' : 'denied' }))
                }}
                className="text-[11px] font-[800] text-black uppercase tracking-widest px-4 py-2 bg-[#F6F6F6] rounded-full border border-[#EEEEEE]">
                Allow
              </motion.button>
            )}
          </div>

          <div className="flex items-center gap-4 px-6 py-5 border-t border-[#EEEEEE]">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#F6F6F6] border border-[#EEEEEE] flex-shrink-0">
              <Bell className="w-4.5 h-4.5 text-black" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <span className="text-[15px] font-[700] text-black block tracking-tight" style={S}>Notifications</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${permissionService.dotColor(permStatus.notifications)}`} />
                <span className={`text-[11px] font-[600] ${permissionService.color(permStatus.notifications)}`} style={S}>
                  {permissionService.label(permStatus.notifications)}
                </span>
              </div>
            </div>
            {permStatus.notifications !== 'granted' && (
              <motion.button variants={HAPTIC_TOUCH} whileTap="tap"
                onClick={async () => {
                  if ('Notification' in window) {
                    const res = await Notification.requestPermission()
                    setPermStatus(s => ({ ...s, notifications: res }))
                  }
                }}
                className="text-[11px] font-[800] text-black uppercase tracking-widest px-4 py-2 bg-[#F6F6F6] rounded-full border border-[#EEEEEE]">
                Allow
              </motion.button>
            )}
          </div>

          <motion.button variants={HAPTIC_TOUCH} whileTap="tap"
            onClick={() => setToast({ id: Date.now(), type: 'info', message: 'Manage Site Settings in Browser' })}
            className="w-full flex items-center gap-4 px-6 py-5 text-left active:bg-[#F6F6F6] border-t border-[#EEEEEE]">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#F6F6F6] border border-[#EEEEEE]">
              <ShieldCheck className="w-4.5 h-4.5 text-black" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <span className="text-[15px] font-[700] text-black block tracking-tight" style={S}>Manage in Browser</span>
              <span className="text-[11px] font-[500] text-[#AFAFAF] mt-0.5 block" style={S}>Revoke or change permissions</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#AFAFAF]" strokeWidth={3} />
          </motion.button>
        </SectionCard>

        <SectionCard title={t('settings.notifications')}>
          <div className="flex items-center justify-between px-6 py-5 bg-white">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#F6F6F6] border border-[#EEEEEE]">
                <Bell className="w-4.5 h-4.5 text-black" strokeWidth={2.5} />
              </div>
              <span className="text-[15px] font-[700] text-black tracking-tight" style={S}>{t('settings.dailyUpdates')}</span>
            </div>
            <motion.button variants={HAPTIC_TOUCH} whileTap="tap"
              onClick={() => updateSetting('notificationsOn', !settings?.notificationsOn)}
              className="w-12 h-7 rounded-full transition-all relative border border-[#EEEEEE]"
              style={{ background: settings?.notificationsOn ? '#000000' : '#E2E2E2' }}>
              <motion.div className="w-5 h-5 rounded-full bg-white shadow-md absolute top-[3px]"
                animate={{ left: settings?.notificationsOn ? '23px' : '3px' }} />
            </motion.button>
          </div>
        </SectionCard>

        <SectionCard title={t('settings.data')}>
           <SettingRow icon={Download} label={t('settings.export')} onClick={() => handleExport()} subtitle={t('settings.saveBackup')} />
           <SettingRow icon={Upload} label={t('settings.import')} onClick={() => setShowImportInput(true)} subtitle={t('settings.restoreBackup')} />
           <SettingRow icon={Info} label="Migration Guide" onClick={() => navigate('/migration-guide')} subtitle="How to move browser data" />
           <SettingRow icon={Trash2} label={t('settings.clear')} onClick={() => setShowClearConfirm(true)} subtitle={t('settings.factoryReset')} />
        </SectionCard>

        <div className="text-center pb-24">
          <p className="text-[12px] font-[600] text-[#AFAFAF] uppercase tracking-widest" style={S}>Build v1.0.4</p>
        </div>
      </div>

      <BottomSheet show={showCurrencyPicker} onClose={() => setShowCurrencyPicker(false)} title="Select Currency">
        <div className="flex flex-col gap-4">
          <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#AFAFAF]" strokeWidth={2.5} />
              <input value={currencySearch} onChange={e => setCurrencySearch(e.target.value)} placeholder="Search currency..."
                className="w-full py-4 pl-12 pr-6 rounded-2xl outline-none font-[600] text-[15px] bg-[#F6F6F6] border border-[#EEEEEE]"
                style={S} />
          </div>
          <div className="grid grid-cols-1 gap-2 mt-2">
            {CURRENCIES.filter(c => c.name.toLowerCase().includes(currencySearch.toLowerCase()) || c.code.toLowerCase().includes(currencySearch.toLowerCase())).map(c => (
                <motion.button key={c.code} variants={HAPTIC_TOUCH} whileTap="tap"
                  onClick={() => { updateSetting('currency', c.code); setShowCurrencyPicker(false); setCurrencySearch('') }}
                  className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all border ${settings?.currency === c.code ? 'bg-black border-black shadow-lg' : 'bg-[#F6F6F6] border-transparent'}`}>
                  <span className="text-2xl">{c.flag}</span>
                  <div className="flex-1 text-left">
                    <p className={`text-[15px] font-[700] ${settings?.currency === c.code ? 'text-white' : 'text-black'}`} style={S}>{c.code}</p>
                    <p className={`text-[11px] font-[500] ${settings?.currency === c.code ? 'text-white/60' : 'text-[#AFAFAF]'}`} style={S}>{c.name}</p>
                  </div>
                  {settings?.currency === c.code && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
                </motion.button>
            ))}
          </div>
        </div>
      </BottomSheet>

      <BottomSheet show={showLockPicker} onClose={() => setShowLockPicker(false)} title="Privacy Type">
        <div className="grid grid-cols-1 gap-3">
          {LOCK_OPTIONS.map(opt => (
            <motion.button key={opt.id} variants={HAPTIC_TOUCH} whileTap="tap" onClick={() => handleLockTypeSelect(opt.id)}
              className={`flex items-center justify-between px-6 py-5 rounded-2xl transition-all border ${settings?.lockType === opt.id ? 'bg-black border-black shadow-lg' : 'bg-[#F6F6F6] border-transparent'}`}>
              <div className="flex items-center gap-4">
                <span className="text-2xl">{opt.emoji}</span>
                <span className={`text-[15px] font-[700] ${settings?.lockType === opt.id ? 'text-white' : 'text-black'}`} style={S}>{opt.label}</span>
              </div>
              {settings?.lockType === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
            </motion.button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet show={showLanguagePicker} onClose={() => setShowLanguagePicker(false)} title="Preferred Language">
        <div className="grid grid-cols-1 gap-3">
          {LANGUAGE_OPTIONS.map(opt => (
            <motion.button key={opt.id} variants={HAPTIC_TOUCH} whileTap="tap" onClick={() => handleLanguageSelect(opt.id)}
              className={`flex items-center justify-between px-6 py-5 rounded-2xl transition-all border ${settings?.language === opt.id ? 'bg-black border-black shadow-lg' : 'bg-[#F6F6F6] border-transparent'}`}>
              <div className="flex items-center gap-4">
                <span className="text-2xl">{opt.emoji}</span>
                <span className={`text-[15px] font-[700] ${settings?.language === opt.id ? 'text-white' : 'text-black'}`} style={S}>{opt.label}</span>
              </div>
              {settings?.language === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
            </motion.button>
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
      
      <AnimatePresence>
        {showExportInput && (
            <BottomSheet show={showExportInput} onClose={() => setShowExportInput(false)} title="Export Data">
                <p className="text-[13px] font-[500] text-[#AFAFAF] mb-6" style={S}>Files are encrypted with AES-256. Set a password to protect your backup.</p>
                <div className="flex flex-col gap-4">
                    <input value={exportPwd} onChange={e => setExportPwd(e.target.value)} type="password" placeholder="Set Password"
                      className="w-full py-4 px-6 rounded-2xl bg-[#F6F6F6] border border-[#EEEEEE] outline-none font-[600]" style={S} />
                    <motion.button variants={HAPTIC_TOUCH} whileTap="tap" onClick={handleExport} className="w-full py-5 rounded-2xl bg-black text-white font-[800] text-[15px] shadow-lg"
                      style={S}>Export Data</motion.button>
                </div>
            </BottomSheet>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showImportInput && (
            <BottomSheet show={showImportInput} onClose={() => setShowImportInput(false)} title="Import Data">
                <p className="text-[13px] font-[500] text-[#AFAFAF] mb-6" style={S}>Select a .SPENDLY file and enter the decryption password.</p>
                <div className="flex flex-col gap-4">
                    <div className="relative w-full py-4 px-6 rounded-2xl bg-[#F6F6F6] border border-[#EEEEEE] overflow-hidden">
                        <input type="file" accept=".spendly" onChange={e => setImportFile(e.target.files[0])}
                            className="absolute inset-0 opacity-0 cursor-pointer" />
                        <div className="flex items-center gap-3">
                            <Upload className="w-5 h-5 text-black" strokeWidth={2.5} />
                            <span className="text-[15px] font-[700] text-black truncate" style={S}>
                                {importFile ? importFile.name : 'Select File'}
                            </span>
                        </div>
                    </div>
                    <input value={importPwd} onChange={e => setImportPwd(e.target.value)} type="password" placeholder="Enter Password"
                      className="w-full py-4 px-6 rounded-2xl bg-[#F6F6F6] border border-[#EEEEEE] outline-none font-[600]" style={S} />
                    <div className="flex gap-3 mt-2">
                        <motion.button variants={HAPTIC_TOUCH} whileTap="tap" onClick={() => handleImport('replace')} className="flex-1 py-4 rounded-xl bg-black text-white font-[800] text-[14px]" style={S}>Replace & Import</motion.button>
                        <motion.button variants={HAPTIC_TOUCH} whileTap="tap" onClick={() => handleImport('merge')} className="flex-1 py-4 rounded-xl bg-[#F6F6F6] border border-[#EEEEEE] text-black font-[800] text-[14px]" style={S}>Merge Data</motion.button>
                    </div>
                </div>
            </BottomSheet>
        )}
      </AnimatePresence>

      <ToastMessage toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
