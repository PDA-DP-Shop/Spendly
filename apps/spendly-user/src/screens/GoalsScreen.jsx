// GoalsScreen.jsx — Features 8 (Savings Goals) + 9 (No-Spend Challenge)
import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import TopHeader from '../components/shared/TopHeader'
import EmptyState from '../components/shared/EmptyState'
import { useTranslation } from 'react-i18next'
import { useGoalStore } from '../store/goalStore'
import { useExpenses } from '../hooks/useExpenses'
import { useSettingsStore } from '../store/settingsStore'
import { formatMoney } from '../utils/formatMoney'
import { Plus, X, Trophy, Target, Calendar, Flame, ChevronRight, Trash2, Star, Sparkles, Lock } from 'lucide-react'
import { format, differenceInDays, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import PageGuide from '../components/shared/PageGuide'
import { usePageGuide } from '../hooks/usePageGuide'

const GOAL_EMOJIS = ['🏖️','🚗','📱','💻','🏠','✈️','💍','🎓','💰','🎯','⛽','🛍️','🎮','📸','🌍']
const NO_SPEND_OPTIONS = [5, 10, 15, 20]

const HAPTIC_SHAKE = {
  tap: { 
    x: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.35, ease: "easeInOut" }
  }
}

function BottomSheet({ show, onClose, title, children }) {
  const S = { fontFamily: "'Inter', sans-serif" }
  return createPortal(
    <AnimatePresence>
      {show && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-[1001] pointer-events-auto" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 350 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[450px] z-[1002] pb-safe bg-white flex flex-col pointer-events-auto"
            style={{ borderRadius: '40px 40px 0 0', maxHeight: '90dvh', boxShadow: '0 -20px 40px rgba(0,0,0,0.1)' }}>
            <div className="w-12 h-1.5 bg-[#F6F6F6] rounded-full mx-auto mt-4 mb-4" />
            <div className="flex items-center justify-between px-8 mb-5 mt-2">
              <h3 className="text-[22px] font-[800] text-black tracking-tight" style={S}>{title}</h3>
              <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={onClose} 
                className="w-11 h-11 rounded-full bg-[#F6F6F6] flex items-center justify-center border border-[#EEEEEE]">
                <X className="w-5 h-5 text-black" strokeWidth={2.5} />
              </motion.button>
            </div>
            <div className="flex-1 overflow-y-auto px-8 pb-10 scrollbar-hide">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.getElementById('modal-root') || document.body
  )
}

function AddGoalSheet({ onSave, onClose, show }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', emoji: '🎯', targetAmount: '', targetDate: '', startingAmount: '' })
  const S = { fontFamily: "'Inter', sans-serif" }
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const handleSave = () => {
    if (!form.name || !form.targetAmount) return
    onSave({ ...form, targetAmount: parseFloat(form.targetAmount), savedAmount: parseFloat(form.startingAmount) || 0 })
    onClose()
  }
  return (
    <BottomSheet show={show} onClose={onClose} title={t('goals.addGoal')}>
        <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-wider mb-4" style={S}>{t('goals.goalName') || 'Visual Token'}</p>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 mb-8">
          {GOAL_EMOJIS.map(e => (
            <motion.button key={e} variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => set('emoji', e)}
              className={`w-14 h-14 rounded-2xl text-2xl flex-shrink-0 flex items-center justify-center transition-all border ${form.emoji === e ? 'bg-blue-50 border-blue-200' : 'bg-[#F6F6F6] border-transparent'}`}>{e}</motion.button>
          ))}
        </div>

        <div className="space-y-6 mb-10">
            <div>
                <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-wider mb-3 ml-1" style={S}>{t('goals.goalName') || 'Target Purpose'}</p>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Dream House, New Car"
                    className="w-full py-5 px-7 rounded-[24px] bg-[#F6F6F6] border border-[#EEEEEE] outline-none text-[16px] font-[700] text-black placeholder-[#D8D8D8]" style={S} />
            </div>
            <div>
                <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-wider mb-3 ml-1" style={S}>{t('goals.target')}</p>
                <input type="number" value={form.targetAmount} onChange={e => set('targetAmount', e.target.value)} placeholder="0.00"
                    className="w-full py-5 px-7 rounded-[24px] bg-[#F6F6F6] border border-[#EEEEEE] outline-none text-[24px] font-[800] text-black placeholder-[#D8D8D8]" style={S} />
            </div>
            <div>
                <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-wider mb-3 ml-1" style={S}>{t('goals.targetDate') || 'Timeline Goal'}</p>
                <input type="date" value={form.targetDate} onChange={e => set('targetDate', e.target.value)}
                    className="w-full py-5 px-7 rounded-[24px] bg-[#F6F6F6] border border-[#EEEEEE] outline-none text-[16px] font-[700] text-black" style={S} />
            </div>
        </div>

        <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={handleSave}
          className="w-full py-6 rounded-[24px] bg-black text-white font-[800] text-[16px] shadow-xl shadow-black/10" style={S}>
          {t('goals.addGoal')}
        </motion.button>
    </BottomSheet>
  )
}

