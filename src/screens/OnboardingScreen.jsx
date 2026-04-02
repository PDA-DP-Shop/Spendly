// Onboarding — white premium 3-step setup
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

const S = { fontFamily: "'Plus Jakarta Sans', sans-serif" }

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
    ...S,
    padding: '16px 20px',
    fontSize: '18px',
    fontWeight: 600,
    color: '#0F172A',
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    outline: 'none',
    width: '100%',
  }

  // Step 0: Welcome
  const WelcomeStep = (
    <motion.div key="0" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
      className="flex flex-col items-center justify-center h-full px-8 text-center bg-white">
      {/* Subtle indigo bg blob */}
      <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full flex flex-col items-center">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-28 h-28 rounded-[36px] flex items-center justify-center mb-8"
          style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 12px 40px rgba(99,102,241,0.35)' }}
        >
          <img src="/spendly-logo.png" alt="Spendly" className="w-16 h-16 rounded-2xl" />
        </motion.div>

        <h1 className="text-[48px] font-extrabold text-[#0F172A] mb-2 tracking-tight leading-none" style={S}>Spendly</h1>
        <p className="text-[20px] font-bold mb-6 tracking-tight" style={{ color: '#6366F1', ...S }}>Financial Freedom</p>

        <p className="text-[16px] text-[#64748B] mb-10 leading-relaxed max-w-[280px]" style={S}>
          The smartest, most private way to track your money.{' '}
          <strong className="text-[#0F172A]">Offline-first. Encrypted. Instant.</strong>
        </p>

        <div className="w-full max-w-[320px] mb-10 p-5 rounded-[20px]"
          style={{ background: '#EEF2FF', borderLeft: '3px solid #6366F1' }}>
          <p className="text-[14px] font-bold text-[#3730A3] mb-1 flex items-center gap-2" style={S}>
            <ShieldCheck className="w-4 h-4" /> Zero-Knowledge Design
          </p>
          <p className="text-[13px] text-[#4338CA] leading-relaxed" style={S}>
            Your data never leaves this device. Not even we can see it.
          </p>
        </div>

        <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} onClick={() => setStep(1)}
          className="w-full max-w-[300px] py-5 rounded-[18px] text-white text-[16px] font-bold flex items-center justify-center gap-2" style={S}
          style2={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 8px 32px rgba(99,102,241,0.4)', ...S }}>
          Get Started <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  )

  // Step 1: Profile
  const ProfileStep = (
    <motion.div key="1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
      className="flex flex-col h-full bg-[#F8F9FF]">
      <div className="pt-16 px-6 pb-6 flex-1 overflow-y-auto scrollbar-hide">
        <div className="w-10 h-10 rounded-full mb-6 flex items-center justify-center font-bold text-[#6366F1] text-[16px]"
          style={{ background: '#EEF2FF', border: '1px solid rgba(99,102,241,0.2)', ...S }}>2</div>
        <h2 className="text-[34px] font-extrabold text-[#0F172A] mb-2 leading-tight" style={S}>Your Profile</h2>
        <p className="text-[15px] text-[#64748B] mb-8" style={S}>Personalize your experience.</p>

        <p className="text-[12px] font-semibold uppercase tracking-wider text-[#94A3B8] mb-2 ml-1" style={S}>Your Name</p>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name..."
          style={inputStyle} className="mb-7 focus:border-[#6366F1] transition-colors" />

        <p className="text-[12px] font-semibold uppercase tracking-wider text-[#94A3B8] mb-3 ml-1" style={S}>Pick an Avatar</p>
        <div className="flex flex-wrap gap-3 mb-8">
          {EMOJIS.map(e => (
            <button key={e} onClick={() => setSelectedEmoji(e)}
              className="w-14 h-14 rounded-[16px] text-2xl flex items-center justify-center transition-all border"
              style={{
                background: selectedEmoji === e ? '#EEF2FF' : '#FFFFFF',
                border: `2px solid ${selectedEmoji === e ? '#6366F1' : '#E2E8F0'}`,
                transform: selectedEmoji === e ? 'scale(1.1)' : 'scale(1)',
              }}>
              {e}
            </button>
          ))}
        </div>

        <p className="text-[12px] font-semibold uppercase tracking-wider text-[#94A3B8] mb-2 ml-1" style={S}>Currency</p>
        <div className="mb-4 rounded-[16px] overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <input value={currencySearch} onChange={e => setCurrencySearch(e.target.value)} placeholder={`Search... (${currency})`}
            className="w-full py-4 px-5 bg-transparent outline-none text-[15px] font-semibold text-[#0F172A] placeholder-[#CBD5E1]" style={S} />
          <div className="max-h-48 overflow-y-auto border-t border-[#F0F0F8]">
            {filteredCurrencies.slice(0, 10).map(c => (
              <button key={c.code} onClick={() => { setCurrency(c.code); setCurrencySearch('') }}
                className="w-full flex items-center gap-3 px-5 py-3 transition-all text-left"
                style={{ background: currency === c.code ? '#EEF2FF' : 'transparent' }}>
                <span className="text-xl">{c.flag}</span>
                <span className="font-bold text-[#0F172A]" style={S}>{c.code}</span>
                <span className="text-[#94A3B8] text-[13px]" style={S}>{c.name}</span>
                {currency === c.code && <Check className="w-4 h-4 text-[#6366F1] ml-auto" />}
              </button>
            ))}
          </div>
        </div>

        <p className="text-[12px] font-semibold uppercase tracking-wider text-[#94A3B8] mb-2 ml-1" style={S}>Monthly Budget</p>
        <div className="flex items-center rounded-[16px] overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <span className="pl-5 text-[#94A3B8] font-bold text-lg">
            {CURRENCIES.find(c => c.code === currency)?.symbol}
          </span>
          <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="2000"
            className="w-full py-4 px-4 bg-transparent outline-none text-[18px] font-bold text-[#0F172A] placeholder-[#CBD5E1]" style={S} />
        </div>
      </div>
      <div className="px-6 pb-12 pt-4 bg-white border-t border-[#F0F0F8]">
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(2)}
          className="w-full py-5 rounded-[18px] text-white text-[16px] font-bold flex items-center justify-center gap-2" style={S}
          style2={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 8px 32px rgba(99,102,241,0.4)', ...S }}>
          Continue <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  )

  // Step 2: Lock setup
  const LockStep = (
    <motion.div key="2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
      className="flex flex-col h-full bg-[#F8F9FF]">
      <div className="pt-16 px-6 pb-6 flex-1 overflow-y-auto scrollbar-hide">
        <div className="w-10 h-10 rounded-full mb-6 flex items-center justify-center font-bold text-[#6366F1] text-[16px]"
          style={{ background: '#EEF2FF', border: '1px solid rgba(99,102,241,0.2)', ...S }}>3</div>
        <h2 className="text-[34px] font-extrabold text-[#0F172A] mb-2 leading-tight" style={S}>Security</h2>
        <p className="text-[15px] text-[#64748B] mb-8" style={S}>Choose how to protect your data.</p>

        <div className="flex flex-col gap-3">
          {LOCK_OPTIONS.map(opt => (
            <motion.button key={opt.id} whileTap={{ scale: 0.98 }} onClick={() => setLockType(opt.id)}
              className="flex items-center gap-4 p-5 rounded-[20px] border-2 text-left relative overflow-hidden"
              style={{
                border: `2px solid ${lockType === opt.id ? '#6366F1' : '#E2E8F0'}`,
                background: lockType === opt.id ? '#EEF2FF' : '#FFFFFF',
              }}>
              <div className="w-14 h-14 rounded-[16px] flex items-center justify-center text-3xl"
                style={{ background: lockType === opt.id ? 'rgba(99,102,241,0.1)' : '#F8F9FF' }}>
                {opt.emoji}
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#0F172A] text-[17px]" style={S}>{opt.label}</p>
                <p className="text-[13px] text-[#64748B] mt-0.5" style={S}>{opt.desc}</p>
              </div>
              {opt.recommended && (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: '#EEF2FF', color: '#6366F1', ...S }}>
                  BEST
                </span>
              )}
              {lockType === opt.id && (
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#6366F1' }}>
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
      <div className="px-6 pb-12 pt-4 bg-white border-t border-[#F0F0F8]">
        <motion.button whileTap={{ scale: 0.97 }} onClick={finish}
          className="w-full py-5 rounded-[18px] text-white text-[16px] font-bold flex items-center justify-center gap-2" style={S}
          style2={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 8px 32px rgba(99,102,241,0.4)', ...S }}>
          🎉 Let's Go!
        </motion.button>
      </div>
    </motion.div>
  )

  const steps = [WelcomeStep, ProfileStep, LockStep]

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-white">
      {/* Indigo progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 z-[100] bg-[#F1F5F9]">
        <motion.div
          animate={{ width: `${((step + 1) / 3) * 100}%` }}
          className="h-full"
          style={{ background: 'linear-gradient(90deg, #6366F1, #8B5CF6)' }}
        />
      </div>

      <AnimatePresence mode="wait">{steps[step]}</AnimatePresence>

      {lockSetupType && (
        <LockSetupModal lockType={lockSetupType} onSave={finalizeOnboarding} onCancel={() => setLockSetupType(null)} />
      )}
    </div>
  )
}
