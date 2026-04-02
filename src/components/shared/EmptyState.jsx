// EmptyState — indigo-accented empty states for each screen type
import { motion } from 'framer-motion'

const CONFIGS = {
  expenses: { emoji: '💸', title: 'No expenses yet', message: 'Tap the + button to add your first expense' },
  reports:  { emoji: '📊', title: 'No data yet', message: 'Add some expenses to see your analytics' },
  search:   { emoji: '🔍', title: 'No matches found', message: 'Try searching with different keywords' },
  goals:    { emoji: '🎯', title: 'No goals set', message: 'Set a savings goal to get started' },
  wallets:  { emoji: '👛', title: 'No wallets added', message: 'Add a wallet to track your assets' },
  budget:   { emoji: '📋', title: 'No budget set', message: 'Set a monthly budget to track spending' },
  default:  { emoji: '📭', title: 'Nothing here', message: 'Nothing to show yet' },
}

export default function EmptyState({ type = 'default', title, message, action, onAction }) {
  const config = CONFIGS[type] || CONFIGS.default

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex flex-col items-center justify-center px-8 py-16 text-center"
    >
      <div
        className="w-20 h-20 rounded-[24px] flex items-center justify-center text-4xl mb-5"
        style={{ background: '#EEF2FF', border: '1px solid rgba(99,102,241,0.15)' }}
      >
        {config.emoji}
      </div>
      <h3 className="text-[18px] font-bold text-[#0F172A] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {title || config.title}
      </h3>
      <p className="text-[14px] text-[#64748B] leading-relaxed max-w-[260px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {message || config.message}
      </p>
      {action && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onAction}
          className="mt-6 px-6 py-3 rounded-[14px] text-white text-[14px] font-semibold"
          style={{
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}
        >
          {action}
        </motion.button>
      )}
    </motion.div>
  )
}
