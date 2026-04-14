import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { recoveryVaultService } from '../../services/recoveryVault';
import { formatDistanceToNow } from 'date-fns';

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
    const interval = setInterval(checkVault, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!vault) return;

    const updateTimer = () => {
      const expiresAt = new Date(vault.expiresAt);
      const now = new Date();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setVault(null);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (hours > 24) {
        const days = Math.floor(hours / 24);
        const remHours = hours % 24;
        setRemaining(`${days} days ${remHours} hours`);
      } else {
        setRemaining(`${hours}h ${mins}m ${secs}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [vault]);

  if (!vault) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="bg-emerald-50/80 backdrop-blur-xl border-b border-emerald-100/50 overflow-hidden sticky top-0 z-[100] shadow-sm"
    >
      <div className="px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h4 className="text-[14px] font-[800] text-green-900 tracking-tight flex items-center gap-1.5">
              Recovery available
            </h4>
            <p className="text-[12px] font-[600] text-green-700/80 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {remaining} left
            </p>
          </div>
        </div>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/recover-data')}
          className="bg-green-600 text-white px-4 py-2 rounded-xl text-[13px] font-[802] flex items-center gap-1 shadow-sm"
        >
          Recover Now <ArrowRight className="w-3.5 h-3.5" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default RecoveryBanner;
