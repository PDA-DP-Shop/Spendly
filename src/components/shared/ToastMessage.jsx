// Toast notification message — slides in from bottom and auto-dismisses
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

const colors = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-purple-600',
}

export default function ToastMessage({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(onClose, toast.duration || 3000)
    return () => clearTimeout(timer)
  }, [toast, onClose])

  const Icon = toast ? (icons[toast.type] || Info) : Info

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className={`fixed bottom-24 left-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl text-white shadow-xl ${colors[toast?.type || 'info']}`}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1 text-sm font-medium">{toast?.message}</span>
          {toast?.action && (
            <button onClick={toast.action.fn} className="text-white font-bold text-sm underline">
              {toast.action.label}
            </button>
          )}
          <button onClick={onClose}><X className="w-4 h-4 opacity-70" /></button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
