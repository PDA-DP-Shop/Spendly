// Purple/Orange bar chart for monthly analytics using Recharts
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useState } from 'react'
import { formatMoneyCompact } from '../../utils/formatMoney'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const CustomTooltip = ({ active, payload, currency, chartMode }) => {
  if (active && payload && payload.length) {
    const S = { fontFamily: 'Inter' }
    return (
      <div className="bg-black px-5 py-3 rounded-full shadow-2xl border border-white/10">
        <p className="text-[10px] font-[900] text-[#AFAFAF] uppercase tracking-[0.2em] mb-1" style={S}>
          {payload[0].payload.month}
        </p>
        <p className="text-[15px] font-[900] text-white" style={S}>
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
    month: m.toUpperCase(),
    amount: data?.[i] || 0,
    index: i,
  }))

  const colorActive = '#000000'
  const colorInactive = '#EEEEEE'

  return (
    <div className="w-full relative mt-6">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart 
          data={chartData} 
          barSize={12} 
          onClick={e => e?.activePayload && setActiveMonth(e.activePayload[0].payload.index)}
          margin={{ top: 10, right: 0, left: 0, bottom: 5 }}
        >
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: '#AFAFAF', fontFamily: 'Inter', fontWeight: 900 }}
            dy={15}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: '#AFAFAF', fontFamily: 'Inter', fontWeight: 900 }}
            tickFormatter={(val) => formatMoneyCompact(val, currency)}
            width={40}
          />
          <Tooltip 
            content={<CustomTooltip currency={currency} chartMode={chartMode} />} 
            cursor={{ fill: '#F6F6F6', radius: 4 }} 
            animationDuration={200}
          />
          <Bar 
            dataKey="amount" 
            radius={[4, 4, 4, 4]}
            animationBegin={0}
            animationDuration={1000}
          >
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={i === activeMonth ? colorActive : colorInactive}
                className="transition-all duration-300"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
