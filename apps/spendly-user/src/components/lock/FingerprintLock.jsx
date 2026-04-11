// Fingerprint / Face ID biometric lock component
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Fingerprint, CheckCircle2, AlertCircle } from 'lucide-react'

export default function FingerprintLock({ onVerify }) {
  const [state, setState] = useState('idle') // idle | scanning | success | fail
  const S = { fontFamily: "'Nunito', sans-serif" }

  const scan = async () => {
    setState('scanning')
    try {
      if (window.PublicKeyCredential) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        if (available) {
          setState('success')
          setTimeout(() => onVerify(), 600)
          return
        }
      }
      setState('fail')
    } catch {
      setState('fail')
    }
  }

  return (
    <div className="flex flex-col items-center gap-10 py-12">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={scan}
        className="relative"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`w-32 h-32 rounded-[40px] flex items-center justify-center transition-all shadow-xl ${
              state === 'success' ? 'bg-[#ECFDF5] border border-[#10B981]' :
              state === 'fail' ? 'bg-[#FEF2F2] border border-[#EF4444]' :
              'bg-white border border-[#F0F0F8]'
            }`}
          >
            {state === 'success' ? (
              <CheckCircle2 className="w-16 h-16 text-[#10B981]" />
            ) : state === 'fail' ? (
              <AlertCircle className="w-16 h-16 text-[#EF4444]" />
            ) : (
                <Fingerprint className={`w-16 h-16 ${state === 'scanning' ? 'text-[var(--primary)] animate-pulse' : 'text-[var(--primary)]'}`} />
            )}
          </motion.div>
        </AnimatePresence>
        
        {state === 'scanning' && (
          <motion.div 
            animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-[var(--primary)] rounded-[40px] -z-10"
          />
        )}
      </motion.button>

      <div className="flex flex-col items-center gap-2">
          <p className="text-[16px] font-[800] text-[#0F172A]" style={S}>
            {state === 'idle' && 'Biometric Access'}
            {state === 'scanning' && 'Scanning...'}
            {state === 'success' && 'Verified'}
            {state === 'fail' && 'Device Busy'}
          </p>
          <p className="text-[13px] font-[700] text-[#94A3B8] uppercase tracking-widest text-center" style={S}>
            {state === 'idle' && 'Tap to unlock Spendly'}
            {state === 'scanning' && 'Keep your finger steady'}
            {state === 'success' && 'Redirecting you home'}
            {state === 'fail' && 'Try again or use PIN'}
          </p>
      </div>
    </div>
  )
}
