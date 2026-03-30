import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatMoneyCompact } from '../../utils/formatMoney'

export default function YearComparisonChart({ currentYearTotals, prevYearTotals, currency }) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  
  const data = months.map((m, i) => ({
    name: m,
    thisYear: currentYearTotals[i] || 0,
    lastYear: prevYearTotals[i] || 0,
  }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white p-3 rounded-xl shadow-xl border border-gray-800 text-xs">
          <p className="font-sora font-bold mb-2 text-sm">{label}</p>
          <div className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-600" />
              <span className="text-gray-300">This Year</span>
            </div>
            <span className="font-semibold">{formatMoneyCompact(payload[0].value, currency)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-300" />
              <span className="text-gray-300">Last Year</span>
            </div>
            <span className="font-semibold">{formatMoneyCompact(payload[1].value, currency)}</span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white dark:bg-[#1A1A2E] rounded-[20px] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <p className="font-sora font-bold text-[15px] text-gray-900 dark:text-white">Year vs Year</p>
        <div className="flex items-center gap-3 text-[11px] font-medium text-gray-500">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-purple-600" /> This Year</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-purple-300" /> Last Year</div>
        </div>
      </div>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} dy={10} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124, 58, 237, 0.05)' }} />
            <Bar dataKey="thisYear" fill="#7C3AED" radius={[4, 4, 0, 0]} barSize={8} />
            <Bar dataKey="lastYear" fill="#C4B5FD" radius={[4, 4, 0, 0]} barSize={8} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
