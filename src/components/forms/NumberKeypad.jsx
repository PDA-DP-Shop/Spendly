// Custom round number keypad for amount entry
import { motion } from 'framer-motion'
import { Delete } from 'lucide-react'

const keys = [
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  '.', '0', 'del',
]

export default function NumberKeypad({ onKey }) {
  return (
    <div className="grid grid-cols-3 gap-3 px-4">
      {keys.map(key => (
        <motion.button
          key={key}
          whileTap={{ scale: 0.88, backgroundColor: '#F3E8FF' }}
          onClick={() => onKey(key)}
          className="flex items-center justify-center h-14 rounded-2xl bg-white dark:bg-[#242438] shadow-sm text-[22px] font-sora font-semibold text-gray-900 dark:text-white"
        >
          {key === 'del' ? <Delete className="w-5 h-5" /> : key}
        </motion.button>
      ))}
    </div>
  )
}
