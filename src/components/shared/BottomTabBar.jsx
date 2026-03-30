// Bottom navigation bar with 5 tabs and orange FAB center button
import { motion } from 'framer-motion'
import { Home, BarChart2, Plus, Search, Settings } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

const tabsLeft = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/reports', icon: BarChart2, label: 'Analytics' },
]

const tabsRight = [
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/settings', icon: Settings, label: 'Account' },
]

export default function BottomTabBar({ onAddPress }) {
  const location = useLocation()
  const navigate = useNavigate()

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
    <div className="fixed bottom-0 left-0 right-0 z-50 w-full" style={{ filter: 'drop-shadow(0px -4px 20px rgba(0,0,0,0.06))' }}>
      
      {/* Background with perfect semi-circle cutout */}
      <div 
        className="absolute bottom-0 left-0 w-full bg-white dark:bg-[#151523] h-[75px]"
        style={{
          WebkitMaskImage: 'radial-gradient(circle at 50% 0px, transparent 36px, black 37px)',
          maskImage: 'radial-gradient(circle at 50% 0px, transparent 36px, black 37px)',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      />

      {/* Content wrapper */}
      <div 
        className="relative flex items-center justify-between w-full h-[75px] px-2"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex-1 flex justify-around items-center h-full pt-1">
          {tabsLeft.map(tab => <TabItem key={tab.path} tab={tab} />)}
        </div>

        {/* Center FAB positioned exactly in the cutout */}
        <div className="relative flex justify-center items-start w-[80px] h-full">
          <motion.button 
            whileTap={{ scale: 0.9 }} 
            onClick={onAddPress}
            className="absolute -top-[28px] flex items-center justify-center w-[56px] h-[56px] rounded-full bg-[#1C163C] dark:bg-purple-600 shadow-xl"
            style={{ 
               boxShadow: '0px 10px 25px rgba(28,22,60,0.5)', 
            }}
          >
            <Plus className="w-8 h-8 text-white" strokeWidth={2.5} />
          </motion.button>
        </div>

        <div className="flex-1 flex justify-around items-center h-full pt-1">
          {tabsRight.map(tab => <TabItem key={tab.path} tab={tab} />)}
        </div>
      </div>
    </div>
  )
}
