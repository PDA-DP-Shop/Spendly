import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Delete, ArrowRight } from 'lucide-react';
import { useShopStore } from '../store/shopStore';

const LockScreen = () => {
  const [pin, setPin] = useState('');
  const [isStaff, setIsStaff] = useState(false);
  const navigate = useNavigate();
  const { shop } = useShopStore();

  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        // Authenticate - for now auto-success
        setTimeout(() => navigate('/home'), 300);
      }
    }
  };

  const handleDelete = () => setPin(pin.slice(0, -1));

  return (
    <div className="h-screen w-full flex flex-col items-center justify-between py-20 bg-white">
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
          <ShoppingBag className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">{shop?.name || 'Spendly Shop'}</h1>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">
          {isStaff ? 'Staff Mode Active' : 'Enter Shop PIN'}
        </p>
      </div>

      <div className="flex gap-4">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: pin.length >= i ? 1.2 : 1 }}
            className={`w-3.5 h-3.5 rounded-full border-2 transition-colors ${
              pin.length >= i ? 'bg-primary border-primary' : 'bg-transparent border-slate-200'
            }`}
          />
        ))}
      </div>

      <div className="w-full px-12 grid grid-cols-3 gap-y-10 gap-x-8 text-center pt-8">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button 
            key={num} 
            onClick={() => handleKeyPress(num)}
            className="text-3xl font-black text-slate-800 active:bg-slate-50 py-2 rounded-full transition-colors"
          >
            {num}
          </button>
        ))}
        <div />
        <button onClick={() => handleKeyPress(0)} className="text-3xl font-black text-slate-800 active:bg-slate-50 py-2 rounded-full transition-colors">0</button>
        <button onClick={handleDelete} className="flex items-center justify-center text-slate-400 active:bg-slate-50 py-2 rounded-full transition-colors">
          <Delete />
        </button>
      </div>

      <button 
        onClick={() => {
            setIsStaff(!isStaff);
            setPin('');
        }}
        className="text-primary font-bold text-sm tracking-wide uppercase active:opacity-50 transition-opacity"
      >
        {isStaff ? 'Return to Admin?' : 'Staff Login?'}
      </button>
    </div>
  );
};

export default LockScreen;
