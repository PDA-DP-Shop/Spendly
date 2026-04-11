import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subMonths } from 'date-fns'
import { formatMoneyCompact } from '../../utils/formatMoney'

const S = { fontFamily: 'Inter' }

const CustomTooltip = ({ active, payload, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black px-5 py-3 rounded-full shadow-2xl border border-white/10">
        <p className="text-[10px] font-[900] text-[#AFAFAF] uppercase tracking-[0.2em] mb-1" style={S}>{payload[0].payload.month}</p>
        <p className="text-[15px] font-[900] text-white" style={S}>{formatMoneyCompact(payload[0].value, currency)}</p>
      </div>
    )
  }
  return null
}

export default function MonthlyLineChart({ monthlyTotals, currency = 'USD' }) {
  const chartData = Array.from({ length: 6 }, (_, i) => ({
    month: format(subMonths(new Date(), 5 - i), 'MMM').toUpperCase(),
    amount: monthlyTotals?.[i] || 0
  }))

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-10">
        <div className="flex flex-col">
          <p className="text-[10px] font-[900] text-[#AFAFAF] uppercase tracking-[0.2em] mb-1" style={S}>Trajectory</p>
          <h4 className="text-[18px] font-[900] text-black tracking-tight" style={S}>Balance Flow</h4>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[#F6F6F6] rounded-full border border-[#EEEEEE]">
          <div className="w-2 h-2 rounded-full bg-black shadow-[0_0_8px_rgba(0,0,0,0.3)]" />
          <p className="text-[10px] font-[900] text-black uppercase tracking-[0.1em]" style={S}>Series A</p>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="lineColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#000000" stopOpacity={0.10} />
              <stop offset="95%" stopColor="#000000" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 9, fill: '#AFAFAF', fontFamily: 'Inter', fontWeight: 900 }} 
            dy={20}
          />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ stroke: '#EEEEEE', strokeWidth: 2 }} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#000000"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#lineColor)"
            animationBegin={0}
            animationDuration={1200}
            activeDot={{ r: 6, fill: '#000000', stroke: '#FFFFFF', strokeWidth: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
