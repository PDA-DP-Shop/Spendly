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

  const S = { fontFamily: "'Inter', sans-serif" }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-dvh flex flex-col bg-white safe-top relative overflow-hidden"
    >
      <div className="flex items-center justify-between px-8 pt-12 mb-12 sticky top-0 z-20">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <ShieldCheck className="w-6 h-6 text-black" strokeWidth={3} />
             <h2 className="text-[28px] font-[800] text-black tracking-tight" style={S}>Authentication</h2>
          </div>
          <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-widest" style={S}>
            Verify your identity to continue
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center relative z-10 -mt-24">
        {(lockType === 'pin4' || lockType === 'pin6' || lockType === 'none') && (
          <PinLock pinLength={lockType === 'pin4' ? 4 : 6} onVerify={verifyPin}
            onBiometric={handleBiometric} wrongAttempts={wrongAttempts} lockoutRemaining={lockoutRemaining} />
        )}
        {lockType === 'pattern' && <PatternLock onVerify={verifyPattern} />}
        {lockType === 'biometric' && <FingerprintLock onVerify={() => verifyBiometric()} />}
      </div>

      <div className="pb-16 text-center relative z-10">
        <p className="text-[11px] font-[800] text-[#D8D8D8] uppercase tracking-[0.25em]" style={S}>
          Spendly Secure Access
        </p>
      </div>
    </motion.div>
  )
}

