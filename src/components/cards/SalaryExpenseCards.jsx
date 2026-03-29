// Purple income card and orange expense card shown side by side
import { motion } from 'framer-motion'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { formatMoney } from '../../utils/formatMoney'

function GradientCard({ label, amount, currency, gradient, Icon, delay = 0 }) {
  return (
    <motion.div
      className="flex-1 rounded-[20px] p-4 relative overflow-hidden"
      style={{ background: gradient, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
    >
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] text-white/70 font-medium uppercase tracking-wide">{label}</p>
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
      <p className="text-[22px] font-sora font-bold text-white leading-tight">
        {formatMoney(amount, currency)}
      </p>
      <p className="text-[11px] text-white/50 mt-1">This month</p>
    </motion.div>
  )
}

export default function SalaryExpenseCards({ income, expense, currency = 'USD' }) {
  return (
    <div className="flex gap-3 px-4">
      <GradientCard
        label="Money In"
        amount={income}
        currency={currency}
        gradient="linear-gradient(135deg, #7C3AED, #6D28D9)"
        Icon={ArrowDownLeft}
        delay={0.05}
      />
      <GradientCard
        label="Money Spent"
        amount={expense}
        currency={currency}
        gradient="linear-gradient(135deg, #EA580C, #DC2626)"
        Icon={ArrowUpRight}
        delay={0.1}
      />
    </div>
  )
}
