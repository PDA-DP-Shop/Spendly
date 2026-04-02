// SalaryExpenseCards — white mini cards showing income and expense stats
import { motion } from 'framer-motion'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { formatMoney } from '../../utils/formatMoney'

function StatCard({ label, amount, currency, isIncome }) {
  const color = isIncome ? '#10B981' : '#F43F5E'
  const bg = isIncome ? '#ECFDF5' : '#FFF1F2'
  const Icon = isIncome ? ArrowDownLeft : ArrowUpRight

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 p-4"
      style={{
        background: '#FFFFFF',
        border: '1px solid #F0F0F8',
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(99,102,241,0.06)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: bg }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94A3B8', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {label}
        </p>
      </div>
      <p className="text-[20px] font-bold" style={{ color: '#0F172A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {formatMoney(amount, currency)}
      </p>
      <div className="flex items-center gap-1.5 mt-1">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
        <p className="text-[11px] text-[#94A3B8]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>This month</p>
      </div>
    </motion.div>
  )
}

export default function SalaryExpenseCards({ income, expense, currency = 'USD' }) {
  return (
    <div className="flex gap-3 px-5">
      <StatCard label="Income" amount={income} currency={currency} isIncome={true} />
      <StatCard label="Spent" amount={expense} currency={currency} isIncome={false} />
    </div>
  )
}
