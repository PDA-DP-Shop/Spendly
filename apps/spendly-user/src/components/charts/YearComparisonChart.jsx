import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import { formatMoneyCompact } from '../../utils/formatMoney'

const S = { fontFamily: "'Inter', sans-serif" }

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/95 backdrop-blur-md px-6 py-5 rounded-[28px] shadow-2xl border border-white/10 ring-1 ring-white/5">
        <p className="text-[10px] font-[900] text-[#AFAFAF] uppercase tracking-[0.25em] mb-4 border-b border-white/5 pb-3" style={S}>
          Benchmark: {label}
        </p>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-10">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
              <span className="text-[13px] font-[800] text-white tracking-wide" style={S}>This Year</span>
            </div>
            <span className="text-[15px] font-[900] text-white" style={S}>{formatMoneyCompact(payload[0].value, currency)}</span>
          </div>
          <div className="flex items-center justify-between gap-10">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#444444]" />
              <span className="text-[13px] font-[800] text-[#AFAFAF] tracking-wide" style={S}>Last Year</span>
            </div>
            <span className="text-[15px] font-[900] text-[#AFAFAF]" style={S}>{formatMoneyCompact(payload[1].value, currency)}</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export default function YearComparisonChart({ currentYearTotals, prevYearTotals, currency }) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  
  const data = months.map((m, i) => ({
    name: m.toUpperCase(),
    thisYear: currentYearTotals[i] || 0,
    lastYear: prevYearTotals[i] || 0,
  }))

  const hasData = data.some(d => d.thisYear > 0 || d.lastYear > 0)

  return (
    <div className="w-full">
      {/* Legend Container */}
      <div className="flex items-center justify-between mb-10 px-1">
        <div className="flex flex-col">
          <p className="text-[10px] font-[900] text-[#AFAFAF] uppercase tracking-[0.2em] mb-1 leading-none" style={S}>Temporal Analysis</p>
          <span className="text-[14px] font-[800] text-black tracking-tight" style={S}>Year over Year</span>
        </div>
        <div className="flex gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-black" />
            <span className="text-[10px] font-[900] text-black uppercase tracking-[0.15em]" style={S}>Current</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#EEEEEE] border border-[#E2E2E2]" />
            <span className="text-[10px] font-[900] text-[#AFAFAF] uppercase tracking-[0.15em]" style={S}>Previous</span>
          </div>
        </div>
      </div>
      
      <div className="h-[280px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%" debounce={1}>
          <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 5 }} barGap={8}>
            <defs>
              <linearGradient id="currentBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#000000" stopOpacity={1} />
                <stop offset="100%" stopColor="#444444" stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#F6F6F6" strokeDasharray="3 0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 9, fill: '#AFAFAF', fontFamily: 'Inter', fontWeight: 900 }} 
              dy={15} 
            />
            <YAxis hide domain={[0, 'auto']} />
            <Tooltip 
              content={<CustomTooltip currency={currency} />} 
              cursor={{ fill: '#F6F6F6', radius: 12, opacity: 0.5 }} 
              animationDuration={200}
            />
            <Bar 
              dataKey="thisYear" 
              fill="url(#currentBar)" 
              radius={[4, 4, 4, 4]} 
              barSize={10} 
              animationDuration={1500}
              animationBegin={100}
            />
            <Bar 
              dataKey="lastYear" 
              fill="#EEEEEE" 
              radius={[4, 4, 4, 4]} 
              barSize={10} 
              animationDuration={1500}
              animationBegin={0}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {!hasData && (
        <div className="text-center py-4">
           <p className="text-[11px] font-[800] text-[#D8D8D8] uppercase tracking-[0.15em]" style={S}>Insufficient comparative data</p>
        </div>
      )}
    </div>
  )
}
