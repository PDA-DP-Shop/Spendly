// Spending donut chart grouped by category using Recharts
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatMoney } from '../../utils/formatMoney'
import { getCategoryById } from '../../constants/categories'
import { CHART_COLORS } from '../../constants/colors'

const CustomTooltip = ({ active, payload, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-elevated border-white/10 p-3 rounded-xl shadow-glowSmall">
        <p className="text-[12px] font-display font-bold text-[#F0F4FF] mb-1">{payload[0].name}</p>
        <p className="text-[14px] font-display font-bold text-cyan-glow">
          {formatMoney(payload[0].value, currency)}
        </p>
      </div>
    )
  }
  return null
}

const CenterLabel = ({ cx, cy, total, currency }) => (
  <g>
    <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="middle" className="font-display font-bold" style={{ fontSize: 18, fill: '#F0F4FF' }}>
      {formatMoney(total, '').split('.')[0]}
    </text>
    <text x={cx} y={cy + 16} textAnchor="middle" dominantBaseline="middle" className="font-body font-bold" style={{ fontSize: 10, fill: '#7B8DB0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
      Total Burn
    </text>
  </g>
)

export default function SpendingDonutChart({ groupedData, currency = 'USD' }) {
  const total = groupedData.reduce((s, d) => s + d.total, 0)

  const data = groupedData.slice(0, 5).map((item, i) => ({
    name: getCategoryById(item.category)?.name || item.category,
    value: item.total,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }))

  return (
    <div className="w-full">
      <div className="relative h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={95}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip currency={currency} />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Absolute center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-[20px] font-display font-bold text-[#F0F4FF] leading-tight">
            <span className="text-[12px] opacity-50 mr-1">{currency}</span>
            {formatMoney(total, '').replace(currency, '').split('.')[0]}
          </p>
          <p className="text-[10px] font-display font-bold text-[#3D4F70] uppercase tracking-[0.15em] mt-1">Total Burn</p>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 gap-3 mt-4">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl glass border-none hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full shadow-glowSmall" style={{ backgroundColor: item.color }} />
              <span className="text-[13px] font-body font-bold text-[#F0F4FF]">{item.name}</span>
            </div>
            <div className="text-right">
              <span className="text-[13px] font-display font-bold text-[#7B8DB0]">{formatMoney(item.value, currency)}</span>
              <p className="text-[10px] font-body text-[#3D4F70] font-bold">{((item.value / total) * 100).toFixed(1)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
