import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatMoneyCompact } from '../../utils/formatMoney'

const S = { fontFamily: 'Inter' }

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black px-6 py-4 rounded-[24px] shadow-2xl border border-white/10">
        <p className="text-[10px] font-[900] text-[#AFAFAF] uppercase tracking-[0.2em] mb-4" style={S}>{label.toUpperCase()}</p>
        <div className="flex items-center justify-between gap-8 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-white" />
            <span className="text-[13px] font-[900] text-white uppercase tracking-[0.05em]" style={S}>Current</span>
          </div>
          <span className="text-[15px] font-[900] text-white" style={S}>{formatMoneyCompact(payload[0].value, currency)}</span>
        </div>
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#333333]" />
            <span className="text-[13px] font-[900] text-[#AFAFAF] uppercase tracking-[0.05em]" style={S}>Previous</span>
          </div>
          <span className="text-[15px] font-[900] text-[#AFAFAF]" style={S}>{formatMoneyCompact(payload[1].value, currency)}</span>
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

  return (
    <div className="w-full">
      <div className="flex justify-end gap-6 mb-10">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-black shadow-[0_0_8px_rgba(0,0,0,0.3)]" />
          <span className="text-[10px] font-[900] text-black uppercase tracking-[0.2em]" style={S}>Current</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#EEEEEE]" />
          <span className="text-[10px] font-[900] text-[#AFAFAF] uppercase tracking-[0.2em]" style={S}>Previous</span>
        </div>
      </div>
      
      <div className="h-[240px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%" debounce={1}>
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barGap={6}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#AFAFAF', fontFamily: 'Inter', fontWeight: 900 }} dy={20} />
            <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: '#F6F6F6', radius: 4 }} />
            <Bar dataKey="thisYear" fill="#000000" radius={[2, 2, 0, 0]} barSize={8} animationDuration={1200} />
            <Bar dataKey="lastYear" fill="#EEEEEE" radius={[2, 2, 0, 0]} barSize={8} animationDuration={1200} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
