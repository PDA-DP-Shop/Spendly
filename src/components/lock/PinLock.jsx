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

  // Shake when wrong attempt recorded
  useEffect(() => {
    if (wrongAttempts > 0) {
      setShake(true)
      setTimeout(() => setShake(false), 600)
    }
  }, [wrongAttempts])

  const buttons = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del']

  return (
    <div className="flex flex-col items-center gap-8 px-8">
      {/* PIN dots */}
      <motion.div
        animate={shake ? { x: [-8, 8, -8, 8, -4, 4, 0] } : {}}
        transition={{ duration: 0.5 }}
        className="flex gap-4"
      >
        {Array.from({ length: pinLength }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              background: i < pin.length ? '#7C3AED' : shake ? '#EF4444' : '#E9D5FF',
              scale: i < pin.length ? 1.1 : 1,
            }}
            className="w-4 h-4 rounded-full"
          />
        ))}
      </motion.div>

      {/* Lockout timer */}
      {lockoutRemaining > 0 && (
        <p className="text-sm text-red-500 font-medium">Wait {lockoutRemaining}s before trying again</p>
      )}

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
        {buttons.map((btn, i) => {
          if (btn === null) return <div key={i} />
          if (btn === 'del') {
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.90 }}
                onClick={backspace}
                className="w-full aspect-square max-w-[80px] mx-auto rounded-full bg-white dark:bg-[#242438] shadow-md flex items-center justify-center"
              >
                <Delete className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </motion.button>
            )
          }
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.90, backgroundColor: '#F3E8FF' }}
              onClick={() => addDigit(String(btn))}
              disabled={lockoutRemaining > 0}
              className="w-full aspect-square max-w-[80px] mx-auto rounded-full bg-white dark:bg-[#242438] shadow-md flex items-center justify-center text-[24px] font-sora font-semibold text-gray-900 dark:text-white disabled:opacity-40"
            >
              {btn}
            </motion.button>
          )
        })}
      </div>

      {onBiometric && (
        <button onClick={onBiometric} className="text-purple-600 text-sm font-medium">
          Use Face ID 👆
        </button>
      )}
    </div>
  )
}
