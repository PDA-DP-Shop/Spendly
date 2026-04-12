// Onboarding — precise white premium setup matching spec
import { useState, useRef } from 'react'
import { m as motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '../store/settingsStore'
import { useAppLock } from '../hooks/useAppLock'
import { settingsService } from '../services/database'
import { CURRENCIES } from '../constants/currencies'
import { ChevronRight, ShieldCheck, Check, Search, User, X, FileText, ExternalLink, ScanLine, Bell, Activity } from 'lucide-react'
import LockSetupModal from '../components/lock/LockSetupModal'
import { permissionService } from '../services/permissionService'

const HAPTIC_SHAKE = {
  tap: { 
    x: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.35, ease: "easeInOut" }
  }
}

const LOCK_OPTIONS = [
  { id: 'pin4', label: 'Protect with 4-PIN', emoji: '🔢', desc: 'Secure access', recommended: true },
  { id: 'pin6', label: 'Protect with 6-PIN', emoji: '🔐', desc: 'Maximum security' },
  { id: 'pattern', label: 'Unlock with Pattern', emoji: '⬛', desc: 'Spatial gesture' },
  { id: 'biometric', label: 'Use Face/Touch ID', emoji: '👆', desc: 'Instant access' },
  { id: 'none', label: 'No Protection', emoji: '⏭️', desc: 'Skip for now' },
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

// Mock Content — usually fetched or imported from specialized legal screens
const LEGAL_CONTENT = {
  terms: {
    title: "Terms of Service",
    sections: [
        { title: "Personal Data", content: "Spendly is a local-only app. Your data never leaves your device unless you export it yourself." },
        { title: "Liability", content: "We are not responsible for data loss due to device damage or app deletion. Always use the Export feature." },
        { title: "Subscription", content: "While currently free, Spendly reserves the right to introduce premium analytical features." }
    ]
  },
  privacy: {
    title: "Privacy Policy",
    sections: [
        { title: "Zero Tracking", content: "We do not use analytics or third-party tracking scripts. Your financial life is private." },
        { title: "Biometric Data", content: "Fingerprint and FaceID are handled by your OS; Spendly never sees this data." },
        { title: "Barcode Lookups", content: "Lookup requests for receipt items are anonymized before being sent to lookup providers." }
    ]
  }
}

export default function OnboardingScreen() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { loadSettings, completeOnboarding } = useSettingsStore()
  const { setupBiometric } = useAppLock()
  const S = { fontFamily: "'Inter', sans-serif" }

  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [language, setLanguage] = useState('en')
  const [currency, setCurrency] = useState('USD')
  const [budget, setBudget] = useState('')
  const [currencySearch, setCurrencySearch] = useState('')
  const [lockType, setLockType] = useState('none')
  const [lockSetupType, setLockSetupType] = useState(null)

  // Legal Agreement States
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [agreedPrivacy, setAgreedPrivacy] = useState(false)
  const [legalModal, setLegalModal] = useState(null) // 'terms' | 'privacy' | null
  const [permissionsState, setPermissionsState] = useState({ camera: false, notifications: false })
  const [requesting, setRequesting] = useState(false)

  const handleLanguageSelect = (langId) => {
    setLanguage(langId)
    i18n.changeLanguage(langId)
  }

  const filteredCurrencies = CURRENCIES.filter(c =>
    c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(currencySearch.toLowerCase())
  )

  const finish = async () => {
    // If permission step is done or skipped, we go to security
    if (['pin4', 'pin6', 'pattern'].includes(lockType)) {
      setLockSetupType(lockType)
    } else if (lockType === 'biometric') {
      const success = await setupBiometric()
      if (success) await finalizeOnboarding()
      else alert(t('security.bioFail'))
    } else {
      await finalizeOnboarding()
    }
  }

  const handleGrantPermissions = async () => {
    setRequesting(true)
    const results = await permissionService.requestAllPermissions()
    setPermissionsState(results)
    setRequesting(false)
    setTimeout(() => setStep(4), 600)
  }

  const handleSkipPermissions = () => {
    permissionService.skip()
    setStep(4)
  }

  const finalizeOnboarding = async (code = null) => {
    const updates = {
      profileName: name || 'User', 
      emoji: name ? name.charAt(0).toUpperCase() : '👤', 
      language,
      currency,
      monthlyBudget: parseFloat(budget) || 2000, 
      lockType, onboardingDone: true,
    }
    if (code) {
      if (lockType === 'pattern') updates.lockPattern = code
      else updates.lockPin = code
    }
    await settingsService.update(updates)
    await loadSettings()
    completeOnboarding()
    navigate('/', { replace: true })
  }

  // Legal Modal Sub-component
  const LegalModal = ({ type, onClose }) => {
    const scrollRef = useRef(null)
    const content = LEGAL_CONTENT[type]

    return (
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-0 z-[100] bg-white flex flex-col pt-safe px-8 pb-12">
        <div className="flex items-center justify-between py-6 mb-8 border-b border-[#F6F6F6]">
            <div>
                <h3 className="text-[24px] font-[800] text-black tracking-tight" style={S}>{content.title}</h3>
                <p className="text-[12px] font-[800] text-[#AFAFAF] uppercase tracking-widest mt-1">Review the details below</p>
            </div>
            <button onClick={onClose} className="w-11 h-11 rounded-full bg-[#F6F6F6] flex items-center justify-center">
                <X className="w-5 h-5 text-black" strokeWidth={2.5} />
            </button>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide space-y-10 pr-2">
            {content.sections.map((s, idx) => (
                <div key={idx}>
                    <h4 className="text-[18px] font-[800] text-black mb-3 tracking-tight" style={S}>{s.title}</h4>
                    <p className="text-[15px] font-[500] text-[#666666] leading-relaxed" style={S}>{s.content}</p>
                </div>
            ))}
            <div className="h-10" />
        </div>
        <button onClick={onClose} className="w-full py-6 rounded-[24px] bg-black text-white text-[16px] font-[800] mt-8 shadow-xl">
            {t('common.done')}
        </button>
      </motion.div>
    )
  }

  const SlideToInitialize = ({ onComplete }) => {
    const x = useMotionValue(0)
    const textOpacity = useTransform(x, [0, 100], [1, 0])

    return (
      <div className="w-full h-[76px] bg-[#F6F6F6] rounded-full p-2 relative flex items-center overflow-hidden border border-[#EEEEEE]">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.p className="text-[12px] font-[800] text-[#AFAFAF] uppercase tracking-[0.3em] ml-10" style={{ ...S, opacity: textOpacity }}>
            {t('onboarding.getStarted')}
          </motion.p>
        </div>
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 260 }}
          dragElastic={0.05}
          onDragEnd={(_, info) => {
            if (info.offset.x > 180 || x.get() > 240) onComplete()
            else animate(x, 0, { type: 'spring', stiffness: 400, damping: 40 })
          }}
          style={{ x }}
          className="w-[60px] h-[60px] bg-black rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
        >
          <ChevronRight className="w-6 h-6 text-white" strokeWidth={3.5} />
        </motion.div>
      </div>
    )
  }

  const WelcomeStep = (
    <motion.div key="0" 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-white relative overflow-hidden"
    >
      <div className="absolute inset-0 protocol-grid opacity-10 pointer-events-none" />

      <div className="flex-[0.6] flex flex-col justify-end items-center relative pb-16">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.05, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-[320px] h-[320px] rounded-full border border-blue-50 absolute top-[80px] left-1/2 -translate-x-1/2 flex items-center justify-center"
        >
            <motion.div 
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.05, 0.1, 0.05] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full border-2 border-blue-600" 
            />
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-65 h-65 p-4 flex items-center justify-center">
                    <img src="/spendly-logo.png" alt="Spendly" className="w-65 h-65 object-contain" />
                </div>
            </div>
        </motion.div>
      </div>

      <div className="flex-[0.4] w-full px-8 flex flex-col items-center justify-between pb-12 relative z-20">
        <div className="flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[32px] font-[800] text-black text-center leading-[1.1] tracking-tight" style={S}>
            {t('onboarding.step1_title')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-[15px] font-[500] text-[#AFAFAF] text-center mt-[20px] leading-relaxed max-w-[280px]" style={S}>
            {t('onboarding.step1_desc')}
          </motion.p>
        </div>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }} className="w-full">
          <SlideToInitialize onComplete={() => setStep(1)} />
        </motion.div>
      </div>
    </motion.div>
  )

  const LanguageStep = (
    <motion.div key="lang" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full bg-white">
      <div className="pt-20 px-8 pb-6 flex-1 overflow-y-auto scrollbar-hide">
        <h2 className="text-[28px] font-[800] text-black mb-2 tracking-tight" style={S}>{t('settings.language')}</h2>
        <p className="text-[14px] font-[500] text-[#AFAFAF] mb-10" style={S}>{t('onboarding.chooseLanguage')}</p>

        <div className="grid grid-cols-1 gap-3">
          {LANGUAGE_OPTIONS.map(opt => (
            <motion.button key={opt.id} variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => handleLanguageSelect(opt.id)}
              className={`flex items-center gap-4 p-5 rounded-[24px] text-left transition-all border ${language === opt.id ? 'bg-black border-black shadow-xl shadow-black/10' : 'bg-[#F6F6F6] border-transparent'}`}>
              <span className="text-[20px]">{opt.emoji}</span>
              <span className={`text-[15px] font-[800] flex-1 ${language === opt.id ? 'text-white' : 'text-black'}`} style={S}>{opt.label}</span>
              {language === opt.id && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
            </motion.button>
          ))}
        </div>
      </div>
      
      <div className="px-8 pb-10 pt-4 bg-white">
        <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => setStep(2)}
          className="w-full py-6 rounded-[24px] bg-black text-white text-[16px] font-[800] flex items-center justify-center gap-3 shadow-xl" style={S}>
          {t('common.next')} <ChevronRight className="w-5 h-5" strokeWidth={3} />
        </motion.button>
      </div>
    </motion.div>
  )

  const ProfileStep = (
    <motion.div key="1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full bg-white">
      <div className="pt-20 px-8 pb-12 flex-1 overflow-y-auto scrollbar-hide">
        <h2 className="text-[28px] font-[800] text-black mb-2 tracking-tight" style={S}>{t('settings.profile')}</h2>
        <p className="text-[14px] font-[500] text-[#AFAFAF] mb-12" style={S}>{t('onboarding.setupProfileDesc')}</p>

        <p className="text-[12px] font-[700] text-black mb-3 ml-1 uppercase tracking-wider" style={S}>{t('settings.name')}</p>
        <div className="relative mb-10">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name"
                className={`w-full py-5 px-7 rounded-[24px] bg-[#F6F6F6] border-2 outline-none text-[16px] font-[700] text-black placeholder-[#D8D8D8] transition-all ${name.trim() ? 'border-[#EEEEEE]' : 'border-red-50'}`} style={S} />
            {name.trim() && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />
                </div>
            )}
        </div>

        <p className="text-[12px] font-[700] text-black mb-3 ml-1 uppercase tracking-wider" style={S}>{t('settings.currency')}</p>
        <div className="mb-10 rounded-[32px] overflow-hidden bg-[#F6F6F6] border border-[#EEEEEE]">
            <div className="flex items-center px-6 border-b border-[#EEEEEE]">
                <Search className="w-5 h-5 text-[#AFAFAF]" />
                <input value={currencySearch} onChange={e => setCurrencySearch(e.target.value)} placeholder={t('common.search')}
                    className="w-full py-5 px-4 bg-transparent outline-none text-[15px] font-[700] text-black placeholder-[#AFAFAF]" style={S} />
            </div>
            <div className="max-h-32 overflow-y-auto">
                {filteredCurrencies.slice(0, 15).map(c => (
                <button key={c.code} onClick={() => { setCurrency(c.code); setCurrencySearch('') }}
                    className={`w-full flex items-center gap-4 px-7 py-4.5 transition-all text-left ${currency === c.code ? 'bg-black text-white' : 'hover:bg-white'}`}>
                    <span className="text-xl">{c.flag}</span>
                    <span className="font-[800] text-[15px] tracking-tight" style={S}>{c.code}</span>
                    <span className={`text-[11px] font-[600] ml-2 ${currency === c.code ? 'text-white/60' : 'text-[#AFAFAF]'}`} style={S}>{c.name}</span>
                    {currency === c.code && <Check className="w-5 h-5 text-white ml-auto" strokeWidth={3} />}
                </button>
                ))}
            </div>
        </div>

        <p className="text-[12px] font-[700] text-black mb-3 ml-1 uppercase tracking-wider" style={S}>{t('settings.monthlyLimit')}</p>
        <div className="flex items-center rounded-[24px] bg-[#F6F6F6] px-8 py-5 border border-[#EEEEEE] mb-12">
          <span className="text-black font-[800] text-[20px] mr-4 opacity-30">
            {CURRENCIES.find(c => c.code === currency)?.symbol}
          </span>
          <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="2000"
            className="w-full bg-transparent outline-none text-[22px] font-[800] text-black placeholder-[#D8D8D8] tracking-tight" style={S} />
        </div>

        {/* Mandatory Checkboxes */}
        <div className="space-y-4 mb-8">
            <div 
                onClick={() => setAgreedTerms(!agreedTerms)}
                className={`flex items-center justify-between p-5 rounded-[24px] border transition-all cursor-pointer ${agreedTerms ? 'bg-blue-50/50 border-blue-200' : 'bg-[#F6F6F6] border-[#EEEEEE]'}`}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${agreedTerms ? 'bg-blue-500 border-blue-500' : 'bg-white border-[#EEEEEE]'}`}>
                        {agreedTerms && <Check className="w-4 h-4 text-white" strokeWidth={4} />}
                    </div>
                    <span className="text-[14px] font-[700] text-black">{t('onboarding.agreeTerms')}</span>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); setLegalModal('terms') }} 
                    className="text-[11px] font-[800] text-blue-500 uppercase tracking-widest px-4 py-2 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                >
                    {t('onboarding.read')}
                </button>
            </div>

            <div 
                onClick={() => setAgreedPrivacy(!agreedPrivacy)}
                className={`flex items-center justify-between p-5 rounded-[24px] border transition-all cursor-pointer ${agreedPrivacy ? 'bg-blue-50/50 border-blue-200' : 'bg-[#F6F6F6] border-[#EEEEEE]'}`}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${agreedPrivacy ? 'bg-blue-500 border-blue-500' : 'bg-white border-[#EEEEEE]'}`}>
                        {agreedPrivacy && <Check className="w-4 h-4 text-white" strokeWidth={4} />}
                    </div>
                    <span className="text-[14px] font-[700] text-black">{t('onboarding.agreePrivacy')}</span>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); setLegalModal('privacy') }} 
                    className="text-[11px] font-[800] text-blue-500 uppercase tracking-widest px-4 py-2 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                >
                    {t('onboarding.read')}
                </button>
            </div>
        </div>

        {! (name.trim().length > 0 && agreedTerms && agreedPrivacy) && (
            <p className="text-[12px] font-[700] text-red-400 text-center mb-4">{t('onboarding.validationHint')}</p>
        )}
      </div>
      
      <div className="px-8 pb-10 pt-4 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        <motion.button 
          variants={HAPTIC_SHAKE} 
          whileTap="tap" 
          onClick={() => (name.trim().length > 0 && agreedTerms && agreedPrivacy) ? setStep(3) : null}
          className={`w-full py-6 rounded-[24px] text-[16px] font-[800] flex items-center justify-center gap-3 transition-all ${
            (name.trim().length > 0 && agreedTerms && agreedPrivacy) 
              ? 'bg-black text-white shadow-xl shadow-black/10' 
              : 'bg-[#F6F6F6] text-[#D8D8D8] cursor-not-allowed'
          }`} style={S}>
          {t('common.next')} <ChevronRight className="w-5 h-5" strokeWidth={3} />
        </motion.button>
      </div>
    </motion.div>
  )

  const PermissionsStep = (
    <motion.div key="perms" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto pt-16 px-8 pb-6 flex flex-col items-center scrollbar-hide">
        <div className="w-16 h-16 rounded-[24px] bg-black flex items-center justify-center mb-6 flex-shrink-0 shadow-lg">
            <Activity className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>
        <h2 className="text-[26px] font-[800] text-black mb-2 tracking-tight text-center" style={S}>App Permissions</h2>
        <p className="text-[13px] font-[500] text-[#AFAFAF] text-center mb-10 max-w-[280px]" style={S}>
          Allow once — Spendly remembers and won't ask again
        </p>

        <div className="w-full space-y-3">
            {/* Camera */}
            <motion.div
              animate={permissionsState.camera ? { borderColor: '#D1FAE5', backgroundColor: '#F0FDF4' } : {}}
              className="flex items-center gap-4 p-5 rounded-[28px] border border-[#EEEEEE] bg-[#F6F6F6] transition-all"
            >
                <motion.div
                  animate={permissionsState.camera ? { backgroundColor: '#10B981', color: '#fff' } : {}}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white border border-[#EEEEEE] text-black"
                >
                    <ScanLine className="w-5 h-5" strokeWidth={2.5} />
                </motion.div>
                <div className="flex-1">
                    <p className="text-[14px] font-[800] text-black" style={S}>Smart Scanner</p>
                    <p className="text-[10px] font-[600] text-[#AFAFAF]" style={S}>Scan QR bills & receipts</p>
                </div>
                {permissionsState.camera && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                    <Check className="w-5 h-5 text-emerald-500" strokeWidth={4} />
                  </motion.div>
                )}
            </motion.div>

            {/* Notifications */}
            <motion.div
              animate={permissionsState.notifications ? { borderColor: '#D1FAE5', backgroundColor: '#F0FDF4' } : {}}
              className="flex items-center gap-4 p-5 rounded-[28px] border border-[#EEEEEE] bg-[#F6F6F6] transition-all"
            >
                <motion.div
                  animate={permissionsState.notifications ? { backgroundColor: '#10B981', color: '#fff' } : {}}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white border border-[#EEEEEE] text-black"
                >
                    <Bell className="w-5 h-5" strokeWidth={2.5} />
                </motion.div>
                <div className="flex-1">
                    <p className="text-[14px] font-[800] text-black" style={S}>Notifications</p>
                    <p className="text-[10px] font-[600] text-[#AFAFAF]" style={S}>Budget alerts & reminders</p>
                </div>
                {permissionsState.notifications && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                    <Check className="w-5 h-5 text-emerald-500" strokeWidth={4} />
                  </motion.div>
                )}
            </motion.div>
        </div>

        <div className="mt-8 p-5 rounded-[24px] bg-[#F6F6F6] border border-[#EEEEEE]">
            <p className="text-[11px] font-[600] text-[#AFAFAF] leading-relaxed text-center" style={S}>
                🔒 All data stays on your device. Camera is only used to scan bills — never stores photos.
            </p>
        </div>
      </div>
      
      <div className="px-8 pb-10 pt-4 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-10">
        <motion.button
          variants={HAPTIC_SHAKE} whileTap="tap"
          onClick={handleGrantPermissions}
          disabled={requesting}
          className="w-full py-5 rounded-[22px] bg-black text-white text-[15px] font-[800] flex items-center justify-center gap-3 shadow-xl mb-4" style={S}>
          {requesting ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Requesting…</>
          ) : 'Allow Permissions'}
        </motion.button>
        <button onClick={handleSkipPermissions} className="w-full py-2 text-[11px] font-[800] text-[#D8D8D8] uppercase tracking-[0.2em]" style={S}>
            Skip for now
        </button>
      </div>
    </motion.div>
  )

  const LockStep = (
    <motion.div key="2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full bg-white">
      <div className="pt-20 px-8 pb-12 flex-1 overflow-y-auto scrollbar-hide">
        <h2 className="text-[28px] font-[800] text-black mb-2 tracking-tight" style={S}>{t('security.setupLock')}</h2>
        <p className="text-[14px] font-[500] text-[#AFAFAF] mb-12" style={S}>{t('onboarding.step3_desc')}</p>

        <div className="flex flex-col gap-4">
          {LOCK_OPTIONS.map(opt => (
            <motion.button key={opt.id} variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => setLockType(opt.id)}
              className={`flex items-center gap-5 p-6 rounded-[32px] text-left relative transition-all border ${lockType === opt.id ? 'bg-black border-black shadow-2xl' : 'bg-[#F6F6F6] border-transparent'}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border ${lockType === opt.id ? 'bg-white border-white' : 'bg-white border-[#EEEEEE]'}`}>
                <span>{opt.emoji}</span>
              </div>
              <div className="flex-1">
                <p className={`font-[800] text-[15px] tracking-tight ${lockType === opt.id ? 'text-white' : 'text-black'}`} style={S}>{opt.label}</p>
                <p className={`text-[12px] font-[500] mt-0.5 ${lockType === opt.id ? 'text-white/50' : 'text-[#AFAFAF]'}`} style={S}>{opt.desc}</p>
              </div>
              {opt.recommended && !(lockType === opt.id) && (
                <span className="text-[10px] font-[800] px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-600 uppercase tracking-widest" style={S}>{t('common.recommended')}</span>
              )}
              {lockType === opt.id && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-white">
                  <Check className="w-4 h-4 text-black" strokeWidth={4} />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
      
      <div className="px-8 pb-10 pt-4 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={finish}
          className="w-full py-6 rounded-[24px] bg-black text-white text-[16px] font-[800] flex items-center justify-center gap-3 shadow-xl mb-4" style={S}>
          {t('common.finish')}
        </motion.button>
        <p className="text-[11px] font-[600] text-[#D8D8D8] text-center leading-relaxed px-4" style={S}>
          {t('onboarding.finish_disclaimer')}
        </p>
      </div>
    </motion.div>
  )

  const steps = [WelcomeStep, LanguageStep, ProfileStep, PermissionsStep, LockStep]

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-white">
      <AnimatePresence mode="wait">{steps[step]}</AnimatePresence>
      <AnimatePresence>
        {legalModal && (
          <LegalModal 
            type={legalModal} 
            onClose={() => setLegalModal(null)} 
          />
        )}
      </AnimatePresence>
      {lockSetupType && (
        <LockSetupModal lockType={lockSetupType} onSave={finalizeOnboarding} onCancel={() => setLockSetupType(null)} />
      )}
    </div>
  )
}
