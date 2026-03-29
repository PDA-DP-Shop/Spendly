// Reports screen — spending analytics with charts, filter chips, and stats grid
import { useState } from 'react'
import { motion } from 'framer-motion'
import TopHeader from '../components/shared/TopHeader'
import SpendingDonutChart from '../components/charts/SpendingDonutChart'
import AnalyticsBarChart from '../components/charts/AnalyticsBarChart'
import MonthlyLineChart from '../components/charts/MonthlyLineChart'
import EmptyState from '../components/shared/EmptyState'
import { useExpenses } from '../hooks/useExpenses'
import { useSettingsStore } from '../store/settingsStore'
import { calculateSpent, calculateReceived, calculateSavingsRate } from '../utils/calculateTotal'
import { groupByCategory, groupByMonth } from '../utils/groupByCategory'
import { formatMoney } from '../utils/formatMoney'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, parseISO, isWithinInterval } from 'date-fns'
import { format } from 'date-fns'

const FILTERS = ['This Week', 'This Month', '3 Months', 'All Time']

export default function ReportsScreen() {
  const [filter, setFilter] = useState('This Month')
  const { expenses } = useExpenses()
  const { settings } = useSettingsStore()
  const currency = settings?.currency || 'USD'

  const now = new Date()
  const filterExpenses = (exps) => {
    const ranges = {
      'This Week': { start: startOfWeek(now), end: endOfWeek(now) },
      'This Month': { start: startOfMonth(now), end: endOfMonth(now) },
      '3 Months': { start: subMonths(now, 3), end: now },
      'All Time': { start: new Date(0), end: now },
    }
    const range = ranges[filter]
    return exps.filter(e => {
      try { return isWithinInterval(parseISO(e.date), range) } catch { return false }
    })
  }

  const filtered = filterExpenses(expenses)
  const spent = calculateSpent(filtered)
  const received = calculateReceived(filtered)
  const saved = received - spent
  const savingsRate = calculateSavingsRate(filtered)
  const grouped = groupByCategory(filtered)

  // 12-month data for bar chart
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const key = format(subMonths(now, 11 - i), 'yyyy-MM')
    const monthExps = expenses.filter(e => e.date?.startsWith(key))
    return calculateSpent(monthExps)
  })

  // 6-month data for line chart
  const sixMonthData = Array.from({ length: 6 }, (_, i) => {
    const key = format(subMonths(now, 5 - i), 'yyyy-MM')
    const monthExps = expenses.filter(e => e.date?.startsWith(key))
    return calculateSpent(monthExps)
  })

  // Stats
  const topCategory = grouped[0]
  const biggestPurchase = filtered.filter(e => e.type === 'spent').sort((a, b) => b.amount - a.amount)[0]
  const dailyAvg = filtered.length > 0 ? spent / 30 : 0

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F5F5] dark:bg-[#0F0F1A] mb-tab">
      <TopHeader title="Reports" />

      {/* Filter chips */}
      <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
        {FILTERS.map(f => (
          <motion.button key={f} whileTap={{ scale: 0.95 }} onClick={() => setFilter(f)}
            className={`px-5 py-2.5 rounded-full text-[13px] font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
              filter === f ? 'bg-purple-600 text-white shadow-sm' : 'bg-white dark:bg-[#1A1A2E] text-gray-500'
            }`}>
            {f}
          </motion.button>
        ))}
      </div>

      {/* Summary 3-card row */}
      <div className="flex gap-2 px-4 mb-4">
        {[
          { label: 'Spent', value: spent, color: 'text-red-500' },
          { label: 'Received', value: received, color: 'text-green-500' },
          { label: 'Saved', value: Math.max(saved, 0), color: 'text-purple-600' },
        ].map(item => (
          <div key={item.label} className="flex-1 bg-white dark:bg-[#1A1A2E] rounded-2xl p-3 text-center shadow-sm">
            <p className="text-[10px] text-gray-400 uppercase mb-1">{item.label}</p>
            <p className={`text-[14px] font-sora font-bold ${item.color}`}>{formatMoney(item.value, currency)}</p>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState type="reports" title="No data yet" message="Add some expenses to see your spending reports" />
      ) : (
        <>
          <SpendingDonutChart groupedData={grouped} currency={currency} />
          <div className="mt-4">
            <AnalyticsBarChart data={monthlyData} currency={currency} />
          </div>
          <div className="mt-4">
            <MonthlyLineChart monthlyTotals={sixMonthData} currency={currency} />
          </div>

          {/* Stats grid */}
          <div className="mx-4 mt-4 mb-2 grid grid-cols-2 gap-3">
            {[
              { label: '🏆 Top Category', value: topCategory ? topCategory.category : 'None' },
              { label: '💸 Biggest Buy', value: biggestPurchase ? biggestPurchase.shopName : 'None' },
              { label: '📅 Daily Average', value: formatMoney(dailyAvg, currency) },
              { label: '💰 Savings Rate', value: `${savingsRate}%` },
            ].map(stat => (
              <div key={stat.label} className="bg-white dark:bg-[#1A1A2E] rounded-2xl p-4 shadow-sm">
                <p className="text-[12px] text-gray-400 mb-1">{stat.label}</p>
                <p className="text-[16px] font-sora font-bold text-gray-900 dark:text-white capitalize">{stat.value}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
