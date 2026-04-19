// Custom round number keypad for amount entry
import { motion } from 'framer-motion'
import { Delete } from 'lucide-react'

const keys = [
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  '.', '0', 'del',
]

const S = { fontFamily: "'Nunito', sans-serif" }

export default function NumberKeypad({ onKey }) {
  return (
    <div className="grid grid-cols-3 gap-4 px-6 mb-4">
      {keys.map(key => (
        <motion.button
          key={key}
          whileTap={{ scale: 0.9, backgroundColor: '#EEF2FF', borderColor: '#00000040' }}
          onClick={() => onKey(key)}
          className="flex items-center justify-center h-16 rounded-[24px] bg-white border border-[#F0F0F8] shadow-sm text-[24px] font-[800] text-[#0F172A] active:text-[#000000] transition-colors"
          style={S}
        >
          {key === 'del' ? <Delete className="w-6 h-6 text-[#64748B]" /> : key}
        </motion.button>
      ))}
    </div>
  )
}
