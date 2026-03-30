// GoalsScreen.jsx — Features 8 (Savings Goals) + 9 (No-Spend Challenge)
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TopHeader from '../components/shared/TopHeader'
import EmptyState from '../components/shared/EmptyState'
import { useGoalStore } from '../store/goalStore'
import { useExpenses } from '../hooks/useExpenses'
import { useSettingsStore } from '../store/settingsStore'
import { formatMoney } from '../utils/formatMoney'
import { Plus, X, Trophy, Target, Calendar, Flame } from 'lucide-react'
import { format, differenceInDays, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'

const GOAL_EMOJIS = ['🏖️','🚗','📱','💻','🏠','✈️','💍','🎓','💰','🎯','⛽','🛍️','🎮','📸','🌍']
const NO_SPEND_OPTIONS = [5, 8, 10, 15]

// Lightweight confetti function using CSS only (no dependency)
const celebrate = () => {
  const el = document.createElement('div')
  el.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;overflow:hidden'
  const colors = ['#7C3AED','#F97316','#22C55E','#F59E0B','#EC4899']
  for (let i = 0; i < 80; i++) {
    const dot = document.createElement('div')
    const color = colors[i % colors.length]
    dot.style.cssText = `position:absolute;width:8px;height:8px;border-radius:50%;background:${color};left:${Math.random()*100}%;top:-10px;animation:confetti-fall ${1+Math.random()*2}s ease-in forwards ${Math.random()*0.5}s`
    el.appendChild(dot)
  }
  const style = document.createElement('style')
  style.textContent = '@keyframes confetti-fall{to{top:110%;transform:rotate(720deg)}}'
  document.head.appendChild(style)
  document.body.appendChild(el)
  setTimeout(() => { document.body.removeChild(el); document.head.removeChild(style) }, 4000)
}

function AddGoalSheet({ onSave, onClose }) {
  const [form, setForm] = useState({ name: '', emoji: '🎯', targetAmount: '', targetDate: '', startingAmount: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const handleSave = () => {
    if (!form.name || !form.targetAmount) return
    onSave({ ...form, targetAmount: parseFloat(form.targetAmount), savedAmount: parseFloat(form.startingAmount) || 0 })
    onClose()
  }
  return (
    <motion.div className="fixed inset-0 z-50 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div className="relative w-full bg-white dark:bg-[#1A1A2E] rounded-t-[28px] p-6 pb-10 max-h-[85vh] overflow-y-auto"
        initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }} transition={{ type: 'spring', damping: 25 }}>
        <div className="flex items-center justify-between mb-5">
          <p className="text-[18px] font-sora font-bold text-gray-900 dark:text-white">New Savings Goal</p>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        {/* Emoji picker */}
        <p className="text-[12px] font-semibold text-gray-500 mb-2">Pick an Icon</p>
        <div className="flex gap-2 flex-wrap mb-4">
          {GOAL_EMOJIS.map(e => (
            <button key={e} onClick={() => set('emoji', e)}
              className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center ${form.emoji === e ? 'bg-purple-100 ring-2 ring-purple-600' : 'bg-gray-100 dark:bg-gray-800'}`}>{e}</button>
          ))}
        </div>
        {[
          { label: 'Goal Name *', key: 'name', placeholder: 'e.g. Trip to Goa, iPhone 16' },
          { label: 'Target Amount *', key: 'targetAmount', placeholder: '₹50000', type: 'number' },
          { label: 'Starting Amount (optional)', key: 'startingAmount', placeholder: '₹0', type: 'number' },
        ].map(f => (
          <div key={f.key} className="mb-4">
            <p className="text-[12px] font-semibold text-gray-500 mb-1">{f.label}</p>
            <input type={f.type || 'text'} value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder}
              className="w-full py-3 px-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 outline-none text-[15px] text-gray-900 dark:text-white" />
          </div>
        ))}
        <div className="mb-6">
          <p className="text-[12px] font-semibold text-gray-500 mb-1">Target Date</p>
          <input type="date" value={form.targetDate} onChange={e => set('targetDate', e.target.value)}
            className="w-full py-3 px-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 outline-none text-[15px] text-gray-900 dark:text-white" />
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave}
          className="w-full py-4 rounded-[20px] text-white font-semibold" style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}>
          Create Goal
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

function AddSavingsSheet({ goal, onAdd, onClose, currency }) {
  const [amount, setAmount] = useState('')
  const handleAdd = async () => {
    const val = parseFloat(amount)
    if (!val) return
    const reached = await onAdd(goal.id, val)
    if (reached) celebrate()
    onClose()
  }
  const progress = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100)
  return (
    <motion.div className="fixed inset-0 z-50 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div className="relative w-full bg-white dark:bg-[#1A1A2E] rounded-t-[28px] p-6 pb-10"
        initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} transition={{ type: 'spring', damping: 25 }}>
        <div className="flex items-center justify-between mb-5">
          <p className="text-[18px] font-sora font-bold text-gray-900 dark:text-white">{goal.emoji} {goal.name}</p>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="mb-4">
          <div className="flex justify-between text-[12px] text-gray-400 mb-1">
            <span>{formatMoney(goal.savedAmount, currency)} saved</span>
            <span>{formatMoney(goal.targetAmount, currency)} goal</span>
          </div>
          <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full bg-purple-600" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount to add"
          className="w-full py-4 px-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 outline-none text-[16px] mb-6 text-gray-900 dark:text-white" />
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleAdd}
          className="w-full py-4 rounded-[20px] text-white font-semibold" style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}>
          Add Savings 🎯
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

function GoalCard({ goal, currency, onAddSavings, onDelete }) {
  const progress = Math.min(((goal.savedAmount || 0) / goal.targetAmount) * 100, 100)
  const daysLeft = goal.targetDate ? differenceInDays(parseISO(goal.targetDate), new Date()) : null
  const remaining = goal.targetAmount - (goal.savedAmount || 0)
  const perDay = daysLeft > 0 ? remaining / daysLeft : 0

  return (
    <motion.div className={`bg-white dark:bg-[#1A1A2E] rounded-[20px] p-4 shadow-sm ${goal.isComplete ? 'ring-2 ring-green-500' : ''}`}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{goal.emoji}</span>
          <div>
            <p className="font-sora font-bold text-[15px] text-gray-900 dark:text-white">{goal.name}</p>
            {goal.isComplete && <p className="text-[11px] text-green-500 font-semibold">🎉 Completed!</p>}
          </div>
        </div>
        <button onClick={() => onDelete(goal.id)} className="p-2 text-gray-300 text-[12px]">✕</button>
      </div>
      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-[12px] mb-1">
          <span className="text-purple-600 font-semibold">{formatMoney(goal.savedAmount || 0, currency)}</span>
          <span className="text-gray-400">of {formatMoney(goal.targetAmount, currency)}</span>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div className={`h-full rounded-full ${goal.isComplete ? 'bg-green-500' : 'bg-purple-600'}`}
            initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.6 }} />
        </div>
        <p className="text-[11px] text-gray-400 mt-1">{Math.round(progress)}% saved</p>
      </div>
      {/* Stats */}
      {!goal.isComplete && (
        <div className="flex gap-3 mb-3 text-[11px] text-gray-400">
          {daysLeft !== null && <span>📅 {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}</span>}
          {perDay > 0 && <span>💰 {formatMoney(Math.ceil(perDay), currency)}/day needed</span>}
        </div>
      )}
      {!goal.isComplete && (
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => onAddSavings(goal)}
          className="w-full py-2.5 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 font-semibold text-[13px]">
          + Add Savings
        </motion.button>
      )}
    </motion.div>
  )
}

// No-Spend Challenge Calendar
function NoSpendTab() {
  const { expenses } = useExpenses()
  const [target, setTarget] = useState(null)
  const now = new Date()
  const monthDays = eachDayOfInterval({ start: startOfMonth(now), end: endOfMonth(now) })

  const spendDays = new Set(
    expenses.filter(e => e.type === 'spent' && e.date?.startsWith(format(now, 'yyyy-MM'))).map(e => e.date?.slice(0, 10))
  )
  const noSpendCount = monthDays.filter(d => d <= now && !spendDays.has(format(d, 'yyyy-MM-dd'))).length

  const badges = [
    { days: 5, emoji: '🥉', label: 'Bronze' },
    { days: 8, emoji: '🥈', label: 'Silver' },
    { days: 10, emoji: '🥇', label: 'Gold' },
    { days: 15, emoji: '💎', label: 'Diamond' },
  ]

  return (
    <div className="px-4 pt-2 pb-24">
      {/* Stats header */}
      <div className="bg-white dark:bg-[#1A1A2E] rounded-[20px] p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="font-sora font-bold text-gray-900 dark:text-white">No-Spend Days This Month</p>
          <p className="text-[28px] font-sora font-bold text-green-500">{noSpendCount}</p>
        </div>
        <div className="flex gap-2 mb-4">
          {NO_SPEND_OPTIONS.map(n => (
            <button key={n} onClick={() => setTarget(n)}
              className={`flex-1 py-2 rounded-xl text-[13px] font-semibold ${target === n ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
              {n} days
            </button>
          ))}
        </div>
        {target && (
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div className="h-full bg-green-500 rounded-full"
              initial={{ width: 0 }} animate={{ width: `${Math.min((noSpendCount / target) * 100, 100)}%` }} />
          </div>
        )}
        {target && (
          <p className="text-[11px] text-gray-400 mt-1">{noSpendCount}/{target} days — {Math.round((noSpendCount / target) * 100)}%</p>
        )}
      </div>

      {/* Calendar grid */}
      <div className="bg-white dark:bg-[#1A1A2E] rounded-[20px] p-4 mb-4 shadow-sm">
        <p className="font-sora font-semibold text-[13px] text-gray-700 dark:text-gray-300 mb-3">{format(now, 'MMMM yyyy')}</p>
        <div className="grid grid-cols-7 gap-1.5">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={i} className="text-center text-[10px] font-semibold text-gray-400">{d}</div>
          ))}
          {/* Offset for first day */}
          {Array.from({ length: monthDays[0].getDay() }).map((_, i) => <div key={`empty-${i}`} />)}
          {monthDays.map((day, i) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const isToday = dateStr === format(now, 'yyyy-MM-dd')
            const hasSpend = spendDays.has(dateStr)
            const isFuture = day > now && !isToday
            return (
              <div key={i} className={`aspect-square rounded-full flex items-center justify-center text-[11px] font-medium transition-all
                ${isFuture ? 'bg-gray-50 dark:bg-gray-800 text-gray-300' :
                  hasSpend ? 'bg-gray-200 dark:bg-gray-700 text-gray-500' :
                  'bg-green-100 dark:bg-green-900/30 text-green-600'}
                ${isToday ? 'ring-2 ring-purple-600' : ''}`}>
                {day.getDate()}
              </div>
            )
          })}
        </div>
        <div className="flex gap-4 mt-3 text-[11px] text-gray-400">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-400" /> No-spend</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-gray-300" /> Spent</div>
        </div>
      </div>

      {/* Badge unlocks */}
      <div className="bg-white dark:bg-[#1A1A2E] rounded-[20px] p-4 mb-4 shadow-sm">
        <p className="font-sora font-semibold text-[13px] text-gray-700 dark:text-gray-300 mb-3">Badges This Month</p>
        <div className="flex gap-3">
          {badges.map(b => (
            <div key={b.days} className={`flex-1 text-center p-3 rounded-2xl ${noSpendCount >= b.days ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-gray-50 dark:bg-gray-800 opacity-40'}`}>
              <div className="text-2xl mb-1">{noSpendCount >= b.days ? b.emoji : '🔒'}</div>
              <p className="text-[10px] font-semibold text-gray-500">{b.days} days</p>
              <p className="text-[10px] text-gray-400">{b.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function GoalsScreen() {
  const [tab, setTab] = useState('goals')
  const [showAdd, setShowAdd] = useState(false)
  const [savingsTarget, setSavingsTarget] = useState(null)
  const { goals, loadGoals, addGoal, addSavings, removeGoal } = useGoalStore()
  const { settings } = useSettingsStore()
  const currency = settings?.currency || 'USD'

  useEffect(() => { loadGoals() }, [])

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F5F5] dark:bg-[#0F0F1A] pb-20">
      <TopHeader title="Goals & Challenges" />
      {/* Tab bar */}
      <div className="flex gap-2 px-4 pb-4">
        {[{ id: 'goals', label: '🎯 Savings Goals' }, { id: 'nospend', label: '🚫 No-Spend' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 rounded-full text-[13px] font-semibold ${tab === t.id ? 'bg-purple-600 text-white' : 'bg-white dark:bg-[#1A1A2E] text-gray-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'goals' ? (
        goals.length === 0 ? (
          <EmptyState type="goals" title="No goals yet" message="Set a savings goal to stay motivated" />
        ) : (
          <div className="px-4 flex flex-col gap-3 pb-24">
            {goals.map(goal => (
              <GoalCard key={goal.id} goal={goal} currency={currency} onAddSavings={setSavingsTarget} onDelete={removeGoal} />
            ))}
          </div>
        )
      ) : (
        <NoSpendTab />
      )}

      {tab === 'goals' && (
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => setShowAdd(true)}
          className="fixed bottom-24 right-5 w-14 h-14 rounded-full text-white shadow-xl flex items-center justify-center z-40"
          style={{ background: '#F97316' }}>
          <Plus className="w-6 h-6" />
        </motion.button>
      )}

      <AnimatePresence>
        {showAdd && <AddGoalSheet onSave={addGoal} onClose={() => setShowAdd(false)} />}
        {savingsTarget && <AddSavingsSheet goal={savingsTarget} currency={currency} onAdd={addSavings} onClose={() => setSavingsTarget(null)} />}
      </AnimatePresence>
    </div>
  )
}
