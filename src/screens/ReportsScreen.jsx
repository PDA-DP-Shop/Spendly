// Reports screen — white premium analytics dashboard
import { useState, useRef } from 'react'
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
import { Download, Loader2, Sparkles, PieChart, BarChart3, TrendingUp, Calendar, Zap, Shield, Target } from 'lucide-react'
import SalaryExpenseCards from '../components/cards/SalaryExpenseCards'

const FILTERS = ['This Week', 'This Month', '3 Months', 'All Time']

const HAPTIC_SHAKE = {
  tap: { 
    x: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.35, ease: "easeInOut" }
  }
}

function WhiteCard({ title, children }) {
  const S = { fontFamily: "'Inter', sans-serif" }
  return (
    <div className="mx-6 mb-6 p-7 bg-white border border-[#EEEEEE] rounded-[24px] shadow-sm">
      {title && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-[13px] font-[800] text-black tracking-tight" style={S}>{title}</p>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20" />
        </div>
      )}
      {children}
    </div>
  )
}

export default function ReportsScreen() {
  const [filter, setFilter] = useState('This Month')
  const [chartMode, setChartMode] = useState('expense') // 'income' | 'expense'
  const [exporting, setExporting] = useState(false)
  const reportRef = useRef(null)

  const { expenses } = useExpenses()
  const { settings } = useSettingsStore()
  const currency = settings?.currency || 'USD'
  const S = { fontFamily: "'Inter', sans-serif" }

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

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const key = format(subMonths(now, 11 - i), 'yyyy-MM')
    return calculateSpent(expenses.filter(e => e.date?.startsWith(key)))
  })
  
  const incomeData = Array.from({ length: 12 }, (_, i) => {
    const key = format(subMonths(now, 11 - i), 'yyyy-MM')
    return calculateReceived(expenses.filter(e => e.date?.startsWith(key)))
  })

  const currentYearTotals = Array.from({ length: 12 }, (_, i) => {
    const key = format(new Date(now.getFullYear(), i, 1), 'yyyy-MM')
    return calculateSpent(expenses.filter(e => e.date?.startsWith(key)))
  })
  const prevYearTotals = Array.from({ length: 12 }, (_, i) => {
    const key = format(new Date(now.getFullYear() - 1, i, 1), 'yyyy-MM')
    return calculateSpent(expenses.filter(e => e.date?.startsWith(key)))
  })

  const topCategory = grouped[0]
  const biggestPurchase = filtered.filter(e => e.type === 'spent').sort((a, b) => b.amount - a.amount)[0]
  const dailyAvg = filtered.length > 0 ? spent / 30 : 0

  const handleExportPdf = async () => {
    if (!reportRef.current) return
    setExporting(true)
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Spendly_Report_${filter.replace(' ', '_')}.pdf`)
    } catch (e) { console.error("PDF Export failed:", e) }
    finally { setExporting(false) }
  }

  return (
    <div className="flex flex-col min-h-dvh mb-tab bg-white safe-top">
      <div className="bg-white sticky top-0 z-50 border-b border-[#F6F6F6]">
        <TopHeader 
          title="Analytics" 
          showBell={true}
          rightElement={
            <motion.button variants={HAPTIC_SHAKE} whileTap="tap"
              onClick={handleExportPdf} disabled={exporting}
              className="w-11 h-11 rounded-full flex items-center justify-center bg-[#F6F6F6] border border-[#EEEEEE] ml-2"
            >
              {exporting
                ? <Loader2 className="w-5 h-5 text-black animate-spin" strokeWidth={2.5} />
                : <Download className="w-5 h-5 text-black" strokeWidth={2.5} />}
            </motion.button>
          }
        />
      </div>

      <div className="flex gap-3 px-6 py-5 overflow-x-auto scrollbar-hide bg-white border-b border-[#F6F6F6] sticky top-[64px] z-20">
        {FILTERS.map(f => (
          <motion.button key={f} variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => setFilter(f)}
            className={`px-6 py-2.5 rounded-full text-[13px] font-[700] whitespace-nowrap flex-shrink-0 transition-all border ${
              filter === f ? 'bg-black text-white border-black shadow-md' : 'bg-[#F6F6F6] text-[#AFAFAF] border-transparent'
            }`}
            style={S}>
            {f}
          </motion.button>
        ))}
      </div>

      <div className="pt-8 pb-4">
        <SalaryExpenseCards income={received} expense={spent} currency={currency} />
      </div>

      {filtered.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-20">
            <EmptyState type="reports" title="No data yet" message="Add some transactions to see your financial breakdown." />
        </div>
      ) : (
        <div className="pb-16 mt-4">
          <WhiteCard title="Spending by Category">
            <SpendingDonutChart groupedData={grouped} currency={currency} />
          </WhiteCard>

          <WhiteCard title="Payment Methods">
            <PaymentMethodChart expenses={filtered} />
          </WhiteCard>

          <WhiteCard title="Spending Trends">
            <div className="flex bg-[#F6F6F6] border border-[#EEEEEE] p-1.5 rounded-full mb-8">
              <motion.button variants={HAPTIC_SHAKE} whileTap="tap"
                className={`flex-1 py-3 text-[12px] font-[700] rounded-full transition-all ${chartMode === 'expense' ? 'bg-white text-black shadow-sm border border-[#EEEEEE]' : 'text-[#AFAFAF]'}`}
                style={S} onClick={() => setChartMode('expense')}>
                Expenses
              </motion.button>
              <motion.button variants={HAPTIC_SHAKE} whileTap="tap"
                className={`flex-1 py-3 text-[12px] font-[700] rounded-full transition-all ${chartMode === 'income' ? 'bg-white text-black shadow-sm border border-[#EEEEEE]' : 'text-[#AFAFAF]'}`}
                style={S} onClick={() => setChartMode('income')}>
                Income
              </motion.button>
            </div>
            <AnalyticsBarChart data={chartMode === 'expense' ? monthlyData : incomeData} currency={currency} chartMode={chartMode} />
          </WhiteCard>

          <div className="mx-6 grid grid-cols-2 gap-4 mb-8">
            {[
              { label: 'Top Category', value: topCategory ? topCategory.category : 'N/A', icon: PieChart, color: 'text-blue-500' },
              { label: 'Largest Expense', value: biggestPurchase ? biggestPurchase.shopName : 'N/A', icon: Zap, color: 'text-amber-500' },
              { label: 'Daily Average', value: formatMoney(dailyAvg, currency), icon: BarChart3, color: 'text-emerald-500' },
              { label: 'Savings Rate', value: `${savingsRate}%`, icon: Target, color: 'text-indigo-500' },
            ].map(stat => (
              <motion.div key={stat.label} variants={HAPTIC_SHAKE} whileTap="tap"
                className="p-6 rounded-[28px] border border-[#EEEEEE] bg-white shadow-sm flex flex-col">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-[#F6F6F6] mb-5 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <p className="text-[12px] font-[600] text-[#AFAFAF] mb-1" style={S}>{stat.label}</p>
                <p className="text-[15px] font-[800] text-black tracking-tight truncate uppercase" style={S}>{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <WhiteCard title="Spending Heatmap">
            <SpendingHeatmap expenses={filtered} currency={currency} />
          </WhiteCard>
          
          <WhiteCard title="Year Comparison">
            <YearComparisonChart currentYearTotals={currentYearTotals} prevYearTotals={prevYearTotals} currency={currency} />
          </WhiteCard>
          
          <WhiteCard title="Activity by Weekday">
            <WeekdayChart rawExpenses={filtered} currency={currency} />
          </WhiteCard>
        </div>
      )}

      <PdfReportTemplate
        ref={reportRef}
        currency={currency}
        data={{ filterName: filter, spent, received, saved, savingsRate, topCategory: topCategory ? topCategory.category : 'None', biggestPurchase: biggestPurchase ? biggestPurchase.shopName : 'None', dailyAvg, expenses: filtered, grouped }}
      />
    </div>
  )
}
