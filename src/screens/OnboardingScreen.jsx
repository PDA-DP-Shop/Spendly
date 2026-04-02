// Onboarding — precise white premium setup matching spec
import { useState } from 'react'
import { m as motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useSettingsStore } from '../store/settingsStore'
import { useAppLock } from '../hooks/useAppLock'
import { settingsService } from '../services/database'
import { CURRENCIES } from '../constants/currencies'
import { ChevronRight, ShieldCheck, Check } from 'lucide-react'
import LockSetupModal from '../components/lock/LockSetupModal'

const EMOJIS = ['😊', '😎', '🤩', '🥳', '🐻', '🦁', '🐼', '🦊', '🐸', '🦋', '🌟', '💎']
const LOCK_OPTIONS = [
  { id: 'pin4', label: '4-Digit PIN', emoji: '🔢', desc: 'Recommended', recommended: true },
  { id: 'pin6', label: '6-Digit PIN', emoji: '🔐', desc: 'More secure' },
  { id: 'pattern', label: 'Draw Pattern', emoji: '⬛', desc: 'Draw to unlock' },
  { id: 'biometric', label: 'Face ID / Fingerprint', emoji: '👆', desc: 'Use device biometrics' },
  { id: 'none', label: 'Skip for now', emoji: '⏭️', desc: 'No lock' },
]

