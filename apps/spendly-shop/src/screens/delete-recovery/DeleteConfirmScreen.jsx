import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ArrowRight, X, ShieldAlert, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DeleteConfirmScreen = () => {
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const isValid = confirmText === 'DELETE';
  const isLowercase = confirmText.toLowerCase() === 'delete' && confirmText !== 'DELETE';

  const handleContinue = () => {
    if (isValid) {
      navigate('/delete-timer');
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
      if (window.navigator.vibrate) window.navigator.vibrate([50, 50, 50]);
    }
  };

  return (
    <div className="min-h-dvh bg-white flex flex-col safe-top safe-bottom">
      {/* Header */}
      <div className="px-7 pt-12 pb-6 flex items-center justify-between">
        <div className="w-12 h-12 rounded-[18px] bg-red-50 flex items-center justify-center border border-red-100">
          <Trash2 className="w-5 h-5 text-red-500" strokeWidth={2.5} />
        </div>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/settings')}
          className="w-11 h-11 rounded-full bg-[#F8FAFC] border border-[#F1F5F9] flex items-center justify-center active:bg-gray-100"
        >
          <X className="w-5 h-5 text-black" strokeWidth={2.5} />
        </motion.button>
      </div>

      <div className="flex-1 px-8 pt-4 overflow-y-auto scrollbar-hide">
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        >
          <h1 className="text-[30px] font-[900] text-black tracking-tight leading-[1.1] mb-5">
            Clear all <br/><span className="text-red-500">shop data?</span>
          </h1>
          
          <div className="p-6 rounded-[32px] bg-red-50/30 border border-red-100/50 mb-10">
            <div className="flex items-center gap-3 mb-4">
              <ShieldAlert className="w-5 h-5 text-red-500" strokeWidth={2.5} />
              <p className="text-[13px] font-[802] text-red-950 uppercase tracking-wider">Permanently Deleting</p>
            </div>
            <div className="space-y-3.5">
              {[
                'All bill records',
                'All customer profiles',
                'All inventory items',
                'All credit book entries'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-[15px] font-[700] text-red-900/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500/40" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-[32px] bg-[#F8FAFC] border border-[#F1F5F9] mb-10">
            <p className="text-[12px] font-[802] text-[#94A3B8] uppercase tracking-[0.15em] mb-4">Will Stay Safe</p>
            <div className="space-y-3.5">
              {[
                'Shop Profile & Logo',
                'Business Settings',
                'Owner info & Tax details'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-[14px] font-[700] text-[#64748B]">
                  <Check className="w-4 h-4 text-emerald-500" strokeWidth={3} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className={`
              relative flex items-center h-20 px-6 rounded-[24px] border-2 transition-all duration-500 shadow-sm
              ${isValid ? 'border-emerald-500 bg-emerald-50/50' : error ? 'border-red-500 bg-red-50 animate-shake' : 'border-[#F1F5F9] bg-[#F8FAFC]'}
            `}>
              <input
                type="text"
                placeholder="TYPE DELETE"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full text-center text-[20px] font-[900] tracking-[0.2em] text-black bg-transparent placeholder:text-[#CBD5E1] outline-none"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                autoFocus
              />
            </div>
            
            <AnimatePresence>
              {isLowercase && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-500 text-[12px] font-[800] text-center uppercase tracking-widest"
                >
                  Type DELETE in capital letters
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <div className="p-8 pb-12 flex gap-4 bg-white sticky bottom-0">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/settings')}
          className="flex-1 py-5 rounded-[24px] bg-[#F8FAFC] text-[#64748B] font-[802] text-[16px]"
        >
          Cancel
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.98 }}
          animate={isValid ? { scale: [1, 1.02, 1], transition: { repeat: Infinity, duration: 2 } } : {}}
          onClick={handleContinue}
          disabled={!isValid}
          className={`
            flex-1 py-5 rounded-[24px] font-[802] text-[16px] flex items-center justify-center gap-2 transition-all duration-500
            ${isValid ? 'bg-black text-white shadow-2xl shadow-black/20' : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'}
          `}
        >
          Confirm <ArrowRight className="w-5 h-5" strokeWidth={3} />
        </motion.button>
      </div>
    </div>
  );
};

export default DeleteConfirmScreen;
