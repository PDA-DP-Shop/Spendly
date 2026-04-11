// Spending donut chart grouped by category using Recharts
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatMoney } from '../../utils/formatMoney'
import { getCategoryById } from '../../constants/categories'
const MONOCHROME_COLORS = ['#000000', '#333333', '#666666', '#999999', '#CCCCCC']

const CustomTooltip = ({ active, payload, currency }) => {
  if (active && payload && payload.length) {
    const S = { fontFamily: 'Inter' }
    return (
      <div className="bg-black px-5 py-3 rounded-full shadow-2xl border border-white/10">
        <p className="text-[10px] font-[900] text-[#AFAFAF] uppercase tracking-[0.2em] mb-1" style={S}>{payload[0].name}</p>
        <p className="text-[15px] font-[900] text-white" style={S}>
          {formatMoney(payload[0].value, currency)}
        </p>
      </div>
    )
  }
  return null
}

export default function SpendingDonutChart({ groupedData, currency = 'USD' }) {
  const total = groupedData.reduce((s, d) => s + d.total, 0)
  const S = { fontFamily: 'Inter' }

  const data = groupedData.slice(0, 5).map((item, i) => ({
    name: getCategoryById(item.category)?.name || item.category,
    value: item.total,
    color: MONOCHROME_COLORS[i % MONOCHROME_COLORS.length],
  }))

  return (
    <div className="w-full">
      <div className="relative h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={85}
              outerRadius={115}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              animationDuration={1200}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip currency={currency} />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-2">
          <p className="text-[28px] font-[900] text-black tracking-tighter leading-none" style={S}>
            {formatMoney(total, currency).split('.')[0]}
          </p>
          <p className="text-[10px] font-[900] text-[#AFAFAF] uppercase tracking-[0.25em] mt-2" style={S}>Intensity</p>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 gap-4 mt-8">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-5 rounded-[24px] bg-[#F6F6F6] border border-[#EEEEEE]">
            <div className="flex items-center gap-4">
              <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[14px] font-[900] text-black uppercase tracking-[0.05em]" style={S}>{item.name}</span>
            </div>
            <div className="text-right">
              <span className="text-[15px] font-[900] text-black" style={S}>{formatMoney(item.value, currency)}</span>
              <p className="text-[10px] font-[900] text-[#AFAFAF]" style={S}>{((item.value / total) * 100).toFixed(1)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
