// InsightCard — clean white card with light brand tint
import { motion } from 'framer-motion'
import { Lightbulb, ArrowRight, Sparkles } from 'lucide-react'

export default function InsightCard({ message }) {
  if (!message) return null
  const S = { fontFamily: "'Nunito', sans-serif" }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      className="mx-5 flex items-start gap-4 p-5 rounded-[24px] bg-[#F8F7FF] border border-[#F0F0F8] relative overflow-hidden flex-col group cursor-pointer"
    >
      <div className="flex items-center gap-3 w-full">
        <div className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0 bg-white shadow-sm border border-[#F1F5F9]">
          <Lightbulb className="w-4.5 h-4.5 text-[var(--primary)]" />
        </div>
        <p className="flex-1 text-[13px] text-[#94A3B8] font-[800] uppercase tracking-wider" style={S}>Smart Insight</p>
        <Sparkles className="w-4 h-4 text-[var(--primary)] opacity-30" />
      </div>
      
      <div className="flex items-end gap-2 w-full mt-1">
        <p className="flex-1 text-[15px] text-[#475569] font-[700] leading-relaxed" style={S}>{message}</p>
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-[#F1F5F9] group-hover:translate-x-1 transition-transform">
          <ArrowRight className="w-4 h-4 text-[var(--primary)]" />
        </div>
      </div>
    </motion.div>
  )
}
