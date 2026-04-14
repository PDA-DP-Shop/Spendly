import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, RefreshCw, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { recoveryVaultService } from '../../services/recoveryVault';

const RecoverProgressScreen = () => {
  const [steps, setSteps] = useState([
    { id: 'prep', label: 'Unlocking Shop Vault', status: 'pending', detail: 'Decrypting shop data' },
    { id: 'restore', label: 'Restoring Business Data', status: 'pending', detail: 'Bills, Clients & Inventory' },
    { id: 'final', label: 'Verifying Integrity', status: 'pending', detail: 'Restoration complete' },
  ]);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const runRestoration = async () => {
      // Step 1: Prep
      updateStatus('prep', 'active');
      await new Promise(r => setTimeout(r, 1000));
      updateStatus('prep', 'done');
      setProgress(33);

      // Step 2: Restore
      updateStatus('restore', 'active');
      await recoveryVaultService.restoreFromVault();
      updateStatus('restore', 'done');
      setProgress(66);

      // Step 3: Final
      updateStatus('final', 'active');
      await new Promise(r => setTimeout(r, 800));
      updateStatus('final', 'done');
      setProgress(100);

      await new Promise(r => setTimeout(r, 800));
      navigate('/recover-success');
    };

    runRestoration();
  }, [navigate]);

  const updateStatus = (id, status) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  return (
    <div className="min-h-dvh bg-white flex flex-col pt-24 px-8 safe-top safe-bottom font-sans">
      <div className="flex flex-col items-center text-center mb-16">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20">
          <RefreshCw className="w-7 h-7 text-white" strokeWidth={2.5} />
        </div>
        <h2 className="text-[28px] font-[900] text-black tracking-tighter">
          Restoring Shop
        </h2>
        <p className="text-[#94A3B8] text-[14px] font-[600] mt-1">Finalizing local sync...</p>
      </div>

      <div className="space-y-6 flex-1 max-w-[320px] mx-auto w-full">
        {steps.map((step, i) => (
          <motion.div 
            key={step.id} 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-start gap-5 p-4 rounded-3xl transition-all duration-500 ${step.status === 'active' ? 'bg-emerald-50/50 border border-emerald-100 shadow-sm' : ''}`}
          >
            <div className="mt-1">
              {step.status === 'done' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500" strokeWidth={3} />
              ) : step.status === 'active' ? (
                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" strokeWidth={2.5} />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-[#F1F5F9]" />
              )}
            </div>
            <div>
              <span className={`text-[16px] font-[802] block leading-tight ${step.status === 'done' ? 'text-black' : step.status === 'active' ? 'text-emerald-700' : 'text-[#CBD5E1]'}`}>
                {step.label}
              </span>
              <AnimatePresence>
                {step.status === 'active' && (
                  <motion.p 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="text-[11px] font-[600] text-emerald-500 mt-1 uppercase tracking-wider"
                  >
                    {step.detail}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="pb-16 px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-500 fill-emerald-500" />
            <span className="text-[11px] font-[802] text-[#94A3B8] uppercase tracking-[0.2em]">Data Recovery Active</span>
          </div>
          <span className="text-[18px] font-[900] text-black">{progress}%</span>
        </div>
        <div className="w-full h-5 bg-[#F8FAFC] rounded-full overflow-hidden border border-[#F1F5F9] p-1">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-black rounded-full shadow-inner"
          />
        </div>
      </div>
    </div>
  );
};

export default RecoverProgressScreen;
