import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
<<<<<<< HEAD
  ShoppingBag, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Store,
  Smartphone, 
  CreditCard, 
  Users, 
  Globe,
  Phone, 
  User, 
  Lock, 
  ArrowRight, 
  CheckCircle2,
  Terminal,
  QrCode
} from 'lucide-react';
import { useShopStore } from '../store/shopStore';

const CATEGORIES = [
  { id: 'food', name: 'Food & Dining', emoji: '🍔' },
  { id: 'coffee', name: 'Cafe & Coffee', emoji: '☕' },
  { id: 'grocery', name: 'Groceries', emoji: '🛒' },
  { id: 'travel', name: 'Travel & Taxi', emoji: '🚗' },
  { id: 'holiday', name: 'Holiday & Tours', emoji: '✈️' },
  { id: 'shopping', name: 'General Shop', emoji: '🛍️' },
  { id: 'clothes', name: 'Fashion & Wear', emoji: '👕' },
  { id: 'gifts', name: 'Gift Shop', emoji: '🎁' },
  { id: 'pets', name: 'Pet Care', emoji: '🐾' },
  { id: 'health', name: 'Pharmacy & Medical', emoji: '💊' },
  { id: 'bills', name: 'Utility Bills', emoji: '💡' },
  { id: 'rent', name: 'Rent & Living', emoji: '🏠' },
  { id: 'fun', name: 'Entertainment', emoji: '🎮' },
  { id: 'study', name: 'Education', emoji: '📚' },
  { id: 'tech', name: 'Tech & Gadgets', emoji: '💻' },
  { id: 'gym', name: 'Gym & Fitness', emoji: '💪' },
];

