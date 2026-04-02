// Bottom navigation bar — white premium with indigo active state and animated FAB
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, BarChart2, Plus, Search, Settings } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from '../../hooks/useTranslation'

export default function BottomTabBar({ onAddPress }) {
  const location = useLocation()
  const navigate = useNavigate()
  const t = useTranslation()
  const [tappedTab, setTappedTab] = useState(null)

  const tabsLeft = [
    { path: '/', icon: Home, label: t.home },
    { path: '/reports', icon: BarChart2, label: t.reports },
  ]
  const tabsRight = [
    { path: '/search', icon: Search, label: t.search },
    { path: '/settings', icon: Settings, label: t.settings },
  ]

  const TabItem = ({ tab }) => {
    const isActive = location.pathname === tab.path
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
        {/* Active indicator pill */}
        {isActive && (
          <motion.div
            layoutId="tab-pill"
            className="absolute top-2 w-6 h-[3px] rounded-full"
            style={{ background: '#6366F1' }}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          />
        )}

        <motion.div
          animate={isTapping ? { scale: [1, 0.8, 1.2, 1] } : { scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="mt-2"
        >
          <Icon
            className="w-6 h-6 transition-colors duration-200"
            style={{ color: isActive ? '#6366F1' : '#94A3B8' }}
            strokeWidth={isActive ? 2.5 : 2}
          />
        </motion.div>
        <span
          className="text-[11px] font-semibold mt-1 transition-colors duration-200"
          style={{ color: isActive ? '#6366F1' : '#94A3B8', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {tab.label}
        </span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div
        className="w-full h-[72px] flex items-center justify-around px-2 relative"
        style={{
          background: '#FFFFFF',
          borderTop: '1px solid #F1F5F9',
        }}
      >
        {tabsLeft.map(tab => <TabItem key={tab.path} tab={tab} />)}

        {/* Center FAB */}
        <div className="relative -top-5">
          <motion.button
            whileTap={{ scale: 0.9 }}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            onClick={onAddPress}
            className="w-[58px] h-[58px] rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
            }}
          >
            <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
          </motion.button>
        </div>

        {tabsRight.map(tab => <TabItem key={tab.path} tab={tab} />)}
      </div>
    </div>
  )
}
