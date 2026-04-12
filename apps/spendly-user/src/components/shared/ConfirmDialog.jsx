import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ show, title, message, confirmText = 'Yes, do it', cancelText = 'Cancel', isDestructive = true, onConfirm, onCancel }) {
  return createPortal(
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] pointer-events-auto"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => {
              e.stopPropagation()
              onCancel()
            }}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-x-6 top-1/2 -translate-y-1/2 z-[2001] p-10 bg-white border border-[#EEEEEE] rounded-[48px] shadow-[0_40px_100px_rgba(0,0,0,0.3)] max-h-[90dvh] overflow-y-auto pointer-events-auto mx-auto max-w-[400px]"
            onClick={(e) => e.stopPropagation()}
          >
            {isDestructive && (
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-8 bg-[#FFF5F5] border border-[#FFE0E0]">
                <AlertTriangle className="w-8 h-8 text-black" strokeWidth={3} />
              </div>
            )}
            <h3 className="text-[20px] font-[900] text-black text-center mb-4 uppercase tracking-tighter" style={{ fontFamily: "'Inter', sans-serif" }}>
              {title}
            </h3>
            <p className="text-[12px] font-[600] text-[#AFAFAF] text-center mb-10 uppercase tracking-[0.2em] leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
              {message}
            </p>
            <div className="flex flex-col gap-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation()
                  onConfirm()
                }}
                className="w-full py-5 rounded-full text-white bg-black text-[13px] font-[900] shadow-[0_20px_40px_rgba(0,0,0,0.2)] uppercase tracking-[0.2em] relative z-10"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {confirmText}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation()
                  onCancel()
                }}
                className="w-full py-5 rounded-full text-black bg-white border border-[#EEEEEE] text-[13px] font-[900] uppercase tracking-[0.2em] relative z-10"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {cancelText}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.getElementById('modal-root') || document.body
  )
}