const ONBOARDING_SLIDES = [
    {
        title: "Smart Terminal",
        subtitle: "The fastest billing experience for modern shops.",
        icon: Terminal,
        color: "#7C3AED",
        bg: "#F5F3FF",
        features: [
            { t: '5s Billing', d: 'Create bills at lighting speed', i: '⚡' },
            { t: 'Offline Core', d: 'Works 100% without internet', i: '🔐' },
            { t: 'Free Forever', d: 'No monthly fees, zero cost', i: '💎' }
        ]
    },
    {
        title: "Paperless Flow",
        subtitle: "Dispatch digital receipts to customers instantly.",
        icon: QrCode,
        color: "#059669",
        bg: "#ECFDF5",
        features: [
            { t: 'QR Sync', d: 'Scan to pay and receive bill', i: '🧬' },
            { t: 'WhatsApp', d: 'Share bills via instant messaging', i: '📱' },
            { t: 'NFC Tap', d: 'Zero-touch data transfer', i: '🔗' }
        ]
    },
    {
        title: "Manage Clients",
        subtitle: "Keep track of regular clients and credit books.",
        icon: Users,
        color: "#2563EB",
        bg: "#EFF6FF",
        features: [
            { t: 'Credit Book', d: 'Track udhaar and payments', i: '📊' },
            { t: 'VIP Status', d: 'Identify your top customers', i: '👑' },
            { t: 'One-Tap Call', d: 'Reach clients in seconds', i: '💬' }
        ]
=======
  ChevronLeft, 
  Smartphone, 
  QrCode, 
  Hash, 
  MessageCircle,
  Shield, 
  Lock,
  Store,
  User,
  Check,
  Loader2,
  Fingerprint
} from 'lucide-react'
import { useShopStore } from '../store/shopStore'
import { useLockStore } from '../store/lockStore'
import { hashPin, generateSalt } from '../services/encryptData'
import { biometricAuth } from '../services/biometricAuth'
import { db } from '../db/db'
import confetti from 'canvas-confetti'

const SHOP_CATEGORIES = [
  { id: 'grocery', name: 'Grocery', emoji: '🛒' },
  { id: 'restaurant', name: 'Restaurant', emoji: '🍽️' },
  { id: 'clothing', name: 'Clothing', emoji: '👗' },
  { id: 'medical', name: 'Medical', emoji: '💊' },
  { id: 'electronics', name: 'Electronics', emoji: '📱' },
  { id: 'fuel', name: 'Fuel', emoji: '⛽' },
  { id: 'salon', name: 'Salon', emoji: '💇' },
  { id: 'general', name: 'General Store', emoji: '🏪' },
  { id: 'other', name: 'Other', emoji: '📦' },
]

const S = { fontFamily: "'Inter', sans-serif" }

export default function OnboardingScreen() {
  const navigate = useNavigate()
  const { saveShop } = useShopStore()
  const { setupLock } = useLockStore()
  
  // Persistent step tracking
  const [step, setStep] = useState(() => {
    return parseInt(localStorage.getItem('spendly_shop_onboarding_step')) || 1
  })
  const [direction, setDirection] = useState(1)
  
  // State for onboarding data
  const [shopName, setShopName] = useState(() => localStorage.getItem('spendly_shop_name') || '')
  const [ownerName, setOwnerName] = useState(() => localStorage.getItem('spendly_shop_owner') || '')
  const [category, setCategory] = useState(() => localStorage.getItem('spendly_shop_category') || '')
  const [upiId, setUpiId] = useState(() => localStorage.getItem('spendly_shop_upi') || '')

  // State for Step 4 Lock Setup
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
    localStorage.setItem('spendly_shop_onboarding_step', step.toString())
    localStorage.setItem('spendly_shop_name', shopName)
    localStorage.setItem('spendly_shop_owner', ownerName)
    localStorage.setItem('spendly_shop_category', category)
    localStorage.setItem('spendly_shop_upi', upiId)
  }, [step, shopName, ownerName, category, upiId])

  // Biometric detection
  useEffect(() => {
    const initBiometrics = async () => {
      const support = await biometricAuth.checkSupport()
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

<<<<<<< HEAD
const OnboardingScreen = () => {
    const [step, setStep] = useState(0); 
    const [slideIndex, setSlideIndex] = useState(0);
    const [formData, setFormData] = useState({
        name: '', ownerName: '', category: 'food', phone: '', upiId: '', gstNumber: '', lockType: 'pin4'
    });
    const navigate = useNavigate();
    const { saveShop } = useShopStore();

    const [catSearch, setCatSearch] = useState('');
    const filteredCats = CATEGORIES.filter(c => 
        c.name.toLowerCase().includes(catSearch.toLowerCase()) || 
        c.id.toLowerCase().includes(catSearch.toLowerCase())
    );

    const handleNextSlide = () => {
        if (slideIndex < ONBOARDING_SLIDES.length - 1) {
            setSlideIndex(prev => prev + 1);
        } else {
            setStep(1);
        }
    };

    const handleComplete = async () => {
        await saveShop({
            ...formData,
            createdAt: new Date().toISOString(),
            billPrefix: 'INV',
            startingBillNumber: 1,
            currency: 'INR',
            theme: 'light',
            logoEmoji: CATEGORIES.find(c => c.id === formData.category)?.emoji || '🏪'
        });
        setStep(4);
    };

    const currentSlide = ONBOARDING_SLIDES[slideIndex];
    const S = { fontFamily: "'Inter', sans-serif" };

    return (
        <div className="min-h-screen bg-white relative overflow-hidden flex flex-col font-sans select-none" style={S}>
            <AnimatePresence mode="wait">
                {step === 0 && (
                    <motion.div 
                        key="intro"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -30 }}
                        className="flex-grow flex flex-col p-8 pt-16"
                    >
                        <div className="flex gap-2 mb-12">
                            {ONBOARDING_SLIDES.map((_, i) => (
                                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ease-out ${i === slideIndex ? 'w-12 bg-black' : 'w-4 bg-[#F1F5F9]'}`} />
                            ))}
                        </div>

                        <div className="flex-grow flex flex-col justify-center">
                            <motion.div 
                                key={slideIndex}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                className="space-y-12"
                            >
                                <div className="space-y-8 text-center sm:text-left">
                                    <div 
                                      className="w-24 h-24 rounded-[32px] flex items-center justify-center relative mx-auto sm:mx-0 shadow-xl"
                                      style={{ backgroundColor: currentSlide.bg, color: currentSlide.color }}
                                    >
                                        <currentSlide.icon className="w-12 h-12" />
                                    </div>
                                    <div className="space-y-4">
                                        <h1 className="text-[44px] font-[900] text-black tracking-tight leading-[1.05]">
                                            {currentSlide.title}
                                        </h1>
                                        <p className="text-[18px] font-[500] text-[#64748B] leading-relaxed max-w-[320px] mx-auto sm:mx-0">
                                            {currentSlide.subtitle}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {currentSlide.features.map((f, i) => (
                                        <motion.div 
                                            key={i}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 + (i * 0.1) }}
                                            className="flex items-center gap-5 p-5 bg-[#F8FAFC] rounded-[28px] border-2 border-transparent"
                                        >
                                            <div className="w-14 h-14 bg-white rounded-[20px] flex items-center justify-center text-2xl shadow-sm">
                                                {f.i}
                                            </div>
                                            <div>
                                                <div className="text-[16px] font-[800] text-black leading-tight">{f.t}</div>
                                                <div className="text-[13px] font-[500] text-[#94A3B8] mt-1">{f.d}</div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        <div className="pt-10 pb-4">
                            <motion.button 
                                whileTap={{ scale: 0.96 }}
                                onClick={handleNextSlide}
                                className="w-full bg-black text-white h-20 rounded-[28px] font-[800] text-[19px] shadow-2xl flex items-center justify-center gap-3 active:bg-slate-900 transition-colors"
                            >
                                {slideIndex === ONBOARDING_SLIDES.length - 1 ? 'Start Setup' : 'Continue'}
                                <ArrowRight className="w-6 h-6" />
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {step === 1 && (
                    <motion.div 
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-grow flex flex-col p-8 pt-16"
                    >
                        <header className="mb-12">
                            <h2 className="text-[40px] font-[900] text-black tracking-tight leading-tight">Shop Info</h2>
                            <p className="text-[17px] font-[500] text-[#64748B] mt-2">Introduce your business to Spendly</p>
                        </header>

                        <div className="space-y-10 flex-grow">
                            <div className="space-y-4">
                                <label className="text-[12px] font-[900] text-black uppercase tracking-[0.2em] ml-2">Business Name</label>
                                <div className="bg-[#F8FAFC] border-2 border-transparent p-6 rounded-[28px] focus-within:bg-white focus-within:border-black focus-within:shadow-xl transition-all flex items-center gap-5">
                                    <Store className="w-8 h-8 text-[#94A3B8]" strokeWidth={2.5} />
                                    <input 
                                        className="w-full bg-transparent outline-none font-[700] text-black text-[20px] placeholder:text-[#CBD5E1]"
                                        placeholder="e.g. Blue Bottle Coffee"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[12px] font-[900] text-black uppercase tracking-[0.2em] ml-2">Contact Number</label>
                                <div className="bg-[#F8FAFC] border-2 border-transparent p-6 rounded-[28px] focus-within:bg-white focus-within:border-black focus-within:shadow-xl transition-all flex items-center gap-5">
                                    <Phone className="w-8 h-8 text-[#94A3B8]" strokeWidth={2.5} />
                                    <input 
                                        className="w-full bg-transparent outline-none font-[700] text-black text-[20px] placeholder:text-[#CBD5E1]"
                                        placeholder="+91 91XXX XXXX0"
                                        value={formData.phone}
                                        onChange={e => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <label className="text-[12px] font-[900] text-black uppercase tracking-[0.2em] ml-2">UPI ID (Optional)</label>
                                <div className="bg-[#F8FAFC] border-2 border-transparent p-6 rounded-[28px] focus-within:bg-white focus-within:border-black focus-within:shadow-xl transition-all flex items-center gap-5">
                                    <CreditCard className="w-8 h-8 text-[#94A3B8]" strokeWidth={2.5} />
                                    <input 
                                        className="w-full bg-transparent outline-none font-[700] text-black text-[20px] placeholder:text-[#CBD5E1]"
                                        placeholder="merchant@okupi"
                                        value={formData.upiId}
                                        onChange={e => setFormData({...formData, upiId: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 pb-4">
                            <motion.button 
                                whileTap={{ scale: 0.96 }}
                                disabled={!formData.name || !formData.phone}
                                onClick={() => setStep(2)}
                                className={`w-full h-20 rounded-[28px] font-[800] text-[19px] flex items-center justify-center gap-3 shadow-2xl transition-all ${
                                    formData.name && formData.phone 
                                    ? 'bg-black text-white' 
                                    : 'bg-[#F1F5F9] text-[#CBD5E1] cursor-not-allowed border-2 border-transparent'
                                }`}
                            >
                                Continue <ChevronRight className="w-6 h-6" />
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div 
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-grow flex flex-col p-8 pt-16"
                    >
                        <header className="mb-10">
                            <h2 className="text-[40px] font-[900] text-black tracking-tight leading-tight">Category</h2>
                            <p className="text-[17px] font-[500] text-[#64748B] mt-2">What kind of business is this?</p>
                        </header>

                        <div className="space-y-6 flex-grow overflow-hidden flex flex-col">
                            <div className="relative">
                                <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[#94A3B8]" />
                                <input 
                                    className="w-full bg-[#F8FAFC] border-2 border-transparent p-6 pl-16 rounded-[28px] outline-none font-[700] text-black text-[18px] placeholder:text-[#CBD5E1] transition-all focus:bg-white focus:border-black shadow-sm"
                                    placeholder="Search categories..."
                                    value={catSearch}
                                    onChange={e => setCatSearch(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-1 flex-1">
                                {filteredCats.map(cat => (
                                    <motion.button
                                        key={cat.id}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setFormData({...formData, category: cat.id})}
                                        className={`flex flex-col items-center gap-4 p-6 rounded-[28px] border-2 transition-all ${
                                            formData.category === cat.id 
                                            ? 'bg-black border-black text-white shadow-xl translate-y-[-2px]' 
                                            : 'bg-[#F8FAFC] border-transparent text-[#64748B]'
                                        }`}
                                    >
                                        <span className="text-[36px]">{cat.emoji}</span>
                                        <span className="text-[13px] font-[800] tracking-tight text-center">{cat.name}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-8 pb-4">
                            <motion.button 
                                whileTap={{ scale: 0.96 }}
                                onClick={() => setStep(3)}
                                className="w-full h-20 bg-black text-white rounded-[28px] font-[800] text-[19px] shadow-2xl flex items-center justify-center gap-3"
                            >
                                Continue <ChevronRight className="w-6 h-6" />
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div 
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-grow flex flex-col p-8 pt-16"
                    >
                        <header className="mb-12">
                            <h2 className="text-[40px] font-[900] text-black tracking-tight leading-tight">Security</h2>
                            <p className="text-[17px] font-[500] text-[#64748B] mt-2">Protect your business data</p>
                        </header>

                        <div className="space-y-4 flex-grow">
                            {[
                                { id: 'pin4', name: '4-Digit PIN', i: ShieldCheck, d: 'Standard secure access' },
                                { id: 'pin6', name: '6-Digit PIN', i: Lock, d: 'Maximum protection' },
                                { id: 'biometric', name: 'Biometrics', i: Smartphone, d: 'Unlock with Face / Touch ID' }
                            ].map(opt => (
                                <motion.button
                                    key={opt.id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setFormData({...formData, lockType: opt.id})}
                                    className={`w-full flex items-center justify-between p-7 rounded-[32px] border-2 transition-all ${
                                        formData.lockType === opt.id
                                        ? 'border-black bg-black text-white shadow-2xl'
                                        : 'border-transparent bg-[#F8FAFC] text-[#64748B]'
                                    }`}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center shadow-sm ${formData.lockType === opt.id ? 'bg-white text-black' : 'bg-white text-[#94A3B8]'}`}>
                                            <opt.i className="w-9 h-9" strokeWidth={2.5} />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-[18px] font-[800] tracking-tight">{opt.name}</div>
                                            <div className={`text-[13px] font-[500] mt-0.5 ${formData.lockType === opt.id ? 'text-white/60' : 'text-[#94A3B8]'}`}>{opt.d}</div>
                                        </div>
                                    </div>
                                    {formData.lockType === opt.id && (
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                    )}
                                </motion.button>
                            ))}
                        </div>

                        <div className="pt-10 pb-4">
                            <motion.button 
                                whileTap={{ scale: 0.96 }}
                                onClick={handleComplete}
                                className="w-full h-20 bg-black text-white rounded-[28px] font-[800] text-[19px] shadow-2xl flex items-center justify-center gap-3"
                            >
                                <Zap className="w-6 h-6 fill-white" /> Complete Setup
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {step === 4 && (
                    <motion.div 
                        key="step4"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-grow flex flex-col items-center justify-center text-center p-8"
                    >
                        <div className="relative mb-12">
                            <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-[80px] animate-pulse" />
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 10, stiffness: 100 }}
                                className="w-40 h-40 bg-emerald-500 rounded-full flex items-center justify-center relative z-10 shadow-2xl shadow-emerald-200"
                            >
                                <CheckCircle2 className="w-20 h-20 text-white" strokeWidth={2.5} />
                            </motion.div>
                        </div>
                        
                        <h2 className="text-[48px] font-[900] text-black tracking-tight leading-[0.9] mb-4">You're Ready!</h2>
                        <p className="text-[19px] font-[500] text-[#64748B] leading-relaxed mb-16 max-w-[300px]">
                            Your smart terminal is active and ready to dispatch receipts.
                        </p>
                        
                        <motion.button 
                            whileTap={{ scale: 0.96 }}
                            onClick={() => navigate('/home')}
                            className="w-full h-20 bg-black text-white rounded-[28px] font-[800] text-[19px] shadow-2xl flex items-center justify-center gap-4"
                        >
                            Open Dashboard <ArrowRight className="w-6 h-6" />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
=======
  const handleNext = () => {
    setDirection(1)
    setStep(s => s + 1)
  }

  const handleBack = () => {
    if (lockSubStep === 'confirm') { setLockSubStep('pin'); return; }
    if (lockSubStep === 'pin' || lockSubStep === 'scanning' || lockSubStep === 'bio_success') { setLockSubStep('select'); return; }
    setDirection(-1)
    setStep(s => s - 1)
  }

  const finalize = async (finalPinHash, salt, type) => {
    await saveShop({
      name: shopName,
      ownerName: ownerName,
      category: category,
      upiId: upiId,
      onboardingDone: true,
      currency: 'INR',
      theme: 'light'
    })
    
    await setupLock({
      type: type || selectedMethod,
      biometricEnabled: (type || selectedMethod) !== 'pin',
      pinHash: finalPinHash,
      salt: salt
    })

    localStorage.setItem('spendly_shop_onboarding_complete', 'true')
    
    // Clear temp storage
    const keys = ['spendly_shop_onboarding_step', 'spendly_shop_name', 'spendly_shop_owner', 'spendly_shop_category', 'spendly_shop_upi']
    keys.forEach(k => localStorage.removeItem(k))

    setLockSubStep('success')
    
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#000000', '#000000', '#FFFFFF'],
      zIndex: 2000
    })

    setTimeout(() => { navigate('/') }, 2500)
  }

  const slideVariants = {
    initial: (dir) => ({ x: dir > 0 ? '100vw' : '-100vw', opacity: 0 }),
    animate: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? '-100vw' : '100vw', opacity: 0 }),
  }

  return (
    <div className={`fixed inset-0 h-dvh bg-white flex flex-col z-[1000] max-w-[430px] mx-auto overflow-hidden ${lockSubStep === 'scanning' ? 'bg-[#000000]' : ''}`} style={S}>
      {/* Top Header */}
      {lockSubStep !== 'scanning' && lockSubStep !== 'success' && lockSubStep !== 'bio_success' && (
        <div className="flex-none pt-10 px-6 pb-4 flex items-center justify-between bg-white relative z-20">
          {step > 1 ? (
            <button onClick={handleBack} className="w-10 h-10 rounded-full bg-[#F6F6F6] flex items-center justify-center border border-[#EEEEEE] active:scale-90 transition-transform">
              <ChevronLeft className="w-6 h-6 text-black" />
            </button>
          ) : <div className="w-10" />}
          
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(dot => (
              <div 
                key={dot} 
                className={`h-1.5 rounded-full transition-all duration-300 ${dot === step ? 'w-6 bg-[#000000]' : (dot < step ? 'w-2 bg-[#000000]/30' : 'w-2 bg-[#EEEEEE]')}`} 
              />
            ))}
          </div>
          <div className="w-10" />
>>>>>>> 41f113d (upgrade scanner)
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
              <ScreenShopSetup 
                shopName={shopName} setShopName={setShopName}
                ownerName={ownerName} setOwnerName={setOwnerName}
                category={category} setCategory={setCategory}
                upiId={upiId} setUpiId={setUpiId}
                onNext={handleNext}
              />
            )}
            {step === 3 && <ScreenEducation onNext={handleNext} />}
            {step === 4 && (
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
    </div>
  )
}

