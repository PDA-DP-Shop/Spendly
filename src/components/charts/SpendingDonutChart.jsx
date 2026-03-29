// Spending donut chart grouped by category using Recharts
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatMoney } from '../../utils/formatMoney'
import { getCategoryById } from '../../constants/categories'
import { CHART_COLORS } from '../../constants/colors'

const CustomLabel = ({ cx, cy, total, currency }) => (
  <>
    <text x={cx} y={cy - 10} textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 700, fill: '#111827' }}>
      {formatMoney(total, currency)}
    </text>
    <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fill: '#9CA3AF' }}>
      Total Spent
    </text>
  </>
)

export default function SpendingDonutChart({ groupedData, currency = 'USD' }) {
  const total = groupedData.reduce((s, d) => s + d.total, 0)

  const data = groupedData.slice(0, 6).map((item, i) => ({
    name: getCategoryById(item.category)?.name || item.category,
    value: item.total,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }))

  return (
    <div className="bg-white dark:bg-[#1A1A2E] rounded-[20px] mx-4 p-4 shadow-sm">
      <p className="text-[16px] font-sora font-bold text-gray-900 dark:text-white mb-4">By Category</p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [formatMoney(value, currency), name]} />
        </PieChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex flex-col gap-2 mt-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[13px] text-gray-600 dark:text-gray-400">{item.name}</span>
            </div>
            <span className="text-[13px] font-sora font-semibold text-gray-800 dark:text-white">{formatMoney(item.value, currency)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
