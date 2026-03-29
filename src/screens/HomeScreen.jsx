// Home screen — main dashboard with balance, analytics, and recent transactions
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import BalanceCard from '../components/cards/BalanceCard'
import SalaryExpenseCards from '../components/cards/SalaryExpenseCards'
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
import { format, subMonths } from 'date-fns'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useSecurityStore } from '../store/securityStore'

export default function HomeScreen() {
  const navigate = useNavigate()
  const { expenses, deleteExpense, restoreExpense, getThisMonth, getRecent, isLoading } = useExpenses()
  const { settings } = useSettingsStore()
  const { overallBudget, loadBudgets } = useBudgetStore()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [toast, setToast] = useState(null)
  const [alertDismissed, setAlertDismissed] = useState(false)
  const { hideBalances, toggleHideBalances } = useSecurityStore()

  const currency = settings?.currency || 'USD'
  const name = settings?.name || 'Friend'
  const emoji = settings?.emoji || '😊'

  useEffect(() => { loadBudgets() }, [])

  const thisMonth = getThisMonth()
  const spent = calculateSpent(thisMonth)
  const received = calculateReceived(thisMonth)
  const balance = calculateBalance(expenses)
  const budgetPct = overallBudget > 0 ? (spent / overallBudget) * 100 : 0

  // Build 12-month chart data
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const key = format(subMonths(new Date(), 11 - i), 'yyyy-MM')
    const month = groupByMonth(expenses)[key] || []
    return calculateSpent(month)
  })

  const recentExpenses = getRecent(8).filter(e =>
    selectedCategory === 'all' || e.category === selectedCategory
  )

  const handleDelete = async (id) => {
    const deleted = await deleteExpense(id)
    setToast({
      id: Date.now(),
      type: 'success',
      message: 'Expense deleted',
      duration: 4000,
      action: { label: 'Undo', fn: async () => { await restoreExpense(deleted); setToast(null) } },
    })
  }

  const getInsight = () => {
    if (budgetPct > 100) return "🚨 You've gone over budget this month! Try to hold off on non-essentials."
    if (budgetPct > 80) return "⚠️ You're close to your monthly limit. Watch your spending!"
    if (spent > 0) return `💡 You've spent ${Math.round(budgetPct)}% of your budget this month. Keep it up!`
    return "👋 Start adding your expenses to see smart insights here!"
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F5F5] dark:bg-[#0F0F1A] mb-tab">
      {/* Header */}
      <div className="flex items-center justify-between px-6 safe-top pt-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-purple-600 flex items-center justify-center text-xl shadow-md">
            {emoji}
          </div>
          <div>
            <p className="text-[12px] text-gray-400">Good day! 👋</p>
            <p className="text-[20px] font-sora font-bold text-gray-900 dark:text-white leading-tight">
              Hello, {name}!
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={toggleHideBalances}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#1A1A2E] flex items-center justify-center shadow-sm"
          >
            {hideBalances ? (
              <EyeOff className="w-5 h-5 text-purple-600" />
            ) : (
              <Eye className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }}
            className="relative w-10 h-10 rounded-full bg-white dark:bg-[#1A1A2E] flex items-center justify-center shadow-sm">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            {budgetPct >= 80 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-orange-500 rounded-full" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Balance card */}
      <BalanceCard balance={balance} currency={currency} />

      {/* Summary pills */}
      <div className="flex gap-3 px-4 mt-4">
        <div className="flex-1 bg-white dark:bg-[#1A1A2E] rounded-2xl p-3 shadow-sm flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-green-600 text-lg font-bold">↑</span>
          </div>
          <div>
            <p className="text-[11px] text-gray-400">Money In</p>
            <p className="text-[15px] font-sora font-bold text-green-500">+{received.toFixed(0)}</p>
          </div>
        </div>
        <div className="flex-1 bg-white dark:bg-[#1A1A2E] rounded-2xl p-3 shadow-sm flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-500 text-lg font-bold">↓</span>
          </div>
          <div>
            <p className="text-[11px] text-gray-400">Money Spent</p>
            <p className="text-[15px] font-sora font-bold text-red-500">-{spent.toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* Budget card */}
      <div className="mt-4">
        <BudgetProgressCard label="Monthly Budget" spent={spent} total={overallBudget} currency={settings?.currency ? ['USD','EUR','GBP'].includes(settings.currency) ? (settings.currency === 'USD' ? '$' : settings.currency === 'EUR' ? '€' : '£') : settings.currency : '$'} />
      </div>

      {/* Alert banner */}
      {!alertDismissed && budgetPct >= 80 && (
        <AlertBanner
          type={budgetPct >= 100 ? 'danger' : 'warning'}
          message={budgetPct >= 100 ? '🚨 You went over budget!' : '⚠️ Careful! You\'re close to your limit'}
          onClose={() => setAlertDismissed(true)}
        />
      )}

      {/* Category chips */}
      <div className="mt-4">
        <CategoryChips selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      {/* Analytics chart */}
      <div className="mt-4">
        <AnalyticsBarChart data={monthlyData} currency={currency} />
      </div>

      {/* Recent transactions */}
      <div className="mt-5">
        <div className="flex items-center justify-between px-4 mb-3">
          <p className="text-[17px] font-sora font-bold text-gray-900 dark:text-white">Recent</p>
          <button onClick={() => navigate('/expenses')} className="text-[13px] text-purple-600 font-semibold">
            View All →
          </button>
        </div>
        {recentExpenses.length === 0 ? (
          <EmptyState type="expenses" title="No expenses yet" message="Tap the + button to add your first expense" />
        ) : (
          recentExpenses.map((exp, i) => (
            <TransactionItem
              key={exp.id}
              expense={exp}
              currency={currency}
              index={i}
              onDelete={handleDelete}
              onEdit={() => navigate(`/add?edit=${exp.id}`)}
            />
          ))
        )}
      </div>

      {/* Smart insight */}
      <div className="mt-2">
        <InsightCard message={getInsight()} />
      </div>

      <ToastMessage toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
