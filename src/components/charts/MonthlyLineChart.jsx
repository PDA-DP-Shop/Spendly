// 6-month spending trend line chart using Recharts
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Dot } from 'recharts'
import { format, subMonths } from 'date-fns'
import { formatMoneyCompact } from '../../utils/formatMoney'

const CustomDot = (props) => {
  const { cx, cy, payload } = props
  return <circle cx={cx} cy={cy} r={5} fill="#7C3AED" stroke="white" strokeWidth={2} />
}

export default function MonthlyLineChart({ monthlyTotals, currency = 'USD' }) {
  const labels = Array.from({ length: 6 }, (_, i) =>
    format(subMonths(new Date(), 5 - i), 'MMM')
  )

  const data = labels.map((m, i) => ({ month: m, amount: monthlyTotals?.[i] || 0 }))

  return (
    <div className="bg-white dark:bg-[#1A1A2E] rounded-[20px] mx-4 p-4 shadow-sm">
      <p className="text-[16px] font-sora font-bold text-gray-900 dark:text-white mb-4">Last 6 Months</p>
      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={data}>
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'DM Sans' }} />
          <YAxis hide />
          <Tooltip
            formatter={v => [formatMoneyCompact(v, currency), 'Spent']}
            contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 12, color: 'white', fontSize: 12 }}
          />
          <Line
            type="monotoneX"
            dataKey="amount"
            stroke="#7C3AED"
            strokeWidth={2.5}
            dot={<CustomDot />}
            activeDot={{ r: 7, fill: '#7C3AED' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