function ScreenWelcome({ onNext }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 bg-white">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="w-32 h-32 bg-white rounded-[40px] flex items-center justify-center mb-10 relative"
      >
        <img src="/spendly-logo.png" className="w-24 h-24 object-contain" alt="Spendly" />
      </motion.div>
      
      <h1 className="text-[32px] font-[900] text-black tracking-tighter leading-tight mb-4">Send bills.<br />Instantly.</h1>
      <p className="text-[15px] font-[500] text-[#545454] leading-relaxed mb-10">
        Your customer gets the bill in 5 seconds. No WhatsApp. No paper. No typing.
      </p>
      
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        <FeaturePill icon={Smartphone} label="NFC tap" />
        <FeaturePill icon={QrCode} label="QR code" />
        <FeaturePill icon={Hash} label="6-digit code" />
      </div>
      
      <div className="mt-auto w-full pb-10">
        <PrimaryButton onClick={onNext} label="Set Up My Shop" />
      </div>
    </div>
  )
}

function ScreenShopSetup({ shopName, setShopName, ownerName, setOwnerName, category, setCategory, upiId, setUpiId, onNext }) {
  return (
    <div className="flex-1 flex flex-col pt-4 overflow-hidden">
      <h2 className="text-[26px] font-[900] text-black tracking-tight mb-6 flex-none">Tell us about your shop</h2>
      
      <div className="flex-1 space-y-5 overflow-y-auto scrollbar-hide pb-6 overscroll-contain pr-1">
        <InputGroup label="Shop Name" value={shopName} onChange={setShopName} placeholder="e.g. Royal Bakery" icon={Store} />
        <InputGroup label="Owner Name" value={ownerName} onChange={setOwnerName} placeholder="e.g. John Doe" icon={User} />
        
        <div className="space-y-4">
          <label className="text-[10px] font-[800] text-[#AFAFAF] uppercase tracking-[0.1em] ml-1">Shop Category</label>
          <div className="grid grid-cols-3 gap-3">
            {SHOP_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => { setCategory(cat.id); navigator.vibrate?.(5); }}
                className={`flex flex-col items-center gap-2 p-4 rounded-[24px] border-2 transition-all active:scale-[0.98] ${category === cat.id ? 'bg-[#000000]/5 border-[#000000]' : 'bg-[#F6F6F6] border-transparent'}`}>
                <span className="text-2xl">{cat.emoji}</span>
                <span className={`text-[10px] font-[800] uppercase tracking-wider text-center ${category === cat.id ? 'text-[#000000]' : 'text-black'}`}>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <InputGroup label="UPI ID (For auto-fill)" value={upiId} onChange={setUpiId} placeholder="shop@okupi" icon={Smartphone} optional />
      </div>

      <div className="flex-none pt-4 pb-4 bg-white">
        <PrimaryButton onClick={onNext} label="Continue" disabled={!shopName || !ownerName || !category} />
      </div>
    </div>
  )
}

