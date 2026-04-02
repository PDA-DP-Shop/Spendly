// Onboarding screen — 3 steps: Welcome → Profile Setup → Lock Setup
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
    <motion.div key="0" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
      className="flex flex-col items-center justify-center h-full px-8 text-center relative overflow-hidden bg-[#050B18]">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-cyan-glow/20 blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-blue-600/20 blur-[100px]" />
      
      <div className="relative z-10 w-full flex flex-col items-center">
        <motion.div 
          animate={{ y: [0, -10, 0] }} 
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-28 h-28 rounded-[38px] glass-accent border-white/10 flex items-center justify-center shadow-glow mb-10"
        >
          <img src="/spendly-logo.png" alt="Spendly" className="w-16 h-16 rounded-2xl" />
        </motion.div>
        
        <h1 className="text-[52px] font-display font-bold text-white mb-2 tracking-tighter leading-none">Spendly</h1>
        <p className="text-[24px] font-display font-bold text-cyan-glow mb-6 tracking-tight">Financial Sovereignty</p>
        
        <p className="text-[15px] font-body text-[#7B8DB0] mb-12 leading-relaxed max-w-[280px]">
          The most secure, private, and powerful way to track your liquidity. <span className="text-[#F0F4FF] font-bold">Offline-first. Cryptographic. Invisible.</span>
        </p>
        
        <div className="glass-elevated border-white/5 rounded-[32px] p-6 mb-12 border-l-cyan-glow/30 border-l-4 max-w-[320px] text-left">
          <p className="text-[#F0F4FF] text-[13px] font-display font-bold mb-2 flex items-center gap-2">
             <ShieldCheck className="w-4 h-4 text-cyan-glow" /> 🛡️ ZERO-KNOWLEDGE PROMISE
          </p>
          <p className="text-[#7B8DB0] text-[11px] leading-relaxed font-medium">
            Local-only data architecture. Even we can't see your records. Your privacy is enforced by mathematics, not just promises.
          </p>
        </div>

        <motion.button 
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.95 }} 
          onClick={() => setStep(1)}
          className="w-full max-w-[280px] py-5 bg-gradient-to-br from-[#0066FF] to-[#00D4FF] rounded-[24px] text-white text-[16px] font-display font-bold shadow-glowLg uppercase tracking-widest"
        >
          Initialize App 🚀
        </motion.button>
      </div>
    </motion.div>,

    // Step 1: Profile setup
    <motion.div key="1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
      className="flex flex-col h-full bg-[#050B18]">
      <div className="pt-16 px-6 pb-6 flex-1 overflow-y-auto scrollbar-hide">
        <p className="text-[11px] font-display font-bold text-cyan-glow uppercase tracking-[.25em] mb-3">Protocol Set 02</p>
        <h2 className="text-[36px] font-display font-bold text-[#F0F4FF] mb-2 tracking-tighter leading-none">Identity Setup</h2>
        <p className="text-[#7B8DB0] font-body font-medium mb-10 text-[15px]">Personalize your tactical dashboard.</p>

        {/* Name */}
        <p className="text-[11px] font-display font-bold text-[#3D4F70] uppercase tracking-[.2em] mb-3 ml-1">Universal ID</p>
        <div className="glass-elevated border-white/5 rounded-[24px] p-1.5 focus-within:border-cyan-glow/30 transition-all mb-8 shadow-glowSmall">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter Alias..."
            className="w-full py-4 px-6 bg-transparent outline-none text-[18px] font-display font-bold text-[#F0F4FF] placeholder-[#3D4F70]"
          />
        </div>

        {/* Emoji picker */}
        <p className="text-[11px] font-display font-bold text-[#3D4F70] uppercase tracking-[.2em] mb-4 ml-1">Dashboard Avatar</p>
        <div className="flex flex-wrap gap-4 mb-10">
          {EMOJIS.map(e => (
            <button key={e} onClick={() => setSelectedEmoji(e)}
              className={`w-14 h-14 rounded-2xl text-2xl flex items-center justify-center transition-all border duration-300 ${
                selectedEmoji === e ? 'bg-cyan-dim border-cyan-glow/40 shadow-glow scale-110' : 'glass border-transparent'
              }`}>
              {e}
            </button>
          ))}
        </div>

        {/* Currency & Budget */}
        <div className="grid grid-cols-1 gap-6 mb-10">
          <div>
            <p className="text-[11px] font-display font-bold text-[#3D4F70] uppercase tracking-[.2em] mb-3 ml-1">Liquidity Unit</p>
            <div className="glass border-white/5 rounded-[24px] p-1.5 shadow-glowSmall relative group">
              <input value={currencySearch} onChange={e => setCurrencySearch(e.target.value)} placeholder={`Search... (${currency})`}
                className="w-full py-4 px-6 bg-transparent outline-none text-[15px] font-display font-bold text-[#F0F4FF] placeholder-[#3D4F70]"
              />
              <div className="max-h-48 overflow-y-auto mt-2 px-2 pb-2 space-y-1 scrollbar-hide">
                {filteredCurrencies.slice(0, 10).map(c => (
                  <button key={c.code} onClick={() => { setCurrency(c.code); setCurrencySearch('') }}
                    className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl transition-all border ${currency === c.code ? 'bg-cyan-dim border-cyan-glow/20' : 'hover:bg-white/5 border-transparent'}`}>
                    <span className="text-xl filter drop-shadow-md">{c.flag}</span>
                    <span className="font-display font-bold text-[#F0F4FF]">{c.code}</span>
                    <span className="text-[#3D4F70] text-[13px]">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-display font-bold text-[#3D4F70] uppercase tracking-[.2em] mb-3 ml-1">Monthly Threshold</p>
            <div className="glass-elevated border-white/5 rounded-[24px] p-1.5 focus-within:border-cyan-glow/30 transition-all shadow-glowSmall">
              <div className="flex items-center px-6">
                <span className="text-[#3D4F70] font-display font-bold text-[18px] mr-3">{CURRENCIES.find(c => c.code === currency)?.symbol}</span>
                <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="0.00"
                  className="w-full py-4 bg-transparent outline-none text-[18px] font-display font-bold text-[#F0F4FF] placeholder-[#3D4F70]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 pb-12 pt-4 bg-gradient-to-t from-[#050B18] via-[#050B18] to-transparent">
        <motion.button 
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.97 }} 
          onClick={() => setStep(2)}
          className="w-full py-5 rounded-[24px] text-white text-[16px] font-display font-bold shadow-glowLg flex items-center justify-center gap-3 bg-gradient-to-br from-[#0066FF] to-[#00D4FF] uppercase tracking-widest"
        >
          Phase Finalization <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>,

    // Step 2: Lock setup
    <motion.div key="2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
      className="flex flex-col h-full bg-[#050B18]">
      <div className="pt-16 px-6 pb-6 flex-1 overflow-y-auto scrollbar-hide">
        <p className="text-[11px] font-display font-bold text-cyan-glow uppercase tracking-[.25em] mb-3">Protocol Set 03</p>
        <h2 className="text-[36px] font-display font-bold text-[#F0F4FF] mb-2 tracking-tighter leading-none">Security Gate</h2>
        <p className="text-[#7B8DB0] font-body font-medium mb-10 text-[15px]">Select your cryptographic entry point.</p>

        <div className="flex flex-col gap-4">
          {LOCK_OPTIONS.map(opt => (
            <motion.button key={opt.id} 
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }} 
              onClick={() => setLockType(opt.id)}
              className={`flex items-center gap-5 p-5 rounded-[28px] border-2 text-left transition-all relative overflow-hidden group ${
                lockType === opt.id ? 'border-cyan-glow/40 glass-accent shadow-glow' : 'border-white/5 glass hover:bg-white/5'
              }`}>
              {lockType === opt.id && <div className="absolute inset-0 bg-cyan-glow/5 animate-pulse pointer-events-none" />}
              <div className="w-16 h-16 rounded-2xl glass-elevated flex items-center justify-center text-3xl shadow-inner relative z-10">
                {opt.emoji}
              </div>
              <div className="flex-1 relative z-10">
                <p className="font-display font-bold text-[#F0F4FF] text-[17px] tracking-tight">{opt.label}</p>
                <p className="text-[13px] font-body font-medium text-[#7B8DB0] mt-0.5">{opt.desc}</p>
              </div>
              {opt.recommended && (
                <span className="text-[10px] bg-cyan-glow/20 border border-cyan-glow/30 text-cyan-glow px-2.5 py-1 rounded-full font-display font-bold tracking-widest relative z-10">BEST</span>
              )}
              {lockType === opt.id && <div className="w-6 h-6 rounded-full bg-cyan-glow flex items-center justify-center shadow-glow relative z-10"><Check className="w-4 h-4 text-white" /></div>}
            </motion.button>
          ))}
        </div>
      </div>
      <div className="px-6 pb-12 pt-4 bg-gradient-to-t from-[#050B18] via-[#050B18] to-transparent">
        <motion.button 
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.97 }} 
          onClick={finish}
          className="w-full py-5 rounded-[24px] text-white text-[16px] font-display font-bold shadow-glowLg flex items-center justify-center gap-3 bg-gradient-to-br from-[#0066FF] to-[#00D4FF] uppercase tracking-widest"
        >
          Initialize Filesystem 🎉
        </motion.button>
      </div>
    </motion.div>,
  ]

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-[#050B18]">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 z-[100] bg-white/5">
        <motion.div animate={{ width: `${((step + 1) / 3) * 100}%` }} className="h-full bg-cyan-glow shadow-glow" />
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
