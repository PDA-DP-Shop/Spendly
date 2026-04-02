// Bottom navigation bar — "Floating Island" premium glassmorphism
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, BarChart2, Plus, Receipt, User } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function BottomTabBar({ onAddPress }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [tappedTab, setTappedTab] = useState(null)

  const tabs = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/reports', icon: BarChart2, label: 'Stats' },
    { path: 'plus', isFAB: true },
    { path: '/expenses', icon: Receipt, label: 'Files' },
    { path: '/settings', icon: User, label: 'Me' },
  ]

  const S = { fontFamily: "'Nunito', sans-serif" }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] px-6 pb-8 pointer-events-none">
      <div
        className="mx-auto max-w-[400px] h-[76px] flex items-center justify-between px-2 relative pointer-events-auto bg-white/70 backdrop-blur-2xl border border-white/40 rounded-[38px] shadow-[0_25px_50px_-12px_rgba(124,111,247,0.15)] ring-1 ring-black/[0.02]"
      >
        {tabs.map((tab, idx) => {
          if (tab.isFAB) {
            return (
              <div key="fab" className="relative flex-1 flex justify-center -top-2">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  animate={{ 
                    y: [0, -3, 0],
                    boxShadow: [
                      '0 10px 20px rgba(124,111,247,0.25)',
                      '0 15px 30px rgba(124,111,247,0.4)',
                      '0 10px 20px rgba(124,111,247,0.25)'
                    ]
                  }}
                  transition={{ 
                    y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                    boxShadow: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
                  }}
                  onClick={onAddPress}
                  className="w-[62px] h-[62px] rounded-[22px] flex items-center justify-center bg-[var(--primary)] text-white"
                >
                  <Plus className="w-9 h-9" strokeWidth={3.5} />
                </motion.button>
              </div>
            )
          }

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
              className="flex flex-col items-center justify-center flex-1 h-full relative group"
            >
              <motion.div
                animate={isTapping ? { scale: 0.88, y: -2 } : { scale: 1, y: 0 }}
                className="relative flex flex-col items-center justify-center z-10"
              >
                <div className="relative mb-0.5">
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="nav-island-indicator"
                        className="absolute inset-[-12px] rounded-[20px] bg-[var(--primary)]/[0.06] border border-[var(--primary)]/[0.12] z-0"
                        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                      />
                    )}
                  </AnimatePresence>
                  <Icon
                    className="w-5.5 h-5.5 relative z-10 transition-transform duration-300 group-hover:scale-110"
                    style={{ 
                      color: isActive ? 'var(--primary)' : '#94A3B8',
                      strokeWidth: isActive ? 2.5 : 2
                    }}
                  />
                </div>
                
                <span 
                  className={`text-[10px] font-[800] uppercase tracking-[0.08em] transition-all duration-300 ${isActive ? 'text-[var(--primary)] opacity-100 translate-y-0.5' : 'text-[#94A3B8] opacity-60'}`}
                  style={S}
                >
                  {tab.label}
                </span>
              </motion.div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
