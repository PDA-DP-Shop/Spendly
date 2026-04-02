import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShieldCheck } from 'lucide-react'
import PinLock from './PinLock'
import PatternLock from './PatternLock'

export default function LockSetupModal({ lockType, onSave, onCancel, title: customTitle }) {
  const [step, setStep] = useState(1) // 1 = Enter, 2 = Confirm
  const [firstCode, setFirstCode] = useState('')
  const [error, setError] = useState(false)
  const S = { fontFamily: "'Nunito', sans-serif" }

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

  const title = customTitle || (lockType === 'pattern' ? 'Draw Pattern' : 'Set Secure PIN')
  const desc = step === 1 
    ? `Enter your new ${lockType === 'pattern' ? 'pattern' : 'PIN'}`
    : `Confirm your new ${lockType === 'pattern' ? 'pattern' : 'PIN'}`

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col safe-top pb-8">
      <div className="flex items-center justify-between px-8 mt-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <ShieldCheck className="w-5 h-5 text-[var(--primary)]" />
             <h2 className="text-[28px] font-[800] text-[#0F172A] tracking-tight" style={S}>{title}</h2>
          </div>
          <p className={`text-[14px] font-[700] uppercase tracking-widest ${error ? 'text-[#EF4444]' : 'text-[#94A3B8]'}`} style={S}>
            {error ? 'Mismatch. Try again.' : desc}
          </p>
        </div>
        <button onClick={onCancel} className="w-12 h-12 flex items-center justify-center bg-[#F8F7FF] border border-[#F0F0F8] rounded-full shadow-sm active:scale-90 transition-transform">
          <X className="w-6 h-6 text-[#94A3B8]" />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center relative -mt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={step + (error ? 'err' : '')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 20 }}
            className="w-full"
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

      <div className="px-8 flex justify-center">
         <p className="text-[11px] font-[800] text-[#CBD5E1] uppercase tracking-[0.2em]" style={S}>
           🔒 256-bit Local Encryption
         </p>
      </div>
    </div>
  )
}
