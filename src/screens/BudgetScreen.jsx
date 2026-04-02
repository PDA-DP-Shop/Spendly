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
import { Sparkles, Target, Zap } from 'lucide-react'

const S = { fontFamily: "'Nunito', sans-serif" }

function BudgetBar({ spent, limit, variant = 'primary' }) {
  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
  const isOver = pct >= 100
  const isWarning = pct >= 80

  const getGradient = () => {
    if (isOver) return 'linear-gradient(135deg, #F43F5E, #FB7185)'
    if (isWarning) return 'linear-gradient(135deg, #FF7043, #FF8A65)'
    if (variant === 'white') return 'rgba(255,255,255,0.4)'
    return 'var(--gradient-primary)'
  }

  return (
    <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: variant === 'white' ? 'rgba(255,255,255,0.2)' : '#F1F5F9' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="h-full rounded-full shadow-sm"
        style={{ background: getGradient() }}
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
    <div className="flex flex-col min-h-dvh bg-[#F8F7FF] pb-24">
      <TopHeader title="Budgeting" />

      <div className="px-6 py-4 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />
            <p className="text-[13px] font-[800] uppercase tracking-widest text-[#94A3B8]" style={S}>
              {format(new Date(), 'MMMM yyyy')}
            </p>
         </div>
         <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#F0F0F8] shadow-sm">
            <Zap className="w-3 h-3 text-[#F59E0B]" fill="currentColor" />
            <p className="text-[10px] font-[800] text-[#0F172A] uppercase tracking-wider" style={S}>Live Tracker</p>
         </div>
      </div>

      {/* Overall budget card */}
      <div className="mx-6 mt-2 mb-10 p-8 relative overflow-hidden shadow-xl"
        style={{ 
            background: 'var(--gradient-primary)', 
            borderRadius: '36px', 
        }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white opacity-10 -mr-16 -mt-16" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white opacity-5" />

        <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
                <p className="text-[12px] font-[800] text-white/70 uppercase tracking-[0.2em]" style={S}>Target Allowance</p>
                <div className="px-3 py-1 rounded-full bg-white/20 border border-white/20">
                    <p className="text-[10px] font-[800] text-white uppercase tracking-wider" style={S}>{pctUsed}% USED</p>
                </div>
            </div>

            <div className="flex items-baseline gap-2 mb-8 border-b border-white/20 pb-1">
                <span className="text-[24px] text-white/50 font-[800]" style={S}>{currencySymbol}</span>
                <input
                    type="number"
                    value={editingOverall}
                    onChange={e => setEditingOverall(e.target.value)}
                    onBlur={saveOverall}
                    autoComplete="off"
                    className="flex-1 text-[42px] font-[800] text-white bg-transparent outline-none placeholder-white/30 tracking-tight"
                    style={S}
                />
            </div>

            <BudgetBar spent={spent} limit={overallBudget} variant="white" />
            <div className="flex justify-between mt-5">
                <div className="flex flex-col">
                    <span className="text-[10px] text-white/60 font-[800] uppercase tracking-widest mb-0.5" style={S}>Utilised</span>
                    <span className="text-[16px] text-white font-[800]" style={S}>{formatMoney(spent, currency)}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-white/60 font-[800] uppercase tracking-widest mb-0.5" style={S}>Total Cap</span>
                    <span className="text-[16px] text-white font-[800]" style={S}>{formatMoney(overallBudget, currency)}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Per-category budgets */}
      <div className="px-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[18px] font-[800] text-[#0F172A] tracking-tight" style={S}>Category Limits</h3>
          <div className="w-10 h-10 rounded-[14px] bg-white border border-[#F0F0F8] flex items-center justify-center">
             <Sparkles className="w-5 h-5 text-[#FF7043]" />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {CATEGORIES.slice(0, 10).map(cat => {
            const catSpent = getCatSpent(cat.id)
            const catLimit = parseFloat(catBudgets[cat.id] || '0')
            const pct = catLimit > 0 ? Math.round((catSpent / catLimit) * 100) : 0

            return (
              <div key={cat.id} className="p-6 bg-white border border-[#F0F0F8] rounded-[32px] shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-[20px] flex items-center justify-center text-3xl shadow-sm border border-[#F0F0F8]"
                    style={{ background: `${cat.color}10` }}>
                    {cat.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-[800] text-[#0F172A] tracking-tight" style={S}>{cat.name}</p>
                    <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-wider" style={S}>{formatMoney(catSpent, currency)} spent</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-4 h-12 rounded-[18px] bg-[#F8F7FF] border border-[#F0F0F8]">
                    <span className="text-[12px] font-[800] text-[#94A3B8]" style={S}>{currencySymbol}</span>
                    <input
                      type="number"
                      value={catBudgets[cat.id] || ''}
                      placeholder="0"
                      onChange={e => setCatBudgets(b => ({ ...b, [cat.id]: e.target.value }))}
                      onBlur={() => saveCatBudget(cat.id)}
                      autoComplete="off"
                      className="w-16 text-right text-[15px] font-[800] text-[#0F172A] bg-transparent outline-none placeholder-[#CBD5E1]"
                      style={S}
                    />
                  </div>
                </div>

                <BudgetBar spent={catSpent} limit={catLimit} />

                {catLimit > 0 && (
                  <div className="flex justify-between mt-4">
                    <span className={`text-[10px] font-[800] uppercase tracking-widest ${pct > 100 ? 'text-[#F43F5E]' : 'text-[var(--primary)]'}`} style={S}>
                        {pct}% CONSUMED
                    </span>
                    <span className="text-[10px] font-[800] uppercase tracking-widest text-[#94A3B8]" style={S}>
                      {formatMoney(Math.max(catLimit - catSpent, 0), currency)} DRAIN LEFT
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
