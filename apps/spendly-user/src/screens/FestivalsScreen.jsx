// Festivals Screen — Feature 21 Seasonal Budgeting
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Calendar, Gift, ShoppingBag, Utensils, Music, Tag, ChevronRight, Trash2, PartyPopper, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useFestivalStore } from '../store/festivalStore'
import { useSettingsStore } from '../store/settingsStore'
import TopHeader from '../components/shared/TopHeader'
import EmptyState from '../components/shared/EmptyState'
import { formatMoney } from '../utils/formatMoney'
import { format, differenceInDays } from 'date-fns'

const FESTIVAL_TEMPLATES = [
  { id: 'diwali', nameKey: 'festivals.diwali', icon: '🪔', color: '#F97316', defaultBudget: 15000, categories: ['festivals.food', 'festivals.gifts', 'festivals.decor', 'festivals.clothes'] },
  { id: 'navratri', nameKey: 'festivals.navratri', icon: '💃', color: '#8B5CF6', defaultBudget: 8000, categories: ['festivals.passes', 'festivals.clothes', 'festivals.props', 'festivals.food'] },
  { id: 'christmas', nameKey: 'festivals.christmas', icon: '🎄', color: '#10B981', defaultBudget: 10000, categories: ['festivals.gifts', 'festivals.feast', 'festivals.decor', 'festivals.travel'] },
  { id: 'eid', nameKey: 'festivals.eid', icon: '🌙', color: '#06B6D4', defaultBudget: 12000, categories: ['festivals.gifts', 'festivals.clothes', 'festivals.feast', 'festivals.charity'] },
]

const HAPTIC_SHAKE = {
  tap: { 
    x: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.35, ease: "easeInOut" }
  }
}

function BottomSheet({ show, onClose, title, children }) {
  const S = { fontFamily: "'Inter', sans-serif" }
  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-[70]" style={{ background: 'rgba(0,0,0,0.4)' }} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 350 }}
            className="fixed bottom-0 left-0 right-0 z-[71] pb-safe bg-white flex flex-col"
            style={{ borderRadius: '40px 40px 0 0', maxHeight: '95dvh', boxShadow: '0 -20px 40px rgba(0,0,0,0.1)' }}>
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
    </AnimatePresence>
  )
}

