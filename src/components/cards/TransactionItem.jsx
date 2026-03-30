// Single transaction row card with swipe to delete/edit
import { useState, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { Trash2, Edit2 } from 'lucide-react'
import { formatMoney } from '../../utils/formatMoney'
import { formatDate, formatTime } from '../../utils/formatDate'
import { getCategoryById } from '../../constants/categories'
import { useSecurityStore } from '../../store/securityStore'

export default function TransactionItem({ expense, currency = 'USD', onDelete, onEdit, index = 0 }) {
  const { hideBalances } = useSecurityStore()
  const category = getCategoryById(expense.category)
  const isSpent = expense.type === 'spent'
  const x = useMotionValue(0)

  const [isOpen, setIsOpen] = useState(false)
  
  // Dynamic transforms for background buttons
  const rightRevealScale = useTransform(x, [0, 100], [0, 1])
  const leftRevealScale = useTransform(x, [0, -100], [0, 1])
  const rightRevealOpacity = useTransform(x, [0, 40], [0, 1])
  const leftRevealOpacity = useTransform(x, [0, -40], [0, 1])

  const handleDragEnd = (_, info) => {
    const offset = info.offset.x
    if (offset > 40) {
      animate(x, 140)
      setIsOpen(true)
    } else if (offset < -40) {
      if (isOpen) {
        animate(x, 0)
        setIsOpen(false)
      } else {
        animate(x, -140)
        setIsOpen(true)
      }
    } else {
      animate(x, (isOpen ? (x.get() > 0 ? 140 : -140) : 0))
    }
  }

  const closeActions = () => {
    animate(x, 0)
    setIsOpen(false)
  }

  return (
    <motion.div className="relative mx-4 mb-3 overflow-hidden rounded-2xl">
      {/* Background Actions (Behind card) */}
      <div className="absolute inset-0 flex items-center justify-between px-2 bg-gray-100 dark:bg-[#1A1A2E] rounded-2xl">
        {/* Left Side (Revealed when sliding right) */}
        <motion.div style={{ scale: rightRevealScale, opacity: rightRevealOpacity }} className="flex gap-2">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); closeActions(); onEdit?.(expense); }}
            className="flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-xl shadow-lg border border-white/20"
          >
            <Edit2 className="w-5 h-5" />
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); closeActions(); onDelete?.(expense.id); }}
            className="flex items-center justify-center w-12 h-12 bg-red-500 text-white rounded-xl shadow-lg border border-white/20"
          >
            <Trash2 className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Right Side (Revealed when sliding left) */}
        <motion.div style={{ scale: leftRevealScale, opacity: leftRevealOpacity }} className="flex gap-2">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); closeActions(); onDelete?.(expense.id); }}
            className="flex items-center justify-center w-12 h-12 bg-red-500 text-white rounded-xl shadow-lg border border-white/20"
          >
            <Trash2 className="w-5 h-5" />
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); closeActions(); onEdit?.(expense); }}
            className="flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-xl shadow-lg border border-white/20"
          >
            <Edit2 className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>

      {/* Main card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -140, right: 140 }}
        dragElastic={0.1}
        whileTap={{ scale: 0.98 }}
        style={{ x }}
        onDragEnd={handleDragEnd}
        onTap={() => {
          if (isOpen) closeActions()
          else if (Math.abs(x.get()) < 10) onEdit?.(expense)
        }}
        className="flex items-center gap-3 p-4 bg-white dark:bg-[#1A1A2E] rounded-2xl shadow-sm cursor-grab active:cursor-grabbing z-10 border border-gray-100/50 dark:border-white/5"
      >
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: category.bgColor }}>
          {category.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-gray-900 dark:text-white truncate">{expense.shopName || category.name}</p>
          <p className="text-[12px] text-gray-400 mt-0.5">{formatDate(expense.date)} · {expense.paymentMethod || 'Cash'}</p>
        </div>

        <div className="text-right flex-shrink-0">
          <p className={`text-[15px] font-sora font-bold ${isSpent ? 'text-red-500' : 'text-green-500'}`}>
            {hideBalances ? '••••' : (isSpent ? '- ' : '+ ') + formatMoney(expense.amount, currency)}
          </p>
          <p className="text-[11px] text-gray-400">{formatTime(expense.date)}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}
