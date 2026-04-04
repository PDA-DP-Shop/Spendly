import { BarChart, Bar, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatMoneyCompact } from '../../utils/formatMoney'

const S = { fontFamily: "'Inter', sans-serif" }

export default function WeekdayChart({ rawExpenses, currency }) {
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
    return { name: name.toUpperCase(), avg, total: totals[jsIndex], isWeekend: name === 'Sat' || name === 'Sun' }
  })

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload
      return (
        <div className="bg-black px-5 py-3 rounded-full shadow-2xl border border-white/10">
          <p className="text-[10px] font-[900] text-[#AFAFAF] uppercase tracking-[0.2em] mb-1" style={S}>{d.name} Average</p>
          <p className="text-[15px] font-[900] text-white" style={S}>
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
      <div className="flex items-center justify-between mb-10">
          <div className="flex flex-col">
            <p className="text-[10px] font-[900] text-[#AFAFAF] uppercase tracking-[0.2em] mb-1" style={S}>Intensity Load</p>
            <h4 className="text-[18px] font-[900] text-black tracking-tight" style={S}>Average Consumption</h4>
          </div>
        <div className="bg-black border border-black text-white px-5 py-2.5 rounded-full text-[10px] font-[900] uppercase tracking-[0.2em] shadow-xl shadow-black/20" style={S}>
          {weekendPct}% Peak
        </div>
      </div>

      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F6F6F6', radius: 10 }} />
            <Bar dataKey="avg" radius={[18, 18, 18, 18]} barSize={34} animationDuration={1200}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.isWeekend ? '#000000' : '#EEEEEE'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between px-3 mt-8">
        {data.map(d => (
          <p key={d.name} className="text-[10px] font-[900] uppercase tracking-[0.2em]" style={{ color: d.isWeekend ? '#000000' : '#AFAFAF', ...S }}>
            {d.name.charAt(0)}
          </p>
        ))}
      </div>
    </div>
  )
}
