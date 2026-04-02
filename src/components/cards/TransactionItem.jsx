// TransactionItem — white card row with swipe to delete/edit
import { useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { Trash2, Edit2 } from 'lucide-react'
import { formatMoney } from '../../utils/formatMoney'
import { formatDate, formatTime } from '../../utils/formatDate'
import { getCategoryById } from '../../constants/categories'
import { useSecurityStore } from '../../store/securityStore'

export default function TransactionItem({ expense, currency = 'USD', onDelete, onEdit, index = 0 }) {
  const { hideBalances } = useSecurityStore()
  const category = getCategoryById(expense.category) || { emoji: '💰', color: '#6366F1', name: 'Other' }
  const isSpent = expense.type === 'spent'
  const x = useMotionValue(0)
  const [isOpen, setIsOpen] = useState(false)

  const rightScale = useTransform(x, [0, 80], [0, 1])
  const leftScale = useTransform(x, [0, -80], [0, 1])
  const rightOpacity = useTransform(x, [0, 40], [0, 1])
  const leftOpacity = useTransform(x, [0, -40], [0, 1])

  const handleDragEnd = (_, info) => {
    const offset = info.offset.x
    if (offset > 40) { animate(x, 130); setIsOpen(true) }
    else if (offset < -40) {
      if (isOpen) { animate(x, 0); setIsOpen(false) }
      else { animate(x, -130); setIsOpen(true) }
    } else {
      animate(x, (isOpen ? (x.get() > 0 ? 130 : -130) : 0))
    }
  }

  const closeActions = () => { animate(x, 0); setIsOpen(false) }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="relative mx-5 mb-2 overflow-hidden"
      style={{ borderRadius: '16px' }}
    >
      {/* Background Actions */}
      <div className="absolute inset-0 flex items-center justify-between px-3">
        <motion.div style={{ scale: rightScale, opacity: rightOpacity }} className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); closeActions(); onEdit?.(expense) }}
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: '#EEF2FF', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <Edit2 className="w-4 h-4 text-[#6366F1]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); closeActions(); onDelete?.(expense.id) }}
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: '#FFF1F2', border: '1px solid rgba(244,63,94,0.2)' }}
          >
            <Trash2 className="w-4 h-4 text-[#F43F5E]" />
          </button>
        </motion.div>
        <motion.div style={{ scale: leftScale, opacity: leftOpacity }} className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); closeActions(); onDelete?.(expense.id) }}
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: '#FFF1F2', border: '1px solid rgba(244,63,94,0.2)' }}
          >
            <Trash2 className="w-4 h-4 text-[#F43F5E]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); closeActions(); onEdit?.(expense) }}
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: '#EEF2FF', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <Edit2 className="w-4 h-4 text-[#6366F1]" />
          </button>
        </motion.div>
      </div>

      {/* Main card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -130, right: 130 }}
        dragElastic={0.05}
        style={{ x }}
        onDragEnd={handleDragEnd}
        onTap={() => {
          if (isOpen) closeActions()
          else if (Math.abs(x.get()) < 10) onEdit?.(expense)
        }}
        className="relative z-10 flex items-center gap-4 px-4 py-3.5 cursor-grab active:cursor-grabbing"
        style={{
          background: '#FFFFFF',
          border: '1px solid #F0F0F8',
          borderRadius: '16px',
        }}
      >
        {/* Icon circle */}
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${category.color}25, ${category.color}10)`,
            border: `1px solid ${category.color}25`,
          }}
        >
          {category.emoji}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-[#0F172A] truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {expense.shopName || category.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[12px] text-[#94A3B8]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {formatDate(expense.date)}
            </p>
            {expense.paymentMethod && (
              <>
                <span className="w-1 h-1 rounded-full bg-[#E2E8F0]" />
                <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {expense.paymentMethod}
                </span>
              </>
            )}
            {expense.isSplit && (
              <>
                <span className="w-1 h-1 rounded-full bg-[#E2E8F0]" />
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: '#EEF2FF', color: '#6366F1' }}
                >
                  SPLIT·{expense.splitPeople}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Amount pill */}
        <div className="text-right flex-shrink-0">
          <div
            className="px-3 py-1 rounded-full text-[14px] font-bold"
            style={{
              background: isSpent ? '#FFF1F2' : '#ECFDF5',
              color: isSpent ? '#F43F5E' : '#10B981',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            {hideBalances ? '••••' : (isSpent ? '- ' : '+ ') + formatMoney(expense.amount, currency)}
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {formatTime(expense.date)}
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
