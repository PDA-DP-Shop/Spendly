import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { PAYMENT_METHODS } from '../../constants/paymentMethods'

const COLORS = ['#7C3AED', '#F97316', '#22C55E', '#06B6D4', '#EC4899', '#EAB308']

export default function PaymentMethodChart({ expenses }) {
  const methodTotals = {}
  let total = 0

  expenses.forEach(e => {
    if (e.type !== 'spent') return
    const method = e.paymentMethod || 'UPI' // Fallback for old data
    methodTotals[method] = (methodTotals[method] || 0) + e.amount
    total += e.amount
  })

  if (total === 0) return null

  const data = Object.keys(methodTotals).map((key, index) => {
    const pmInfo = PAYMENT_METHODS.find(pm => pm.id === key)
    return {
      name: pmInfo ? pmInfo.label : key,
      value: methodTotals[key],
      icon: pmInfo ? pmInfo.icon : '💳',
      color: COLORS[index % COLORS.length]
    }
  }).sort((a, b) => b.value - a.value)

  return (
    <div className="bg-white dark:bg-[#1A1A2E] rounded-[24px] p-5 shadow-sm mt-4">
      <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-4">How I Pay</p>
      
      <div className="flex items-center gap-4">
        <div className="w-[120px] h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value" stroke="none">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => Math.round((val/total)*100) + '%'} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex-1 flex flex-col justify-center gap-2">
          {data.map((entry, i) => (
            <div key={i} className="flex items-center justify-between text-[13px]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-gray-600 dark:text-gray-300 font-medium">{entry.icon} {entry.name}</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                {Math.round((entry.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
