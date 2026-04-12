import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBadgeStore } from '../../store/badgeStore'
import { useTranslation } from 'react-i18next'
import confetti from 'canvas-confetti'
import { Star, Trophy, X } from 'lucide-react'

export default function BadgeEarnedCelebration() {
  const { newBadge, clearNewBadge } = useBadgeStore()
  const { t } = useTranslation()
  const S = { fontFamily: "'Inter', sans-serif" }

  useEffect(() => {
    if (newBadge) {
      // Trigger confetti!
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

      const randomInRange = (min, max) => Math.random() * (max - min) + min

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now()
        if (timeLeft <= 0) return clearInterval(interval)
        const particleCount = 50 * (timeLeft / duration)
        
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
      }, 250)
    }
  }, [newBadge])

  return (
    <AnimatePresence>
      {newBadge && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 pointer-events-none">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
            onClick={clearNewBadge}
          />

          {/* Card */}
          <motion.div
            initial={{ scale: 0.5, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative w-full max-w-[320px] bg-white rounded-[40px] shadow-2xl p-8 flex flex-col items-center text-center pointer-events-auto"
          >
            <button 
              onClick={clearNewBadge}
              className="absolute top-6 right-6 w-10 h-10 bg-[#F6F6F6] rounded-full flex items-center justify-center border border-[#EEEEEE]"
            >
              <X className="w-5 h-5 text-black" strokeWidth={2.5} />
            </button>

            <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center text-[64px] mb-6 border border-blue-100">
               <span>{newBadge.emoji}</span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-blue-600" />
              <p className="text-[11px] font-[800] text-blue-600 uppercase tracking-widest" style={S}>Achievement Unlocked</p>
            </div>

            <h3 className="text-[24px] font-[800] text-black mb-2 tracking-tight" style={S}>{t(newBadge.titleKey)}</h3>
            <p className="text-[14px] font-[500] text-[#AFAFAF] leading-relaxed mb-8" style={S}>{t(newBadge.descKey)}</p>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={clearNewBadge}
              className="w-full py-5 bg-black text-white rounded-[24px] font-[800] text-[15px] shadow-xl shadow-black/10"
              style={S}
            >
              Magnificent!
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
