import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subMonths } from 'date-fns'
import { formatMoneyCompact } from '../../utils/formatMoney'

export default function MonthlyLineChart({ monthlyTotals, currency = 'USD' }) {
  const chartData = Array.from({ length: 6 }, (_, i) => ({
    month: format(subMonths(new Date(), 5 - i), 'MMM'),
    amount: monthlyTotals?.[i] || 0
  }))

  const CustomTooltip = ({ active, payload }) => {
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

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-[14px] font-display font-bold text-[#F0F4FF] tracking-tight">Liquidity Flow</h4>
        <div className="flex items-center gap-1.5 self-center">
          <div className="w-2 h-2 rounded-full bg-cyan-glow shadow-glowSmall" />
          <p className="text-[11px] font-body font-bold text-[#7B8DB0]">Growth Rate</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="lineColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#3D4F70', fontFamily: 'Satoshi, sans-serif', fontWeight: 700 }} 
            dy={10}
          />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3D4F70', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#00D4FF"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#lineColor)"
            animationBegin={300}
            animationDuration={2000}
            activeDot={{ r: 6, fill: '#00D4FF', stroke: '#050B18', strokeWidth: 3, shadow: '0 0 10px #00D4FF' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
