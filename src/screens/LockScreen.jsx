// LockScreen — white premium lock screen with indigo radial glow
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock } from 'lucide-react'
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

  const S = { fontFamily: "'Nunito', sans-serif" }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-dvh flex flex-col bg-[#F8F7FF] safe-top relative overflow-hidden"
    >
      {/* Top branding */}
      <div className="flex flex-col items-center pt-24 pb-8 relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="w-20 h-20 rounded-[24px] flex items-center justify-center mb-6"
          style={{
            background: 'var(--gradient-primary)',
            boxShadow: '0 8px 32px rgba(124,111,247,0.35)',
          }}
        >
          <Lock className="w-10 h-10 text-white" strokeWidth={2.5} />
        </motion.div>

        <h1 className="text-[36px] font-[800] text-[#0F172A] mb-1"
          style={S}>Spendly</h1>
        <p className="text-[14px] font-[700] text-[var(--primary)] uppercase tracking-widest"
          style={S}>Unlock to continue</p>
      </div>

      {/* Lock component */}
      <div className="flex-1 flex flex-col justify-center relative z-10 -mt-10">
        {(lockType === 'pin4' || lockType === 'pin6' || lockType === 'none') && (
          <PinLock pinLength={lockType === 'pin4' ? 4 : 6} onVerify={verifyPin}
            onBiometric={handleBiometric} wrongAttempts={wrongAttempts} lockoutRemaining={lockoutRemaining} />
        )}
        {lockType === 'pattern' && <PatternLock onVerify={verifyPattern} />}
        {lockType === 'biometric' && <FingerprintLock onVerify={() => verifyBiometric()} />}
      </div>

      {/* Footer */}
      <div className="pb-12 text-center relative z-10">
        <p className="text-[12px] font-[800] text-[#CBD5E1] uppercase tracking-[0.2em]"
          style={S}>
          🔒 AES-256 Encrypted
        </p>
      </div>
    </motion.div>
  )
}
