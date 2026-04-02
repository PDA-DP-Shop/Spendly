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
import { Download, Loader2, Sparkles } from 'lucide-react'

const FILTERS = ['This Week', 'This Month', '3 Months', 'All Time']
const S = { fontFamily: "'Nunito', sans-serif" }

function WhiteCard({ title, children }) {
  return (
    <div className="mx-5 mb-5 p-6 bg-white border border-[#F0F0F8] rounded-[28px] shadow-[0_4px_24px_rgba(124,111,247,0.04)]">
      {title && (
        <div className="flex items-center justify-between mb-5">
          <p className="text-[13px] font-[800] uppercase tracking-wider text-[#94A3B8]" style={S}>{title}</p>
          <div className="w-1.5 h-1.5 rounded-full bg-[#E2E8F0]" />
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
    <div className="flex flex-col min-h-dvh mb-tab bg-white">
      {/* Header */}
      <div className="bg-white border-b border-[#F0F0F8]">
        <TopHeader 
          title="Analytics" 
          onBack={null} 
          showBell={true}
          rightElement={
            <motion.button 
              whileTap={{ scale: 0.9 }} 
              onClick={handleExportPdf} 
              disabled={exporting}
              className="w-11 h-11 rounded-[16px] flex items-center justify-center bg-[#F8F7FF] border border-[#F0F0F8] shadow-sm ml-2"
            >
              {exporting
                ? <Loader2 className="w-5 h-5 text-[var(--primary)] animate-spin" />
                : <Download className="w-5 h-5 text-[var(--primary)]" />}
            </motion.button>
          }
        />
      </div>

      {/* Filter chips */}
      <div className="flex gap-3 px-5 py-5 overflow-x-auto scrollbar-hide bg-white border-b border-[#F0F0F8]">
        {FILTERS.map(f => (
          <motion.button key={f} whileTap={{ scale: 0.95 }} onClick={() => setFilter(f)}
            className="px-6 py-2.5 rounded-full text-[13px] font-[800] whitespace-nowrap flex-shrink-0 transition-all border"
            style={{
              background: filter === f ? '#EEF2FF' : '#FFFFFF',
              color: filter === f ? 'var(--primary)' : '#94A3B8',
              borderColor: filter === f ? 'var(--primary)' : '#F0F0F8',
              boxShadow: filter === f ? '0 4px 12px rgba(124,111,247,0.15)' : 'none',
              ...S
            }}>
            {f}
          </motion.button>
        ))}
      </div>

      {/* Stats row */}
      <div className="flex gap-4 px-5 pt-6 pb-2">
        <div className="flex-1 p-5 rounded-[28px] flex flex-col justify-between border border-[#F0F0F8]" style={{ background: '#F8F7FF' }}>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center bg-white shadow-sm border border-[#F1F5F9]">
              <span className="text-[14px] text-[var(--primary)] font-bold">↓</span>
            </div>
            <p className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-wider" style={S}>
              Income
            </p>
          </div>
          <p className="text-[22px] font-[800] text-[#0F172A]" style={S}>
            {formatMoney(received, currency)}
          </p>
        </div>

        <div className="flex-1 p-5 rounded-[28px] flex flex-col justify-between border border-[#FFF1EE]" style={{ background: '#FFF7F2' }}>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center bg-white shadow-sm border border-[#FFEBE4]">
              <span className="text-[14px] text-[var(--secondary)] font-bold">↑</span>
            </div>
            <p className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-wider" style={S}>
              Expenses
            </p>
          </div>
          <p className="text-[22px] font-[800] text-[#0F172A]" style={S}>
            {formatMoney(spent, currency)}
          </p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
            <EmptyState type="reports" title="No analytics yet" message="Add some expenses to see your financial health report." />
        </div>
      ) : (
        <div className="pb-8 mt-5">
          <WhiteCard title="Spending by Category">
            <SpendingDonutChart groupedData={grouped} currency={currency} />
          </WhiteCard>

          <WhiteCard title="Payment Methods">
            <PaymentMethodChart expenses={filtered} />
          </WhiteCard>

          <WhiteCard title="Financial Trend">
            <div className="flex bg-[#F8F7FF] border border-[#F0F0F8] p-1.5 rounded-[16px] mb-5">
              <button
                className="flex-1 py-2 text-[13px] font-[800] rounded-[12px] transition-all"
                style={{
                  background: chartMode === 'expense' ? '#FFFFFF' : 'transparent',
                  color: chartMode === 'expense' ? 'var(--secondary)' : '#94A3B8',
                  boxShadow: chartMode === 'expense' ? '0 4px 12px rgba(255,112,67,0.1)' : 'none',
                  ...S
                }}
                onClick={() => setChartMode('expense')}
              >
                Expenses
              </button>
              <button
                className="flex-1 py-2 text-[13px] font-[800] rounded-[12px] transition-all"
                style={{
                  background: chartMode === 'income' ? '#FFFFFF' : 'transparent',
                  color: chartMode === 'income' ? 'var(--primary)' : '#94A3B8',
                  boxShadow: chartMode === 'income' ? '0 4px 12px rgba(124,111,247,0.1)' : 'none',
                  ...S
                }}
                onClick={() => setChartMode('income')}
              >
                Income
              </button>
            </div>
            <AnalyticsBarChart data={chartMode === 'expense' ? monthlyData : incomeData} currency={currency} chartMode={chartMode} />
          </WhiteCard>

          <WhiteCard title="6-Month Evolution">
            <MonthlyLineChart monthlyTotals={sixMonthData} currency={currency} />
          </WhiteCard>

          {/* Stats grid */}
          <div className="mx-5 grid grid-cols-2 gap-4 mb-5">
            {[
              { label: 'Top Category', value: topCategory ? topCategory.category : 'N/A', icon: '🏆', color: 'var(--primary)', bg: '#F8F7FF', border: '#F0F0F8' },
              { label: 'Biggest Buy', value: biggestPurchase ? biggestPurchase.shopName : 'N/A', icon: '💎', color: 'var(--secondary)', bg: '#FFF7F2', border: '#FFEBE4' },
              { label: 'Daily Average', value: formatMoney(dailyAvg, currency), icon: '🔥', color: '#F59E0B', bg: '#FFFBEB', border: '#FEF3C7' },
              { label: 'Savings Rate', value: `${savingsRate}%`, icon: '📈', color: '#10B981', bg: '#ECFDF5', border: '#D1FAE5' },
            ].map(stat => (
              <div key={stat.label} className="p-5 rounded-[24px] border shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
                style={{ background: '#FFFFFF', borderColor: stat.border }}>
                <div className="w-10 h-10 rounded-[12px] flex items-center justify-center text-xl mb-4 shadow-sm" style={{ background: stat.bg }}>{stat.icon}</div>
                <p className="text-[11px] font-[800] uppercase tracking-wider text-[#94A3B8] mb-1.5" style={S}>{stat.label}</p>
                <p className="text-[16px] font-[800] capitalize truncate transition-colors" style={{ color: stat.color, ...S }}>{stat.value}</p>
              </div>
            ))}
          </div>

          <WhiteCard title="Spending Heatmap">
            <SpendingHeatmap expenses={filtered} currency={currency} />
          </WhiteCard>
          
          <WhiteCard title="Year vs Year Growth">
            <YearComparisonChart currentYearTotals={currentYearTotals} prevYearTotals={prevYearTotals} currency={currency} />
          </WhiteCard>
          
          <WhiteCard title="Spending by Day">
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
