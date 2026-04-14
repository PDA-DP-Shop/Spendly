import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ArrowRight, X, Clock, Database, Users, Package, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { recoveryVaultService } from '../../services/recoveryVault';

const RecoverDataScreen = () => {
  const [vault, setVault] = useState(null);
  const [remaining, setRemaining] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadVault = async () => {
      const activeVault = await recoveryVaultService.getActiveVault();
      if (!activeVault) {
        navigate('/settings');
        return;
      }
      setVault(activeVault);
    };
    loadVault();
  }, [navigate]);

  useEffect(() => {
    if (!vault) return;
    const updateTimer = () => {
      const diff = new Date(vault.expiresAt) - new Date();
      if (diff <= 0) {
        navigate('/settings');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setRemaining(`${days}d ${hours}h ${mins}m`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [vault, navigate]);

  if (!vault) return null;

  return (
    <div className="min-h-dvh bg-white flex flex-col safe-top safe-bottom font-sans">
      <div className="px-7 pt-12 pb-6 flex justify-between items-center bg-white sticky top-0 z-20">
        <div className="w-12 h-12 rounded-[20px] bg-emerald-50 flex items-center justify-center border border-emerald-100">
          <RefreshCw className="w-6 h-6 text-emerald-600" strokeWidth={2.5} />
        </div>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/settings')} 
          className="w-11 h-11 rounded-full bg-[#F8FAFC] border border-[#F1F5F9] flex items-center justify-center"
        >
          <X className="w-5 h-5 text-black" strokeWidth={2.5} />
        </motion.button>
      </div>

      <div className="flex-1 px-8 pt-4 overflow-y-auto scrollbar-hide">
        <motion.div
           initial={{ y: 20 }}
           animate={{ y: 0 }}
        >
          <h1 className="text-[32px] font-[900] text-black tracking-tighter leading-[1.1] mb-4">
            Detected <br/><span className="text-emerald-500">shop backup.</span>
          </h1>
          
          <p className="text-[#94A3B8] text-[15px] font-[600] leading-relaxed mb-10">
            A secure snapshot of your shop was found in the local vault. You can restore your business data instantly.
          </p>

          <div className="space-y-4 mb-10">
            <div className="p-6 rounded-[32px] bg-[#F8FAFC] border border-[#F1F5F9] flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                <Database className="w-6 h-6 text-black" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <p className="text-[18px] font-[802] text-black">{vault.totalBills} Bills Issued</p>
                <p className="text-[12px] font-[700] text-[#94A3B8] uppercase tracking-wider">Historical Transactions</p>
              </div>
            </div>
            
            <div className="p-6 rounded-[32px] bg-[#F8FAFC] border border-[#F1F5F9] flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                <Users className="w-6 h-6 text-black" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <p className="text-[18px] font-[802] text-black">{vault.totalCustomers} Customers</p>
                <p className="text-[12px] font-[700] text-[#94A3B8] uppercase tracking-wider">Client Book & Credit</p>
              </div>
            </div>

            <div className="p-6 rounded-[32px] bg-[#F8FAFC] border border-[#F1F5F9] flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                <Package className="w-6 h-6 text-black" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <p className="text-[18px] font-[802] text-black">{vault.totalItems} Products</p>
                <p className="text-[12px] font-[700] text-[#94A3B8] uppercase tracking-wider">Saved Inventory Items</p>
              </div>
            </div>
          </div>

          <motion.div 
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="p-8 rounded-[40px] bg-emerald-50/50 border-2 border-emerald-100 flex flex-col items-center shadow-lg shadow-emerald-500/5"
          >
            <Zap className="w-6 h-6 text-emerald-500 mb-2 fill-emerald-500" />
            <p className="text-[11px] font-[802] text-emerald-600 uppercase tracking-[0.2em] mb-3">Backup Window</p>
            <div className="flex items-center gap-3 text-emerald-950 text-[20px] font-[900]">
              <Clock className="w-5 h-5" strokeWidth={3} /> {remaining}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="p-8 pb-12 flex flex-col gap-4 bg-white sticky bottom-0">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/recover-progress')}
          className="w-full py-6 rounded-[32px] bg-emerald-600 text-white font-[802] text-[18px] shadow-2xl shadow-emerald-600/20 flex items-center justify-center gap-3"
        >
          Restore Shop Data
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/settings')}
          className="w-full py-5 rounded-[24px] bg-[#F8FAFC] text-[#64748B] font-[802] text-[15px]"
        >
          Cancel
        </motion.button>
      </div>
    </div>
  );
};

export default RecoverDataScreen;
