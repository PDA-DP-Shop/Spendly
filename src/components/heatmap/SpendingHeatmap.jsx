import { motion } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, subMonths, addMonths } from 'date-fns'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMoneyCompact } from '../../utils/formatMoney'

export default function SpendingHeatmap({ expenses, currency, onDayClick }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

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

  // Color intensity logic: 5 levels (0 = no spend, 4 = max spend)
  const getLevel = (amount) => {
    if (!amount) return 0
    if (amount <= maxSpend * 0.15) return 1
    if (amount <= maxSpend * 0.4) return 2
    if (amount <= maxSpend * 0.7) return 3
    return 4
  }

  // Tailwind bg classes for standard purple theme
  const heatColors = [
    'bg-gray-100 dark:bg-gray-800',           // 0
    'bg-purple-200 dark:bg-purple-900/40',    // 1
    'bg-purple-400 dark:bg-purple-700/60',    // 2
    'bg-purple-600 dark:bg-purple-500',       // 3
    'bg-purple-800 dark:bg-purple-400',       // 4
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

  // Calendar padding
  const startOffset = monthStart.getDay()

  return (
    <div className="bg-white dark:bg-[#1A1A2E] rounded-[20px] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <p className="font-sora font-bold text-[15px] text-gray-900 dark:text-white">Daily Spending</p>
        <div className="flex items-center gap-3">
          <button onClick={handlePrev} className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
          <p className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 w-24 text-center">
            {format(currentMonth, 'MMM yyyy')}
          </p>
          <button onClick={handleNext} disabled={isSameMonth(currentMonth, new Date())} 
            className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center disabled:opacity-30">
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-2 gap-x-1.5 mb-5">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={`col-${i}`} className="text-center text-[10px] font-semibold text-gray-400">{d}</div>
        ))}
        {Array.from({ length: startOffset }).map((_, i) => <div key={`empty-${i}`} />)}
        
        {days.map(d => {
          const dateStr = format(d, 'yyyy-MM-dd')
          const amt = dailyTotals[dateStr] || 0
          const level = getLevel(amt)
          const isToday = dateStr === format(new Date(), 'yyyy-MM-dd')
          
          return (
            <button key={dateStr} onClick={() => onDayClick?.(dateStr, amt)}
              className={`aspect-square rounded-[8px] sm:rounded-[10px] transition-transform hover:scale-110 active:scale-90 ${heatColors[level]} ${isToday ? 'ring-2 ring-orange-500 ring-offset-1 dark:ring-offset-[#1A1A2E]' : ''}`}
              title={`${format(d, 'MMM d')}: ${formatMoneyCompact(amt, currency)}`}
            />
          )
        })}
      </div>

      {/* Stats Summary */}
      <div className="flex gap-2">
        <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-2xl p-3 text-center">
          <p className="text-[10px] text-gray-400 font-semibold mb-1 uppercase">No Spend Days</p>
          <p className="font-sora font-bold text-[16px] text-green-500">{noSpendDays}</p>
        </div>
        <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-2xl p-3 text-center">
          <p className="text-[10px] text-gray-400 font-semibold mb-1 uppercase">Highest Day</p>
          <p className="font-sora font-bold text-[16px] text-red-500">{formatMoneyCompact(maxDayAmt, currency)}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{maxDayDate ? format(maxDayDate, 'MMM d') : '-'}</p>
        </div>
      </div>
    </div>
  )
}
