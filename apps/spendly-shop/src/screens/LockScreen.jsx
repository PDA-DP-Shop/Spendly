import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
<<<<<<< HEAD
import { ShoppingBag, Delete, ArrowRight, Lock, ShieldCheck, User, Store, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
=======
import { ShoppingBag, XCircle, ArrowRight, Lock, ShieldCheck, User, Store, ArrowLeft, RefreshCw, AlertTriangle, Fingerprint, Loader2 } from 'lucide-react';
>>>>>>> 41f113d (upgrade scanner)
import { useShopStore } from '../store/shopStore';
import { useAppLock } from '../hooks/useAppLock';
import { useLockStore } from '../store/lockStore';

const LockScreen = () => {
  const [pin, setPin] = useState('');
  const [isStaff, setIsStaff] = useState(false);
  const [showReloadConfirm, setShowReloadConfirm] = useState(false);
  const navigate = useNavigate();
  const { shop } = useShopStore();
  const { verifyPin, triggerBiometric, isLoading, error, biometricBlocked } = useAppLock();
  const { biometricEnabled } = useLockStore();

  useEffect(() => {
    const runBiometric = async () => {
      if (biometricEnabled && !biometricBlocked && !isLoading) {
        const success = await triggerBiometric();
        if (success) {
          navigate('/home');
        }
      }
    };
    runBiometric();
  }, [biometricEnabled, biometricBlocked, triggerBiometric, isLoading, navigate]);

  const handleKeyPress = async (num) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        const success = await verifyPin(newPin);
        if (success) {
          navigate('/home');
        } else {
          setPin('');
        }
      }
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  const handleDelete = () => setPin(pin.slice(0, -1));

  return (
    <div className="h-screen w-full flex flex-col items-center justify-between py-16 bg-white relative overflow-hidden font-sans">
<<<<<<< HEAD
      <div className="absolute top-0 right-0 w-80 h-80 bg-black/5 rounded-full blur-[90px] -z-10 -mr-40 -mt-40" />
      
=======
>>>>>>> 41f113d (upgrade scanner)
      {/* Troubleshooting Reload button */}
      <div className="absolute top-12 right-6 z-50">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowReloadConfirm(true)}
          className="w-12 h-12 rounded-full bg-[#F8FAFC] border border-[#F1F5F9] flex items-center justify-center"
        >
          <RefreshCw className="w-5 h-5 text-black" strokeWidth={2.5} />
        </motion.button>
      </div>

      <AnimatePresence>
        {showReloadConfirm && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8 text-center"
          >
             <div className="w-20 h-20 rounded-[28px] bg-red-50 flex items-center justify-center mb-8">
               <AlertTriangle className="w-10 h-10 text-red-500" />
             </div>
             <h3 className="text-[24px] font-[900] text-black tracking-tight mb-4">Reload Shop App?</h3>
             <p className="text-[#94A3B8] text-[15px] font-[600] leading-relaxed mb-10 max-w-[300px]">
                Refreshing will restart the shop interface. Your sales records and customer books are safe.
             </p>
             <div className="w-full flex flex-col gap-3">
               <motion.button whileTap={{ scale: 0.96 }} onClick={handleReload}
<<<<<<< HEAD
                 className="w-full py-5 rounded-2xl bg-black text-white font-[800] text-[16px] shadow-xl">
=======
                 className="w-full py-5 rounded-2xl bg-black text-white font-[800] text-[16px]">
>>>>>>> 41f113d (upgrade scanner)
                 Yes, Refresh App
               </motion.button>
               <button onClick={() => setShowReloadConfirm(false)} className="w-full py-5 font-[800] text-[#94A3B8] uppercase tracking-widest text-[13px]">Cancel</button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col items-center pt-10"
      >
        <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mb-8">
            <img src="/spendly-logo.png" className="w-16 h-16 object-contain" alt="Spendly" />
        </div>
        
        <h1 className="text-[28px] font-[900] text-black tracking-tighter">{shop?.name || 'Spendly Shop'}</h1>
        <div className="mt-2 flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
             <p className="text-[#94A3B8] font-[800] text-[11px] uppercase tracking-widest">
                {isStaff ? 'Staff Member' : 'Owner'} Mode
             </p>
        </div>
      </motion.div>

      <div className="flex flex-col items-center gap-12 w-full">
        <div className="text-center">
            <h2 className="text-[#94A3B8] font-[800] text-[12px] uppercase tracking-widest mb-2">Enter Access PIN</h2>
            {error && <p className="text-red-500 text-[11px] font-[800] uppercase tracking-wider">Invalid PIN. Try again.</p>}
        </div>
        
        {/* PIN Indicators */}
        <div className="flex gap-8">
            {[1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                        pin.length >= i ? 'bg-black border-black scale-125' : 'bg-transparent border-[#EEEEEE]'
                    }`}
                />
            ))}
        </div>

        {/* Number Pad */}
        <div className="w-full max-w-[320px] grid grid-cols-3 gap-y-6 gap-x-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button 
                key={num} 
                onClick={() => handleKeyPress(num)}
                className="h-20 text-[32px] font-[800] text-black rounded-full flex items-center justify-center active:bg-[#F6F6F6] transition-all"
            >
                {num}
            </button>
            ))}
            <div className="flex items-center justify-center">
                {biometricEnabled && !biometricBlocked && (
                    <button onClick={triggerBiometric} className="w-16 h-16 rounded-full flex items-center justify-center bg-black text-white">
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Fingerprint className="w-7 h-7" />}
                    </button>
                )}
            </div>
            <button 
                onClick={() => handleKeyPress(0)} 
                className="h-20 text-[32px] font-[800] text-black rounded-full flex items-center justify-center active:bg-[#F6F6F6] transition-all"
            >
                0
            </button>
            <button 
                onClick={handleDelete} 
                className="h-20 flex items-center justify-center text-[#AFAFAF] active:text-black transition-all"
            >
                <XCircle className="w-8 h-8" strokeWidth={2.5} />
            </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 w-full px-8">
        {/* <button 
            onClick={() => {
                setIsStaff(!isStaff);
                setPin('');
            }}
            className="w-full h-16 bg-[#F6F6F6] text-black rounded-full font-[800] text-[12px] uppercase tracking-widest border border-[#EEEEEE] active:bg-[#EEEEEE] transition-all"
        >
            {isStaff ? 'Switch to Owner' : 'Login as Staff'}
        </button> */}

        <div className="flex items-center gap-2 opacity-30">
            <Lock className="w-3.5 h-3.5 text-black" />
            <span className="text-[10px] font-[900] text-black uppercase tracking-widest">Secured by Spendly Shop</span>
        </div>
      </div>
    </div>
  );
};

export default LockScreen;
