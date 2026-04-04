// ConfirmDialog — white card modal with spring animation
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ show, title, message, confirmText = 'Yes, do it', cancelText = 'Cancel', isDestructive = true, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90]"
            style={{ background: 'rgba(0,0,0,0.3)' }}
            onClick={onCancel}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed inset-x-6 top-1/2 -translate-y-1/2 z-[91] p-10 bg-white border border-[#EEEEEE] rounded-[48px] shadow-[0_40px_80px_rgba(0,0,0,0.2)]"
          >
            {isDestructive && (
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-8 bg-[#F6F6F6] border border-[#EEEEEE]">
                <AlertTriangle className="w-8 h-8 text-black" strokeWidth={3} />
              </div>
            )}
            <h3 className="text-[20px] font-[900] text-black text-center mb-4 uppercase tracking-tighter" style={{ fontFamily: "'Inter', sans-serif" }}>
              {title}
            </h3>
            <p className="text-[10px] font-[900] text-[#AFAFAF] text-center mb-10 uppercase tracking-[0.3em] leading-loose" style={{ fontFamily: "'Inter', sans-serif" }}>
              {message}
            </p>
            <div className="flex flex-col gap-4">
              <button
                onClick={onConfirm}
                className="w-full py-4.5 rounded-full text-white bg-black text-[12px] font-[900] shadow-[0_20px_40px_rgba(0,0,0,0.3)] uppercase tracking-[0.2em]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {confirmText}
              </button>
              <button
                onClick={onCancel}
                className="w-full py-4.5 rounded-full text-black bg-white border border-[#EEEEEE] text-[12px] font-[900] uppercase tracking-[0.2em]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {cancelText}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
