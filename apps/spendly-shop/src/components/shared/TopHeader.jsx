import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const HAPTIC_SHAKE = {
  tap: { 
    x: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.35, ease: "easeInOut" }
  }
}

export default function TopHeader({ title, onBack, showBack = false, showBell = false, rightElement }) {
  const navigate = useNavigate()
  const S = { fontFamily: "'Inter', sans-serif" }

  return (
    <div 
      className="flex items-center justify-between px-7 pb-4 bg-white sticky top-0 z-50 border-b border-[#F6F6F6]"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)' }}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {showBack && (
          <motion.button
            variants={HAPTIC_SHAKE}
            whileTap="tap"
            onClick={onBack || (() => navigate(-1))}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#F6F6F6] border border-[#EEEEEE] flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5 text-black" strokeWidth={3} />
          </motion.button>
        )}
        <h1 className="text-[24px] font-[800] text-black tracking-tight truncate leading-tight" style={S}>
          {title}
        </h1>
      </div>

      <div className="flex items-center justify-end gap-2.5 flex-shrink-0">
        {rightElement}
      </div>
    </div>
  )
}
