import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Utensils, Pill, Shirt, Scissors, 
  Wrench, Tablet, GraduationCap, Hospital, Car, 
  Cake, Apple, Milk, Sprout, Package, Plus,
  ChevronRight, Sparkles, ShieldCheck, Zap, Store,
  Smartphone, CreditCard, PieChart, Users, Globe,
  Phone, User, Lock, ArrowRight, CheckCircle2
} from 'lucide-react';
import { useShopStore } from '../store/shopStore';
import { billService } from '../services/database';

const CATEGORIES = [
  { id: 'general', name: 'General', emoji: '🛒' },
  { id: 'food', name: 'Food', emoji: '🍕' },
  { id: 'medical', name: 'Medical', emoji: '💊' },
  { id: 'fashion', name: 'Fashion', emoji: '👗' },
  { id: 'beauty', name: 'Beauty', emoji: '💇' },
  { id: 'hardware', name: 'Hardware', emoji: '🔧' },
];

const ONBOARDING_SLIDES = [
    {
        title: "Smart Business",
        subtitle: "The easiest billing app for your shop.",
        icon: ShoppingBag,
        features: [
            { t: 'Fast Billing', d: 'Create bills in just 5 seconds', i: '⚡' },
            { t: 'Offline Safe', d: 'Works 100% without internet', i: '🔐' },
            { t: 'Free Forever', d: 'No monthly fees, completely free', i: '💎' }
        ]
    },
    {
        title: "Digital Invoices",
        subtitle: "Share bills with your customers instantly.",
        icon: Zap,
        features: [
            { t: 'Quick Share', d: 'Send bills via WhatsApp or SMS', i: '📱' },
            { t: 'QR Code', d: 'Let customers scan to get bills', i: '🧬' },
            { t: 'NFC Tap', d: 'Tap phones to transfer data', i: '🔗' }
        ]
    },
    {
        title: "Manage Stats",
        subtitle: "Keep track of your regular customers easily.",
        icon: Users,
        features: [
            { t: 'Credit Book', d: 'Track udhaar and pending payments', i: '📊' },
            { t: 'VIP Customers', d: 'Mark your top regular clients', i: '👑' },
            { t: 'Direct Call', d: 'Call or message customers in one tap', i: '💬' }
        ]
    }
];

