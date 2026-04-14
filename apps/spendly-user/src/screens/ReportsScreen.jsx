// Reports screen — white premium analytics dashboard
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, PieChart, TrendingUp, Zap, Target, BarChart3, Clock } from 'lucide-react'
import SpendingDonutChart from '../components/charts/SpendingDonutChart'
import AnalyticsBarChart from '../components/charts/AnalyticsBarChart'
import SalaryExpenseCards from '../components/cards/SalaryExpenseCards'
import { useExpenses } from '../hooks/useExpenses'
import { useSettingsStore } from '../store/settingsStore'
import { calculateSpent, calculateReceived, calculateSavingsRate } from '../utils/calculateTotal'
import { groupByCategory } from '../utils/groupByCategory'
import { formatMoney } from '../utils/formatMoney'
import { getCategoryById } from '../constants/categories'

export default function ReportsScreen() {
  const [showFull, setShowFull] = useState(false)
  const { expenses, getThisMonth } = useExpenses()
  const { settings } = useSettingsStore()
  const currency = settings?.currency || 'USD'
  const S = { fontFamily: "'Inter', sans-serif" }

  const thisMonth = useMemo(() => getThisMonth(), [expenses])
  const spent = calculateSpent(thisMonth)
  const received = calculateReceived(thisMonth)
  const grouped = useMemo(() => groupByCategory(thisMonth), [thisMonth])
  const savingsRate = calculateSavingsRate(thisMonth)

  const top3 = grouped.slice(0, 3)
  const topCategory = top3[0]

  const getInsight = () => {
    if (!topCategory) return "You haven't spent anything this month! 🎉"
    return `You spend most on ${topCategory.category} 🍔`
  }

  return (
    <div className="flex flex-col min-h-dvh bg-white safe-top pb-tab">
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
           </button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-7 space-y-6">
            <SalaryExpenseCards income={received} expense={spent} currency={currency} />
            
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
    </div>
  )
}
