// SalaryExpenseCards — white mini cards showing income and expense stats
import { motion } from 'framer-motion'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { formatMoney } from '../../utils/formatMoney'

function StatCard({ label, amount, currency, isIncome, index }) {
  const color = isIncome ? '#10B981' : '#FF7043'
  const bg = isIncome ? '#F0FDF4' : '#FFF7ED'
  const Icon = isIncome ? ArrowDownLeft : ArrowUpRight
  const S = { fontFamily: "'Nunito', sans-serif" }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="flex-1 p-5 bg-white border border-[#F0F0F8] rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.03)]"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-9 h-9 rounded-[12px] flex items-center justify-center shadow-sm" style={{ background: bg, border: `1px solid ${color}15` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <p className="text-[11px] font-[800] uppercase tracking-[0.1em] text-[#94A3B8]" style={S}>
          {label}
        </p>
      </div>
      <p className="text-[22px] font-[800] text-[#0F172A] tracking-tight" style={S}>
        {formatMoney(amount, currency)}
      </p>
      <div className="flex items-center gap-1.5 mt-2">
        <p className="text-[11px] font-[700] text-[#CBD5E1] uppercase tracking-wider" style={S}>This Month</p>
      </div>
    </motion.div>
  )
}

export default function SalaryExpenseCards({ income, expense, currency = 'USD' }) {
  return (
    <div className="flex gap-4 px-5">
      <StatCard label="Income" amount={income} currency={currency} isIncome={true} index={0} />
      <StatCard label="Spent" amount={expense} currency={currency} isIncome={false} index={1} />
    </div>
  )
}
