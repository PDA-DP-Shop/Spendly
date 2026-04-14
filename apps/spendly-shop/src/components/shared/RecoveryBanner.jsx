import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { recoveryVaultService } from '../../services/recoveryVault';

const RecoveryBanner = () => {
  const [vault, setVault] = useState(null);
  const [remaining, setRemaining] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkVault = async () => {
      const activeVault = await recoveryVaultService.getActiveVault();
      setVault(activeVault);
    };
    checkVault();
    const interval = setInterval(checkVault, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!vault) return;
    const updateTimer = () => {
      const diff = new Date(vault.expiresAt) - new Date();
      if (diff <= 0) { setVault(null); return; }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setRemaining(`${hours}h ${mins}m left`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [vault]);

  if (!vault) return null;

  return (
    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="bg-emerald-50/80 backdrop-blur-xl border-b border-emerald-100/50 overflow-hidden sticky top-0 z-[100] shadow-sm">
      <div className="px-5 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-emerald-600" />
          <div>
            <h4 className="text-[13px] font-[800] text-emerald-900">Recovery available</h4>
            <p className="text-[11px] font-[600] text-emerald-600/80"><Clock className="w-3 h-3 inline" /> {remaining}</p>
          </div>
        </div>
        <button onClick={() => navigate('/recover-data')} className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-[12px] font-[802] flex items-center gap-1">
          Recover Now <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

export default RecoveryBanner;
