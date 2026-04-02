// GoalsScreen.jsx — Features 8 (Savings Goals) + 9 (No-Spend Challenge)
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TopHeader from '../components/shared/TopHeader'
import EmptyState from '../components/shared/EmptyState'
import { useGoalStore } from '../store/goalStore'
import { useExpenses } from '../hooks/useExpenses'
import { useSettingsStore } from '../store/settingsStore'
import { formatMoney } from '../utils/formatMoney'
import { Plus, X, Trophy, Target, Calendar, Flame, ChevronRight, Trash2 } from 'lucide-react'
import { format, differenceInDays, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'

const GOAL_EMOJIS = ['🏖️','🚗','📱','💻','🏠','✈️','💍','🎓','💰','🎯','⛽','🛍️','🎮','📸','🌍']
const NO_SPEND_OPTIONS = [5, 8, 10, 15]

const S = { fontFamily: "'Nunito', sans-serif" }

// Reusable Premium BottomSheet
function BottomSheet({ show, onClose, title, children }) {
  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-[70]" style={{ background: 'rgba(15,23,42,0.4)' }} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 350 }}
            className="fixed bottom-0 left-0 right-0 z-[71] pb-safe bg-white flex flex-col"
            style={{ borderRadius: '40px 40px 0 0', maxHeight: '90dvh', boxShadow: '0 -20px 40px rgba(0,0,0,0.1)' }}>
            <div className="w-12 h-1.5 bg-[#EEF2FF] rounded-full mx-auto mt-4 mb-4" />
            <div className="flex items-center justify-between px-6 mb-5">
              <h3 className="text-[22px] font-[800] text-[#0F172A] tracking-tight" style={S}>{title}</h3>
              <button onClick={onClose} className="w-11 h-11 rounded-full bg-[#F8F9FF] flex items-center justify-center border border-[#F0F0F8]">
                <X className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-8 scrollbar-hide">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

const celebrate = () => {
    // Basic celebration logic if needed, or simplified for premium feel
}

function AddGoalSheet({ onSave, onClose, show }) {
  const [form, setForm] = useState({ name: '', emoji: '🎯', targetAmount: '', targetDate: '', startingAmount: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const handleSave = () => {
    if (!form.name || !form.targetAmount) return
    onSave({ ...form, targetAmount: parseFloat(form.targetAmount), savedAmount: parseFloat(form.startingAmount) || 0 })
    onClose()
  }
  return (
    <BottomSheet show={show} onClose={onClose} title="New Savings Goal">
        <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-4 ml-1" style={S}>Pick an Icon</p>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 mb-6">
          {GOAL_EMOJIS.map(e => (
            <button key={e} onClick={() => set('emoji', e)}
              className={`w-14 h-14 rounded-2xl text-2xl flex-shrink-0 flex items-center justify-center transition-all border ${form.emoji === e ? 'bg-[#F8F7FF] border-[var(--primary)] shadow-sm' : 'bg-white border-[#F0F0F8]'}`}>{e}</button>
          ))}
        </div>

        <div className="space-y-5 mb-8">
            <div>
                <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-2 ml-1" style={S}>Goal Name</p>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. New iPhone, Vacation"
                    className="w-full py-4.5 px-6 rounded-[22px] bg-[#F8F7FF] border border-[#F0F0F8] outline-none text-[16px] font-[800] text-[#0F172A] placeholder-[#CBD5E1]" style={S} />
            </div>
            <div>
                <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-2 ml-1" style={S}>Target Amount</p>
                <input type="number" value={form.targetAmount} onChange={e => set('targetAmount', e.target.value)} placeholder="0.00"
                    className="w-full py-4.5 px-6 rounded-[22px] bg-[#F8F7FF] border border-[#F0F0F8] outline-none text-[22px] font-[800] text-[#0F172A] placeholder-[#CBD5E1]" style={S} />
            </div>
            <div>
                <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-2 ml-1" style={S}>Target Date</p>
                <input type="date" value={form.targetDate} onChange={e => set('targetDate', e.target.value)}
                    className="w-full py-4.5 px-6 rounded-[22px] bg-[#F8F7FF] border border-[#F0F0F8] outline-none text-[16px] font-[800] text-[#0F172A]" style={S} />
            </div>
        </div>

        <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave}
          className="w-full py-5 rounded-[22px] text-white font-[800] text-[16px] shadow-lg shadow-[#7C6FF720]" style={{ background: 'var(--gradient-primary)', ...S }}>
          Create Savings Goal
        </motion.button>
    </BottomSheet>
  )
}

function AddSavingsSheet({ goal, onAdd, onClose, currency, show }) {
  const [amount, setAmount] = useState('')
  const handleAdd = async () => {
    const val = parseFloat(amount)
    if (!val) return
    const reached = await onAdd(goal.id, val)
    if (reached) celebrate()
    onClose()
  }
  const progress = Math.min(((goal?.savedAmount || 0) / goal?.targetAmount) * 100, 100)
  return (
    <BottomSheet show={show} onClose={onClose} title={`Save for ${goal?.name}`}>
        <div className="mb-6 bg-[#F8F7FF] p-5 rounded-[28px] border border-[#F0F0F8]">
          <div className="flex justify-between items-baseline mb-3">
            <span className="text-[20px] font-[800] text-[var(--primary)]" style={S}>{formatMoney(goal?.savedAmount || 0, currency)}</span>
            <span className="text-[13px] font-[800] text-[#94A3B8]" style={S}>of {formatMoney(goal?.targetAmount || 0, currency)}</span>
          </div>
          <div className="h-3 bg-white rounded-full overflow-hidden border border-[#F0F0F8]">
            <motion.div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mb-8">
           <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-3 ml-1" style={S}>Amount to Add</p>
           <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
             className="w-full py-5 px-6 rounded-[22px] bg-[#F8F7FF] border border-[#F0F0F8] outline-none text-[28px] font-[800] text-[#0F172A] placeholder-[#CBD5E1]" style={S} />
        </div>

        <motion.button whileTap={{ scale: 0.98 }} onClick={handleAdd}
          className="w-full py-5 rounded-[22px] text-white font-[800] text-[16px] shadow-lg shadow-[#7C6FF720]" style={{ background: 'var(--gradient-primary)', ...S }}>
          Add to Savings 🎯
        </motion.button>
    </BottomSheet>
  )
}

function GoalCard({ goal, currency, onAddSavings, onDelete }) {
  const progress = Math.min(((goal.savedAmount || 0) / goal.targetAmount) * 100, 100)
  const daysLeft = goal.targetDate ? differenceInDays(parseISO(goal.targetDate), new Date()) : null
  const remaining = goal.targetAmount - (goal.savedAmount || 0)
  const perDay = daysLeft > 0 ? remaining / daysLeft : 0

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#F0F0F8] rounded-[32px] p-6 shadow-sm group">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[22px] bg-[#F8F7FF] border border-[#F0F0F8] flex items-center justify-center text-3xl shadow-sm">
            {goal.emoji}
          </div>
          <div>
            <p className="font-[800] text-[17px] text-[#0F172A] tracking-tight" style={S}>{goal.name}</p>
            {goal.isComplete ? (
               <div className="flex items-center gap-1.5 mt-0.5">
                  <Trophy className="w-3.5 h-3.5 text-[#10B981]" />
                  <p className="text-[11px] text-[#10B981] font-[800] uppercase tracking-wider" style={S}>Reached Goal</p>
               </div>
            ) : (
                <p className="text-[12px] font-[800] text-[#94A3B8] mt-0.5 uppercase tracking-wider" style={S}>{daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}</p>
            )}
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => onDelete(goal.id)} 
          className="w-10 h-10 rounded-full bg-[#FFF5F5] flex items-center justify-center text-[#F43F5E] border border-[#FFE0E0]">
          <Trash2 className="w-4.5 h-4.5" />
        </motion.button>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-[13px] font-[800] text-[#0F172A]" style={S}>{formatMoney(goal.savedAmount || 0, currency)}</span>
          <span className="text-[12px] font-[800] text-[#94A3B8]" style={S}>{Math.round(progress)}% of {formatMoney(goal.targetAmount, currency)}</span>
        </div>
        <div className="h-2.5 bg-[#F8F7FF] rounded-full overflow-hidden border border-[#F0F0F8]">
          <motion.div className={`h-full rounded-full ${goal.isComplete ? 'bg-[#10B981]' : 'bg-[var(--primary)]'}`}
            initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
        </div>
      </div>

      {!goal.isComplete && (
        <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex-1 px-4 py-2.5 rounded-2xl bg-[#F8F7FF] border border-[#F0F0F8]">
                <p className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-0.5" style={S}>Daily Need</p>
                <p className="text-[14px] font-[800] text-[#0F172A]" style={S}>{formatMoney(Math.ceil(perDay), currency)}</p>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => onAddSavings(goal)}
                className="flex-[1.5] py-3.5 rounded-[18px] bg-[var(--primary)] text-white font-[800] text-[13px] uppercase tracking-wider shadow-md shadow-[#7C6FF720]" style={S}>
                Add Money 🎯
            </motion.button>
        </div>
      )}
    </motion.div>
  )
}

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
    <div className="px-6 pt-2 pb-24 space-y-6">
      <div className="bg-white border border-[#F0F0F8] rounded-[32px] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
           <div>
              <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-1" style={S}>Current Streak</p>
              <p className="text-[28px] font-[800] text-[#0F172A] tracking-tight" style={S}>{noSpendCount} Days</p>
           </div>
           <div className="w-16 h-16 rounded-[22px] bg-[#FFF5F5] flex items-center justify-center border border-[#FFE0E0]">
              <Flame className="w-8 h-8 text-[#F43F5E]" />
           </div>
        </div>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {NO_SPEND_OPTIONS.map(n => (
            <button key={n} onClick={() => setTarget(n)}
              className={`py-3 rounded-[18px] text-[12px] font-[800] uppercase tracking-wider transition-all border ${target === n ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-sm' : 'bg-[#F8F7FF] border-[#F0F0F8] text-[#94A3B8]'}`} style={S}>
              {n} Days
            </button>
          ))}
        </div>
        {target && (
          <div>
            <div className="h-2.5 bg-[#F8F7FF] rounded-full overflow-hidden border border-[#F0F0F8] mb-2">
                <motion.div className="h-full bg-[#10B981] rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${Math.min((noSpendCount / target) * 100, 100)}%` }} />
            </div>
            <p className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-widest text-center" style={S}>{noSpendCount} of {target} days reached — {Math.round((noSpendCount / target) * 100)}%</p>
          </div>
        )}
      </div>

      <div className="bg-white border border-[#F0F0F8] rounded-[32px] p-6 shadow-sm">
        <p className="text-[15px] font-[800] text-[#0F172A] mb-5 uppercase tracking-wider" style={S}>{format(now, 'MMMM yyyy')}</p>
        <div className="grid grid-cols-7 gap-2">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={i} className="text-center text-[11px] font-[800] text-[#CBD5E1]" style={S}>{d}</div>
          ))}
          {Array.from({ length: monthDays[0].getDay() }).map((_, i) => <div key={`empty-${i}`} />)}
          {monthDays.map((day, i) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const isToday = dateStr === format(now, 'yyyy-MM-dd')
            const hasSpend = spendDays.has(dateStr)
            const isFuture = day > now && !isToday
            return (
              <div key={i} className={`aspect-square rounded-[12px] flex items-center justify-center text-[12px] font-[800] transition-all border
                ${isFuture ? 'bg-white border-[#F8F9FF] text-[#E2E8F0]' :
                  hasSpend ? 'bg-[#F8F7FF] border-[#F0F0F8] text-[#94A3B8]' :
                  'bg-[#ECFDF5] border-[#10B98130] text-[#10B981]'}
                ${isToday ? 'border-2 border-[var(--primary)] shadow-sm' : ''}`} style={S}>
                {day.getDate()}
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white border border-[#F0F0F8] rounded-[32px] p-6 shadow-sm">
        <p className="text-[15px] font-[800] text-[#0F172A] mb-5 uppercase tracking-wider" style={S}>Milestone Badges</p>
        <div className="grid grid-cols-4 gap-3">
          {badges.map(b => (
            <div key={b.days} className={`text-center p-3.5 rounded-[22px] border transition-all ${noSpendCount >= b.days ? 'bg-[#FFFBEB] border-[#F59E0B20]' : 'bg-[#F8F7FF] border-[#F0F0F8] opacity-40'}`}>
              <div className="text-2xl mb-1">{noSpendCount >= b.days ? b.emoji : '🔒'}</div>
              <p className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-wider" style={S}>{b.label}</p>
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
    <div className="flex flex-col min-h-dvh bg-[#F8F7FF] pb-20">
      <TopHeader title="Challenges" />
      
      <div className="flex p-1.5 bg-white border border-[#F0F0F8] rounded-[30px] mx-6 mb-8 mt-2 shadow-sm">
        {[{ id: 'goals', label: 'Savings' }, { id: 'nospend', label: 'No-Spend' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-3.5 rounded-[25px] text-[13px] font-[800] uppercase tracking-widest transition-all ${tab === t.id ? 'bg-[var(--primary)] text-white shadow-md' : 'text-[#94A3B8]'}`} style={S}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'goals' ? (
        goals.length === 0 ? (
          <EmptyState type="goals" title="Quest Log Empty" message="Set your first savings milestone to begin your journey." />
        ) : (
          <div className="px-6 flex flex-col gap-6 pb-32">
            {goals.map(goal => (
              <GoalCard key={goal.id} goal={goal} currency={currency} onAddSavings={setSavingsTarget} onDelete={removeGoal} />
            ))}
          </div>
        )
      ) : (
        <NoSpendTab />
      )}

      {tab === 'goals' && (
        <motion.button 
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} 
          onClick={() => setShowAdd(true)}
          className="fixed bottom-28 right-6 w-16 h-16 rounded-[22px] text-white shadow-xl flex items-center justify-center z-40"
          style={{ background: 'var(--gradient-primary)' }}>
          <Plus className="w-8 h-8" strokeWidth={3} />
        </motion.button>
      )}

      <AddGoalSheet show={showAdd} onSave={addGoal} onClose={() => setShowAdd(false)} />
      <AddSavingsSheet show={!!savingsTarget} goal={savingsTarget} currency={currency} onAdd={addSavings} onClose={() => setSavingsTarget(null)} />
    </div>
  )
}
