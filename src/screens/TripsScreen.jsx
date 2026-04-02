// TripsScreen.jsx — Feature 10: Trip Budget Planner
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTripStore } from '../store/tripStore'
import { useSettingsStore } from '../store/settingsStore'
import TopHeader from '../components/shared/TopHeader'
import EmptyState from '../components/shared/EmptyState'
import { formatMoney } from '../utils/formatMoney'
import { format, parseISO, differenceInDays } from 'date-fns'
import { Plus, X, MapPin, Plane, Calendar, ChevronRight, Trash2 } from 'lucide-react'

const TRIP_COLORS = ['#7C6FF7', '#FF7043', '#10B981', '#06B6D4', '#EC4899', '#F59E0B']
const TRIP_EMOJIS = ['✈️','🏖️','🚗','🗼','🗽','🏔️','🏰','🌇','🏕️','🚢']

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

function AddTripSheet({ onSave, onClose, show }) {
  const [form, setForm] = useState({
    name: '', emoji: '✈️', color: TRIP_COLORS[0],
    budget: '', startDate: format(new Date(), 'yyyy-MM-dd'), endDate: ''
  })
  
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
    <BottomSheet show={show} onClose={onClose} title="Plan New Adventure">
        <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-4 ml-1" style={S}>Pick an Emoji</p>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 mb-6">
          {TRIP_EMOJIS.map(e => (
            <button key={e} onClick={() => set('emoji', e)}
              className={`w-14 h-14 rounded-2xl text-2xl flex-shrink-0 flex items-center justify-center transition-all border ${form.emoji === e ? 'bg-[#F8F7FF] border-[var(--primary)] shadow-sm' : 'bg-white border-[#F0F0F8]'}`}>{e}</button>
          ))}
        </div>

        <div className="space-y-5 mb-8">
            <div>
                <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-2 ml-1" style={S}>Trip Name</p>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Euro Summer, Goa"
                    className="w-full py-4.5 px-6 rounded-[22px] bg-[#F8F7FF] border border-[#F0F0F8] outline-none text-[16px] font-[800] text-[#0F172A] placeholder-[#CBD5E1]" style={S} />
            </div>
            <div>
                <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-2 ml-1" style={S}>Total Budget</p>
                <input type="number" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="0.00"
                    className="w-full py-4.5 px-6 rounded-[22px] bg-[#F8F7FF] border border-[#F0F0F8] outline-none text-[22px] font-[800] text-[#0F172A] placeholder-[#CBD5E1]" style={S} />
            </div>
            <div className="flex gap-4">
               <div className="flex-1">
                  <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-2 ml-1" style={S}>From</p>
                  <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
                    className="w-full py-4 px-4 rounded-[18px] bg-[#F8F7FF] border border-[#F0F0F8] outline-none text-[14px] font-[800] text-[#0F172A]" style={S} />
               </div>
               <div className="flex-1">
                  <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-2 ml-1" style={S}>To</p>
                  <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} min={form.startDate}
                    className="w-full py-4 px-4 rounded-[18px] bg-[#F8F7FF] border border-[#F0F0F8] outline-none text-[14px] font-[800] text-[#0F172A]" style={S} />
               </div>
            </div>
        </div>

        <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave}
          className="w-full py-5 rounded-[22px] text-white font-[800] text-[16px] shadow-lg shadow-[#7C6FF720] flex items-center justify-center gap-2" 
          style={{ background: 'var(--gradient-primary)', ...S }}>
          <Plane className="w-5 h-5" /> Confirm Adventure
        </motion.button>
    </BottomSheet>
  )
}

