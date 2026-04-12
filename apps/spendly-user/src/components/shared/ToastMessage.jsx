import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'

const TYPES = {
  success: { icon: CheckCircle, color: '#000000', bg: '#F6F6F6', track: '#000000' },
  error:   { icon: XCircle,     color: '#000000', bg: '#F6F6F6', track: '#000000' },
  info:    { icon: Info,        color: '#000000', bg: '#F6F6F6', track: '#000000' },
  warning: { icon: AlertTriangle, color: '#000000', bg: '#F6F6F6', track: '#000000' },
}

export default function ToastMessage({ toast, onClose }) {
  const [progress, setProgress] = useState(100)
  const S = { fontFamily: "'Inter', sans-serif" }

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

  return createPortal(
    <AnimatePresence>
      <motion.div
        key={toast.id}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="fixed bottom-28 left-1/2 -translate-x-1/2 w-full max-w-[450px] px-6 z-[3000] pointer-events-auto"
      >
        <div className="overflow-hidden bg-white border border-[#EEEEEE] rounded-[24px] shadow-[0_24px_48px_rgba(0,0,0,0.15)]">
          <div className="flex items-center gap-4 px-6 py-5">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[#F6F6F6] border border-[#EEEEEE]">
              <Icon className="w-5 h-5 text-black" strokeWidth={3} />
            </div>
            <p className="flex-1 text-[13px] font-[900] text-black uppercase tracking-tight" style={S}>
              {toast.message}
            </p>
            {toast.action && (
              <button
                onClick={() => { toast.action.fn?.(); onClose?.() }}
                className="text-[10px] font-[900] px-5 py-2.5 rounded-full bg-black text-white uppercase tracking-[0.2em] shadow-lg"
                style={S}
              >
                {toast.action.label}
              </button>
            )}
            <button onClick={onClose} className="p-2 bg-[#F6F6F6] rounded-full border border-[#EEEEEE]">
              <X className="w-4 h-4 text-black" strokeWidth={3} />
            </button>
          </div>

          <div className="h-[2px] bg-[#EEEEEE]">
            <div
              className="h-full transition-none"
              style={{
                width: `${progress}%`,
                background: '#000000',
                transition: progress === 100 ? 'none' : 'width 50ms linear'
              }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.getElementById('modal-root') || document.body
  )
}
