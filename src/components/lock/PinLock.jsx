// PIN entry lock component with shake animation on wrong PIN
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Delete, Fingerprint } from 'lucide-react'

export default function PinLock({ onVerify, onBiometric, wrongAttempts, lockoutRemaining, pinLength = 6 }) {
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(false)
  const S = { fontFamily: "'Nunito', sans-serif" }

  const addDigit = (d) => {
    if (pin.length >= pinLength || lockoutRemaining > 0) return
    const next = pin + d
    setPin(next)
    if (next.length === pinLength) {
      setTimeout(() => {
        onVerify(next)
        setPin('')
      }, 150)
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
        className="flex gap-4"
      >
        {Array.from({ length: pinLength }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              background: i < pin.length ? 'var(--primary)' : 'transparent',
              borderColor: i < pin.length ? 'var(--primary)' : '#E2E8F0',
              scale: i < pin.length ? 1.1 : 1,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`w-4 h-4 rounded-full border-2 ${i < pin.length ? 'border-transparent' : 'border-[#E2E8F0]'}`}
            style={{ 
                boxShadow: i < pin.length ? '0 4px 12px rgba(124,111,247,0.3)' : 'none',
                background: i < pin.length ? 'var(--primary)' : 'transparent'
            }}
          />
        ))}
      </motion.div>

      {/* Lockout timer */}
      <AnimatePresence>
        {lockoutRemaining > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-[#FFF1F2] px-6 py-3 rounded-[20px] border border-[#FFE4E6] shadow-sm">
            <p className="text-[13px] text-[#F43F5E] font-[800] uppercase tracking-widest text-center" style={S}>
              Locked: {lockoutRemaining}s
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-6 w-full relative">
        {buttons.map((btn, i) => {
          if (btn === 'del') {
            return (
              <motion.button key={i} whileTap={{ scale: 0.9 }} onClick={backspace}
                className="w-full aspect-square rounded-full flex items-center justify-center transition-all bg-white border border-[#F0F0F8] shadow-[0_4px_12px_rgba(0,0,0,0.02)] active:bg-[#F1F5F9]/50">
                <Delete className="w-8 h-8 text-[#94A3B8]" />
              </motion.button>
            )
          }
          if (btn === 'bio') {
            return (
              <motion.button key={i} whileTap={{ scale: 0.9 }} onClick={onBiometric}
                className="w-full aspect-square rounded-full flex items-center justify-center transition-all bg-[var(--primary)] shadow-[0_8px_24px_rgba(124,111,247,0.25)] active:scale-95">
                <Fingerprint className="w-8 h-8 text-white" />
              </motion.button>
            )
          }
          return (
            <motion.button key={i} whileTap={{ scale: 0.9 }} onClick={() => addDigit(String(btn))} disabled={lockoutRemaining > 0}
              className="w-full aspect-square rounded-[32px] bg-white flex flex-col items-center justify-center text-[32px] font-[800] text-[#0F172A] shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#F0F0F8] disabled:opacity-30 transition-all active:bg-[#F8F7FF] active:border-[var(--primary)]/20"
              style={S}>
              {btn}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
