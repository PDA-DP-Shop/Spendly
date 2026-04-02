// Spending donut chart grouped by category using Recharts
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatMoney } from '../../utils/formatMoney'
import { getCategoryById } from '../../constants/categories'
import { CHART_COLORS } from '../../constants/colors'

const CustomTooltip = ({ active, payload, currency }) => {
  if (active && payload && payload.length) {
    const S = { fontFamily: 'Nunito' }
    return (
      <div className="bg-white px-4 py-2.5 rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-[#F0F0F8]">
        <p className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-1" style={S}>{payload[0].name}</p>
        <p className="text-[16px] font-[800] text-[var(--primary)]" style={S}>
          {formatMoney(payload[0].value, currency)}
        </p>
      </div>
    )
  }
  return null
}

export default function SpendingDonutChart({ groupedData, currency = 'USD' }) {
  const total = groupedData.reduce((s, d) => s + d.total, 0)
  const S = { fontFamily: 'Nunito' }

  const data = groupedData.slice(0, 5).map((item, i) => ({
    name: getCategoryById(item.category)?.name || item.category,
    value: item.total,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }))

  return (
    <div className="w-full">
      <div className="relative h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={105}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip currency={currency} />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-[24px] font-[800] text-[#0F172A] leading-tight" style={S}>
            {formatMoney(total, currency).split('.')[0]}
          </p>
          <p className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-[0.15em] mt-1" style={S}>Burn Rate</p>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 gap-3 mt-6">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-4 rounded-[20px] bg-[#F8F7FF] border border-[#F0F0F8] hover:shadow-sm transition-all">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[14px] font-[700] text-[#475569]" style={S}>{item.name}</span>
            </div>
            <div className="text-right">
              <span className="text-[14px] font-[800] text-[#0F172A]" style={S}>{formatMoney(item.value, currency)}</span>
              <p className="text-[11px] font-[700] text-[#94A3B8]" style={S}>{((item.value / total) * 100).toFixed(1)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
