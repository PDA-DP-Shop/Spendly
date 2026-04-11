import { motion } from 'framer-motion'
import { CATEGORIES } from '../../constants/categories'

const HAPTIC_SHAKE = {
  tap: { 
    x: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.35, ease: "easeInOut" }
  }
}

export default function CategoryChips({ selected, onSelect }) {
  const S = { fontFamily: "'Inter', sans-serif" }

  return (
    <div className="overflow-x-auto scrollbar-hide flex gap-3 px-6 pb-2">
      <motion.button
        variants={HAPTIC_SHAKE}
        whileTap="tap"
        onClick={() => onSelect('all')}
        className={`flex-shrink-0 px-6 py-2.5 rounded-full text-[13px] font-[700] transition-all border ${
          selected === 'all'
            ? 'bg-black text-white border-black'
            : 'bg-white text-black border-[#EEEEEE]'
        }`}
        style={S}
      >
        All
      </motion.button>
      {CATEGORIES.map((cat) => (
        <motion.button
          key={cat.id}
          variants={HAPTIC_SHAKE}
          whileTap="tap"
          onClick={() => onSelect(cat.id)}
          className={`flex-shrink-0 px-6 py-2.5 rounded-full text-[13px] font-[700] transition-all flex items-center gap-2 border ${
            selected === cat.id
              ? 'bg-black text-white border-black shadow-lg'
              : 'bg-white text-black border-[#EEEEEE]'
          }`}
          style={S}
        >
          <span className="text-lg">{cat.emoji}</span>
          <span>{cat.name}</span>
        </motion.button>
      ))}
    </div>
  )
}
