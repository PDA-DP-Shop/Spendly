// CustomDatePicker — bespoke 'Flat Premium' date and time selection
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Clock, Calendar as CalIcon, Check } from 'lucide-react'
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, 
  isToday, isYesterday, startOfDay 
} from 'date-fns'

const S = { fontFamily: "'Inter', sans-serif" }

export default function CustomDatePicker({ value, onChange, onClose }) {
  const [currentMonth, setCurrentMonth] = useState(new Date(value))
  const [selectedDate, setSelectedDate] = useState(new Date(value))
  const [tempTime, setTempTime] = useState({
    h: format(new Date(value), 'HH'),
    m: format(new Date(value), 'mm')
  })
  const [view, setView] = useState('date') // 'date' | 'time'

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth))
  })

  const handleDateSelect = (day) => {
    // Keep the same time, just change the date
    const newDate = new Date(day)
    newDate.setHours(parseInt(tempTime.h))
    newDate.setMinutes(parseInt(tempTime.m))
    setSelectedDate(newDate)
  }

  const handleConfirm = () => {
    const finalDate = new Date(selectedDate)
    finalDate.setHours(parseInt(tempTime.h))
    finalDate.setMinutes(parseInt(tempTime.m))
    onChange(finalDate.toISOString())
    onClose()
  }

  const setQuickDate = (type) => {
    let d = new Date()
    if (type === 'today') d = new Date()
    if (type === 'yesterday') d = subMonths(new Date(), 0); d.setDate(d.getDate() - 1); // fix for yesterday logic
    
    // Better logic for today/yesterday to preserve time
    const target = type === 'today' ? new Date() : new Date(Date.now() - 86400000)
    const newDate = new Date(selectedDate)
    newDate.setFullYear(target.getFullYear())
    newDate.setMonth(target.getMonth())
    newDate.setHours(target.getHours())
    newDate.setMinutes(target.getMinutes())
    newDate.setDate(target.getDate())
    setSelectedDate(newDate)
    // No setTime here, just date and month and year.
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
    >
      <motion.div 
        initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.95 }}
        className="w-full max-w-[380px] bg-white rounded-[40px] border border-black overflow-hidden flex flex-col"
      >
        <div className="p-8 border-b border-[#EEEEEE] flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-[900] text-black uppercase tracking-[0.2em]" style={S}>Temporal_Input</h3>
            <p className="text-[10px] font-[900] text-[#AFAFAF] uppercase tracking-[0.1em]" style={S}>{format(selectedDate, 'MMM dd · HH:mm')}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#F6F6F6] border border-[#EEEEEE] flex items-center justify-center active:scale-90 transition-transform">
             <X className="w-5 h-5 text-black" strokeWidth={3} />
          </button>
        </div>

        <div className="p-8 flex-1">
          {view === 'date' ? (
            <>
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-8">
                <p className="text-[15px] font-[900] text-black uppercase tracking-widest" style={S}>{format(currentMonth, 'MMMM yyyy')}</p>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 bg-[#F6F6F6] rounded-full border border-[#EEEEEE] active:scale-75 transition-all">
                    <ChevronLeft className="w-5 h-5 text-black" strokeWidth={3} />
                  </button>
                  <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 bg-[#F6F6F6] rounded-full border border-[#EEEEEE] active:scale-75 transition-all">
                    <ChevronRight className="w-5 h-5 text-black" strokeWidth={3} />
                  </button>
                </div>
              </div>

              {/* Grid Header */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['S','M','T','W','T','F','S'].map((d, i) => (
                  <div key={i} className="text-center text-[10px] font-[900] text-[#D8D8D8]" style={S}>{d}</div>
                ))}
              </div>

              {/* Grid Content */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((day, i) => {
                  const isCurMonth = day.getMonth() === currentMonth.getMonth()
                  const isSelect = isSameDay(day, selectedDate)
                  return (
                    <button 
                      key={i} 
                      onClick={() => handleDateSelect(day)}
                      disabled={day > new Date()}
                      className={`h-10 rounded-xl flex items-center justify-center text-[13px] font-[900] transition-all border ${
                        isSelect ? 'bg-black text-white border-black scale-110 z-10' : 
                        day > new Date() ? 'text-[#EEEEEE] border-transparent' :
                        isCurMonth ? 'text-black border-transparent bg-white active:bg-black/5' : 'text-[#D8D8D8] border-transparent'
                      }`}
                      style={S}
                    >
                      {format(day, 'd')}
                    </button>
                  )
                })}
              </div>

               {/* Quick nodes */}
               <div className="flex gap-3 mt-10">
                 <button onClick={() => handleDateSelect(new Date())} className="flex-1 py-3 bg-[#F6F6F6] border border-[#EEEEEE] rounded-full text-[10px] font-[900] uppercase tracking-widest hover:border-black transition-all" style={S}>Today</button>
                 <button onClick={() => handleDateSelect(new Date(Date.now() - 86400000))} className="flex-1 py-3 bg-[#F6F6F6] border border-[#EEEEEE] rounded-full text-[10px] font-[900] uppercase tracking-widest hover:border-black transition-all" style={S}>Yesterday</button>
               </div>
            </>
          ) : (
            <div className="py-10 flex flex-col items-center justify-center">
               <div className="flex items-center gap-6">
                 {/* Bespoke Hour/Minute Spinner */}
                 <div className="flex flex-col items-center">
                    <p className="text-[9px] font-[900] uppercase tracking-widest text-[#AFAFAF] mb-5">Epoch_H</p>
                    <input type="number" value={tempTime.h} onChange={e => setTempTime({...tempTime, h: e.target.value.padStart(2, '0').slice(-2)})}
                      className="w-20 h-24 bg-[#F6F6F6] border border-[#EEEEEE] rounded-[24px] text-center text-[42px] font-[900] text-black outline-none focus:border-black" style={S} />
                 </div>
                 <span className="text-[32px] font-[900] text-black pt-10">:</span>
                 <div className="flex flex-col items-center">
                    <p className="text-[9px] font-[900] uppercase tracking-widest text-[#AFAFAF] mb-5">Epoch_M</p>
                    <input type="number" value={tempTime.m} onChange={e => setTempTime({...tempTime, m: e.target.value.padStart(2, '0').slice(-2)})}
                      className="w-20 h-24 bg-[#F6F6F6] border border-[#EEEEEE] rounded-[24px] text-center text-[42px] font-[900] text-black outline-none focus:border-black" style={S} />
                 </div>
               </div>
            </div>
          )}
        </div>

        <div className="p-8 bg-[#F6F6F6] flex gap-4 border-t border-[#EEEEEE]">
          <button 
             onClick={() => setView(view === 'date' ? 'time' : 'date')} 
             className="w-16 h-16 rounded-[24px] bg-white border border-[#EEEEEE] flex items-center justify-center active:scale-90 transition-all shadow-sm"
          >
            {view === 'date' ? <Clock className="w-6 h-6 text-black" /> : <CalIcon className="w-6 h-6 text-black" />}
          </button>
          
          <button 
            onClick={handleConfirm}
            className="flex-1 h-16 rounded-[24px] bg-black text-white text-[13px] font-[900] uppercase tracking-[0.25em] flex items-center justify-center gap-3 active:scale-95 transition-all"
            style={S}
          >
            <Check className="w-5 h-5 text-white" strokeWidth={4} /> Confirm_Input
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
