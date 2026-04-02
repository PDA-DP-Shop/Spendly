// AlertBanner — white card with colored left border for warnings
import { motion } from 'framer-motion'
import { X, AlertTriangle, AlertOctagon } from 'lucide-react'

const TYPES = {
  warning: { icon: AlertTriangle, color: '#F59E0B', bg: '#FFFBEB', border: '#F59E0B', textColor: '#92400E' },
  danger:  { icon: AlertOctagon,  color: '#F43F5E', bg: '#FFF1F2', border: '#F43F5E', textColor: '#9F1239' },
  info:    { icon: AlertTriangle, color: '#6366F1', bg: '#EEF2FF', border: '#6366F1', textColor: '#3730A3' },
}

export default function AlertBanner({ type = 'warning', message, onClose }) {
  const cfg = TYPES[type] || TYPES.warning
  const Icon = cfg.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="mx-5 mt-3 flex items-start gap-3 px-4 py-3.5 rounded-[14px]"
      style={{ background: cfg.bg, borderLeft: `3px solid ${cfg.border}` }}
    >
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: cfg.color }} />
      <p className="flex-1 text-[13px] font-medium" style={{ color: cfg.textColor, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {message}
      </p>
      {onClose && (
        <button onClick={onClose} className="p-0.5">
          <X className="w-4 h-4" style={{ color: cfg.color }} />
        </button>
      )}
    </motion.div>
  )
}
