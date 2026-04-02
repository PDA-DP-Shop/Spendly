// InsightCard — light indigo card with left border accent
import { motion } from 'framer-motion'
import { Lightbulb, ArrowRight } from 'lucide-react'

export default function InsightCard({ message }) {
  if (!message) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-5 flex items-start gap-3 p-4 rounded-[16px]"
      style={{
        background: '#EEF2FF',
        borderLeft: '3px solid #6366F1',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#FFFFFF' }}>
        <Lightbulb className="w-4 h-4 text-[#6366F1]" />
      </div>
      <p className="flex-1 text-[14px] text-[#3730A3] font-medium leading-relaxed">{message}</p>
      <ArrowRight className="w-4 h-4 text-[#6366F1] opacity-60 mt-0.5 flex-shrink-0" />
    </motion.div>
  )
}
