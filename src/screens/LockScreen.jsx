// Lock screen — shown before any content when app is locked
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PinLock from '../components/lock/PinLock'
import PatternLock from '../components/lock/PatternLock'
import FingerprintLock from '../components/lock/FingerprintLock'
import { useAppLock } from '../hooks/useAppLock'
import { useSettingsStore } from '../store/settingsStore'

export default function LockScreen() {
  const { verifyPin, verifyPattern, verifyBiometric, wrongAttempts, getLockoutRemaining } = useAppLock()
  const { settings } = useSettingsStore()
  const lockType = settings?.lockType || 'pin6'
  const [lockoutRemaining, setLockoutRemaining] = useState(0)

  // Update lockout countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setLockoutRemaining(getLockoutRemaining())
    }, 1000)
    return () => clearInterval(interval)
  }, [getLockoutRemaining])

  const handleBiometric = useCallback(async () => {
    await verifyBiometric()
  }, [verifyBiometric])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-dvh flex flex-col bg-[#050B18] safe-top relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-cyan-glow/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[250px] h-[250px] rounded-full bg-blue-glow/10 blur-[60px] pointer-events-none" />

      {/* Top branding */}
      <div className="flex flex-col items-center pt-24 pb-8 relative z-10 transition-all duration-700">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' }}
          className="w-24 h-24 rounded-[32px] glass-accent border-white/10 flex items-center justify-center shadow-glow mb-8"
        >
          <img src="/spendly-logo.png" alt="Spendly" className="w-14 h-14 rounded-2xl" />
        </motion.div>
        
        <h1 className="text-[44px] font-display font-bold text-white mb-1 tracking-tighter leading-none">Spendly</h1>
        <p className="text-[13px] font-display font-bold text-cyan-glow uppercase tracking-[0.25em]">Access Restricted</p>
      </div>

      {/* Lock component */}
      <div className="flex-1 flex flex-col justify-center relative z-10">
        {(lockType === 'pin4' || lockType === 'pin6' || lockType === 'none') && (
          <PinLock
            pinLength={lockType === 'pin4' ? 4 : 6}
            onVerify={verifyPin}
            onBiometric={handleBiometric}
            wrongAttempts={wrongAttempts}
            lockoutRemaining={lockoutRemaining}
          />
        )}
        {lockType === 'pattern' && (
          <PatternLock onVerify={verifyPattern} />
        )}
        {lockType === 'biometric' && (
          <FingerprintLock onVerify={() => verifyBiometric()} />
        )}
      </div>

      {/* Footer info */}
      <div className="pb-16 text-center relative z-10">
        <p className="text-[12px] font-body text-[#3D4F70] uppercase tracking-[0.2em]">Secured by AES-256 Vault</p>
      </div>
    </motion.div>
  )
}
