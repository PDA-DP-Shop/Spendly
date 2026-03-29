// Budget screen — overall monthly budget and per-category budget editor
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import TopHeader from '../components/shared/TopHeader'
import { useBudgetStore } from '../store/budgetStore'
import { useExpenses } from '../hooks/useExpenses'
import { useSettingsStore } from '../store/settingsStore'
import { CATEGORIES } from '../constants/categories'
import { calculateSpent } from '../utils/calculateTotal'
import { formatMoney } from '../utils/formatMoney'
import { format } from 'date-fns'

function BudgetBar({ spent, limit, color = '#22C55E' }) {
  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
  const barColor = pct >= 100 ? '#EF4444' : pct >= 80 ? '#F59E0B' : color
  return (
    <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
        className="h-full rounded-full" style={{ backgroundColor: barColor }} />
    </div>
  )
}

export default function BudgetScreen() {
  const { budgets, overallBudget, loadBudgets, setCategoryBudget, setOverallBudget, getCategoryBudget } = useBudgetStore()
  const { expenses, getThisMonth } = useExpenses()
  const { settings } = useSettingsStore()
  const currency = settings?.currency || 'USD'
  const [editingOverall, setEditingOverall] = useState(String(overallBudget))
  const [catBudgets, setCatBudgets] = useState({})

  useEffect(() => {
    loadBudgets()
  }, [])

  useEffect(() => {
    setEditingOverall(String(overallBudget))
    const initial = {}
    CATEGORIES.slice(0, 8).forEach(cat => {
      initial[cat.id] = String(getCategoryBudget(cat.id) || '')
    })
    setCatBudgets(initial)
  }, [overallBudget, budgets])

  const thisMonth = getThisMonth()
  const spent = calculateSpent(thisMonth)

  const saveOverall = async () => {
    const val = parseFloat(editingOverall)
    if (val > 0) await setOverallBudget(val)
  }

  const saveCatBudget = async (catId) => {
    const val = parseFloat(catBudgets[catId] || '0')
    if (val >= 0) await setCategoryBudget(catId, val)
  }

  const getCatSpent = (catId) =>
    calculateSpent(thisMonth.filter(e => e.category === catId))

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F5F5] dark:bg-[#0F0F1A] mb-tab">
      <TopHeader title="My Budget" />
      <p className="text-[13px] text-gray-400 px-4 mb-4">{format(new Date(), 'MMMM yyyy')}</p>

      {/* Overall budget */}
      <div className="mx-4 mb-4 bg-white dark:bg-[#1A1A2E] rounded-[20px] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[16px] font-sora font-bold text-gray-900 dark:text-white">Monthly Budget</p>
          <p className="text-[14px] font-semibold text-purple-600">
            {overallBudget > 0 ? Math.round((spent / overallBudget) * 100) : 0}%
          </p>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[15px] text-gray-500">{settings?.currency === 'INR' ? '₹' : '$'}</span>
          <input type="number" value={editingOverall} onChange={e => setEditingOverall(e.target.value)}
            onBlur={saveOverall}
            autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
            className="flex-1 text-[20px] font-sora font-bold text-gray-900 dark:text-white bg-transparent outline-none border-b-2 border-purple-400 pb-1"
          />
        </div>
        <BudgetBar spent={spent} limit={overallBudget} />
        <p className="text-[12px] text-gray-400 mt-2">
          Spent {formatMoney(spent, currency)} of {formatMoney(overallBudget, currency)}
        </p>
      </div>

      {/* Per-category budgets */}
      <div className="mx-4 mb-2">
        <p className="text-[16px] font-sora font-bold text-gray-900 dark:text-white mb-3">By Category</p>
        <div className="flex flex-col gap-3">
          {CATEGORIES.slice(0, 10).map(cat => {
            const catSpent = getCatSpent(cat.id)
            const catLimit = parseFloat(catBudgets[cat.id] || '0')
            const pct = catLimit > 0 ? Math.round((catSpent / catLimit) * 100) : 0

            return (
              <div key={cat.id} className="bg-white dark:bg-[#1A1A2E] rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: cat.bgColor }}>
                    {cat.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-gray-800 dark:text-white">{cat.name}</p>
                    <p className="text-[12px] text-gray-400">{formatMoney(catSpent, currency)} spent</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[13px] text-gray-400">{settings?.currency === 'INR' ? '₹' : '$'}</span>
                    <input type="number" value={catBudgets[cat.id] || ''} placeholder="No limit"
                      onChange={e => setCatBudgets(b => ({ ...b, [cat.id]: e.target.value }))}
                      onBlur={() => saveCatBudget(cat.id)}
                      autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
                      className="w-20 text-right text-[14px] font-sora font-bold text-gray-900 dark:text-white bg-transparent outline-none border-b-2 border-gray-200 focus:border-purple-400"
                    />
                  </div>
                </div>
                <BudgetBar spent={catSpent} limit={catLimit} color={cat.color} />
                {catLimit > 0 && (
                  <div className="flex justify-between mt-1">
                    <span className="text-[11px] text-gray-400">{formatMoney(catSpent, currency)}</span>
                    <span className="text-[11px] text-gray-400">{pct}%</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
