// PIN entry lock component with shake animation on wrong PIN
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Delete } from 'lucide-react'

export default function PinLock({ onVerify, onBiometric, wrongAttempts, lockoutRemaining, pinLength = 6 }) {
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(false)

  const addDigit = (d) => {
    if (pin.length >= pinLength || lockoutRemaining > 0) return
    const next = pin + d
    setPin(next)
    if (next.length === pinLength) {
      setTimeout(() => onVerify(next), 100)
      setPin('')
    }
  }

  const backspace = () => setPin(p => p.slice(0, -1))

  useEffect(() => {
    if (wrongAttempts > 0) {
      setShake(true)
      setTimeout(() => setShake(false), 600)
    }
  }, [wrongAttempts])

  const buttons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'bio', 0, 'del']

  return (
    <div className="flex flex-col items-center gap-12 px-8 w-full max-w-sm mx-auto">
      {/* PIN dots */}
      <motion.div
        animate={shake ? { x: [-12, 12, -12, 12, -6, 6, 0] } : {}}
        transition={{ duration: 0.5 }}
        className="flex gap-5"
      >
        {Array.from({ length: pinLength }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              background: i < pin.length ? '#00D4FF' : '#111827',
              boxShadow: i < pin.length ? '0 0 15px rgba(0, 212, 255, 0.4)' : 'none',
              scale: i < pin.length ? 1.2 : 1,
            }}
            className="w-4 h-4 rounded-full border border-white/5"
          />
        ))}
      </motion.div>

      {/* Lockout timer */}
      <AnimatePresence>
        {lockoutRemaining > 0 && (
          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-[14px] text-expense font-display font-bold uppercase tracking-widest bg-expense/10 px-4 py-2 rounded-full border border-expense/20">
            SYSTEM LOCKED: {lockoutRemaining}s
          </motion.p>
        )}
      </AnimatePresence>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-6 w-full relative">
        {buttons.map((btn, i) => {
          if (btn === 'del') {
            return (
              <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={backspace}
                className="w-full aspect-square rounded-[32px] glass-elevated border-white/5 flex items-center justify-center shadow-glowSmall hover:bg-white/5">
                <Delete className="w-6 h-6 text-[#7B8DB0]" />
              </motion.button>
            )
          }
          if (btn === 'bio') {
            return (
              <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={onBiometric}
                className="w-full aspect-square rounded-[32px] glass-elevated border-white/5 flex items-center justify-center shadow-glowSmall hover:bg-white/5">
                <span className="text-2xl filter drop-shadow-md">👆</span>
              </motion.button>
            )
          }
          return (
            <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={() => addDigit(String(btn))} disabled={lockoutRemaining > 0}
              className="w-full aspect-square rounded-[32px] glass-elevated border-white/5 flex flex-col items-center justify-center text-[28px] font-display font-bold text-[#F0F4FF] shadow-glowSmall hover:bg-white/5 disabled:opacity-20 transition-all">
              {btn}
              <span className="text-[10px] text-[#3D4F70] opacity-40 mt-[-4px] tracking-widest font-bold">ALPHA</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
