// Purple bar chart for monthly analytics using Recharts
import { BarChart, Bar, XAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useState } from 'react'
import { formatMoneyCompact } from '../../utils/formatMoney'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const CustomTooltip = ({ active, payload, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-elevated border-white/10 p-3 rounded-xl shadow-glowSmall">
         <p className="text-[10px] font-display font-bold text-[#7B8DB0] uppercase tracking-wider mb-1">{payload[0].payload.month}</p>
        <p className="text-[14px] font-display font-bold text-cyan-glow">{formatMoneyCompact(payload[0].value, currency)}</p>
      </div>
    )
  }
  return null
}

export default function AnalyticsBarChart({ data, currency = 'USD', year }) {
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth())

  const chartData = MONTHS.map((m, i) => ({
    month: m,
    amount: data?.[i] || 0,
    index: i,
  }))

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-[14px] font-display font-bold text-[#F0F4FF] tracking-tight">Timeline Analytics</h4>
        <div className="px-3 py-1.5 rounded-xl glass border-white/5">
          <p className="text-[12px] font-body font-bold text-cyan-glow">{year || new Date().getFullYear()}</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart 
          data={chartData} 
          barSize={16} 
          onClick={e => e?.activePayload && setActiveMonth(e.activePayload[0].payload.index)}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00D4FF" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#00D4FF" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="activeBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00FF87" stopOpacity={1} />
              <stop offset="100%" stopColor="#00D4FF" stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#3D4F70', fontFamily: 'Satoshi, sans-serif', fontWeight: 700 }}
            dy={10}
          />
          <Tooltip 
            content={<CustomTooltip currency={currency} />} 
            cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }} 
            animationDuration={300}
          />
          <Bar 
            dataKey="amount" 
            radius={[6, 6, 6, 6]}
            animationBegin={200}
            animationDuration={1500}
          >
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={i === activeMonth ? 'url(#activeBarGradient)' : 'url(#barGradient)'}
                className="transition-all duration-500"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
