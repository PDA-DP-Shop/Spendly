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

function BudgetBar({ spent, limit, color = '#00D4FF' }) {
  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
  const isOver = pct >= 100
  const isWarning = pct >= 80

  return (
    <div className="w-full h-3 bg-[#070D1F] rounded-full overflow-hidden border border-white/5 p-[2px]">
      <motion.div 
        initial={{ width: 0 }} 
        animate={{ width: `${pct}%` }} 
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full rounded-full relative ${
          isOver ? 'bg-expense shadow-glowSmall' : 
          isWarning ? 'bg-yellow-400' : 'bg-cyan-glow shadow-glowSmall'
        }`}
      >
        <div className="absolute inset-0 bg-white/20 blur-[2px]" />
      </motion.div>
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

  return (
    <div className="flex flex-col min-h-dvh mb-tab">
      <TopHeader title="Allocation" />
      <div className="px-6 mb-6">
        <p className="text-[12px] font-display font-bold text-[#3D4F70] uppercase tracking-[0.2em]">{format(new Date(), 'MMMM yyyy')} Protocol</p>
      </div>

      {/* Overall budget */}
      <div className="mx-6 mb-8 glass-accent p-6 shadow-glowLg relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
        <div className="flex items-center justify-between mb-4 relative z-10">
          <p className="text-[14px] font-display font-bold text-[#F0F4FF] tracking-tight">Main Budget Limit</p>
          <div className="px-3 py-1 rounded-lg glass border-none bg-cyan-dim">
             <p className="text-[12px] font-body font-bold text-cyan-glow">
              {overallBudget > 0 ? Math.round((spent / overallBudget) * 100) : 0}% Active
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="w-12 h-12 rounded-xl glass border-white/10 flex items-center justify-center text-xl text-[#7B8DB0] font-display">
            {settings?.currency === 'INR' ? '₹' : (settings?.currency === 'USD' ? '$' : currency)}
          </div>
          <input type="number" value={editingOverall} onChange={e => setEditingOverall(e.target.value)}
            onBlur={saveOverall}
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
            className="flex-1 text-[28px] font-display font-bold text-[#F0F4FF] bg-transparent outline-none border-b border-white/10 pb-1 focus:border-cyan-glow/50 transition-colors"
          />
        </div>

        <div className="relative z-10">
          <BudgetBar spent={spent} limit={overallBudget} />
          <div className="flex justify-between mt-3">
            <p className="text-[11px] font-body text-[#7B8DB0]">
              Utilized: <span className="text-[#F0F4FF] font-bold">{formatMoney(spent, currency)}</span>
            </p>
            <p className="text-[11px] font-body text-[#7B8DB0]">
              Total: <span className="text-[#F0F4FF] font-bold">{formatMoney(overallBudget, currency)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Per-category budgets */}
      <div className="mx-6 mb-12">
        <div className="flex items-center justify-between mb-5">
           <p className="text-[16px] font-display font-bold text-[#F0F4FF] tracking-tight">Siloed Allocation</p>
           <span className="text-[11px] font-body font-bold text-[#3D4F70] uppercase tracking-widest">Category Limits</span>
        </div>
        
        <div className="flex flex-col gap-4">
          {CATEGORIES.slice(0, 10).map(cat => {
            const catSpent = getCatSpent(cat.id)
            const catLimit = parseFloat(catBudgets[cat.id] || '0')
            const pct = catLimit > 0 ? Math.round((catSpent / catLimit) * 100) : 0

            return (
              <div key={cat.id} className="glass border-white/5 rounded-[24px] p-5 shadow-sm hover:shadow-glowSmall transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-[18px] flex items-center justify-center text-2xl flex-shrink-0 glass border-none group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${cat.color}20` }}>
                    {cat.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-display font-bold text-[#F0F4FF]">{cat.name}</p>
                    <p className="text-[11px] font-body text-[#7B8DB0] font-medium">{formatMoney(catSpent, currency)} spent</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/5 group-focus-within:border-cyan-glow/30">
                    <span className="text-[11px] font-display font-bold text-[#3D4F70]">{settings?.currency === 'INR' ? '₹' : '$'}</span>
                    <input type="number" value={catBudgets[cat.id] || ''} placeholder="None"
                      onChange={e => setCatBudgets(b => ({ ...b, [cat.id]: e.target.value }))}
                      onBlur={() => saveCatBudget(cat.id)}
                      autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
                      className="w-16 text-right text-[14px] font-display font-bold text-[#F0F4FF] bg-transparent outline-none placeholder-[#3D4F70]"
                    />
                  </div>
                </div>
                
                <BudgetBar spent={catSpent} limit={catLimit} color={cat.color} />
                
                {catLimit > 0 && (
                  <div className="flex justify-between mt-2 px-1">
                    <span className="text-[10px] font-body font-bold text-[#3D4F70] uppercase tracking-wider">{pct}% Depleted</span>
                    <span className="text-[10px] font-body font-bold text-[#3D4F70] uppercase tracking-wider">{formatMoney(Math.max(catLimit - catSpent, 0), currency)} Left</span>
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
