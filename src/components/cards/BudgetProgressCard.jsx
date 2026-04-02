// BudgetProgressCard — white card with animated indigo gradient progress bar
import { motion } from 'framer-motion'
import { formatMoney } from '../../utils/formatMoney'

export default function BudgetProgressCard({ label = 'Monthly Budget', spent = 0, total = 0, currency = '$' }) {
  const pct = total > 0 ? Math.min((spent / total) * 100, 100) : 0
  const isOver = spent > total && total > 0
  const barColor = isOver
    ? 'linear-gradient(135deg, #F43F5E, #FB7185)'
    : pct > 80
    ? 'linear-gradient(135deg, #F59E0B, #FCD34D)'
    : 'linear-gradient(135deg, #6366F1, #8B5CF6)'

  return (
    <div
      className="mx-5 p-5"
      style={{
        background: '#FFFFFF',
        border: '1px solid #F0F0F8',
        borderRadius: '20px',
        boxShadow: '0 2px 20px rgba(99,102,241,0.07)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[13px] font-semibold text-[#0F172A]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {label}
        </span>
        <span
          className="text-[13px] font-bold"
          style={{
            color: isOver ? '#F43F5E' : pct > 80 ? '#F59E0B' : '#6366F1',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}
        >
          {Math.round(pct)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full mb-3" style={{ background: '#F1F5F9' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
          className="h-full rounded-full relative"
          style={{ background: barColor, boxShadow: isOver ? 'none' : '0 0 12px rgba(99,102,241,0.3)' }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#94A3B8]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {currency}{typeof spent === 'number' ? spent.toFixed(0) : spent} spent
        </span>
        <span className="text-[12px] text-[#94A3B8]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {total > 0 ? `${currency}${typeof total === 'number' ? total.toFixed(0) : total} total` : 'No budget set'}
        </span>
      </div>
    </div>
  )
}
