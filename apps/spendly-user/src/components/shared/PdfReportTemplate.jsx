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

  return (
    <div className="fixed top-[-9999px] left-[-9999px]">
      <div ref={ref} className="w-[800px] bg-white p-12 text-gray-900 font-sans">
        {/* Header */}
        <div className="flex justify-between items-end border-b-2 border-purple-600 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-xl">S</div>
              <h1 className="text-2xl font-black tracking-widest uppercase text-purple-600">Spendly</h1>
            </div>
            <h2 className="text-3xl font-bold">Financial Report</h2>
            <p className="text-gray-500 mt-1 font-medium">Period: {filterName}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Generated on</p>
            <p className="font-semibold">{format(new Date(), 'MMM dd, yyyy')}</p>
          </div>
        </div>

        {/* High Level Stats */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <p className="text-gray-500 text-sm font-semibold uppercase mb-2">Total Spent</p>
            <p className="text-3xl font-bold text-red-500">{formatMoney(spent, currency)}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <p className="text-gray-500 text-sm font-semibold uppercase mb-2">Total Received</p>
            <p className="text-3xl font-bold text-green-500">{formatMoney(received, currency)}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <p className="text-gray-500 text-sm font-semibold uppercase mb-2">Total Saved</p>
            <p className="text-3xl font-bold text-purple-600">{formatMoney(Math.max(saved, 0), currency)}</p>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <h3 className="text-lg font-bold border-b pb-2 mb-4">Key Insights</h3>
            <ul className="space-y-4">
              <li className="flex justify-between">
                <span className="text-gray-600">Savings Rate</span>
                <span className="font-bold">{savingsRate}%</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Daily Average Spend</span>
                <span className="font-bold">{formatMoney(dailyAvg, currency)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Top Spending Category</span>
                <span className="font-bold capitalize">{topCategory || 'N/A'}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Biggest Purchase</span>
                <span className="font-bold">{biggestPurchase || 'N/A'}</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold border-b pb-2 mb-4">Category Breakdown</h3>
            <ul className="space-y-3">
              {grouped.slice(0, 5).map(g => (
                <li key={g.category} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{g.emoji}</span>
                    <span className="capitalize text-gray-700">{g.category}</span>
                  </div>
                  <span className="font-bold">{formatMoney(g.total, currency)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Top Expenses List */}
        <div>
          <h3 className="text-lg font-bold border-b pb-2 mb-4">Top 10 Expenses</h3>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 font-medium">Category</th>
                <th className="pb-2 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {topExpenses.map((e, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-3 text-gray-600">{format(new Date(e.date), 'MMM dd')}</td>
                  <td className="py-3 font-semibold">{e.shopName}</td>
                  <td className="py-3 capitalize text-gray-600">{e.category}</td>
                  <td className="py-3 text-right font-bold text-red-500">
                    {formatMoney(e.amount, currency)}
                  </td>
                </tr>
              ))}
              {topExpenses.length === 0 && (
                <tr><td colSpan="4" className="py-4 text-center text-gray-400">No expenses recorded.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t text-center text-gray-400 text-sm">
          Strictly private & confidential. Generated locally by Spendly.
        </div>
      </div>
    </div>
  )
})
