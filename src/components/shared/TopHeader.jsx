// Top header with title, back button, and optional right action
import { motion } from 'framer-motion'
import { ChevronLeft, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function TopHeader({ title, showBack = false, rightElement, showBell = false, hasAlert = false }) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between px-6 pt-4 pb-2">
      <div className="flex items-center gap-3">
        {showBack && (
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#242438] flex items-center justify-center shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-white" />
          </motion.button>
        )}
        {title && (
          <h1 className="text-[22px] font-sora font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
        )}
      </div>
      {rightElement && rightElement}
      {showBell && (
        <motion.button
          whileTap={{ scale: 0.85 }}
          className="relative w-10 h-10 rounded-full bg-white dark:bg-[#242438] flex items-center justify-center shadow-sm"
        >
          <Bell className="w-5 h-5 text-gray-700 dark:text-white" />
          {hasAlert && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white" />
          )}
        </motion.button>
      )}
    </div>
  )
}
