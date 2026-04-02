// CategoryChips — horizontal scroll chips with indigo active state
import { motion } from 'framer-motion'
import { CATEGORIES } from '../../constants/categories'

export default function CategoryChips({ selected, onSelect }) {
  const all = [{ id: 'all', name: 'All', emoji: '✨' }, ...CATEGORIES]

  return (
    <div className="flex gap-2.5 px-5 overflow-x-auto scrollbar-hide pb-1">
      {all.map((cat, i) => {
        const isActive = selected === cat.id
        return (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(cat.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap text-[13px] font-semibold flex-shrink-0 transition-all"
            style={{
              background: isActive ? '#EEF2FF' : '#FFFFFF',
              border: `1px solid ${isActive ? '#6366F1' : '#E2E8F0'}`,
              color: isActive ? '#6366F1' : '#64748B',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <span className="text-sm">{cat.emoji}</span>
            <span>{cat.name}</span>
          </motion.button>
        )
      })}
    </div>
  )
}
