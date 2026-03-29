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

  // Show red bg on swipe left, blue on swipe right
  const deleteOpacity = useTransform(x, [-100, -20], [1, 0])
  const editOpacity = useTransform(x, [20, 100], [0, 1])

  const handleDragEnd = (_, info) => {
    if (info.offset.x < -60) {
      // Delete
      animate(x, -120, { onComplete: () => onDelete?.(expense.id) })
    } else if (info.offset.x > 60) {
      // Edit
      onEdit?.(expense)
      animate(x, 0)
    } else {
      animate(x, 0)
    }
  }

  return (
    <motion.div
      className="relative mx-4 mb-3 overflow-hidden rounded-2xl"
    >
      {/* Red delete bg */}
      <motion.div
        style={{ opacity: deleteOpacity }}
        className="absolute inset-0 bg-red-500 rounded-2xl flex items-center justify-end pr-5"
      >
        <Trash2 className="w-5 h-5 text-white" />
      </motion.div>

      {/* Blue edit bg */}
      <motion.div
        style={{ opacity: editOpacity }}
        className="absolute inset-0 bg-blue-500 rounded-2xl flex items-center justify-start pl-5"
      >
        <Edit2 className="w-5 h-5 text-white" />
      </motion.div>

      {/* Main card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -120, right: 120 }}
        dragElastic={0.1}
        style={{ x }}
        onDragEnd={handleDragEnd}
        className="flex items-center gap-3 p-4 bg-white dark:bg-[#1A1A2E] rounded-2xl shadow-sm cursor-grab active:cursor-grabbing"
      >
        {/* Category icon */}
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: category.bgColor }}
        >
          {category.emoji}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-gray-900 dark:text-white truncate">
            {expense.shopName || category.name}
          </p>
          <p className="text-[12px] text-gray-400 mt-0.5">
            {formatDate(expense.date)} · {expense.paymentMethod || 'Cash'}
          </p>
        </div>

        {/* Amount */}
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
