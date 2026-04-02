import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { PAYMENT_METHODS } from '../../constants/paymentMethods'
import { CHART_COLORS } from '../../constants/colors'

export default function PaymentMethodChart({ expenses }) {
  const methodTotals = {}
  let total = 0
  const S = { fontFamily: 'Nunito' }

  expenses.forEach(e => {
    if (e.type !== 'spent') return
    const method = e.paymentMethod || 'UPI' // Fallback
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
      color: CHART_COLORS[index % CHART_COLORS.length]
    }
  }).sort((a, b) => b.value - a.value)

  return (
    <div className="w-full">
      <div className="flex items-center gap-6">
        <div className="w-[140px] h-[140px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value" stroke="none">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(val) => Math.round((val/total)*100) + '%'} 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', fontFamily: 'Nunito', fontWeight: 800 }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex-1 space-y-3">
          {data.slice(0, 4).map((entry, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-[13px] font-[700] text-[#475569] truncate" style={S}>{entry.icon} {entry.name}</span>
              </div>
              <span className="text-[14px] font-[800] text-[#0F172A] ml-2" style={S}>
                {Math.round((entry.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
