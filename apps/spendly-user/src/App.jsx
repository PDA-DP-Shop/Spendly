import { useEffect, useState, lazy, Suspense, useRef } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, LazyMotion, domAnimation, m as motion } from 'framer-motion'
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
import NotificationDrawer from './components/shared/NotificationDrawer'
import GlobalLoading from './components/shared/GlobalLoading'
import { handleIncomingBill } from './services/billReceiver'
import { startNFCReceiver } from './services/nfcReceiver'
import BillReceivedPopup from './components/BillReceivedPopup'
import NFCGlow from './components/animations/NFCGlow'
import { useAppUpdate } from './hooks/useAppUpdate'
import { UpdateBanner } from './components/UpdateBanner'
import { useBadgeCheck } from './hooks/useBadgeCheck'
import BadgeEarnedCelebration from './components/shared/BadgeEarnedCelebration'


const BillCodeEntry = lazy(() => import('./screens/BillCodeEntry'))

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
const TermsScreen = lazy(() => import('./screens/TermsScreen'))
const PrivacyPolicyScreen = lazy(() => import('./screens/PrivacyPolicyScreen'))
const MigrationGuideScreen = lazy(() => import('./screens/MigrationGuideScreen'))

const TAB_PATHS = [
  '/', '/reports', '/search', '/settings', '/expenses', '/budget',
  '/wallets', '/emis', '/goals', '/trips', '/badges', '/festivals'
]

// Route depth — higher = deeper in the app (forward), lower = back
const ROUTE_DEPTH = {
  '/': 1,
  '/expenses': 2,
  '/reports': 2,
  '/search': 2,
  '/settings': 2,
  '/budget': 2,
  '/scans': 2,
  '/wallets': 2,
  '/emis': 2,
  '/goals': 2,
  '/trips': 2,
  '/badges': 2,
  '/festivals': 2,
  '/add': 3,
  '/bill-code': 3,
  '/migration-guide': 3,
  '/terms': 3,
  '/privacy': 3,
}

function getDepth(pathname) {
  return ROUTE_DEPTH[pathname] ?? 2
}

