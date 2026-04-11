// EmptyState — indigo-accented empty states for each screen type
import { motion } from 'framer-motion'

const HAPTIC_SHAKE = {
  tap: { 
    x: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.35, ease: "easeInOut" }
  }
}

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
  const S = { fontFamily: "'Inter', sans-serif" }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.6 }}
      className="flex flex-col items-center justify-center px-10 py-16 text-center"
    >
      <div
        className="w-28 h-28 rounded-full flex items-center justify-center text-5xl mb-8 relative bg-[#F6F6F6] border border-[#EEEEEE]"
      >
        <span className="relative z-10">{config.emoji}</span>
      </div>
      <h3 className="text-[22px] font-[800] text-black mb-3 tracking-tight" style={S}>
        {title || config.title}
      </h3>
      <p className="text-[14px] font-[500] text-[#AFAFAF] leading-relaxed max-w-[300px]" style={S}>
        {message || config.message}
      </p>
      {(action || onAction) && (
        <motion.button
          variants={HAPTIC_SHAKE}
          whileTap="tap"
          onClick={onAction}
          className="mt-10 px-10 py-4.5 rounded-full text-white bg-black text-[14px] font-[800] shadow-xl shadow-black/10"
          style={S}
        >
          {action || 'Get Started'}
        </motion.button>
      )}
    </motion.div>
  )
}
