// PIN entry lock component with shake animation on wrong PIN
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Delete, Fingerprint } from 'lucide-react'

export default function PinLock({ onVerify, onBiometric, wrongAttempts, lockoutRemaining, pinLength = 6 }) {
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(false)
  const S = { fontFamily: "'Inter', sans-serif" }

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
    <div className="flex flex-col items-center gap-14 px-8 w-full max-w-sm mx-auto">
      {/* PIN dots */}
      <motion.div
        animate={shake ? { x: [-12, 12, -12, 12, -6, 6, 0] } : {}}
        transition={{ duration: 0.5 }}
        className="flex gap-5"
      >
        {Array.from({ length: pinLength }).map((_, i) => {
          const filled = i < pin.length
          return (
            <motion.div
              key={i}
              animate={{
                scale: filled ? 1.3 : 1,
                backgroundColor: filled ? '#000000' : '#EEEEEE',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="w-3 h-3 rounded-full border border-transparent shadow-sm"
              style={{ 
                  boxShadow: filled ? '0 0 12px rgba(0,0,0,0.2)' : 'none',
              }}
            />
          )
        })}
      </motion.div>

      {/* Lockout status */}
      <AnimatePresence>
        {lockoutRemaining > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="bg-black px-8 py-3.5 rounded-full border border-black shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <p className="text-[10px] text-white font-[900] uppercase tracking-[0.3em] text-center" style={S}>
              SECURITY_TIMEOUT: {lockoutRemaining}S
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* High-Contrast Keypad */}
      <div className="grid grid-cols-3 gap-x-6 gap-y-6 w-full relative">
        {buttons.map((btn, i) => {
          if (btn === 'del') {
            return (
              <motion.button key={i} whileTap={{ scale: 0.9 }} onClick={backspace}
                className="w-full aspect-square rounded-[32px] flex items-center justify-center transition-all bg-[#F6F6F6] border border-[#EEEEEE] group active:bg-black active:border-black active:text-white">
                <Delete className="w-6 h-6" strokeWidth={3} />
              </motion.button>
            )
          }
          if (btn === 'bio') {
            return (
              <motion.button key={i} whileTap={{ scale: 0.9 }} onClick={onBiometric}
                className="w-full aspect-square rounded-[32px] flex items-center justify-center transition-all bg-[#F6F6F6] border border-[#EEEEEE] group active:bg-black active:border-black active:text-white text-black">
                <Fingerprint className="w-6 h-6" strokeWidth={3} />
              </motion.button>
            )
          }
          return (
            <motion.button key={i} whileTap={{ scale: 0.95 }} onClick={() => addDigit(String(btn))} disabled={lockoutRemaining > 0}
              className="w-full aspect-square rounded-[32px] bg-white flex flex-col items-center justify-center shadow-xl border border-[#EEEEEE] disabled:opacity-20 transition-all active:bg-black active:text-white active:border-black"
              style={{ ...S }}>
              <span className="text-[28px] font-[900] leading-none tracking-tighter">{btn}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
