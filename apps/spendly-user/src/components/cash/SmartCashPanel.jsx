<<<<<<< HEAD
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Banknote, 
  ChevronRight, 
  Edit3, 
  Check, 
  AlertCircle, 
  MinusCircle, 
  PlusCircle,
  ArrowRight,
  Wallet
} from 'lucide-react';
=======
import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit2, Minus, Plus, AlertCircle, CheckCircle2, Wallet, ArrowRight } from 'lucide-react'
>>>>>>> 41f113d (upgrade scanner)
import { 
  findBestPayment, 
  recalculateWithCustomNotes, 
  getTotalCash 
<<<<<<< HEAD
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
    if (isManualMode) return; // In manual mode they pick directly
    const numericDenom = parseFloat(key.toString().split('_')[0]);
    if (numericDenom !== 10 && numericDenom !== 20) return;

    const currentType = key.toString().includes('_coin') ? 'coin' : 'note';
    const targetType = currentType === 'coin' ? 'note' : 'coin';

    // Must have enough in wallet to switch
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

  // Initialize manual mode with smart suggestion notes for a seamless transition
  useEffect(() => {
    if (smartResult.isPossible && Object.keys(customGiveNotes).length === 0) {
      setCustomGiveNotes(smartResult.suggestedGive || {});
    }
  }, [smartResult]);

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

  // Initialize manual mode
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
            {Object.entries(userNotes).filter(([_, c]) => c > 0).slice(0, 3).map(([denom, count]) => (
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
                 <p className="text-[9px] font-[950] text-emerald-600 uppercase tracking-widest">You Give</p>
                 <div className="flex flex-wrap justify-center gap-2">
                    {smartResult.isPossible ? (
                      Object.entries(finalGiveNotes)
                        .sort((a, b) => parseFloat(b[0].split('_')[0]) - parseFloat(a[0].split('_')[0]))
                        .map(([denom, count]) => (
                        <motion.div 
                          key={denom} 
                          whileTap={{ scale: 0.9 }} 
                          onClick={() => toggleGiveForm(denom)}
                        >
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
                 <p className="text-[9px] font-[950] text-orange-500 uppercase tracking-widest">You Receive</p>
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
                        <motion.div 
                          key={denom} 
                          whileTap={{ scale: 0.9 }} 
                          onClick={() => toggleChangeForm(denom)}
                          title="Tap to switch Note/Coin"
                        >
                          <NoteCard value={denom} count={count} size="sm" currency={currency} />
                        </motion.div>
                      ))
                    )}
                 </div>
                 {!activeResult.isExactChange && (
                   <div className="mt-1 flex flex-col items-center">
                      <p className="text-[12px] font-[950] text-orange-500 font-sora">{currency}{activeResult.changeAmount?.toLocaleString() || 0}</p>
                      <p className="text-[8px] font-[900] text-slate-300 uppercase tracking-tighter mt-0.5">Tap cards to switch type</p>
                   </div>
                 )}
              </div>
            </motion.div>
          ) : (
            /* SECTION 3: MANUAL EDIT MODE */
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
                    // If values are same, put notes (no suffix) before coins
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

              {/* Receive Adjustments in Manual Mode */}
              {!activeResult.isExactChange && !activeResult.isUnderpaying && (
                <div className="pt-3 border-t border-slate-50 flex flex-col items-center gap-2">
                  <p className="text-[8px] font-[952] text-slate-300 uppercase tracking-[0.2em]">Received Change (Tap to toggle)</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {Object.entries(finalChangeNotes)
                      .sort((a, b) => parseFloat(b[0].split('_')[0]) - parseFloat(a[0].split('_')[0]))
                      .map(([denom, count]) => (
                      <motion.div key={denom} whileTap={{ scale: 0.9 }} onClick={() => toggleChangeForm(denom)}>
                        <NoteCard value={denom} count={count} size="sm" currency={currency} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SECTION 4: LIVE RESULT BAR (NOT FIXED) */}
      <div className="pt-2">
        <motion.div 
          layout
          className={`bg-white p-4 rounded-[28px] border flex items-center justify-between shadow-sm transition-all ${isUnderpaying ? 'bg-red-50 border-red-100' : 'border-[#F1F5F9]'}`}
        >
          <div>
            <p className="text-[9px] font-[950] text-[#AFAFAF] uppercase tracking-widest mb-0.5">Total Handing</p>
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

      {/* SECTION 5: CONFIRM BUTTON (NOT FIXED) */}
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
          {isUnderpaying ? 'Adjust Selection' : `Pay ${currency}${expenseAmount.toLocaleString()} in Cash`}
          {!isUnderpaying && <Check className="w-4 h-4" />}
        </motion.button>
      </div>

    </div>
  );
=======
} from '../../utils/smartCashCalculator'
import CURRENCY_NOTES from '../../constants/currencyNotes'
import { formatMoney } from '../../utils/formatMoney'
import NoteCard from './NoteCard'

const SORA = { fontFamily: "'Sora', sans-serif" }
const DM_SANS = { fontFamily: "'DM Sans', sans-serif" }
const S = { fontFamily: "'Inter', sans-serif" }

const parseKey = (key) => {
  if (!key || !key.includes('_')) return { value: Number(key), type: 'note' }
  const [v, t] = key.split('_')
  return { value: parseFloat(v), type: t }
}

export default function SmartCashPanel({ expenseAmount, userNotes, currency = 'INR', onPaymentConfirmed }) {
  const [isManual, setIsManual] = useState(false)
  const [manualNotes, setManualNotes] = useState({})
  
  // 1. Calculate Smart Suggestion
  const smartSuggestion = useMemo(() => {
    return findBestPayment(expenseAmount, userNotes, currency)
  }, [expenseAmount, userNotes, currency])

  // 2. Determine Current Results based on Mode
  const currentResult = useMemo(() => {
    if (isManual) {
      return recalculateWithCustomNotes(manualNotes, expenseAmount, currency)
    }
    return {
      totalGiven: smartSuggestion.totalGiven || 0,
      changeAmount: smartSuggestion.changeAmount || 0,
      changeNotes: smartSuggestion.changeNotes || {},
      notesGiven: smartSuggestion.suggestedGive || {},
      isExactChange: smartSuggestion.isExactChange,
      isPossible: smartSuggestion.isPossible,
      isUnderpaying: false // smartSuggestion is never underpaying if possible
    }
  }, [isManual, manualNotes, smartSuggestion, expenseAmount, currency])

  // 3. Initialize Manual Notes when entering Manual Mode
  const enterManualMode = () => {
    setManualNotes(smartSuggestion.suggestedGive || {})
    setIsManual(true)
  }

  const resetToSmart = () => {
    setIsManual(false)
  }

  // 4. Handle Increment/Decrement in Manual Mode
  const updateManualCount = (key, delta) => {
    const currentCount = manualNotes[key] || 0
    const maxCount = userNotes[key] || 0
    const newCount = Math.max(0, Math.min(maxCount, currentCount + delta))
    
    setManualNotes(prev => ({
      ...prev,
      [key]: newCount
    }))
  }

  const totalCashAvailable = getTotalCash(userNotes)
  const isEnoughTotal = totalCashAvailable >= expenseAmount
  const canConfirm = isEnoughTotal && !currentResult.isUnderpaying

  const currencyConfig = CURRENCY_NOTES[currency] || CURRENCY_NOTES.INR
  const noteColors = currencyConfig.noteColors

  return (
    <div className="flex flex-col gap-4 pb-6 max-w-full overflow-x-hidden">
      
      {/* SECTION 1: YOUR CASH SUMMARY */}
      <section className="px-1">
        <div className="bg-[#F1F5F9] rounded-[24px] p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-slate-500" />
              <p className="text-[13px] font-[700] text-slate-600" style={DM_SANS}>
                You have {formatMoney(totalCashAvailable, currency)} in cash
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(userNotes).filter(([_, count]) => count > 0).map(([key, count]) => {
              const { value, type } = parseKey(key)
              return <NoteCard key={key} value={value} type={type} currency={currency} count={count} size="sm" />
            })}
          </div>
        </div>

        {!isEnoughTotal && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-red-50 border border-red-100 rounded-[20px] p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-[13px] font-[800] text-red-600" style={DM_SANS}>
              Not enough cash (short by {formatMoney(expenseAmount - totalCashAvailable, currency)})
            </p>
          </motion.div>
        )}
      </section>

      {/* SECTION 2 & 3: SUGGESTION / MANUAL MODE */}
      <section className="px-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-base">💡</span>
            <h3 className="text-[16px] font-[902] text-black tracking-tight" style={DM_SANS}>
              {isManual ? 'Customize payment' : 'Smart suggestion'}
            </h3>
          </div>
          {!isManual && isEnoughTotal && (
            <button onClick={enterManualMode} className="text-[12px] font-[800] text-slate-400 uppercase tracking-wider">
              Edit manually
            </button>
          )}
          {isManual && (
            <button onClick={() => setIsManual(false)} className="text-[12px] font-[800] text-[#7C3AED] uppercase tracking-wider">
              Reset smart
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!isManual ? (
            <motion.div 
              key="smart"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-2 gap-4"
            >
              {/* YOU GIVE */}
              <div className="bg-white border border-[#EEEEEE] rounded-[32px] p-6 flex flex-col gap-5 shadow-sm">
                <p className="text-[10px] font-[900] text-black/40 uppercase tracking-[0.2em] text-center" style={DM_SANS}>You Give</p>
                <div className="flex flex-col items-center gap-6">
                  {Object.entries(currentResult.notesGiven).map(([key, count]) => {
                    const { value, type } = parseKey(key)
                    return (
                      <div key={key} className="flex flex-col items-center gap-1.5">
                        <NoteCard value={value} type={type} currency={currency} count={count} size="md" isHighlighted />
                        <span className="text-[10px] font-[900] text-black/30 uppercase tracking-tighter" style={S}>
                          {currencyConfig.symbol}{value} {type}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-auto pt-4 border-t border-[#F1F5F9] text-center">
                  <p className="text-[16px] font-[900] text-black" style={SORA}>
                    Total = {formatMoney(currentResult.totalGiven, currency)}
                  </p>
                </div>
              </div>

              {/* YOU RECEIVE */}
              <div className="bg-white border border-[#EEEEEE] rounded-[32px] p-6 flex flex-col gap-5 shadow-sm">
                <p className="text-[10px] font-[900] text-black/40 uppercase tracking-[0.2em] text-center" style={DM_SANS}>You Receive</p>
                {currentResult.isExactChange ? (
                  <div className="flex flex-col items-center justify-center flex-1 gap-2 text-center py-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    <p className="text-[14px] font-[900] text-emerald-600" style={DM_SANS}>Exact change!</p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col items-center gap-6">
                      {Object.entries(currentResult.changeNotes).map(([note, count]) => (
                        <div key={note} className="flex flex-col items-center gap-1.5">
                          <NoteCard value={Number(note)} type={Number(note) <= 2 ? 'coin' : 'note'} currency={currency} count={count} size="md" />
                          <span className="text-[10px] font-[900] text-black/30 uppercase tracking-tighter" style={S}>
                            {currencyConfig.symbol}{note}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-auto pt-4 border-t border-[#F1F5F9] text-center">
                      <p className="text-[16px] font-[900] text-black" style={SORA}>
                        Change = {formatMoney(currentResult.changeAmount, currency)}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
               key="manual"
               initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
               className="space-y-4 overflow-hidden"
             >
               <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-[#EEEEEE] px-4 py-8 flex flex-col gap-6">
                <div className="flex flex-col">
                  {Object.entries(userNotes).filter(([_, count]) => count > 0).map(([key, max]) => {
                    const { value, type } = parseKey(key)
                    const count = manualNotes[key] || 0
                    return (
                      <div key={key} className="flex items-center justify-between py-5 border-b border-[#F8FAFC] last:border-0">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center gap-2 min-w-[100px]">
                            <NoteCard value={value} type={type} currency={currency} size="md" showCount={false} />
                            <p className="text-[10px] font-[900] text-slate-400 uppercase tracking-tighter text-center" style={S}>
                              {currencyConfig.symbol}{value} {type}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-5">
                          <div className="flex items-center gap-3 bg-[#F6F6F6] rounded-full p-1 border border-[#EEEEEE]">
                            <motion.button whileTap={{ scale: 0.8 }} 
                              onClick={() => updateManualCount(key, -1)}
                              disabled={count === 0}
                              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${count === 0 ? 'text-black/10' : 'text-black/40 hover:text-black'}`}>
                              <Minus className="w-3 h-3" strokeWidth={4} />
                            </motion.button>
                            <span className="w-4 text-center text-[14px] font-[900] text-black" style={SORA}>{count}</span>
                            <motion.button whileTap={{ scale: 0.8 }}
                              onClick={() => updateManualCount(key, 1)}
                              disabled={count >= max}
                              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${count >= max ? 'bg-black/5 text-black/10' : 'bg-black text-white shadow-lg shadow-black/10 active:scale-95'}`}>
                              <Plus className="w-3 h-3" strokeWidth={4} />
                            </motion.button>
                          </div>
                          <div className="w-16 text-right">
                            <p className="text-[13px] font-[900] text-black" style={SORA}>
                              {formatMoney(value * count, currency)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* SECTION 4: LIVE RESULT BAR & CONFIRM BUTTON */}
      <section className="mt-4 px-1 pb-2 flex flex-col gap-4">
        {/* Result Summary Bar */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-[#EEEEEE] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-[10px] font-[802] text-[#AFAFAF] uppercase tracking-widest" style={DM_SANS}>Giving</p>
              <motion.p key={currentResult.totalGiven} initial={{ scale: 1.1 }} animate={{ scale: 1 }}
                className="text-[18px] font-[900] text-black" style={SORA}>
                {formatMoney(currentResult.totalGiven, currency)}
              </motion.p>
            </div>
            
            <ArrowRight className="w-5 h-5 text-[#EEEEEE]" />

            <div className="flex flex-col text-right">
              <p className="text-[10px] font-[802] text-[#AFAFAF] uppercase tracking-widest" style={DM_SANS}>Change</p>
              <div className="flex items-center justify-end gap-1.5">
                <motion.p key={currentResult.changeAmount} initial={{ scale: 1.1 }} animate={{ scale: 1 }}
                  className={`text-[18px] font-[900] ${currentResult.isExactChange ? 'text-emerald-500' : 'text-black'}`} style={SORA}>
                  {formatMoney(currentResult.changeAmount, currency)}
                </motion.p>
                {currentResult.isExactChange && <span className="text-emerald-500 text-[10px]">FIXED</span>}
              </div>
            </div>
          </div>

          {currentResult.isUnderpaying && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }}
              className="bg-red-50 rounded-xl py-3 px-4 flex items-center justify-center gap-2 overflow-hidden border border-red-100">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-[12px] font-[802] text-red-600" style={DM_SANS}>
                Still need {formatMoney(expenseAmount - currentResult.totalGiven, currency)} more
              </p>
            </motion.div>
          )}
        </div>

        {/* Primary Pay Button */}
        <motion.button 
          whileTap={{ scale: canConfirm ? 0.96 : 1 }}
          onClick={() => {
            if (!canConfirm) return
            onPaymentConfirmed({
              type: "cash",
              expenseAmount,
              notesGiven: currentResult.notesGiven || manualNotes,
              totalGiven: currentResult.totalGiven,
              changeAmount: currentResult.changeAmount,
              changeNotes: currentResult.changeNotes
            })
          }}
          disabled={!canConfirm}
          className={`w-full py-5 rounded-[28px] text-[15px] font-[900] text-white transition-all shadow-xl px-4 flex items-center justify-center gap-2 ${
            canConfirm 
              ? 'bg-black active:bg-[#111111] shadow-black/10' 
              : 'bg-[#EEEEEE] text-[#AFAFAF] shadow-none cursor-not-allowed'
          }`}
          style={DM_SANS}
        >
          PAY {formatMoney(expenseAmount, currency)} IN CASH
        </motion.button>
      </section>
    </div>
  )
>>>>>>> 41f113d (upgrade scanner)
}
