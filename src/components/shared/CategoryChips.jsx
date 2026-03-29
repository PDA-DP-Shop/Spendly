// Horizontal scrollable category filter chips
import { motion } from 'framer-motion'
import { CATEGORIES } from '../../constants/categories'

const ALL_OPTION = { id: 'all', name: 'All', emoji: '✨' }

export default function CategoryChips({ selected, onSelect }) {
  const chips = [ALL_OPTION, ...CATEGORIES]

  return (
    <div className="flex gap-2 px-4 overflow-x-auto scrollbar-hide py-1">
      {chips.map(cat => {
        const isActive = selected === cat.id

        return (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.92 }}
            onClick={() => onSelect(isActive ? 'all' : cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all flex-shrink-0 ${
              isActive
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white dark:bg-[#242438] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.name}</span>
          </motion.button>
        )
      })}
    </div>
  )
}
