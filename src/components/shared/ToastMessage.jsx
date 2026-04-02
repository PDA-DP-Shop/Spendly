// ToastMessage — white card toast with colored icon and drain progress bar
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'

const TYPES = {
  success: { icon: CheckCircle, color: '#10B981', bg: '#ECFDF5', track: '#10B981' },
  error:   { icon: XCircle,     color: '#F43F5E', bg: '#FFF1F2', track: '#F43F5E' },
  info:    { icon: Info,        color: '#6366F1', bg: '#EEF2FF', track: '#6366F1' },
  warning: { icon: AlertTriangle, color: '#F59E0B', bg: '#FFFBEB', track: '#F59E0B' },
}

export default function ToastMessage({ toast, onClose }) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (!toast) return
    setProgress(100)
    const duration = toast.duration || 3000
    const startTime = Date.now()

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
      if (remaining === 0) {
        clearInterval(interval)
        onClose?.()
      }
    }, 50)
    return () => clearInterval(interval)
  }, [toast?.id])

  if (!toast) return null
  const type = TYPES[toast.type] || TYPES.info
  const Icon = type.icon

  return (
    <AnimatePresence>
      <motion.div
        key={toast.id}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="fixed top-4 left-4 right-4 z-[200] overflow-hidden"
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
          border: '1px solid #F0F0F8',
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: type.bg }}>
            <Icon className="w-5 h-5" style={{ color: type.color }} />
          </div>
          <p className="flex-1 text-[14px] font-medium text-[#0F172A]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {toast.message}
          </p>
          {toast.action && (
            <button
              onClick={() => { toast.action.fn?.(); onClose?.() }}
              className="text-[13px] font-bold px-3 py-1.5 rounded-[8px]"
              style={{ color: type.color, background: type.bg }}
            >
              {toast.action.label}
            </button>
          )}
          <button onClick={onClose} className="ml-1 p-1">
            <X className="w-4 h-4 text-[#94A3B8]" />
          </button>
        </div>

        {/* Progress drain bar */}
        <div className="h-[3px] bg-[#F1F5F9]">
          <div
            className="h-full transition-none"
            style={{
              width: `${progress}%`,
              background: type.track,
              borderRadius: '0 0 0 0',
              transition: progress === 100 ? 'none' : 'width 50ms linear'
            }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
