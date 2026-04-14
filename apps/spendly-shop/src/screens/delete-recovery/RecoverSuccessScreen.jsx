import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Check, Star, Zap, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

const RecoverSuccessScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    confetti({ 
      particleCount: 150, 
      spread: 70, 
      origin: { y: 0.6 },
      colors: ['#10B981', '#34D399', '#6EE7B7']
    });
  }, []);

  return (
    <div className="min-h-dvh bg-white flex flex-col pt-20 px-8 pb-12 safe-top safe-bottom font-sans">
      <div className="flex flex-col items-center flex-1">
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="w-28 h-28 rounded-[40px] bg-emerald-500 flex items-center justify-center mb-10 shadow-2xl shadow-emerald-500/30"
        >
          <Check className="w-12 h-12 text-white" strokeWidth={4} />
        </motion.div>

        <h2 className="text-[36px] font-[900] text-black tracking-tighter text-center leading-[1.1] mb-6">
          Shop is <br/><span className="text-emerald-500">fully back.</span>
        </h2>
        
        <p className="text-[#94A3B8] text-center font-[600] text-[16px] mb-12">
          Your records, customers and inventory <br/>have been fully restored.
        </p>

        <div className="w-full space-y-4 max-w-[320px]">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-[32px] bg-[#F8FAFC] border border-[#F1F5F9] flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
               <Store className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-[15px] font-[802] text-black">Business Sync Done</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-[32px] bg-[#F8FAFC] border border-[#F1F5F9] flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
               <Zap className="w-5 h-5 text-indigo-500 fill-indigo-500" />
            </div>
            <span className="text-[15px] font-[802] text-black">Integrity Confirmed</span>
          </motion.div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <motion.button 
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/home')} 
          className="w-full py-6 rounded-[32px] bg-black text-white font-[802] text-[18px] flex items-center justify-center gap-3 shadow-2xl shadow-black/20"
        >
          <Home className="w-5 h-5" strokeWidth={2.5} /> Confirm
        </motion.button>
      </div>
    </div>
  );
};

export default RecoverSuccessScreen;
