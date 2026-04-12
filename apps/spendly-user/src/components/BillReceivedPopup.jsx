import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, Check, X, CreditCard, Clock } from 'lucide-react';
import { useExpenseStore } from '../store/expenseStore';
import { formatMoney } from '../utils/formatMoney';

const BillReceivedPopup = ({ bill, onClose }) => {
  const addExpense = useExpenseStore(state => state.addExpense);

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 300000); // 5 minutes
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!bill) return null;

  const handleAdd = async () => {
    // Category mapping from shop category to user app category
    const catMap = {
      'grocery': 'shopping',
      'medical': 'health',
      'fashion': 'shopping',
      'food': 'food',
      'electronics': 'electronics',
      'other': 'other'
    };

    const expenseData = {
      shopName: bill.shopName,
      amount: bill.total,
      category: catMap[bill.shopCategory?.toLowerCase()] || 'shopping',
      date: bill.createdAt,
      note: `Bill #${bill.billNumber} via Spendly Shop`,
      scanType: "shop_bill"
    };

    await addExpense(expenseData);
    onClose();
  };

  const moreCount = bill.items.length - 5;

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center pointer-events-none">
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="w-full max-w-[500px] bg-white rounded-t-[40px] shadow-2xl p-8 pointer-events-auto border-t border-slate-100"
      >
        <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />
        
        <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-indigo-100">
                {bill.shopName?.charAt(0) || '🏪'}
            </div>
            <div>
                <h2 className="text-xl font-black text-slate-900 leading-tight">🧾 Bill Received!</h2>
                <p className="text-sm font-bold text-primary">{bill.shopName}</p>
            </div>
        </div>

        <div className="space-y-4 mb-8">
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>Bill #{bill.billNumber}</span>
                <span>{bill.createdAt.split('T')[0]}</span>
            </div>

            <div className="space-y-3">
                {bill.items.slice(0, 5).map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm font-bold">
                        <span className="text-slate-600">{item.name}</span>
                        <span className="text-slate-900">{item.quantity} × {formatMoney(item.price)}</span>
                    </div>
                ))}
                {moreCount > 0 && (
                    <div className="text-xs font-bold text-slate-400">
                        + {moreCount} more items
                    </div>
                )}
            </div>

            <div className="border-t-2 border-slate-50 pt-4 space-y-2">
                {bill.gstAmount > 0 && (
                    <div className="flex justify-between text-xs font-bold text-slate-400">
                        <span>GST</span>
                        <span>{formatMoney(bill.gstAmount)}</span>
                    </div>
                )}
                {bill.discountAmount > 0 && (
                    <div className="flex justify-between text-xs font-bold text-red-500">
                        <span>Discount</span>
                        <span>-{formatMoney(bill.discountAmount)}</span>
                    </div>
                )}
                <div className="flex justify-between items-center mt-2">
                    <span className="text-lg font-black text-slate-900 uppercase">Total</span>
                    <span className="text-2xl font-black text-primary">{formatMoney(bill.total)}</span>
                </div>
            </div>

            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">
                <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3 h-3" /> {bill.paymentMethod}
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> {new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>

        <div className="space-y-4">
            <button 
                onClick={handleAdd}
                className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
                <Check className="w-6 h-6" /> Add to Spendly
            </button>
            <button 
                onClick={onClose}
                className="w-full text-slate-400 font-bold text-sm uppercase tracking-widest py-2 active:opacity-50"
            >
                Skip
            </button>
        </div>
      </motion.div>
    </div>
  );
};

export default BillReceivedPopup;