function ScreenEducation({ onNext }) {
  const methods = [
    { icon: Smartphone, title: 'NFC Tap', desc: 'Tap phones together (Android)' },
    { icon: QrCode, title: 'QR Code', desc: 'Customer scans your QR (all phones)' },
    { icon: Hash, title: '6-Digit Code', desc: 'Say the code out loud (any device)' },
    { icon: MessageCircle, title: 'WhatsApp', desc: 'Send link on WhatsApp' },
  ]

  return (
    <div className="flex-1 flex flex-col pt-4 overflow-hidden">
      <h2 className="text-[26px] font-[900] text-black tracking-tight mb-8 flex-none">How will you send bills?</h2>
      
      <div className="flex-1 space-y-3 overflow-y-auto scrollbar-hide overscroll-contain pb-6 pr-1">
        {methods.map((m, i) => (
          <div key={i} className="flex items-center gap-4 p-5 rounded-[24px] bg-[#F6F6F6] border border-[#EEEEEE]">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#000000]">
              <m.icon className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[15px] font-[800] text-black tracking-tight">{m.title}</p>
              <p className="text-[12px] font-[500] text-[#545454] leading-tight">{m.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-none pt-4 pb-4 bg-white">
        <PrimaryButton onClick={onNext} label="Got it, Continue" />
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
      setBiometricError(null)
      
      try {
        const cred = await biometricAuth.register('Shop Owner')
        await db.biometric_credentials.clear()
        await db.biometric_credentials.add({
          credentialId: cred.credentialId,
          type: selectedMethod,
          createdAt: new Date()
        })
        
        setIsBiometricLoading(false)
        setSubStep('bio_success')
        setTimeout(() => setSubStep('pin'), 1500)
      } catch (err) {
        console.error('Biometric setup failed', err)
        setIsBiometricLoading(false)
        setBiometricError("Hardware setup failed. Using PIN fallback.")
        setTimeout(() => setSubStep('pin'), 2000)
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
      <div className="flex-1 flex flex-col pt-4">
        <h2 className="text-[26px] font-[900] text-black tracking-tight mb-1">Secure My Shop</h2>
        <p className="text-[14px] font-[500] text-[#545454] mb-8">Keeps your business data private</p>
        <div className="space-y-3 flex-1 overflow-y-auto scrollbar-hide">
          {availableMethods.map(m => (
            <button key={m.id} onClick={() => { setSelectedMethod(m.id); navigator.vibrate?.(5); }}
              className={`w-full p-5 rounded-[24px] border-2 flex items-center justify-between transition-all active:scale-[0.99] ${selectedMethod === m.id ? 'bg-[#000000]/5 border-[#000000]' : 'bg-white border-[#EEEEEE]'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedMethod === m.id ? 'bg-[#000000] text-white' : 'bg-[#F6F6F6] text-black'}`}><m.icon className="w-5 h-5" /></div>
                <div className="text-left">
                  <div className="flex items-center gap-2"><p className="text-[15px] font-[800] text-black">{m.title}</p>{m.recommended && <span className="text-[8px] font-[900] bg-[#000000] text-white px-2 py-0.5 rounded-full uppercase">Recommended</span>}</div>
                  <p className="text-[11px] font-[500] text-[#AFAFAF]">{m.subtitle}</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === m.id ? 'border-[#000000]' : 'border-[#EEEEEE]'}`}>
                {selectedMethod === m.id && <div className="w-2.5 h-2.5 bg-[#000000] rounded-full" />}
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
      <div className="fixed inset-0 z-[1100] bg-[#000000] flex flex-col items-center justify-center px-10">
        <div className="relative w-56 h-56 flex items-center justify-center mb-12">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <ellipse cx="50" cy="50" rx="35" ry="45" fill="none" stroke="#FFFFFF" strokeWidth="0.5" strokeDasharray="2 2" className="opacity-20" />
            <motion.ellipse cx="50" cy="50" rx="35" ry="45" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="4 4"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, repeat: Infinity }} />
          </svg>
          <motion.div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white to-transparent absolute z-10"
            animate={{ top: ['20%', '80%', '20%'] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
          <Shield className="w-16 h-16 text-white opacity-80" strokeWidth={1} />
        </div>
        <p className="text-white text-[22px] font-[900] tracking-tight mb-2">Look at your camera</p>
        <p className="text-white/40 text-[14px] font-[500] flex items-center gap-3 text-center px-4">
           {isBiometricLoading && <Loader2 className="w-4 h-4 animate-spin text-white" />}
           {biometricError ? biometricError : `Authenticating with ${selectedMethod === 'faceid' ? 'Face ID' : 'Fingerprint'}...`}
        </p>
      </div>
    )
  }

  if (subStep === 'bio_success') {
    return (
      <div className="fixed inset-0 z-[1200] bg-white flex flex-col items-center justify-center px-10">
        <div className="w-24 h-24 bg-black rounded-[32px] flex items-center justify-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <Check className="w-12 h-12 text-white" strokeWidth={4} />
          </motion.div>
        </div>
        <h1 className="text-[28px] font-[900] text-black tracking-tight mb-2">Verified</h1>
        <p className="text-[#545454] font-[500] text-[15px]">Hardware setup complete</p>
      </div>
    )
  }

  if (subStep === 'pin' || subStep === 'confirm') {
    const pins = subStep === 'pin' ? tempPin : confirmPin
    return (
      <div className="flex-1 flex flex-col pt-4 bg-white text-center">
        <h2 className="text-[26px] font-[900] text-black tracking-tight mb-1">{subStep === 'pin' ? 'Create Shop PIN' : 'Confirm Shop PIN'}</h2>
        <p className="text-[14px] font-[500] text-[#545454] mb-10">{subStep === 'pin' ? 'Used as a backup to biometric lock' : 'Enter your PIN again to verify'}</p>
        <div className="flex-1 flex flex-col items-center justify-center -mt-10">
          <motion.div animate={error ? { x: [-10, 10, -10, 10, 0] } : {}} className="flex gap-4 mb-12">
            {[1, 2, 3, 4].map(i => (<div key={i} className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${pins.length >= i ? 'bg-black scale-110' : 'bg-[#EEEEEE]'}`} />))}
          </motion.div>
          <div className="grid grid-cols-3 gap-x-10 gap-y-6 w-full max-w-[280px]">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'back'].map((num, i) => (
              <button key={i} onClick={() => num !== '' && handlePinInput(num, subStep === 'confirm')}
                className="h-14 flex items-center justify-center text-[28px] font-[800] text-black active:scale-95 transition-transform active:bg-[#F6F6F6] rounded-2xl">
                {num === 'back' ? <ChevronLeft className="w-8 h-8 rotate-180" strokeWidth={3} /> : num}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (subStep === 'success') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center bg-white">
        <div className="w-28 h-28 bg-black rounded-[36px] flex items-center justify-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <Lock className="w-14 h-14 text-white" strokeWidth={2.5} />
          </motion.div>
        </div>
        <h1 className="text-[32px] font-[900] text-black tracking-tighter mb-2">You're all set!</h1>
        <p className="text-[15px] font-[500] text-[#545454] leading-relaxed">Shop Dashboard is now ready</p>
      </div>
    )
  }

  return null
}

function InputGroup({ label, value, onChange, placeholder, icon: Icon, optional }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center ml-1">
        <label className="text-[10px] font-[800] text-[#AFAFAF] uppercase tracking-[0.1em]">{label}</label>
        {optional && <span className="text-[9px] font-[700] text-[#CBD5E1] uppercase tracking-wider">Optional</span>}
      </div>
      <div className="relative">
        <Icon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#AFAFAF]" />
        <input 
          type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          inputMode="text" autoCapitalize="words" autoCorrect="off" autoFocus={label === 'Shop Name'}
          className="w-full py-4.5 pl-14 pr-6 rounded-[22px] bg-[#F6F6F6] border border-[#EEEEEE] text-[16px] font-[700] text-black placeholder:text-[#CBD5E1]/40 outline-none focus:border-[#000000] transition-all"
        />
      </div>
    </div>
  )
}

function FeaturePill({ icon: Icon, label }) {
  return (
    <div className="px-4 py-2 rounded-full bg-[#F6F6F6] border border-[#EEEEEE] flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-black" />
      <span className="text-[10px] font-[800] text-black uppercase tracking-wider">{label}</span>
    </div>
  )
}

function PrimaryButton({ onClick, label, disabled }) {
  return (
    <motion.button whileTap={!disabled ? { scale: 0.98 } : {}} onClick={!disabled ? onClick : undefined}
      className={`w-full py-4.5 rounded-[24px] text-[16px] font-[800] tracking-tight transition-all ${disabled ? 'bg-[#F6F6F6] text-[#AFAFAF]' : 'bg-black text-white shadow-xl shadow-black/10'}`}>{label}</motion.button>
  )
}
