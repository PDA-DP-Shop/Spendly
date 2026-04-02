import { motion } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, subMonths, addMonths } from 'date-fns'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMoneyCompact } from '../../utils/formatMoney'

export default function SpendingHeatmap({ expenses, currency, onDayClick }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const S = { fontFamily: 'Nunito' }

  const handlePrev = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNext = () => setCurrentMonth(addMonths(currentMonth, 1))

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Calculate daily totals
  const dailyTotals = {}
  let maxSpend = 0

  expenses.forEach(ex => {
    if (ex.type !== 'spent' || !ex.date) return
    const dateKey = ex.date.slice(0, 10)
    dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + ex.amount
    if (dailyTotals[dateKey] > maxSpend) maxSpend = dailyTotals[dateKey]
  })

  // Color intensity logic
  const getLevel = (amount) => {
    if (!amount) return 0
    if (amount <= maxSpend * 0.2) return 1
    if (amount <= maxSpend * 0.45) return 2
    if (amount <= maxSpend * 0.75) return 3
    return 4
  }

  // White Premium Heat Colors (Brand Purple)
  const heatColors = [
    '#F8F9FA', // 0
    '#EEF2FF', // 1
    '#E0E7FF', // 2
    '#9B6FE4', // 3
    '#7C6FF7', // 4
  ]

  // Stats
  let noSpendDays = 0
  let totalSpent = 0
  let maxDayAmt = 0
  let maxDayDate = null

  days.forEach(d => {
    const k = format(d, 'yyyy-MM-dd')
    const amt = dailyTotals[k] || 0
    if (amt === 0 && d <= new Date()) noSpendDays++
    totalSpent += amt
    if (amt > maxDayAmt) { maxDayAmt = amt; maxDayDate = d }
  })

  const startOffset = monthStart.getDay()

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <p className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-wider mb-0.5" style={S}>Intensity</p>
          <h4 className="text-[16px] font-[800] text-[#0F172A] tracking-tight" style={S}>Burn Map</h4>
        </div>
        <div className="flex items-center gap-2 bg-[#F8F7FF] p-1.5 rounded-full border border-[#F0F0F8]">
          <button onClick={handlePrev} className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#F1F5F9] active:scale-95 transition-transform">
            <ChevronLeft className="w-4 h-4 text-[var(--primary)]" />
          </button>
          <p className="text-[12px] font-[800] text-[#475569] w-28 text-center" style={S}>
            {format(currentMonth, 'MMMM yyyy')}
          </p>
          <button onClick={handleNext} disabled={isSameMonth(currentMonth, new Date())} 
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#F1F5F9] disabled:opacity-30 active:scale-95 transition-transform">
            <ChevronRight className="w-4 h-4 text-[var(--primary)]" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-8">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={`col-${i}`} className="text-center text-[11px] font-[800] text-[#CBD5E1]" style={S}>{d}</div>
        ))}
        {Array.from({ length: startOffset }).map((_, i) => <div key={`empty-${i}`} />)}
        
        {days.map(d => {
          const dateStr = format(d, 'yyyy-MM-dd')
          const amt = dailyTotals[dateStr] || 0
          const level = getLevel(amt)
          const isToday = dateStr === format(new Date(), 'yyyy-MM-dd')
          
          return (
            <motion.button 
              key={dateStr} 
              whileTap={{ scale: 0.9 }}
              onClick={() => onDayClick?.(dateStr, amt)}
              className="aspect-square rounded-[10px] transition-all relative group"
              style={{ background: heatColors[level], border: level === 0 ? '1px solid #F1F5F9' : 'none' }}
            >
              {isToday && (
                <div className="absolute inset-[-3px] rounded-[13px] border-2 border-[var(--secondary)] animate-pulse" />
              )}
              {/* Tooltip hint on hover (simple) */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#1A1A2E] text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20 shadow-xl" style={S}>
                {format(d, 'MMM d')}: {formatMoneyCompact(amt, currency)}
              </div>
            </motion.button>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#F8F7FF] rounded-[24px] p-5 border border-[#F0F0F8]">
          <p className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-wider mb-2" style={S}>No Spend</p>
          <div className="flex items-end gap-2">
            <p className="text-[22px] font-[800] text-[var(--primary)]" style={S}>{noSpendDays}</p>
            <p className="text-[12px] font-[700] text-[#94A3B8] mb-1" style={S}>days</p>
          </div>
        </div>
        <div className="bg-[#FFF7F2] rounded-[24px] p-5 border border-[#FFEBE4]">
          <p className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-wider mb-2" style={S}>Highest Peak</p>
          <p className="text-[20px] font-[800] text-[var(--secondary)] truncate" style={S}>
            {formatMoneyCompact(maxDayAmt, currency)}
          </p>
          <p className="text-[11px] font-[700] text-[#94A3B8] mt-1" style={S}>
            {maxDayDate ? format(maxDayDate, 'MMM do') : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  )
}
