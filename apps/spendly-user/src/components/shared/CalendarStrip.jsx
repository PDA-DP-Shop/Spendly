// Scrollable calendar date strip for filtering by day
import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format, addDays, isToday } from 'date-fns'

const S = { fontFamily: "'Inter', sans-serif" }

export default function CalendarStrip({ selectedDate, onSelectDate }) {
  const scrollRef = useRef(null)

  // Build 14-day window: 7 days behind and 7 days ahead
  const today = new Date()
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i - 7))

  const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  // Scroll to today on mount
  useEffect(() => {
    if (scrollRef.current) {
      const todayEl = scrollRef.current.querySelector('[data-today="true"]')
      if (todayEl) todayEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [])

  return (
    <div
      ref={scrollRef}
      className="flex gap-4 px-6 overflow-x-auto scrollbar-hide py-6 border-b border-[#EEEEEE] bg-white sticky top-[64px] z-30"
    >
      {days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd')
        const isSelected = selectedDate === dateStr
        const isTodayDay = isToday(day)
        const dayNum = format(day, 'd')
        const dayLetterIdx = day.getDay()

        return (
          <motion.button
            key={dateStr}
            data-today={isTodayDay}
            whileTap={{ scale: 0.92 }}
            onClick={() => onSelectDate(isSelected ? null : dateStr)}
            className="flex flex-col items-center gap-3 min-w-[60px]"
          >
            <span className={`text-[9px] font-[900] uppercase tracking-[0.3em] transition-colors ${isSelected ? 'text-black' : 'text-[#AFAFAF]'}`} style={S}>
              {dayLetters[dayLetterIdx]}
            </span>
            <motion.div
              className={`w-14 h-14 rounded-full flex items-center justify-center text-[16px] font-[900] transition-all border ${
                isSelected
                  ? 'bg-black border-black text-white shadow-[0_12px_24px_rgba(0,0,0,0.2)]'
                  : isTodayDay
                  ? 'border-black text-black bg-[#F6F6F6] shadow-sm'
                  : 'text-black bg-white border-[#EEEEEE] active:bg-black active:text-white active:border-black'
              }`}
              style={S}
            >
              {dayNum}
            </motion.div>
            {isTodayDay && !isSelected && (
              <div className="w-1 h-1 rounded-full bg-black mt-1" />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
