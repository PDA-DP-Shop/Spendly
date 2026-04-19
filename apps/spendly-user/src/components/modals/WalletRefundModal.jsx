/**
 * Wallet Refund Modal
 * Shown when deleting an expense that has a linked wallet/bank transaction.
 * Lets user decide if they want a refund (correction) or just delete the record.
 */
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, RotateCcw, X, Smartphone, Landmark, Wallet } from 'lucide-react'
import { createPortal } from 'react-dom'
import { formatMoney } from '../../utils/formatMoney'

const S = { fontFamily: "'Inter', sans-serif" }
const SORA = { fontFamily: "'Sora', sans-serif" }
const DM_SANS = { fontFamily: "'DM Sans', sans-serif" }

export default function WalletRefundModal({ show, expense, transaction, currency, onAction, onClose }) {
  if (!show || !expense || !transaction) return null

  const isBank = transaction.walletType === 'bank'
  const sourceName = isBank ? (transaction.bankName || 'Bank') : 'Cash'
  const amount = expense.amount

  const handleSelect = (action) => {
    // action: 'delete_only' or 'refund_and_delete'
    onAction(action)
    onClose()
  }

  const content = (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[3000] bg-black/60 backdrop-blur-md flex items-end justify-center px-4 pb-12 pointer-events-auto"
        onClick={onClose}>
        
        <motion.div initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
          className="w-full max-w-[420px] bg-white rounded-[42px] p-8 pb-10 shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}>
          
          <div className="w-12 h-1.5 bg-[#F1F5F9] rounded-full mx-auto mb-8" />
          
          <div className="text-center mb-8">
            <h2 className="text-[24px] font-[900] text-black tracking-tighter" style={SORA}>Delete this expense?</h2>
            <p className="text-[#64748B] text-[15px] font-[500] mt-2 px-4" style={S}>
              This record is linked to your {sourceName}. How should we handle the balance?
            </p>
          </div>

          <div className="space-y-4">
            {/* CARD 1: Paid (No Refund) */}
            <motion.button whileTap={{ scale: 0.98 }} onClick={() => handleSelect('delete_only')}
              className="w-full p-6 bg-black text-white rounded-[32px] flex items-center gap-5 text-left group shadow-xl shadow-black/10">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6 text-white" strokeWidth={3} />
              </div>
              <div className="flex-1">
                <p className="text-[17px] font-[900] tracking-tight" style={SORA}>Yes, I paid this</p>
                <p className="text-[12px] font-[600] text-white/40 mt-1 leading-tight" style={S}>
                  Money stays deducted from {sourceName}. Just remove the record.
                </p>
              </div>
            </motion.button>
 
            {/* CARD 2: Mistake (Refund) */}
            <motion.button whileTap={{ scale: 0.98 }} onClick={() => handleSelect('refund_and_delete')}
              className="w-full p-6 bg-white rounded-[32px] border border-[#EEEEEE] flex items-center gap-5 text-left group">
              <div className="w-14 h-14 rounded-full bg-[#F6F6F6] flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-6 h-6 text-black" strokeWidth={3} />
              </div>
              <div className="flex-1">
                <p className="text-[17px] font-[900] text-black tracking-tight" style={SORA}>It was a mistake</p>
                <p className="text-[12px] font-[600] text-[#AFAFAF] mt-1 leading-tight" style={S}>
                  Add {formatMoney(amount, currency)} back to {sourceName} and delete record.
                </p>
              </div>
            </motion.button>
          </div>
 
          <button onClick={onClose} className="w-full mt-6 py-2 text-[12px] font-[900] text-[#CBD5E1] uppercase tracking-[0.3em] hover:text-black transition-colors" style={DM_SANS}>
            Close Dialog
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )

  return createPortal(content, document.getElementById('modal-root') || document.body)
}
