// CategoryChips — horizontal scroll chips with white premium active state
import { motion } from 'framer-motion'
import { CATEGORIES } from '../../constants/categories'

export default function CategoryChips({ selected, onSelect }) {
  const all = [{ id: 'all', name: 'All', emoji: '✨' }, ...CATEGORIES]
  const S = { fontFamily: "'Nunito', sans-serif" }

  return (
    <div className="flex gap-3 px-6 overflow-x-auto scrollbar-hide pb-2">
      {all.map((cat, i) => {
        const isActive = selected === cat.id
        return (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03, type: 'spring', stiffness: 300, damping: 25 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => onSelect(cat.id)}
            className="flex items-center gap-2.5 px-6 py-2.5 rounded-[18px] whitespace-nowrap text-[14px] font-[800] flex-shrink-0 transition-all border shadow-sm"
            style={{
              background: isActive ? 'var(--primary)' : '#FFFFFF',
              borderColor: isActive ? 'var(--primary)' : '#F0F0F8',
              color: isActive ? '#FFFFFF' : '#94A3B8',
              boxShadow: isActive ? '0 8px 20px rgba(124,111,247,0.25)' : 'none',
              ...S
            }}
          >
            <span className="text-base">{cat.emoji}</span>
            <span className="tracking-tight">{cat.name}</span>
          </motion.button>
        )
      })}
    </div>
  )
}
