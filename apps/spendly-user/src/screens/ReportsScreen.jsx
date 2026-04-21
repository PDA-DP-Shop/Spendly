// Reports screen — white premium analytics dashboard
<<<<<<< HEAD
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, PieChart, TrendingUp, Zap, Target, BarChart3, Clock } from 'lucide-react'
=======
import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Download, Zap, FileText, Loader2, Activity } from 'lucide-react'
>>>>>>> 41f113d (upgrade scanner)
import SpendingDonutChart from '../components/charts/SpendingDonutChart'
import AnalyticsBarChart from '../components/charts/AnalyticsBarChart'
import SalaryExpenseCards from '../components/cards/SalaryExpenseCards'
import { useExpenses } from '../hooks/useExpenses'
import { useSettingsStore } from '../store/settingsStore'
import { calculateSpent, calculateReceived, calculateSavingsRate } from '../utils/calculateTotal'
import { groupByCategory } from '../utils/groupByCategory'
import { formatMoney } from '../utils/formatMoney'
import { getCategoryById } from '../constants/categories'
<<<<<<< HEAD
=======
import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import PageGuide from '../components/shared/PageGuide'
import { usePageGuide } from '../hooks/usePageGuide'
>>>>>>> 41f113d (upgrade scanner)

export default function ReportsScreen() {
  const [showFull, setShowFull] = useState(false)
  const { expenses, getThisMonth } = useExpenses()
  const { settings } = useSettingsStore()
  const currency = settings?.currency || 'USD'
  
  const headerRef = useRef(null)
  const chartRef = useRef(null)
  const insightRef = useRef(null)
  const expandRef = useRef(null)

<<<<<<< HEAD
=======
  const { showGuide, currentStep, startGuide, nextStep, prevStep, skipGuide } = usePageGuide('reports_page')

  const guideSteps = useMemo(() => [
    { targetRef: headerRef, emoji: '📅', title: 'Monthly Total', description: 'See exactly how much you have spent throughout this month on this main display.', borderRadius: 16 },
    { targetRef: chartRef, emoji: '📊', title: 'Category Mix', description: 'This chart shows you which categories are eating up your budget at a glance!', borderRadius: 32 },
    { targetRef: insightRef, emoji: '💡', title: 'Smart Insights', description: 'We automatically analyze your spending to tell you where your biggest expenses are.', borderRadius: 24 },
    { targetRef: expandRef, emoji: '🚀', title: 'Deep Analysis', description: 'Tap this to see monthly trends, weekly behavior, and export your professional PDF report!', borderRadius: 16 }
  ], [headerRef, chartRef, insightRef, expandRef])
  const S = { fontFamily: "'Inter', sans-serif" }
  const SORA = { fontFamily: "'Sora', sans-serif" }

>>>>>>> 41f113d (upgrade scanner)
  const thisMonth = useMemo(() => getThisMonth(), [expenses])
  const spent = calculateSpent(thisMonth)
  const received = calculateReceived(thisMonth)
  const grouped = useMemo(() => groupByCategory(thisMonth), [thisMonth])
  const savingsRate = calculateSavingsRate(thisMonth)
<<<<<<< HEAD

  const top3 = grouped.slice(0, 3)
  const topCategory = top3[0]

  const getInsight = () => {
    if (!topCategory) return "You haven't spent anything this month! 🎉"
    return `You spend most on ${topCategory.category} 🍔`
=======

  const top3 = grouped.slice(0, 3)
  const topCategory = top3[0]

  const biggestExpense = useMemo(() => {
    return [...thisMonth].filter(e => e.type === 'spent').sort((a,b) => b.amount - a.amount)[0]
  }, [thisMonth])
  
  const dailyAvg = spent / (new Date().getDate() || 1)

  const getInsight = () => {
    if (!topCategory) return "No expenditures telemetry found for current cycle. 📡"
    return `Highest capital outflow directed to ${topCategory.category}`
  }

  const getWeeklyInsight = () => {
    if (thisMonth.length === 0) return "No data recorded."
    const weekendCount = thisMonth.filter(e => {
       const day = new Date(e.date).getDay(); return day === 0 || day === 6;
    }).length;
    if (weekendCount > thisMonth.length / 2) return "You spend overwhelmingly on Weekends."
    return "Your spending is heavily focused on Weekdays."
  }

  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownloadPdf = () => {
    setIsGenerating(true)
    setTimeout(() => {
      try {
        const pdf = new jsPDF({ format: 'a4', unit: 'mm' })
        
        // Brand Header
        pdf.setFillColor(0, 0, 0)
        pdf.rect(20, 20, 10, 10, 'F')
        pdf.setTextColor(255, 255, 255)
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(14)
        pdf.text('S', 23, 27)
        
        pdf.setTextColor(0, 0, 0)
        pdf.text('SPENDLY', 35, 27)

        pdf.setFontSize(24)
        pdf.text('Financial Report', 20, 45)
        
        pdf.setFontSize(8)
        pdf.setTextColor(150, 150, 150)
        pdf.text('PERIOD: CURRENT MONTH', 20, 52)
        
        pdf.text('DATE GENERATED:', 150, 45)
        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(10)
        pdf.text(format(new Date(), 'dd MMM, yyyy'), 150, 51)
        
        pdf.setDrawColor(200, 200, 200)
        pdf.line(20, 58, 190, 58)

        // Cards (Spent, Received, Saved)
        pdf.setFillColor(245, 245, 245)
        pdf.roundedRect(20, 65, 50, 25, 3, 3, 'F')
        pdf.setTextColor(100, 100, 100)
        pdf.setFontSize(7)
        pdf.text('TOTAL SPENT', 25, 74)
        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(14)
        pdf.text(formatMoney(spent, currency), 25, 83)

        pdf.setFillColor(245, 245, 245)
        pdf.roundedRect(75, 65, 50, 25, 3, 3, 'F')
        pdf.setTextColor(100, 100, 100)
        pdf.setFontSize(7)
        pdf.text('TOTAL RECEIVED', 80, 74)
        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(14)
        pdf.text(formatMoney(received, currency), 80, 83)

        pdf.setFillColor(0, 0, 0)
        pdf.roundedRect(130, 65, 50, 25, 3, 3, 'F')
        pdf.setTextColor(200, 200, 200)
        pdf.setFontSize(7)
        pdf.text('NET SAVINGS', 135, 74)
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(14)
        pdf.text(formatMoney(Math.max(0, received - spent), currency), 135, 83)

        // Metric Details
        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(12)
        pdf.text('KEY METRICS', 20, 105)
        pdf.setDrawColor(200, 200, 200)
        pdf.line(20, 110, 100, 110)
        
        pdf.setFontSize(10)
        pdf.setTextColor(100, 100, 100)
        pdf.text('Savings Rate', 20, 120)
        pdf.setTextColor(0, 0, 0)
        pdf.text(`${savingsRate}%`, 100, 120, { align: 'right' })

        pdf.setTextColor(100, 100, 100)
        pdf.text('Daily Average', 20, 130)
        pdf.setTextColor(0, 0, 0)
        pdf.text(formatMoney(dailyAvg, currency), 100, 130, { align: 'right' })

        pdf.setTextColor(100, 100, 100)
        pdf.text('Transactions Count', 20, 140)
        pdf.setTextColor(0, 0, 0)
        pdf.text(thisMonth.length.toString(), 100, 140, { align: 'right' })

        // Category Breakdown
        pdf.setFontSize(12)
        pdf.text('DISTRIBUTION', 110, 105)
        pdf.line(110, 110, 190, 110)
        
        pdf.setFontSize(9)
        let y = 120
        grouped.slice(0, 5).forEach(g => {
           pdf.setTextColor(100, 100, 100)
           pdf.text(g.category.toUpperCase(), 110, y)
           pdf.setTextColor(0, 0, 0)
           pdf.text(formatMoney(g.total, currency), 190, y, { align: 'right' })
           y += 10
        })

        // Top Transactions
        pdf.setFontSize(12)
        pdf.text('TOP TRANSACTIONS', 20, 170)
        pdf.line(20, 175, 190, 175)

        pdf.setFontSize(7)
        pdf.setTextColor(150, 150, 150)
        pdf.text('DATE', 20, 182)
        pdf.text('DESCRIPTION', 50, 182)
        pdf.text('CATEGORY', 140, 182)
        pdf.text('AMOUNT', 190, 182, { align: 'right' })
        
        y = 190
        const topExp = [...thisMonth].filter(e => e.type === 'spent').sort((a,b) => b.amount - a.amount).slice(0, 10)
        topExp.forEach(e => {
           pdf.setTextColor(0, 0, 0)
           pdf.text(format(new Date(e.date), 'MMM dd'), 20, y)
           pdf.text(e.shopName.substring(0, 45), 50, y)
           pdf.setTextColor(100, 100, 100)
           pdf.text(e.category.toUpperCase(), 140, y)
           pdf.setTextColor(0, 0, 0)
           pdf.setFont('helvetica', 'bold')
           pdf.text(formatMoney(e.amount, currency), 190, y, { align: 'right' })
           pdf.setFont('helvetica', 'normal')
           pdf.setDrawColor(245, 245, 245)
           pdf.line(20, y + 3, 190, y + 3)
           y += 10
        })

        if (topExp.length === 0) {
           pdf.setTextColor(150, 150, 150)
           pdf.text('No formal transactions logged this cycle.', 20, 195)
        }

        pdf.setFontSize(7)
        pdf.setTextColor(150, 150, 150)
        pdf.text('STRICTLY PRIVATE & CONFIDENTIAL - SPENDLY FINANCE ENGINE', 105, 280, { align: 'center' })

        pdf.save(`Spendly-Report-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
      } catch (err) {
        console.error("PDF Generation failed:", err)
      } finally {
        setIsGenerating(false)
      }
    }, 300)
>>>>>>> 41f113d (upgrade scanner)
  }

  return (
    <div className="flex flex-col min-h-dvh bg-white safe-top pb-tab">
<<<<<<< HEAD
      <div className="px-7 pt-10 pb-6">
         <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-widest mb-1" style={S}>This Month</p>
         <h1 className="text-[32px] font-[800] text-black tracking-tight" style={S}>
           You spent <span className="text-[#7C3AED]">{formatMoney(spent, currency)}</span>
         </h1>
      </div>

      {/* Main Donut Chart */}
      <div className="px-6 mb-10">
         <div className="p-8 bg-[#F6F6F6] rounded-[32px] border border-[#EEEEEE]">
            <SpendingDonutChart groupedData={grouped} currency={currency} />
            
            <div className="mt-8 space-y-4">
               {top3.map((cat, i) => {
                 const c = getCategoryById(cat.id || cat.category.toLowerCase())
                 return (
                   <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <span className="text-xl">{c?.emoji || '💰'}</span>
                         <span className="text-[14px] font-[700] text-black" style={S}>{c?.name || cat.category}</span>
                      </div>
                      <span className="text-[14px] font-[800] text-black" style={S}>{formatMoney(cat.amount, currency)}</span>
                   </div>
                 )
               })}
            </div>
         </div>
      </div>

      <div className="px-7 mb-8">
         <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100 flex items-center gap-4">
            <Zap className="w-6 h-6 text-purple-600 fill-purple-600" />
            <p className="text-[14px] font-[700] text-purple-900" style={S}>{getInsight()}</p>
         </div>
      </div>

      {!showFull ? (
        <div className="px-7">
           <button onClick={() => setShowFull(true)}
             className="w-full py-5 rounded-2xl bg-black text-white text-[15px] font-[800] flex items-center justify-center gap-2">
             <span>See Full Report</span>
             <ChevronRight className="w-4 h-4" />
=======
      <div className="flex justify-end px-7 pt-4">
        <button 
           onClick={startGuide}
           className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-[14px] leading-none active:scale-95 transition-transform"
           style={{ fontFamily: "'DM Sans', sans-serif" }}
           title="How to use this page"
        >
           ?
        </button>
      </div>

      <div ref={headerRef} className="px-7 pt-2 pb-6">
         <p className="text-[11px] font-[700] text-[#AFAFAF] uppercase tracking-widest mb-1" style={S}>This Month</p>
         <h1 className="text-[26px] font-[900] text-black tracking-tight leading-tight" style={SORA}>
           You spent <br /><span className="text-[36px] tracking-tighter">{formatMoney(spent, currency)}</span>
         </h1>
      </div>

      {/* Main Donut Chart */}
      <div ref={chartRef} className="px-6 mb-8">
         <div className="p-6 bg-[#F8FAFC] rounded-[28px] border border-[#EEEEEE] shadow-sm">
            <SpendingDonutChart groupedData={grouped} currency={currency} />
            
            <div className="mt-8 space-y-4">
               {top3.map((cat, i) => {
                 const c = getCategoryById(cat.id || cat.category.toLowerCase())
                 return (
                   <div key={i} className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#F1F5F9] shadow-sm">
                            <span className="text-[18px]">{c?.emoji || '💎'}</span>
                         </div>
                         <span className="text-[14px] font-[800] text-black uppercase tracking-widest" style={S}>{c?.name || cat.category}</span>
                      </div>
                      <span className="text-[16px] font-[900] text-black tracking-tight" style={SORA}>{formatMoney(cat.total, currency)}</span>
                   </div>
                 )
               })}
            </div>
         </div>
      </div>

      <div ref={insightRef} className="px-7 mb-8">
         <div className="p-6 bg-black rounded-[24px] shadow-xl shadow-black/10 flex items-center gap-4">
            <Zap className="w-6 h-6 text-white fill-white flex-shrink-0" />
            <p className="text-[13px] font-[800] text-white tracking-wide" style={S}>{getInsight()}</p>
         </div>
      </div>

      {!showFull ? (
        <div ref={expandRef} className="px-7">
           <button onClick={() => setShowFull(true)}
             className="w-full py-5 rounded-2xl bg-white border-2 border-black text-black text-[14px] font-[900] uppercase tracking-widest flex items-center justify-center gap-3 transition-colors active:bg-slate-50">
             <span>Expand Intelligence</span>
             <ChevronRight className="w-5 h-5" strokeWidth={3} />
>>>>>>> 41f113d (upgrade scanner)
           </button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-7 space-y-6">
            <SalaryExpenseCards income={received} expense={spent} currency={currency} />
            
<<<<<<< HEAD
            <div className="p-7 bg-white border border-[#EEEEEE] rounded-[28px] shadow-sm">
               <p className="text-[13px] font-[800] text-black mb-6" style={S}>Monthly Trends</p>
               <AnalyticsBarChart data={grouped.map(g => g.amount)} currency={currency} />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-6 rounded-2xl bg-[#F6F6F6] border border-[#EEEEEE]">
                  <p className="text-[#AFAFAF] text-[10px] font-[700] uppercase mb-1" style={S}>Savings Rate</p>
                  <p className="text-black text-[18px] font-[800]" style={S}>{savingsRate}%</p>
               </div>
               <div className="p-6 rounded-2xl bg-[#F6F6F6] border border-[#EEEEEE]">
                  <p className="text-[#AFAFAF] text-[10px] font-[700] uppercase mb-1" style={S}>Transactions</p>
                  <p className="text-black text-[18px] font-[800]" style={S}>{thisMonth.length}</p>
               </div>
            </div>

            <button onClick={() => setShowFull(false)} className="w-full py-4 text-[#AFAFAF] text-[13px] font-[700] underline" style={S}>
               Show Less
            </button>
        </motion.div>
      )}
=======
            <div className="p-7 bg-[#F8FAFC] border border-[#EEEEEE] rounded-[28px] shadow-sm">
               <p className="text-[11px] font-[800] text-[#AFAFAF] uppercase tracking-widest mb-6" style={S}>Monthly Trends</p>
               <AnalyticsBarChart data={grouped.map(g => g.total)} currency={currency} />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
               <div className="p-6 rounded-3xl bg-white border border-[#EEEEEE] shadow-sm">
                  <p className="text-[#AFAFAF] text-[10px] font-[800] uppercase tracking-widest mb-2" style={S}>Savings Rate</p>
                  <p className="text-black text-[24px] font-[900] tracking-tight" style={SORA}>{savingsRate}%</p>
               </div>
               <div className="p-6 rounded-3xl bg-white border border-[#EEEEEE] shadow-sm">
                  <p className="text-[#AFAFAF] text-[10px] font-[800] uppercase tracking-widest mb-2" style={S}>Daily Avg.</p>
                  <p className="text-black text-[20px] font-[900] tracking-tight truncate" style={SORA}>{formatMoney(dailyAvg, currency)}</p>
               </div>
            </div>

            <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center gap-4">
               <Activity className="w-6 h-6 text-indigo-500 flex-shrink-0" />
               <div>
                 <p className="text-[#AFAFAF] text-[10px] font-[800] uppercase tracking-widest mb-1" style={S}>Weekly Behavior</p>
                 <p className="text-[13px] font-[800] text-indigo-900 leading-tight" style={S}>{getWeeklyInsight()}</p>
               </div>
            </div>

            {/* DOWNLOAD EXPORT */}
            <motion.button 
               whileTap={{ scale: 0.98 }}
               onClick={handleDownloadPdf}
               disabled={isGenerating}
               className="w-full py-6 rounded-3xl bg-black text-white shadow-2xl shadow-black/20 flex flex-col items-center justify-center gap-2 mt-4 relative overflow-hidden group">
               <div className="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity" />
               {isGenerating ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin mb-1" />
               ) : (
                  <Download className="w-8 h-8 text-white mb-1" strokeWidth={2.5} />
               )}
               <span className="text-[15px] font-[900] uppercase tracking-widest leading-none" style={SORA}>
                 {isGenerating ? 'Synthesizing...' : 'Export Full PDF'}
               </span>
               <span className="text-[#AFAFAF] text-[10px] font-[700] tracking-wide uppercase">Generates Professional Ledger</span>
            </motion.button>

            <button onClick={() => setShowFull(false)} className="w-full py-6 text-[#AFAFAF] text-[11px] font-[900] uppercase tracking-widest" style={S}>
               Collapse Deck
            </button>
        </motion.div>
      )}

      <PageGuide 
        show={showGuide} 
        steps={guideSteps} 
        currentStep={currentStep} 
        onNext={nextStep} 
        onPrev={prevStep} 
        onSkip={skipGuide} 
      />
>>>>>>> 41f113d (upgrade scanner)
    </div>
  )
}
