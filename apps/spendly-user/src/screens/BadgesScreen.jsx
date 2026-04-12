// BadgesScreen.jsx — Feature 18: Achievements Grid
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TopHeader from '../components/shared/TopHeader'
import { useBadgeStore } from '../store/badgeStore'
import { BADGES } from '../constants/badges'
import { useTranslation } from 'react-i18next'
import { X, Lock, Trophy, Medal, Star, Target } from 'lucide-react'
import { format, parseISO } from 'date-fns'

const HAPTIC_SHAKE = {
  tap: { 
    x: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.35, ease: "easeInOut" }
  }
}

function BadgeDetailSheet({ badge, isEarned, earnedDate, onClose }) {
  if (!badge) return null
  const { t } = useTranslation()
  const S = { fontFamily: "'Inter', sans-serif" }
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 z-[70]" style={{ background: 'rgba(0,0,0,0.4)' }} />
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 350 }}
        className="fixed bottom-0 left-0 right-0 z-[71] pb-safe bg-white flex flex-col items-center text-center px-8"
        style={{ borderRadius: '40px 40px 0 0', maxHeight: '90dvh', boxShadow: '0 -20px 40px rgba(0,0,0,0.1)' }}>
        
        <div className="w-12 h-1.5 bg-[#F6F6F6] rounded-full mx-auto mt-4 mb-10" />
        <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={onClose} 
          className="absolute top-8 right-8 w-11 h-11 rounded-full bg-[#F6F6F6] flex items-center justify-center border border-[#EEEEEE]">
          <X className="w-5 h-5 text-black" strokeWidth={2.5} />
        </motion.button>

        <div className="w-48 h-48 flex items-center justify-center rounded-full text-[80px] bg-blue-50 border border-blue-100 mb-10 relative">
          {isEarned ? (
            <span>{badge.emoji}</span>
          ) : (
            <Lock className="w-16 h-16 text-black" strokeWidth={2.5} />
          )}
          {isEarned && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}
              className="absolute -bottom-2 -right-2 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white text-white shadow-xl">
              <Star className="w-8 h-8 fill-current" />
            </motion.div>
          )}
        </div>

        <h3 className="text-[26px] font-[800] text-black mb-3 tracking-tight" style={S}>{t(badge.titleKey)}</h3>
        <p className="text-[15px] font-[500] text-[#AFAFAF] max-w-[300px] mb-12 leading-relaxed" style={S}>{t(badge.descKey)}</p>
        
        {isEarned ? (
          <div className="w-full py-6 rounded-[24px] bg-black text-white font-[800] text-[14px] uppercase tracking-widest mb-12 shadow-xl shadow-black/10" style={S}>
            {t('badges.earnedOn', { date: format(parseISO(earnedDate), 'MMMM d, yyyy') })}
          </div>
        ) : (
          <div className="w-full py-6 rounded-[24px] bg-[#F6F6F6] border border-[#EEEEEE] text-[#AFAFAF] font-[800] text-[13px] uppercase tracking-widest mb-12" style={S}>
             {t('badges.keepGoing')}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default function BadgesScreen() {
  const { t } = useTranslation()
  const { earned, loadBadges, markSeen } = useBadgeStore()
  const [selectedBadge, setSelectedBadge] = useState(null)
  const S = { fontFamily: "'Inter', sans-serif" }
  
  useEffect(() => { loadBadges() }, [])

  const earnedMap = earned.reduce((acc, b) => ({ ...acc, [b.badgeId]: b }), {})
  const totalEarned = earned.length
  const categories = [...new Set(BADGES.map(b => b.categoryKey))]

  const handleSelect = (badge) => {
    setSelectedBadge(badge)
    if (earnedMap[badge.id]?.isNew === true) {
      markSeen(badge.id)
    }
  }

  return (
    <div className="flex flex-col min-h-dvh bg-white pb-24 safe-top">
      <TopHeader title={t('badges.title')} />

      {/* Progress Hero — White Premium Style */}
      <div className="mx-6 mb-12 mt-6 rounded-[40px] p-10 bg-blue-600 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 -ml-24 -mb-24 blur-2xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-5 h-5 text-white/80" />
            <p className="text-[12px] font-[700] text-white/80 uppercase tracking-widest" style={S}>{t('badges.progress')}</p>
          </div>
          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-[72px] font-[800] leading-none tracking-tighter" style={S}>{totalEarned}</span>
            <span className="text-[24px] font-[700] text-white/60 uppercase tracking-widest" style={S}>/ {BADGES.length}</span>
          </div>
          <div className="h-4 bg-white/10 rounded-full overflow-hidden w-full backdrop-blur-md mb-8">
            <motion.div className="h-full bg-white rounded-full shadow-lg"
              initial={{ width: 0 }} animate={{ width: `${(totalEarned / BADGES.length) * 100}%` }} transition={{ duration: 1.5, ease: 'circOut' }} />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
               <p className="text-[10px] font-[800] text-white/60 uppercase tracking-widest mb-1" style={S}>{t('badges.rank')}</p>
               <span className="text-[14px] font-[800] tracking-wider" style={S}>
                 {totalEarned > 15 ? t('badges.ranks.legend') : totalEarned > 10 ? t('badges.ranks.expert') : totalEarned > 5 ? t('badges.ranks.pro') : t('badges.ranks.novice')}
               </span>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-[800] text-white/60 uppercase tracking-widest mb-1" style={S}>{t('badges.completion')}</p>
              <span className="text-[14px] font-[800] tracking-wider" style={S}>
                {Math.round((totalEarned / BADGES.length) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 flex flex-col gap-14 pb-10">
        {categories.map(category => {
          const categoryBadges = BADGES.filter(b => b.categoryKey === category)
          const earnedInCategory = categoryBadges.filter(b => earnedMap[b.id]).length
          
          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex flex-col">
                  <p className="text-[11px] font-[700] text-[#AFAFAF] uppercase tracking-widest mb-1" style={S}>{t('badges.unlockedCount', { count: categoryBadges.length })}</p>
                  <p className="font-[800] text-[20px] text-black tracking-tight" style={S}>{t(categoryBadges[0].categoryKey)}</p>
                </div>
                <div className="bg-[#F6F6F6] px-5 py-2.5 rounded-full border border-[#EEEEEE]">
                  <p className="text-[12px] font-[800] text-black tracking-tight" style={S}>
                    {t('badges.unlockedCount', { count: earnedInCategory })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-5">
                {categoryBadges.map((badge, i) => {
                  const isEarned = !!earnedMap[badge.id]
                  const isNew = isEarned && earnedMap[badge.id].isNew

                  return (
                    <motion.button key={badge.id} 
                      onClick={() => handleSelect(badge)}
                      variants={HAPTIC_SHAKE}
                      whileTap="tap"
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                      className={`relative aspect-square rounded-[32px] border transition-all flex flex-col items-center justify-center p-4
                        ${isEarned ? 'bg-white border-[#F6F6F6] shadow-md active:shadow-lg' : 'bg-[#F6F6F6] border-transparent opacity-40'}`}>
                      
                      {isNew && (
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} 
                          className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full border-2 border-white shadow-lg z-20" />
                      )}

                      <div className={`w-14 h-14 flex items-center justify-center rounded-full text-3xl mb-3 transition-all ${isEarned ? 'bg-blue-50' : 'bg-transparent'}`}>
                        {isEarned ? (
                          <span>{badge.emoji}</span>
                        ) : (
                          <Lock className="w-6 h-6 text-black" strokeWidth={2.5} />
                        )}
                      </div>
                      
                      <p className={`text-[10px] font-[800] text-center leading-tight tracking-tight relative z-10 ${isEarned ? 'text-black' : 'text-[#AFAFAF]'}`} style={S}>
                        {t(badge.titleKey)}
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
