import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import PinLock from './PinLock'
import PatternLock from './PatternLock'

export default function LockSetupModal({ lockType, onSave, onCancel, title: customTitle }) {
  const [step, setStep] = useState(1) // 1 = Enter, 2 = Confirm
  const [firstCode, setFirstCode] = useState('')
  const [error, setError] = useState(false)

  const handleCodeEntry = (code) => {
    if (step === 1) {
      setFirstCode(code)
      setStep(2)
      setError(false)
    } else {
      if (code === firstCode) {
        onSave(code)
      } else {
        setError(true)
        setStep(1)
        setFirstCode('')
      }
    }
  }

  const title = customTitle || (lockType === 'pattern' ? 'Draw Pattern' : 'Set PIN')
  const desc = step === 1 
    ? `Enter your new ${lockType === 'pattern' ? 'pattern' : 'PIN'}`
    : `Confirm your new ${lockType === 'pattern' ? 'pattern' : 'PIN'}`

  return (
    <div className="fixed inset-0 z-[60] bg-white dark:bg-[#0F0F1A] flex flex-col pt-12 pb-8">
      <div className="flex items-center justify-between px-6 mb-8">
        <div>
          <h2 className="text-2xl font-sora font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className={`mt-1 text-sm ${error ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
            {error ? 'Codes did not match. Try again.' : desc}
          </p>
        </div>
        <button onClick={onCancel} className="p-3 bg-gray-100 dark:bg-[#1A1A2E] rounded-full">
          <X className="w-6 h-6 text-gray-900 dark:text-white" />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={step + (error ? 'err' : '')}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.15 }}
            className="w-full flex justify-center"
          >
            {lockType === 'pattern' ? (
              <PatternLock onVerify={handleCodeEntry} />
            ) : (
              <PinLock 
                pinLength={lockType === 'pin4' ? 4 : 6} 
                onVerify={handleCodeEntry} 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
