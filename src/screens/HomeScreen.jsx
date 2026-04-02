// Home screen — white premium main dashboard
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Bell, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
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
      <div className="flex items-center justify-between px-5 safe-top pt-6 pb-4">
        <div className="flex items-center gap-3">
          {/* Avatar circle */}
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
          >
            {emoji}
          </div>
          <div>
            <p className="text-[13px] text-[#94A3B8]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Hey, {name} 👋
            </p>
            <p className="text-[18px] font-bold text-[#0F172A] leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Good Day!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="relative w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: '#F8F9FF', border: '1px solid #F0F0F8' }}
          >
            <Bell className="w-5 h-5 text-[#64748B]" />
            {budgetPct >= 80 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#6366F1]" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Balance card */}
      <BalanceCard balance={balance} currency={currency} />

      {/* Income / Spent summary pills */}
      <div className="grid grid-cols-2 gap-3 px-5 mt-4">
        <div
          className="p-4 flex items-center gap-3"
          style={{ background: '#ECFDF5', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.15)' }}
        >
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Income
            </p>
            <p className="text-[17px] font-bold text-[#0F172A]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {formatMoney(received, currency)}
            </p>
          </div>
        </div>
        <div
          className="p-4 flex items-center gap-3"
          style={{ background: '#FFF1F2', borderRadius: '16px', border: '1px solid rgba(244,63,94,0.15)' }}
        >
          <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center">
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-700" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Spent
            </p>
            <p className="text-[17px] font-bold text-[#0F172A]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {formatMoney(spent, currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Budget card */}
      <div className="mt-4">
        <BudgetProgressCard label="Monthly Budget" spent={spent} total={overallBudget} currency={currencySymbol} />
      </div>

      {/* Alert banner */}
      {!alertDismissed && budgetPct >= 80 && (
        <AlertBanner
          type={budgetPct >= 100 ? 'danger' : 'warning'}
          message={budgetPct >= 100 ? '🚨 You went over budget!' : "⚠️ Careful! You're close to your limit"}
          onClose={() => setAlertDismissed(true)}
        />
      )}

      {/* Spending Score */}
      <div className="px-5 mt-5">
        <SpendingScore scoreData={scoreData} />
      </div>

      {/* Category chips */}
      <div className="mt-5">
        <CategoryChips selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      {/* Analytics chart */}
      <div className="mt-5">
        <div className="px-5 mb-3 flex items-center justify-between">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-[#94A3B8]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Analytics
          </p>
        </div>
        <AnalyticsBarChart data={monthlyData} currency={currency} />
      </div>

      {/* Recent transactions */}
      <div className="mt-6">
        <div className="flex items-center justify-between px-5 mb-4">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-[#94A3B8]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Recent
          </p>
          <button
            onClick={() => navigate('/expenses')}
            className="text-[13px] font-bold text-[#6366F1]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            View all →
          </button>
        </div>
        {recentExpenses.length === 0 ? (
          <EmptyState type="expenses" title="No expenses yet" message="Tap the + button to add your first expense" />
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
      <div className="mt-5 mb-4">
        <InsightCard message={getInsight()} />
      </div>

      <ToastMessage toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
