// SalaryExpenseCards — simplified premium stat cards
import { motion } from 'framer-motion'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { formatMoney } from '../../utils/formatMoney'
import { useTranslation } from 'react-i18next'

function StatCard({ label, amount, currency, isIncome, index }) {
  const Icon = isIncome ? ArrowDownLeft : ArrowUpRight
  const S = { fontFamily: "'Inter', sans-serif" }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.6 }}
      className={`relative p-5 rounded-[28px] border flex flex-col justify-between overflow-hidden h-[130px] ${
        isIncome 
          ? 'bg-[#F9F9F9] border-[#EEEEEE]' 
          : 'bg-black border-black text-white'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${
          isIncome ? 'bg-white border-[#EEEEEE]' : 'bg-white/10 border-white/10'
        }`}>
          <Icon className={`w-4 h-4 ${isIncome ? 'text-black' : 'text-white'}`} strokeWidth={3} />
        </div>
        <div className={`text-[10px] font-[800] uppercase tracking-wider truncate text-right flex-1 ml-2 ${
          isIncome ? 'text-[#AFAFAF]' : 'text-white/40'
        }`} style={S}>
          {label}
        </div>
      </div>

      <div>
        <p className={`text-[20px] font-[900] tracking-tighter leading-tight truncate ${
          isIncome ? 'text-black' : 'text-white'
        }`} style={S}>
          {formatMoney(amount, currency)}
        </p>
      </div>
    </motion.div>
  )
}

export default function SalaryExpenseCards({ income, expense, currency = 'USD', labels }) {
  const { t } = useTranslation()
  const displayLabels = labels || { income: t('home.inflow'), expense: t('home.spent') }

  return (
    <div className="grid grid-cols-2 gap-4 px-6 mt-4">
      <StatCard label={displayLabels.income} amount={income} currency={currency} isIncome={true} index={0} />
      <StatCard label={displayLabels.expense} amount={expense} currency={currency} isIncome={false} index={1} />
    </div>
  )
}
