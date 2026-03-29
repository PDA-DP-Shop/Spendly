// Scrollable calendar date strip for filtering by day
import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format, addDays, startOfWeek, isToday } from 'date-fns'

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
      className="flex gap-2 px-4 overflow-x-auto scrollbar-hide py-2"
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
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelectDate(isSelected ? null : dateStr)}
            className="flex flex-col items-center gap-1 min-w-[44px] py-2 px-1"
          >
            <span className="text-[11px] text-gray-400 font-medium">
              {dayLetters[dayLetterIdx]}
            </span>
            <motion.div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-[15px] font-sora font-semibold transition-all ${
                isSelected
                  ? 'bg-purple-600 text-white'
                  : isTodayDay
                  ? 'border-2 border-purple-600 text-purple-600'
                  : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              {dayNum}
            </motion.div>
          </motion.button>
        )
      })}
    </div>
  )
}
