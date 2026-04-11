import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Utensils, Pill, Shirt, Scissors, 
  Wrench, Tablet, GraduationCap, Hospital, Car, 
  Cake, Apple, Milk, Sprout, Package, Plus 
} from 'lucide-react';
import { useShopStore } from '../store/shopStore';
import { billService } from '../services/database';

const CATEGORIES = [
  { id: 'general', name: 'General Store', icon: ShoppingBag, emoji: '🛒' },
  { id: 'food', name: 'Restaurant / Food', icon: Utensils, emoji: '🍕' },
  { id: 'medical', name: 'Pharmacy / Medical', icon: Pill, emoji: '💊' },
  { id: 'fashion', name: 'Clothing / Fashion', icon: Shirt, emoji: '👗' },
  { id: 'beauty', name: 'Salon / Beauty', icon: Scissors, emoji: '💇' },
  { id: 'hardware', name: 'Hardware / Tools', icon: Wrench, emoji: '🔧' },
  { id: 'electronics', name: 'Electronics', icon: Tablet, emoji: '📱' },
  { id: 'education', name: 'Education / Coaching', icon: GraduationCap, emoji: '🎓' },
  { id: 'hospital', name: 'Hospital / Clinic', icon: Hospital, emoji: '🏥' },
  { id: 'automobile', name: 'Automobile / Garage', icon: Car, emoji: '🚗' },
  { id: 'bakery', name: 'Bakery / Sweet Shop', icon: Cake, emoji: '🧁' },
  { id: 'fruits', name: 'Fruits / Vegetables', icon: Apple, emoji: '🍎' },
  { id: 'dairy', name: 'Dairy Products', icon: Milk, emoji: '🐄' },
  { id: 'nursery', name: 'Nursery / Plants', icon: Sprout, emoji: '🪴' },
  { id: 'wholesale', name: 'Wholesale', icon: Package, emoji: '📦' },
  { id: 'other', name: 'Other', icon: Plus, emoji: '➕' },
];

const OnboardingScreen = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    category: '',
    phone: '',
    upiId: '',
    gstNumber: '',
    lockType: 'pin4'
  });
  const navigate = useNavigate();
  const { saveShop } = useShopStore();

  const handleNext = () => setStep(s => s + 1);

  const handleComplete = async () => {
    // Save shop data
    await saveShop({
      ...formData,
      createdAt: new Date().toISOString(),
      billPrefix: 'BILL',
      startingBillNumber: 1,
      currency: 'USD',
      theme: 'light'
    });

    // Load 5 sample bills
    for (let i = 1; i <= 5; i++) {
        await billService.add({
            billNumber: `BILL00${i}`,
            customerName: `Test Customer ${i}`,
            total: Math.floor(Math.random() * 1000) + 100,
            status: 'paid',
            createdAt: new Date(Date.now() - i * 3600000).toISOString()
        });
    }

    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-6">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center text-center py-12"
          >
            <div className="w-64 h-64 bg-emerald-50 rounded-full flex items-center justify-center mb-12">
              <ShoppingBag className="w-32 h-32 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-4">Welcome to Spendly Shop 🏪</h1>
            <p className="text-slate-500 text-lg leading-relaxed mb-12 px-4">
              Create bills in seconds<br/>
              Send to customers instantly<br/>
              Track every sale privately
            </p>
            <button 
              onClick={handleNext}
              className="w-full bg-primary text-white py-4 rounded-button font-bold text-lg shadow-lg shadow-emerald-200 active:scale-95 transition-transform"
            >
              Let's Start
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 pt-8 pb-12"
          >
            <h2 className="text-2xl font-black text-slate-900 mb-2">Tell us about your shop</h2>
            <p className="text-slate-400 mb-8">This information will appear on your bills</p>

            <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-2 scrollbar-hide">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Shop Name</label>
                <input 
                  type="text" 
                  placeholder="Your shop name"
                  className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 focus:border-primary focus:bg-white outline-none font-bold"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Owner Name</label>
                <input 
                  type="text" 
                  placeholder="Your name"
                  className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 focus:border-primary focus:bg-white outline-none font-semibold"
                  value={formData.ownerName}
                  onChange={e => setFormData({...formData, ownerName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Shop Category</label>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setFormData({...formData, category: cat.id})}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        formData.category === cat.id 
                        ? 'border-primary bg-emerald-50 text-primary shadow-sm' 
                        : 'border-slate-100 bg-white text-slate-600'
                      }`}
                    >
                      <span className="text-xl">{cat.emoji}</span>
                      <span className="text-xs font-bold text-left leading-tight">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Phone</label>
                  <input 
                    type="tel" 
                    placeholder="Shop phone"
                    className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 focus:border-primary focus:bg-white outline-none font-semibold"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">UPI ID</label>
                  <input 
                    type="text" 
                    placeholder="customers@upi"
                    className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 focus:border-primary focus:bg-white outline-none font-semibold text-sm"
                    value={formData.upiId}
                    onChange={e => setFormData({...formData, upiId: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">GST Number</label>
                <input 
                  type="text" 
                  placeholder="29ABCDE1234F1Z5"
                  className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 focus:border-primary focus:bg-white outline-none font-mono text-sm"
                  value={formData.gstNumber}
                  onChange={e => setFormData({...formData, gstNumber: e.target.value})}
                />
              </div>
            </div>

            <button 
              disabled={!formData.name}
              onClick={handleNext}
              className={`w-full mt-8 py-4 rounded-button font-bold text-lg shadow-lg active:scale-95 transition-all ${
                formData.name ? 'bg-primary text-white shadow-emerald-100' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 pt-8 flex flex-col"
          >
            <h2 className="text-2xl font-black text-slate-900 mb-2">Protect your shop data</h2>
            <p className="text-slate-400 mb-12">Spendly is 100% private and offline</p>

            <div className="space-y-3 flex-1">
                {[
                    { id: 'pin4', name: '4 Digit PIN', desc: 'Recommended', icon: '🔢' },
                    { id: 'pin6', name: '6 Digit PIN', desc: 'Extra Secure', icon: '🔢' },
                    { id: 'pattern', name: 'Draw Pattern', desc: 'Visual Lock', icon: '⬛' },
                    { id: 'biometric', name: 'Face ID / Fingerprint', desc: 'Native Auth', icon: '👆' },
                    { id: 'staff', name: 'Staff PIN', desc: 'Limited Access Mode', icon: '👥' },
                ].map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => setFormData({...formData, lockType: opt.id})}
                        className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${
                            formData.lockType === opt.id
                            ? 'border-primary bg-emerald-50 shadow-sm'
                            : 'border-slate-100 bg-white'
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-2xl">{opt.icon}</span>
                            <div className="text-left">
                                <div className={`font-bold ${formData.lockType === opt.id ? 'text-primary' : 'text-slate-700'}`}>{opt.name}</div>
                                <div className="text-xs text-slate-400">{opt.desc}</div>
                            </div>
                        </div>
                        {formData.lockType === opt.id && <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-[10px]">✓</div>}
                    </button>
                ))}
            </div>

            <div className="pt-8 space-y-4">
                <button 
                  onClick={handleComplete}
                  className="w-full bg-primary text-white py-5 rounded-button font-black text-lg shadow-xl shadow-emerald-200 active:scale-95 transition-transform"
                >
                  Done! Open Shop
                </button>
                <button className="w-full text-slate-400 font-bold text-sm py-2">Skip for now</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingScreen;
