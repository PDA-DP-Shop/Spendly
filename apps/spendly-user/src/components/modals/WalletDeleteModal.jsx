import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, RotateCcw, X, Info } from 'lucide-react'
import { createPortal } from 'react-dom'

const S = {
  dmSans: { fontFamily: "'DM Sans', sans-serif" },
  sora: { fontFamily: "'Sora', sans-serif" }
}

export default function WalletDeleteModal({ 
  show, 
  onClose, 
  onPaid, 
  onMistake, 
  expenseAmount, 
  walletName = 'Cash',
  currency = '₹'
}) {
  if (!show) return null

  const content = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-md flex items-end justify-center px-4 pb-12 pointer-events-auto"
      >
        <motion.div
          initial={{ y: 200, scale: 0.95 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 200, scale: 0.95 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="w-full max-w-[420px] bg-white rounded-[42px] p-8 pb-10 shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 rounded-[24px] bg-slate-50 flex items-center justify-center mb-6">
              <Trash2 className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-[24px] font-[900] text-black tracking-tight" style={S.dmSans}>
               Delete this expense?
            </h2>
            <p className="text-slate-400 text-[14px] font-[600] mt-2 px-4 leading-relaxed" style={S.dmSans}>
               This transaction is linked to your wallet. How would you like to handle the balance?
            </p>
          </div>

          <div className="flex flex-col gap-4">
             {/* Card 1: Yes, I paid this (Delete only) */}
             <motion.button
               whileTap={{ scale: 0.97 }}
               onClick={onPaid}
               className="w-full p-6 bg-red-50 border border-red-100 rounded-[28px] flex items-center gap-5 text-left group"
             >
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm group-active:scale-95 transition-transform">
                   <span className="text-2xl">🗑️</span>
                </div>
                <div className="flex-1">
                   <h4 className="text-[17px] font-[900] text-red-600" style={S.dmSans}>Yes, I paid this</h4>
                   <p className="text-[12px] font-[700] text-red-500/60 mt-0.5 leading-tight" style={S.dmSans}>
                      Delete record only. Money stays deducted from your {walletName}.
                   </p>
                </div>
             </motion.button>

             {/* Card 2: It was a mistake (Refund + Delete) */}
             <motion.button
               whileTap={{ scale: 0.97 }}
               onClick={onMistake}
               className="w-full p-6 bg-emerald-50 border border-emerald-100 rounded-[28px] flex items-center gap-5 text-left group"
             >
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm group-active:scale-95 transition-transform text-emerald-500">
                   <RotateCcw className="w-6 h-6" strokeWidth={3} />
                </div>
                <div className="flex-1">
                   <h4 className="text-[17px] font-[900] text-emerald-600" style={S.dmSans}>It was a mistake</h4>
                   <p className="text-[12px] font-[700] text-emerald-500/60 mt-0.5 leading-tight" style={S.dmSans}>
                      Delete record AND add {currency}{expenseAmount.toLocaleString()} back to your {walletName}.
                   </p>
                </div>
             </motion.button>
          </div>

          <button 
            onClick={onClose}
            className="w-full mt-6 py-5 rounded-2xl text-slate-400 font-[800] text-[15px] uppercase tracking-widest"
            style={S.dmSans}
          >
             Cancel
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )

  return createPortal(content, document.getElementById('modal-root') || document.body)
}
