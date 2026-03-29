// Budget progress card showing used vs total budget with color-coded bar
import { motion } from 'framer-motion'

export default function BudgetProgressCard({ label, spent, total, currency = '$' }) {
  const pct = total > 0 ? Math.min((spent / total) * 100, 100) : 0
  const isOver = spent > total
  const isWarning = pct >= 80 && !isOver

  const barColor = isOver ? '#EF4444' : isWarning ? '#F59E0B' : '#22C55E'

  return (
    <div className="bg-white dark:bg-[#1A1A2E] rounded-[20px] p-4 mx-4 mb-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[15px] font-semibold text-gray-800 dark:text-white">{label}</p>
        <p className="text-[13px] font-sora font-bold text-purple-600">{pct.toFixed(0)}%</p>
      </div>
      <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: barColor }}
        />
      </div>
      <p className="text-[12px] text-gray-400">
        You used <span className="font-semibold text-gray-600 dark:text-gray-300">{currency}{spent.toFixed(2)}</span>{' '}
        of <span className="font-semibold">{currency}{total.toFixed(2)}</span>
      </p>
    </div>
  )
}
