import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, Check, X, CreditCard, Clock, ShoppingBag, AlertCircle, Plus, ShieldCheck } from 'lucide-react';
import { useExpenseStore } from '../store/expenseStore';
import { formatMoney } from '../utils/formatMoney';
import { expenseService } from '../services/database';

const S = { fontFamily: "'Inter', sans-serif" };

const BillReceivedPopup = ({ bill, onClose }) => {
  const { addExpense, loadExpenses } = useExpenseStore();
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

  if (!bill) return null;

  const handleAdd = async () => {
    if (isDuplicate || isAdded) return;
    
    setIsAdded(true);
    const catMap = {
      'food': 'food', 'coffee': 'coffee', 'grocery': 'food',
      'travel': 'travel', 'holiday': 'holiday',
      'shopping': 'shopping', 'clothes': 'clothes', 'gifts': 'gifts', 'pets': 'pets',
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
      setIsAdded(false);
    }
  };

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
      </motion.div>
    </div>,
    document.getElementById('modal-root') || document.body
  );
};

export default BillReceivedPopup;
