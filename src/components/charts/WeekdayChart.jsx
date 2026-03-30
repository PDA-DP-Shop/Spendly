import { BarChart, Bar, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatMoneyCompact } from '../../utils/formatMoney'

export default function WeekdayChart({ rawExpenses, currency }) {
  // rawExpenses -> all time or current month ? Usually filtered by ReportsScreen
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const totals = [0,0,0,0,0,0,0]
  const counts = [0,0,0,0,0,0,0]

  rawExpenses.forEach(e => {
    if (e.type !== 'spent' || !e.date) return
    const d = new Date(e.date).getDay() // 0-6
    totals[d] += e.amount
    counts[d]++
  })

  // Start with Monday using modulo logic
  const orderedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const data = orderedDays.map((name, i) => {
    // Map back to JS getDay() index: Mon=1, Tue=2, ..., Sun=0
    const jsIndex = i === 6 ? 0 : i + 1
    const avg = counts[jsIndex] > 0 ? totals[jsIndex] / counts[jsIndex] : 0
    return { name, avg, total: totals[jsIndex], isWeekend: name === 'Sat' || name === 'Sun' }
  })

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload
      return (
        <div className="bg-gray-900 text-white p-3 rounded-xl shadow-xl border border-gray-800 text-center">
          <p className="text-xs text-gray-400 mb-1">{d.name} Average</p>
          <p className="font-sora font-bold text-lg" style={{ color: d.isWeekend ? '#F97316' : '#7C3AED' }}>
            {formatMoneyCompact(d.avg, currency)}
          </p>
        </div>
      )
    }
    return null
  }

  const weekendTotal = data.filter(d => d.isWeekend).reduce((s, d) => s + d.total, 0)
  const weekdayTotal = data.filter(d => !d.isWeekend).reduce((s, d) => s + d.total, 0)
  const total = weekendTotal + weekdayTotal
  const weekendPct = total > 0 ? Math.round((weekendTotal / total) * 100) : 0

  return (
    <div className="bg-white dark:bg-[#1A1A2E] rounded-[20px] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <p className="font-sora font-bold text-[15px] text-gray-900 dark:text-white">Daily Averages</p>
        <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 px-3 py-1 rounded-full text-[11px] font-bold">
          {weekendPct}% on Weekends
        </div>
      </div>
      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Bar dataKey="avg" radius={[6, 6, 6, 6]} barSize={32}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.isWeekend ? '#F97316' : '#7C3AED'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between px-2 mt-2">
        {data.map(d => (
          <p key={d.name} className={`text-[10px] font-bold ${d.isWeekend ? 'text-orange-500' : 'text-gray-400'}`}>{d.name}</p>
        ))}
      </div>
    </div>
  )
}
