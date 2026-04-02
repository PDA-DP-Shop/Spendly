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
  const S = { fontFamily: "'Nunito', sans-serif" }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1, type: 'spring', damping: 25 }}
      className="flex flex-col items-center justify-center px-10 py-20 text-center"
    >
      <div
        className="w-24 h-24 rounded-[32px] flex items-center justify-center text-4xl mb-6 relative"
        style={{ background: '#F8F7FF', border: '1px solid #F0F0F8', boxShadow: '0 8px 16px rgba(124,111,247,0.04)' }}
      >
        <div className="absolute inset-0 rounded-[32px] opacity-10" style={{ background: 'var(--gradient-primary)' }} />
        <span className="relative z-10">{config.emoji}</span>
      </div>
      <h3 className="text-[22px] font-[800] text-[#0F172A] mb-2" style={S}>
        {title || config.title}
      </h3>
      <p className="text-[15px] font-[600] text-[#94A3B8] leading-relaxed max-w-[280px]" style={S}>
        {message || config.message}
      </p>
      {action && (
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onAction}
          className="mt-8 px-8 py-4 rounded-[20px] text-white text-[15px] font-[800] shadow-fab"
          style={{
            background: 'var(--gradient-primary)',
            ...S
          }}
        >
          {action}
        </motion.button>
      )}
    </motion.div>
  )
}
