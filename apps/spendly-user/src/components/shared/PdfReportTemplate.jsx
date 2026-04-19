import { forwardRef } from 'react'
import { format } from 'date-fns'
import { formatMoney } from '../../utils/formatMoney'

export const PdfReportTemplate = forwardRef(({ data, currency }, ref) => {
  if (!data) return <div ref={ref} className="hidden" />

  const {
    filterName,
    spent,
    received,
    saved,
    savingsRate,
    topCategory,
    biggestPurchase,
    dailyAvg,
    expenses,
    grouped
  } = data

  const topExpenses = [...expenses]
    .filter(e => e.type === 'spent')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10)

  const S = { fontFamily: "'Inter', sans-serif" }
  const SORA = { fontFamily: "'Sora', sans-serif" }

  return (
    <div className="fixed top-[-9999px] left-[-9999px]">
      <div ref={ref} className="w-[850px] bg-white p-16 text-black border border-[#EEEEEE]" style={S}>
        
        {/* Header */}
        <div className="flex justify-between items-end border-b-4 border-black pb-8 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black flex items-center justify-center text-white font-[900] text-2xl tracking-tighter rounded-xl">S</div>
              <h1 className="text-3xl font-[900] tracking-widest uppercase text-black" style={SORA}>SPENDLY</h1>
            </div>
            <h2 className="text-4xl font-[900] tracking-tighter" style={SORA}>Financial Report</h2>
            <p className="text-[#AFAFAF] mt-2 font-[700] uppercase tracking-widest text-sm">Period: {filterName}</p>
          </div>
          <div className="text-right">
            <p className="text-[#AFAFAF] text-xs font-[800] uppercase tracking-widest">Date of Generation</p>
            <p className="font-[900] text-xl mt-1 tracking-tight" style={SORA}>{format(new Date(), 'dd MMM, yyyy')}</p>
          </div>
        </div>

        {/* High Level Stats */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="bg-[#F8FAFC] p-8 rounded-3xl border border-[#F1F5F9]">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-[14px]">📉</div>
               <p className="text-[#AFAFAF] text-xs font-[800] uppercase tracking-widest">Total Spent</p>
             </div>
             <p className="text-4xl font-[900] tracking-tighter text-black" style={SORA}>{formatMoney(spent, currency)}</p>
          </div>
          <div className="bg-[#F8FAFC] p-8 rounded-3xl border border-[#F1F5F9]">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-[14px]">📈</div>
               <p className="text-[#AFAFAF] text-xs font-[800] uppercase tracking-widest">Total Received</p>
             </div>
             <p className="text-4xl font-[900] tracking-tighter text-black" style={SORA}>{formatMoney(received, currency)}</p>
          </div>
          <div className="bg-black p-8 rounded-3xl shadow-xl">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[14px]">💎</div>
               <p className="text-[#AFAFAF] text-xs font-[800] uppercase tracking-widest">Net Savings</p>
             </div>
             <p className="text-4xl font-[900] tracking-tighter text-white" style={SORA}>{formatMoney(Math.max(saved, 0), currency)}</p>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-2 gap-10 mb-12">
          <div>
            <h3 className="text-lg font-[900] border-b-2 border-[#EEEEEE] pb-3 mb-5 uppercase tracking-widest" style={SORA}>Key Metrics</h3>
            <ul className="space-y-5">
              <li className="flex justify-between items-center border-b border-[#F6F6F6] pb-4">
                <span className="text-[#AFAFAF] font-[700] uppercase tracking-wider text-xs">Savings Rate</span>
                <span className="font-[900] text-lg bg-[#F6F6F6] px-3 py-1 rounded-lg">{savingsRate}%</span>
              </li>
              <li className="flex justify-between items-center border-b border-[#F6F6F6] pb-4">
                <span className="text-[#AFAFAF] font-[700] uppercase tracking-wider text-xs">Daily Average</span>
                <span className="font-[900] text-lg">{formatMoney(dailyAvg, currency)}</span>
              </li>
              <li className="flex justify-between items-center border-b border-[#F6F6F6] pb-4">
                <span className="text-[#AFAFAF] font-[700] uppercase tracking-wider text-xs">Primary Category</span>
                <span className="font-[900] text-lg capitalize">{topCategory || 'N/A'}</span>
              </li>
              <li className="flex justify-between items-center shrink-0">
                <span className="text-[#AFAFAF] font-[700] uppercase tracking-wider text-xs mr-4">Largest Purchase</span>
                <span className="font-[900] text-lg truncate max-w-[200px]">{biggestPurchase || 'N/A'}</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-[900] border-b-2 border-[#EEEEEE] pb-3 mb-5 uppercase tracking-widest" style={SORA}>Distribution</h3>
            <ul className="space-y-4">
              {grouped.slice(0, 5).map(g => (
                <li key={g.category} className="flex justify-between items-center">
                  <div className="flex items-center gap-4 bg-[#F8FAFC] px-4 py-2 rounded-xl flex-1 mr-4">
                    <span className="text-xl">{g.emoji}</span>
                    <span className="capitalize font-[800] text-sm">{g.category}</span>
                  </div>
                  <span className="font-[900] text-lg tracking-tight">{formatMoney(g.total, currency)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Top Expenses List */}
        <div>
          <h3 className="text-lg font-[900] border-b-2 border-[#EEEEEE] pb-3 mb-5 uppercase tracking-widest" style={SORA}>Top Transactions</h3>
          <div className="bg-[#F8FAFC] p-6 rounded-3xl border border-[#F1F5F9]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  <th className="pb-4 font-[800] text-[#AFAFAF] text-xs uppercase tracking-widest">Date</th>
                  <th className="pb-4 font-[800] text-[#AFAFAF] text-xs uppercase tracking-widest">Description</th>
                  <th className="pb-4 font-[800] text-[#AFAFAF] text-xs uppercase tracking-widest">Category</th>
                  <th className="pb-4 font-[800] text-[#AFAFAF] text-xs uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {topExpenses.map((e, i) => (
                  <tr key={i} className={`border-b border-[#F1F5F9] last:border-0`}>
                    <td className="py-4 font-[700] text-black text-sm uppercase">{format(new Date(e.date), 'MMM dd')}</td>
                    <td className="py-4 font-[900] text-black text-sm">{e.shopName}</td>
                    <td className="py-4 font-[700] text-[#AFAFAF] text-sm uppercase">{e.category}</td>
                    <td className="py-4 text-right font-[900] text-lg tracking-tight" style={SORA}>
                      {formatMoney(e.amount, currency)}
                    </td>
                  </tr>
                ))}
                {topExpenses.length === 0 && (
                  <tr><td colSpan="4" className="py-8 text-center font-[700] text-[#AFAFAF]">No significant transactions recorded.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t-2 border-[#EEEEEE] flex justify-between items-center text-[#AFAFAF] text-xs font-[700] uppercase tracking-widest">
           <span>Strictly private & confidential</span>
           <span>Generated by Spendly Finance Engine</span>
        </div>
      </div>
    </div>
  )
})
