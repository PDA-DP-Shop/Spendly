// AlertBanner — white card with colored left border for warnings
import { motion } from 'framer-motion'
import { X, AlertTriangle, AlertOctagon, Info } from 'lucide-react'

const TYPES = {
  warning: { icon: AlertTriangle, color: '#F59E0B', bg: '#FFFBEB', border: '#FCD34D', textColor: '#92400E' },
  danger:  { icon: AlertOctagon,  color: '#F43F5E', bg: '#FFF1F2', border: '#FDA4AF', textColor: '#BE123C' },
  info:    { icon: Info,          color: '#7C6FF7', bg: '#F8F7FF', border: '#C7D2FE', textColor: '#4338CA' },
}

export default function AlertBanner({ type = 'warning', message, onClose }) {
  const cfg = TYPES[type] || TYPES.warning
  const Icon = cfg.icon
  const S = { fontFamily: "'Nunito', sans-serif" }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="mx-5 mt-4 flex items-center gap-4 px-5 py-4 rounded-[20px] border shadow-sm"
      style={{ background: cfg.bg, borderColor: cfg.border }}
    >
      <div className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0 bg-white shadow-sm">
        <Icon className="w-5 h-5" style={{ color: cfg.color }} />
      </div>
      <p className="flex-1 text-[13px] font-[800] leading-snug" style={{ color: cfg.textColor, ...S }}>
        {message}
      </p>
      {onClose && (
        <button onClick={onClose} className="p-1 hover:bg-white/50 rounded-full transition-colors">
          <X className="w-4 h-4" style={{ color: cfg.color }} />
        </button>
      )}
    </motion.div>
  )
}
