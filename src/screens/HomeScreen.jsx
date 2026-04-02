// Home screen — white premium main dashboard
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Bell, TrendingUp, TrendingDown, Wallet, LayoutGrid } from 'lucide-react'
import BalanceCard from '../components/cards/BalanceCard'
import BudgetProgressCard from '../components/cards/BudgetProgressCard'
import InsightCard from '../components/cards/InsightCard'
import TransactionItem from '../components/cards/TransactionItem'
import AnalyticsBarChart from '../components/charts/AnalyticsBarChart'
import AlertBanner from '../components/shared/AlertBanner'
import CategoryChips from '../components/shared/CategoryChips'
import ToastMessage from '../components/shared/ToastMessage'
import EmptyState from '../components/shared/EmptyState'
import { useExpenses } from '../hooks/useExpenses'
import { useSettingsStore } from '../store/settingsStore'
import { useBudgetStore } from '../store/budgetStore'
import { calculateSpent, calculateReceived, calculateBalance } from '../utils/calculateTotal'
import { groupByMonth } from '../utils/groupByCategory'
import { formatMoney } from '../utils/formatMoney'
import { format, subMonths } from 'date-fns'
import { useSecurityStore } from '../store/securityStore'
import SpendingScore from '../components/gamification/SpendingScore'
import { calculateScore } from '../utils/scoreCalculator'

export default function HomeScreen() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { expenses, deleteExpense, restoreExpense, getThisMonth, getRecent, isLoading } = useExpenses()
  const { settings } = useSettingsStore()
  const { overallBudget, loadBudgets } = useBudgetStore()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [toast, setToast] = useState(null)
  const [alertDismissed, setAlertDismissed] = useState(false)

  const currency = settings?.currency || 'USD'
  const name = settings?.name || 'Friend'
  const emoji = settings?.emoji || '😊'
  const S = { fontFamily: "'Nunito', sans-serif" }

  useEffect(() => { loadBudgets() }, [])

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      navigate('/add', { replace: true })
    }
  }, [searchParams, navigate])

  const thisMonth = getThisMonth()
  const spent = calculateSpent(thisMonth)
  const received = calculateReceived(thisMonth)
  const balance = calculateBalance(expenses)
  const budgetPct = overallBudget > 0 ? (spent / overallBudget) * 100 : 0

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const key = format(subMonths(new Date(), 11 - i), 'yyyy-MM')
    const month = groupByMonth(expenses)[key] || []
    return calculateSpent(month)
  })

  const scoreData = calculateScore(expenses, overallBudget, spent)
  const recentExpenses = getRecent(8).filter(e =>
    selectedCategory === 'all' || e.category === selectedCategory
  )

  const handleDelete = async (id) => {
    const deleted = await deleteExpense(id)
    setToast({
      id: Date.now(), type: 'success', message: 'Expense deleted', duration: 4000,
      action: { label: 'Undo', fn: async () => { await restoreExpense(deleted); setToast(null) } },
    })
  }

  const getInsight = () => {
    if (budgetPct > 100) return "🚨 You've gone over budget this month! Try to hold off on non-essentials."
    if (budgetPct > 80) return "⚠️ You're close to your monthly limit. Watch your spending!"
    if (spent > 0) return `💡 You've spent ${Math.round(budgetPct)}% of your budget this month. Keep it up!`
    return "👋 Start adding your expenses to see smart insights here!"
  }

  const currencySymbol = settings?.currency
    ? (settings.currency === 'USD' ? '$' : settings.currency === 'EUR' ? '€' : settings.currency === 'GBP' ? '£' : settings.currency)
    : '$'

  return (
    <div className="flex flex-col min-h-dvh mb-tab bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 safe-top pt-8 pb-4">
        <div className="flex items-center gap-4">
          {/* Avatar circle */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-[20px] flex items-center justify-center text-xl font-bold text-white flex-shrink-0 shadow-lg"
            style={{ background: 'var(--gradient-primary)' }}
          >
            {emoji}
          </motion.div>
          <div>
            <p className="text-[14px] font-[700] text-[#94A3B8] uppercase tracking-widest" style={S}>
              Hey, {name} 👋
            </p>
            <p className="text-[20px] font-[800] text-[#0F172A] tracking-tight leading-tight" style={S}>
              Good Day!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="relative w-11 h-11 rounded-[16px] flex items-center justify-center bg-[#F8F7FF] border border-[#F0F0F8] shadow-sm"
          >
            <Bell className="w-5 h-5 text-[var(--primary)]" />
            {budgetPct >= 80 && (
              <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-[#FF7043] border-2 border-white" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Balance card */}
      <BalanceCard balance={balance} income={received} expense={spent} currency={currency} />

      {/* Budget card */}
      <div className="mt-6">
        <BudgetProgressCard label="Monthly Budget" spent={spent} total={overallBudget} currency={currencySymbol} />
      </div>

      {/* Alert banner */}
      {!alertDismissed && budgetPct >= 80 && (
        <div className="px-5 mt-4">
           <AlertBanner
             type={budgetPct >= 100 ? 'danger' : 'warning'}
             message={budgetPct >= 100 ? '🚨 You went over budget!' : "⚠️ Careful! You're close to your limit"}
             onClose={() => setAlertDismissed(true)}
           />
        </div>
      )}

      {/* Spending Score */}
      <div className="px-5 mt-6">
        <SpendingScore scoreData={scoreData} />
      </div>

      {/* Category chips */}
      <div className="mt-6">
        <div className="px-6 mb-3 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-[var(--primary)]" />
            <p className="text-[12px] font-[800] uppercase tracking-widest text-[#94A3B8]" style={S}>Categories</p>
        </div>
        <CategoryChips selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      {/* Analytics chart */}
      <div className="mt-8">
        <div className="px-6 mb-4 flex items-center justify-between">
          <p className="text-[12px] font-[800] uppercase tracking-widest text-[#94A3B8]" style={S}>
            Monthly Overview
          </p>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F8F7FF] rounded-full border border-[#F0F0F8]">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
              <span className="text-[11px] font-[800] text-[var(--primary)] uppercase tracking-wider" style={S}>12m</span>
          </div>
        </div>
        <AnalyticsBarChart data={monthlyData} currency={currency} />
      </div>

      {/* Recent transactions */}
      <div className="mt-8">
        <div className="flex items-center justify-between px-6 mb-5">
          <p className="text-[12px] font-[800] uppercase tracking-widest text-[#94A3B8]" style={S}>
            Recent Activity
          </p>
          <button
            onClick={() => navigate('/expenses')}
            className="text-[13px] font-[800] text-[var(--primary)] flex items-center gap-1.5"
            style={S}
          >
            See all <span className="text-[16px]">→</span>
          </button>
        </div>
        {recentExpenses.length === 0 ? (
          <EmptyState type="expenses" title="No activity recorded" message="Tap the purple button to start tracking." />
        ) : (
          <div className="flex flex-col">
            {recentExpenses.map((exp, i) => (
              <TransactionItem
                key={exp.id}
                expense={exp}
                currency={currency}
                index={i}
                onDelete={handleDelete}
                onEdit={() => navigate(`/add?edit=${exp.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Smart insight */}
      <div className="mt-8 mb-6">
        <InsightCard message={getInsight()} />
      </div>

      <ToastMessage toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
