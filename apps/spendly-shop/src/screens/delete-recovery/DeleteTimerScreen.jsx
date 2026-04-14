import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DeleteTimerScreen = () => {
  const [timeLeft, setTimeLeft] = useState(5);
  const [isStopped, setIsStopped] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isStopped || timeLeft <= 0) {
      if (timeLeft === 0) navigate('/delete-progress');
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(p => p - 1);
      if (window.navigator.vibrate) window.navigator.vibrate(100);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isStopped, navigate]);

  if (isStopped) {
    return (
      <div className="fixed inset-0 z-[110] bg-white flex flex-col items-center justify-center p-8 text-center safe-top safe-bottom">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-28 h-28 rounded-full bg-emerald-50 flex items-center justify-center mb-10 text-5xl border border-emerald-100 shadow-xl shadow-emerald-500/5"
        >
          <ShieldCheck className="w-12 h-12 text-emerald-500" strokeWidth={2.5} />
        </motion.div>
        <h2 className="text-[34px] font-[900] text-black tracking-tighter mb-4">Shop is <br/>Safe!</h2>
        <p className="text-[#94A3B8] text-[17px] font-[600] mb-12 leading-relaxed">Nothing has been removed. <br/>Your billing data is intact.</p>
        <motion.button 
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/settings')} 
          className="w-full py-6 rounded-[32px] bg-black text-white font-[802] text-[18px] shadow-2xl shadow-black/20"
        >
          Back to Settings
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white flex flex-col safe-top safe-bottom font-sans">
      <div className="flex-1 flex flex-col items-center text-center pt-20 px-8">
        <div className="w-16 h-16 rounded-[22px] bg-red-50 flex items-center justify-center mb-8 border border-red-100 animate-pulse">
          <AlertTriangle className="w-8 h-8 text-red-500" strokeWidth={2.5} />
        </div>
        <h2 className="text-[14px] font-[802] text-red-500 uppercase tracking-[0.3em] mb-12">Purge Starting in...</h2>
        
        <div className="relative w-56 h-56 flex items-center justify-center mb-16">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <motion.circle 
              cx="112" cy="112" r="100" 
              fill="none" stroke="#F1F5F9" strokeWidth="12" 
            />
            <motion.circle 
              cx="112" cy="112" r="100" 
              fill="none" stroke="#EF4444" strokeWidth="12" 
              strokeDasharray="628"
              animate={{ strokeDashoffset: 628 - (timeLeft/5)*628 }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </svg>
          <AnimatePresence mode="wait">
            <motion.span 
              key={timeLeft} 
              initial={{ scale: 0.5, opacity: 0, rotate: -20 }} 
              animate={{ scale: 1, opacity: 1, rotate: 0 }} 
              exit={{ scale: 1.5, opacity: 0, rotate: 20 }}
              className="text-[110px] font-[900] text-black tracking-tighter"
            >
              {timeLeft}
            </motion.span>
          </AnimatePresence>
        </div>
        
        <p className="text-[#94A3B8] text-[15px] font-[700] max-w-[200px] leading-relaxed">
          Records will be moved to recovery vault.
        </p>
      </div>

      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsStopped(true)} 
        className="group w-full py-7 rounded-[36px] bg-white border-4 border-red-500 text-red-500 font-[950] text-[22px] flex items-center justify-center gap-4 shadow-xl shadow-red-500/10 active:bg-red-500 active:text-white transition-all overflow-hidden relative"
      >
        <motion.div 
          className="absolute inset-0 bg-red-500 -z-10"
          initial={{ x: '-100%' }}
          whileTap={{ x: '0%' }}
        />
        <XCircle className="w-8 h-8" strokeWidth={3} /> STOP — Keep Data
      </motion.button>
    </div>
  );
};

export default DeleteTimerScreen;
