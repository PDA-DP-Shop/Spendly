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
    }
  }

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
    </div>
  )
}