function AddSavingsSheet({ goal, onAdd, onClose, currency, show }) {
  const { t } = useTranslation()
  const [amount, setAmount] = useState('')
  const S = { fontFamily: "'Inter', sans-serif" }
  const handleAdd = async () => {
    const val = parseFloat(amount)
    if (!val) return
    await onAdd(goal.id, val)
    onClose()
  }
  const progress = Math.min(((goal?.savedAmount || 0) / goal?.targetAmount) * 100, 100)
  return (
    <BottomSheet show={show} onClose={onClose} title={`Contribute to ${goal?.name}`}>
        <div className="mb-8 bg-blue-50 p-6 rounded-[32px] border border-blue-100">
          <div className="flex justify-between items-baseline mb-4">
            <span className="text-[22px] font-[800] text-blue-600" style={S}>{formatMoney(goal?.savedAmount || 0, currency)}</span>
            <span className="text-[13px] font-[700] text-blue-300" style={S}>/ {formatMoney(goal?.targetAmount || 0, currency)}</span>
          </div>
          <div className="h-3 bg-white/50 rounded-full overflow-hidden border border-blue-100">
            <motion.div className="h-full rounded-full bg-blue-600" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mb-10">
           <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-wider mb-3 ml-1" style={S}>Contribution Amount</p>
           <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
             className="w-full py-6 px-7 rounded-[24px] bg-[#F6F6F6] border border-[#EEEEEE] outline-none text-[32px] font-[800] text-black placeholder-[#D8D8D8]" style={S} />
        </div>

        <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={handleAdd}
          className="w-full py-6 rounded-[24px] bg-black text-white font-[800] text-[16px] shadow-xl shadow-black/10" style={S}>
          Save toward goal 🎯
        </motion.button>
    </BottomSheet>
  )
}

function GoalCard({ goal, currency, onAddSavings, onDelete }) {
  const { t } = useTranslation()
  const S = { fontFamily: "'Inter', sans-serif" }
  const progress = Math.min(((goal.savedAmount || 0) / goal.targetAmount) * 100, 100)
  const daysLeft = goal.targetDate ? differenceInDays(parseISO(goal.targetDate), new Date()) : null
  const remaining = goal.targetAmount - (goal.savedAmount || 0)
  const perDay = daysLeft > 0 ? remaining / daysLeft : 0

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-[#F6F6F6] rounded-[36px] p-7 shadow-sm group active:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-[24px] bg-[#F6F6F6] border border-[#EEEEEE] flex items-center justify-center text-3xl">
            {goal.emoji}
          </div>
          <div>
            <p className="font-[800] text-[18px] text-black tracking-tight" style={S}>{goal.name}</p>
            {goal.isComplete ? (
               <div className="flex items-center gap-1.5 mt-0.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <p className="text-[12px] text-amber-600 font-[800] uppercase tracking-wider" style={S}>Target Met</p>
               </div>
            ) : (
                <p className="text-[13px] font-[600] text-[#AFAFAF] mt-0.5" style={S}>{daysLeft > 0 ? `${daysLeft} days remaining` : 'Schedule delayed'}</p>
            )}
          </div>
        </div>
        <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => onDelete(goal.id)} 
          className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center text-red-500 border border-red-100">
          <Trash2 className="w-5 h-5" strokeWidth={2.5} />
        </motion.button>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-baseline mb-3">
          <span className="text-[14px] font-[800] text-black" style={S}>{formatMoney(goal.savedAmount || 0, currency)}</span>
          <span className="text-[13px] font-[700] text-[#AFAFAF]" style={S}>{Math.round(progress)}% of {formatMoney(goal.targetAmount, currency)}</span>
        </div>
        <div className="h-3 bg-[#F6F6F6] rounded-full overflow-hidden border border-[#EEEEEE]">
          <motion.div className={`h-full rounded-full shadow-[0_0_10px_rgba(37,99,235,0.2)] ${goal.isComplete ? 'bg-emerald-500' : 'bg-blue-600'}`}
            initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
        </div>
      </div>

      {!goal.isComplete && (
        <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex-1 px-5 py-3 rounded-2xl bg-[#F6F6F6] border border-[#EEEEEE]">
                <p className="text-[11px] font-[700] text-[#AFAFAF] uppercase tracking-wider mb-0.5" style={S}>Daily Need</p>
                <p className="text-[15px] font-[800] text-black" style={S}>{formatMoney(Math.ceil(perDay), currency)}</p>
            </div>
            <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => onAddSavings(goal)}
                className="flex-[1.5] py-4 rounded-[20px] bg-black text-white font-[800] text-[14px] uppercase tracking-wide shadow-xl shadow-black/10 flex items-center justify-center gap-2">
                {t('goals.saved')}
            </motion.button>
        </div>
      )}
    </motion.div>
  )
}

