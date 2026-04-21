import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
<<<<<<< HEAD
import { Receipt, Check, X, CreditCard, Clock, ShoppingBag, AlertCircle, Plus, ShieldCheck } from 'lucide-react';
=======
import { Receipt, Check, X, CreditCard, Clock, ShoppingBag, AlertCircle, Plus, ShieldCheck, Wallet, Tag, ShoppingCart, Landmark } from 'lucide-react';
>>>>>>> 41f113d (upgrade scanner)
import { useExpenseStore } from '../store/expenseStore';
import { useWalletStore } from '../store/walletStore';
import { formatMoney } from '../utils/formatMoney';
import { expenseService } from '../services/database';
import { findBestPayment, calculateChange } from '../utils/smartCashCalculator';

const S = { fontFamily: "'Inter', sans-serif" };

const BillReceivedPopup = ({ bill, onClose }) => {
  const { addExpense, loadExpenses } = useExpenseStore();
<<<<<<< HEAD
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (bill?.billId) {
      expenseService.getAll().then(all => {
        const match = all.find(e => e.billId === bill.billId && !e.isDeleted);
        if (match) setIsDuplicate(true);
        setChecking(false);
      });
    } else {
      setChecking(false);
    }
  }, [bill]);
=======
  const { 
    cashWallet, 
    bankAccounts, 
    loadCashWallet, 
    loadBankAccounts,
    deductFromCash,
    deductFromBank
  } = useWalletStore();

  const [checking, setChecking] = useState(true);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState(null);

  // Initialize selected bank
  useEffect(() => {
    if (bankAccounts.length > 0 && !selectedBankId) {
      const method = (bill.paymentMethod || 'cash').toLowerCase();
      const isBank = ['bank', 'upi', 'card', 'online'].some(m => method.includes(m)) || bill.paymentDetails?.bankName;
      if (isBank) {
        const bankName = bill.paymentDetails?.bankName;
        const match = bankAccounts.find(b => 
          b.bankName?.toLowerCase() === bankName?.toLowerCase() || b.isDefault
        ) || bankAccounts[0];
        setSelectedBankId(match.id);
      }
    }
  }, [bankAccounts, bill.paymentMethod, bill.paymentDetails]);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const timer = setTimeout(() => {
        if (mounted) setChecking(false);
      }, 1000);

      try {
        const { db } = await import('../services/database');
        await Promise.all([loadCashWallet(), loadBankAccounts()]);
        
        if (bill.billId && db.expenses) {
          const count = await db.expenses.where('billId').equals(bill.billId).count();
          if (mounted) setIsDuplicate(count > 0);
        }
      } catch (err) {
        console.warn("Init popup error:", err);
      } finally {
        clearTimeout(timer);
        if (mounted) setChecking(false);
      }
    };
    init();
    return () => { mounted = false; };
  }, [bill.billId]);

  const cashSummary = useMemo(() => {
    const method = (bill.paymentMethod || 'cash').toLowerCase();
    if (method !== 'cash') return null;
    
    const currency = bill.currency || cashWallet?.currency || 'USD';
    const total = bill.total || 0;

    if (bill.paymentDetails?.receivedNotes) {
        const given = bill.paymentDetails.receivedNotes;
        const totalGiven = Object.entries(given).reduce((sum, [key, count]) => sum + (parseFloat(key.split('_')[0]) * count), 0);
        const changeAmount = Math.max(0, totalGiven - total);
        
        return {
            suggestedGive: given,
            totalGiven,
            changeAmount,
            changeNotes: calculateChange(changeAmount, currency),
            isPossible: true,
            isExternal: true
        };
    }

    let result = null;
    if (cashWallet?.notes && Object.values(cashWallet.notes).some(v => v > 0)) {
        result = findBestPayment(total, cashWallet.notes, currency);
    }
    
    if (!result || !result.isPossible) {
        const commonGive = total <= 10 ? 10 : (total <= 20 ? 20 : (total <= 50 ? 50 : (total <= 100 ? 100 : (total <= 500 ? 500 : (total <= 2000 ? 2000 : Math.ceil(total/500)*500)))));
        let giveType = 'note';
        if (currency === 'INR' && [1, 2, 5].includes(commonGive)) giveType = 'coin';
        else if (currency === 'USD' && commonGive < 1) giveType = 'coin';
        else if ((currency === 'EUR' || currency === 'GBP') && commonGive <= 2) giveType = 'coin';

        result = {
            suggestedGive: { [`${commonGive}_${giveType}`]: 1 },
            totalGiven: commonGive,
            changeAmount: commonGive - total,
            isPossible: true,
            isFallback: true
        };
        result.changeNotes = calculateChange(result.changeAmount, currency);
    }
    
    return result;
  }, [bill.total, bill.currency, bill.paymentDetails, cashWallet, bill.paymentMethod]);

  const currency = bill.currency || cashWallet?.currency || 'INR';

  const getNoteImg = (key, targetCurrency = 'INR') => {
      const parts = key.toString().split('_');
      const denomStr = parts[0];
      const d = parseFloat(denomStr);
      let type = parts[1];
      
      if (!type) {
          // Intelligent guessing if type is missing (for result.changeNotes)
          if (targetCurrency === 'INR') {
              type = (d >= 10) ? 'note' : 'coin';
          } else if (targetCurrency === 'USD') {
              type = (d >= 1) ? 'note' : 'coin';
          } else {
              type = (d >= 5) ? 'note' : 'coin';
          }
      }
      
      let fileDenom = denomStr;
      if (d < 1) fileDenom = d.toFixed(2);
      return `/assets/currency/${targetCurrency}/${fileDenom}_${type}.png`;
  };
