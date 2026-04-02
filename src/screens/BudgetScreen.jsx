// Budget screen — white premium per-category budget editor
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

const S = { fontFamily: "'Plus Jakarta Sans', sans-serif" }

function BudgetBar({ spent, limit }) {
  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
  const isOver = pct >= 100
  const isWarning = pct >= 80

  return (
    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{
          background: isOver
            ? 'linear-gradient(135deg, #F43F5E, #FB7185)'
            : isWarning
            ? 'linear-gradient(135deg, #F59E0B, #FCD34D)'
            : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
        }}
      />
    </div>
  )
}

export default function BudgetScreen() {
  const { budgets, overallBudget, loadBudgets, setCategoryBudget, setOverallBudget, getCategoryBudget } = useBudgetStore()
  const { getThisMonth } = useExpenses()
  const { settings } = useSettingsStore()
  const currency = settings?.currency || 'USD'
  const [editingOverall, setEditingOverall] = useState(String(overallBudget))
  const [catBudgets, setCatBudgets] = useState({})

  const currencySymbol = settings?.currency === 'INR' ? '₹' : settings?.currency === 'EUR' ? '€' : settings?.currency === 'GBP' ? '£' : '$'

  useEffect(() => { loadBudgets() }, [])

  useEffect(() => {
    setEditingOverall(String(overallBudget))
    const initial = {}
    CATEGORIES.slice(0, 10).forEach(cat => {
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

  const pctUsed = overallBudget > 0 ? Math.round((spent / overallBudget) * 100) : 0

  return (
    <div className="flex flex-col min-h-dvh mb-tab" style={{ background: '#F8F9FF' }}>
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #F0F0F8' }}>
        <TopHeader title="Budget" />
      </div>

      <div className="px-5 py-3" style={{ background: '#FFFFFF', borderBottom: '1px solid #F0F0F8' }}>
        <p className="text-[12px] font-semibold uppercase tracking-wider text-[#94A3B8]" style={S}>
          {format(new Date(), 'MMMM yyyy')}
        </p>
      </div>

      {/* Overall budget card */}
      <div className="mx-5 mt-5 mb-5 p-6"
        style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', borderRadius: '24px', boxShadow: '0 8px 32px rgba(99,102,241,0.3)' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[14px] font-semibold text-white opacity-90" style={S}>Monthly Budget</p>
          <div className="px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <p className="text-[12px] font-bold text-white" style={S}>{pctUsed}% used</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <span className="text-[22px] text-white opacity-60 font-bold" style={S}>{currencySymbol}</span>
          <input
            type="number"
            value={editingOverall}
            onChange={e => setEditingOverall(e.target.value)}
            onBlur={saveOverall}
            autoComplete="off"
            className="flex-1 text-[32px] font-extrabold text-white bg-transparent outline-none border-b-2 border-white/30 pb-1 focus:border-white/70 transition-colors"
            style={S}
          />
        </div>

        <BudgetBar spent={spent} limit={overallBudget} />
        <div className="flex justify-between mt-2">
          <span className="text-[12px] text-white opacity-70" style={S}>Spent: {formatMoney(spent, currency)}</span>
          <span className="text-[12px] text-white opacity-70" style={S}>Total: {formatMoney(overallBudget, currency)}</span>
        </div>
      </div>

      {/* Per-category budgets */}
      <div className="px-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[15px] font-bold text-[#0F172A]" style={S}>Category Budgets</p>
          <span className="text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wider" style={S}>Set limits</span>
        </div>

        <div className="flex flex-col gap-3">
          {CATEGORIES.slice(0, 10).map(cat => {
            const catSpent = getCatSpent(cat.id)
            const catLimit = parseFloat(catBudgets[cat.id] || '0')
            const pct = catLimit > 0 ? Math.round((catSpent / catLimit) * 100) : 0

            return (
              <div key={cat.id} className="p-5"
                style={{ background: '#FFFFFF', border: '1px solid #F0F0F8', borderRadius: '20px', boxShadow: '0 2px 12px rgba(99,102,241,0.05)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-[14px] flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: `${cat.color}18` }}>
                    {cat.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-[#0F172A]" style={S}>{cat.name}</p>
                    <p className="text-[12px] text-[#94A3B8]" style={S}>{formatMoney(catSpent, currency)} spent</p>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-2 rounded-[12px]"
                    style={{ background: '#F8F9FF', border: '1px solid #E2E8F0' }}>
                    <span className="text-[12px] font-semibold text-[#94A3B8]" style={S}>{currencySymbol}</span>
                    <input
                      type="number"
                      value={catBudgets[cat.id] || ''}
                      placeholder="None"
                      onChange={e => setCatBudgets(b => ({ ...b, [cat.id]: e.target.value }))}
                      onBlur={() => saveCatBudget(cat.id)}
                      autoComplete="off"
                      className="w-16 text-right text-[14px] font-bold text-[#0F172A] bg-transparent outline-none placeholder-[#CBD5E1]"
                      style={S}
                    />
                  </div>
                </div>

                <BudgetBar spent={catSpent} limit={catLimit} />

                {catLimit > 0 && (
                  <div className="flex justify-between mt-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]" style={S}>{pct}% used</span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]" style={S}>
                      {formatMoney(Math.max(catLimit - catSpent, 0), currency)} left
                    </span>
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
