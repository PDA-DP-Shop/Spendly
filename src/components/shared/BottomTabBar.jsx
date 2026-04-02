// Bottom navigation bar — floating white premium with glassmorphism and active pill indicators
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, BarChart2, Plus, Receipt, User } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function BottomTabBar({ onAddPress }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [tappedTab, setTappedTab] = useState(null)

  const tabsLeft = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/reports', icon: BarChart2, label: 'Stats' },
  ]
  const tabsRight = [
    { path: '/expenses', icon: Receipt, label: 'Spend' },
    { path: '/settings', icon: User, label: 'Me' },
  ]

  const S = { fontFamily: "'Nunito', sans-serif" }

  const TabItem = ({ tab }) => {
    const isActive = location.pathname === tab.path || (tab.path === '/expenses' && location.pathname === '/search')
    const Icon = tab.icon
    const isTapping = tappedTab === tab.path

    return (
      <button
        key={tab.path}
        onClick={() => {
          setTappedTab(tab.path)
          setTimeout(() => setTappedTab(null), 300)
          navigate(tab.path)
        }}
        className="flex flex-col items-center justify-center flex-1 h-full relative"
      >
        <motion.div
          animate={isTapping ? { scale: 0.9 } : { scale: 1 }}
          className="relative flex flex-col items-center justify-center z-10"
        >
          <div className="relative mb-1">
            <AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-[-8px] rounded-[14px] bg-[#EEF2FF] z-0"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </AnimatePresence>
            <Icon
              className="w-5.5 h-5.5 relative z-10"
              style={{ 
                color: isActive ? 'var(--primary)' : '#94A3B8',
                strokeWidth: isActive ? 2.5 : 2
              }}
            />
          </div>
          
          <span 
            className={`text-[10px] font-[800] uppercase tracking-wider transition-all duration-300 ${isActive ? 'text-[var(--primary)] opacity-100' : 'text-[#94A3B8] opacity-60'}`}
            style={S}
          >
            {tab.label}
          </span>
        </motion.div>
      </button>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pointer-events-none">
      <div
        className="w-full h-[72px] flex items-center justify-around px-2 relative pointer-events-auto bg-white/80 backdrop-blur-xl border border-white/50 rounded-[32px] shadow-[0_20px_40px_rgba(124,111,247,0.12)]"
      >
        {tabsLeft.map(tab => <TabItem key={tab.path} tab={tab} />)}

        {/* Center FAB */}
        <div className="relative -top-[12px] px-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            animate={{ 
              y: [0, -4, 0],
              boxShadow: [
                '0 8px 16px rgba(124,111,247,0.3)',
                '0 12px 24px rgba(124,111,247,0.5)',
                '0 8px 16px rgba(124,111,247,0.3)'
              ]
            }}
            transition={{ 
              y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
              boxShadow: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
            }}
            onClick={onAddPress}
            className="w-[56px] h-[56px] rounded-2xl flex items-center justify-center bg-[var(--primary)] text-white shadow-fab"
          >
            <Plus className="w-8 h-8" strokeWidth={3.5} />
          </motion.button>
        </div>

        {tabsRight.map(tab => <TabItem key={tab.path} tab={tab} />)}
      </div>
    </div>
  )
}
