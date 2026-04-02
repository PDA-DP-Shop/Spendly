// Purple income card and orange expense card shown side by side
import { motion } from 'framer-motion'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { formatMoney } from '../../utils/formatMoney'

function GlassStatCard({ label, amount, currency, color, Icon }) {
  const isIncome = label.toLowerCase().includes('in')
  const accentColor = isIncome ? '#00FF87' : '#FF4D6D'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 rounded-[24px] p-5 relative overflow-hidden glass-elevated border-white/5"
    >
      {/* Decorative Orbs */}
      <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full blur-[30px]" style={{ backgroundColor: `${accentColor}15` }} />
      <div className="absolute -bottom-6 -left-6 w-12 h-12 rounded-full blur-[20px]" style={{ backgroundColor: `${accentColor}10` }} />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center glass border-none" style={{ backgroundColor: `${accentColor}15` }}>
          <Icon className="w-4 h-4" style={{ color: accentColor }} />
        </div>
        <p className="text-[10px] font-display font-bold text-[#7B8DB0] uppercase tracking-[0.15em]">{label}</p>
      </div>

      <div className="relative z-10">
        <p className="text-[20px] font-display font-bold text-[#F0F4FF] leading-tight flex items-baseline gap-1">
          <span className="text-[14px] opacity-50 font-body">{currency}</span>
          {formatMoney(amount, '').replace(currency, '').trim()}
        </p>
        <div className="flex items-center gap-1.5 mt-2">
           <div className={`w-1.5 h-1.5 rounded-full ${isIncome ? 'bg-[#00FF87]' : 'bg-[#FF4D6D]'} shadow-glowSmall`} />
           <p className="text-[11px] font-body text-[#3D4F70] font-bold">This Cycle</p>
        </div>
      </div>
    </motion.div>
  )
}

export default function SalaryExpenseCards({ income, expense, currency = 'USD' }) {
  return (
    <div className="flex gap-4 px-6">
      <GlassStatCard
        label="Wealth In"
        amount={income}
        currency={currency}
        Icon={ArrowDownLeft}
      />
      <GlassStatCard
        label="Burn Out"
        amount={expense}
        currency={currency}
        Icon={ArrowUpRight}
      />
    </div>
  )
}
