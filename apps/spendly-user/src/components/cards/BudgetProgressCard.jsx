// BudgetProgressCard — white card with animated indigo gradient progress bar
import { motion } from 'framer-motion'
import { formatMoney } from '../../utils/formatMoney'

export default function BudgetProgressCard({ label = 'Capital Threshold', spent = 0, total = 0, currency = '$', simplified = false }) {
  const pct = total > 0 ? Math.min(Math.round((spent / total) * 100), 100) : 0
  const isOver = spent > total && total > 0
  
  // Uber style: monochrome indicators
  const barColor = isOver ? '#E11900' : '#000000'

  const S = { fontFamily: "'Inter', sans-serif" }

  return (
    <div
      className={`bg-white border border-[#EEEEEE] rounded-[24px] shadow-premium ${simplified ? 'p-5 w-full h-full' : 'mx-5 p-6'}`}
    >
      <div className={`flex items-center justify-between ${simplified ? 'mb-4' : 'mb-5'}`}>
        <span className={`${simplified ? 'text-[13px]' : 'text-[15px]'} font-[900] text-black uppercase tracking-[0.1em]`} style={S}>
          {label}
        </span>
        <span
          className={`${simplified ? 'text-[13px]' : 'text-[15px]'} font-[900]`}
          style={{
            color: isOver ? '#E11900' : '#000000',
            ...S
          }}
        >
          {Math.round(pct)}%
        </span>
      </div>

      {/* Progress bar (Uber style: flat monochrome) */}
      <div className={`${simplified ? 'h-2' : 'h-2.5'} rounded-full ${simplified ? 'mb-4' : 'mb-5'} bg-[#F6F6F6] overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
          className="h-full rounded-full"
          style={{ background: barColor }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-[900] uppercase text-[#AFAFAF] tracking-widest mb-1" style={S}>Allocated</span>
          <span className={`${simplified ? 'text-[14px]' : 'text-[15px]'} font-[900] text-black`} style={S}>
            {currency}{typeof spent === 'number' ? spent.toFixed(0) : spent}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-[900] uppercase text-[#AFAFAF] tracking-widest mb-1" style={S}>Limit</span>
          <span className={`${simplified ? 'text-[14px]' : 'text-[15px]'} font-[900] text-black`} style={S}>
            {total > 0 ? `${currency}${typeof total === 'number' ? total.toFixed(0) : total}` : '∞'}
          </span>
        </div>
      </div>
    </div>
  )
}
