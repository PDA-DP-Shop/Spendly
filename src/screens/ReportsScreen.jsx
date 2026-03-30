// Reports screen — spending analytics with charts, filter chips, and stats grid
import { useState } from 'react'
import { motion } from 'framer-motion'
import TopHeader from '../components/shared/TopHeader'
import SpendingDonutChart from '../components/charts/SpendingDonutChart'
import AnalyticsBarChart from '../components/charts/AnalyticsBarChart'
import MonthlyLineChart from '../components/charts/MonthlyLineChart'
import EmptyState from '../components/shared/EmptyState'
import { useExpenses } from '../hooks/useExpenses'
import { useSettingsStore } from '../store/settingsStore'
import { calculateSpent, calculateReceived, calculateSavingsRate } from '../utils/calculateTotal'
import { groupByCategory, groupByMonth } from '../utils/groupByCategory'
import { formatMoney } from '../utils/formatMoney'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, parseISO, isWithinInterval } from 'date-fns'
import { format } from 'date-fns'
import SpendingHeatmap from '../components/heatmap/SpendingHeatmap'
import YearComparisonChart from '../components/charts/YearComparisonChart'
import WeekdayChart from '../components/charts/WeekdayChart'
import PaymentMethodChart from '../components/charts/PaymentMethodChart'
import { PdfReportTemplate } from '../components/shared/PdfReportTemplate'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Download, Loader2 } from 'lucide-react'

const FILTERS = ['This Week', 'This Month', '3 Months', 'All Time']