const OnboardingScreen = () => {
    const [step, setStep] = useState(0); 
    const [slideIndex, setSlideIndex] = useState(0);
    const [formData, setFormData] = useState({
        name: '', ownerName: '', category: 'general', phone: '', upiId: '', gstNumber: '', lockType: 'pin4'
    });
    const navigate = useNavigate();
    const { saveShop } = useShopStore();

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

        navigate('/home');
    };

    const currentSlide = ONBOARDING_SLIDES[slideIndex];

    const itemVariants = {
        hidden: { y: 15, opacity: 0 },
        show: { y: 0, opacity: 1, transition: { type: "spring", damping: 25, stiffness: 200 } }
    };

    return (
        <div className="min-h-screen bg-white relative overflow-hidden flex flex-col font-sans select-none">
            {/* Subtle Premium Background */}
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-slate-50/50 to-white -z-20" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 -mr-48 -mt-48" />

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
                                <div key={i} className={`h-1 rounded-full transition-all duration-500 ease-out ${i === slideIndex ? 'w-10 bg-black' : 'w-4 bg-[#F1F5F9]'}`} />
                            ))}
                        </div>

                        <div className="flex-grow flex flex-col justify-center">
                            <motion.div 
                                key={slideIndex}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="space-y-12"
                            >
                                <div className="space-y-8">
                                    <div className="w-20 h-20 bg-white rounded-[24px] shadow-sm border border-[#F1F5F9] flex items-center justify-center relative">
                                        <currentSlide.icon className="w-10 h-10 text-black" />
                                        <div className="absolute inset-[-8px] bg-black/5 rounded-[28px] blur-xl -z-10" />
                                    </div>
                                    <div className="space-y-3">
                                        <h1 className="text-[32px] font-[800] text-black tracking-tight leading-[1.1]">
                                            {currentSlide.title}
                                        </h1>
                                        <p className="text-[16px] font-[500] text-[#64748B] leading-relaxed max-w-[280px]">
                                            {currentSlide.subtitle}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {currentSlide.features.map((f, i) => (
                                        <motion.div 
                                            key={i}
                                            variants={itemVariants}
                                            initial="hidden"
                                            animate="show"
                                            transition={{ delay: 0.1 + (i * 0.1) }}
                                            className="flex items-center gap-5 p-5 bg-[#F8FAFC] rounded-[24px] border border-transparent hover:border-[#F1F5F9] transition-all"
                                        >
                                            <div className="w-12 h-12 bg-white rounded-[16px] flex items-center justify-center text-2xl shadow-sm">
                                                {f.i}
                                            </div>
                                            <div>
                                                <div className="text-[15px] font-[800] text-black leading-tight">{f.t}</div>
                                                <div className="text-[12px] font-[500] text-[#94A3B8] mt-1">{f.d}</div>
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
                                className="w-full bg-black text-white h-[72px] rounded-full font-[800] text-[17px] shadow-lg flex items-center justify-center gap-3 active:bg-slate-900 transition-colors"
                            >
                                {slideIndex === ONBOARDING_SLIDES.length - 1 ? 'Get Started' : 'Continue'}
                                <ChevronRight className="w-5 h-5" />
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
                            <h2 className="text-[32px] font-[800] text-black tracking-tight leading-tight">Shop Info</h2>
                            <p className="text-[15px] font-[500] text-[#64748B] mt-2">Enter your business details below</p>
                        </header>

                        <div className="space-y-8 flex-grow">
                            <div className="space-y-3">
                                <label className="text-[12px] font-[800] text-black uppercase tracking-wider ml-1">Shop Name</label>
                                <div className="bg-[#F8FAFC] border border-transparent p-6 rounded-[24px] focus-within:bg-white focus-within:border-[#F1F5F9] focus-within:shadow-sm transition-all flex items-center gap-4">
                                    <Store className="w-6 h-6 text-[#94A3B8]" strokeWidth={2.5} />
                                    <input 
                                        className="w-full bg-transparent outline-none font-[700] text-black text-[17px] placeholder:text-[#CBD5E1]"
                                        placeholder="Enter your shop name"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[12px] font-[800] text-black uppercase tracking-wider ml-1">Phone Number</label>
                                <div className="bg-[#F8FAFC] border border-transparent p-6 rounded-[24px] focus-within:bg-white focus-within:border-[#F1F5F9] focus-within:shadow-sm transition-all flex items-center gap-4">
                                    <Phone className="w-6 h-6 text-[#94A3B8]" strokeWidth={2.5} />
                                    <input 
                                        className="w-full bg-transparent outline-none font-[700] text-black text-[17px] placeholder:text-[#CBD5E1]"
                                        placeholder="98XXXXXX00"
                                        value={formData.phone}
                                        onChange={e => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[12px] font-[800] text-black uppercase tracking-wider ml-1">Category</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setFormData({...formData, category: cat.id})}
                                            className={`flex flex-col items-center gap-3 p-5 rounded-[24px] border transition-all ${
                                                formData.category === cat.id 
                                                ? 'bg-black border-black text-white shadow-md' 
                                                : 'bg-[#F8FAFC] border-transparent text-[#64748B]'
                                            }`}
                                        >
                                            <span className="text-[28px]">{cat.emoji}</span>
                                            <span className="text-[10px] font-[800] uppercase tracking-wider">{cat.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 pb-4">
                            <motion.button 
                                whileTap={{ scale: 0.96 }}
                                disabled={!formData.name || !formData.phone}
                                onClick={() => setStep(2)}
                                className={`w-full h-[72px] rounded-full font-[800] text-[17px] flex items-center justify-center gap-3 shadow-md transition-all ${
                                    formData.name && formData.phone 
                                    ? 'bg-black text-white' 
                                    : 'bg-[#F1F5F9] text-[#CBD5E1] cursor-not-allowed'
                                }`}
                            >
                                Continue <ChevronRight className="w-5 h-5" />
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
                        <header className="mb-12">
                            <h2 className="text-[32px] font-[800] text-black tracking-tight leading-tight">App Lock</h2>
                            <p className="text-[15px] font-[500] text-[#64748B] mt-2">Secure your personal business data</p>
                        </header>

                        <div className="space-y-4 flex-grow">
                            {[
                                { id: 'pin4', name: '4-Digit PIN', i: ShieldCheck, d: 'Safe and convenient' },
                                { id: 'pin6', name: '6-Digit PIN', i: ShieldCheck, d: 'Enhanced level security' },
                                { id: 'biometric', name: 'Face / Fingerprint', i: Smartphone, d: 'Fastest way to unlock' }
                            ].map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setFormData({...formData, lockType: opt.id})}
                                    className={`w-full flex items-center justify-between p-6 rounded-[28px] border transition-all ${
                                        formData.lockType === opt.id
                                        ? 'border-black bg-black text-white shadow-lg'
                                        : 'border-transparent bg-[#F8FAFC]'
                                    }`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${formData.lockType === opt.id ? 'bg-white text-black' : 'bg-white text-[#94A3B8]'}`}>
                                            <opt.i className="w-8 h-8" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-[16px] font-[800] tracking-tight">{opt.name}</div>
                                            <div className={`text-[12px] font-[500] mt-0.5 ${formData.lockType === opt.id ? 'text-white/60' : 'text-[#94A3B8]'}`}>{opt.d}</div>
                                        </div>
                                    </div>
                                    {formData.lockType === opt.id && (
                                        <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-black">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="pt-10 pb-4 flex flex-col items-center gap-6">
                            <motion.button 
                                whileTap={{ scale: 0.96 }}
                                onClick={handleComplete}
                                className="w-full h-[72px] bg-black text-white rounded-full font-[800] text-[17px] shadow-lg flex items-center justify-center gap-3"
                            >
                                <Store className="w-6 h-6" /> Complete Setup
                            </motion.button>
                            <div className="text-center opacity-30">
                                <p className="text-[10px] font-[800] uppercase tracking-[0.3em]">Spendly Shop 1.0</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OnboardingScreen;