// White skeleton loader shown while lazy screen chunks load
function ScreenSkeleton() {
  const S = { fontFamily: "'Inter', sans-serif" }
  return (
    <div className="min-h-dvh bg-white px-7 pt-12">
      <div className="flex items-center gap-4 mb-10 safe-top">
        <div className="shimmer-bg w-12 h-12 rounded-full bg-[#EEEEEE]" />
        <div className="flex flex-col gap-2.5">
          <div className="shimmer-bg w-20 h-2 bg-[#EEEEEE] rounded-full" />
          <div className="shimmer-bg w-36 h-5 bg-[#EEEEEE] rounded-full" />
        </div>
      </div>
      <div className="shimmer-bg w-full h-56 rounded-[32px] mb-8 bg-[#F6F6F6]" />
      <div className="flex gap-4 mb-8">
        <div className="shimmer-bg flex-1 h-24 rounded-[24px] bg-[#F6F6F6]" />
        <div className="shimmer-bg flex-1 h-24 rounded-[24px] bg-[#F6F6F6]" />
      </div>
      <div className="shimmer-bg w-full h-28 rounded-[24px] mb-8 bg-[#F6F6F6]" />
      <div className="shimmer-bg w-24 h-2.5 rounded-full mb-6 bg-[#EEEEEE]" />
      {[1,2,3,4].map(i => (
        <div key={i} className="flex items-center gap-5 mb-5 overflow-hidden">
          <div className="shimmer-bg w-12 h-12 rounded-full bg-[#EEEEEE] flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="shimmer-bg w-3/4 h-3 bg-[#F6F6F6] rounded-full" />
            <div className="shimmer-bg w-1/2 h-2.5 bg-[#EEEEEE] rounded-full" />
          </div>
          <div className="shimmer-bg w-14 h-4 bg-[#F6F6F6] rounded-full" />
        </div>
      ))}
    </div>
  )
}

function AppWrapper() {
  const location = useLocation()

  // Aggressive auto scroll to top on navigation
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.body.scrollTo(0, 0)
    document.documentElement.scrollTo(0, 0)
    const appContent = document.querySelector('.app-content')
    if (appContent) appContent.scrollTo(0, 0)
  }, [location.pathname])

  const showTab = TAB_PATHS.includes(location.pathname)
  const [showAddSheet, setShowAddSheet] = useState(false)
  const prevPath = useRef(location.pathname)
  const [direction, setDirection] = useState(1)

  // Determine slide direction based on route depth
  const prevDepth = getDepth(prevPath.current)
  const nextDepth = getDepth(location.pathname)
  if (prevPath.current !== location.pathname) {
    const newDir = nextDepth >= prevDepth ? 1 : -1
    if (newDir !== direction) setDirection(newDir)
    prevPath.current = location.pathname
  }

  const variants = {
    initial: (dir) => ({ x: dir > 0 ? '100%' : '-30%', opacity: dir > 0 ? 1 : 0 }),
    animate: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? '-30%' : '100%', opacity: dir > 0 ? 0 : 1 }),
  }

  const isScans = location.pathname === '/scans'

  return (
    <>
      <ErrorBoundary>
        <Suspense fallback={<ScreenSkeleton />}>
          {/* ScansScreen MUST be outside the motion wrapper — position:fixed is
              relative to transformed ancestors, which would clip the camera overlay */}
          {isScans ? (
            <ScansScreen />
          ) : (
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={location.pathname}
                custom={direction}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                className="flex-1"
                style={{ willChange: 'transform' }}
              >
                <Routes location={location}>
                  <Route path="/" element={<HomeScreen />} />
                  <Route path="/expenses" element={<ExpensesScreen />} />
                  <Route path="/add" element={<AddExpenseScreen />} />
                  <Route path="/reports" element={<ReportsScreen />} />
                  <Route path="/search" element={<SearchScreen />} />
                  <Route path="/budget" element={<BudgetScreen />} />
                  <Route path="/settings" element={<SettingsScreen />} />
                  <Route path="/wallets" element={<WalletsScreen />} />
                  <Route path="/emis" element={<EMIScreen />} />
                  <Route path="/goals" element={<GoalsScreen />} />
                  <Route path="/trips" element={<TripsScreen />} />
                  <Route path="/badges" element={<BadgesScreen />} />
                  <Route path="/festivals" element={<FestivalsScreen />} />
                  <Route path="/terms" element={<TermsScreen />} />
                  <Route path="/privacy" element={<PrivacyPolicyScreen />} />
                  <Route path="/migration-guide" element={<MigrationGuideScreen />} />
                  <Route path="/bill-code" element={<BillCodeEntry onBillFound={bill => window.dispatchEvent(new CustomEvent('bill-received', { detail: bill }))} />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          )}
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
  const {
    updateReady,
    isUpdating,
    isOfflineReady,
    applyUpdate,
    dismissUpdate
  } = useAppUpdate()

  const [ready, setReady] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const settings = useSettingsStore(state => state.settings)
  const loadSettings = useSettingsStore(state => state.loadSettings)
  const isLocked = useLockStore(state => state.isLocked)
  const loadExpenses = useExpenseStore(state => state.loadExpenses)
  const isBackgrounded = useSecurityStore(state => state.isBackgrounded)
  const setBackgrounded = useSecurityStore(state => state.setBackgrounded)
  const clearEncryptionKey = useSessionStore(state => state.clearEncryptionKey)
  const [activeBill, setActiveBill] = useState(null)
  const [isReceivingNFC, setIsReceivingNFC] = useState(false)

  const [incomingBill, setIncomingBill] = useState(null)
  const [showBillPopup, setShowBillPopup] = useState(false)

  // Automated Achievement Tracking
  useBadgeCheck()

  // Desktop detection
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth > 768)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // URL Deep Link Handler
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const billData = params.get('data')
    
    if (billData) {
      try {
        const decoded = decodeURIComponent(billData)
        // UTF-8 safe decoding
        const jsonStr = decodeURIComponent(escape(atob(decoded)))
        const bill = JSON.parse(jsonStr)
        
        if (bill.type === 'SPENDLY_BILL') {
          setIncomingBill(bill)
          setShowBillPopup(true)
          // Clean URL
          window.history.replaceState({}, '', '/')
        }
      } catch (e) {
        console.error('Invalid bill data:', e)
      }
    }
  }, [])

  // NFC Receiver
  useEffect(() => {
    if (!('NDEFReader' in window)) return
    
    const startNFC = async () => {
      try {
        const ndef = new window.NDEFReader()
        await ndef.scan()
        
        ndef.addEventListener('reading', ({ message }) => {
          for (const record of message.records) {
            if (record.recordType === 'url'){
              const url = new TextDecoder().decode(record.data)
              
              if (url.includes('?data=')){
                const params = new URLSearchParams(url.split('?')[1])
                const data = params.get('data')
                
                if (data) {
                  try {
                    const decoded = decodeURIComponent(data)
                    const jsonStr = decodeURIComponent(escape(atob(decoded)))
                    const bill = JSON.parse(jsonStr)
                    setIncomingBill(bill)
                    setShowBillPopup(true)
                  } catch (e) {
                    console.error("NFC bill parse failed", e)
                  }
                }
              }
            }
          }
        })
      } catch (e) {
        console.log('NFC not available')
      }
    }
    
    startNFC()
  }, [])

  // Manual Bill Code Event Listener
  useEffect(() => {
    const handleManualBill = (e) => {
      setIncomingBill(e.detail)
      setShowBillPopup(true)
    }
    window.addEventListener('bill-received', handleManualBill)
    return () => window.removeEventListener('bill-received', handleManualBill)
  }, [])

  useEffect(() => {
    initDatabase()
      .then(() => {
        loadSettings()
        // Warm up AI scanning engine and Offline Product DB in background
        import('./services/scanner/ocrProcessor').then(m => m.preloadOCRWorker())
        import('./services/productLookup').then(m => m.preloadLocalDb())
      })
      .then(() => useLockStore.getState().loadLockoutState())
      .then(() => loadExpenses())
      .then(() => setReady(true))
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

  // Determine the content to render based on app state
  let content;
  if (!ready) {
    content = <GlobalLoading />;
  } else if (isDesktop) {
    content = <DesktopBlockScreen />;
  } else if (!settings?.onboardingDone) {
    content = <OnboardingScreen />;
  } else if (isBackgrounded || (isLocked && settings?.lockType !== 'none')) {
    content = (
      <div className="fixed inset-0 z-[999] bg-[#FFFFFF] flex items-center justify-center p-6">
        <div className="w-full max-w-[400px]">
          {isLocked && settings?.lockType !== 'none' ? (
            <LockScreen />
          ) : (
            <div className="flex flex-col items-center gap-10 text-center">
              <img src="/spendly-logo.png" className="w-[100px] h-[100px] rounded-[24px]"
                style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }} alt="Spendly" />
              <div className="flex flex-col gap-3">
                <p className="text-[#1A1A2E] font-[900] text-3xl uppercase tracking-tighter" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Spendly is Locked
                </p>
                <p className="text-[#AFAFAF] font-[700] text-[11px] uppercase tracking-[0.3em]">
                  Authentication required to continue
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } else {
    content = (
      <>
        <OfflineBanner />
        <AppWrapper />
        <PWAInstallGuide />
        <NotificationDrawer />
        <BadgeEarnedCelebration />
        {showBillPopup && incomingBill && (
          <BillReceivedPopup 
            bill={incomingBill} 
            onClose={() => setShowBillPopup(false)} 
          />
        )}
      </>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <UpdateBanner
        updateReady={updateReady}
        isUpdating={isUpdating}
        onUpdate={applyUpdate}
        onDismiss={dismissUpdate}
      />
      <NFCGlow active={isReceivingNFC} color="purple" />
      {isDesktop ? (
        <div className="w-full h-dvh bg-white overflow-hidden relative">
          {content}
        </div>
      ) : (
        <div className="app-shell flex justify-center bg-[#F8F9FA] min-h-dvh">
          <div className="app-content bg-white shadow-2xl shadow-black/5 relative overflow-x-hidden">
            {content}
          </div>
        </div>
      )}
      <div id="modal-root" className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[450px] h-full z-[1000] pointer-events-none" />
    </LazyMotion>
  )
}
