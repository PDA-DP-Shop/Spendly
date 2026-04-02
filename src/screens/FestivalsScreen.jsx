// Festivals Screen — Feature 21 Seasonal Budgeting
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Calendar, Gift, ShoppingBag, Utensils, Music, Tag, ChevronRight, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useFestivalStore } from '../store/festivalStore'
import { useSettingsStore } from '../store/settingsStore'
import TopHeader from '../components/shared/TopHeader'
import { formatMoney } from '../utils/formatMoney'
import { format, differenceInDays } from 'date-fns'

const FESTIVAL_TEMPLATES = [
  { id: 'diwali', name: 'Diwali', icon: '🪔', color: '#FF7043', defaultBudget: 15000, categories: ['Food', 'Gifts', 'Decor', 'Clothes'] },
  { id: 'navratri', name: 'Navratri', icon: '💃', color: '#7C6FF7', defaultBudget: 8000, categories: ['Passes', 'Clothes', 'Props', 'Food'] },
  { id: 'christmas', name: 'Christmas', icon: '🎄', color: '#10B981', defaultBudget: 10000, categories: ['Gifts', 'Feast', 'Decor', 'Travel'] },
  { id: 'eid', name: 'Eid', icon: '🌙', color: '#06B6D4', defaultBudget: 12000, categories: ['Gifts', 'Clothes', 'Feast', 'Charity'] },
]

const S = { fontFamily: "'Nunito', sans-serif" }

// Premium BottomSheet
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
            style={{ borderRadius: '40px 40px 0 0', maxHeight: '95dvh', boxShadow: '0 -20px 40px rgba(0,0,0,0.1)' }}>
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
    <div className="flex flex-col min-h-dvh bg-[#F8F7FF] pb-24">
      <TopHeader title="Festivals" />
      
      <div className="flex-1 px-6 mt-4">
        {festivals.length === 0 ? (
          <EmptyState type="festivals" title="Festivity Hub" message="Initialize your first seasonal budget to monitor celebratory expenditure." />
        ) : (
          <div className="flex flex-col gap-6">
            {festivals.sort((a,b) => new Date(a.date) - new Date(b.date)).map(fest => {
              const daysLeft = differenceInDays(new Date(fest.date), new Date())
              const progress = Math.min((fest.spent / fest.budget) * 100, 100)
              
              return (
                <motion.div key={fest.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-[#F0F0F8] rounded-[32px] p-6 shadow-sm group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] opacity-5" style={{ backgroundColor: fest.color }} />
                  
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-[20px] flex items-center justify-center text-3xl shadow-sm border border-[#F0F0F8]" style={{ backgroundColor: `${fest.color}15`, color: fest.color }}>
                        {fest.icon}
                      </div>
                      <div>
                        <h3 className="text-[17px] font-[800] text-[#0F172A] tracking-tight" style={S}>{fest.name}</h3>
                        <p className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-wider mt-0.5" style={S}>
                           {format(new Date(fest.date), 'MMM dd')} • {daysLeft >= 0 ? `${daysLeft} days to go` : 'Completed'}
                        </p>
                      </div>
                    </div>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => deleteFestival(fest.id)} 
                      className="w-10 h-10 rounded-[14px] bg-[#FFF5F5] border border-[#FFE0E0] text-[#F43F5E] flex items-center justify-center">
                      <Trash2 className="w-4.5 h-4.5" />
                    </motion.button>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-[13px] font-[800] text-[#0F172A]" style={S}>{formatMoney(fest.spent, currency)}</span>
                      <span className="text-[12px] font-[800] text-[#94A3B8]" style={S}>of {formatMoney(fest.budget, currency)}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[#F8F7FF] border border-[#F0F0F8] overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: fest.color }}
                        initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }} />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pt-1">
                    {fest.categories.slice(0, 3).map(c => (
                      <span key={c} className="text-[9px] font-[800] uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#F8F7FF] border border-[#F0F0F8] text-[#94A3B8]" style={S}>
                        {c}
                      </span>
                    ))}
                    {fest.categories.length > 3 && (
                        <span className="text-[9px] font-[800] uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#F8F7FF] border border-[#F0F0F8] text-[#94A3B8]" style={S}>
                            +{fest.categories.length - 3}
                        </span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <BottomSheet show={showAdd} onClose={() => setShowAdd(false)} title="New Festival Budget">
            <div className="space-y-6">
              <div>
                <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-4 ml-1" style={S}>Occasion Template</p>
                <div className="grid grid-cols-2 gap-3">
                  {FESTIVAL_TEMPLATES.map(t => (
                    <button key={t.id} onClick={() => { setSelectedTemplate(t.id); setBudget(t.defaultBudget.toString()) }}
                      className={`p-5 rounded-[28px] border transition-all flex items-center gap-4 ${selectedTemplate === t.id ? 'bg-[#F8F7FF] border-[var(--primary)] shadow-sm' : 'bg-white border-[#F0F0F8]'}`}>
                      <span className="text-3xl">{t.icon}</span>
                      <span className="text-[11px] font-[800] text-[#0F172A] uppercase tracking-wider" style={S}>{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-5">
                <div>
                  <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-2 ml-1" style={S}>Alias / Name</p>
                  <input value={customName} onChange={e => setCustomName(e.target.value)} placeholder="e.g. Grandma's Diwali"
                    className="w-full py-4.5 px-6 rounded-[22px] bg-[#F8F7FF] border border-[#F0F0F8] outline-none text-[16px] font-[800] text-[#0F172A] placeholder-[#CBD5E1]" style={S} />
                </div>
                <div>
                  <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-2 ml-1" style={S}>Allocated Budget</p>
                  <input type="number" inputMode="decimal" value={budget} onChange={e => setBudget(e.target.value)} placeholder="0.00"
                    className="w-full py-4.5 px-6 rounded-[22px] bg-[#F8F7FF] border border-[#F0F0F8] outline-none text-[22px] font-[800] text-[#0F172A] placeholder-[#CBD5E1]" style={S} />
                </div>
                <div>
                  <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-2 ml-1" style={S}>Event Date</p>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    className="w-full py-4.5 px-6 rounded-[22px] bg-[#F8F7FF] border border-[#F0F0F8] outline-none text-[16px] font-[800] text-[#0F172A]" style={S} />
                </div>
              </div>
              
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleAdd}
                className="w-full py-5 rounded-[22px] text-white font-[800] text-[16px] shadow-lg shadow-[#7C6FF720] flex items-center justify-center gap-2" 
                style={{ background: 'var(--gradient-primary)', ...S }}>
                <Plus className="w-5 h-5" strokeWidth={3} /> Schedule Event
              </motion.button>
            </div>
      </BottomSheet>

      <motion.button 
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} 
        onClick={() => setShowAdd(true)}
        className="fixed bottom-28 right-6 w-16 h-16 rounded-[22px] text-white shadow-xl flex items-center justify-center z-40"
        style={{ background: 'var(--gradient-primary)' }}>
        <Plus className="w-8 h-8" strokeWidth={3} />
      </motion.button>
    </div>
  )
}
