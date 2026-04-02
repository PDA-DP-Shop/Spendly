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
import { Download, Loader2 } from 'lucide-react'

const FILTERS = ['This Week', 'This Month', '3 Months', 'All Time']
const S = { fontFamily: "'Plus Jakarta Sans', sans-serif" }

function WhiteCard({ title, children }) {
  return (
    <div className="mx-5 mb-4 p-5" style={{ background: '#FFFFFF', border: '1px solid #F0F0F8', borderRadius: '20px', boxShadow: '0 2px 16px rgba(99,102,241,0.07)' }}>
      {title && (
        <p className="text-[12px] font-semibold uppercase tracking-wider text-[#94A3B8] mb-4" style={S}>{title}</p>
      )}
      {children}
    </div>
  )
}

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

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const key = format(subMonths(now, 11 - i), 'yyyy-MM')
    return calculateSpent(expenses.filter(e => e.date?.startsWith(key)))
  })
  const sixMonthData = Array.from({ length: 6 }, (_, i) => {
    const key = format(subMonths(now, 5 - i), 'yyyy-MM')
    return calculateSpent(expenses.filter(e => e.date?.startsWith(key)))
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
    <div className="flex flex-col min-h-dvh mb-tab bg-[#F8F9FF]">
      {/* Header */}
      <div className="flex items-center justify-between pr-5 bg-white" style={{ borderBottom: '1px solid #F0F0F8' }}>
        <TopHeader title="Analytics" onBack={null} />
        <motion.button whileTap={{ scale: 0.9 }} onClick={handleExportPdf} disabled={exporting}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: '#EEF2FF', border: '1px solid rgba(99,102,241,0.2)' }}>
          {exporting
            ? <Loader2 className="w-5 h-5 text-[#6366F1] animate-spin" />
            : <Download className="w-5 h-5 text-[#6366F1]" />}
        </motion.button>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2.5 px-5 py-4 overflow-x-auto scrollbar-hide bg-white border-b border-[#F0F0F8]">
        {FILTERS.map(f => (
          <motion.button key={f} whileTap={{ scale: 0.95 }} onClick={() => setFilter(f)}
            className="px-5 py-2.5 rounded-full text-[13px] font-semibold whitespace-nowrap flex-shrink-0 transition-all"
            style={{
              background: filter === f ? '#6366F1' : '#FFFFFF',
              color: filter === f ? '#FFFFFF' : '#64748B',
              border: `1px solid ${filter === f ? '#6366F1' : '#E2E8F0'}`,
              ...S
            }}>
            {f}
          </motion.button>
        ))}
      </div>

      {/* Stats row */}
      <div className="flex gap-3 px-5 pt-5 pb-2">
        {[
          { label: 'Spent', value: spent, color: '#F43F5E', bg: '#FFF1F2' },
          { label: 'Income', value: received, color: '#10B981', bg: '#ECFDF5' },
          { label: 'Saved', value: Math.max(saved, 0), color: '#6366F1', bg: '#EEF2FF' },
        ].map(item => (
          <div key={item.label} className="flex-1 p-4 rounded-[16px] text-center"
            style={{ background: item.bg, border: `1px solid ${item.color}20` }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: item.color, ...S }}>{item.label}</p>
            <p className="text-[15px] font-bold" style={{ color: '#0F172A', ...S }}>{formatMoney(item.value, currency)}</p>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState type="reports" title="No data yet" message="Add expenses to see your analytics." />
      ) : (
        <div className="pb-4 mt-4">
          <WhiteCard title="Spending by Category">
            <SpendingDonutChart groupedData={grouped} currency={currency} />
          </WhiteCard>
          <WhiteCard title="Payment Methods">
            <PaymentMethodChart expenses={filtered} />
          </WhiteCard>
          <WhiteCard title="Monthly Spending">
            <AnalyticsBarChart data={monthlyData} currency={currency} />
          </WhiteCard>
          <WhiteCard title="6-Month Trend">
            <MonthlyLineChart monthlyTotals={sixMonthData} currency={currency} />
          </WhiteCard>

          {/* Stats grid */}
          <div className="mx-5 grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'Top Category', value: topCategory ? topCategory.category : 'N/A', icon: '🏆', color: '#6366F1', bg: '#EEF2FF' },
              { label: 'Biggest Buy', value: biggestPurchase ? biggestPurchase.shopName : 'N/A', icon: '💎', color: '#F43F5E', bg: '#FFF1F2' },
              { label: 'Daily Average', value: formatMoney(dailyAvg, currency), icon: '🔥', color: '#F59E0B', bg: '#FFFBEB' },
              { label: 'Savings Rate', value: `${savingsRate}%`, icon: '📈', color: '#10B981', bg: '#ECFDF5' },
            ].map(stat => (
              <div key={stat.label} className="p-4 rounded-[16px]"
                style={{ background: '#FFFFFF', border: '1px solid #F0F0F8', boxShadow: '0 2px 12px rgba(99,102,241,0.05)' }}>
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg mb-3" style={{ background: stat.bg }}>{stat.icon}</div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8] mb-1" style={S}>{stat.label}</p>
                <p className="text-[15px] font-bold capitalize truncate" style={{ color: stat.color, ...S }}>{stat.value}</p>
              </div>
            ))}
          </div>

          <WhiteCard title="Spending Heatmap">
            <SpendingHeatmap expenses={filtered} currency={currency} />
          </WhiteCard>
          <WhiteCard title="Year vs Last Year">
            <YearComparisonChart currentYearTotals={currentYearTotals} prevYearTotals={prevYearTotals} currency={currency} />
          </WhiteCard>
          <WhiteCard title="Day of Week">
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
