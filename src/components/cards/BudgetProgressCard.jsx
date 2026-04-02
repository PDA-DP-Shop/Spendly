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
    : 'linear-gradient(135deg, #7C6FF7, #9B6FE4)'

  const S = { fontFamily: "'Nunito', sans-serif" }

  return (
    <div
      className="mx-5 p-5 bg-white border border-[#F0F0F8] rounded-[24px] shadow-[0_2px_16px_rgba(124,111,247,0.04)]"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[14px] font-[800] text-[#0F172A]" style={S}>
          {label}
        </span>
        <span
          className="text-[14px] font-[800]"
          style={{
            color: isOver ? '#F43F5E' : pct > 80 ? '#F59E0B' : 'var(--primary)',
            ...S
          }}
        >
          {Math.round(pct)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full mb-4 bg-[#F1F5F9] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
          className="h-full rounded-full"
          style={{ background: barColor, boxShadow: isOver ? 'none' : '0 2px 8px rgba(124,111,247,0.2)' }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[11px] font-[700] uppercase text-[#94A3B8] mb-0.5" style={S}>Spent</span>
          <span className="text-[13px] font-[800] text-[#0F172A]" style={S}>
            {currency}{typeof spent === 'number' ? spent.toFixed(0) : spent}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[11px] font-[700] uppercase text-[#94A3B8] mb-0.5" style={S}>Target</span>
          <span className="text-[13px] font-[800] text-[#0F172A]" style={S}>
            {total > 0 ? `${currency}${typeof total === 'number' ? total.toFixed(0) : total}` : 'No limit'}
          </span>
        </div>
      </div>
    </div>
  )
}
