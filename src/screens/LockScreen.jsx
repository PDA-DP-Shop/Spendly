// LockScreen — white premium lock screen with indigo radial glow
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
      className="h-dvh flex flex-col bg-white safe-top relative overflow-hidden"
    >
      {/* Subtle indigo radial glow in center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)' }} />

      {/* Top branding */}
      <div className="flex flex-col items-center pt-20 pb-8 relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' }}
          className="w-20 h-20 rounded-[26px] flex items-center justify-center mb-6"
          style={{
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
          }}
        >
          <img src="/spendly-logo.png" alt="Spendly" className="w-12 h-12 rounded-xl" />
        </motion.div>

        <h1 className="text-[38px] font-extrabold text-[#0F172A] tracking-tight leading-none mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Spendly</h1>
        <p className="text-[14px] font-semibold text-[#6366F1] tracking-[0.15em] uppercase"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Unlock to continue</p>
      </div>

      {/* Lock component */}
      <div className="flex-1 flex flex-col justify-center relative z-10">
        {(lockType === 'pin4' || lockType === 'pin6' || lockType === 'none') && (
          <PinLock pinLength={lockType === 'pin4' ? 4 : 6} onVerify={verifyPin}
            onBiometric={handleBiometric} wrongAttempts={wrongAttempts} lockoutRemaining={lockoutRemaining} />
        )}
        {lockType === 'pattern' && <PatternLock onVerify={verifyPattern} />}
        {lockType === 'biometric' && <FingerprintLock onVerify={() => verifyBiometric()} />}
      </div>

      {/* Footer */}
      <div className="pb-12 text-center relative z-10">
        <p className="text-[12px] font-semibold text-[#CBD5E1] uppercase tracking-[0.2em]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          🔒 AES-256 Encrypted
        </p>
      </div>
    </motion.div>
  )
}
