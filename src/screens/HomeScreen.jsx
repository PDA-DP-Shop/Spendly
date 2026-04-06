// Home screen — white premium main dashboard
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bell, TrendingUp, TrendingDown, Wallet, LayoutGrid, Zap, PieChart, ShieldCheck } from 'lucide-react'
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
import { useUIStore } from '../store/uiStore'

const HAPTIC_SHAKE = {
  tap: { 
    x: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.35, ease: "easeInOut" }
  }
}

export default function HomeScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { expenses, deleteExpense, restoreExpense, getThisMonth, getRecent, isLoading } = useExpenses()
  const { settings } = useSettingsStore()
  const { overallBudget, loadBudgets } = useBudgetStore()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [toast, setToast] = useState(null)
  const { toggleNotifications } = useUIStore()

  const currency = settings?.currency || 'USD'
  const name = settings?.profileName || 'User'
  const S = { fontFamily: "'Inter', sans-serif" }

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

  const scoreData = calculateScore(expenses, overallBudget, spent)
  const recentExpenses = getRecent(8).filter(e =>
    selectedCategory === 'all' || e.category === selectedCategory
  )

  const handleDelete = async (id) => {
    const deleted = await deleteExpense(id)
    setToast({
      id: Date.now(), type: 'success', message: t('common.delete') + ' ' + t('common.done'), duration: 4000,
      action: { label: t('common.undo'), fn: async () => { await restoreExpense(deleted); setToast(null) } },
    })
  }

  const getInsight = () => {
    if (budgetPct > 100) return "🚨 " + t('budget.overLimit')
    if (budgetPct > 80) return "⚠️ " + t('budget.closeToLimit')
    return "💡 " + t('budget.healthy')
  }

  return (
    <div className="flex flex-col min-h-dvh mb-tab bg-white overflow-x-hidden">
      <div className="relative pt-12 pb-6 px-7">
        <div className="absolute top-0 left-0 w-full h-[300px] opacity-30 pointer-events-none bg-gradient-to-b from-[#F6F6F6] to-transparent" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="sr-only">Spendly - Private Offline Expense Tracker & Budget Manager</h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-widest mb-1" style={S}>
              Spendly
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[32px] font-[800] text-black tracking-tight" style={S}>
              {t('home.greeting', { name: name.split(' ')[0] })}
            </motion.h2>
          </div>
          
          <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={toggleNotifications}
            className="w-11 h-11 rounded-full flex items-center justify-center bg-white border border-[#EEEEEE] relative">
            <Bell className="w-5 h-5 text-black" strokeWidth={2.5} />
            {budgetPct >= 80 && <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-black ring-2 ring-white" />}
          </motion.button>
        </div>
      </div>

      <div className="px-6 -mt-1">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative h-[200px] rounded-[28px] bg-black overflow-hidden shadow-2xl">
          <div className="absolute top-[-40px] left-[-40px] w-40 h-40 rounded-full bg-white/5 blur-3xl" />
          <div className="relative h-full p-8 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/40 text-[11px] font-[700] uppercase tracking-wider mb-1" style={S}>{t('home.title')}</p>
                <h2 className="text-white text-[38px] font-[800] tracking-tight" style={S}>{formatMoney(balance, currency)}</h2>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/5">
                <Wallet className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
                <p className="text-white/30 text-[9px] font-[700] uppercase tracking-wide mb-1" style={S}>{t('home.inflow')}</p>
                <p className="text-white text-[15px] font-[700]" style={S}>{formatMoney(received, currency)}</p>
              </div>
              <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
                <p className="text-white/30 text-[9px] font-[700] uppercase tracking-wide mb-1" style={S}>{t('home.spent')}</p>
                <p className="text-white text-[15px] font-[700]" style={S}>{formatMoney(spent, currency)}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-7 mt-10">
        <div className="flex justify-between items-center mb-5">
           <p className="text-[13px] font-[700] uppercase tracking-wide text-black" style={S}>{t('settings.finance')}</p>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: t('common.add'), icon: Zap, path: '/add' },
            { label: t('common.reports'), icon: PieChart, path: '/reports' },
            { label: t('settings.security'), icon: ShieldCheck, path: '/settings' },
            { label: t('scans.title'), icon: LayoutGrid, path: '/scans' }
          ].map((action) => (
            <motion.button key={action.label} variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2">
              <div className="w-full aspect-square rounded-[22px] flex items-center justify-center bg-[#F6F6F6] border border-[#EEEEEE] active:bg-[#EEEEEE] transition-colors">
                <action.icon className="w-5 h-5 text-black" strokeWidth={2.5} />
              </div>
              <span className="text-[11px] font-[700] text-[#545454]" style={S}>{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mt-12 overflow-hidden">
        <div className="px-7 mb-5">
           <p className="text-[13px] font-[700] uppercase tracking-wide text-black" style={S}>{t('budget.title')}</p>
        </div>
        <div className="overflow-x-auto scrollbar-hide flex gap-4 px-6 pb-2">
          <motion.div variants={HAPTIC_SHAKE} whileTap="tap" className="flex-shrink-0 w-[260px]">
            <SpendingScore scoreData={scoreData} compact />
          </motion.div>
          <motion.div variants={HAPTIC_SHAKE} whileTap="tap" className="flex-shrink-0 w-[260px] bg-white rounded-[24px] p-6 border border-[#EEEEEE] shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white">
                <TrendingUp className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <p className="text-[14px] font-[700] text-black">{t('scans.history')}</p>
            </div>
            <p className="text-[14px] font-[500] text-[#545454] leading-relaxed mb-4" style={S}>{getInsight()}</p>
            <div className="h-1.5 w-full bg-[#F6F6F6] rounded-full overflow-hidden">
               <div className={`h-full ${budgetPct > 100 ? 'bg-black' : 'bg-black'}`} style={{ width: `${Math.min(budgetPct, 100)}%` }} />
            </div>
          </motion.div>
          <motion.div variants={HAPTIC_SHAKE} whileTap="tap" className="flex-shrink-0 w-[300px]">
             <BudgetProgressCard label={t('budget.total')} spent={spent} total={overallBudget} currency={currency} simplified />
          </motion.div>
        </div>
      </div>

      <div className="mt-12">
        <CategoryChips selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      <div className="mt-10 pb-20">
        <div className="flex items-center justify-between px-7 mb-6">
          <p className="text-[13px] font-[700] uppercase tracking-wide text-black" style={S}>{t('home.recent')}</p>
          <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => navigate('/expenses')}
            className="text-[12px] font-[700] text-black underline" style={S}>{t('home.seeAll')}</motion.button>
        </div>

        <div className="px-2">
          {recentExpenses.length === 0 ? (
            <div className="px-5">
              <EmptyState type="expenses" title={t('common.noData')} message={t('home.empty')} />
            </div>
          ) : (
            <div className="flex flex-col">
              <AnimatePresence mode="popLayout">
                {recentExpenses.map((exp, i) => (
                  <TransactionItem key={exp.id} expense={exp} currency={currency} index={i} onDelete={handleDelete} onEdit={() => navigate(`/add?edit=${exp.id}`)} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <ToastMessage toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
