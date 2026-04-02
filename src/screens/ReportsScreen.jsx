// Reports screen — spending analytics with charts, filter chips, and stats grid
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
    <div className="flex flex-col min-h-dvh mb-tab">
      <div className="flex items-center justify-between pr-6 relative z-10">
        <TopHeader title="Analytics" />
        <motion.button 
          whileTap={{ scale: 0.9 }} 
          onClick={handleExportPdf} 
          disabled={exporting}
          className="w-12 h-12 mt-1 rounded-2xl glass border-white/5 flex items-center justify-center shadow-glow transition-all active:shadow-none"
        >
          {exporting ? (
            <Loader2 className="w-5 h-5 text-cyan-glow animate-spin" />
          ) : (
            <Download className="w-5 h-5 text-cyan-glow" />
          )}
        </motion.button>
      </div>

      {/* Filter chips */}
      <div className="flex gap-3 px-6 pb-6 overflow-x-auto scrollbar-hide relative z-10">
        {FILTERS.map(f => (
          <motion.button key={f} whileTap={{ scale: 0.95 }} onClick={() => setFilter(f)}
            className={`px-6 py-3 rounded-xl text-[13px] font-body font-bold whitespace-nowrap flex-shrink-0 transition-all duration-300 border ${
              filter === f 
                ? 'bg-cyan-dim border-cyan-glow/30 text-cyan-glow shadow-glowSmall' 
                : 'glass border-transparent text-[#7B8DB0] hover:bg-white/5'
            }`}>
            {f}
          </motion.button>
        ))}
      </div>

      {/* Summary 3-card row */}
      <div className="flex gap-3 px-6 mb-8 relative z-10">
        {[
          { label: 'Outflow', value: spent, color: 'text-expense', accent: '#FF4D6D' },
          { label: 'Inflow', value: received, color: 'text-income', accent: '#00FF87' },
          { label: 'Reserve', value: Math.max(saved, 0), color: 'text-cyan-glow', accent: '#00D4FF' },
        ].map(item => (
          <div key={item.label} className="flex-1 glass-elevated border-white/5 rounded-2xl p-4 text-center relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full blur-[20px]" style={{ backgroundColor: `${item.accent}10` }} />
            <p className="text-[10px] font-display font-bold text-[#7B8DB0] uppercase tracking-[0.1em] mb-2">{item.label}</p>
            <p className={`text-[15px] font-display font-bold ${item.color} leading-tight`}>{formatMoney(item.value, currency)}</p>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState type="reports" title="Data Analysis Unavailable" message="Execute more financial activities to generate predictive insights." />
      ) : (
        <div className="pb-tab space-y-6">
          <div className="mx-6 glass border-white/5 rounded-[28px] p-6 shadow-glowLg">
            <p className="text-[12px] font-display font-bold text-[#7B8DB0] uppercase tracking-[0.1em] mb-4">Allocation by Category</p>
            <SpendingDonutChart groupedData={grouped} currency={currency} />
          </div>

          <div className="mx-6 glass border-white/5 rounded-[28px] p-6 shadow-glowLg">
            <p className="text-[12px] font-display font-bold text-[#7B8DB0] uppercase tracking-[0.1em] mb-4">Payment Infrastructure</p>
            <PaymentMethodChart expenses={filtered} />
          </div>
          
          <div className="mx-6 glass border-white/5 rounded-[28px] p-6 shadow-glowLg">
            <p className="text-[12px] font-display font-bold text-[#7B8DB0] uppercase tracking-[0.1em] mb-4">Inflow Trajectory</p>
            <AnalyticsBarChart data={monthlyData} currency={currency} />
          </div>

          <div className="mx-6 glass border-white/5 rounded-[28px] p-6 shadow-glowLg">
            <p className="text-[12px] font-display font-bold text-[#7B8DB0] uppercase tracking-[0.1em] mb-4">6-Month Liquidity Trend</p>
            <MonthlyLineChart monthlyTotals={sixMonthData} currency={currency} />
          </div>

          {/* Stats grid */}
          <div className="mx-6 grid grid-cols-2 gap-4">
            {[
              { label: 'Dominant Category', value: topCategory ? topCategory.category : 'N/A', icon: '🏆', color: '#00D4FF' },
              { label: 'Major Acquisition', value: biggestPurchase ? biggestPurchase.shopName : 'N/A', icon: '💎', color: '#FF4D6D' },
              { label: 'Daily Burn Rate', value: formatMoney(dailyAvg, currency), icon: '🔥', color: '#FFB800' },
              { label: 'Efficiency Index', value: `${savingsRate}%`, icon: '📈', color: '#00FF87' },
            ].map(stat => (
              <div key={stat.label} className="glass-elevated border-white/5 rounded-2xl p-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <p className="text-[10px] font-display font-bold text-[#7B8DB0] uppercase tracking-[0.1em] mb-1">{stat.label}</p>
                <p className="text-[16px] font-display font-bold text-[#F0F4FF] capitalize truncate" style={{ color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="mx-6 space-y-6">
            <div className="glass border-white/5 rounded-[28px] p-6 shadow-glowLg">
              <p className="text-[12px] font-display font-bold text-[#7B8DB0] uppercase tracking-[0.1em] mb-4">Financial Heatmap</p>
              <SpendingHeatmap expenses={filtered} currency={currency} />
            </div>
            
            <div className="glass border-white/5 rounded-[28px] p-6 shadow-glowLg">
              <p className="text-[12px] font-display font-bold text-[#7B8DB0] uppercase tracking-[0.1em] mb-4">Yearly Correlation</p>
              <YearComparisonChart currentYearTotals={currentYearTotals} prevYearTotals={prevYearTotals} currency={currency} />
            </div>

            <div className="glass border-white/5 rounded-[28px] p-6 shadow-glowLg">
              <p className="text-[12px] font-display font-bold text-[#7B8DB0] uppercase tracking-[0.1em] mb-4">Temporal Activity</p>
              <WeekdayChart rawExpenses={filtered} currency={currency} />
            </div>
          </div>
        </div>
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
