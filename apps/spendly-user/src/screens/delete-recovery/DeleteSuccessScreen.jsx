import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Check, RefreshCw, Home, Calendar, Clock, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { recoveryVaultService } from '../../services/recoveryVault';
import { format } from 'date-fns';

const DeleteSuccessScreen = () => {
  const [vault, setVault] = useState(null);
  const navigate = useNavigate();
  const S = { fontFamily: "'Inter', sans-serif" };

  useEffect(() => {
    recoveryVaultService.getActiveVault().then(setVault);
  }, []);

  if (!vault) return null;

  return (
    <div className="min-h-dvh bg-white flex flex-col pt-20 px-8 pb-12 safe-top safe-bottom">
      <div className="flex flex-col items-center flex-1">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative mb-12"
        >
          <div className="w-28 h-28 rounded-[36px] bg-[#F6F6F6] flex items-center justify-center border border-[#EEEEEE] shadow-sm">
             <Trash2 className="w-10 h-10 text-[#D8D8D8]" strokeWidth={2.5} />
          </div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center shadow-lg"
          >
            <Check className="w-6 h-6 text-white" strokeWidth={3} />
          </motion.div>
        </motion.div>

        <h2 className="text-[32px] font-[900] text-black tracking-tighter text-center mb-10" style={S}>
          Payment history <br/>successfully cleared.
        </h2>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full p-8 rounded-[40px] bg-emerald-50/50 border border-emerald-100 mb-10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12 blur-2xl" />
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
               <RefreshCw className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-[17px] font-[802] text-emerald-950" style={S}>Vault Active</h3>
              <p className="text-[11px] font-[700] text-emerald-600 uppercase tracking-widest" style={S}>Encrypted backup saved</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-5 bg-white rounded-2xl border border-emerald-100 flex items-center gap-4">
               <Calendar className="w-5 h-5 text-emerald-400" />
               <div className="text-left">
                  <p className="text-[10px] font-[800] text-[#AFAFAF] uppercase tracking-wider" style={S}>Expires On</p>
                  <p className="text-[14px] font-[802] text-emerald-950" style={S}>{format(new Date(vault.expiresAt), "EEEE, d MMM yyyy")}</p>
               </div>
            </div>
            <div className="p-5 bg-emerald-500 text-white rounded-2xl flex items-center gap-4 shadow-lg shadow-emerald-500/20">
               <Clock className="w-5 h-5 text-white/60" />
               <div className="text-left">
                  <p className="text-[10px] font-[900] text-white/50 uppercase tracking-wider" style={S}>Remaining Window</p>
                  <p className="text-[14px] font-[900] text-white" style={S}>72 Hours (3 Days)</p>
               </div>
            </div>
          </div>
        </motion.div>
        
        <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-[#F6F6F6] border border-[#EEEEEE]">
           <Info className="w-4 h-4 text-[#AFAFAF]" />
           <p className="text-[12px] font-[700] text-[#545454]" style={S}>Restore any time from <span className="text-black font-[802]">Settings</span></p>
        </div>
      </div>

      <motion.button 
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/home')} 
        className="w-full py-6 rounded-[32px] bg-black text-white font-[802] text-[18px] flex items-center justify-center gap-3 shadow-2xl shadow-black/20"
        style={S}
      >
        <Home className="w-5 h-5" strokeWidth={2.5} /> Done
      </motion.button>
    </div>
  );
};

export default DeleteSuccessScreen;
