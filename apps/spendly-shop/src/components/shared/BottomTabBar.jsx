import { motion } from 'framer-motion'
import { Home, History, Plus, Settings } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

const HAPTIC_SHAKE = {
  tap: { 
    x: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.35, ease: "easeInOut" }
  }
}

function TabButton({ tab, isActive, onClick, S }) {
  const Icon = tab.icon
  return (
    <motion.button
      variants={HAPTIC_SHAKE}
      whileTap="tap"
      onClick={onClick}
      className="flex flex-col items-center justify-center flex-1 h-full pointer-events-auto relative"
    >
      <div className="flex flex-col items-center">
        <Icon
          className="w-[22px] h-[22px] mb-1 transition-all duration-300"
          style={{ 
            color: isActive ? '#10B981' : '#AFAFAF',
            strokeWidth: isActive ? 3 : 2.5
          }}
        />
        <span 
          className={`text-[10px] font-[700] ${isActive ? 'text-emerald-500' : 'text-[#AFAFAF]'}`}
          style={S}
        >
          {tab.label}
        </span>
        
        {isActive && (
          <motion.div
            layoutId="active-nav-line"
            className="absolute -top-[1px] w-8 h-[2px] bg-emerald-500 rounded-b-full"
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </div>
    </motion.button>
  )
}

export default function BottomTabBar({ onCreatePress }) {
  const location = useLocation()
  const navigate = useNavigate()

  const tabs = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/history', icon: History, label: 'Sales' },
    { path: 'plus', isFAB: true },
    { path: '/analytics', icon: Settings, label: 'Insight' }, // Placeholder for analytics
    { path: '/settings', icon: Settings, label: 'Shop' },
  ]

  const S = { fontFamily: "'Inter', sans-serif" }

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[450px] z-[50] h-[78px] pointer-events-none">
      <div className="absolute bottom-0 left-0 w-full h-full bg-white border-t border-[#EEEEEE] pointer-events-auto" />

      <div className="mx-auto max-w-[420px] h-full flex items-center justify-between px-6 relative z-10 safe-bottom">
        {tabs.map((tab, idx) => {
          if (tab.isFAB) {
            return (
              <div key="fab" className="relative flex-1 flex justify-center pointer-events-auto">
                <motion.button
                  variants={HAPTIC_SHAKE}
                  whileTap="tap"
                  onClick={onCreatePress}
                  className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-white bg-black active:bg-[#333333] transition-colors shadow-xl shadow-emerald-100"
                >
                  <Plus className="w-8 h-8" strokeWidth={3} />
                </motion.button>
              </div>
            )
          }

          const isActive = location.pathname === tab.path
          
          return (
            <TabButton 
              key={tab.path}
              tab={tab}
              isActive={isActive}
              onClick={() => navigate(tab.path)}
              S={S}
            />
          )
        })}
      </div>
    </div>
  )
}
