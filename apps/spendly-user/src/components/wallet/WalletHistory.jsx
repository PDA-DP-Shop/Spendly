import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowUpRight, ArrowDownLeft, Clock, Wallet, Landmark } from 'lucide-react';
import { formatMoney } from '../../utils/formatMoney';

const S = { fontFamily: "'Inter', sans-serif" };
const DM_SANS = { fontFamily: "'DM Sans', sans-serif" };

export default function WalletHistory({ transactions, filterType, currency }) {
  const filtered = transactions.filter(t => {
    const typeMatch = !filterType || t.walletType === filterType;
    const currencyMatch = !currency || t.currency === currency;
    return typeMatch && currencyMatch;
  });

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 opacity-20 text-center px-10">
        <Clock className="w-12 h-12 mb-4" />
        <p className="text-[14px] font-[700]" style={DM_SANS}>No transactions yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {filtered.map((t, i) => (
        <motion.div 
          key={t.id || i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white rounded-[24px] p-5 shadow-sm border border-[#F1F5F9] flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              t.transactionType === 'credit' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-500'
            }`}>
              {t.transactionType === 'credit' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-[15px] font-[800] text-black" style={S}>
                {t.shopName || (t.transactionType === 'credit' ? 'Cash Added' : 'Manual Expense')}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                 <p className="text-[10px] font-[700] text-slate-400 uppercase tracking-widest">{t.category || 'wallet'}</p>
                 <span className="w-1 h-1 rounded-full bg-slate-200" />
                 <p className="text-[10px] font-[600] text-slate-300">{new Date(t.date || t.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-[16px] font-[900] ${t.transactionType === 'credit' ? 'text-emerald-500' : 'text-black'}`} style={S}>
              {t.transactionType === 'credit' ? '+' : '-'}{formatMoney(t.amount, currency)}
            </p>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
               {t.walletType === 'cash' ? <Wallet className="w-3 h-3 text-slate-300" /> : <Landmark className="w-3 h-3 text-slate-300" />}
               <p className="text-[9px] font-[800] text-slate-300 uppercase tracking-tighter">{t.walletType}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
