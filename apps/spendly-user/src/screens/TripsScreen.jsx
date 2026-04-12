// TripsScreen.jsx — Feature 10: Trip Budget Planner
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTripStore } from '../store/tripStore'
import { useSettingsStore } from '../store/settingsStore'
import { useTranslation } from 'react-i18next'
import TopHeader from '../components/shared/TopHeader'
import EmptyState from '../components/shared/EmptyState'
import { formatMoney } from '../utils/formatMoney'
import { format, parseISO, differenceInDays } from 'date-fns'
import { Plus, X, MapPin, Plane, Calendar, ChevronRight, Trash2, Globe, Compass } from 'lucide-react'

const TRIP_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']
const TRIP_EMOJIS = ['✈️','🏖️','🚗','🗼','🗽','🏔️','🏰','🌇','🏕️','🚢','🌴','🍹','🚲']

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

function AddTripSheet({ onSave, onClose, show }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    name: '', emoji: '✈️', color: TRIP_COLORS[0],
    budget: '', startDate: format(new Date(), 'yyyy-MM-dd'), endDate: ''
  })
  const S = { fontFamily: "'Inter', sans-serif" }
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const handleSave = () => {
    if (!form.name || !form.budget || !form.endDate) return
    onSave({
      ...form,
      budget: parseFloat(form.budget),
      days: Math.max(1, differenceInDays(parseISO(form.endDate), parseISO(form.startDate)) + 1)
    })
    onClose()
  }

  return (
    <BottomSheet show={show} onClose={onClose} title={t('trips.addTrip')}>
        <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-wider mb-4" style={S}>{t('wallets.chooseType') || 'Choose Icon'}</p>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 mb-8">
          {TRIP_EMOJIS.map(e => (
            <motion.button key={e} variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => set('emoji', e)}
              className={`w-14 h-14 rounded-2xl text-2xl flex-shrink-0 flex items-center justify-center transition-all border ${form.emoji === e ? 'bg-blue-50 border-blue-200' : 'bg-[#F6F6F6] border-transparent'}`}>{e}</motion.button>
          ))}
        </div>

        <div className="space-y-6 mb-10">
            <div>
                <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-wider mb-3 ml-1" style={S}>Destination / Trip Name</p>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Bali Summer, London Pro"
                    className="w-full py-5 px-7 rounded-[24px] bg-[#F6F6F6] border border-[#EEEEEE] outline-none text-[16px] font-[700] text-black placeholder-[#D8D8D8]" style={S} />
            </div>
            <div>
                <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-wider mb-3 ml-1" style={S}>Projected Budget</p>
                <input type="number" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="0.00"
                    className="w-full py-5 px-7 rounded-[24px] bg-[#F6F6F6] border border-[#EEEEEE] outline-none text-[24px] font-[800] text-black placeholder-[#D8D8D8]" style={S} />
            </div>
            <div className="flex gap-4">
               <div className="flex-1">
                  <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-wider mb-3 ml-1" style={S}>Departure</p>
                  <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
                    className="w-full py-5 px-6 rounded-[22px] bg-[#F6F6F6] border border-[#EEEEEE] outline-none text-[14px] font-[700] text-black" style={S} />
               </div>
               <div className="flex-1">
                  <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-wider mb-3 ml-1" style={S}>Return</p>
                  <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} min={form.startDate}
                    className="w-full py-5 px-6 rounded-[22px] bg-[#F6F6F6] border border-[#EEEEEE] outline-none text-[14px] font-[700] text-black" style={S} />
               </div>
            </div>
        </div>

        <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={handleSave}
          className="w-full py-6 rounded-[24px] bg-black text-white font-[800] text-[16px] shadow-xl shadow-black/10 flex items-center justify-center gap-3" style={S}>
          <Compass className="w-5 h-5" strokeWidth={2.5} />
          {t('trips.addTrip')}
        </motion.button>
    </BottomSheet>
  )
}

