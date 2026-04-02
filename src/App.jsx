import { useEffect, useState, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import BottomTabBar from './components/shared/BottomTabBar'
import AddBottomSheet from './components/shared/AddBottomSheet'
import DesktopBlockScreen from './screens/DesktopBlockScreen'
import OnboardingScreen from './screens/OnboardingScreen'
import LockScreen from './screens/LockScreen'
import ErrorBoundary from './components/shared/ErrorBoundary'
import OfflineBanner from './components/shared/OfflineBanner'
import { useSettingsStore } from './store/settingsStore'
import { useLockStore } from './store/lockStore'
import { useSessionStore } from './store/sessionStore'
import { initDatabase } from './services/database'
import { useExpenseStore } from './store/expenseStore'
import { useSecurityStore } from './store/securityStore'
import PWAInstallGuide from './components/pwa/PWAInstallGuide'

const HomeScreen = lazy(() => import('./screens/HomeScreen'))
const ExpensesScreen = lazy(() => import('./screens/ExpensesScreen'))
const AddExpenseScreen = lazy(() => import('./screens/AddExpenseScreen'))
const ReportsScreen = lazy(() => import('./screens/ReportsScreen'))
const SearchScreen = lazy(() => import('./screens/SearchScreen'))
const ScansScreen = lazy(() => import('./screens/ScansScreen'))
const BudgetScreen = lazy(() => import('./screens/BudgetScreen'))
const SettingsScreen = lazy(() => import('./screens/SettingsScreen'))
const WalletsScreen = lazy(() => import('./screens/WalletsScreen'))
const EMIScreen = lazy(() => import('./screens/EMIScreen'))
const GoalsScreen = lazy(() => import('./screens/GoalsScreen'))
const TripsScreen = lazy(() => import('./screens/TripsScreen'))
const BadgesScreen = lazy(() => import('./screens/BadgesScreen'))
const FestivalsScreen = lazy(() => import('./screens/FestivalsScreen'))

const TAB_PATHS = ['/', '/reports', '/search', '/settings', '/expenses', '/budget', '/scans']

// White skeleton loader shown while lazy screen chunks load
function ScreenSkeleton() {
  return (
    <div className="min-h-dvh bg-white px-5 pt-4">
      <div className="flex items-center gap-3 mb-6 safe-top">
        <div className="skeleton w-10 h-10 rounded-full" />
        <div className="flex flex-col gap-2">
          <div className="skeleton w-24 h-3 rounded" />
          <div className="skeleton w-32 h-4 rounded" />
        </div>
      </div>
      <div className="skeleton w-full h-48 rounded-[24px] mb-4" />
      <div className="flex gap-3 mb-4">
        <div className="skeleton flex-1 h-20 rounded-[16px]" />
        <div className="skeleton flex-1 h-20 rounded-[16px]" />
      </div>
      <div className="skeleton w-full h-24 rounded-[16px] mb-4" />
      <div className="skeleton w-32 h-4 rounded mb-3" />
      {[1,2,3,4,5].map(i => (
        <div key={i} className="flex items-center gap-3 mb-3">
          <div className="skeleton w-11 h-11 rounded-full flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="skeleton w-3/4 h-4 rounded" />
            <div className="skeleton w-1/2 h-3 rounded" />
          </div>
          <div className="skeleton w-16 h-4 rounded" />
        </div>
      ))}
    </div>
  )
}

function AppWrapper() {
  const location = useLocation()
  const showTab = TAB_PATHS.includes(location.pathname)
  const [showAddSheet, setShowAddSheet] = useState(false)

  return (
    <>
      <ErrorBoundary>
        <Suspense fallback={<ScreenSkeleton />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/expenses" element={<ExpensesScreen />} />
            <Route path="/add" element={<AddExpenseScreen />} />
            <Route path="/reports" element={<ReportsScreen />} />
            <Route path="/search" element={<SearchScreen />} />
            <Route path="/scans" element={<ScansScreen />} />
            <Route path="/budget" element={<BudgetScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="/wallets" element={<WalletsScreen />} />
            <Route path="/emis" element={<EMIScreen />} />
            <Route path="/goals" element={<GoalsScreen />} />
            <Route path="/trips" element={<TripsScreen />} />
            <Route path="/badges" element={<BadgesScreen />} />
            <Route path="/festivals" element={<FestivalsScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>

      {showTab && (
        <>
          <BottomTabBar onAddPress={() => setShowAddSheet(true)} />
          <AddBottomSheet show={showAddSheet} onClose={() => setShowAddSheet(false)} />
        </>
      )}
    </>
  )
}

export default function App() {
  const [ready, setReady] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const settings = useSettingsStore(state => state.settings)
  const loadSettings = useSettingsStore(state => state.loadSettings)
  const isLocked = useLockStore(state => state.isLocked)
  const loadExpenses = useExpenseStore(state => state.loadExpenses)
  const isBackgrounded = useSecurityStore(state => state.isBackgrounded)
  const setBackgrounded = useSecurityStore(state => state.setBackgrounded)
  const clearEncryptionKey = useSessionStore(state => state.clearEncryptionKey)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth > 1024)
    check()
    window.addEventListener('resize', check)

    initDatabase()
      .then(() => loadSettings())
      .then(() => useLockStore.getState().loadLockoutState())
      .then(() => loadExpenses())
      .then(() => setReady(true))

    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const handleVisibility = () => {
      if (useSecurityStore.getState().pauseSecurity) return
      const isHidden = document.visibilityState === 'hidden'
      setBackgrounded(isHidden)
      if (isHidden) {
        clearEncryptionKey()
        navigator.clipboard.writeText('').catch(() => {})
      }
    }

    const handleCopy = () => {
      setTimeout(() => {
        navigator.clipboard.writeText('').catch(() => {})
      }, 30000)
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('pagehide', () => {
      if (!useSecurityStore.getState().pauseSecurity) clearEncryptionKey()
    })
    window.addEventListener('blur', () => {
      if (useSecurityStore.getState().pauseSecurity) return
      setTimeout(() => {
        if (!useSecurityStore.getState().pauseSecurity && (document.hidden || !document.hasFocus())) {
          clearEncryptionKey()
          setBackgrounded(true)
        }
      }, 1000)
    })
    document.addEventListener('copy', handleCopy)

    const resetIdle = () => useLockStore.getState().resetAutoLockTimer(60)
    window.addEventListener('mousemove', resetIdle)
    window.addEventListener('keydown', resetIdle)
    window.addEventListener('touchstart', resetIdle)
    window.addEventListener('click', resetIdle)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('pagehide', clearEncryptionKey)
      document.removeEventListener('copy', handleCopy)
      window.removeEventListener('mousemove', resetIdle)
      window.removeEventListener('keydown', resetIdle)
      window.removeEventListener('touchstart', resetIdle)
      window.removeEventListener('click', resetIdle)
    }
  }, [setBackgrounded, clearEncryptionKey])

  // Loading screen
  if (!ready) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center bg-white">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative flex items-center justify-center mb-6"
        >
          <div className="absolute w-[120px] h-[120px] rounded-[32px] opacity-30 blur-[16px]"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', animation: 'fabPulse 2s ease-in-out infinite' }} />
          <img src="/spendly-logo.png" alt="Spendly"
            className="relative z-10 w-[100px] h-[100px] rounded-[26px] drop-shadow-xl"
            style={{ animation: 'logo-float 3s ease-in-out infinite' }} />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-[22px] font-bold text-[#0F172A] mb-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Spendly
        </motion.p>
        <p className="text-[14px] text-[#94A3B8] mb-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Setting things up...
        </p>
        <div className="w-[200px] h-[4px] bg-[#F1F5F9] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
          />
        </div>
      </div>
    )
  }

  if (isDesktop) return <DesktopBlockScreen />
  if (!settings?.onboardingDone) return <OnboardingScreen />
  if (isBackgrounded || (isLocked && settings?.lockType !== 'none')) {
    return (
      <div className="fixed inset-0 z-[999] bg-white flex items-center justify-center">
        {isLocked && settings?.lockType !== 'none' ? (
          <LockScreen />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <img src="/spendly-logo.png" className="w-[90px] h-[90px] rounded-[22px]"
              style={{ boxShadow: '0 8px 32px rgba(99,102,241,0.2)' }} alt="Spendly" />
            <p className="text-[#0F172A] font-bold text-xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Spendly is Locked
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative z-10 w-full min-h-dvh bg-white">
      <OfflineBanner />
      <AppWrapper />
      <PWAInstallGuide />
    </div>
  )
}
