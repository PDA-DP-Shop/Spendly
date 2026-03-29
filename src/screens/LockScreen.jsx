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
      className="h-dvh flex flex-col bg-white dark:bg-[#0F0F1A] safe-top"
    >
      {/* Top branding */}
      <div className="flex flex-col items-center pt-16 pb-8">
        <div className="w-16 h-16 rounded-[20px] mb-4 flex items-center justify-center text-3xl"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', boxShadow: '0 6px 24px rgba(124,58,237,0.35)' }}>
          💸
        </div>
        <h1 className="text-[26px] font-sora font-bold text-gray-900 dark:text-white">Spendly</h1>
        <p className="text-[15px] text-gray-400 mt-1">Welcome back! 👋</p>
      </div>

      {/* Lock component */}
      <div className="flex-1 flex flex-col justify-center">
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

      {/* Forgot PIN link */}
      <div className="pb-12 text-center">
        <button className="text-sm text-gray-400 underline">Forgot PIN?</button>
      </div>
    </motion.div>
  )
}
