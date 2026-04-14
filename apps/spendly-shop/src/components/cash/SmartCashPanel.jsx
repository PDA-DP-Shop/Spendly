import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit3, 
  Check, 
  AlertCircle, 
  MinusCircle, 
  PlusCircle,
  ArrowRight,
  Wallet
} from 'lucide-react';
import { 
  findBestPayment, 
  recalculateWithCustomNotes, 
  getTotalCash 
} from '../../utils/smartCashCalculator';
import NoteCard from './NoteCard';

export default function SmartCashPanel({ expenseAmount, userNotes, currency, onPaymentConfirmed }) {
  const [isManualMode, setIsManualMode] = useState(false);
  const [customGiveNotes, setCustomGiveNotes] = useState({});
  const [changeOverrides, setChangeOverrides] = useState({});
  const [giveOverrides, setGiveOverrides] = useState({});
  
  const totalCash = useMemo(() => getTotalCash(userNotes), [userNotes]);
  const isInsufficient = totalCash < expenseAmount;

  // -- Smart Suggestion Logic
  const smartResult = useMemo(() => {
    return findBestPayment(expenseAmount, userNotes, currency);
  }, [expenseAmount, userNotes, currency]);

  // -- Manual Mode Logic
  const manualResult = useMemo(() => {
    return recalculateWithCustomNotes(customGiveNotes, expenseAmount, currency);
  }, [customGiveNotes, expenseAmount, currency]);

  // -- Final Results choice
  const activeResult = isManualMode ? manualResult : smartResult;

  // Apply giving overrides (smart mode only for now, manual mode user picks)
  const finalGiveNotes = useMemo(() => {
    const base = isManualMode ? customGiveNotes : smartResult.suggestedGive;
    if (!base) return {};
    const final = { ...base };

    Object.entries(giveOverrides).forEach(([denom, targetType]) => {
      const numericDenom = parseFloat(denom);
      const noteKey = numericDenom;
      const coinKey = `${numericDenom}_coin`;
      const currentNoteCount = final[noteKey] || 0;
      const currentCoinCount = final[coinKey] || 0;
      const totalGiving = currentNoteCount + currentCoinCount;

      if (totalGiving > 0) {
        if (targetType === 'coin' && (userNotes[coinKey] >= totalGiving)) {
          delete final[noteKey];
          final[coinKey] = totalGiving;
        } else if (targetType === 'note' && (userNotes[noteKey] >= totalGiving)) {
          delete final[coinKey];
          final[noteKey] = totalGiving;
        }
      }
    });

    return final;
  }, [isManualMode, customGiveNotes, smartResult.suggestedGive, giveOverrides, userNotes]);

  // Enhanced changeNotes with overrides
  const finalChangeNotes = useMemo(() => {
    const base = isManualMode ? activeResult.changeNotes : smartResult.changeNotes;
    if (!base) return {};
    const final = { ...base };
    
    Object.entries(changeOverrides).forEach(([denom, targetType]) => {
      const numericDenom = parseFloat(denom);
      const noteCount = final[numericDenom] || 0;
      const coinCount = final[`${numericDenom}_coin`] || 0;
      const totalCount = noteCount + coinCount;
      
      if (totalCount > 0) {
        if (targetType === 'coin') {
          delete final[numericDenom];
          final[`${numericDenom}_coin`] = totalCount;
        } else {
          delete final[`${numericDenom}_coin`];
          final[numericDenom] = totalCount;
        }
      }
    });
    return final;
  }, [isManualMode, activeResult.changeNotes, smartResult.changeNotes, changeOverrides]);

  const toggleGiveForm = (key) => {
    if (isManualMode) return; 
    const numericDenom = parseFloat(key.toString().split('_')[0]);
    if (numericDenom !== 10 && numericDenom !== 20) return;

    const currentType = key.toString().includes('_coin') ? 'coin' : 'note';
    const targetType = currentType === 'coin' ? 'note' : 'coin';

    const targetKey = targetType === 'coin' ? `${numericDenom}_coin` : numericDenom;
    const required = finalGiveNotes[key];
    if ((userNotes[targetKey] || 0) < required) return;

    setGiveOverrides(prev => ({ ...prev, [numericDenom]: targetType }));
  };

  const toggleChangeForm = (denom) => {
    const numericDenom = parseFloat(denom.toString().split('_')[0]);
    if (numericDenom !== 10 && numericDenom !== 20) return;
    
    setChangeOverrides(prev => ({
      ...prev,
      [numericDenom]: denom.toString().includes('_coin') ? 'note' : 'coin'
    }));
  };

  const isUnderpaying = activeResult.isUnderpaying || (!isManualMode && !smartResult.isPossible);

  const handleAdjustNote = (denom, delta) => {
    setCustomGiveNotes(prev => {
      const current = prev[denom] || 0;
      const maxAvailable = userNotes[denom] || 0;
      const next = Math.max(0, Math.min(maxAvailable, current + delta));
      
      const newNotes = { ...prev };
      if (next === 0) delete newNotes[denom];
      else newNotes[denom] = next;
      
      return newNotes;
    });
  };

  const handleConfirm = () => {
    if (isInsufficient || isUnderpaying) return;
    
    onPaymentConfirmed({
      type: "cash",
      expenseAmount,
      notesGiven: finalGiveNotes,
      totalGiven: activeResult.totalGiven,
      changeAmount: activeResult.changeAmount,
      changeNotes: finalChangeNotes
    });
  };

  useEffect(() => {
    if (smartResult.isPossible && Object.keys(customGiveNotes).length === 0) {
      setCustomGiveNotes(smartResult.suggestedGive || {});
    }
  }, [smartResult]);

  return (
    <div className="space-y-4">
      {/* SECTION 1: CASH SUMMARY */}
      <div className="bg-[#F8FAFC] p-4 rounded-[28px] border border-[#F1F5F9] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-500 border border-slate-100">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-[800] text-slate-400 uppercase tracking-widest leading-none mb-1">In Pocket</p>
              <h3 className="text-[15px] font-[900] text-black font-sora">{currency}{totalCash.toLocaleString()}</h3>
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto p-1">
            {Object.entries(userNotes)
              .filter(([_, c]) => c > 0)
              .sort((a, b) => parseFloat(b[0].split('_')[0]) - parseFloat(a[0].split('_')[0]))
              .slice(0, 3)
              .map(([denom, count]) => (
                <NoteCard key={denom} value={denom} count={count} size="sm" currency={currency} />
              ))}
          </div>
        </div>

        {isInsufficient && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }}
            className="flex items-center gap-2 p-2.5 bg-red-50 rounded-xl border border-red-100 text-red-600"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-[10px] font-[900] uppercase tracking-tighter">
              Short by {currency}{(expenseAmount - totalCash).toLocaleString()}
            </p>
          </motion.div>
        )}
      </div>

      {/* SECTION 2: SMART SUGGESTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
           <h4 className="text-[10px] font-[950] text-[#AFAFAF] uppercase tracking-[0.2em] flex items-center gap-2">
             {isManualMode ? 'Manual Selection' : 'Intelligent Suggestion'}
           </h4>
           <button 
            onClick={() => setIsManualMode(!isManualMode)}
            className="text-[10px] font-[900] text-black uppercase tracking-widest flex items-center gap-1 active:scale-95 transition-all"
           >
              <Edit3 className="w-3 h-3" /> {isManualMode ? 'Smart Suggestion' : 'Edit Manually'}
           </button>
        </div>

        <AnimatePresence mode="wait">
          {!isManualMode ? (
            <motion.div 
              key="smart"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-3"
            >
              <div className="bg-white p-4 rounded-[32px] border border-[#F1F5F9] flex flex-col items-center gap-3 text-center transition-all hover:border-emerald-200">
                 <p className="text-[9px] font-[950] text-emerald-600 uppercase tracking-widest">Customer Gives</p>
                 <div className="flex flex-wrap justify-center gap-2">
                    {smartResult.isPossible ? (
                      Object.entries(finalGiveNotes)
                        .sort((a, b) => parseFloat(b[0].split('_')[0]) - parseFloat(a[0].split('_')[0]))
                        .map(([denom, count]) => (
                        <motion.div key={denom} whileTap={{ scale: 0.9 }} onClick={() => toggleGiveForm(denom)}>
                          <NoteCard value={denom} count={count} size="md" currency={currency} isHighlighted />
                        </motion.div>
                      ))
                    ) : '-'}
                 </div>
                 <div className="mt-1 flex flex-col items-center">
                    <p className="text-[12px] font-[950] text-black font-sora">{currency}{activeResult.totalGiven?.toLocaleString() || 0}</p>
                    <p className="text-[7px] font-[900] text-slate-300 uppercase tracking-tighter mt-0.5">Tap cards to switch</p>
                 </div>
              </div>

              <div className="bg-white p-4 rounded-[32px] border border-[#F1F5F9] flex flex-col items-center gap-3 text-center transition-all hover:border-orange-100">
                 <p className="text-[9px] font-[950] text-orange-500 uppercase tracking-widest">You Give Back</p>
                 <div className="flex flex-wrap justify-center gap-2">
                    {activeResult.isExactChange ? (
                      <div className="flex flex-col items-center gap-1 py-1">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <Check className="w-5 h-5" strokeWidth={3} />
                        </div>
                        <p className="text-[8px] font-[950] text-emerald-600 uppercase tracking-widest">Exact!</p>
                      </div>
                    ) : (
                      Object.entries(finalChangeNotes)
                        .sort((a, b) => parseFloat(b[0].split('_')[0]) - parseFloat(a[0].split('_')[0]))
                        .map(([denom, count]) => (
                        <motion.div key={denom} whileTap={{ scale: 0.9 }} onClick={() => toggleChangeForm(denom)}>
                          <NoteCard value={denom} count={count} size="sm" currency={currency} />
                        </motion.div>
                      ))
                    )}
                 </div>
                 {!activeResult.isExactChange && (
                   <div className="mt-1 flex flex-col items-center">
                      <p className="text-[12px] font-[950] text-orange-500 font-sora">{currency}{activeResult.changeAmount?.toLocaleString() || 0}</p>
                      <p className="text-[8px] font-[900] text-slate-300 uppercase tracking-tighter mt-0.5">Tap cards to switch</p>
                   </div>
                 )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="manual"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white p-5 rounded-[32px] border border-[#EEEEEE] shadow-sm flex flex-col gap-4"
            >
              <div className="flex-1 flex flex-col gap-3 min-h-[300px]">
                {Object.entries(userNotes)
                  .filter(([_, count]) => count > 0)
                  .sort((a, b) => {
                    const valA = parseFloat(a[0].split('_')[0]);
                    const valB = parseFloat(b[0].split('_')[0]);
                    if (valB !== valA) return valB - valA;
                    return a[0].includes('_coin') ? 1 : -1;
                  })
                  .map(([denom, maxCount]) => {
                    const selectedCount = customGiveNotes[denom] || 0;
                    const numericDenom = parseFloat(denom.toString().split('_')[0]);
                    return (
                      <div key={denom} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <NoteCard value={denom} size="md" currency={currency} showCount={false} />
                          <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                             <button onClick={() => handleAdjustNote(denom, -1)} disabled={selectedCount <= 0} className={selectedCount <= 0 ? 'opacity-20' : 'opacity-100'}>
                               <MinusCircle className="w-4 h-4 text-slate-400" />
                             </button>
                             <span className="text-[13px] font-[900] text-black w-4 text-center font-sora">{selectedCount}</span>
                             <button onClick={() => handleAdjustNote(denom, 1)} disabled={selectedCount >= maxCount} className={selectedCount >= maxCount ? 'opacity-20' : 'opacity-100'}>
                               <PlusCircle className="w-4 h-4 text-black" />
                             </button>
                          </div>
                        </div>
                        <p className="text-[12px] font-[950] text-black font-sora pr-1">{currency}{(selectedCount * numericDenom).toLocaleString()}</p>
                      </div>
                    );
                  })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pt-2">
        <motion.div 
          layout
          className={`bg-white p-4 rounded-[28px] border flex items-center justify-between shadow-sm transition-all ${isUnderpaying ? 'bg-red-50 border-red-100' : 'border-[#F1F5F9]'}`}
        >
          <div>
            <p className="text-[9px] font-[950] text-[#AFAFAF] uppercase tracking-widest mb-0.5">Total Given</p>
            <h4 className="text-[15px] font-[950] text-black font-sora">{currency}{activeResult.totalGiven?.toLocaleString()}</h4>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 mx-2" />
          <div className="text-right">
            {isUnderpaying ? (
              <div>
                <p className="text-[9px] font-[950] text-red-500 uppercase tracking-widest mb-0.5 animate-pulse">Required</p>
                <h4 className="text-[15px] font-[950] text-red-500 font-sora">{currency}{(expenseAmount - activeResult.totalGiven).toLocaleString()}</h4>
              </div>
            ) : (
              <>
                <p className="text-[9px] font-[950] text-orange-500 uppercase tracking-widest mb-0.5">Change Back</p>
                <h4 className={`text-[15px] font-[950] font-sora ${activeResult.isExactChange ? 'text-emerald-500' : 'text-orange-500'}`}>
                  {currency}{activeResult.changeAmount?.toLocaleString()} {activeResult.isExactChange && '✅'}
                </h4>
              </>
            )}
          </div>
        </motion.div>
      </div>

      <div className="pt-2">
        <motion.button
          whileTap={{ scale: 0.96 }}
          disabled={isInsufficient || isUnderpaying}
          onClick={handleConfirm}
          className={`w-full py-5 rounded-[28px] font-[950] text-[13px] uppercase tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-3 ${
            isInsufficient || isUnderpaying 
            ? 'bg-slate-100 text-slate-400 opacity-50' 
            : 'bg-black text-white'
          }`}
        >
          {isUnderpaying ? 'Adjust Selection' : `Confirm Receipt of ${currency}${expenseAmount.toLocaleString()}`}
          {!isUnderpaying && <Check className="w-4 h-4" />}
        </motion.button>
      </div>
    </div>
  );
}