export default function OnboardingScreen() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('😊')
  const [currency, setCurrency] = useState('USD')
  const [budget, setBudget] = useState('')
  const [currencySearch, setCurrencySearch] = useState('')
  const [lockType, setLockType] = useState('none')
  const [lockSetupType, setLockSetupType] = useState(null)
  const navigate = useNavigate()
  const { loadSettings, completeOnboarding } = useSettingsStore()
  const { setupBiometric } = useAppLock()

  const filteredCurrencies = CURRENCIES.filter(c =>
    c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(currencySearch.toLowerCase())
  )

  const finish = async () => {
    if (['pin4', 'pin6', 'pattern'].includes(lockType)) {
      setLockSetupType(lockType)
    } else if (lockType === 'biometric') {
      const success = await setupBiometric()
      if (success) await finalizeOnboarding()
      else alert("Biometric setup failed. Your device may not support it.")
    } else {
      await finalizeOnboarding()
    }
  }

  const finalizeOnboarding = async (code = null) => {
    const updates = {
      name: name || 'Friend', emoji: selectedEmoji, currency,
      monthlyBudget: parseFloat(budget) || 2000, lockType, onboardingDone: true,
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

  const inputStyle = {
    fontFamily: "'Nunito', sans-serif",
    padding: '16px 20px',
    fontSize: '15px',
    fontWeight: 500,
    color: 'var(--text-primary)',
    background: 'var(--bg-section)',
    border: 'none',
    borderRadius: '14px',
    outline: 'none',
    width: '100%',
  }

  // Exact Splash Screen Spec
  const WelcomeStep = (
    <motion.div key="0" 
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col h-full bg-[#FFFFFF]"
    >
      {/* TOP SECTION (60%) */}
      <div className="flex-[0.6] flex flex-col justify-end items-center relative pb-8">
        <div className="w-[280px] h-[280px] rounded-full bg-[#F0EEFF] absolute top-[80px] left-1/2 -translate-x-1/2 flex items-center justify-center">
          <div className="relative animate-wallet w-[160px] h-[160px] flex justify-center items-center">
            {/* Using emojis as a fallback 3D wallet per spec */}
            <span className="text-[120px] leading-none drop-shadow-xl" role="img" aria-label="wallet">👜</span>
            <span className="absolute -top-4 -right-4 text-[40px] drop-shadow-md">🪙</span>
            <span className="absolute bottom-6 -left-8 text-[32px] drop-shadow-md">🪙</span>
            
            {/* Small colored badge icons per spec */}
            <div className="absolute top-2 -right-6 w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center border-[3px] border-white shadow-sm">
              <span className="text-white text-[18px]">↑</span>
            </div>
            <div className="absolute bottom-4 -left-6 w-8 h-8 rounded-full bg-[#EC4899] flex items-center justify-center border-[3px] border-white shadow-sm">
              <span className="text-white text-[18px]">↓</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION (40%) */}
      <div className="flex-[0.4] w-full px-5 flex flex-col items-center">
        <h1 className="text-[28px] font-[800] text-[#1A1A2E] text-center leading-[1.3] mt-8" style={{ fontFamily: "Nunito" }}>
          Save your money with<br/>Expense Tracker
        </h1>
        
        <p className="text-[14px] font-[400] text-[#9CA3AF] text-center mt-[12px] leading-[1.6]" style={{ fontFamily: "Nunito" }}>
          Save money! The more your money<br/>works for you, the less you have<br/>to work for money.
        </p>
        
        <div className="flex-1" />

        <motion.button 
          whileTap={{ scale: 0.97 }} 
          onClick={() => setStep(1)}
          transition={{ duration: 0.15, type: 'spring' }}
          className="w-full h-[58px] mb-8 rounded-[16px] text-white text-[16px] font-[700] flex items-center justify-center" 
          style={{ 
            fontFamily: "Nunito", 
            background: 'var(--primary)', 
            boxShadow: 'var(--shadow-fab)' 
          }}
        >
          Let's Start
        </motion.button>
      </div>
    </motion.div>
  )

  // Step 1: Profile (reskinned briefly)
  const ProfileStep = (
    <motion.div key="1" 
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col h-full bg-[#FFFFFF]"
    >
      <div className="pt-16 px-6 pb-6 flex-1 overflow-y-auto scrollbar-hide">
        <h2 className="text-[28px] font-extrabold text-[var(--text-primary)] mb-2 leading-tight" style={{ fontFamily: "Nunito" }}>Profile</h2>
        <p className="text-[14px] font-medium text-[var(--text-muted)] mb-8" style={{ fontFamily: "Nunito" }}>Personalize your experience.</p>

        <p className="text-[13px] font-semibold text-[var(--text-secondary)] mb-2 ml-1" style={{ fontFamily: "Nunito" }}>Your Name</p>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name..."
          style={inputStyle} className="mb-7" />

        <p className="text-[13px] font-semibold text-[var(--text-secondary)] mb-3 ml-1" style={{ fontFamily: "Nunito" }}>Pick an Avatar</p>
        <div className="flex flex-wrap gap-3 mb-8">
          {EMOJIS.map(e => (
            <button key={e} onClick={() => setSelectedEmoji(e)}
              className="w-14 h-14 rounded-[14px] text-2xl flex items-center justify-center transition-all bg-[var(--bg-section)]"
              style={{
                background: selectedEmoji === e ? 'var(--primary)' : 'var(--bg-section)',
                transform: selectedEmoji === e ? 'scale(1.1)' : 'scale(1)',
              }}>
              {e}
            </button>
          ))}
        </div>

        <p className="text-[13px] font-semibold text-[var(--text-secondary)] mb-2 ml-1" style={{ fontFamily: "Nunito" }}>Currency</p>
        <div className="mb-4 rounded-[14px] overflow-hidden" style={{ background: 'var(--bg-section)' }}>
          <input value={currencySearch} onChange={e => setCurrencySearch(e.target.value)} placeholder={`Search... (${currency})`}
            className="w-full py-4 px-5 bg-transparent outline-none text-[15px] font-medium text-[var(--text-primary)]" style={{ fontFamily: "Nunito" }} />
          <div className="max-h-48 overflow-y-auto border-t border-[var(--border)]">
            {filteredCurrencies.slice(0, 10).map(c => (
              <button key={c.code} onClick={() => { setCurrency(c.code); setCurrencySearch('') }}
                className="w-full flex items-center gap-3 px-5 py-3 transition-all text-left"
                style={{ background: currency === c.code ? 'var(--border)' : 'transparent' }}>
                <span className="text-xl">{c.flag}</span>
                <span className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "Nunito" }}>{c.code}</span>
                <span className="text-[var(--text-muted)] text-[13px] font-medium" style={{ fontFamily: "Nunito" }}>{c.name}</span>
                {currency === c.code && <Check className="w-4 h-4 text-[var(--primary)] ml-auto" />}
              </button>
            ))}
          </div>
        </div>

        <p className="text-[13px] font-semibold text-[var(--text-secondary)] mb-2 ml-1" style={{ fontFamily: "Nunito" }}>Monthly Budget</p>
        <div className="flex items-center rounded-[14px] overflow-hidden bg-[var(--bg-section)]">
          <span className="pl-5 text-[var(--text-muted)] font-bold text-[18px]">
            {CURRENCIES.find(c => c.code === currency)?.symbol}
          </span>
          <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="2000"
            className="w-full py-4 px-4 bg-transparent outline-none text-[18px] font-bold text-[var(--text-primary)]" style={{ fontFamily: "Nunito" }} />
        </div>
      </div>
      
      <div className="px-6 pb-8 pt-4 bg-[#FFFFFF]">
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(2)}
          transition={{ duration: 0.15, type: 'spring' }}
          className="w-full h-[58px] rounded-[16px] text-white text-[16px] font-[700] flex items-center justify-center gap-2" 
          style={{ fontFamily: "Nunito", background: 'var(--primary)', boxShadow: 'var(--shadow-fab)' }}>
          Continue <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  )

  // Step 2: Lock setup
  const LockStep = (
    <motion.div key="2" 
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col h-full bg-[#FFFFFF]"
    >
      <div className="pt-16 px-6 pb-6 flex-1 overflow-y-auto scrollbar-hide">
        <h2 className="text-[28px] font-extrabold text-[var(--text-primary)] mb-2 leading-tight" style={{ fontFamily: "Nunito" }}>Security</h2>
        <p className="text-[14px] font-medium text-[var(--text-muted)] mb-8" style={{ fontFamily: "Nunito" }}>Choose how to protect your data.</p>

        <div className="flex flex-col gap-3">
          {LOCK_OPTIONS.map(opt => (
            <motion.button key={opt.id} whileTap={{ scale: 0.98 }} onClick={() => setLockType(opt.id)}
              className="flex items-center gap-4 p-4 rounded-[16px] text-left relative overflow-hidden"
              style={{
                background: lockType === opt.id ? 'var(--border)' : 'var(--bg-section)',
              }}>
              <div className="w-12 h-12 rounded-[12px] flex items-center justify-center text-2xl bg-[#FFFFFF]">
                {opt.emoji}
              </div>
              <div className="flex-1">
                <p className="font-[600] text-[var(--text-primary)] text-[15px]" style={{ fontFamily: "Nunito" }}>{opt.label}</p>
                <p className="text-[13px] font-[500] text-[var(--text-muted)] mt-0.5" style={{ fontFamily: "Nunito" }}>{opt.desc}</p>
              </div>
              {opt.recommended && (
                <span className="text-[10px] font-bold px-2 py-1 flex items-center justify-center rounded-full bg-[var(--primary)] text-white" style={{ fontFamily: "Nunito" }}>
                  BEST
                </span>
              )}
              {lockType === opt.id && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--primary)' }}>
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
      
      <div className="px-6 pb-8 pt-4 bg-[#FFFFFF]">
        <motion.button whileTap={{ scale: 0.97 }} onClick={finish}
          transition={{ duration: 0.15, type: 'spring' }}
          className="w-full h-[58px] rounded-[16px] text-white text-[16px] font-[700] flex items-center justify-center gap-2" 
          style={{ fontFamily: "Nunito", background: 'var(--primary)', boxShadow: 'var(--shadow-fab)' }}>
          Let's Go!
        </motion.button>
      </div>
    </motion.div>
  )

  const steps = [WelcomeStep, ProfileStep, LockStep]

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-white">
      <AnimatePresence mode="wait">{steps[step]}</AnimatePresence>

      {lockSetupType && (
        <LockSetupModal lockType={lockSetupType} onSave={finalizeOnboarding} onCancel={() => setLockSetupType(null)} />
      )}
    </div>
  )
}
