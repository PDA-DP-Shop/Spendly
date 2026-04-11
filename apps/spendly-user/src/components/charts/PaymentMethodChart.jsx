import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { PAYMENT_METHODS } from '../../constants/paymentMethods'
const MONOCHROME_COLORS = ['#000000', '#333333', '#666666', '#999999', '#CCCCCC']

export default function PaymentMethodChart({ expenses }) {
  const methodTotals = {}
  let total = 0
  const S = { fontFamily: "'Inter', sans-serif" }

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
      color: MONOCHROME_COLORS[index % MONOCHROME_COLORS.length]
    }
  }).sort((a, b) => b.value - a.value)

  return (
    <div className="w-full">
      <div className="flex items-center gap-8">
        <div className="w-[140px] h-[140px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(val) => Math.round((val/total)*100) + '%'} 
                contentStyle={{ 
                  borderRadius: '100px', 
                  border: 'none', 
                  background: '#000000', 
                  color: '#FFFFFF',
                  padding: '8px 16px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)', 
                  fontFamily: 'Inter', 
                  fontWeight: 900,
                  fontSize: '12px'
                }} 
                itemStyle={{ color: '#FFFFFF' }}
                animationDuration={200}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex-1 space-y-4">
          {data.slice(0, 4).map((entry, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-[12px] font-[900] text-black uppercase tracking-[0.05em] truncate" style={S}>{entry.icon} {entry.name}</span>
              </div>
              <span className="text-[13px] font-[900] text-black ml-2" style={S}>
                {Math.round((entry.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
