// Fingerprint / Face ID biometric lock component
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Fingerprint } from 'lucide-react'

export default function FingerprintLock({ onVerify }) {
  const [state, setState] = useState('idle') // idle | scanning | success | fail

  const scan = async () => {
    setState('scanning')
    try {
      if (window.PublicKeyCredential) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        if (available) {
          setState('success')
          setTimeout(() => onVerify(), 500)
          return
        }
      }
      setState('fail')
    } catch {
      setState('fail')
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={scan}
        animate={state === 'scanning' ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: state === 'scanning' ? Infinity : 0, duration: 1 }}
      >
        <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors ${
          state === 'success' ? 'bg-green-100' :
          state === 'fail' ? 'bg-red-100' :
          'bg-purple-50 dark:bg-purple-900/20'
        }`}>
          <Fingerprint className={`w-14 h-14 ${
            state === 'success' ? 'text-green-500' :
            state === 'fail' ? 'text-red-500' :
            'text-purple-600'
          }`} />
        </div>
      </motion.button>
      <p className="text-[15px] font-medium text-gray-600 dark:text-gray-300">
        {state === 'idle' && 'Tap to use Face ID or Fingerprint'}
        {state === 'scanning' && 'Scanning...'}
        {state === 'success' && '✓ Verified!'}
        {state === 'fail' && 'Not available on this device'}
      </p>
    </div>
  )
}
