import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, Check, X, CreditCard, Clock, ShoppingBag } from 'lucide-react';
import { useExpenseStore } from '../store/expenseStore';
import { formatMoney } from '../utils/formatMoney';

const S = { fontFamily: "'Inter', sans-serif" };

const BillReceivedPopup = ({ bill, onClose }) => {
  const addExpense = useExpenseStore(state => state.addExpense);

  useEffect(() => {
    // Auto-close after 5 minutes of inactivity
    const timer = setTimeout(() => {
      onClose();
    }, 300000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!bill) return null;

  const handleAdd = async () => {
    const catMap = {
      'grocery': 'shopping',
      'medical': 'health',
      'fashion': 'shopping',
      'food': 'food',
      'electronics': 'electronics',
      'other': 'other'
    };

    const expenseData = {
      shopName: bill.shopName || bill.shop?.name || 'Local Store',
      amount: bill.total,
      category: catMap[bill.shopCategory?.toLowerCase()] || bill.category || 'shopping',
      date: bill.createdAt || bill.timestamp || new Date().toISOString(),
      note: `Bill #${bill.billNumber} via Spendly Shop`,
      scanType: "shop_bill",
      billItems: bill.items,
      billId: bill.billId
    };

    await addExpense(expenseData);
    onClose();
  };

  const moreCount = (bill.items?.length || 0) - 5;
  const displayDate = bill.createdAt || bill.timestamp || new Date().toISOString();
  const dateStr = displayDate.includes('T') ? displayDate.split('T')[0] : displayDate;

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-end justify-center pointer-events-none left-1/2 -translate-x-1/2 w-full max-w-[450px]">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 350 }}
        className="relative w-full bg-white rounded-t-[40px] shadow-[0_-20px_60px_rgba(0,0,0,0.15)] p-8 pointer-events-auto border-t border-slate-100 pb-12"
      >
        <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />
        
        <div className="flex items-center gap-5 mb-8">
            <div className="w-16 h-16 bg-black rounded-[24px] flex items-center justify-center text-white shadow-xl">
                <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
                <h2 className="text-[24px] font-[900] text-black tracking-tight leading-none mb-2" style={S}>Bill Received!</h2>
                <p className="text-[14px] font-[700] text-[#AFAFAF] uppercase tracking-widest truncate" style={S}>{bill.shopName || bill.shop?.name}</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 bg-[#F6F6F6] rounded-full flex items-center justify-center border border-[#EEEEEE]">
                <X className="w-5 h-5 text-black" strokeWidth={2.5} />
            </button>
        </div>

        <div className="space-y-5 mb-10">
            <div className="flex justify-between items-center text-[10px] font-[900] text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-3">
                <span>Ref: #{bill.billNumber}</span>
                <span>{dateStr}</span>
            </div>

            <div className="space-y-4">
                {(bill.items || []).slice(0, 5).map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                        <span className="text-[15px] font-[700] text-black" style={S}>{item.name}</span>
                        <div className="text-right">
                          <p className="text-[13px] font-[800] text-black" style={S}>{formatMoney(item.price)}</p>
                          <p className="text-[10px] font-[700] text-[#AFAFAF]" style={S}>{item.quantity || 1} unit{item.quantity !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                ))}
                {moreCount > 0 && (
                    <div className="text-[11px] font-[800] text-[#AFAFAF] uppercase tracking-widest pt-1">
                        + {moreCount} more items in digital receipt
                    </div>
                )}
            </div>

            <div className="bg-[#F6F6F6] rounded-[24px] p-6 space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-[16px] font-[900] text-black uppercase tracking-tight" style={S}>Total Amount</span>
                    <span className="text-[28px] font-[900] text-black tracking-tighter" style={S}>{formatMoney(bill.total)}</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-[800] text-[#AFAFAF] uppercase tracking-widest pt-3 border-t border-slate-200/50">
                    <div className="flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5" /> {bill.paymentMethod || 'CASH'}
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" /> {new Date(displayDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>
        </div>

        <div className="flex gap-4">
            <button 
                onClick={onClose}
                className="flex-1 h-16 bg-[#F6F6F6] text-[#AFAFAF] rounded-2xl font-[900] text-[14px] uppercase tracking-widest active:scale-95 transition-all"
                style={S}
            >
                Dismiss
            </button>
            <button 
                onClick={handleAdd}
                className="flex-[2] h-16 bg-black text-white rounded-2xl font-[900] text-[16px] shadow-xl shadow-black/10 active:scale-95 transition-all flex items-center justify-center gap-3"
                style={S}
            >
                <Check className="w-5 h-5" strokeWidth={3} /> Add to Wallet
            </button>
        </div>
      </motion.div>
    </div>,
    document.getElementById('modal-root') || document.body
  );
};

export default BillReceivedPopup;
