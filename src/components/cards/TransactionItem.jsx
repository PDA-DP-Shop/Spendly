// TransactionItem — white flat row with swipe to delete/edit
import { useState } from 'react'
import { m as motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { Trash2, Edit2, History } from 'lucide-react'
import { formatMoney } from '../../utils/formatMoney'
import { formatDate, formatTime } from '../../utils/formatDate'
import { getCategoryById } from '../../constants/categories'
import { useSecurityStore } from '../../store/securityStore'

export default function TransactionItem({ expense, currency = 'USD', onDelete, onEdit, index = 0 }) {
  const { hideBalances } = useSecurityStore()
  const category = getCategoryById(expense.category) || { emoji: '💰', color: '#7C6FF7', name: 'Other' }
  const isSpent = expense.type === 'spent'
  const x = useMotionValue(0)
  const [isOpen, setIsOpen] = useState(false)
  const S = { fontFamily: "'Nunito', sans-serif" }

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

  const shopName = expense.shopName || category.name
  const initialLetter = shopName ? shopName.charAt(0).toUpperCase() : '?'

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
      className="relative mx-6 mb-0 overflow-hidden"
    >
      {/* Background Actions */}
      <div className="absolute inset-0 flex items-center justify-between px-4 h-[72px]">
        <motion.div style={{ scale: rightScale, opacity: rightOpacity }} className="flex gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); closeActions(); onEdit?.(expense) }}
            className="w-11 h-11 rounded-[16px] flex items-center justify-center bg-[#F8F7FF] border border-[#F0F0F8] shadow-sm"
          >
            <Edit2 className="w-5 h-5 text-[var(--primary)]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); closeActions(); onDelete?.(expense.id) }}
            className="w-11 h-11 rounded-[16px] flex items-center justify-center bg-[#FFF5F5] border border-[#FFE0E0] shadow-sm"
          >
            <Trash2 className="w-5 h-5 text-[#FF7043]" />
          </button>
        </motion.div>
        <motion.div style={{ scale: leftScale, opacity: leftOpacity }} className="flex gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); closeActions(); onDelete?.(expense.id) }}
            className="w-11 h-11 rounded-[16px] flex items-center justify-center bg-[#FFF5F5] border border-[#FFE0E0] shadow-sm"
          >
            <Trash2 className="w-5 h-5 text-[#FF7043]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); closeActions(); onEdit?.(expense) }}
            className="w-11 h-11 rounded-[16px] flex items-center justify-center bg-[#F8F7FF] border border-[#F0F0F8] shadow-sm"
          >
            <Edit2 className="w-5 h-5 text-[var(--primary)]" />
          </button>
        </motion.div>
      </div>

      {/* Main card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -130, right: 130 }}
        dragElastic={0.05}
        onDragEnd={handleDragEnd}
        onTap={() => {
          if (isOpen) closeActions()
          else if (Math.abs(x.get()) < 10) onEdit?.(expense)
        }}
        className="relative z-10 flex items-center gap-4 px-2 py-0 cursor-grab active:cursor-grabbing bg-white h-[72px]"
        style={{ x }}
      >
        {/* Icon box (colored square with initial letter) */}
        <div
          className="w-12 h-12 rounded-[16px] flex items-center justify-center text-[20px] font-[800] flex-shrink-0 shadow-sm"
          style={{
            background: `${category.color}15`,
            color: category.color,
            border: `1px solid ${category.color}20`,
            fontFamily: "Nunito"
          }}
        >
          {initialLetter}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[17px] font-[800] text-[#0F172A] tracking-tight truncate" style={S}>
            {shopName}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-[12px] font-[700] text-[#94A3B8] uppercase tracking-wider" style={S}>
              {formatDate(expense.date)}
            </p>
            {expense.paymentMethod && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[#E2E8F0]" />
                <span className="text-[11px] font-[800] text-[var(--primary)] uppercase tracking-widest" style={S}>
                  {expense.paymentMethod}
                </span>
              </>
            )}
            {expense.isSplit && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[#E2E8F0]" />
                <span
                  className="text-[10px] font-[800] px-2 py-0.5 rounded-[6px] uppercase tracking-widest"
                  style={{ background: '#F8F7FF', color: 'var(--primary)', border: '1px solid #F0F0F8', fontFamily: "Nunito" }}
                >
                  S
                </span>
              </>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="text-right flex-shrink-0 pr-1">
          <div
            className="text-[17px] font-[800] tracking-tight"
            style={{
              color: isSpent ? '#0F172A' : '#10B981',
              fontFamily: "Nunito",
            }}
          >
            {hideBalances ? '••••' : (isSpent ? '-' : '+') + formatMoney(expense.amount, currency)}
          </div>
          <p className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-widest mt-0.5" style={S}>
            {formatTime(expense.date)}
          </p>
        </div>
      </motion.div>

    </motion.div>
  )
}
