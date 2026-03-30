// Onboarding screen — 3 steps: Welcome → Profile Setup → Lock Setup
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useSettingsStore } from '../store/settingsStore'
import { useAppLock } from '../hooks/useAppLock'
import { settingsService } from '../services/database'
import { CURRENCIES } from '../constants/currencies'
import { ChevronRight } from 'lucide-react'
import LockSetupModal from '../components/lock/LockSetupModal'

const EMOJIS = ['😊', '😎', '🤩', '🥳', '🐻', '🦁', '🐼', '🦊', '🐸', '🦋', '🌟', '💎']
const LOCK_OPTIONS = [
  { id: 'pin4', label: '4 Digit PIN', emoji: '🔢', desc: 'Recommended', recommended: true },
  { id: 'pin6', label: '6 Digit PIN', emoji: '🔢', desc: 'More secure' },
  { id: 'pattern', label: 'Draw Pattern', emoji: '⬛', desc: 'Draw to unlock' },
  { id: 'biometric', label: 'Face ID / Fingerprint', emoji: '👆', desc: 'Use your device biometrics' },
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
      if (success) {
        await finalizeOnboarding()
      } else {
        alert("Failed to setup Biometrics. Your device may not support it or you cancelled the prompt.")
      }
    } else {
      await finalizeOnboarding()
    }
  }

  const finalizeOnboarding = async (code = null) => {
    const updates = {
      name: name || 'Friend',
      emoji: selectedEmoji,
      currency,
      monthlyBudget: parseFloat(budget) || 2000,
      lockType,
      onboardingDone: true,
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

  const steps = [
    // Step 0: Welcome
    <motion.div key="0" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
      className="flex flex-col items-center justify-center h-full px-8 text-center"
      style={{ background: 'linear-gradient(160deg, #7C3AED, #6D28D9)' }}>
      <div className="text-7xl mb-6">💸</div>
      <h1 className="text-[40px] font-sora font-bold text-white mb-3">Spendly</h1>
      <p className="text-[26px] font-sora font-semibold text-white mb-4">Track your money<br />easily 💸</p>
      <p className="text-[16px] text-purple-200 mb-8 leading-relaxed">Everything stays private on your phone.<br />No cloud. No account. Ever.</p>
      
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-10 border border-white/20 max-w-[300px]">
        <p className="text-white text-sm font-medium mb-1">🔒 Your Privacy Promise</p>
        <p className="text-purple-100 text-[12px] leading-snug">We use AES-256-GCM encryption. Even we can't see your data.</p>
      </div>

      <motion.button whileTap={{ scale: 0.95 }} onClick={() => setStep(1)}
        className="w-full max-w-[260px] py-4 bg-white rounded-[20px] text-purple-700 text-[16px] font-semibold shadow-xl">
        Let's Start 🚀
      </motion.button>
    </motion.div>,

    // Step 1: Profile setup
    <motion.div key="1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
      className="flex flex-col h-full overflow-y-auto">
      <div className="pt-14 px-6 pb-6 flex-1">
        <p className="text-sm text-purple-600 font-semibold mb-2">Step 2 of 3</p>
        <h2 className="text-[28px] font-sora font-bold text-gray-900 mb-1">Tell us about you</h2>
        <p className="text-gray-400 mb-8">Set up your personal profile</p>

        {/* Emoji picker */}
        <p className="text-sm font-semibold text-gray-600 mb-3">Pick your avatar</p>
        <div className="flex flex-wrap gap-3 mb-6">
          {EMOJIS.map(e => (
            <button key={e} onClick={() => setSelectedEmoji(e)}
              className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center transition-all ${selectedEmoji === e ? 'bg-purple-100 ring-2 ring-purple-600 scale-110' : 'bg-gray-100'}`}>
              {e}
            </button>
          ))}
        </div>

        {/* Name */}
        <p className="text-sm font-semibold text-gray-600 mb-2">Your name</p>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="What do we call you?"
          autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
          className="w-full py-4 px-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-purple-400 outline-none text-[16px] font-medium mb-6"
        />

        {/* Currency */}
        <p className="text-sm font-semibold text-gray-600 mb-2">Your currency</p>
        <input value={currencySearch} onChange={e => setCurrencySearch(e.target.value)} placeholder={`Search... (Currently selected: ${currency})`}
          className="w-full py-3 px-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none text-sm mb-2"
        />
        <div className="max-h-36 overflow-y-auto rounded-2xl border border-gray-100 mb-6">
          {filteredCurrencies.map(c => (
            <button key={c.code} onClick={() => { setCurrency(c.code); setCurrencySearch('') }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-gray-50 ${currency === c.code ? 'bg-purple-50' : ''}`}>
              <span className="text-xl">{c.flag}</span>
              <span className="font-medium text-gray-800">{c.code}</span>
              <span className="text-gray-400">{c.name}</span>
              {currency === c.code && <span className="ml-auto text-purple-600 font-bold">✓</span>}
            </button>
          ))}
        </div>

        {/* Monthly budget */}
        <p className="text-sm font-semibold text-gray-600 mb-2">Monthly budget</p>
        <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g. 2000"
          autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
          className="w-full py-4 px-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-purple-400 outline-none text-[16px] font-medium"
        />
      </div>
      <div className="px-6 pb-10">
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(2)}
          className="w-full py-4 rounded-[20px] text-white text-[16px] font-semibold"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}>
          Next →
        </motion.button>
      </div>
    </motion.div>,

    // Step 2: Lock setup
    <motion.div key="2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
      className="flex flex-col h-full">
      <div className="pt-14 px-6 pb-6 flex-1 overflow-y-auto">
        <p className="text-sm text-purple-600 font-semibold mb-2">Step 3 of 3</p>
        <h2 className="text-[28px] font-sora font-bold text-gray-900 mb-1">Protect your Spendly</h2>
        <p className="text-gray-400 mb-8">Choose how you want to lock the app</p>
        <div className="flex flex-col gap-3">
          {LOCK_OPTIONS.map(opt => (
            <motion.button key={opt.id} whileTap={{ scale: 0.97 }} onClick={() => setLockType(opt.id)}
              className={`flex items-center gap-4 p-4 rounded-[20px] border-2 text-left transition-all ${
                lockType === opt.id ? 'border-purple-600 bg-purple-50' : 'border-gray-100 bg-white'
              }`}>
              <span className="text-3xl">{opt.emoji}</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{opt.label}</p>
                <p className="text-sm text-gray-400">{opt.desc}</p>
              </div>
              {opt.recommended && (
                <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full font-medium">Best</span>
              )}
              {lockType === opt.id && <span className="text-purple-600 font-bold text-lg">✓</span>}
            </motion.button>
          ))}
        </div>
      </div>
      <div className="px-6 pb-10">
        <motion.button whileTap={{ scale: 0.97 }} onClick={finish}
          className="w-full py-4 rounded-[20px] text-white text-[16px] font-semibold"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}>
          All Done! 🎉
        </motion.button>
      </div>
    </motion.div>,
  ]

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-white dark:bg-[#0F0F1A]">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 z-10 bg-purple-100">
        <motion.div animate={{ width: `${((step + 1) / 3) * 100}%` }} className="h-full bg-purple-600" />
      </div>
      <AnimatePresence mode="wait">
        {steps[step]}
      </AnimatePresence>

      {lockSetupType && (
        <LockSetupModal 
          lockType={lockSetupType} 
          onSave={finalizeOnboarding} 
          onCancel={() => setLockSetupType(null)} 
        />
      )}
    </div>
  )
}
