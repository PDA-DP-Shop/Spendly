// Confirm delete/action dialog with blur overlay
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
            className="fixed inset-0 bg-black/50 z-[90] backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed inset-x-6 top-1/2 -translate-y-1/2 z-[91] bg-white dark:bg-[#1A1A2E] rounded-3xl p-6 shadow-2xl"
          >
            {isDestructive && (
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
            )}
            <h3 className="text-lg font-sora font-bold text-center text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">{message}</p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3.5 rounded-2xl bg-gray-100 dark:bg-[#242438] text-gray-700 dark:text-white font-medium text-[15px]"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-3.5 rounded-2xl text-white font-medium text-[15px] ${isDestructive ? 'bg-red-500' : 'bg-purple-600'}`}
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
