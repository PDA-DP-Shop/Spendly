// Home screen — main dashboard with balance, analytics, and recent transactions
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
  const { hideBalances, toggleHideBalances } = useSecurityStore()

  const currency = settings?.currency || 'USD'
  const name = settings?.name || 'Friend'
  const emoji = settings?.emoji || '😊'

  useEffect(() => { loadBudgets() }, [])

  // PWA Shortcut Quick Add logic
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

  // Build 12-month chart data
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
    <div className="flex flex-col min-h-dvh mb-tab">
      {/* Header */}
      <div className="flex items-center justify-between px-6 safe-top pt-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full glass border-none flex items-center justify-center text-2xl shadow-glow">
            {emoji}
          </div>
          <div>
            <p className="text-[13px] font-body text-[#7B8DB0]">Hey, {name} 👋</p>
            <p className="text-[28px] font-display font-bold text-[#F0F4FF] leading-tight tracking-[-0.02em]">
              Good Day!
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={toggleHideBalances}
            className="w-11 h-11 rounded-full glass flex items-center justify-center"
          >
            {hideBalances ? (
              <EyeOff className="w-5 h-5 text-cyan-glow" />
            ) : (
              <Eye className="w-5 h-5 text-[#7B8DB0]" />
            )}
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }}
            className="relative w-11 h-11 rounded-full glass flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#7B8DB0]" />
            {budgetPct >= 80 && (
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-cyan-glow rounded-full shadow-glow" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Balance card */}
      <BalanceCard balance={balance} currency={currency} />

      {/* Summary pills */}
      <div className="grid grid-cols-2 gap-4 px-4 mt-6">
        <div className="flex-1 glass p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-cyan-dim flex items-center justify-center">
            <span className="text-cyan-glow text-lg font-bold">↑</span>
          </div>
          <div>
            <p className="text-[13px] font-body font-medium text-[#7B8DB0] uppercase tracking-[0.08em]">Income</p>
            <p className="text-[18px] font-display font-bold text-[#F0F4FF]">{received.toFixed(0)}</p>
          </div>
        </div>
        <div className="flex-1 glass p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-expense/10 flex items-center justify-center">
            <span className="text-expense text-lg font-bold">↓</span>
          </div>
          <div>
            <p className="text-[13px] font-body font-medium text-[#7B8DB0] uppercase tracking-[0.08em]">Spent</p>
            <p className="text-[18px] font-display font-bold text-[#F0F4FF]">{spent.toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* Budget card */}
      <div className="mt-6">
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

      {/* Spending Score */}
      <div className="px-4 mt-6">
        <SpendingScore scoreData={scoreData} />
      </div>

      {/* Category chips */}
      <div className="mt-6">
        <CategoryChips selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      {/* Analytics chart */}
      <div className="mt-6">
        <div className="px-4 mb-3">
          <p className="text-[16px] font-display font-semibold text-[#F0F4FF] tracking-[-0.02em]">Analytics</p>
        </div>
        <AnalyticsBarChart data={monthlyData} currency={currency} />
      </div>

      {/* Recent transactions */}
      <div className="mt-8">
        <div className="flex items-center justify-between px-4 mb-4">
          <p className="text-[16px] font-display font-semibold text-[#F0F4FF] tracking-[-0.02em]">Recent Transactions</p>
          <button onClick={() => navigate('/expenses')} className="text-[13px] font-body font-bold text-cyan-glow">
            See all →
          </button>
        </div>
        {recentExpenses.length === 0 ? (
          <EmptyState type="expenses" title="No expenses yet" message="Tap the + button to add your first expense" />
        ) : (
          <div className="flex flex-col gap-3">
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
      <div className="mt-6">
        <InsightCard message={getInsight()} />
      </div>

      <ToastMessage toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
