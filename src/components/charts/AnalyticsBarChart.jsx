// Purple bar chart for monthly analytics using Recharts
import { BarChart, Bar, XAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useState } from 'react'
import { formatMoneyCompact } from '../../utils/formatMoney'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const CustomTooltip = ({ active, payload, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl">
        <p className="font-sora font-bold">{formatMoneyCompact(payload[0].value, currency)}</p>
      </div>
    )
  }
  return null
}

export default function AnalyticsBarChart({ data, currency = 'USD', year }) {
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth())
  const currentMonth = new Date().getMonth()

  // Build 12-month data
  const chartData = MONTHS.map((m, i) => ({
    month: m,
    amount: data?.[i] || 0,
    index: i,
  }))

  return (
    <div className="bg-white dark:bg-[#1A1A2E] rounded-[20px] mx-4 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[16px] font-sora font-bold text-gray-900 dark:text-white">Analytics</p>
        <div className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-900/20">
          <p className="text-[13px] font-semibold text-purple-600">{year || new Date().getFullYear()}</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData} barSize={18} onClick={e => e?.activePayload && setActiveMonth(e.activePayload[0].payload.index)}>
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'DM Sans' }}
          />
          <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: 'transparent' }} />
          <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={i === activeMonth ? '#7C3AED' : '#E9D5FF'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
