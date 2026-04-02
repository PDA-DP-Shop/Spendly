// Scrollable calendar date strip for filtering by day
import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format, addDays, isToday } from 'date-fns'

const S = { fontFamily: "'Nunito', sans-serif" }

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
      className="flex gap-3 px-6 overflow-x-auto scrollbar-hide py-4"
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
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectDate(isSelected ? null : dateStr)}
            className="flex flex-col items-center gap-2 min-w-[54px] py-1"
          >
            <span className="text-[11px] text-[#94A3B8] font-[800] uppercase tracking-widest" style={S}>
              {dayLetters[dayLetterIdx]}
            </span>
            <motion.div
              className={`w-11 h-11 rounded-[16px] flex items-center justify-center text-[16px] font-[800] transition-all border ${
                isSelected
                  ? 'bg-[#7C6FF7] border-[#7C6FF7] text-white shadow-lg shadow-[#7C6FF730]'
                  : isTodayDay
                  ? 'border-[#7C6FF7] text-[#7C6FF7] bg-white'
                  : 'text-[#475569] bg-white border-[#F0F0F8]'
              }`}
              style={S}
            >
              {dayNum}
            </motion.div>
          </motion.button>
        )
      })}
    </div>
  )
}
