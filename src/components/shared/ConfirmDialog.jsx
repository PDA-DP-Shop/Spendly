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
            className="fixed inset-x-6 top-1/2 -translate-y-1/2 z-[91] p-6"
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              border: '1px solid #F0F0F8',
            }}
          >
            {isDestructive && (
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#FFF1F2' }}>
                <AlertTriangle className="w-7 h-7 text-[#F43F5E]" />
              </div>
            )}
            <h3 className="text-[18px] font-bold text-[#0F172A] text-center mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {title}
            </h3>
            <p className="text-[14px] text-[#64748B] text-center mb-6 leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3.5 rounded-[14px] text-[15px] font-semibold"
                style={{ background: '#F8F9FF', color: '#64748B', border: '1px solid #E2E8F0', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3.5 rounded-[14px] text-white text-[15px] font-semibold"
                style={{
                  background: isDestructive ? '#F43F5E' : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