export default function ReportsScreen() {
  const [filter, setFilter] = useState('This Month')
  const [exporting, setExporting] = useState(false)
  const reportRef = useRef(null)
  
  const { expenses } = useExpenses()
  const { settings } = useSettingsStore()
  const currency = settings?.currency || 'USD'

  const now = new Date()
  const filterExpenses = (exps) => {
    const ranges = {
      'This Week': { start: startOfWeek(now), end: endOfWeek(now) },
      'This Month': { start: startOfMonth(now), end: endOfMonth(now) },
      '3 Months': { start: subMonths(now, 3), end: now },
      'All Time': { start: new Date(0), end: now },
    }
    const range = ranges[filter]
    return exps.filter(e => {
      try { return isWithinInterval(parseISO(e.date), range) } catch { return false }
    })
  }

  const filtered = filterExpenses(expenses)
  const spent = calculateSpent(filtered)
  const received = calculateReceived(filtered)
  const saved = received - spent
  const savingsRate = calculateSavingsRate(filtered)
  const grouped = groupByCategory(filtered)

  // 12-month data for bar chart
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const key = format(subMonths(now, 11 - i), 'yyyy-MM')
    const monthExps = expenses.filter(e => e.date?.startsWith(key))
    return calculateSpent(monthExps)
  })

  // 6-month data for line chart
  const sixMonthData = Array.from({ length: 6 }, (_, i) => {
    const key = format(subMonths(now, 5 - i), 'yyyy-MM')
    const monthExps = expenses.filter(e => e.date?.startsWith(key))
    return calculateSpent(monthExps)
  })

  // Full year vs last year (for YearComparisonChart)
  const currentYearTotals = Array.from({ length: 12 }, (_, i) => {
    const key = format(new Date(now.getFullYear(), i, 1), 'yyyy-MM')
    return calculateSpent(expenses.filter(e => e.date?.startsWith(key)))
  })
  
  const prevYearTotals = Array.from({ length: 12 }, (_, i) => {
    const key = format(new Date(now.getFullYear() - 1, i, 1), 'yyyy-MM')
    return calculateSpent(expenses.filter(e => e.date?.startsWith(key)))
  })

  // Stats
  const topCategory = grouped[0]
  const biggestPurchase = filtered.filter(e => e.type === 'spent').sort((a, b) => b.amount - a.amount)[0]
  const dailyAvg = filtered.length > 0 ? spent / 30 : 0

  const handleExportPdf = async () => {
    if (!reportRef.current) return
    setExporting(true)

    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      
      // A4 dimensions: 210 x 297 mm
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Spendly_Report_${filter.replace(' ', '_')}.pdf`)
    } catch (e) {
      console.error("PDF Export failed:", e)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F5F5] dark:bg-[#0F0F1A] mb-tab">
      <div className="flex items-center justify-between pr-4">
        <TopHeader title="Reports" />
        <motion.button whileTap={{ scale: 0.9 }} onClick={handleExportPdf} disabled={exporting}
          className="w-10 h-10 mt-1 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-sm">
          {exporting ? (
            <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
          ) : (
            <Download className="w-5 h-5 text-purple-600" />
          )}
        </motion.button>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
        {FILTERS.map(f => (
          <motion.button key={f} whileTap={{ scale: 0.95 }} onClick={() => setFilter(f)}
            className={`px-5 py-2.5 rounded-full text-[13px] font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
              filter === f ? 'bg-purple-600 text-white shadow-sm' : 'bg-white dark:bg-[#1A1A2E] text-gray-500'
            }`}>
            {f}
          </motion.button>
        ))}
      </div>

      {/* Summary 3-card row */}
      <div className="flex gap-2 px-4 mb-4">
        {[
          { label: 'Spent', value: spent, color: 'text-red-500' },
          { label: 'Received', value: received, color: 'text-green-500' },
          { label: 'Saved', value: Math.max(saved, 0), color: 'text-purple-600' },
        ].map(item => (
          <div key={item.label} className="flex-1 bg-white dark:bg-[#1A1A2E] rounded-2xl p-3 text-center shadow-sm">
            <p className="text-[10px] text-gray-400 uppercase mb-1">{item.label}</p>
            <p className={`text-[14px] font-sora font-bold ${item.color}`}>{formatMoney(item.value, currency)}</p>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState type="reports" title="No data yet" message="Add some expenses to see your spending reports" />
      ) : (
        <>
          <SpendingDonutChart groupedData={grouped} currency={currency} />
          <PaymentMethodChart expenses={filtered} />
          
          <div className="mt-4">
            <AnalyticsBarChart data={monthlyData} currency={currency} />
          </div>
          <div className="mt-4">
            <MonthlyLineChart monthlyTotals={sixMonthData} currency={currency} />
          </div>

          {/* Stats grid */}
          <div className="mx-4 mt-6 mb-4 grid grid-cols-2 gap-3">
            {[
              { label: '🏆 Top Category', value: topCategory ? topCategory.category : 'None' },
              { label: '💸 Biggest Buy', value: biggestPurchase ? biggestPurchase.shopName : 'None' },
              { label: '📅 Daily Average', value: formatMoney(dailyAvg, currency) },
              { label: '💰 Savings Rate', value: `${savingsRate}%` },
            ].map(stat => (
              <div key={stat.label} className="bg-white dark:bg-[#1A1A2E] rounded-2xl p-4 shadow-sm">
                <p className="text-[12px] text-gray-400 mb-1">{stat.label}</p>
                <p className="text-[16px] font-sora font-bold text-gray-900 dark:text-white capitalize">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="mx-4 mt-2 flex flex-col gap-4">
            <SpendingHeatmap expenses={filtered} currency={currency} />
            <YearComparisonChart currentYearTotals={currentYearTotals} prevYearTotals={prevYearTotals} currency={currency} />
            <WeekdayChart rawExpenses={filtered} currency={currency} />
          </div>
        </>
      )}

      {/* Hidden PDF Template */}
      <PdfReportTemplate 
        ref={reportRef} 
        currency={currency} 
        data={{
          filterName: filter,
          spent,
          received,
          saved,
          savingsRate,
          topCategory: topCategory ? topCategory.category : 'None',
          biggestPurchase: biggestPurchase ? biggestPurchase.shopName : 'None',
          dailyAvg,
          expenses: filtered,
          grouped
        }} 
      />
    </div>
  )
}
