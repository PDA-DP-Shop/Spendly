import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff } from 'lucide-react'

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[450px] z-[100] safe-top"
          style={{ background: '#FFFBEB', borderBottom: '1px solid rgba(245,158,11,0.2)' }}
        >
          <div className="flex items-center justify-center gap-2 py-2">
            <WifiOff className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-[12px] font-bold tracking-wider text-[#D97706]"
              style={{ fontFamily: "'Nunito', sans-serif" }}>
              YOU'RE OFFLINE — ALL FEATURES STILL WORK
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
