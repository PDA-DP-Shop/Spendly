// Pattern lock — draw a connect-the-dots unlock pattern
import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const DOTS = [0, 1, 2, 3, 4, 5, 6, 7, 8] // 3x3 grid
const S = { fontFamily: "'Inter', sans-serif" }

export default function PatternLock({ onVerify }) {
  const [pattern, setPattern] = useState([])
  const [drawing, setDrawing] = useState(false)
  const containerRef = useRef(null)
  const dotRefs = useRef([])

  const safeVibrate = (duration) => {
    if (!navigator.vibrate) return
    try {
      // Browsers often block vibration if the user hasn't interacted 
      // with the page's "active status" yet. Checking userActivation 
      // where supported (Chrome/Edge) or falling back to a silent try-catch.
      if (typeof navigator.userActivation === 'undefined' || navigator.userActivation.isActive) {
        navigator.vibrate(duration)
      }
    } catch (e) {
      // Silently fail if blocked by browser intervention
    }
  }

  const handleStart = (i) => {
    setDrawing(true)
    setPattern([i])
    safeVibrate(20)
  }

  const handleMove = (e) => {
    if (!drawing) return
    const touch = e.touches?.[0] || e
    
    // e.preventDefault() is intentionally omitted here because 'touch-none'
    // in CSS handles native scroll prevention, and React's passive listeners
    // will throw warnings if preventDefault is called.

    const dot = getDotAtPoint(touch.clientX, touch.clientY)
    if (dot !== null && !pattern.includes(dot)) {
      setPattern(p => [...p, dot])
      safeVibrate(15)
    }
  }

  const handleEnd = () => {
    setDrawing(false)
    if (pattern.length >= 3) {
      onVerify(pattern.join(''))
    }
    setPattern([])
  }

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

  return (
    <div className="flex flex-col items-center gap-10 py-6">
      <div
        ref={containerRef}
        className="relative select-none touch-none bg-white p-10 rounded-[32px] border border-[#EEEEEE] shadow-2xl"
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
                onMouseDown={() => handleStart(i)}
                onTouchStart={() => handleStart(i)}
                className="w-14 h-14 flex items-center justify-center cursor-pointer relative"
              >
                <motion.div 
                  animate={{
                    scale: isSelected ? 1.4 : 1,
                    backgroundColor: isSelected ? '#000000' : '#EEEEEE',
                    boxShadow: isSelected ? '0 0 16px rgba(0,0,0,0.3)' : 'none',
                  }}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-300`}
                />
                <AnimatePresence>
                  {isSelected && (
                    <motion.div 
                      key={`ring-${i}`}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 2.5, opacity: 0.1 }}
                      exit={{ scale: 3, opacity: 0 }}
                      className="absolute inset-0 bg-black rounded-full pointer-events-none"
                    />
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
        <p className="text-[10px] font-[900] text-[#AFAFAF] uppercase tracking-[0.25em]" style={S}>
          Protocol: Connect 3+ Nodes
        </p>
      </div>
    </div>
  )
}