function TripCard({ trip, currency, onDelete, onActivate }) {
  const { t } = useTranslation()
  const S = { fontFamily: "'Inter', sans-serif" }
  const spent = trip.totalSpent || 0
  const progress = Math.min((spent / trip.budget) * 100, 100)
  const remaining = trip.budget - spent
  const daysLeft = trip.endDate ? Math.max(0, differenceInDays(parseISO(trip.endDate), new Date())) : trip.days
  const dailyRemaining = daysLeft > 0 ? remaining / daysLeft : 0

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-[#F6F6F6] rounded-[40px] overflow-hidden shadow-sm active:shadow-md transition-shadow">
      
      <div className="p-8 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${trip.color}, ${trip.color}BB)` }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -mr-16 -mt-16" />
        <div className="relative z-10 flex justify-between items-start">
           <div>
              <span className="text-4xl block mb-4 drop-shadow-sm">{trip.emoji}</span>
              <h4 className="text-[22px] font-[800] text-white tracking-tight" style={S}>{trip.name}</h4>
              <div className="flex items-center gap-2 mt-1.5 text-white/90">
                 <Calendar className="w-4 h-4" />
                 <p className="text-[12px] font-[700] uppercase tracking-wider" style={S}>
                    {format(parseISO(trip.startDate), 'MMM d')} - {format(parseISO(trip.endDate), 'MMM d, yyyy')}
                 </p>
              </div>
           </div>
           <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => onDelete(trip.id)} 
             className="w-11 h-11 rounded-full bg-black/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
             <Trash2 className="w-5 h-5" strokeWidth={2.5} />
           </motion.button>
        </div>
      </div>

      <div className="p-8">
        <div className="flex justify-between items-end mb-5">
          <div>
            <p className="text-[13px] font-[700] text-[#AFAFAF] uppercase tracking-widest mb-1.5" style={S}>{t('trips.totalBudget') || 'Budget Reserve'}</p>
            <p className="text-[26px] font-[800] text-black tracking-tight" style={S}>{formatMoney(remaining, currency)}</p>
          </div>
          <div className="text-right">
            <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-wider" style={S}>of {formatMoney(trip.budget, currency)}</p>
          </div>
        </div>

        <div className="h-3 bg-[#F6F6F6] rounded-full overflow-hidden border border-[#EEEEEE] mb-8">
          <motion.div className="h-full rounded-full shadow-[0_0_10px_rgba(37,99,235,0.2)]" style={{ backgroundColor: trip.color, width: `${progress}%` }} 
            initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }} />
        </div>

        <div className="flex gap-4 mb-8">
          <div className="flex-1 bg-[#F6F6F6] border border-[#EEEEEE] rounded-[24px] p-4 text-center">
            <p className="text-[11px] font-[700] text-[#AFAFAF] uppercase tracking-wider mb-1" style={S}>Daily Cap</p>
            <p className="font-[800] text-[15px] text-black" style={S}>
              {daysLeft > 0 ? formatMoney(dailyRemaining, currency) : 'Met'}
            </p>
          </div>
          <div className="flex-1 bg-[#F6F6F6] border border-[#EEEEEE] rounded-[24px] p-4 text-center">
            <p className="text-[11px] font-[700] text-[#AFAFAF] uppercase tracking-wider mb-1" style={S}>Time left</p>
            <p className="font-[800] text-[15px] text-black" style={S}>{daysLeft} Days</p>
          </div>
        </div>

        {trip.isActive ? (
          <div className="py-4.5 rounded-[20px] bg-emerald-50 border border-emerald-100 text-emerald-600 font-[800] text-[14px] text-center uppercase tracking-widest" style={S}>
            {t('trips.activeTrips') || 'Tracking active'}
          </div>
        ) : (
          <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => onActivate(trip.id)}
            className="w-full py-4.5 rounded-[20px] text-white font-[800] text-[14px] uppercase tracking-widest shadow-xl"
            style={{ backgroundColor: trip.color, boxShadow: `0 8px 24px ${trip.color}25`, ...S }}>
            {t('common.next') || 'Start tracking'}
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

export default function TripsScreen() {
  const { t } = useTranslation()
  const { trips, loadTrips, addTrip, removeTrip, updateTrip } = useTripStore()
  const { settings } = useSettingsStore()
  const currency = settings?.currency || 'USD'
  const [showAdd, setShowAdd] = useState(false)
  const S = { fontFamily: "'Inter', sans-serif" }

  useEffect(() => { loadTrips() }, [])

  const handleActivate = (id) => {
    trips.forEach(t => {
      if (t.isActive && t.id !== id) updateTrip(t.id, { isActive: false })
    })
    updateTrip(id, { isActive: true })
  }

  return (
    <div className="flex flex-col min-h-dvh bg-white pb-20 safe-top">
      <TopHeader title={t('trips.title')} />

      {trips.length === 0 ? (
        <EmptyState type="trips" title={t('trips.activeTrips') || 'No trips planned'} message={t('trips.addTrip') || 'Plan your next trip and manage your travel expenses with precision.'} />
      ) : (
        <div className="px-6 flex flex-col gap-10 pb-32 mt-6">
          {trips.map(trip => (
            <TripCard key={trip.id} trip={trip} currency={currency} onDelete={removeTrip} onActivate={handleActivate} />
          ))}
        </div>
      )}

      {/* FAB */}
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

      <AddTripSheet show={showAdd} onSave={addTrip} onClose={() => setShowAdd(false)} />
    </div>
  )
}