export default function FestivalsScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { festivals, loadFestivals, addFestival, deleteFestival } = useFestivalStore()
  const { settings } = useSettingsStore()
  const currency = settings?.currency || 'INR'
  const S = { fontFamily: "'Inter', sans-serif" }
  
  const [showAdd, setShowAdd] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('diwali')
  const [customName, setCustomName] = useState('')
  const [budget, setBudget] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => { loadFestivals() }, [])

  const handleAdd = () => {
    if (!budget) return
    const tpl = FESTIVAL_TEMPLATES.find(t_ => t_.id === selectedTemplate)
    addFestival({
      name: customName || t(tpl.nameKey),
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
    <div className="flex flex-col min-h-dvh bg-white pb-24 safe-top">
      <TopHeader title={t('festivals.title')} />
      
      <div className="flex-1 px-6 mt-6">
        {festivals.length === 0 ? (
          <EmptyState type="festivals" title={t('festivals.noFestivals')} message={t('festivals.noFestivalsDesc')} />
        ) : (
          <div className="flex flex-col gap-8 pb-32">
            {festivals.sort((a,b) => new Date(a.date) - new Date(b.date)).map(fest => {
              const daysLeft = differenceInDays(new Date(fest.date), new Date())
              const progress = Math.min((fest.spent / fest.budget) * 100, 100)
              
              return (
                <motion.div key={fest.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-[#F6F6F6] rounded-[40px] p-8 shadow-sm group relative overflow-hidden active:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] opacity-10" style={{ backgroundColor: fest.color }} />
                  
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-[24px] flex items-center justify-center text-3xl border border-transparent shadow-inner" style={{ backgroundColor: `${fest.color}10`, color: fest.color }}>
                        {fest.icon}
                      </div>
                      <div>
                        <h3 className="text-[19px] font-[800] text-black tracking-tight" style={S}>{fest.name}</h3>
                        <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-wider mt-1" style={S}>
                           {format(new Date(fest.date), 'MMM dd')} • {daysLeft >= 0 ? t('festivals.daysUntil', { count: daysLeft }) : t('festivals.finished')}
                        </p>
                      </div>
                    </div>
                    <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => deleteFestival(fest.id)} 
                      className="w-11 h-11 rounded-full bg-red-50 border border-red-100 text-red-500 flex items-center justify-center">
                      <Trash2 className="w-5 h-5" strokeWidth={2.5} />
                    </motion.button>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between items-baseline mb-3">
                      <span className="text-[14px] font-[800] text-black" style={S}>{formatMoney(fest.spent, currency)}</span>
                      <span className="text-[13px] font-[700] text-[#AFAFAF]" style={S}>of {formatMoney(fest.budget, currency)}</span>
                    </div>
                    <div className="h-3 rounded-full bg-[#F6F6F6] border border-[#EEEEEE] overflow-hidden">
                      <motion.div className="h-full rounded-full shadow-[0_0_10px_rgba(37,99,235,0.1)]" style={{ width: `${progress}%`, backgroundColor: fest.color }}
                        initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }} />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pt-2">
                    {fest.categories.slice(0, 3).map(c => (
                      <span key={c} className="text-[10px] font-[700] uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-[#F6F6F6] border border-[#EEEEEE] text-[#AFAFAF]" style={S}>
                        {t(c) || c}
                      </span>
                    ))}
                    {fest.categories.length > 3 && (
                        <span className="text-[10px] font-[700] uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-[#F6F6F6] border border-[#EEEEEE] text-[#AFAFAF]" style={S}>
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

      <BottomSheet show={showAdd} onClose={() => setShowAdd(false)} title={t('festivals.addFestival')}>
            <div className="space-y-8">
              <div>
                <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-wider mb-4 ml-1" style={S}>Select Template</p>
                <div className="grid grid-cols-2 gap-4">
                  {FESTIVAL_TEMPLATES.map(t => (
                    <motion.button key={t_item.id} variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => { setSelectedTemplate(t_item.id); setBudget(t_item.defaultBudget.toString()) }}
                      className={`p-6 rounded-[32px] border transition-all flex flex-col items-center gap-3 ${selectedTemplate === t_item.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-[#F6F6F6] border-transparent'}`}>
                      <span className="text-4xl">{t_item.icon}</span>
                      <span className="text-[12px] font-[800] text-black uppercase tracking-tight" style={S}>{t(t_item.nameKey)}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-wider mb-2 ml-1" style={S}>Festival Name</p>
                  <input value={customName} onChange={e => setCustomName(e.target.value)} placeholder="e.g. Grandma's Diwali"
                    className="w-full py-5 px-7 rounded-[24px] bg-[#F6F6F6] border border-[#EEEEEE] outline-none text-[16px] font-[700] text-black placeholder-[#D8D8D8]" style={S} />
                </div>
                <div>
                  <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-wider mb-2 ml-1" style={S}>Budget Amount</p>
                  <input type="number" inputMode="decimal" value={budget} onChange={e => setBudget(e.target.value)} placeholder="0.00"
                    className="w-full py-5 px-7 rounded-[24px] bg-[#F6F6F6] border border-[#EEEEEE] outline-none text-[24px] font-[800] text-black placeholder-[#D8D8D8]" style={S} />
                </div>
                <div>
                  <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-wider mb-2 ml-1" style={S}>Festival Date</p>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    className="w-full py-5 px-7 rounded-[24px] bg-[#F6F6F6] border border-[#EEEEEE] outline-none text-[16px] font-[700] text-black" style={S} />
                </div>
              </div>
              
              <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={handleAdd}
                className="w-full py-6 rounded-[24px] bg-black text-white font-[800] text-[16px] shadow-xl shadow-black/10 flex items-center justify-center gap-3" 
                style={S}>
                <Plus className="w-5 h-5" strokeWidth={3} /> Add Festival
              </motion.button>
            </div>
      </BottomSheet>

      <motion.button 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        variants={HAPTIC_SHAKE}
        whileTap="tap" 
        onClick={() => setShowAdd(true)}
        className="fixed bottom-28 right-7 w-16 h-16 rounded-full bg-black text-white shadow-2xl flex items-center justify-center z-40 border-4 border-white"
      >
        <Plus className="w-8 h-8" strokeWidth={3} />
      </motion.button>
    </div>
  )
}
