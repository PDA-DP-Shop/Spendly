import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatMoneyCompact } from '../../utils/formatMoney'

export default function YearComparisonChart({ currentYearTotals, prevYearTotals, currency }) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const S = { fontFamily: 'Nunito' }
  
  const data = months.map((m, i) => ({
    name: m,
    thisYear: currentYearTotals[i] || 0,
    lastYear: prevYearTotals[i] || 0,
  }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-[#F0F0F8]">
          <p className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-3" style={S}>{label}</p>
          <div className="flex items-center justify-between gap-6 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />
              <span className="text-[13px] font-[700] text-[#475569]" style={S}>This Year</span>
            </div>
            <span className="text-[14px] font-[800] text-[#0F172A]" style={S}>{formatMoneyCompact(payload[0].value, currency)}</span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#E0E7FF]" />
              <span className="text-[13px] font-[700] text-[#94A3B8]" style={S}>Last Year</span>
            </div>
            <span className="text-[14px] font-[800] text-[#94A3B8]" style={S}>{formatMoneyCompact(payload[1].value, currency)}</span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full">
      <div className="flex justify-end gap-5 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] shadow-sm" />
          <span className="text-[11px] font-[800] text-[var(--primary)] uppercase tracking-wider" style={S}>This Year</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E0E7FF]" />
          <span className="text-[11px] font-[800] text-[#CBD5E1] uppercase tracking-wider" style={S}>Last Year</span>
        </div>
      </div>
      
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#CBD5E1', fontFamily: 'Nunito', fontWeight: 700 }} dy={15} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124, 111, 247, 0.03)' }} />
            <Bar dataKey="thisYear" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={10} animationDuration={1500} />
            <Bar dataKey="lastYear" fill="#E0E7FF" radius={[4, 4, 0, 0]} barSize={10} animationDuration={1500} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
