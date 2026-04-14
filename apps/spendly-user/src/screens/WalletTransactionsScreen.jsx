import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, History, Banknote, Landmark, Smartphone, CreditCard, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { useWalletStore } from '../store/walletStore'
import { useSettingsStore } from '../store/settingsStore'
import { formatMoney } from '../utils/formatMoney'
import { format } from 'date-fns'

const S = {
  dmSans: { fontFamily: "'DM Sans', sans-serif" },
  sora: { fontFamily: "'Sora', sans-serif" }
}

export default function WalletTransactionsScreen() {
  const navigate = useNavigate()
  const { walletTransactions, loadWalletTransactions } = useWalletStore()
  const { settings } = useSettingsStore()
  const currency = settings?.currency || 'INR'

  useEffect(() => {
    loadWalletTransactions()
  }, [loadWalletTransactions])

  return (
    <div className="h-dvh flex flex-col bg-[#F9FBFF] overflow-hidden safe-top">
      <header className="px-6 pt-8 pb-6 flex items-center justify-between bg-white border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center bg-slate-50 active:scale-90 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[20px] font-[900] text-black tracking-tight" style={S.dmSans}>Wallet History</h1>
        <div className="w-12" />
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8 scrollbar-hide">
        {walletTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <History className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-[15px] font-[802]" style={S.dmSans}>No wallet activity yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {walletTransactions.map((tx, i) => (
              <motion.div
                key={tx.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.walletType === 'cash' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                      {tx.walletType === 'cash' ? <Banknote className="w-6 h-6" /> : <Landmark className="w-6 h-6" />}
                   </div>
                   <div>
                      <p className="text-[15px] font-[802] text-black" style={S.dmSans}>
                        {tx.walletType === 'cash' ? 'Cash Wallet' : 'Bank Account'}
                      </p>
                      <p className="text-[11px] font-[600] text-slate-400 uppercase tracking-widest mt-0.5">
                        {format(new Date(tx.createdAt), 'dd MMM • HH:mm')}
                      </p>
                   </div>
                </div>
                <div className="text-right">
                   <div className={`flex items-center gap-1 font-[900] text-[16px] ${tx.type === 'refund' ? 'text-emerald-500' : 'text-slate-900'}`} style={S.sora}>
                      {tx.type === 'refund' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4 text-slate-300" />}
                      {formatMoney(tx.amount, currency)}
                   </div>
                   <p className="text-[10px] font-[802] text-slate-400 uppercase tracking-widest mt-1 opacity-60">
                      {tx.type === 'refund' ? 'Refunded' : 'Deducted'}
                   </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
