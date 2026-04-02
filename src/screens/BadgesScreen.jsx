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
    <motion.div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-[#050B18]/80 backdrop-blur-[40px]" onClick={onClose} />
      <motion.div className="relative w-full max-w-md bg-[#070D1F]/95 rounded-t-[40px] sm:rounded-[40px] p-8 pb-14 flex flex-col items-center text-center border-t border-white/5"
        initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} transition={{ type: 'spring', damping: 25 }}>
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full glass border-none flex items-center justify-center text-[#7B8DB0]"><X className="w-5 h-5" /></button>
        
        <div className="mb-0 relative py-12">
           <div className="absolute inset-0 bg-cyan-glow/5 blur-[40px] rounded-full" />
           <div className="w-40 h-40 flex items-center justify-center rounded-[48px] text-[72px] shadow-glow relative z-10 glass-accent border-white/10">
            {isEarned ? (
              <span className="drop-shadow-glow animate-pulse">{badge.emoji}</span>
            ) : (
              <Lock className="w-16 h-16 text-cyan-glow opacity-30" />
            )}
          </div>
          {isEarned && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className="absolute -bottom-2 -right-2 w-12 h-12 bg-cyan-glow rounded-full flex items-center justify-center border-4 border-[#070D1F] text-white shadow-glow">
              <Trophy className="w-6 h-6" />
            </motion.div>
          )}
        </div>

        <p className="font-display font-bold text-[32px] text-[#F0F4FF] mb-2 tracking-tighter">{badge.title}</p>
        <p className="text-[16px] font-body text-[#7B8DB0] max-w-[280px] mb-10 leading-relaxed font-medium">{badge.desc}</p>
        
        {isEarned ? (
          <div className="py-4 px-8 rounded-full bg-cyan-dim border border-cyan-glow/30 text-cyan-glow font-display font-bold text-[13px] tracking-widest uppercase shadow-glowSmall">
            UNLOCKED ON {format(parseISO(earnedDate), 'MMM d, yyyy')}
          </div>
        ) : (
          <div className="py-4 px-8 rounded-full bg-white/5 border border-white/5 text-[#3D4F70] font-display font-bold text-[12px] tracking-widest uppercase">
             CONTINUE DRILL TO UNLOCK
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
  
  const categories = [...new Set(BADGES.map(b => b.category))]

  const handleSelect = (badge) => {
    setSelectedBadge(badge)
    if (earnedMap[badge.id]?.isNew === true) {
      markSeen(badge.id)
    }
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#050B18] pb-24">
      <TopHeader title="Tactical Assets" />

      {/* Progress Hero */}
      <div className="mx-6 mb-10 rounded-[36px] p-8 text-white text-center relative overflow-hidden glass-accent border-white/10 shadow-glowLg group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0066FF]/20 to-[#00D4FF]/20 opacity-50" />
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-cyan-glow/10 blur-[50px] animate-pulse" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-blue-600/10 blur-[50px]" />
        
        <div className="relative z-10">
          <p className="text-[11px] font-display font-bold text-cyan-glow uppercase tracking-[0.25em] mb-4">Mastery Progression</p>
          <div className="flex items-end justify-center gap-2 mb-6">
            <span className="text-[54px] font-display font-bold leading-none tracking-tighter drop-shadow-glow">{totalEarned}</span>
            <span className="text-[22px] font-display font-bold text-[#3D4F70] mb-2">/{BADGES.length}</span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden w-full max-w-[280px] mx-auto border border-white/5 p-[2px]">
            <motion.div className="h-full bg-gradient-to-r from-[#0066FF] to-[#00D4FF] rounded-full shadow-glowSmall"
              initial={{ width: 0 }} animate={{ width: `${(totalEarned / BADGES.length) * 100}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
          </div>
          <p className="text-[11px] font-body font-bold text-[#3D4F70] uppercase tracking-widest mt-6 opacity-60">Status: {totalEarned > 10 ? 'OPERATIVE' : totalEarned > 5 ? 'SPECIALIST' : 'RECRUIT'}</p>
        </div>
      </div>

      <div className="px-6 flex flex-col gap-10">
        {categories.map(category => {
          const categoryBadges = BADGES.filter(b => b.category === category)
          const earnedInCategory = categoryBadges.filter(b => earnedMap[b.id]).length
          
          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-5 px-1">
                <p className="font-display font-bold text-[18px] text-[#F0F4FF] tracking-tight">{category}</p>
                <div className="bg-cyan-dim border border-cyan-glow/20 px-4 py-1 rounded-full shadow-glowSmall">
                  <p className="text-[11px] font-display font-bold text-cyan-glow tracking-widest">
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
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className={`relative aspect-square rounded-[28px] border transition-all duration-300 flex flex-col items-center justify-center p-3 group
                        ${isEarned ? 'glass-accent border-cyan-glow/10 shadow-glowSmall' : 'glass border-transparent grayscale brightness-50 opacity-40 hover:grayscale-0 hover:opacity-100'}`}>
                      
                      {isNew && (
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }} className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-glow rounded-full ring-4 ring-[#050B18] shadow-glow z-10" />
                      )}

                      <div className={`w-14 h-14 flex items-center justify-center rounded-2xl text-2xl mb-1.5 transition-all shadow-inner relative z-10 ${isEarned ? 'bg-cyan-dim' : 'bg-white/5'}`}>
                        {isEarned ? (
                          <span className="drop-shadow-md">{badge.emoji}</span>
                        ) : (
                          <Lock className="w-6 h-6 text-[#3D4F70]" />
                        )}
                      </div>
                      
                      <p className={`text-[10px] font-display font-bold text-center leading-tight uppercase tracking-tighter relative z-10 ${isEarned ? 'text-[#F0F4FF]' : 'text-[#3D4F70]'}`}>
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
