import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
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
    }
];

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
        </div>
    );
};

export default OnboardingScreen;
