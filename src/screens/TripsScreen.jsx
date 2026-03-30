// TripsScreen.jsx — Feature 10: Trip Budget Planner
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTripStore } from '../store/tripStore'
import { useSettingsStore } from '../store/settingsStore'
import TopHeader from '../components/shared/TopHeader'
import EmptyState from '../components/shared/EmptyState'
import { formatMoney } from '../utils/formatMoney'
import { format, parseISO, differenceInDays } from 'date-fns'
import { Plus, X, MapPin, Plane } from 'lucide-react'

const TRIP_COLORS = ['#7C3AED', '#F97316', '#22C55E', '#06B6D4', '#EC4899', '#EAB308']
const TRIP_EMOJIS = ['✈️','🏖️','🚗','🗼','🗽','🏔️','🏰','🌇','🏕️','🚢']

function AddTripSheet({ onSave, onClose }) {
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
    <motion.div className="fixed inset-0 z-50 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div className="relative w-full bg-white dark:bg-[#1A1A2E] rounded-t-[28px] p-6 pb-10 max-h-[85vh] overflow-y-auto"
        initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }} transition={{ type: 'spring', damping: 25 }}>
        <div className="flex items-center justify-between mb-5">
          <p className="text-[18px] font-sora font-bold text-gray-900 dark:text-white">Plan New Trip</p>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        
        {/* Style picker */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <p className="text-[12px] font-semibold text-gray-500 mb-2">Emoji</p>
            <div className="flex gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-2xl overflow-x-auto no-scrollbar">
              {TRIP_EMOJIS.map(e => (
                <button key={e} onClick={() => set('emoji', e)}
                  className={`flex-shrink-0 w-10 h-10 rounded-xl text-xl flex items-center justify-center ${form.emoji === e ? 'bg-white dark:bg-[#0F0F1A] shadow-sm ring-1 ring-gray-200 dark:ring-gray-700' : ''}`}>{e}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-[12px] font-semibold text-gray-500 mb-2">Cover Color</p>
          <div className="flex gap-3">
            {TRIP_COLORS.map(c => (
              <button key={c} onClick={() => set('color', c)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all" style={{ backgroundColor: c }}>
                {form.color === c && <div className="w-3 h-3 bg-white rounded-full" />}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        {[
          { label: 'Trip Name *', key: 'name', placeholder: 'e.g. Euro Trip, Goa' },
          { label: 'Total Budget *', key: 'budget', placeholder: '₹1,00,000', type: 'number' },
        ].map(f => (
          <div key={f.key} className="mb-4">
            <p className="text-[12px] font-semibold text-gray-500 mb-1">{f.label}</p>
            <input type={f.type || 'text'} value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder}
              className="w-full py-3 px-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 outline-none text-[15px] text-gray-900 dark:text-white" />
          </div>
        ))}
        
        <div className="flex gap-3 mb-6">
          <div className="flex-1">
            <p className="text-[12px] font-semibold text-gray-500 mb-1">Start Date</p>
            <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
              className="w-full py-3 px-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 outline-none text-[14px] text-gray-900 dark:text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-semibold text-gray-500 mb-1">End Date *</p>
            <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} min={form.startDate}
              className="w-full py-3 px-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 outline-none text-[14px] text-gray-900 dark:text-white" />
          </div>
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave}
          className="w-full py-4 rounded-[20px] text-white font-semibold flex items-center justify-center gap-2"
          style={{ backgroundColor: form.color }}>
          <Plane className="w-5 h-5" /> Start Planning
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

function TripCard({ trip, currency, onDelete, onActivate }) {
  const spent = trip.totalSpent || 0
  const progress = Math.min((spent / trip.budget) * 100, 100)
  const remaining = trip.budget - spent
  const daysLeft = trip.endDate ? Math.max(0, differenceInDays(parseISO(trip.endDate), new Date())) : trip.days
  const dailyRemaining = daysLeft > 0 ? remaining / daysLeft : 0

  return (
    <motion.div className="bg-white dark:bg-[#1A1A2E] rounded-[24px] overflow-hidden shadow-sm relative"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Cover Header */}
      <div className="p-4 flex items-start justify-between relative" style={{ backgroundColor: trip.color }}>
        <div className="relative z-10">
          <span className="text-4xl block mb-2">{trip.emoji}</span>
          <p className="font-sora font-bold text-white text-[18px] mb-1">{trip.name}</p>
          {trip.startDate && trip.endDate && (
            <p className="text-white/80 text-[11px] font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(parseISO(trip.startDate), 'MMM d')} - {format(parseISO(trip.endDate), 'MMM d, yyyy')}
            </p>
          )}
        </div>
        <button onClick={() => onDelete(trip.id)} className="p-2 text-white/50 hover:bg-white/10 rounded-full transition relative z-10"><X className="w-4 h-4" /></button>
        {/* Decorative circle */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
      </div>

      <div className="p-4">
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Left to spend</p>
            <p className="font-sora font-bold text-[22px]" style={{ color: trip.color }}>{formatMoney(remaining, currency)}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-gray-400 font-semibold mb-0.5">Budget</p>
            <p className="font-semibold text-[15px] dark:text-gray-200">{formatMoney(trip.budget, currency)}</p>
          </div>
        </div>

        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-4">
          <motion.div className="h-full rounded-full" style={{ backgroundColor: trip.color, width: `${progress}%` }} />
        </div>

        <div className="flex gap-4">
          <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
            <p className="text-[11px] text-gray-400 font-medium mb-1">Daily Budget Left</p>
            <p className="font-semibold text-[14px] text-gray-900 dark:text-white">
              {daysLeft > 0 ? formatMoney(dailyRemaining, currency) : '—'}
            </p>
          </div>
          <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
            <p className="text-[11px] text-gray-400 font-medium mb-1">Days Remaining</p>
            <p className="font-semibold text-[14px] text-gray-900 dark:text-white">{daysLeft}</p>
          </div>
        </div>

        {trip.isActive ? (
          <div className="mt-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 font-semibold text-[13px] text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
            Currently Active Trip
          </div>
        ) : (
          <button onClick={() => onActivate(trip.id)}
            className="mt-4 w-full py-2.5 rounded-xl text-white font-semibold text-[13px] transition"
            style={{ backgroundColor: trip.color }}>
            Set as Active Trip
          </button>
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
    // Deactivate all, activate one
    trips.forEach(t => {
      if (t.isActive && t.id !== id) updateTrip(t.id, { isActive: false })
    })
    updateTrip(id, { isActive: true })
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F5F5] dark:bg-[#0F0F1A] pb-20">
      <TopHeader title="My Trips" />

      {trips.length === 0 ? (
        <EmptyState type="trips" title="No trips planned" message="Create your first trip budget to start tracking holiday expenses independently." />
      ) : (
        <div className="px-4 flex flex-col gap-4 pb-24">
          {trips.map(trip => (
            <TripCard key={trip.id} trip={trip} currency={currency} onDelete={removeTrip} onActivate={handleActivate} />
          ))}
        </div>
      )}

      {/* Hero FAB */}
      <motion.button whileTap={{ scale: 0.92 }} onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full text-white shadow-xl flex items-center justify-center z-40"
        style={{ background: '#F97316' }}>
        <Plus className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {showAdd && <AddTripSheet onSave={addTrip} onClose={() => setShowAdd(false)} />}
      </AnimatePresence>
    </div>
  )
}
