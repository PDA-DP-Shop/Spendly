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
  const category = getCategoryById(expense.category) || CATEGORIES[0]
  const isSpent = expense.type === 'spent'
  const x = useMotionValue(0)
  const [isOpen, setIsOpen] = useState(false)
  
  // Dynamic transforms for background buttons
  const rightScale = useTransform(x, [0, 80], [0, 1])
  const leftScale = useTransform(x, [0, -80], [0, 1])
  const rightOpacity = useTransform(x, [0, 40], [0, 1])
  const leftOpacity = useTransform(x, [0, -40], [0, 1])

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
    <motion.div className="relative mx-4 mb-3 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-white/5">
      {/* Background Actions */}
      <div className="absolute inset-0 flex items-center justify-between px-3">
        {/* Left revealed items */}
        <motion.div style={{ scale: rightScale, opacity: rightOpacity }} className="flex gap-2">
          <motion.button onClick={(e) => { e.stopPropagation(); closeActions(); onEdit?.(expense); }}
            className="w-12 h-12 bg-blue-500 text-white rounded-xl shadow-lg flex items-center justify-center">
            <Edit2 className="w-5 h-5" />
          </motion.button>
          <motion.button onClick={(e) => { e.stopPropagation(); closeActions(); onDelete?.(expense.id); }}
            className="w-12 h-12 bg-red-500 text-white rounded-xl shadow-lg flex items-center justify-center">
            <Trash2 className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Right revealed items */}
        <motion.div style={{ scale: leftScale, opacity: leftOpacity }} className="flex gap-2">
          <motion.button onClick={(e) => { e.stopPropagation(); closeActions(); onDelete?.(expense.id); }}
            className="w-12 h-12 bg-red-500 text-white rounded-xl shadow-lg flex items-center justify-center">
            <Trash2 className="w-5 h-5" />
          </motion.button>
          <motion.button onClick={(e) => { e.stopPropagation(); closeActions(); onEdit?.(expense); }}
            className="w-12 h-12 bg-blue-500 text-white rounded-xl shadow-lg flex items-center justify-center">
            <Edit2 className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>

      {/* Main card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -140, right: 140 }}
        dragElastic={0.1}
        style={{ x }}
        onDragEnd={handleDragEnd}
        onTap={() => {
          if (isOpen) closeActions()
          else if (Math.abs(x.get()) < 10) onEdit?.(expense)
        }}
        className="relative z-10 flex items-center gap-3 p-4 bg-white dark:bg-[#1A1A2E] rounded-2xl shadow-sm cursor-grab active:cursor-grabbing"
      >
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: category.bgColor }}>
          {category.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-gray-900 dark:text-white truncate">{expense.shopName || category.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-[12px] text-gray-400">{formatDate(expense.date)}</p>
            {expense.paymentMethod && (
              <>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{expense.paymentMethod}</span>
              </>
            )}
            {expense.isSplit && (
              <>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                <div className="flex items-center gap-0.5 text-purple-500 bg-purple-50 dark:bg-purple-900/20 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide">
                  1/{expense.splitPeople}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <p className={`text-[15px] font-sora font-bold ${isSpent ? 'text-red-500' : 'text-green-500'}`}>
            {hideBalances ? '••••' : (isSpent ? '- ' : '+ ') + formatMoney(expense.amount, currency)}
          </p>
          <p className="text-[11px] text-gray-400 text-center">{formatTime(expense.date)}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}
