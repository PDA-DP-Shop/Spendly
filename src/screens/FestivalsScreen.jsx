// Festivals Screen — Feature 21 Seasonal Budgeting
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Calendar, Gift, ShoppingBag, Utensils, Music, Tag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useFestivalStore } from '../store/festivalStore'
import { useSettingsStore } from '../store/settingsStore'
import TopHeader from '../components/shared/TopHeader'
import { formatMoney } from '../utils/formatMoney'
import { format, differenceInDays } from 'date-fns'

const FESTIVAL_TEMPLATES = [
  { id: 'diwali', name: 'Diwali', icon: '🪔', color: '#F59E0B', defaultBudget: 15000, categories: ['Sweets & Food', 'Gifts', 'Crackers', 'Decorations', 'Clothes'] },
  { id: 'navratri', name: 'Navratri', icon: '💃', color: '#EC4899', defaultBudget: 8000, categories: ['Passes', 'Clothes', 'Props', 'Food'] },
  { id: 'christmas', name: 'Christmas', icon: '🎄', color: '#10B981', defaultBudget: 10000, categories: ['Gifts', 'Feast', 'Decorations', 'Travel'] },
  { id: 'eid', name: 'Eid', icon: '🌙', color: '#3B82F6', defaultBudget: 12000, categories: ['Eidi (Gifts)', 'Clothes', 'Feast', 'Charity'] },
]

export default function FestivalsScreen() {
  const navigate = useNavigate()
  const { festivals, loadFestivals, addFestival, deleteFestival } = useFestivalStore()
  const { settings } = useSettingsStore()
  const currency = settings?.currency || 'INR'
  
  const [showAdd, setShowAdd] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('diwali')
  const [customName, setCustomName] = useState('')
  const [budget, setBudget] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => { loadFestivals() }, [])

  const handleAdd = () => {
    if (!budget) return
    const tpl = FESTIVAL_TEMPLATES.find(t => t.id === selectedTemplate)
    addFestival({
      name: customName || tpl.name,
      icon: tpl.icon,
      color: tpl.color,
      budget: parseFloat(budget),
      spent: 0,
      date,
      categories: tpl.categories
    })
    setShowAdd(false)
    setBudget('')
    setCustomName('')
  }

  return (
    <div className="flex flex-col h-dvh bg-[#F5F5F5] dark:bg-[#0F0F1A]">
      <TopHeader title="Festival Budgets" />
      
      <div className="flex-1 overflow-y-auto p-4 mb-tab">
        {festivals.length === 0 ? (
          <div className="h-[60vh] flex flex-col items-center justify-center text-center opacity-60">
            <span className="text-6xl mb-4">🪔</span>
            <p className="text-gray-500 font-medium">No festival budgets yet.<br/>Plan your seasonal spending!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {festivals.sort((a,b) => new Date(a.date) - new Date(b.date)).map(fest => {
              const daysLeft = differenceInDays(new Date(fest.date), new Date())
              const progress = Math.min((fest.spent / fest.budget) * 100, 100)
              
              return (
                <motion.div key={fest.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-[#1A1A2E] rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${fest.color}20` }}>
                        {fest.icon}
                      </div>
                      <div>
                        <h3 className="font-sora font-bold text-gray-900 dark:text-white leading-tight">{fest.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{format(new Date(fest.date), 'MMM dd, yyyy')} • {daysLeft >= 0 ? `${daysLeft} days left` : 'Passed'}</p>
                      </div>
                    </div>
                    <button onClick={() => deleteFestival(fest.id)} className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-semibold text-gray-400 uppercase">Spent</span>
                      <span className="font-sora font-bold text-lg dark:text-white">
                        {formatMoney(fest.spent, '')} <span className="text-sm text-gray-400 font-medium">/ {formatMoney(fest.budget, '')}</span>
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: fest.color }} />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {fest.categories.map(c => (
                      <span key={c} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                        {c}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-[#F5F5F5] dark:bg-[#0F0F1A] flex flex-col p-4 pb-0">
            <div className="flex items-center justify-between py-4 safe-top">
              <h2 className="font-sora font-semibold text-[18px] dark:text-white">Create Festival Budget</h2>
              <button onClick={() => setShowAdd(false)} className="p-2 bg-gray-200 dark:bg-gray-800 rounded-full">
                <X className="w-5 h-5 dark:text-gray-300" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 block">Select Template</label>
                <div className="grid grid-cols-2 gap-3">
                  {FESTIVAL_TEMPLATES.map(t => (
                    <button key={t.id} onClick={() => { setSelectedTemplate(t.id); setBudget(t.defaultBudget.toString()) }}
                      className={`p-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${selectedTemplate === t.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1A1A2E]'}`}>
                      <span className="text-3xl mb-1">{t.icon}</span>
                      <span className="font-semibold text-sm dark:text-white">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-white dark:bg-[#1A1A2E] rounded-3xl p-5 shadow-sm space-y-5 border border-gray-100 dark:border-gray-800">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 block">Custom Name (Optional)</label>
                  <input value={customName} onChange={e => setCustomName(e.target.value)} placeholder="e.g. My Awesome Diwali"
                    className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 outline-none text-sm dark:text-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 block">Total Budget</label>
                  <input type="number" inputMode="decimal" value={budget} onChange={e => setBudget(e.target.value)} placeholder="0.00"
                    className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 outline-none font-sora font-bold text-lg dark:text-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 block">Date of Festival</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 outline-none text-sm font-medium dark:text-white" />
                </div>
              </div>
              
              <button onClick={handleAdd} className="w-full py-4 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-sora font-bold rounded-2xl shadow-[0_8px_20px_-6px_rgba(124,58,237,0.5)] transition-all flex items-center justify-center gap-2 mt-4">
                <Plus className="w-5 h-5" /> Schedule Festival
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-[20px] bg-purple-600 text-white shadow-[0_8px_20px_-6px_rgba(124,58,237,0.5)] flex items-center justify-center">
        <Plus className="w-6 h-6" />
      </motion.button>
    </div>
  )
}
