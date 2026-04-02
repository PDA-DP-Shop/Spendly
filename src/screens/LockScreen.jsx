import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
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
      className="h-dvh flex flex-col bg-white safe-top relative overflow-hidden"
    >
      {/* Top Header — Matching Setup Modal */}
      <div className="flex items-center justify-between px-8 mt-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <ShieldCheck className="w-5 h-5 text-[var(--primary)]" />
             <h2 className="text-[28px] font-[800] text-[#0F172A] tracking-tight" style={S}>Enter PIN</h2>
          </div>
          <p className="text-[14px] font-[700] text-[#94A3B8] uppercase tracking-widest" style={S}>
            Unlock your secure vault
          </p>
        </div>
      </div>

      {/* Lock component */}
      <div className="flex-1 flex flex-col justify-center relative z-10 -mt-20">
        {(lockType === 'pin4' || lockType === 'pin6' || lockType === 'none') && (
          <PinLock pinLength={lockType === 'pin4' ? 4 : 6} onVerify={verifyPin}
            onBiometric={handleBiometric} wrongAttempts={wrongAttempts} lockoutRemaining={lockoutRemaining} />
        )}
        {lockType === 'pattern' && <PatternLock onVerify={verifyPattern} />}
        {lockType === 'biometric' && <FingerprintLock onVerify={() => verifyBiometric()} />}
      </div>

      {/* Footer */}
      <div className="pb-12 text-center relative z-10">
        <p className="text-[11px] font-[800] text-[#CBD5E1] uppercase tracking-[0.2em]"
          style={S}>
          🔒 256-bit Local Encryption
        </p>
      </div>
    </motion.div>
  )
}
