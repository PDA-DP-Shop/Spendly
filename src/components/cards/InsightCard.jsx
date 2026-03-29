// Smart insight card showing spending tips based on real data
import { motion } from 'framer-motion'
import { Lightbulb } from 'lucide-react'

export default function InsightCard({ message }) {
  return (
    <motion.div
      className="mx-4 mb-6 p-4 rounded-[20px] flex items-start gap-3"
      style={{ backgroundColor: '#F3E8FF' }}
    >
      <div className="w-9 h-9 rounded-full bg-purple-600/15 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Lightbulb className="w-5 h-5 text-purple-600" />
      </div>
      <div>
        <p className="text-[12px] font-semibold text-purple-800 mb-0.5 uppercase tracking-wide">Smart Tip</p>
        <p className="text-[14px] text-purple-700 leading-snug">{message}</p>
      </div>
    </motion.div>
  )
}