>>>>>>> 41f113d (upgrade scanner)

  if (!bill) return null;

  const handleAdd = async () => {
    if (isDuplicate || isAdded) return;
<<<<<<< HEAD
    
    setIsAdded(true);
=======
    setIsAdded(true);
    
>>>>>>> 41f113d (upgrade scanner)
    const catMap = {
      'food': 'food', 'coffee': 'coffee', 'grocery': 'food',
      'travel': 'travel', 'holiday': 'holiday',
      'shopping': 'shopping', 'clothes': 'clothes', 'gifts': 'gifts', 'pets': 'pets',
<<<<<<< HEAD
      'health': 'health',
      'bills': 'bills', 'rent': 'rent',
      'fun': 'fun',
      'study': 'study',
      'tech': 'tech',
      'gym': 'gym',
      'other': 'other'
    };

    // Determine category from bill data
    const rawCat = (bill.category || bill.shopCategory || 'other').toLowerCase();
    const targetCat = catMap[rawCat] || 'other';

    const expenseData = {
      shopName: bill.shopName || bill.shop?.name || 'Spendly Partner',
      amount: bill.total || bill.amount,
      category: targetCat,
      date: bill.timestamp || bill.createdAt || new Date().toISOString(),
      note: `Digital receipt #${bill.billNumber}`,
      billId: bill.billId,
      billNumber: bill.billNumber,
      billItems: bill.items || [],
      paymentMethod: bill.paymentMethod || 'CASH',
      type: 'spent',
      addedAt: new Date().toISOString()
    };

    try {
      await addExpense(expenseData);
      // Force refresh of the expense list to ensure HomeScreen list updates
      await loadExpenses();
      setTimeout(onClose, 800); 
    } catch (err) {
      console.error("Failed to add digital bill", err);
=======
      'health': 'health', 'bills': 'bills', 'rent': 'rent',
      'fun': 'fun', 'study': 'study', 'tech': 'tech', 'gym': 'gym', 'other': 'other'
    };

    const rawCat = (bill.category || bill.shopCategory || 'other').toLowerCase();
    const targetCat = catMap[rawCat] || 'other';

    try {
      const id = await addExpense({
        shopName: bill.shopName || bill.shop?.name || 'Spendly Shop',
        amount: bill.total,
        date: new Date().toISOString(),
        category: targetCat,
        type: 'spent',
        billId: bill.billId,
        source: 'spendly-shop',
        paymentMethod: bill.paymentMethod || 'cash',
        billItems: bill.items || []
      });

      const method = (bill.paymentMethod || 'cash').toLowerCase();
      if (method === 'cash') {
        const notesUsed = {
          given: cashSummary?.suggestedGive || {},
          received: cashSummary?.changeNotes || {}
        };
        await deductFromCash(id, bill.total, notesUsed, {
          shopName: bill.shopName || bill.shop?.name,
          category: targetCat,
          currency: currency
        });
      } else if (['bank', 'upi', 'card', 'online'].some(m => method.includes(m)) || bill.paymentDetails?.bankName) {
        const bankName = bill.paymentDetails?.bankName;
        const targetBank = bankAccounts.find(b => String(b.id) === String(selectedBankId)) || 
                           bankAccounts.find(b => b.bankName?.toLowerCase() === bankName?.toLowerCase()) ||
                           bankAccounts.find(b => b.isDefault) ||
                           bankAccounts[0];
        
        if (targetBank) {
          // Update payment method to use the specific bank name for the transaction list
          const bankLabel = targetBank.accountNickname || targetBank.bankName || 'BANK';
          
          await deductFromBank(id, targetBank.id, bill.total, {
            shopName: bill.shopName || bill.shop?.name,
            category: targetCat,
            currency: currency
          });

          // Update the expense we just added to show the bank name
          const { db } = await import('../services/database');
          if (db.expenses) {
            await db.expenses.update(id, { paymentMethod: bankLabel.toUpperCase() });
            await loadExpenses(); // Refresh the expense store to show the updated label
          }
        }
      }

      await loadExpenses();
      try { navigator.vibrate?.([50, 30, 80]) } catch {}
      setTimeout(onClose, 1200);
    } catch (err) {
      console.error("Failed to add bill:", err);
>>>>>>> 41f113d (upgrade scanner)
      setIsAdded(false);
    }
  };

