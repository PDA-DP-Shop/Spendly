// Alert banner for budget warnings — amber for 80%+, red for 100%+
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

export default function AlertBanner({ type = 'warning', message, onClose }) {
  const styles = {
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    danger: 'bg-red-50 border-red-200 text-red-700',
  }

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className={`mx-4 mb-3 px-4 py-3 rounded-2xl border flex items-center gap-3 ${styles[type]}`}
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium flex-1">{message}</span>
          {onClose && (
            <button onClick={onClose}><X className="w-4 h-4" /></button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
