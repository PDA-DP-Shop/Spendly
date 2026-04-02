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
    <motion.div className="relative mx-4 mb-1 rounded-3xl overflow-hidden glass border-none">
      {/* Background Actions Reveal */}
      <div className="absolute inset-0 flex items-center justify-between px-4">
        {/* Left revealed: Edit/Delete */}
        <motion.div style={{ scale: rightScale, opacity: rightOpacity }} className="flex gap-3">
          <motion.button onClick={(e) => { e.stopPropagation(); closeActions(); onEdit?.(expense); }}
            className="w-12 h-12 glass flex items-center justify-center border-cyan-glow/20 shadow-glow">
            <Edit2 className="w-5 h-5 text-cyan-glow" />
          </motion.button>
          <motion.button onClick={(e) => { e.stopPropagation(); closeActions(); onDelete?.(expense.id); }}
            className="w-12 h-12 glass flex items-center justify-center border-expense/20 shadow-[0_0_20px_rgba(255,77,109,0.2)]">
            <Trash2 className="w-5 h-5 text-expense" />
          </motion.button>
        </motion.div>

        {/* Right revealed: Delete/Edit */}
        <motion.div style={{ scale: leftScale, opacity: leftOpacity }} className="flex gap-3">
          <motion.button onClick={(e) => { e.stopPropagation(); closeActions(); onDelete?.(expense.id); }}
            className="w-12 h-12 glass flex items-center justify-center border-expense/20 shadow-[0_0_20px_rgba(255,77,109,0.2)]">
            <Trash2 className="w-5 h-5 text-expense" />
          </motion.button>
          <motion.button onClick={(e) => { e.stopPropagation(); closeActions(); onEdit?.(expense); }}
            className="w-12 h-12 glass flex items-center justify-center border-cyan-glow/20 shadow-glow">
            <Edit2 className="w-5 h-5 text-cyan-glow" />
          </motion.button>
        </motion.div>
      </div>

      {/* Main card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -140, right: 140 }}
        dragElastic={0.05}
        style={{ x }}
        onDragEnd={handleDragEnd}
        onTap={() => {
          if (isOpen) closeActions()
          else if (Math.abs(x.get()) < 10) onEdit?.(expense)
        }}
        className="relative z-10 flex items-center gap-4 p-4 bg-transparent cursor-grab active:cursor-grabbing backdrop-blur-none"
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 shadow-lg" 
             style={{ background: `linear-gradient(135deg, ${category.color}40, ${category.color}10)`, border: `1px solid ${category.color}30` }}>
          {category.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-body font-medium text-[#F0F4FF] truncate">{expense.shopName || category.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[12px] font-body text-[#7B8DB0]">{formatDate(expense.date)}</p>
            {expense.paymentMethod && (
              <>
                <span className="w-1 h-1 rounded-full bg-[#3D4F70]" />
                <span className="text-[11px] font-body font-semibold text-[#7B8DB0] uppercase tracking-[0.08em]">{expense.paymentMethod}</span>
              </>
            )}
            {expense.isSplit && (
              <>
                <span className="w-1 h-1 rounded-full bg-[#3D4F70]" />
                <div className="flex items-center gap-0.5 text-cyan-glow bg-cyan-dim px-2 py-0.5 rounded-full text-[10px] font-body font-bold tracking-wide">
                  SPLIT · {expense.splitPeople}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <p className={`text-[16px] font-display font-bold tracking-tight ${isSpent ? 'text-expense' : 'text-income'}`}>
            {hideBalances ? '••••' : (isSpent ? '- ' : '+ ') + formatMoney(expense.amount, currency)}
          </p>
          <p className="text-[11px] font-body text-[#7B8DB0] mt-0.5">{formatTime(expense.date)}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}
