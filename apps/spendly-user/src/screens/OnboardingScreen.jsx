<<<<<<< HEAD
// Onboarding — Premium White Experience
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useSettingsStore } from '../store/settingsStore'
import { useExpenseStore } from '../store/expenseStore'
import { settingsService } from '../services/database'
import { CATEGORIES, getCategoryById } from '../constants/categories'
import { 
  ChevronRight, 
  Zap, 
  Sparkles, 
  Smile, 
  ShieldCheck, 
  Clock, 
  Smartphone,
  Wallet,
  ArrowRight,
  User
} from 'lucide-react'
import QuickKeypad from '../components/forms/QuickKeypad'

export default function OnboardingScreen() {
  const navigate = useNavigate()
  const { loadSettings, completeOnboarding } = useSettingsStore()
  const { addExpense } = useExpenseStore()
  
  const [step, setStep] = useState(0) 
  const [slideIndex, setSlideIndex] = useState(0)
  const [amountStr, setAmountStr] = useState('0')
  const [category, setCategory] = useState('food')
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('USD')

  const S = { fontFamily: "'Inter', sans-serif" }

  const INTRO_SLIDES = [
    {
      title: "Fastest Tracker",
      subtitle: "Add any expense in under 5 seconds. Literally.",
      icon: Zap,
      color: "#7C3AED",
      bg: "#F5F3FF"
    },
    {
      title: "Smart Insights",
      subtitle: "Beautiful reports that help you save more.",
      icon: Sparkles,
      color: "#059669",
      bg: "#ECFDF5"
    },
    {
      title: "Privacy First",
      subtitle: "All your data stays on your device. Securely.",
      icon: ShieldCheck,
      color: "#2563EB",
      bg: "#EFF6FF"
    }
  ]

  const handleTrialSave = async () => {
    const amount = parseFloat(amountStr)
    if (amount > 0) {
      await addExpense({
        type: 'spent', amount, currency, category,
        shopName: getCategoryById(category).name,
        date: new Date().toISOString(), paymentMethod: 'Cash'
      })
      setStep(2)
=======
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  ChevronLeft, 
  Search, 
  Check, 
  Shield, 
  Database, 
  Zap,
  Fingerprint,
  Loader2,
  AlertCircle,
  Lock
} from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'
import { useLockStore } from '../store/lockStore'
import { CATEGORIES } from '../constants/categories'
import { hashPin, generateSalt } from '../utils/crypto'
import { checkBiometricSupport, registerBiometric } from '../services/biometricAuth'
import confetti from 'canvas-confetti'

// Popular currencies with flags
const CURRENCIES = [
  { code: 'USD', name: 'United States Dollar', flag: '🇺🇸' },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
]

const S = { fontFamily: "'Inter', sans-serif" }

export default function OnboardingScreen() {
  const navigate = useNavigate()
  const { updateSetting, completeOnboarding } = useSettingsStore()
  const { setupLock } = useLockStore()
  
  // Persistent step tracking
  const [step, setStep] = useState(() => {
    return parseInt(localStorage.getItem('spendly_onboarding_step')) || 1
  })
  const [direction, setDirection] = useState(1)
  
  // State for onboarding data - loading from localStorage if exists
  const [name, setName] = useState(() => localStorage.getItem('spendly_onboarding_name') || '')
  const [currency, setCurrency] = useState(() => localStorage.getItem('spendly_onboarding_currency') || 'USD')
  const [budget, setBudget] = useState(() => localStorage.getItem('spendly_onboarding_budget') || '2000')
  const [selectedCategories, setSelectedCategories] = useState(() => {
    const saved = localStorage.getItem('spendly_onboarding_categories')
    return saved ? JSON.parse(saved) : []
  })
  const [searchQuery, setSearchQuery] = useState('')

  // State for Step 5 Lock Setup
  const [lockSubStep, setLockSubStep] = useState('select') // select, scanning, pin, confirm, success
  const [availableMethods, setAvailableMethods] = useState([])
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [tempPin, setTempPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const [isBiometricLoading, setIsBiometricLoading] = useState(false)
  const [biometricError, setBiometricError] = useState(null)

  // Sync state to localStorage for resume
  useEffect(() => {
    localStorage.setItem('spendly_onboarding_step', step.toString())
    localStorage.setItem('spendly_onboarding_name', name)
    localStorage.setItem('spendly_onboarding_currency', currency)
    localStorage.setItem('spendly_onboarding_budget', budget)
    localStorage.setItem('spendly_onboarding_categories', JSON.stringify(selectedCategories))
  }, [step, name, currency, budget, selectedCategories])

  // Biometric detection
  useEffect(() => {
    const initBiometrics = async () => {
      const support = await checkBiometricSupport()
      const methods = []
      
      if (support.biometricAvailable) {
        methods.push({ id: 'faceid', title: 'Face ID', subtitle: 'Face recognition setup', icon: Shield, recommended: true })
        methods.push({ id: 'fingerprint', title: 'Fingerprint', subtitle: 'Secure touch unlock', icon: Fingerprint })
      }
      
      methods.push({ id: 'pin', title: '4-Digit PIN', subtitle: 'Works on all devices', icon: Lock })
      setAvailableMethods(methods)
      setSelectedMethod(methods[0].id)
>>>>>>> 41f113d (upgrade scanner)
    }
    initBiometrics()
  }, [])

  const handleNext = () => {
    setDirection(1)
    setStep(s => s + 1)
  }

<<<<<<< HEAD
  const finalize = async () => {
    await settingsService.update({
      profileName: name || 'User',
      currency,
      onboardingDone: true
    })
    await loadSettings()
    completeOnboarding()
    navigate('/')
  }

  const slide = INTRO_SLIDES[slideIndex]

  return (
    <div className="h-dvh flex flex-col bg-white overflow-hidden select-none" style={S}>
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col px-8 pt-20 pb-12"
          >
            <div className="flex gap-2 mb-12">
               {INTRO_SLIDES.map((_, i) => (
                 <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === slideIndex ? 'w-12 bg-black' : 'w-4 bg-slate-100'}`} />
               ))}
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <motion.div
                key={slideIndex}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
              >
                <div 
                  className="w-24 h-24 rounded-[32px] flex items-center justify-center mb-10 shadow-xl"
                  style={{ backgroundColor: slide.bg, color: slide.color }}
                >
                  <slide.icon className="w-12 h-12" />
                </div>
                
                <h1 className="text-[40px] font-[900] text-black tracking-tight leading-[1.1] mb-6">
                  {slide.title}
                </h1>
                <p className="text-[18px] font-[500] text-[#64748B] leading-relaxed max-w-[280px]">
                  {slide.subtitle}
                </p>
              </motion.div>
            </div>

            <button 
              onClick={() => slideIndex < 2 ? setSlideIndex(v => v + 1) : setStep(1)}
              className="w-full h-20 rounded-[28px] bg-black text-white text-[19px] font-[800] flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-transform"
            >
              {slideIndex === 2 ? "Get Started" : "Continue"}
              <ArrowRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div 
            key="trial"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="flex-1 flex flex-col bg-white"
          >
            <div className="px-8 pt-10 pb-6 flex items-center justify-between">
              <div>
                <h2 className="text-[24px] font-[900] text-black tracking-tight">Try it now</h2>
                <p className="text-[14px] font-[600] text-[#64748B]">Add a practice expense</p>
              </div>
              <div className="px-4 py-2 bg-amber-50 rounded-full flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-[12px] font-[800] text-amber-700 uppercase tracking-wider">5s Magic</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-8">
              <div className="flex items-baseline gap-2 mb-12">
                <span className="text-[32px] font-[900] text-black/20">$</span>
                <motion.span 
                  key={amountStr}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-[84px] font-[900] text-black tracking-tighter"
                >
                  {amountStr}
                </motion.span>
              </div>

              <div className="grid grid-cols-4 gap-4 w-full mb-8">
                {CATEGORIES.slice(0, 4).map(cat => (
                  <motion.button 
                    key={cat.id} 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center gap-3 p-5 rounded-[24px] border-2 transition-all ${
                      category === cat.id 
                      ? 'bg-black border-black text-white shadow-xl translate-y-[-4px]' 
                      : 'bg-[#F8FAFC] border-transparent text-[#64748B]'
                    }`}
                  >
                    <span className="text-3xl">{cat.emoji}</span>
                    <span className="text-[11px] font-[800] uppercase tracking-wider text-center">{cat.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <QuickKeypad 
              amount={amountStr} 
              onType={(v) => v === '.' ? (amountStr.includes('.') ? null : setAmountStr(amountStr + '.')) : setAmountStr(amountStr === '0' ? v : amountStr + v)} 
              onDelete={() => setAmountStr(amountStr.length <= 1 ? '0' : amountStr.slice(0, -1))} 
              onSave={handleTrialSave} 
            />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col px-8 pt-20 pb-12"
          >
            <div className="w-20 h-20 bg-emerald-50 rounded-[28px] flex items-center justify-center mb-8">
              <Smile className="w-12 h-12 text-emerald-500" />
            </div>
            
            <h2 className="text-[36px] font-[900] text-black tracking-tight leading-tight mb-4">Almost there! 🎉</h2>
            <p className="text-[17px] font-[500] text-[#64748B] mb-12">Help us personalize your experience.</p>
            
            <div className="space-y-10 flex-1">
              <div className="space-y-4">
                <label className="text-[12px] font-[900] text-black uppercase tracking-[0.2em] ml-2">Display Name</label>
                <div className="relative group">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[#94A3B8] group-focus-within:text-black transition-colors" />
                  <input 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Enter your name"
                    className="w-full h-20 pl-16 pr-8 rounded-[28px] bg-[#F8FAFC] text-[20px] font-[700] outline-none border-2 border-transparent focus:border-black focus:bg-white transition-all transition-all" 
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="text-[12px] font-[900] text-black uppercase tracking-[0.2em] ml-2">Preferred Currency</label>
                <div className="grid grid-cols-3 gap-4">
                  {['USD', 'INR', 'EUR'].map(c => (
                    <button 
                      key={c} 
                      onClick={() => setCurrency(c)}
                      className={`h-16 rounded-[24px] font-[800] text-[16px] border-2 transition-all ${
                        currency === c 
                        ? 'bg-black text-white border-black shadow-lg translate-y-[-2px]' 
                        : 'bg-[#F8FAFC] border-transparent text-[#94A3B8]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={finalize} 
              className="w-full h-20 rounded-[28px] bg-black text-white text-[19px] font-[800] shadow-2xl"
            >
              Start Spending
            </button>
          </motion.div>
        )}
      </AnimatePresence>
=======
  const handleBack = () => {
    if (lockSubStep === 'confirm') { setLockSubStep('pin'); return; }
    if (lockSubStep === 'pin' || lockSubStep === 'scanning') { setLockSubStep('select'); return; }
    setDirection(-1)
    setStep(s => s - 1)
  }

  const finalize = async (finalPinHash, salt) => {
    await updateSetting({
      name,
      currency,
      monthlyBudget: parseFloat(budget) || 2000,
      onboardingDone: true,
      theme: 'light'
    })
    
    await setupLock({
      type: selectedMethod,
      biometricEnabled: selectedMethod !== 'pin',
      pinHash: finalPinHash,
      salt: salt
    })

    // Clear temp storage
    const keys = ['spendly_onboarding_step', 'spendly_onboarding_name', 'spendly_onboarding_currency', 'spendly_onboarding_budget', 'spendly_onboarding_categories']
    keys.forEach(k => localStorage.removeItem(k))

    setLockSubStep('success')
    
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#000000', '#000000', '#FFFFFF'],
      zIndex: 2000
    })

    setTimeout(() => { 
      completeOnboarding()
      navigate('/') 
    }, 2500)
  }

  const slideVariants = {
    initial: (dir) => ({ x: dir > 0 ? '100vw' : '-100vw', opacity: 0 }),
    animate: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? '-100vw' : '100vw', opacity: 0 }),
  }

  return (
    <div className={`fixed inset-0 h-dvh bg-white flex flex-col z-[1000] max-w-[430px] mx-auto overflow-hidden ${lockSubStep === 'scanning' ? 'bg-[#0F0F1A]' : ''}`} style={S}>
      {/* Top Header */}
      {lockSubStep !== 'scanning' && lockSubStep !== 'success' && (
        <div className="flex-none pt-10 px-6 pb-4 flex items-center justify-between bg-white relative z-20">
          {step > 1 ? (
            <button onClick={handleBack} className="w-10 h-10 rounded-full bg-[#F6F6F6] flex items-center justify-center border border-[#EEEEEE] active:scale-90 transition-transform">
              <ChevronLeft className="w-6 h-6 text-black" />
            </button>
          ) : <div className="w-10" />}
          
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(dot => (
              <div 
                key={dot} 
                className={`h-1.5 rounded-full transition-all duration-300 ${dot === step ? 'w-6 bg-[#000000]' : (dot < step ? 'w-2 bg-[#000000]/30' : 'w-2 bg-[#EEEEEE]')}`} 
              />
            ))}
          </div>
          <div className="w-10" />
        </div>
      )}

      {/* Screens Flow */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`${step}-${lockSubStep}`}
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 px-7 flex flex-col"
          >
            {step === 1 && <ScreenWelcome onNext={handleNext} />}
            {step === 2 && (
              <ScreenPersonal 
                name={name} setName={setName} currency={currency} setCurrency={setCurrency} 
                searchQuery={searchQuery} setSearchQuery={setSearchQuery} onNext={handleNext} 
              />
            )}
            {step === 3 && (
              <ScreenBudget 
                budget={budget} setBudget={setBudget} currency={currency}
                onNext={handleNext} onSkip={() => { setBudget('2000'); handleNext(); }}
              />
            )}
            {step === 4 && (
              <ScreenCategories selected={selectedCategories} setSelected={setSelectedCategories} onNext={handleNext} />
            )}
            {step === 5 && (
              <ScreenLock 
                subStep={lockSubStep} setSubStep={setLockSubStep}
                availableMethods={availableMethods} selectedMethod={selectedMethod} setSelectedMethod={setSelectedMethod}
                tempPin={tempPin} setTempPin={setTempPin}
                confirmPin={confirmPin} setConfirmPin={setConfirmPin}
                error={pinError} setError={setPinError}
                isBiometricLoading={isBiometricLoading} setIsBiometricLoading={setIsBiometricLoading}
                biometricError={biometricError} setBiometricError={setBiometricError}
                finalize={finalize}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
>>>>>>> 41f113d (upgrade scanner)
    </div>
  )
}

function ScreenWelcome({ onNext }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-700 bg-white">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="w-40 h-40 bg-white rounded-[44px] flex items-center justify-center mb-12"
      >
        <img src="/spendly-logo.png" className="w-28 h-28 object-contain" alt="Spendly" />
      </motion.div>
      <h1 className="text-[38px] font-[900] text-black tracking-tighter leading-tight mb-4">Your money.<br />Your privacy.</h1>
      <p className="text-[16px] font-[500] text-[#545454] leading-relaxed mb-10">No account. No cloud. Just you.</p>
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <FeaturePill icon={Shield} label="Zero knowledge" />
        <FeaturePill icon={Database} label="100% offline" />
        <FeaturePill icon={Zap} label="Under 5 seconds" />
      </div>
      <div className="mt-auto w-full pb-16">
        <PrimaryButton onClick={onNext} label="Get Started" />
      </div>
    </div>
  )
}

function ScreenPersonal({ name, setName, currency, setCurrency, searchQuery, setSearchQuery, onNext }) {
  const inputRef = useRef(null)
  useEffect(() => { inputRef.current?.focus() }, [])
  const filteredCurrencies = CURRENCIES.filter(c => 
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  return (
    <div className="flex-1 flex flex-col pt-1 overflow-hidden bg-white">
      <h2 className="text-[26px] font-[900] text-black tracking-tight mb-6 flex-none px-1">Let's set you up</h2>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="space-y-4 flex-none">
          <label className="text-[10px] font-[800] text-[#AFAFAF] uppercase tracking-[0.1em] ml-2">What's your name?</label>
          <input 
            ref={inputRef} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe"
            inputMode="text" autoCapitalize="words" autoCorrect="off"
            className="w-full py-4.5 px-6 rounded-[24px] bg-[#F6F6F6] border border-[#EEEEEE] text-[18px] font-[700] text-black placeholder:text-[#CBD5E1]/40 outline-none focus:border-[#000000] transition-all px-1" />
        </div>
        
        <div className="mt-6 flex-1 flex flex-col min-h-0">
          <label className="text-[10px] font-[800] text-[#AFAFAF] uppercase tracking-[0.1em] ml-2 flex-none">Currency</label>
          <div className="relative mt-3 flex-none">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#AFAFAF]" />
            <input 
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search currency..."
              className="w-full py-4 pl-12 pr-6 rounded-[20px] bg-[#F6F6F6] border border-[#EEEEEE] text-[15px] font-[600] text-black outline-none focus:border-[#000000]" />
          </div>
          <div className="mt-4 flex-1 overflow-y-auto scrollbar-hide space-y-2 pr-1 overscroll-contain pb-6">
            {filteredCurrencies.map(c => (
              <button key={c.code} onClick={() => { setCurrency(c.code); navigator.vibrate?.(5); }}
                className={`w-full p-5 rounded-[24px] flex items-center justify-between border transition-all active:scale-[0.98] ${currency === c.code ? 'bg-[#000000]/5 border-[#000000]' : 'bg-white border-[#EEEEEE]'}`}>
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{c.flag}</span>
                  <div className="text-left"><p className="text-[15px] font-[800] text-black leading-none mb-1">{c.code}</p><p className="text-[12px] font-[500] text-[#545454] leading-none">{c.name}</p></div>
                </div>
                {currency === c.code && <Check className="w-5 h-5 text-[#000000]" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-none pt-4 pb-4 bg-white">
        <PrimaryButton onClick={onNext} label="Continue" disabled={!name} />
      </div>
    </div>
  )
}

function ScreenBudget({ budget, setBudget, currency, onNext, onSkip }) {
  const handlePress = (num) => {
    navigator.vibrate?.(5)
    if (num === 'back') { setBudget(budget.length <= 1 ? '0' : budget.slice(0, -1)); return; }
    if (budget === '0') { setBudget(num.toString()); return; }
    if (budget.length >= 7) return;
    setBudget(budget + num)
  }
  return (
    <div className="flex-1 flex flex-col pt-2 bg-white text-center selection:bg-none">
      <div className="flex-none pt-4">
        <h2 className="text-[30px] font-[900] text-black tracking-tight mb-1">Monthly budget</h2>
        <p className="text-[14px] font-[500] text-[#545454] mb-4">You can always change this later</p>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex items-baseline gap-2 mb-2">
            <span className="text-[18px] font-[800] text-black uppercase tracking-widest">{currency}</span>
            <motion.div key={budget} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="text-[64px] font-[900] text-black tracking-tighter" style={{ fontFamily:"'Inter', sans-serif" }}>
              {budget}
            </motion.div>
        </div>
        <div className="h-1.5 w-14 bg-black rounded-full mb-8 shadow-sm" />
        
        <div className="grid grid-cols-3 gap-x-10 gap-y-4 w-full max-w-[280px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'back'].map((num, i) => (
            <button key={i} onClick={() => num !== '' && handlePress(num)} 
              className="h-14 flex items-center justify-center text-[24px] font-[800] text-black active:scale-90 active:bg-black/5 rounded-2xl transition-all">
              {num === 'back' ? <ChevronLeft className="w-8 h-8 rotate-180" strokeWidth={3} /> : num}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-none pt-6 pb-8 safe-bottom flex flex-col gap-4 px-2">
        <PrimaryButton onClick={onNext} label="Set Budget" />
        <button onClick={onSkip} className="py-2 text-[13px] font-[800] text-[#94A3B8] uppercase tracking-widest active:scale-95 transition-transform hover:text-black">
          Skip for now
        </button>
      </div>
    </div>
  )
}

function ScreenCategories({ selected, setSelected, onNext }) {
  const toggle = (id) => {
    navigator.vibrate?.(5)
    if (selected.includes(id)) setSelected(selected.filter(i => i !== id))
    else setSelected([...selected, id])
  }
  return (
    <div className="flex-1 flex flex-col pt-4 overflow-hidden bg-white">
      <h2 className="text-[32px] font-[900] text-black tracking-tight mb-2 flex-none">Spending areas</h2>
      <p className="text-[15px] font-[500] text-[#545454] mb-8 flex-none">Pick at least 3 categories</p>
      <div className="flex-1 overflow-y-auto scrollbar-hide grid grid-cols-2 gap-4 pb-10 overscroll-contain pr-1">
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => toggle(c.id)}
            className={`p-5 rounded-[28px] border-2 flex flex-col items-start gap-3 transition-all active:scale-[0.98] ${selected.includes(c.id) ? 'bg-[#000000] border-[#000000] text-white' : 'bg-[#F6F6F6] border-[#EEEEEE] text-[#545454]'}`}>
            <span className="text-3xl">{c.emoji}</span>
            <span className={`text-[13px] font-[800] uppercase tracking-wider ${selected.includes(c.id) ? 'text-white' : 'text-black'}`}>{c.label || c.name}</span>
          </button>
        ))}
      </div>
      <div className="flex-none pt-4 pb-4 bg-white">
        <PrimaryButton onClick={onNext} label="Continue" disabled={selected.length < 3} />
      </div>
    </div>
  )
}

function ScreenLock({ subStep, setSubStep, availableMethods, selectedMethod, setSelectedMethod, tempPin, setTempPin, confirmPin, setConfirmPin, error, setError, isBiometricLoading, setIsBiometricLoading, biometricError, setBiometricError, finalize }) {
  const handleSelection = async () => {
    navigator.vibrate?.(10)
    if (selectedMethod === 'faceid' || selectedMethod === 'fingerprint') {
      setSubStep('scanning')
      setIsBiometricLoading(true)
      
      const res = await registerBiometric(localStorage.getItem('spendly_onboarding_name') || 'User')
      
      if (res.success) {
        navigator.vibrate?.([100, 50, 100])
        setSubStep('bio_success')
        setTimeout(() => {
          setSubStep('pin')
          setIsBiometricLoading(false)
        }, 2000)
      } else {
        setBiometricError("Hardware setup failed. Using PIN fallback.")
        setTimeout(() => {
          setSubStep('pin')
          setIsBiometricLoading(false)
          setSelectedMethod('pin')
        }, 2000)
      }
    } else {
      setSubStep('pin')
    }
  }

  const handlePinInput = async (val, isConfirm = false) => {
    navigator.vibrate?.(10)
    const current = isConfirm ? confirmPin : tempPin
    if (val === 'back') { isConfirm ? setConfirmPin(current.slice(0, -1)) : setTempPin(current.slice(0, -1)); return; }
    if (current.length >= 4) return
    const next = current + val
    isConfirm ? setConfirmPin(next) : setTempPin(next)
    if (next.length === 4) {
      if (isConfirm) {
        if (next === tempPin) {
          setIsBiometricLoading(true)
          const salt = generateSalt()
          const hash = await hashPin(next, salt)
          finalize(hash, salt)
        } else {
          setError(true)
          navigator.vibrate?.([50, 50, 50])
          setTimeout(() => { setConfirmPin(''); setError(false); }, 1000)
        }
      } else { setTimeout(() => setSubStep('confirm'), 400) }
    }
  }


  if (subStep === 'select') {
    return (
      <div className="flex-1 flex flex-col pt-4 bg-white">
        <h2 className="text-[32px] font-[900] text-black tracking-tight mb-2">Lock Spendly</h2>
        <p className="text-[15px] font-[500] text-[#545454] mb-10">Keep your expenses private</p>
        <div className="space-y-4 flex-1 overflow-y-auto scrollbar-hide">
          {availableMethods.map(m => (
            <button key={m.id} onClick={() => { setSelectedMethod(m.id); navigator.vibrate?.(5); }}
              className={`w-full p-6 rounded-[28px] border-2 flex items-center justify-between transition-all active:scale-[0.99] ${selectedMethod === m.id ? 'bg-[#000000]/5 border-[#000000]' : 'bg-white border-[#EEEEEE]'}`}>
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedMethod === m.id ? 'bg-[#000000] text-white' : 'bg-[#F6F6F6] text-black'}`}><m.icon className="w-6 h-6" /></div>
                <div className="text-left">
                  <div className="flex items-center gap-2"><p className="text-[16px] font-[800] text-black">{m.title}</p>{m.recommended && <span className="text-[8px] font-[900] bg-[#000000] text-white px-2 py-0.5 rounded-full uppercase">Recommended</span>}</div>
                  <p className="text-[12px] font-[500] text-[#AFAFAF]">{m.subtitle}</p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === m.id ? 'border-[#000000]' : 'border-[#EEEEEE]'}`}>
                {selectedMethod === m.id && <div className="w-3 h-3 bg-[#000000] rounded-full" />}
              </div>
            </button>
          ))}
        </div>
        <div className="mt-auto w-full pb-4 pt-4"><PrimaryButton onClick={handleSelection} label="Set Up Lock" /></div>
      </div>
    )
  }

  if (subStep === 'scanning') {
    return (
      <div className="fixed inset-0 z-[1100] bg-black flex flex-col items-center justify-center px-10">
        <div className="relative w-64 h-64 flex items-center justify-center mb-16">
          {/* Dotted Oval Face Outline */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <ellipse cx="50" cy="50" rx="35" ry="45" fill="none" stroke="#000000" strokeWidth="0.5" strokeDasharray="2 2" className="opacity-30" />
            <motion.ellipse 
              cx="50" cy="50" rx="35" ry="45" fill="none" stroke="#000000" strokeWidth="1" strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0.2 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </svg>
          
          {/* Scanning Line */}
          <motion.div 
            className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#000000] to-transparent absolute z-10"
            animate={{ top: ['15%', '85%', '15%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Glowing Aura Pulse */}
          <motion.div 
            className="absolute inset-4 rounded-full bg-[#000000]/10 blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          <Shield className="w-20 h-20 text-[#000000] opacity-80" strokeWidth={1} />
        </div>
        
        <h2 className="text-white text-[28px] font-[900] tracking-tight mb-4 text-center leading-tight">Look at your camera</h2>
        <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10">
          <Loader2 className="w-4 h-4 text-[#000000] animate-spin" />
          <p className="text-white/60 text-[14px] font-[600]">
            Verifying {selectedMethod === 'faceid' ? 'Identity' : 'Fingerprint'}...
          </p>
        </div>
        
        {biometricError && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-red-400 text-[13px] font-[700] text-center max-w-[240px]">
            {biometricError}
          </motion.div>
        )}
      </div>
    )
  }

  if (subStep === 'bio_success') {
    return (
      <div className="fixed inset-0 z-[1200] bg-white flex flex-col items-center justify-center px-10 animate-in zoom-in duration-500">
        <div className="w-32 h-32 bg-[#000000] rounded-[40px] flex items-center justify-center mb-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12, stiffness: 200 }}>
            <Check className="w-16 h-16 text-white" strokeWidth={4} />
          </motion.div>
        </div>
        <h1 className="text-[32px] font-[900] text-black tracking-tighter mb-4 text-center">
          {selectedMethod === 'faceid' ? 'Face ID Activated!' : 'Fingerprint Activated!'}
        </h1>
        <p className="text-[16px] font-[500] text-[#545454] text-center">Your biometric secure identity is ready</p>
      </div>
    )
  }

  if (subStep === 'pin' || subStep === 'confirm') {
    const pins = subStep === 'pin' ? tempPin : confirmPin
    return (
      <div className="flex-1 flex flex-col pt-4 bg-white text-center">
        <h2 className="text-[32px] font-[900] text-black tracking-tight mb-2">{subStep === 'pin' ? 'Create your PIN' : 'Confirm your PIN'}</h2>
        <p className="text-[15px] font-[500] text-[#545454] mb-12">{subStep === 'pin' ? 'Used as a backup to biometric lock' : 'Enter your PIN again to verify'}</p>
        <div className="flex-1 flex flex-col items-center justify-center -mt-20">
          <motion.div animate={error ? { x: [-10, 10, -10, 10, 0] } : {}} className="flex gap-6 mb-16">
            {[1, 2, 3, 4].map(i => (<div key={i} className={`w-4 h-4 rounded-full transition-all duration-300 ${pins.length >= i ? 'bg-[#000000] scale-125' : 'bg-[#EEEEEE]'}`} />))}
          </motion.div>
          <div className="grid grid-cols-3 gap-x-12 gap-y-8 w-full max-w-[320px]">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'back'].map((num, i) => (
              <button key={i} onClick={() => num !== '' && handlePinInput(num, subStep === 'confirm')}
                className="h-16 flex items-center justify-center text-[32px] font-[800] text-black active:scale-95 transition-transform active:bg-[#F6F6F6] rounded-full">
                {num === 'back' ? <ChevronLeft className="w-8 h-8 rotate-180" /> : num}
              </button>
            ))}
          </div>
        </div>
        {(error || isBiometricLoading) && (
          <div className="mt-auto pb-16 text-center">
            {isBiometricLoading && <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#000000]" />}
            {error && <p className="text-red-500 font-[800] text-[13px] uppercase tracking-widest">PINs don't match. Try again.</p>}
          </div>
        )}
      </div>
    )
  }

  if (subStep === 'success') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500 bg-white">
        <div className="w-32 h-32 bg-black rounded-[40px] flex items-center justify-center mb-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }}>
            <Lock className="w-16 h-16 text-white" strokeWidth={2.5} />
          </motion.div>
        </div>
        <h1 className="text-[36px] font-[900] text-black tracking-tighter mb-4">You're all set!</h1>
        <p className="text-[16px] font-[500] text-[#545454] leading-relaxed">Spendly is now private & secure</p>
      </div>
    )
  }

  return null
}

function FeaturePill({ icon: Icon, label }) {
  return (
    <div className="px-5 py-2.5 rounded-full bg-[#F6F6F6] border border-[#EEEEEE] flex items-center gap-2">
      <Icon className="w-4 h-4 text-black" />
      <span className="text-[11px] font-[800] text-black uppercase tracking-wider">{label}</span>
    </div>
  )
}

function PrimaryButton({ onClick, label, disabled }) {
  return (
    <motion.button whileTap={!disabled ? { scale: 0.98 } : {}} onClick={!disabled ? onClick : undefined}
      className={`w-full py-5 rounded-[28px] text-[17px] font-[800] transition-all ${disabled ? 'bg-[#F6F6F6] text-[#AFAFAF]' : 'bg-black text-white'}`}>{label}</motion.button>
  )
}
