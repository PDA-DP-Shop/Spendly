import { m as motion } from 'framer-motion'
import { ChevronLeft, LayoutGrid, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '../../store/uiStore'

export default function TopHeader({ title, onBack, showBack = false, showBell = true, rightElement }) {
  const navigate = useNavigate()
  const { toggleNotifications } = useUIStore()
  const S = { fontFamily: "'Nunito', sans-serif" }

  return (
    <div className="flex items-center justify-between px-6 safe-top pt-10 pb-2 bg-white sticky top-0 z-50">
      {/* Left */}
      <div className="w-11 h-11 flex items-center justify-start flex-shrink-0">
        {showBack ? (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack || (() => navigate(-1))}
            className="w-11 h-11 rounded-[16px] flex items-center justify-center bg-[#F8F7FF] border border-[#F0F0F8] shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 text-[#0F172A]" strokeWidth={2.5} />
          </motion.button>
        ) : (
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="w-11 h-11 rounded-[16px] flex items-center justify-center bg-[#F8F7FF] border border-[#F0F0F8] shadow-sm"
          >
            <LayoutGrid className="w-5 h-5 text-[#0F172A]" strokeWidth={2.5} />
          </motion.button>
        )}
      </div>

      {/* Center */}
      <h1 className="text-[18px] font-[800] text-[#0F172A] leading-none tracking-tight flex-1 text-center truncate px-2" style={S}>
        {title}
      </h1>

      {/* Right */}
      <div className="flex items-center justify-end gap-2 flex-shrink-0">
        {showBell && (
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={toggleNotifications}
            className="relative w-11 h-11 rounded-[16px] flex items-center justify-center bg-[#F8F7FF] border border-[#F0F0F8] shadow-sm"
          >
            <Bell className="w-5 h-5 text-[var(--primary)]" />
            <span className="absolute top-[12px] right-[12px] w-2.5 h-2.5 rounded-full bg-[#FF7043] border-2 border-white" />
          </motion.button>
        )}
        {rightElement}
      </div>
    </div>
  )
}
