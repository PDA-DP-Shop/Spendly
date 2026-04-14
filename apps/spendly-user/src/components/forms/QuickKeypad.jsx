import { motion } from 'framer-motion'
import { Delete, Check } from 'lucide-react'

const S = { fontFamily: "'Inter', sans-serif" }

export default function QuickKeypad({ onType, onDelete, onSave, amount }) {
  const keys = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '.', '0', 'del', '+'
  ]

  const handlePress = (key) => {
    if (key === 'del') onDelete()
    else onType(key)
  }

  return (
    <div className="bg-white px-6 pb-12 pt-6 border-t border-[#F1F5F9] shadow-[0_-10px_40px_rgba(0,0,0,0.03)] rounded-t-[32px]">
      <div className="grid grid-cols-4 gap-3">
        {keys.map((key) => {
          const isOp = ['/', '*', '-', '+'].includes(key);
          return (
            <motion.button
              key={key}
              whileTap={{ scale: 0.9, backgroundColor: isOp ? '#000' : '#F8FAFC' }}
              onClick={() => handlePress(key)}
              className={`flex items-center justify-center h-14 rounded-2xl text-[20px] font-[800] transition-all ${
                isOp ? 'bg-[#F1F5F9] text-black border border-[#E2E8F0]' : 'bg-white text-black border border-[#F1F5F9] shadow-sm'
              }`}
              style={S}
            >
              {key === 'del' ? <Delete className="w-5 h-5" strokeWidth={2.5} /> : key}
            </motion.button>
          );
        })}
        
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onSave}
          className="col-span-4 mt-4 h-15 rounded-2xl bg-black text-white text-[15px] font-[900] flex items-center justify-center gap-3 uppercase tracking-widest shadow-xl shadow-black/10"
          style={S}
        >
          <Check className="w-5 h-5" strokeWidth={3} />
          Save Entry
        </motion.button>
      </div>
    </div>
  )
}
