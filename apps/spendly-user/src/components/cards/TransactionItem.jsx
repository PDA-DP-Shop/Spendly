import { useState } from 'react'
import { m as motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { Trash2, Edit2 } from 'lucide-react'
import { formatMoney } from '../../utils/formatMoney'
import { formatDate, formatTime } from '../../utils/formatDate'
import { getCategoryById } from '../../constants/categories'
import { useSecurityStore } from '../../store/securityStore'

const HAPTIC_SHAKE = {
  tap: { 
    x: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.35, ease: "easeInOut" }
  }
}

export default function TransactionItem({ expense, currency = 'USD', onDelete, onEdit, index = 0 }) {
  const { hideBalances } = useSecurityStore()
  const category = getCategoryById(expense.category) || { emoji: '💰', name: 'Other' }
  const isSpent = expense.type === 'spent'
  const x = useMotionValue(0)
  const [isOpen, setIsOpen] = useState(false)
  const S = { fontFamily: "'Inter', sans-serif" }

  const rightScale = useTransform(x, [0, 80], [0, 1])
  const leftScale = useTransform(x, [0, -80], [0, 1])

  const handleDragEnd = (_, info) => {
    const offset = info.offset.x
    if (offset > 40) { animate(x, 120); setIsOpen(true) }
    else if (offset < -40) { animate(x, -120); setIsOpen(true) }
    else { animate(x, 0); setIsOpen(false) }
  }

  const closeActions = () => { animate(x, 0); setIsOpen(false) }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.5 }}
      className="relative mb-3 overflow-hidden px-6"
    >
      <div className="absolute inset-0 flex items-center justify-between px-10 h-full">
        <motion.div style={{ scale: rightScale }} className="flex gap-3">
          <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => { closeActions(); onEdit?.(expense) }} 
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#F6F6F6] border border-[#EEEEEE]">
            <Edit2 className="w-4 h-4 text-black" strokeWidth={3} />
          </motion.button>
          <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => { closeActions(); onDelete?.(expense.id) }}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-black text-white">
            <Trash2 className="w-4 h-4" strokeWidth={3} />
          </motion.button>
        </motion.div>
        <motion.div style={{ scale: leftScale }} className="flex gap-3">
          <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => { closeActions(); onDelete?.(expense.id) }}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-black text-white">
            <Trash2 className="w-4 h-4" strokeWidth={3} />
          </motion.button>
        </motion.div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -140, right: 140 }}
        dragElastic={0.05}
        onDragEnd={handleDragEnd}
        variants={HAPTIC_SHAKE}
        whileTap="tap"
        className="relative z-10 flex items-center gap-4 px-5 py-4 cursor-grab active:cursor-grabbing bg-white rounded-[24px] border border-[#EEEEEE] shadow-sm"
        style={{ x }}
        onClick={() => { if (isOpen) closeActions(); else onEdit?.(expense) }}
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-[22px] flex-shrink-0 bg-[#F6F6F6] border border-[#EEEEEE]">
          {category.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-[700] text-black truncate mb-0.5 tracking-tight" style={S}>
            {expense.shopName || category.name}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-[500] text-[#AFAFAF] uppercase tracking-wide" style={S}>
              {formatDate(expense.date)}
            </p>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <p className={`text-[16px] font-[800] tracking-tight ${isSpent ? 'text-black' : 'text-blue-600'}`} style={S}>
            {hideBalances ? '••••' : (isSpent ? '-' : '+') + formatMoney(expense.amount, currency)}
          </p>
          <p className="text-[10px] font-[600] text-[#AFAFAF] uppercase tracking-wider mt-0.5" style={S}>
            {expense.paymentMethod || 'CASH'}
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
