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
import { RefreshCw, AlertTriangle, AlertCircle, Database } from 'lucide-react'
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
import PersistenceBanners from './components/shared/PersistenceBanners'
import UndoDeleteToast from './components/shared/UndoDeleteToast'


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
const DeletedItemsScreen = lazy(() => import('./screens/DeletedItemsScreen'))
const ViewBillScreen = lazy(() => import('./screens/ViewBillScreen'))
const CashWalletScreen = lazy(() => import('./screens/CashWalletScreen'))
const BankAccountsScreen = lazy(() => import('./screens/BankAccountsScreen'))
const WalletTransactionsScreen = lazy(() => import('./screens/WalletTransactionsScreen'))

const DeleteConfirmScreen = lazy(() => import('./screens/delete-recovery/DeleteConfirmScreen'))
const DeleteTimerScreen = lazy(() => import('./screens/delete-recovery/DeleteTimerScreen'))
const DeleteProgressScreen = lazy(() => import('./screens/delete-recovery/DeleteProgressScreen'))
const DeleteSuccessScreen = lazy(() => import('./screens/delete-recovery/DeleteSuccessScreen'))
const RecoverDataScreen = lazy(() => import('./screens/delete-recovery/RecoverDataScreen'))
const RecoverProgressScreen = lazy(() => import('./screens/delete-recovery/RecoverProgressScreen'))
const RecoverSuccessScreen = lazy(() => import('./screens/delete-recovery/RecoverSuccessScreen'))

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
  '/view-bill': 3,
  '/delete-confirm': 3,
  '/delete-timer': 4,
  '/delete-progress': 5,
  '/delete-success': 6,
  '/recover-data': 3,
  '/recover-progress': 4,
  '/recover-success': 5,
  '/cash-wallet': 3,
  '/bank-accounts': 3,
  '/wallet-history': 4,
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
  const [deletedExpense, setDeletedExpense] = useState(null)
  const { restoreExpense } = useExpenseStore()

  // Track manual deletion to show toast
  useEffect(() => {
    const handleDeleted = (e) => setDeletedExpense(e.detail)
    window.addEventListener('expense-deleted', handleDeleted)
    return () => window.removeEventListener('expense-deleted', handleDeleted)
  }, [])

  // Aggressive auto scroll to top on navigation
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.body.scrollTo(0, 0)
    document.documentElement.scrollTo(0, 0)
    const appContent = document.querySelector('.app-content')
    if (appContent) appContent.scrollTo(0, 0)
  }, [location.pathname])

  // URL Deep Link Handler
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const billData = params.get('data')
    
    if (billData) {
      try {
        const decoded = decodeURIComponent(billData)
        const jsonStr = decodeURIComponent(escape(atob(decoded)))
        const data = JSON.parse(jsonStr)
        let bill = data;

        // Handle Version 2 (Minified)
        if (data.v === 2 || data.s) {
          bill = {
            shopName: data.s,
            total: data.t,
            shopCategory: data.c,
            billNumber: data.bn,
            billId: data.bi,
            timestamp: data.ts,
            items: (data.i || []).map(it => ({
              name: it.n,
              price: it.p,
              quantity: it.q
            })),
            type: 'SPENDLY_BILL'
          }
        }
        
        if (bill.type === 'SPENDLY_BILL') {
          window.dispatchEvent(new CustomEvent('bill-received', { detail: bill }))
          window.history.replaceState({}, '', '/')
        }
      } catch (e) {
        console.error('Deep Link Error:', e)
      }
    }
  }, [location.search])

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
      <PersistenceBanners />
      <UndoDeleteToast 
        expense={deletedExpense} 
        onUndo={() => restoreExpense(deletedExpense.id)}
        onVisibleChange={(v) => !v && setDeletedExpense(null)}
      />
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
                  <Route path="/cash-wallet" element={<CashWalletScreen />} />
                  <Route path="/bank-accounts" element={<BankAccountsScreen />} />
                  <Route path="/wallet-history" element={<WalletTransactionsScreen />} />
                  <Route path="/festivals" element={<FestivalsScreen />} />
                  <Route path="/terms" element={<TermsScreen />} />
                  <Route path="/privacy" element={<PrivacyPolicyScreen />} />
                  <Route path="/deleted-items" element={<DeletedItemsScreen />} />
                  <Route path="/migration-guide" element={<MigrationGuideScreen />} />
                  <Route path="/view-bill/:id" element={<ViewBillScreen />} />
                  <Route path="/delete-confirm" element={<DeleteConfirmScreen />} />
                  <Route path="/delete-timer" element={<DeleteTimerScreen />} />
                  <Route path="/delete-progress" element={<DeleteProgressScreen />} />
                  <Route path="/delete-success" element={<DeleteSuccessScreen />} />
                  <Route path="/recover-data" element={<RecoverDataScreen />} />
                  <Route path="/recover-progress" element={<RecoverProgressScreen />} />
                  <Route path="/recover-success" element={<RecoverSuccessScreen />} />
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
  const [initError, setInitError] = useState(null)
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
    const initApp = async () => {
      try {
        await initDatabase()
        await loadSettings()
        
        // Warm up AI scanning engine
        import('./services/scanner/ocrProcessor').then(m => m.preloadOCRWorker())
        import('./services/productLookup').then(m => m.preloadLocalDb())
        
        // Initialize Data Safety Engines
        const { browserService } = await import('./services/browserService')
        const { persistenceService } = await import('./services/persistenceService')
        const { softDeleteService } = await import('./services/softDeleteService')
        const { backupService } = await import('./services/backupService')
        const { useUIStore } = await import('./store/uiStore')
        
        await browserService.initTracking()
        const bState = browserService.detect()
        const preferred = await browserService.getPreferredBrowser()
        
        // Persistence check
        const health = await persistenceService.checkStorageHealth()
        useUIStore.getState().setStorageHealth(health)
        
        // Set UI banners based on logic
        if (!preferred && !bState.isPWA) {
          useUIStore.getState().setBanner('browser', true)
        }
        
        const shouldBackup = await backupService.shouldRemind()
        if (shouldBackup) {
          useUIStore.getState().setBanner('backup', true)
        }
        
        useUIStore.getState().setBrowserState({ ...bState, preferred, isWrong: bState.browser !== preferred && preferred && !bState.isPWA })
        
        // Maintenance: Cleanup old recycle bin items
        await softDeleteService.cleanupExpiredDeleted()
        
        // Maintenance: Check recovery vault expiry
        const { recoveryVaultService } = await import('./services/recoveryVault')
        await recoveryVaultService.getActiveVault() // This internally checks expiry and deletes if needed
        
        await useLockStore.getState().loadLockoutState()
        await loadExpenses()
        setReady(true)
      } catch (err) {
        console.error('Spendly Initialization Failed:', err)
        setInitError(err)
        setReady(true)
      }
    }
    
    initApp()
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

  const [showReloadConfirm, setShowReloadConfirm] = useState(false);
  const handleReload = () => window.location.reload();

  // Determine the content to render based on app state
  let content;
  if (!ready) {
    content = <GlobalLoading />;
  } else if (initError) {
    content = (
      <div className="fixed inset-0 bg-[#FFFFFF] flex items-center justify-center p-8 text-center safe-area-inset">
        <div className="w-full max-w-[400px]">
          <div className="w-24 h-24 rounded-[32px] bg-red-50 flex items-center justify-center mx-auto mb-10 shadow-lg shadow-red-500/10">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-[32px] font-[900] text-black tracking-tight leading-tight mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>Database Recovery</h2>
          <p className="text-[#64748B] text-[16px] font-[500] leading-relaxed mb-12" style={{ fontFamily: "'Inter', sans-serif" }}>
            Spendly encountered a critical storage conflict. To keep your app running smoothly, we need to perform a system reset.
          </p>
          <div className="space-y-4">
             <motion.button 
               whileTap={{ scale: 0.96 }}
               onClick={async () => {
                 const { secureWipe } = await import('./services/database')
                 await secureWipe()
               }}
               className="w-full py-5 rounded-3xl bg-black text-white font-[802] text-[16px] shadow-xl flex items-center justify-center gap-3"
               style={{ fontFamily: "'Inter', sans-serif" }}
             >
               <Database className="w-5 h-5" /> Full Factory Reset
             </motion.button>
             <p className="text-[11px] font-[800] text-[#CBD5E1] uppercase tracking-[0.2em]">This will clear all local data</p>
          </div>
        </div>
      </div>
    )
  } else if (!settings?.onboardingDone) {
    content = <OnboardingScreen />;
  } else if (isBackgrounded || (isLocked && settings?.lockType !== 'none')) {
    content = (
      <div className="fixed inset-0 z-[999] bg-[#FFFFFF] flex items-center justify-center p-6 transition-all duration-300">
        <div className="w-full max-w-[400px] relative">
          {/* Troubleshooting Reload button - absolute top right of the privacy view */}
          <div className="absolute -top-32 -right-4">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowReloadConfirm(true)}
              className="w-12 h-12 rounded-full bg-[#F6F6F6] border border-[#EEEEEE] flex items-center justify-center"
            >
              <RefreshCw className="w-5 h-5 text-black" strokeWidth={2.5} />
            </motion.button>
          </div>

          <AnimatePresence>
            {showReloadConfirm && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center p-8 text-center"
              >
                 <div className="w-20 h-20 rounded-[28px] bg-red-50 flex items-center justify-center mb-8">
                   <AlertTriangle className="w-10 h-10 text-red-500" />
                 </div>
                 <h3 className="text-[24px] font-[900] text-black tracking-tight mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>Reload Spendly?</h3>
                 <p className="text-[#545454] text-[15px] font-[500] leading-relaxed mb-10" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Refreshing will reset the current session UI. Your data is safely stored offline and will not be affected. 
                 </p>
                 <div className="w-full flex flex-col gap-3">
                   <motion.button whileTap={{ scale: 0.96 }} onClick={handleReload}
                     className="w-full py-5 rounded-2xl bg-black text-white font-[802] text-[16px] shadow-xl" style={{ fontFamily: "'Inter', sans-serif" }}>
                     Yes, Refresh App
                   </motion.button>
                   <button onClick={() => setShowReloadConfirm(false)} className="w-full py-5 font-[800] text-[#AFAFAF] uppercase tracking-widest text-[13px]" style={{ fontFamily: "'Inter', sans-serif" }}>Cancel</button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

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
