// Pattern lock — draw a connect-the-dots unlock pattern
import { useRef, useState, useEffect } from 'react'

const DOTS = [0, 1, 2, 3, 4, 5, 6, 7, 8] // 3x3 grid

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
      if (Math.hypot(x - cx, y - cy) < 24) return i
    }
    return null
  }

  const handleMove = (e) => {
    if (!drawing) return
    const touch = e.touches?.[0] || e
    const dot = getDotAtPoint(touch.clientX, touch.clientY)
    if (dot !== null && !pattern.includes(dot)) {
      setPattern(p => [...p, dot])
      navigator.vibrate?.(10)
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
    <div
      ref={containerRef}
      className="relative select-none touch-none"
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      <div className="grid grid-cols-3 gap-8 p-8">
        {DOTS.map(i => (
          <div
            key={i}
            ref={el => dotRefs.current[i] = el}
            onMouseDown={() => { setDrawing(true); setPattern([i]) }}
            onTouchStart={() => { setDrawing(true); setPattern([i]) }}
            className="flex items-center justify-center cursor-pointer"
          >
            <div className={`w-5 h-5 rounded-full border-2 transition-all duration-100 ${
              pattern.includes(i)
                ? 'bg-purple-600 border-purple-600 scale-125'
                : 'bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500'
            }`} />
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-gray-400 mt-2">Draw your unlock pattern</p>
    </div>
  )
}
