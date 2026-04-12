// Bottom navigation bar — Dark Floating Pill (matches Spendly Shop style)
import { motion, AnimatePresence } from 'framer-motion'
import { Home, BarChart2, Plus, Receipt, User } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const HAPTIC = {
  tap: {
    x: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.35, ease: 'easeInOut' }
  }
}

const S = { fontFamily: "'Inter', sans-serif" }

function TabButton({ tab, isActive, onClick }) {
  const Icon = tab.icon
  return (
    <motion.button
      variants={HAPTIC}
      whileTap="tap"
      onClick={onClick}
      className="flex flex-col items-center justify-center flex-1 h-full pointer-events-auto"
    >
      <motion.div
        animate={{ scale: isActive ? 1.08 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={isActive ? 'text-white' : 'text-white/35'}
      >
        <Icon
          className="w-[22px] h-[22px] mb-[3px]"
          style={{ strokeWidth: isActive ? 3 : 2.5 }}
        />
      </motion.div>
      <span
        className={`text-[9px] font-[800] uppercase tracking-wide transition-all ${isActive ? 'text-white' : 'text-white/35'}`}
        style={S}
      >
        {tab.label}
      </span>
      {isActive && (
        <motion.div
          layoutId="pill-dot"
          className="w-1 h-1 bg-white rounded-full mt-[3px]"
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}
    </motion.button>
  )
}

export default function BottomTabBar({ onAddPress }) {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  const tabs = [
    { path: '/',         icon: Home,     label: t('common.home')    },
    { path: '/reports',  icon: BarChart2, label: t('common.reports') },
    { path: 'plus',      isFAB: true },
    { path: '/expenses', icon: Receipt,  label: t('common.recent')  },
    { path: '/settings', icon: User,     label: t('common.profile') },
  ]

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[450px] z-[50] h-[90px] pointer-events-none flex items-end pb-4 px-4">
      {/* Dark pill */}
      <div className="w-full pointer-events-auto">
        <div className="bg-black/90 backdrop-blur-2xl rounded-[28px] flex items-center justify-between px-2 h-[68px] shadow-2xl border border-white/10 max-w-lg mx-auto">
          {tabs.map((tab) => {
            if (tab.isFAB) {
              const scanActive = location.pathname === '/scans'
              return (
                <div key="fab" className="flex-1 flex justify-center">
                  <motion.button
                    variants={HAPTIC}
                    whileTap="tap"
                    onClick={onAddPress}
                    className="w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-[0_0_0_4px_rgba(255,255,255,0.08)] active:scale-90 transition-all bg-white text-black"
                  >
                    <Plus className="w-6 h-6" strokeWidth={3} />
                  </motion.button>
                </div>
              )
            }

            const isActive = 
              location.pathname === tab.path || 
              (tab.path === '/expenses' && (location.pathname === '/search' || location.pathname === '/expenses'))

            return (
              <TabButton
                key={tab.path}
                tab={tab}
                isActive={isActive}
                onClick={() => navigate(tab.path)}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
