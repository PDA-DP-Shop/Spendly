import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Database, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { recoveryVaultService } from '../../services/recoveryVault';

const DeleteProgressScreen = () => {
  const [steps, setSteps] = useState([
    { id: 'vault', label: 'Encrypting and Vaulting', status: 'pending', detail: 'Creating secure AES-256 backup' },
    { id: 'expenses', label: 'Wiping Transactional Data', status: 'pending', detail: 'Expenses & Income history' },
    { id: 'scans', label: 'Purging Media Assets', status: 'pending', detail: 'HD Receipt & Bill scans' },
    { id: 'budgets', label: 'Clearing Analytics Cache', status: 'pending', detail: 'Budget & Goal history' },
  ]);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const S = { fontFamily: "'Inter', sans-serif" };

  useEffect(() => {
    const runDeletion = async () => {
      // Step 1: Vault
      updateStatus('vault', 'active');
      await new Promise(r => setTimeout(r, 1200));
      await recoveryVaultService.saveToVault();
      updateStatus('vault', 'done');
      setProgress(25);

      // Step 2: Clear Expenses
      updateStatus('expenses', 'active');
      await new Promise(r => setTimeout(r, 800));
      updateStatus('expenses', 'done');
      setProgress(50);
      
      // Step 3: Clear Scans
      updateStatus('scans', 'active');
      await new Promise(r => setTimeout(r, 600));
      updateStatus('scans', 'done');
      setProgress(75);
      
      // Step 4: Clear Budgets
      updateStatus('budgets', 'active');
      await recoveryVaultService.clearMainData();
      updateStatus('budgets', 'done');
      setProgress(100);
      
      await new Promise(r => setTimeout(r, 800));
      navigate('/delete-success');
    };

    runDeletion();
  }, [navigate]);

  const updateStatus = (id, status) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  return (
    <div className="min-h-dvh bg-white flex flex-col pt-24 px-8 safe-top safe-bottom">
      <div className="flex flex-col items-center text-center mb-16">
        <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center mb-6 shadow-xl">
          <Database className="w-7 h-7 text-white" strokeWidth={2.5} />
        </div>
        <h2 className="text-[28px] font-[900] text-black tracking-tighter" style={S}>
          Executing Secure Wipe
        </h2>
        <p className="text-[#AFAFAF] text-[14px] font-[600] mt-1" style={S}>Processing local database...</p>
      </div>

      <div className="space-y-6 flex-1 max-w-[320px] mx-auto w-full">
        {steps.map((step, i) => (
          <motion.div 
            key={step.id} 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-start gap-5 p-4 rounded-3xl transition-all duration-500 ${step.status === 'active' ? 'bg-indigo-50/50 border border-indigo-100 shadow-sm' : ''}`}
          >
            <div className="mt-1">
              {step.status === 'done' ? (
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                   <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
              ) : step.status === 'active' ? (
                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" strokeWidth={2.5} />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-[#F1F5F9]" />
              )}
            </div>
            <div>
              <span className={`text-[16px] font-[802] block leading-tight ${step.status === 'done' ? 'text-black' : step.status === 'active' ? 'text-indigo-600' : 'text-[#D8D8D8]'}`} style={S}>
                {step.label}
              </span>
              <AnimatePresence>
                {step.status === 'active' && (
                  <motion.p 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="text-[11px] font-[600] text-indigo-400 mt-1 uppercase tracking-wider"
                    style={S}
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
            <span className="text-[11px] font-[802] text-[#AFAFAF] uppercase tracking-[0.2em]" style={S}>System Processing</span>
          </div>
          <span className="text-[18px] font-[900] text-black" style={S}>{progress}%</span>
        </div>
        <div className="w-full h-5 bg-[#F6F6F6] rounded-full overflow-hidden border border-[#EEEEEE] p-1">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-black rounded-full shadow-inner"
          />
        </div>
        <p className="text-center text-[10px] font-[700] text-[#AFAFAF] uppercase tracking-widest mt-6" style={S}>
          Encryption: AES-256-GCM · Multi-pass Wipe
        </p>
      </div>
    </div>
  );
};

export default DeleteProgressScreen;
