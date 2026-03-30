import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Info, X, TrendingUp } from 'lucide-react'

export default function SpendingScore({ scoreData }) {
  const [showTips, setShowTips] = useState(false)
  if (!scoreData) return null

  const { score, grade, gradeColor, breakdown = [], tips = [] } = scoreData
  const maxScore = 850
  const pct = Math.min((score / maxScore) * 100, 100)

  // Circular progress SVG logic
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (pct / 100) * circumference

  return (
    <>
      <motion.div whileTap={{ scale: 0.98 }} onClick={() => setShowTips(true)}
        className="bg-white dark:bg-[#1A1A2E] rounded-[24px] p-5 shadow-sm relative overflow-hidden flex items-center justify-between cursor-pointer">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide">Spending Score</p>
          </div>
          <p className="text-[36px] font-sora font-bold text-gray-900 dark:text-white leading-none mb-1">{score}</p>
          <p className="text-[13px] font-medium" style={{ color: gradeColor }}>Out of {maxScore} · {grade}</p>
        </div>

        {/* CSS SVG Donut */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100 dark:text-gray-800" />
            <motion.circle cx="48" cy="48" r={radius} stroke={gradeColor} strokeWidth="8" fill="transparent"
              strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset }} transition={{ duration: 1.5, ease: "easeOut" }} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-2xl drop-shadow-sm">
            {score >= 750 ? '🌟' : score >= 600 ? '👍' : score >= 400 ? '👀' : '😅'}
          </div>
        </div>
      </motion.div>

      {/* Breakdown Sheet */}
      <AnimatePresence>
        {showTips && (
          <motion.div className="fixed inset-0 z-50 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowTips(false)} />
            <motion.div className="relative w-full bg-white dark:bg-[#1A1A2E] rounded-t-[28px] p-6 pb-12"
              initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} transition={{ type: 'spring', damping: 25 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[20px] font-sora font-bold text-gray-900 dark:text-white">Score Breakdown</p>
                  <p className="text-[13px] text-gray-500">Why your score is {score}</p>
                </div>
                <button onClick={() => setShowTips(false)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-[#0F0F1A] rounded-2xl p-4 mb-6 divide-y divide-gray-100 dark:divide-gray-800">
                <div className="flex justify-between py-2 text-[14px] font-medium text-gray-500">
                  <span>Base Score</span>
                  <span>400</span>
                </div>
                {breakdown.map((b, i) => (
                  <div key={i} className="flex justify-between py-2 text-[14px] font-medium">
                    <span className="text-gray-800 dark:text-gray-200">{b.label}</span>
                    <span className={b.pts > 0 ? 'text-green-500' : 'text-red-500'}>{b.pts > 0 ? '+' : ''}{b.pts}</span>
                  </div>
                ))}
              </div>

              <p className="font-sora font-bold text-[15px] text-gray-900 dark:text-white mb-3">Tips to improve</p>
              <ul className="space-y-3">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-[14px] text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
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
