// Pattern lock — draw a connect-the-dots unlock pattern
import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const DOTS = [0, 1, 2, 3, 4, 5, 6, 7, 8] // 3x3 grid
const S = { fontFamily: "'Nunito', sans-serif" }

export default function PatternLock({ onVerify }) {
  const [pattern, setPattern] = useState([])
  const [drawing, setDrawing] = useState(false)
  const containerRef = useRef(null)
  const dotRefs = useRef([])

  const getDotAtPoint = (x, y) => {
    for (let i = 0; i < dotRefs.current.length; i++) {
      const el = dotRefs.current[i]
      if (!el) continue
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      if (Math.hypot(x - cx, y - cy) < 28) return i
    }
    return null
  }

  const handleMove = (e) => {
    if (!drawing) return
    const touch = e.touches?.[0] || e
    e.preventDefault?.()
    const dot = getDotAtPoint(touch.clientX, touch.clientY)
    if (dot !== null && !pattern.includes(dot)) {
      setPattern(p => [...p, dot])
      if (navigator.vibrate) navigator.vibrate(10)
    }
  }

  const handleEnd = () => {
    setDrawing(false)
    if (pattern.length >= 3) {
      onVerify(pattern.join(''))
    }
    setPattern([])
  }

  return (
    <div className="flex flex-col items-center gap-10 py-4">
      <div
        ref={containerRef}
        className="relative select-none touch-none bg-white p-8 rounded-[40px] shadow-[0_8px_32px_rgba(124,111,247,0.06)] border border-[#F0F0F8]"
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        <div className="grid grid-cols-3 gap-10">
          {DOTS.map(i => {
            const isSelected = pattern.includes(i)
            return (
              <div
                key={i}
                ref={el => dotRefs.current[i] = el}
                onMouseDown={() => { setDrawing(true); setPattern([i]) }}
                onTouchStart={() => { setDrawing(true); setPattern([i]) }}
                className="w-12 h-12 flex items-center justify-center cursor-pointer relative"
              >
                <motion.div 
                  animate={{
                    scale: isSelected ? 1.2 : 1,
                    backgroundColor: isSelected ? 'var(--primary)' : '#F1F5F9',
                    boxShadow: isSelected ? '0 0 20px rgba(124,111,247,0.4)' : 'none',
                  }}
                  className={`w-4 h-4 rounded-full transition-shadow duration-300 ${isSelected ? '' : 'border border-[#E2E8F0]'}`}
                />
                <AnimatePresence>
                  {isSelected && (
                    <motion.div 
                      key={`ring-${i}`}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 2, opacity: 0.2 }}
                      exit={{ scale: 2.5, opacity: 0 }}
                      className="absolute inset-0 bg-[var(--primary)] rounded-full pointer-events-none"
                    />
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
        <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-[0.2em]" style={S}>
          Connect at least 3 dots
        </p>
      </div>
    </div>
  )
}
