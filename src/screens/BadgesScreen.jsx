// BadgesScreen.jsx — Feature 18: Achievements Grid
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TopHeader from '../components/shared/TopHeader'
import { useBadgeStore } from '../store/badgeStore'
import { BADGES } from '../constants/badges'
import { X, Lock, Trophy } from 'lucide-react'
import { format, parseISO } from 'date-fns'

function BadgeDetailSheet({ badge, isEarned, earnedDate, onClose }) {
  if (!badge) return null
  return (
    <motion.div className="fixed inset-0 z-50 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div className="relative w-full bg-white dark:bg-[#1A1A2E] rounded-t-[28px] p-6 pb-12 flex flex-col items-center text-center"
        initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} transition={{ type: 'spring', damping: 25 }}>
        <button onClick={onClose} className="absolute top-5 right-5"><X className="w-5 h-5 text-gray-400" /></button>
        
        <div className="mb-6 relative">
          <div className="w-32 h-32 flex items-center justify-center rounded-full text-6xl shadow-xl border-4 border-white dark:border-[#1A1A2E]"
            style={{ backgroundColor: isEarned ? badge.color + '20' : '#F3F4F6' }}>
            {isEarned ? (
              <span className="drop-shadow-lg">{badge.emoji}</span>
            ) : (
              <Lock className="w-12 h-12 text-gray-300" />
            )}
          </div>
          {isEarned && (
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white dark:border-[#1A1A2E] text-white">
              <Trophy className="w-4 h-4" />
            </div>
          )}
        </div>

        <p className="font-sora font-bold text-[22px] text-gray-900 dark:text-white mb-2">{badge.title}</p>
        <p className="text-[15px] text-gray-500 max-w-[250px] mb-6 leading-relaxed">{badge.desc}</p>
        
        {isEarned ? (
          <div className="py-2.5 px-5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 font-semibold text-[13px]">
            Earned on {format(parseISO(earnedDate), 'MMMM d, yyyy')}
          </div>
        ) : (
          <div className="py-2.5 px-5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 font-semibold text-[13px]">
            Keep spending smart to unlock this badge
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function BadgesScreen() {
  const { earned, loadBadges, markSeen } = useBadgeStore()
  const [selectedBadge, setSelectedBadge] = useState(null)
  
  useEffect(() => { loadBadges() }, [])

  const earnedMap = earned.reduce((acc, b) => ({ ...acc, [b.badgeId]: b }), {})
  const totalEarned = earned.length
  
  // Group badges by category
  const categories = [...new Set(BADGES.map(b => b.category))]

  const handleSelect = (badge) => {
    setSelectedBadge(badge)
    if (earnedMap[badge.id]?.isNew === true) {
      markSeen(badge.id)
    }
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F5F5] dark:bg-[#0F0F1A] pb-24">
      <TopHeader title="Achievements" />

      {/* Progress Hero */}
      <div className="mx-4 mb-6 rounded-[24px] p-6 text-white text-center relative overflow-hidden" 
        style={{ background: 'linear-gradient(135deg, #7C3AED, #F97316)', boxShadow: '0 8px 32px rgba(124,58,237,0.3)' }}>
        <p className="text-sm font-semibold text-white/80 uppercase tracking-widest mb-1">Badges Earned</p>
        <div className="flex items-end justify-center gap-1 mb-3">
          <span className="text-[48px] font-sora font-bold leading-none">{totalEarned}</span>
          <span className="text-[20px] font-sora font-medium text-white/50 mb-1">/{BADGES.length}</span>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden w-48 mx-auto">
          <motion.div className="h-full bg-white rounded-full"
            initial={{ width: 0 }} animate={{ width: `${(totalEarned / BADGES.length) * 100}%` }} transition={{ delay: 0.3 }} />
        </div>
      </div>

      <div className="px-4 flex flex-col gap-8">
        {categories.map(category => {
          const categoryBadges = BADGES.filter(b => b.category === category)
          const earnedInCategory = categoryBadges.filter(b => earnedMap[b.id]).length
          
          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-4">
                <p className="font-sora font-bold text-[16px] text-gray-900 dark:text-white">{category}</p>
                <p className="text-[12px] font-semibold text-gray-400 bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full">
                  {earnedInCategory}/{categoryBadges.length}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {categoryBadges.map((badge, i) => {
                  const isEarned = !!earnedMap[badge.id]
                  const isNew = isEarned && earnedMap[badge.id].isNew

                  return (
                    <motion.button key={badge.id} 
                      onClick={() => handleSelect(badge)}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                      className={`relative aspect-square rounded-[20px] flex flex-col items-center justify-center p-2 shadow-sm 
                        ${isEarned ? 'bg-white dark:bg-[#1A1A2E]' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                      
                      {isNew && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#1A1A2E]" />
                      )}

                      <div className="w-12 h-12 flex items-center justify-center rounded-full text-2xl mb-1 transition-all"
                        style={{ backgroundColor: isEarned ? badge.color + '20' : '#F3F4F6' }}>
                        {isEarned ? (
                          <span className="drop-shadow-md">{badge.emoji}</span>
                        ) : (
                          <Lock className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      
                      <p className={`text-[10px] font-semibold text-center leading-tight ${isEarned ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400'}`}>
                        {badge.title}
                      </p>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <AnimatePresence>
        {selectedBadge && (
          <BadgeDetailSheet 
            badge={selectedBadge} 
            isEarned={!!earnedMap[selectedBadge.id]} 
            earnedDate={earnedMap[selectedBadge.id]?.earnedAt}
            onClose={() => setSelectedBadge(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}
