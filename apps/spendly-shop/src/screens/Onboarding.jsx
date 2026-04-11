import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, CheckCircle, ChevronRight, User, Phone, CreditCard, Sparkles, LayoutGrid, Zap, ShieldCheck } from 'lucide-react';
import { useShopStore } from '../store/shopStore';

const HAPTIC_SHAKE = {
  tap: { 
    x: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.35, ease: "easeInOut" }
  }
}

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const { setShopInfo } = useShopStore();
  
  const [formData, setFormData] = useState({
    name: '',
    owner: '',
    category: 'General Store',
    phone: '',
    gst: '',
    upi: ''
  });

  const S = { fontFamily: "'Inter', sans-serif" };

  const handleSave = async () => {
    if (!formData.name) return;
    await setShopInfo(formData);
    setStep(3);
  };

  return (
    <div className="fixed inset-0 bg-white z-[999] flex flex-col overflow-x-hidden safe-top">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col px-7 pb-10"
          >
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="relative mb-12">
                <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-3xl scale-150" />
                <div className="w-32 h-32 bg-white rounded-[40px] shadow-2xl flex items-center justify-center relative z-10 border border-[#EEEEEE]">
                  <Store size={64} className="text-emerald-500" strokeWidth={1.5} />
                </div>
              </div>
              <p className="text-[12px] font-[900] text-[#AFAFAF] uppercase tracking-[0.3em] mb-4" style={S}>Professional Ecosystem</p>
              <h1 className="text-[44px] font-[900] text-black leading-[0.9] tracking-tighter mb-6" style={S}>Empower Your Business</h1>
              <p className="text-[#545454] font-[600] text-[16px] max-w-[300px] leading-relaxed mb-12" style={S}>
                Connect with Spendly customers instantly through zero-touch digital receipts.
              </p>
            </div>
            
            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-5 bg-[#F6F6F6] rounded-[28px] border border-[#EEEEEE]">
                     <Zap size={20} className="text-emerald-500 mb-2" />
                     <p className="text-[11px] font-[800] uppercase tracking-tighter text-black" style={S}>Fast Billing</p>
                  </div>
                  <div className="p-5 bg-[#F6F6F6] rounded-[28px] border border-[#EEEEEE]">
                     <LayoutGrid size={20} className="text-emerald-500 mb-2" />
                     <p className="text-[11px] font-[800] uppercase tracking-tighter text-black" style={S}>NFC Ready</p>
                  </div>
               </div>
               <motion.button 
                variants={HAPTIC_SHAKE} whileTap="tap"
                onClick={() => setStep(2)}
                className="w-full h-18 bg-black text-white rounded-[28px] font-[900] text-lg flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/10"
               >
                Begin Setup <ChevronRight size={22} strokeWidth={3} />
               </motion.button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col px-7 pt-12 pb-10"
          >
            <div className="flex-1">
              <h2 className="text-3xl font-[900] tracking-tighter mb-2" style={S}>Merchant Profile</h2>
              <p className="text-[#AFAFAF] font-[700] text-[13px] mb-10" style={S}>Setup your store metadata for clear transaction history.</p>
              
              <div className="space-y-5 mb-12">
                <div className="rounded-[28px] bg-[#F6F6F6] border border-[#EEEEEE] overflow-hidden divide-y divide-[#EEEEEE]">
                  <div className="flex items-center px-6 py-5 bg-white">
                    <Store className="text-[#D8D8D8] mr-4" size={20} />
                    <input 
                      type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="flex-1 bg-transparent font-[800] text-[16px] text-black placeholder-[#D8D8D8] outline-none"
                      placeholder="Store Name"
                    />
                  </div>
                  <div className="flex items-center px-6 py-5 bg-white">
                    <User className="text-[#D8D8D8] mr-4" size={20} />
                    <input 
                      type="text" value={formData.owner} onChange={e => setFormData({...formData, owner: e.target.value})}
                      className="flex-1 bg-transparent font-[800] text-[16px] text-black placeholder-[#D8D8D8] outline-none"
                      placeholder="Owner / Cashier Name"
                    />
                  </div>
                  <div className="flex items-center px-6 py-5 bg-white">
                    <CreditCard className="text-[#D8D8D8] mr-4" size={20} />
                    <input 
                      type="text" value={formData.upi} onChange={e => setFormData({...formData, upi: e.target.value})}
                      className="flex-1 bg-transparent font-[800] text-[16px] text-black placeholder-[#D8D8D8] outline-none"
                      placeholder="UPI ID (e.g. shop@upi)"
                    />
                  </div>
                </div>

                <div className="p-6 bg-[#F6F6F6] rounded-[32px] border border-[#EEEEEE]">
                   <p className="text-[10px] font-[900] text-[#AFAFAF] uppercase tracking-widest mb-4 px-1">Business Category</p>
                   <div className="grid grid-cols-3 gap-2">
                      {['🏪 Groceries', '🍱 Food', '🧥 Fashion', '💊 Pharma', '💄 Beauty', '🛠️ Hardware'].map(cat => (
                        <motion.button 
                          key={cat} onClick={() => setFormData({...formData, category: cat})}
                          className={`h-11 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border ${formData.category === cat ? 'bg-black text-white border-black' : 'bg-white text-[#AFAFAF] border-transparent'}`}
                        >
                          {cat.split(' ')[1]}
                        </motion.button>
                      ))}
                   </div>
                </div>
              </div>
            </div>

            <motion.button 
              variants={HAPTIC_SHAKE} whileTap="tap"
              disabled={!formData.name}
              onClick={handleSave}
              className={`w-full h-18 rounded-[28px] font-[900] text-lg flex items-center justify-center gap-3 transition-all ${formData.name ? 'bg-black text-white shadow-xl' : 'bg-[#EEEEEE] text-[#AFAFAF]'}`}
            >
              Confirm Shop <CheckCircle size={22} strokeWidth={3} />
            </motion.button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center px-8"
          >
            <div className="relative mb-12">
               <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl scale-125 animate-pulse" />
               <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center relative z-10 shadow-2xl shadow-emerald-200">
                 <Sparkles size={64} className="text-white" strokeWidth={2.5} />
               </div>
            </div>
            <h1 className="text-[44px] font-[900] text-black tracking-tighter leading-[0.9] mb-4" style={S}>Fully Integrated</h1>
            <p className="text-[#545454] font-[600] text-[16px] leading-relaxed mb-16" style={S}>
              Your terminal is now ready to dispatch neural-encrypted bills to Spendly users.
            </p>
            <motion.button 
              variants={HAPTIC_SHAKE} whileTap="tap"
              onClick={onComplete}
              className="w-full h-18 bg-black text-white rounded-[28px] font-[900] text-lg flex items-center justify-center gap-4"
            >
              Enter Terminal <ArrowRight size={22} strokeWidth={3} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
