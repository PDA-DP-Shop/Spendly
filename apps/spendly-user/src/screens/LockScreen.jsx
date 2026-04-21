import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, RefreshCw, AlertTriangle, X } from 'lucide-react'
import PinLock from '../components/lock/PinLock'
import PatternLock from '../components/lock/PatternLock'
import FingerprintLock from '../components/lock/FingerprintLock'
import { useAppLock } from '../hooks/useAppLock'
import { useSettingsStore } from '../store/settingsStore'

export default function LockScreen() {
  const { verifyPin, verifyPattern, verifyBiometric, wrongAttempts, getLockoutRemaining, biometricBlocked } = useAppLock()
  const { settings } = useSettingsStore()
  const lockType = settings?.lockType || 'pin4'
  const [lockoutRemaining, setLockoutRemaining] = useState(0)
  const [showReloadConfirm, setShowReloadConfirm] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setLockoutRemaining(getLockoutRemaining())
    }, 1000)
    
    let bioTimeout = null;
    // Auto-trigger biometric on component mount if enabled and not blocked
    if ((lockType === 'faceid' || lockType === 'fingerprint') && !biometricBlocked) {
      bioTimeout = setTimeout(() => verifyBiometric(), 500)
    }

    return () => {
      clearInterval(interval)
      if (bioTimeout) clearTimeout(bioTimeout)
    }
  }, [getLockoutRemaining, lockType, biometricBlocked, verifyBiometric])

  const handleReload = () => {
    window.location.reload()
  }

  const handleReload = () => {
    window.location.reload()
  }

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
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
             <ShieldCheck className="w-6 h-6 text-black" strokeWidth={3} />
             <h2 className="text-[28px] font-[800] text-black tracking-tight" style={S}>Authentication</h2>
          </div>
          <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-widest" style={S}>
            Verify your identity to continue
          </p>
        </div>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowReloadConfirm(true)}
          className="w-12 h-12 rounded-full bg-[#F6F6F6] border border-[#EEEEEE] flex items-center justify-center flex-shrink-0"
        >
          <RefreshCw className="w-5 h-5 text-black" strokeWidth={2.5} />
        </motion.button>
      </div>

      <AnimatePresence>
        {showReloadConfirm && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8 text-center"
          >
             <div className="w-20 h-20 rounded-[28px] bg-red-50 flex items-center justify-center mb-8">
               <AlertTriangle className="w-10 h-10 text-red-500" />
             </div>
             <h3 className="text-[24px] font-[900] text-black tracking-tight mb-4" style={S}>Reload Spendly?</h3>
             <p className="text-[#545454] text-[15px] font-[500] leading-relaxed mb-10" style={S}>
                Refreshing will reset the current session UI. Your data is safely stored offline and will not be affected. 
             </p>
             <div className="w-full flex flex-col gap-3">
               <motion.button whileTap={{ scale: 0.96 }} onClick={handleReload}
                 className="w-full py-5 rounded-2xl bg-black text-white font-[802] text-[16px] shadow-xl" style={S}>
                 Yes, Refresh App
               </motion.button>
               <button onClick={() => setShowReloadConfirm(false)} className="w-full py-5 font-[800] text-[#AFAFAF] uppercase tracking-widest text-[13px]" style={S}>Cancel</button>
             </div>
          </motion.div>
<<<<<<< HEAD
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col justify-center relative z-10 -mt-24">
        {(lockType === 'pin4' || lockType === 'pin6' || lockType === 'none') && (
          <PinLock pinLength={lockType === 'pin4' ? 4 : 6} onVerify={verifyPin}
            onBiometric={handleBiometric} wrongAttempts={wrongAttempts} lockoutRemaining={lockoutRemaining} />
=======
>>>>>>> 41f113d (upgrade scanner)
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col justify-center relative z-10 -mt-16">
        {/* If biometric is blocked, force PIN entry regardless of lockType */}
        {(biometricBlocked || ['pin', 'pin4', 'pin6', 'none', 'faceid', 'fingerprint', 'biometric'].includes(lockType)) && (
          <PinLock 
            pinLength={lockType === 'pin6' ? 6 : 4} 
            onVerify={verifyPin}
            onBiometric={!biometricBlocked ? handleBiometric : null} 
            wrongAttempts={wrongAttempts} 
            lockoutRemaining={lockoutRemaining} 
          />
        )}
        {lockType === 'pattern' && !biometricBlocked && <PatternLock onVerify={verifyPattern} />}
      </div>

      <div className="pb-16 text-center relative z-10">
        <p className="text-[11px] font-[800] text-[#D8D8D8] uppercase tracking-[0.25em]" style={S}>
          Spendly Secure Access
        </p>
      </div>
    </motion.div>
  )
}

