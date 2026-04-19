import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  ChevronLeft, ArrowUpRight, ArrowDownLeft, Wallet, 
  Landmark, Receipt, Calendar, X, Eye, ArrowRight
} from 'lucide-react'
import { useWalletStore } from '../store/walletStore'
import { useSettingsStore } from '../store/settingsStore'
import { walletTransactionService } from '../services/database'
import { formatMoney } from '../utils/formatMoney'
import NoteCard from '../components/cash/NoteCard'

const SORA = { fontFamily: "'Sora', sans-serif" }
const DM_SANS = { fontFamily: "'DM Sans', sans-serif" }

export default function WalletHistoryScreen() {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTx, setSelectedTx] = useState(null)
  const { settings } = useSettingsStore()
  const { bankAccounts } = useWalletStore()
  const currency = settings?.currency || 'INR'

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    setIsLoading(true)
    try {
      const txs = await walletTransactionService.getAll()
      setTransactions(txs.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)))
    } catch (err) {
      console.error("Failed to load transactions:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const getBankName = (bankId) => {
     const bank = bankAccounts.find(b => b.id === bankId)
     return bank ? bank.bankName : 'Bank Account'
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#F8F9FA] overflow-x-hidden safe-top">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-[#F1F5F9] sticky top-0 z-50">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white border border-[#F1F5F9] flex items-center justify-center shadow-sm">
          <ChevronLeft className="w-6 h-6 text-black" />
        </motion.button>
        <h1 className="text-[17px] font-[802] text-black uppercase tracking-[0.15em]" style={DM_SANS}>Wallet History</h1>
        <div className="w-10" />
      </header>

      <div className="flex-1 px-6 pt-6 pb-20">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center pt-20 gap-4 opacity-50">
               <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
               <p className="text-[12px] font-[700] uppercase tracking-widest">Loading transactions...</p>
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx, idx) => {
                const isCredit = tx.transactionType === 'credit'
                const date = new Date(tx.date || tx.createdAt)
                const isBank = tx.walletType === 'bank'

                return (
                  <motion.div 
                    key={tx.id || idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setSelectedTx(tx)}
                    className="bg-white rounded-[24px] p-5 border border-[#F1F5F9] flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                        isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {isCredit ? <ArrowDownLeft className="w-6 h-6 text-emerald-500" /> : <ArrowUpRight className="w-6 h-6 text-rose-500" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-[14px] font-[802] text-black" style={SORA}>
                            {isCredit ? (tx.billId ? 'Sale Income' : 'Cash Deposit') : 'Expense Payment'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className={`text-[8px] font-[900] px-1.5 py-0.5 rounded-full uppercase tracking-widest ${
                             isBank ? 'bg-blue-50 text-blue-500 border border-blue-100' : 'bg-orange-50 text-orange-500 border border-orange-100'
                           }`}>
                             {isBank ? 'Bank' : 'Cash'}
                           </span>
                           <p className="text-[10px] font-[800] text-slate-300 uppercase tracking-tighter" style={DM_SANS}>
                             {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                           </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className={`text-[16px] font-[900] ${isCredit ? 'text-emerald-500' : 'text-slate-900'}`} style={SORA}>
                         {isCredit ? '+' : '-'}{formatMoney(tx.amount, currency)}
                       </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-32 text-center opacity-30">
               <Receipt className="w-16 h-16 mb-4" />
               <p className="text-[15px] font-[700]" style={DM_SANS}>No transactions found.<br/>Sales and expenses will appear here.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Transaction Detail Popup (Bottom Sheet) */}
      <AnimatePresence>
        {selectedTx && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedTx(null)}
              className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-md" />
            
            <motion.div 
              initial={{ y: '100%', x: '-50%' }} animate={{ y: 0, x: '-50%' }} exit={{ y: '100%', x: '-50%' }}
              className="fixed bottom-0 left-1/2 w-full max-w-[450px] bg-white rounded-t-[40px] z-[101] shadow-2xl p-8 pt-4"
            >
              <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />
              
              <div className="flex justify-between items-start mb-10">
                <div>
                   <h3 className="text-[20px] font-[902] text-black" style={DM_SANS}>
                     {selectedTx.transactionType === 'credit' ? 'Money In' : 'Money Out'}
                   </h3>
                   <p className="text-[12px] font-[800] text-slate-400 uppercase tracking-widest mt-1">
                     {selectedTx.walletType === 'bank' ? `Deposited to ${getBankName(selectedTx.bankAccountId)}` : 'Added to Cash Drawer'}
                   </p>
                </div>
                <button onClick={() => setSelectedTx(null)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="bg-slate-50 rounded-[32px] p-8 flex flex-col items-center justify-center mb-8 border border-white">
                 <p className="text-[11px] font-[900] text-slate-300 uppercase tracking-[0.2em] mb-2">Final Amount</p>
                 <h2 className={`text-[42px] font-[902] leading-none ${selectedTx.transactionType === 'credit' ? 'text-emerald-500' : 'text-slate-900'}`} style={SORA}>
                   {selectedTx.transactionType === 'credit' ? '+' : '-'}{formatMoney(selectedTx.amount, currency)}
                 </h2>
                 <div className="mt-6 flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-100">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] font-[802] text-slate-500 uppercase tracking-tighter">
                      {new Date(selectedTx.date || selectedTx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                 </div>
              </div>

              {/* Cash Notes Breakdown Section */}
              {selectedTx.walletType === 'cash' && selectedTx.notesUsed && (
                <div className="space-y-6 mb-10 px-2">
                  <div className="space-y-3">
                     <p className="text-[10px] font-[900] text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <ArrowDownLeft className="w-3 h-3" /> Customer Gave
                     </p>
                     <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedTx.notesUsed.given || {}).map(([note, count]) => {
                          const [val, type] = note.split('_');
                          return (
                            <div key={note} className="flex flex-col items-center gap-1">
                               <NoteCard value={parseFloat(val)} type={type} currency={currency} size="xs" showCount={false} />
                               <span className="text-[10px] font-[802] text-slate-900">{count}x</span>
                            </div>
                          )
                        })}
                     </div>
                  </div>

                  {Object.keys(selectedTx.notesUsed.received || {}).length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-slate-50">
                       <p className="text-[10px] font-[900] text-rose-400 uppercase tracking-[0.2em] flex items-center gap-2">
                          <ArrowUpRight className="w-3 h-3" /> Change Returned
                       </p>
                       <div className="flex flex-wrap gap-2">
                          {Object.entries(selectedTx.notesUsed.received || {}).map(([note, count]) => {
                             const [val, type] = note.split('_');
                             return (
                               <div key={note} className="flex flex-col items-center gap-1">
                                  <NoteCard value={parseFloat(val)} type={type} currency={currency} size="xs" showCount={false} />
                                  <span className="text-[10px] font-[802] text-slate-400">{count}x</span>
                               </div>
                             )
                          })}
                       </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 mt-auto">
                 {selectedTx.billId && (
                   <button 
                     onClick={() => navigate(`/bill/${selectedTx.billId}`)}
                     className="col-span-2 py-5 rounded-3xl bg-black text-white font-[900] text-[15px] flex items-center justify-center gap-4 active:scale-95 transition-all shadow-xl shadow-black/10"
                   >
                     <Eye className="w-5 h-5" /> VIEW ORIGINAL BILL
                   </button>
                 )}
                 <button 
                   onClick={() => setSelectedTx(null)}
                   className="col-span-2 py-5 rounded-3xl bg-slate-100 text-slate-500 font-[900] text-[15px] active:scale-95 transition-all"
                 >
                   DISMISS
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
