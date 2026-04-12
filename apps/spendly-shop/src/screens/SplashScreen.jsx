import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useShopStore } from '../store/shopStore';
import { Sparkles, Zap, Shield, Store } from 'lucide-react';

const SplashScreen = () => {
  const navigate = useNavigate();
  const { loadShop } = useShopStore();

  useEffect(() => {
    const init = async () => {
      await loadShop();
      
      setTimeout(() => {
        if (useShopStore.getState().shop) {
          navigate('/lock');
        } else {
          navigate('/onboarding');
        }
      }, 2500);
    };

    init();
  }, [loadShop, navigate]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-80 h-80 bg-black/5 rounded-full blur-[90px] -z-10 -mr-40 -mt-40" />

      <div className="relative z-10 flex flex-col items-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 100 }}
          className="relative mb-10"
        >
            <div className="w-28 h-28 bg-black rounded-[28px] shadow-2xl flex items-center justify-center relative z-20">
                <Store className="w-12 h-12 text-white" />
            </div>

            {/* Pulsing Aura */}
            <motion.div 
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute inset-[-15px] bg-black/10 rounded-[36px] blur-xl z-10"
            />
        </motion.div>
        
        <div className="text-center space-y-3">
            <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-[32px] font-[800] text-black tracking-tight"
            >
                Spendly<span className="text-[#94A3B8]">Shop</span>
            </motion.h1>

            <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-[0.3em]"
            >
                Smart Billing System
            </motion.p>
        </div>
      </div>

      <div className="fixed bottom-20 w-full px-16">
        <div className="relative h-1.5 w-full bg-[#F8FAFC] rounded-full overflow-hidden border border-[#F1F5F9]">
          <motion.div 
            initial={{ left: '-100%' }}
            animate={{ left: '100%' }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute h-full w-1/2 bg-black rounded-full"
          />
        </div>
      </div>

      <div className="fixed bottom-8 w-full text-center">
            <p className="text-[10px] font-[800] text-[#CBD5E1] uppercase tracking-widest">v1.0.0 Stable</p>
      </div>
    </div>
  );
};

export default SplashScreen;
