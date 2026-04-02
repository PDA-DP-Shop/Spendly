// BadgesScreen.jsx — Feature 18: Achievements Grid
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TopHeader from '../components/shared/TopHeader'
import { useBadgeStore } from '../store/badgeStore'
import { BADGES } from '../constants/badges'
import { X, Lock, Trophy } from 'lucide-react'
import { format, parseISO } from 'date-fns'

const S = { fontFamily: "'Nunito', sans-serif" }

function BadgeDetailSheet({ badge, isEarned, earnedDate, onClose }) {
  if (!badge) return null
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 z-[70]" style={{ background: 'rgba(15,23,42,0.4)' }} />
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 350 }}
        className="fixed bottom-0 left-0 right-0 z-[71] pb-safe bg-white flex flex-col items-center text-center px-6"
        style={{ borderRadius: '40px 40px 0 0', maxHeight: '90dvh', boxShadow: '0 -20px 40px rgba(0,0,0,0.1)' }}>
        
        <div className="w-12 h-1.5 bg-[#EEF2FF] rounded-full mx-auto mt-4 mb-8" />
        <button onClick={onClose} className="absolute top-6 right-6 w-11 h-11 rounded-full bg-[#F8F9FF] flex items-center justify-center border border-[#F0F0F8]">
          <X className="w-5 h-5 text-[#64748B]" />
        </button>

        <div className="w-44 h-44 flex items-center justify-center rounded-[40px] text-[80px] bg-[#F8F7FF] border border-[#F0F0F8] shadow-sm mb-6 relative">
          {isEarned ? (
            <span className="drop-shadow-md">{badge.emoji}</span>
          ) : (
            <Lock className="w-16 h-16 text-[#CBD5E1]" />
          )}
          {isEarned && (
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#10B981] rounded-full flex items-center justify-center border-4 border-white text-white shadow-lg">
              <Trophy className="w-6 h-6" />
            </div>
          )}
        </div>

        <h3 className="text-[28px] font-[800] text-[#0F172A] mb-2 tracking-tight" style={S}>{badge.title}</h3>
        <p className="text-[16px] font-[800] text-[#94A3B8] max-w-[280px] mb-10 leading-relaxed" style={S}>{badge.desc}</p>
        
        {isEarned ? (
          <div className="w-full py-5 rounded-[22px] bg-[#ECFDF5] border border-[#10B98130] text-[#10B981] font-[800] text-[13px] tracking-widest uppercase mb-10" style={S}>
            UNLOCKED ON {format(parseISO(earnedDate), 'MMM d, yyyy')}
          </div>
        ) : (
          <div className="w-full py-5 rounded-[22px] bg-[#F8F7FF] border border-[#F0F0F8] text-[#CBD5E1] font-[800] text-[12px] tracking-widest uppercase mb-10" style={S}>
             CONTINUED PROGRESS REQUIRED
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default function BadgesScreen() {
  const { earned, loadBadges, markSeen } = useBadgeStore()
  const [selectedBadge, setSelectedBadge] = useState(null)
  
  useEffect(() => { loadBadges() }, [])

  const earnedMap = earned.reduce((acc, b) => ({ ...acc, [b.badgeId]: b }), {})
  const totalEarned = earned.length
  
  const categories = [...new Set(BADGES.map(b => b.category))]

  const handleSelect = (badge) => {
    setSelectedBadge(badge)
    if (earnedMap[badge.id]?.isNew === true) {
      markSeen(badge.id)
    }
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#F8F7FF] pb-24">
      <TopHeader title="Achievements" />

      {/* Progress Hero */}
      <div className="mx-6 mb-10 mt-2 rounded-[36px] p-8 text-white text-center relative overflow-hidden shadow-xl" style={{ background: 'var(--gradient-primary)' }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white opacity-10 -mr-16 -mt-16" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white opacity-5" />
        
        <div className="relative z-10">
          <p className="text-[12px] font-[800] text-white/70 uppercase tracking-[0.25em] mb-4" style={S}>Mastery Progression</p>
          <div className="flex items-baseline justify-center gap-2 mb-6">
            <span className="text-[54px] font-[800] leading-none tracking-tighter" style={S}>{totalEarned}</span>
            <span className="text-[24px] font-[800] text-white/50" style={S}>/{BADGES.length}</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden w-full max-w-[240px] mx-auto border border-white/10 p-[2px]">
            <motion.div className="h-full bg-white rounded-full shadow-sm"
              initial={{ width: 0 }} animate={{ width: `${(totalEarned / BADGES.length) * 100}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
          </div>
          <p className="text-[11px] font-[800] text-white/80 uppercase tracking-[0.15em] mt-6" style={S}>
            Rank: {totalEarned > 10 ? 'STRATEGIST' : totalEarned > 5 ? 'OPERATIVE' : 'INITIATE'}
          </p>
        </div>
      </div>

      <div className="px-6 flex flex-col gap-10">
        {categories.map(category => {
          const categoryBadges = BADGES.filter(b => b.category === category)
          const earnedInCategory = categoryBadges.filter(b => earnedMap[b.id]).length
          
          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-5 px-1">
                <p className="font-[800] text-[18px] text-[#0F172A] tracking-tight" style={S}>{category}</p>
                <div className="bg-white border border-[#F0F0F8] px-4 py-1 rounded-full shadow-sm">
                  <p className="text-[11px] font-[800] text-[var(--primary)] tracking-widest" style={S}>
                    {earnedInCategory}/{categoryBadges.length}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {categoryBadges.map((badge, i) => {
                  const isEarned = !!earnedMap[badge.id]
                  const isNew = isEarned && earnedMap[badge.id].isNew

                  return (
                    <motion.button key={badge.id} 
                      onClick={() => handleSelect(badge)}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                      className={`relative aspect-square rounded-[28px] border transition-all flex flex-col items-center justify-center p-3
                        ${isEarned ? 'bg-white border-[#F0F0F8] shadow-sm' : 'bg-[#F8F7FF] border-[#F1F5F9] opacity-40'}`}>
                      
                      {isNew && (
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }} 
                          className="absolute -top-1 -right-1 w-5 h-5 bg-[#7C6FF7] rounded-full ring-4 ring-white shadow-md z-10" />
                      )}

                      <div className={`w-14 h-14 flex items-center justify-center rounded-[20px] text-2xl mb-2 transition-all ${isEarned ? 'bg-[#F8F7FF]' : 'bg-transparent'}`}>
                        {isEarned ? (
                          <span className="drop-shadow-sm">{badge.emoji}</span>
                        ) : (
                          <Lock className="w-6 h-6 text-[#CBD5E1]" />
                        )}
                      </div>
                      
                      <p className={`text-[10px] font-[800] text-center leading-tight uppercase tracking-tight relative z-10 ${isEarned ? 'text-[#0F172A]' : 'text-[#CBD5E1]'}`} style={S}>
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