<<<<<<< HEAD
  const moreCount = (bill.items?.length || 0) - 4;
  const displayDate = bill.timestamp || new Date().toISOString();

  return createPortal(
    <div className="fixed inset-0 z-[2000] pointer-events-none">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ y: '100%', x: '-50%' }}
        animate={{ y: 0, x: '-50%' }}
        exit={{ y: '100%', x: '-50%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="absolute bottom-0 left-1/2 w-full max-w-[450px] bg-white rounded-t-[42px] shadow-2xl p-8 pointer-events-auto border-t border-white/20 pb-12 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 flex justify-center pt-2">
            <div className="w-12 h-1 bg-slate-200 rounded-full" />
        </div>

        <div className="flex items-center justify-between mb-8 pt-2">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-black rounded-[22px] flex items-center justify-center text-white shadow-lg">
                    <Receipt className="w-7 h-7" strokeWidth={2.5} />
                </div>
                <div>
                   <h2 className="text-[22px] font-[900] text-black tracking-tight leading-none mb-1.5" style={S}>Bill Received!</h2>
                   <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10" strokeWidth={3} />
                      <p className="text-[10px] font-[800] text-emerald-600 uppercase tracking-widest" style={S}>Shop Verified</p>
                   </div>
                </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 bg-[#F6F6F6] rounded-full flex items-center justify-center border border-[#EEEEEE]">
                <X className="w-5 h-5 text-black" strokeWidth={3} />
            </button>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-[28px] p-6 mb-8">
            <div className="flex justify-between items-center mb-5 border-b border-slate-200/50 pb-3">
               <div className="text-left">
                  <p className="text-[10px] font-[800] text-slate-400 uppercase tracking-widest mb-0.5">Shop Name</p>
                  <p className="text-[14px] font-[700] text-black" style={S}>{bill.shopName}</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-[800] text-slate-400 uppercase tracking-widest mb-0.5">REF: #{bill.billNumber}</p>
                  <p className="text-[12px] font-[600] text-slate-500" style={S}>{new Date(displayDate).toLocaleDateString()}</p>
               </div>
            </div>

            {!bill.isPartial ? (
                <div className="space-y-3.5 mb-6">
                    {(bill.items || []).slice(0, 4).map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                            <span className="text-[14px] font-[600] text-slate-700" style={S}>{item.name} <span className="text-[11px] text-slate-400 ml-1">x{item.quantity || 1}</span></span>
                            <span className="text-[14px] font-[700] text-black" style={S}>{formatMoney(item.price)}</span>
=======
  const items = bill.items || [];
  const displayDate = bill.timestamp || bill.createdAt || new Date().toISOString();

  return createPortal(
    <div className="fixed inset-0 z-[1000] pointer-events-none">
      <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto"
          onClick={onClose}
      />
      
      <motion.div 
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 32, stiffness: 340 }}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[36px] z-[1010] shadow-[0_-20px_60px_rgba(0,0,0,0.22)] overflow-hidden pointer-events-auto"
          style={{ maxHeight: '88dvh' }}
      >
          {/* Handle */}
          <div className="pt-4 pb-2 flex flex-col items-center">
             <div className="w-12 h-1.5 bg-[#EEEEEE] rounded-full" />
          </div>

          <div className="overflow-y-auto no-scrollbar scrollbar-hide px-7 pt-4 pb-32" style={{ maxHeight: 'calc(88dvh - 20px)' }}>
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-black rounded-[20px] flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Receipt className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-[800] text-[#AFAFAF] uppercase tracking-widest mb-0.5" style={S}>Bill received</p>
                    <h3 className="text-[22px] font-[800] text-black tracking-tight leading-tight truncate" style={S}>
                        {bill.shopName || bill.shop?.name || 'Spendly Shop'}
                    </h3>
                </div>
              </div>

              {/* Meta Row */}
              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#AFAFAF]" />
                    <span className="text-[11px] font-[700] text-[#AFAFAF] uppercase tracking-widest" style={S}>
                        {bill.billNumber || 'REF-827361'}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-[#AFAFAF]" />
                    <span className="text-[11px] font-[700] text-[#AFAFAF] uppercase tracking-widest" style={S}>
                        {bill.paymentMethod || 'Cash'}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#AFAFAF]" />
                    <span className="text-[11px] font-[700] text-[#AFAFAF]" style={S}>
                        {new Date(displayDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-[#F6F6F6] rounded-[20px] overflow-hidden mb-5">
                <div className="px-5 py-3 border-b border-[#EEEEEE] flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-[#AFAFAF]" />
                    <span className="text-[11px] font-[800] text-[#AFAFAF] uppercase tracking-widest" style={S}>
                        {items.length} item{items.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <div className="divide-y divide-[#EEEEEE]">
                    {items.length > 0 ? items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between px-5 py-3.5 gap-3">
                            <span className="text-[14px] font-[700] text-black flex-1 truncate" style={S}>{item.name}</span>
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <span className="text-[12px] font-[600] text-[#AFAFAF]" style={S}>{item.quantity || 1}×</span>
                                <span className="text-[14px] font-[800] text-black" style={S}>{formatMoney(item.price * (item.quantity || 1), currency)}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="px-5 py-6 text-center">
                            <div className="flex items-center justify-center gap-3 text-slate-300">
                                <AlertCircle className="w-5 h-5" />
                                <p className="text-[12px] font-[600] leading-tight">Code entry. No breakdown.</p>
                            </div>
                        </div>
                    )}
                </div>
              </div>

              {/* Totals Breakdown */}
              <div className="bg-[#F6F6F6] rounded-[20px] px-5 py-4 mb-6 space-y-3">
                <div className="flex justify-between items-center pt-1">
                    <span className="text-[16px] font-[800] text-black uppercase tracking-wide" style={S}>Total</span>
                    <span className="text-[26px] font-[800] text-black tracking-tight" style={S}>
                        {formatMoney(bill.total, currency)}
                    </span>
                </div>
              </div>

              {/* Bank Selector for Digital Payments */}
              {(['bank', 'upi', 'card', 'online'].some(m => (bill.paymentMethod || 'cash').toLowerCase().includes(m)) || bill.paymentDetails?.bankName) && bankAccounts.length > 0 && (
                <div className="mb-10 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                            <span className="text-[12px] font-[900] text-black uppercase tracking-widest" style={S}>Select Payment Source</span>
>>>>>>> 41f113d (upgrade scanner)
                        </div>
                    ))}
                    {moreCount > 0 && (
                        <p className="text-[11px] font-[700] text-slate-400 italic" style={S}>+ {moreCount} other items</p>
                    )}
                </div>
            ) : (
                <div className="py-4 my-2 border-y border-dashed border-slate-200/50">
                    <div className="flex items-center gap-3 text-slate-400">
                        <AlertCircle className="w-5 h-5 opacity-40" />
                        <p className="text-[11px] font-[500] leading-tight">Manual code entered. Item breakdown is only available via QR/NFC scan.</p>
                    </div>
<<<<<<< HEAD
                </div>
            )}

            <div className="pt-5 border-t border-dashed border-slate-200 flex justify-between items-center">
                <span className="text-[14px] font-[800] text-black uppercase tracking-tight" style={S}>Total Amount</span>
                <span className="text-[26px] font-[900] text-black tracking-tighter" style={S}>{formatMoney(bill.total)}</span>
            </div>
            
            <div className="flex items-center gap-4 mt-5 text-[10px] font-[800] text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> {bill.paymentMethod}</div>
                <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(displayDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
        </div>

        <div className="flex gap-4">
            <button 
                onClick={onClose}
                className="flex-1 h-15 bg-slate-100 text-slate-500 rounded-[20px] font-[800] text-[13px] uppercase tracking-widest active:scale-95 transition-all"
                style={S}
            >
                Dismiss
            </button>
            <button 
                onClick={handleAdd}
                disabled={isDuplicate || checking || isAdded}
                className={`flex-[2] h-15 rounded-[20px] font-[900] text-[15px] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2.5 ${
                  isAdded ? 'bg-emerald-500 text-white' : 
                  isDuplicate ? 'bg-red-50 text-red-500 shadow-none border border-red-100' : 
                  'bg-black text-white shadow-black/10'
                }`}
                style={S}
            >
                {checking ? (
                  <Clock className="w-5 h-5 animate-pulse" />
                ) : isAdded ? (
                  <><Check className="w-5 h-5" strokeWidth={3} /> Saved to Wallet</>
                ) : isDuplicate ? (
                  <><AlertCircle className="w-5 h-5" /> Already Claimed</>
                ) : (
                  <><Plus className="w-5 h-5" strokeWidth={3} /> Add to Wallet</>
                )}
            </button>
        </div>
=======
                    
                    <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-2 overscroll-contain">
                        {bankAccounts.map((acc) => (
                            <button 
                                key={acc.id}
                                onClick={() => { setSelectedBankId(acc.id); try { navigator.vibrate?.(5) } catch {} }}
                                className={`flex-shrink-0 w-[160px] p-4 rounded-[24px] border-2 transition-all active:scale-[0.98] flex flex-col gap-3 ${
                                    selectedBankId === acc.id ? 'bg-black border-black shadow-lg text-white' : 'bg-white border-[#EEEEEE] text-black'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedBankId === acc.id ? 'bg-white/20' : 'bg-[#F6F6F6]'}`} style={{ backgroundColor: selectedBankId === acc.id ? 'rgba(255,255,255,0.1)' : acc.bankColor + '20' }}>
                                        <Landmark className={`w-4 h-4 ${selectedBankId === acc.id ? 'text-white' : ''}`} style={{ color: selectedBankId === acc.id ? '#FFFFFF' : acc.bankColor }} />
                                    </div>
                                    {selectedBankId === acc.id && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                                </div>
                                <div className="text-left">
                                    <p className={`text-[13px] font-[800] truncate leading-tight ${selectedBankId === acc.id ? 'text-white' : 'text-black'}`} style={S}>{acc.accountNickname || acc.bankName}</p>
                                    <p className={`text-[10px] font-[900] mt-0.5 tracking-tight ${selectedBankId === acc.id ? 'text-white/60' : 'text-[#AFAFAF]'}`} style={S}>{formatMoney(acc.balance, currency)}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
              )}

              {/* Smart Cash Assistant */}
              {cashSummary && cashSummary.isPossible && (
                <div className="mb-10 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                            <span className="text-[12px] font-[900] text-black uppercase tracking-widest" style={S}>Digital Cash Guide</span>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                         <div className="bg-[#F8FAFC] rounded-[28px] p-5 border border-slate-100 flex items-center justify-between gap-4 overflow-hidden relative">
                            <div className="flex-1">
                                <p className="text-[9px] font-[900] text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2" style={S}>
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    You Give
                                </p>
                                <div className="flex flex-wrap gap-2.5">
                                    {Object.entries(cashSummary.suggestedGive).map(([key, count]) => (
                                        <div key={key} className="relative">
                                            <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[9px] font-[900] w-5 h-5 rounded-full flex items-center justify-center shadow-lg z-10 border border-white">
                                                {count}
                                            </div>
                                            <div className="bg-white p-1 rounded-lg border border-slate-100">
                                                <img src={getNoteImg(key, currency)} className="h-8 w-auto object-contain rounded-md" alt={key} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="text-right">
                                 <p className="text-[9px] font-[800] text-slate-400 uppercase tracking-widest mb-0.5" style={S}>Giving</p>
                                 <p className="text-[16px] font-[900] text-black tracking-tight" style={S}>{formatMoney(cashSummary.totalGiven, currency)}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-[28px] p-5 border border-slate-100 flex items-center justify-between gap-4 relative overflow-hidden">
                             <div className="flex-1">
                                <p className="text-[9px] font-[900] text-slate-400 uppercase tracking-widest mb-3" style={S}>Receive Back</p>
                                {cashSummary.changeAmount > 0 ? (
                                    <div className="flex flex-wrap gap-2.5">
                                        {Object.entries(cashSummary.changeNotes).map(([denom, count]) => (
                                            <div key={denom} className="relative">
                                                <div className="absolute -top-1.5 -right-1.5 bg-slate-400 text-white text-[9px] font-[900] w-5 h-5 rounded-full flex items-center justify-center shadow-lg z-10 border border-white">
                                                    {count}
                                                </div>
                                                <div className="bg-[#F8FAFC] p-1 rounded-lg border border-slate-50">
                                                    <img src={getNoteImg(denom, currency)} className="h-7 w-auto object-contain" alt={denom} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-slate-200">
                                        <Check className="w-5 h-5" strokeWidth={3} />
                                        <span className="text-[12px] font-[900] uppercase tracking-widest">Exact Change</span>
                                    </div>
                                )}
                            </div>
                            <div className="text-right">
                                 <p className="text-[9px] font-[800] text-slate-400 uppercase tracking-widest mb-0.5" style={S}>Change</p>
                                 <p className={`text-[16px] font-[900] tracking-tight ${cashSummary.changeAmount > 0 ? 'text-black' : 'text-slate-200'}`} style={S}>
                                    {formatMoney(cashSummary.changeAmount, currency)}
                                 </p>
                            </div>
                        </div>
                    </div>
                </div>
              )}
          </div>

          {/* Bottom Actions - Fixed */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-xl border-t border-[#F1F5F9] flex flex-col gap-3">
              <button 
                  onClick={handleAdd}
                  disabled={isDuplicate || checking || isAdded}
                  className={`w-full h-15 rounded-[22px] font-[900] text-[15px] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2.5 uppercase tracking-wider ${
                    isAdded ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 
                    isDuplicate ? 'bg-red-50 text-red-500 shadow-none border border-red-100' : 
                    'bg-black text-white shadow-black/10'
                  }`}
                  style={S}
              >
                  {checking ? <Clock className="w-5 h-5 animate-pulse" /> : 
                   isAdded ? <><Check className="w-5 h-5" strokeWidth={3} /> Saved Successfully</> :
                   isDuplicate ? <><AlertCircle className="w-5 h-5" /> Already Claimed</> :
                   <><Plus className="w-5 h-5" strokeWidth={3} /> Add to Expense</>}
              </button>
              
              {!isAdded && (
                  <button onClick={onClose} className="w-full py-2 text-[10px] font-[900] text-slate-400 uppercase tracking-[0.3em] active:opacity-50">
                      Dismiss Bill
                  </button>
              )}
          </div>
>>>>>>> 41f113d (upgrade scanner)
      </motion.div>
    </div>,
    document.body
  );
};

export default BillReceivedPopup;
