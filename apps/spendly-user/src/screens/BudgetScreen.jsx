// Budget screen — white premium per-category budget editor
import { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import TopHeader from '../components/shared/TopHeader'
import { useBudgetStore } from '../store/budgetStore'
import { useExpenses } from '../hooks/useExpenses'
import { useSettingsStore } from '../store/settingsStore'
import { CATEGORIES } from '../constants/categories'
import { calculateSpent } from '../utils/calculateTotal'
import { formatMoney } from '../utils/formatMoney'
import { format } from 'date-fns'
import { Sparkles, Target, Zap } from 'lucide-react'
import PageGuide from '../components/shared/PageGuide'
import { usePageGuide } from '../hooks/usePageGuide'

const S = { fontFamily: "'Inter', sans-serif" }

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
    <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: variant === 'white' ? 'rgba(255,255,255,0.2)' : '#F6F6F6' }}>
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
  const { t } = useTranslation()
  const { budgets, overallBudget, loadBudgets, setCategoryBudget, setOverallBudget, getCategoryBudget } = useBudgetStore()
  const { getThisMonth } = useExpenses()
  const { settings } = useSettingsStore()
  const currency = settings?.currency || 'USD'
  const [catBudgets, setCatBudgets] = useState({})
  const [editingOverall, setEditingOverall] = useState('')

  const totalCardRef = useRef(null)
  const catGridRef = useRef(null)

  const { showGuide, currentStep, startGuide, nextStep, prevStep, skipGuide } = usePageGuide('budget_page')

  const guideSteps = useMemo(() => [
    { targetRef: totalCardRef, emoji: '🎯', title: 'Global Goal', description: 'This is your "hard ceiling" for the month. The bar turns red as you get closer to spending it all!', borderRadius: 40 },
  ], [totalCardRef, catGridRef])

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
    <div className="flex flex-col min-h-dvh bg-white pb-24 safe-top">
      <TopHeader 
        title={t('budget.title')} 
        rightElement={
          <button 
             onClick={startGuide}
             className="w-[34px] h-[34px] rounded-full bg-black text-white flex items-center justify-center font-bold text-[16px] leading-none active:scale-95 transition-transform"
             style={{ fontFamily: "'DM Sans', sans-serif" }}
             title="How to use this page"
          >
             ?
          </button>
        }
      />

      <div className="px-6 py-4 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-black" />
            <p className="text-[13px] font-[800] uppercase tracking-widest text-[#AFAFAF]" style={S}>
              {format(new Date(), 'MMMM yyyy')}
            </p>
         </div>
         <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6F6F6] border border-[#EEEEEE]">
            <Zap className="w-3 h-3 text-[#F59E0B]" fill="currentColor" />
            <p className="text-[10px] font-[800] text-black uppercase tracking-wider" style={S}>Live Track</p>
         </div>
      </div>

      {/* Overall budget card */}
      <div ref={totalCardRef} className="mx-6 mt-2 mb-12 p-10 relative overflow-hidden shadow-2xl shadow-black/10"
        style={{ 
            background: 'black', 
            borderRadius: '40px', 
        }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white opacity-5 -mr-16 -mt-16" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white opacity-5" />

        <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
                <p className="text-[12px] font-[800] text-white/50 uppercase tracking-[0.2em]" style={S}>{t('budget.total')}</p>
                <div className="px-3 py-1 rounded-full bg-white/10 border border-white/10">
                    <p className="text-[10px] font-[800] text-white uppercase tracking-wider" style={S}>{pctUsed}% {t('budget.spent').toUpperCase()}</p>
                </div>
            </div>

            <div className="flex items-baseline gap-2 mb-8 border-b border-white/10 pb-2">
                <span className="text-[28px] text-white/30 font-[800]" style={S}>{currencySymbol}</span>
                <input
                    type="number"
                    value={editingOverall}
                    onChange={e => setEditingOverall(e.target.value)}
                    onBlur={saveOverall}
                    autoComplete="off"
                    className="flex-1 text-[48px] font-[800] text-white bg-transparent outline-none placeholder-white/20 tracking-tight"
                    style={S}
                />
            </div>

            <BudgetBar spent={spent} limit={overallBudget} variant="white" />
            <div className="flex justify-between mt-6">
                <div className="flex flex-col">
                    <span className="text-[11px] text-white/40 font-[800] uppercase tracking-widest mb-1" style={S}>{t('budget.spent')}</span>
                    <span className="text-[18px] text-white font-[800]" style={S}>{formatMoney(spent, currency)}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[11px] text-white/40 font-[800] uppercase tracking-widest mb-1" style={S}>{t('budget.total')}</span>
                    <span className="text-[18px] text-white font-[800]" style={S}>{formatMoney(overallBudget, currency)}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Per-category budgets */}
      <div className="px-6 pb-24">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-[20px] font-[800] text-black tracking-tight" style={S}>{t('budget.healthy')}</h3>
          <div className="w-11 h-11 rounded-full bg-[#F6F6F6] border border-[#EEEEEE] flex items-center justify-center">
             <Sparkles className="w-5 h-5 text-[#F59E0B]" />
          </div>
        </div>

        <div ref={catGridRef} className="flex flex-col gap-8">
          {CATEGORIES.slice(0, 10).map(cat => {
            const catSpent = getCatSpent(cat.id)
            const catLimit = parseFloat(catBudgets[cat.id] || '0')
            const pct = catLimit > 0 ? Math.round((catSpent / catLimit) * 100) : 0

            return (
              <div key={cat.id} className="p-8 bg-white border border-[#EEEEEE] rounded-[40px] shadow-sm">
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-16 h-16 rounded-[24px] flex items-center justify-center text-[32px] bg-[#F6F6F6] border border-[#EEEEEE]">
                    {cat.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[18px] font-[800] text-black tracking-tight" style={S}>{cat.name}</p>
                    <p className="text-[13px] font-[700] text-[#AFAFAF] uppercase tracking-wider" style={S}>{formatMoney(catSpent, currency)} {t('budget.spent')}</p>
                  </div>
                  <div className="flex items-center gap-2 px-5 h-14 rounded-[20px] bg-[#F6F6F6] border border-[#EEEEEE]">
                    <span className="text-[13px] font-[800] text-[#AFAFAF]" style={S}>{currencySymbol}</span>
                    <input
                      type="number"
                      value={catBudgets[cat.id] || ''}
                      placeholder="0"
                      onChange={e => setCatBudgets(b => ({ ...b, [cat.id]: e.target.value }))}
                      onBlur={() => saveCatBudget(cat.id)}
                      autoComplete="off"
                      className="w-16 text-right text-[16px] font-[800] text-black bg-transparent outline-none placeholder-[#D8D8D8]"
                      style={S}
                    />
                  </div>
                </div>

                <BudgetBar spent={catSpent} limit={catLimit} />

                {catLimit > 0 && (
                  <div className="flex justify-between mt-5">
                    <span className={`text-[11px] font-[800] uppercase tracking-widest ${pct > 100 ? 'text-[#EF4444]' : 'text-black opacity-40'}`} style={S}>
                        {pct}% {t('budget.spent').toUpperCase()}
                    </span>
                    <span className="text-[11px] font-[800] uppercase tracking-widest text-[#AFAFAF]" style={S}>
                      {formatMoney(Math.max(catLimit - catSpent, 0), currency)} {t('budget.remaining').toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <PageGuide 
        show={showGuide} 
        steps={guideSteps} 
        currentStep={currentStep} 
        onNext={nextStep} 
        onPrev={prevStep} 
        onSkip={skipGuide} 
      />
    </div>
  )
}
