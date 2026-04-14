/**
 * Undo Delete Toast — 5 second window with progress bar
 */
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Trash2 } from 'lucide-react'
import { createPortal } from 'react-dom'

const S = { fontFamily: "'Inter', sans-serif" }

export default function UndoDeleteToast({ expense, onUndo, onVisibleChange }) {
  const [progress, setProgress] = useState(100)
  const DURATION = 5000 // 5 seconds

  useEffect(() => {
    if (!expense) return
    
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100)
      setProgress(remaining)
      
      if (remaining <= 0) {
        clearInterval(interval)
        onVisibleChange?.(false)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [expense, onVisibleChange])

  if (!expense) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-[1100] pointer-events-auto"
      >
        <div className="bg-black rounded-[24px] p-5 shadow-2xl overflow-hidden relative">
          {/* Progress bar background */}
          <div className="absolute bottom-0 left-0 h-1 bg-white/10 w-full" />
          {/* Active progress bar */}
          <motion.div 
            className="absolute bottom-0 left-0 h-1 bg-white" 
            style={{ width: `${progress}%` }} 
          />

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
               <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                 <Trash2 className="w-5 h-5 text-white" />
               </div>
               <div className="min-w-0">
                 <p className="text-white text-[14px] font-[800] truncate" style={S}>Expense deleted</p>
                 <p className="text-white/40 text-[11px] font-[600]" style={S}>Recoverable for 3 days</p>
               </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { onUndo(); onVisibleChange?.(false) }}
              className="bg-white text-black h-10 px-5 rounded-full text-[13px] font-[801] flex items-center gap-2 flex-shrink-0 shadow-lg"
              style={S}
            >
              <RotateCcw className="w-4 h-4" strokeWidth={3} />
              Undo
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.getElementById('modal-root') || document.body
  )
}
