import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subMonths } from 'date-fns'
import { formatMoneyCompact } from '../../utils/formatMoney'

export default function MonthlyLineChart({ monthlyTotals, currency = 'USD' }) {
  const chartData = Array.from({ length: 6 }, (_, i) => ({
    month: format(subMonths(new Date(), 5 - i), 'MMM'),
    amount: monthlyTotals?.[i] || 0
  }))

  const S = { fontFamily: 'Nunito' }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-2.5 rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-[#F0F0F8]">
          <p className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-1" style={S}>{payload[0].payload.month}</p>
          <p className="text-[16px] font-[800] text-[var(--primary)]" style={S}>{formatMoneyCompact(payload[0].value, currency)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <p className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-wider mb-0.5" style={S}>Trajectory</p>
          <h4 className="text-[16px] font-[800] text-[#0F172A] tracking-tight" style={S}>Balance Flow</h4>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F8F7FF] rounded-full border border-[#F0F0F8]">
          <div className="w-2 h-2 rounded-full bg-[var(--primary)] shadow-sm" />
          <p className="text-[11px] font-[800] text-[var(--primary)] uppercase" style={S}>Monthly</p>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="lineColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: '#CBD5E1', fontFamily: 'Nunito, sans-serif', fontWeight: 700 }} 
            dy={15}
          />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#F1F5F9', strokeWidth: 2 }} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="var(--primary)"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#lineColor)"
            animationBegin={0}
            animationDuration={1500}
            activeDot={{ r: 6, fill: 'var(--primary)', stroke: '#FFFFFF', strokeWidth: 3, shadow: '0 4px 12px rgba(124,111,247,0.3)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
