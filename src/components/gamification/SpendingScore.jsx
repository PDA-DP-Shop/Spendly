import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Info, X, TrendingUp } from 'lucide-react'

export default function SpendingScore({ scoreData, compact = false }) {
  const [showTips, setShowTips] = useState(false)
  if (!scoreData) return null

  const { score, grade, gradeColor, breakdown = [], tips = [] } = scoreData
  const maxScore = 850
  const pct = Math.min((score / maxScore) * 100, 100)

  // Circular progress SVG logic
  const radius = compact ? 35 : 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (pct / 100) * circumference
  
  const S = { fontFamily: "'Inter', sans-serif" }

  return (
    <>
      <motion.div 
        whileTap={{ scale: 0.98 }} 
        onClick={() => setShowTips(true)}
        className={`bg-white rounded-[24px] ${compact ? 'p-5 w-full h-full' : 'p-6'} shadow-premium border border-[#EEEEEE] relative overflow-hidden flex items-center justify-between cursor-pointer`}
      >
        <div className={compact ? 'flex-shrink' : ''}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`rounded-full bg-black flex items-center justify-center ${compact ? 'w-5 h-5' : 'w-7 h-7'}`}>
              <TrendingUp className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-white`} strokeWidth={3} />
            </div>
            <p className={`${compact ? 'text-[11px]' : 'text-[12px]'} font-[900] text-black opacity-40 uppercase tracking-[0.15em]`} style={S}>Score</p>
          </div>
          <p className={`${compact ? 'text-[34px]' : 'text-[44px]'} font-[900] text-black leading-none mb-2 tracking-tighter`} style={S}>{score}</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: gradeColor }} />
            <p className={`${compact ? 'text-[12px]' : 'text-[15px]'} font-[800] text-black`} style={S}>{grade}</p>
          </div>
        </div>

        {/* Uber-style stroke donut */}
        <div className={`relative ${compact ? 'w-20 h-20' : 'w-26 h-26'} flex items-center justify-center flex-shrink-0`}>
          <svg className="w-full h-full transform -rotate-90">
            <circle cx={compact ? '40' : '52'} cy={compact ? '40' : '52'} r={radius} stroke="#F2F2F2" strokeWidth={compact ? '6' : '9'} fill="transparent" />
            <motion.circle cx={compact ? '40' : '52'} cy={compact ? '40' : '52'} r={radius} stroke="#000000" strokeWidth={compact ? '6' : '9'} fill="transparent"
              strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset }} transition={{ duration: 1.5, ease: "easeOut" }} strokeLinecap="round" />
          </svg>
          <div className={`absolute inset-0 flex items-center justify-center ${compact ? 'text-xl' : 'text-3xl'} font-bold`}>
            {score >= 750 ? '↑' : score >= 600 ? '→' : '↓'}
          </div>
        </div>
      </motion.div>

      {/* Breakdown Sheet */}
      <AnimatePresence>
        {showTips && (
          <motion.div className="fixed inset-0 z-50 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowTips(false)} />
            <motion.div className="relative w-full bg-white rounded-t-[32px] p-6 pb-12 shadow-[0_-8px_40px_rgba(0,0,0,0.1)]"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
              <div className="w-12 h-1.5 bg-[#E2E8F0] rounded-full mx-auto mb-6" />
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[22px] font-[800] text-[#0F172A]" style={S}>Score Breakdown</p>
                  <p className="text-[14px] font-[600] text-[#64748B]" style={S}>Why your score is {score}</p>
                </div>
                <button onClick={() => setShowTips(false)} className="w-10 h-10 rounded-full bg-[#F8FAFC] flex items-center justify-center border border-[#F1F5F9]">
                  <X className="w-5 h-5 text-[#64748B]" />
                </button>
              </div>

              <div className="bg-[#F8FAFC] rounded-[24px] border border-[#F1F5F9] p-5 mb-6 divide-y divide-[#F1F5F9]">
                <div className="flex justify-between pb-3 text-[15px] font-[700] text-[#64748B]" style={S}>
                  <span>Base Score</span>
                  <span className="text-[#0F172A]">400</span>
                </div>
                {breakdown.map((b, i) => (
                  <div key={i} className="flex justify-between py-3 text-[15px] font-[700]" style={S}>
                    <span className="text-[#475569]">{b.label}</span>
                    <span className={b.pts > 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}>{b.pts > 0 ? '+' : ''}{b.pts}</span>
                  </div>
                ))}
              </div>

              <p className="font-[800] text-[16px] text-[#0F172A] mb-4" style={S}>Tips to improve</p>
              <ul className="space-y-3">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-[14px] font-[600] text-[#475569] bg-[#F8FAFC] p-4 rounded-[20px] border border-[#F1F5F9]" style={S}>
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-2 flex-shrink-0" />
                    <span className="leading-snug">{tip}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
