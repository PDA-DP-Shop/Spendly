// Empty state component shown when no expenses/scans/search results exist
import { motion } from 'framer-motion'
import { Receipt, Search, PiggyBank, BarChart2 } from 'lucide-react'

const illustrations = {
  expenses: Receipt,
  search: Search,
  budget: PiggyBank,
  reports: BarChart2,
}

export default function EmptyState({ type = 'expenses', title, message, action, actionLabel }) {
  const Icon = illustrations[type] || Receipt

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-5">
        <Icon className="w-10 h-10 text-purple-400" />
      </div>
      <h3 className="text-lg font-sora font-bold text-gray-800 dark:text-white mb-2">
        {title || 'Nothing here yet'}
      </h3>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
        {message || 'Start adding your expenses to see them here'}
      </p>
      {action && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={action}
          className="px-6 py-3 bg-purple-600 text-white rounded-2xl font-medium text-[15px]"
        >
          {actionLabel || 'Add Now'}
        </motion.button>
      )}
    </motion.div>
  )
}
