import { BarChart, Bar, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatMoneyCompact } from '../../utils/formatMoney'

export default function WeekdayChart({ rawExpenses, currency }) {
  const S = { fontFamily: 'Nunito' }
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const totals = [0,0,0,0,0,0,0]
  const counts = [0,0,0,0,0,0,0]

  rawExpenses.forEach(e => {
    if (e.type !== 'spent' || !e.date) return
    const d = new Date(e.date).getDay() // 0-6
    totals[d] += e.amount
    counts[d]++
  })

  // Start with Monday
  const orderedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const data = orderedDays.map((name, i) => {
    const jsIndex = i === 6 ? 0 : i + 1
    const avg = counts[jsIndex] > 0 ? totals[jsIndex] / counts[jsIndex] : 0
    return { name, avg, total: totals[jsIndex], isWeekend: name === 'Sat' || name === 'Sun' }
  })

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload
      return (
        <div className="bg-white px-4 py-2.5 rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-[#F0F0F8]">
          <p className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-1" style={S}>{d.name} Average</p>
          <p className="text-[16px] font-[800]" style={{ color: d.isWeekend ? 'var(--secondary)' : 'var(--primary)', ...S }}>
            {formatMoneyCompact(d.avg, currency)}
          </p>
        </div>
      )
    }
    return null
  }

  const weekendTotal = data.filter(d => d.isWeekend).reduce((s, d) => s + d.total, 0)
  const weekdayTotal = data.filter(d => !d.isWeekend).reduce((s, d) => s + d.total, 0)
  const total = weekendTotal + weekdayTotal
  const weekendPct = total > 0 ? Math.round((weekendTotal / total) * 100) : 0

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <p className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-wider mb-0.5" style={S}>Daily Load</p>
            <h4 className="text-[16px] font-[800] text-[#0F172A] tracking-tight" style={S}>Averages</h4>
          </div>
        <div className="bg-[#FFF7F2] border border-[#FFEBE4] text-[var(--secondary)] px-4 py-2 rounded-full text-[11px] font-[800] uppercase tracking-wider" style={S}>
          {weekendPct}% Weekend
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124, 111, 247, 0.02)' }} />
            <Bar dataKey="avg" radius={[12, 12, 12, 12]} barSize={36} animationDuration={1500}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.isWeekend ? 'var(--secondary)' : 'var(--primary)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between px-2 mt-5">
        {data.map(d => (
          <p key={d.name} className="text-[11px] font-[800] uppercase tracking-widest" style={{ color: d.isWeekend ? 'var(--secondary)' : '#CBD5E1', ...S }}>
            {d.name.charAt(0)}
          </p>
        ))}
      </div>
    </div>
  )
}
