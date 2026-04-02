// Purple/Orange bar chart for monthly analytics using Recharts
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useState } from 'react'
import { formatMoneyCompact } from '../../utils/formatMoney'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const CustomTooltip = ({ active, payload, currency, chartMode }) => {
  if (active && payload && payload.length) {
    const textColor = chartMode === 'expense' ? 'text-[var(--secondary)]' : 'text-[var(--primary)]'
    return (
      <div className="bg-white px-4 py-2.5 rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-[#F0F0F8]">
        <p className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-1" style={{ fontFamily: 'Nunito' }}>
          {payload[0].payload.month}
        </p>
        <p className={`text-[16px] font-[800] ${textColor}`} style={{ fontFamily: 'Nunito' }}>
          {formatMoneyCompact(payload[0].value, currency)}
        </p>
      </div>
    )
  }
  return null
}

export default function AnalyticsBarChart({ data, currency = 'USD', chartMode = 'expense' }) {
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth())

  const chartData = MONTHS.map((m, i) => ({
    month: m,
    amount: data?.[i] || 0,
    index: i,
  }))

  const colorBase = chartMode === 'expense' ? '#FF7043' : '#7C6FF7'
  const colorLight = chartMode === 'expense' ? '#FFEBE4' : '#EEF2FF'

  return (
    <div className="w-full relative mt-3 -ml-4">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart 
          data={chartData} 
          barSize={14} 
          onClick={e => e?.activePayload && setActiveMonth(e.activePayload[0].payload.index)}
          margin={{ top: 10, right: 0, left: 10, bottom: 5 }}
        >
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#CBD5E1', fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
            dy={12}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#CBD5E1', fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
            tickFormatter={(val) => formatMoneyCompact(val, currency)}
            width={50}
          />
          <Tooltip 
            content={<CustomTooltip currency={currency} chartMode={chartMode} />} 
            cursor={{ fill: 'rgba(124, 111, 247, 0.04)', radius: 10 }} 
            animationDuration={200}
          />
          <Bar 
            dataKey="amount" 
            radius={[6, 6, 6, 6]}
            animationBegin={0}
            animationDuration={1200}
          >
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={i === activeMonth ? colorBase : colorLight}
                stroke={i === activeMonth ? colorBase : 'transparent'}
                strokeWidth={1}
                className="transition-all duration-300"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
