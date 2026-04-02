// Bottom navigation bar — white premium with purple active state and animated FAB
import { useState } from 'react'
import { m as motion } from 'framer-motion'
import { Home, BarChart2, Plus, Receipt, User } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from '../../hooks/useTranslation'

export default function BottomTabBar({ onAddPress }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [tappedTab, setTappedTab] = useState(null)

  const tabsLeft = [
    { path: '/', icon: Home },
    { path: '/reports', icon: BarChart2 },
  ]
  const tabsRight = [
    { path: '/expenses', icon: Receipt },
    { path: '/settings', icon: User },
  ]

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
        className="flex flex-col items-center justify-center w-16 h-full relative"
      >
        <motion.div
          animate={isTapping ? { scale: [1, 0.8, 1.2, 1] } : { scale: 1 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 400, damping: 20 }}
          className="relative flex flex-col items-center justify-center"
        >
          {/* Active indicator dot */}
          {isActive && (
            <motion.div
              layoutId="tab-dot"
              className="absolute -top-3 w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--primary)' }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}

          <Icon
            className="w-6 h-6 transition-colors duration-200"
            style={{ 
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              fill: isActive ? 'var(--primary)' : 'transparent'
            }}
            strokeWidth={isActive ? 0 : 2}
          />
        </motion.div>
      </button>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe pointer-events-none">
      <div
        className="w-full h-[72px] flex items-center justify-around px-2 relative pointer-events-auto"
        style={{
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border)',
        }}
      >
        {tabsLeft.map(tab => <TabItem key={tab.path} tab={tab} />)}

        {/* Center FAB */}
        <div className="relative -top-[20px]">
          <motion.button
            whileTap={{ scale: 0.9, rotate: 45 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ 
              scale: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
              rotate: { duration: 0.2, type: 'spring' },
              whileTap: { duration: 0.15, type: 'spring' }
            }}
            onClick={onAddPress}
            className="w-[58px] h-[58px] rounded-full flex items-center justify-center"
            style={{
              background: 'var(--primary)',
              boxShadow: 'var(--shadow-fab)',
            }}
          >
            <Plus className="w-6 h-6 text-white" strokeWidth={3} />
          </motion.button>
        </div>

        {tabsRight.map(tab => <TabItem key={tab.path} tab={tab} />)}
      </div>
    </div>
  )
}
