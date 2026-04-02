// Bottom navigation bar with 5 tabs and orange FAB center button
import { motion } from 'framer-motion'
import { Home, BarChart2, Plus, Search, Settings } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from '../../hooks/useTranslation'

export default function BottomTabBar({ onAddPress }) {
  const location = useLocation()
  const navigate = useNavigate()
  const t = useTranslation()

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

    return (
      <button 
        key={tab.path} 
        onClick={() => navigate(tab.path)}
        className="flex flex-col items-center justify-center w-16 h-full active:scale-95 transition-transform"
      >
        <Icon 
          className={`w-[24px] h-[24px] mb-1.5 transition-colors duration-200 ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-gray-500'}`} 
          strokeWidth={isActive ? 2.5 : 2} 
        />
        <span className={`text-[11px] font-sora font-semibold tracking-wide transition-colors duration-200 ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-gray-500'}`}>
          {tab.label}
        </span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-6 pb-6">
      <div className="w-full max-w-md h-[72px] glass-elevated border-white/5 backdrop-blur-[32px] flex items-center justify-around px-2 relative">
        {tabsLeft.map(tab => (
          <button 
            key={tab.path} 
            onClick={() => navigate(tab.path)}
            className="flex flex-col items-center justify-center w-14 h-full relative"
          >
            <tab.icon 
              className={`w-[24px] h-[24px] mb-1 transition-all duration-300 ${location.pathname === tab.path ? 'text-cyan-glow drop-shadow-glow' : 'text-[#3D4F70]'}`} 
              strokeWidth={location.pathname === tab.path ? 2.5 : 2} 
            />
            {location.pathname === tab.path && (
              <motion.div layoutId="nav-dot" className="w-1 h-1 bg-cyan-glow rounded-full shadow-glow" />
            )}
          </button>
        ))}

        {/* Center FAB */}
        <div className="relative -top-6">
          <motion.button 
            whileTap={{ scale: 0.9 }} 
            onClick={onAddPress}
            className="w-[58px] h-[58px] rounded-full bg-gradient-to-br from-[#0066FF] to-[#00D4FF] shadow-fab flex items-center justify-center animate-glowPulse"
          >
            <Plus className="w-8 h-8 text-white" strokeWidth={3} />
          </motion.button>
        </div>

        {tabsRight.map(tab => (
          <button 
            key={tab.path} 
            onClick={() => navigate(tab.path)}
            className="flex flex-col items-center justify-center w-14 h-full relative"
          >
            <tab.icon 
              className={`w-[24px] h-[24px] mb-1 transition-all duration-300 ${location.pathname === tab.path ? 'text-cyan-glow drop-shadow-glow' : 'text-[#3D4F70]'}`} 
              strokeWidth={location.pathname === tab.path ? 2.5 : 2} 
            />
            {location.pathname === tab.path && (
              <motion.div layoutId="nav-dot" className="w-1 h-1 bg-cyan-glow rounded-full shadow-glow" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