function NoSpendTab() {
  const { t } = useTranslation()
  const S = { fontFamily: "'Inter', sans-serif" }
  const { expenses } = useExpenses()
  const [target, setTarget] = useState(10)
  const now = new Date()
  const monthDays = eachDayOfInterval({ start: startOfMonth(now), end: endOfMonth(now) })

  const spendDays = new Set(
    expenses.filter(e => e.type === 'spent' && e.date?.startsWith(format(now, 'yyyy-MM'))).map(e => e.date?.slice(0, 10))
  )
  const noSpendCount = monthDays.filter(d => d <= now && !spendDays.has(format(d, 'yyyy-MM-dd'))).length

  const badges = [
    { days: 5, emoji: '🥉', label: 'Bronze' },
    { days: 10, emoji: '🥈', label: 'Silver' },
    { days: 15, emoji: '🥇', label: 'Gold' },
    { days: 20, emoji: '💎', label: 'Platinum' },
  ]

  return (
    <div className="px-6 pt-2 pb-32 space-y-8">
      <div className="bg-white border border-[#F6F6F6] rounded-[40px] p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
           <div>
              <p className="text-[13px] font-[700] text-[#AFAFAF] uppercase tracking-widest mb-1" style={S}>{t('common.challenge') || 'No-Spend Streak'}</p>
              <p className="text-[32px] font-[800] text-black tracking-tight" style={S}>{noSpendCount} {t('goals.left') || 'Progress Days'}</p>
           </div>
           <div className="w-16 h-16 rounded-[24px] bg-amber-50 flex items-center justify-center border border-amber-100">
              <Flame className="w-8 h-8 text-amber-500" strokeWidth={2.5} />
           </div>
        </div>
        <div className="grid grid-cols-4 gap-3 mb-8">
          {NO_SPEND_OPTIONS.map(n => (
            <motion.button key={n} variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => setTarget(n)}
              className={`py-4 rounded-[20px] text-[13px] font-[800] uppercase tracking-tight transition-all border ${target === n ? 'bg-black border-black text-white shadow-xl' : 'bg-[#F6F6F6] border-transparent text-[#AFAFAF]'}`} style={S}>
              {n} Days
            </motion.button>
          ))}
        </div>
        {target && (
          <div>
            <div className="h-3 bg-[#F6F6F6] rounded-full overflow-hidden border border-[#EEEEEE] mb-3">
                <motion.div className="h-full bg-emerald-500 rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${Math.min((noSpendCount / target) * 100, 100)}%` }} />
            </div>
            <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-widest text-center" style={S}>{noSpendCount} of {target} days completed</p>
          </div>
        )}
      </div>

      <div className="bg-white border border-[#F6F6F6] rounded-[40px] p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-[18px] font-[800] text-black tracking-tight" style={S}>{format(now, 'MMMM yyyy')}</h3>
          <Calendar className="w-5 h-5 text-black" strokeWidth={2.5} />
        </div>
        <div className="grid grid-cols-7 gap-3">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={i} className="text-center text-[12px] font-[800] text-[#CBD5E1]" style={S}>{d}</div>
          ))}
          {Array.from({ length: monthDays[0].getDay() }).map((_, i) => <div key={`empty-${i}`} />)}
          {monthDays.map((day, i) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const isToday = dateStr === format(now, 'yyyy-MM-dd')
            const hasSpend = spendDays.has(dateStr)
            const isFuture = day > now && !isToday
            return (
              <div key={i} className={`aspect-square rounded-[14px] flex items-center justify-center text-[13px] font-[800] transition-all border
                ${isFuture ? 'bg-white border-[#F6F6F6] text-[#E2E8F0]' :
                  hasSpend ? 'bg-[#F6F6F6] border-transparent text-[#AFAFAF]' :
                  'bg-emerald-50 border-emerald-100 text-emerald-600'}
                ${isToday ? 'ring-2 ring-blue-600 ring-offset-2' : ''}`} style={S}>
                {day.getDate()}
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white border border-[#F6F6F6] rounded-[40px] p-8 shadow-sm">
        <p className="text-[17px] font-[800] text-black mb-8 tracking-tight" style={S}>{t('badges.title')}</p>
        <div className="grid grid-cols-4 gap-4">
          {badges.map(b => (
            <div key={b.days} className={`text-center p-5 rounded-[28px] border transition-all ${noSpendCount >= b.days ? 'bg-blue-50 border-blue-100' : 'bg-[#F6F6F6] border-transparent opacity-30'}`}>
              <div className="text-3xl mb-2">{noSpendCount >= b.days ? b.emoji : <Lock className="w-6 h-6 mx-auto text-[#AFAFAF]" />}</div>
              <p className="text-[11px] font-[800] text-black uppercase tracking-tight" style={S}>{b.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function GoalsScreen() {
  const { t } = useTranslation()
  const S = { fontFamily: "'Inter', sans-serif" }
  const { goals, loadGoals, addGoal, addSavings, removeGoal } = useGoalStore()
  const { settings } = useSettingsStore()
  const currency = settings?.currency || 'USD'

  const [tab, setTab] = useState('goals')
  const [showAdd, setShowAdd] = useState(false)
  const [savingsTarget, setSavingsTarget] = useState(null)
  const tabRef = useRef(null)
  const addBtnRef = useRef(null)
  const firstGoalRef = useRef(null)

  const { showGuide, currentStep, startGuide, nextStep, prevStep, skipGuide } = usePageGuide('goals_page')

  const guideSteps = useMemo(() => [
    { targetRef: tabRef, emoji: '📑', title: 'Focus Area', description: 'Switch between long-term Savings Goals and the No-Spend Challenge streaks.', borderRadius: 100 },
    { targetRef: addBtnRef, emoji: '➕', title: 'Start Dreaming', description: 'Tap this button to set a new financial milestone with a custom emoji and name.', borderRadius: 100 },
    { targetRef: firstGoalRef, emoji: '📈', title: 'Progress Tracker', description: 'Watch the bar grow as you save money. We will calculate exactly how much you need daily!', borderRadius: 36 }
  ], [tabRef, addBtnRef, firstGoalRef])

  useEffect(() => { loadGoals() }, [])

  return (
    <div className="flex flex-col min-h-dvh bg-white pb-20 safe-top">
      <TopHeader 
        title={t('goals.title')} 
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
      
      <div ref={tabRef} className="flex p-2 bg-[#F6F6F6] border border-[#EEEEEE] rounded-full mx-6 mb-10 mt-6 shadow-inner">
        {[{ id: 'goals', label: t('goals.saved') || 'Savings' }, { id: 'nospend', label: t('common.challenge') || 'Challenge' }].map(t => (
          <motion.button key={t.id} variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => setTab(t.id)}
            className={`flex-1 py-3.5 rounded-full text-[14px] font-[800] tracking-tight transition-all ${tab === t.id ? 'bg-white text-black shadow-lg border border-[#EEEEEE]' : 'text-[#AFAFAF]'}`} style={S}>
            {t.label}
          </motion.button>
        ))}
      </div>

      {tab === 'goals' ? (
        goals.length === 0 ? (
          <EmptyState type="goals" title={t('goals.title') || 'No goals set'} message={t('goals.addGoal') || 'Start saving for your next big purchase by setting a milestone.'} />
        ) : (
          <div className="px-6 flex flex-col gap-8 pb-32">
            {goals.map((goal, i) => (
              <div key={goal.id} ref={i === 0 ? firstGoalRef : null}>
                 <GoalCard goal={goal} currency={currency} onAddSavings={setSavingsTarget} onDelete={removeGoal} />
              </div>
            ))}
          </div>
        )
      ) : (
        <NoSpendTab />
      )}

      {tab === 'goals' && (
        <motion.button 
          ref={addBtnRef}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          variants={HAPTIC_SHAKE}
          whileTap="tap"
          onClick={() => setShowAdd(true)}
          className="fixed bottom-28 right-7 w-16 h-16 rounded-full bg-black text-white shadow-2xl flex items-center justify-center z-40 border-4 border-white"
        >
          <Plus className="w-8 h-8" strokeWidth={3} />
        </motion.button>
      )}

      <AddGoalSheet show={showAdd} onSave={addGoal} onClose={() => setShowAdd(false)} />
      <AddSavingsSheet show={!!savingsTarget} goal={savingsTarget} currency={currency} onAdd={addSavings} onClose={() => setSavingsTarget(null)} />

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