function TripCard({ trip, currency, onDelete, onActivate }) {
  const spent = trip.totalSpent || 0
  const progress = Math.min((spent / trip.budget) * 100, 100)
  const remaining = trip.budget - spent
  const daysLeft = trip.endDate ? Math.max(0, differenceInDays(parseISO(trip.endDate), new Date())) : trip.days
  const dailyRemaining = daysLeft > 0 ? remaining / daysLeft : 0

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#F0F0F8] rounded-[32px] overflow-hidden shadow-sm group">
      
      {/* Header Card Style */}
      <div className="p-6 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${trip.color}, ${trip.color}CC)` }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white opacity-10 -mr-16 -mt-16" />
        <div className="relative z-10 flex justify-between items-start">
           <div>
              <span className="text-4xl block mb-3 drop-shadow-sm">{trip.emoji}</span>
              <h4 className="text-[20px] font-[800] text-white tracking-tight" style={S}>{trip.name}</h4>
              <div className="flex items-center gap-1.5 mt-1 text-white/80">
                 <Calendar className="w-3.5 h-3.5" />
                 <p className="text-[11px] font-[800] uppercase tracking-wider" style={S}>
                    {format(parseISO(trip.startDate), 'MMM d')} - {format(parseISO(trip.endDate), 'MMM d, yyyy')}
                 </p>
              </div>
           </div>
           <motion.button whileTap={{ scale: 0.9 }} onClick={() => onDelete(trip.id)} 
             className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
             <X className="w-5 h-5" />
           </motion.button>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-1" style={S}>Budget Left</p>
            <p className="text-[24px] font-[800] text-[#0F172A] tracking-tight" style={S}>{formatMoney(remaining, currency)}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-widest" style={S}>of {formatMoney(trip.budget, currency)}</p>
          </div>
        </div>

        <div className="h-2.5 bg-[#F8F7FF] rounded-full overflow-hidden border border-[#F0F0F8] mb-6">
          <motion.div className="h-full rounded-full" style={{ backgroundColor: trip.color, width: `${progress}%` }} 
            initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }} />
        </div>

        <div className="flex gap-3 mb-6">
          <div className="flex-1 bg-[#F8F7FF] border border-[#F0F0F8] rounded-[20px] p-3 text-center">
            <p className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-1" style={S}>Daily Cap</p>
            <p className="font-[800] text-[14px] text-[#0F172A]" style={S}>
              {daysLeft > 0 ? formatMoney(dailyRemaining, currency) : 'Reached'}
            </p>
          </div>
          <div className="flex-1 bg-[#F8F7FF] border border-[#F0F0F8] rounded-[20px] p-3 text-center">
            <p className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-1" style={S}>Days Left</p>
            <p className="font-[800] text-[14px] text-[#0F172A]" style={S}>{daysLeft}</p>
          </div>
        </div>

        {trip.isActive ? (
          <div className="py-3.5 rounded-[18px] bg-[#ECFDF5] border border-[#10B98130] text-[#10B981] font-[800] text-[12px] text-center uppercase tracking-widest" style={S}>
            Targeting Active Adventure
          </div>
        ) : (
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => onActivate(trip.id)}
            className="w-full py-4 rounded-[18px] text-white font-[800] text-[13px] uppercase tracking-widest shadow-md"
            style={{ backgroundColor: trip.color, boxShadow: `0 8px 20px ${trip.color}25`, ...S }}>
            Activate Tracker
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

export default function TripsScreen() {
  const { trips, loadTrips, addTrip, removeTrip, updateTrip } = useTripStore()
  const { settings } = useSettingsStore()
  const currency = settings?.currency || 'USD'
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => { loadTrips() }, [])

  const handleActivate = (id) => {
    trips.forEach(t => {
      if (t.isActive && t.id !== id) updateTrip(t.id, { isActive: false })
    })
    updateTrip(id, { isActive: true })
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#F8F7FF] pb-20">
      <TopHeader title="Trips" />

      {trips.length === 0 ? (
        <EmptyState type="trips" title="No Expeditions" message="Initialize your first trip ledger to begin monitoring holiday expenditure." />
      ) : (
        <div className="px-6 flex flex-col gap-8 pb-32">
          {trips.map(trip => (
            <TripCard key={trip.id} trip={trip} currency={currency} onDelete={removeTrip} onActivate={handleActivate} />
          ))}
        </div>
      )}

      {/* FAB */}
      <motion.button 
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} 
        onClick={() => setShowAdd(true)}
        className="fixed bottom-28 right-6 w-16 h-16 rounded-[22px] text-white shadow-xl flex items-center justify-center z-40"
        style={{ background: 'var(--gradient-primary)' }}>
        <Plus className="w-8 h-8" strokeWidth={3} />
      </motion.button>

      <AddTripSheet show={showAdd} onSave={addTrip} onClose={() => setShowAdd(false)} />
    </div>
  )
}
