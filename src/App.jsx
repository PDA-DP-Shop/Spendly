import { useEffect, useState, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import BottomTabBar from './components/shared/BottomTabBar'
import AddBottomSheet from './components/shared/AddBottomSheet'
import DesktopBlockScreen from './screens/DesktopBlockScreen'
import OnboardingScreen from './screens/OnboardingScreen'
import LockScreen from './screens/LockScreen'
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


// Pages that show the bottom tab bar
const TAB_PATHS = ['/', '/reports', '/search', '/settings', '/expenses', '/budget', '/scans']

function AppWrapper() {
  const location = useLocation()
  const showTab = TAB_PATHS.includes(location.pathname)
  const [showAddSheet, setShowAddSheet] = useState(false)

  return (
    <>
      <Suspense fallback={
        <div className="h-dvh flex items-center justify-center bg-white dark:bg-[#0F0F1A]">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
      }>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/expenses" element={<ExpensesScreen />} />
          <Route path="/add" element={<AddExpenseScreen />} />
          <Route path="/reports" element={<ReportsScreen />} />
          <Route path="/search" element={<SearchScreen />} />
          <Route path="/scans" element={<ScansScreen />} />
          <Route path="/budget" element={<BudgetScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

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
    // Block desktop screens
    const check = () => setIsDesktop(window.innerWidth > 1024)
    check()
    window.addEventListener('resize', check)

    // Initialize DB and load settings
    initDatabase()
      .then(() => loadSettings())
      .then(() => useLockStore.getState().loadLockoutState())
      .then(() => loadExpenses())
      .then(() => setReady(true))

    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const handleVisibility = () => {
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
    window.addEventListener('pagehide', clearEncryptionKey)
    window.addEventListener('blur', () => {
      // Small delay to allow for OS-level task switching visuals
      setTimeout(() => {
        if (document.hidden || !document.hasFocus()) {
          clearEncryptionKey()
          setBackgrounded(true)
        }
      }, 1000)
    })
    document.addEventListener('copy', handleCopy)
    
    // Attack 9 Requirement: Auto-lock after 60s idle
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

  if (!ready) {
    return (
      <div className="h-dvh flex items-center justify-center bg-[#F5F5F5] dark:bg-[#0F0F1A]">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-[130px] h-[130px] rounded-[35px] opacity-65 blur-[15px] animate-[spin_2s_linear_infinite]" style={{ background: 'conic-gradient(from 0deg, #7C3AED, #F97316, #3B82F6, #7C3AED)' }}></div>
          <img src="/icon-192.png" alt="Spendly" className="relative z-10 w-[120px] h-[120px] rounded-[26px] drop-shadow-xl" style={{ animation: 'logo-float 3s ease-in-out infinite' }} />
        </div>
      </div>
    )
  }

  if (isDesktop) return <DesktopBlockScreen />
  if (!settings?.onboardingDone) return <OnboardingScreen />
  if (isBackgrounded || (isLocked && settings?.lockType !== 'none')) {
    return (
      <div className="fixed inset-0 z-[999] bg-white dark:bg-[#0F0F1A] flex items-center justify-center">
        {isLocked && settings?.lockType !== 'none' ? (
          <LockScreen />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <img src="/icon-192.png" className="w-[100px] h-[100px] rounded-[24px]" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} alt="Spendly" />
            <p className="text-purple-900 dark:text-purple-200 font-sora font-bold text-xl">Spendly is Locked</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <AppWrapper />
      <PWAInstallGuide />
    </div>
  )
}
