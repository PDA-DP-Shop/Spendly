import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Home, Receipt, Users, User } from 'lucide-react';
import SplashScreen from './screens/SplashScreen';
import { useSettingsStore } from './store/settingsStore';
import { useLockStore } from './store/lockStore';
import OnboardingScreen from './screens/OnboardingScreen';
import LockScreen from './screens/LockScreen';
import HomeScreen from './screens/HomeScreen';
import CreateBillScreen from './screens/CreateBillScreen';
import SendBillScreen from './screens/SendBillScreen';
import BillHistoryScreen from './screens/BillHistoryScreen';
import BillDetailScreen from './screens/BillDetailScreen';
import CustomerBookScreen from './screens/CustomerBookScreen';
import CustomerDetailScreen from './screens/CustomerDetailScreen';
import ItemsMenuScreen from './screens/ItemsMenuScreen';
import ReportsScreen from './screens/ReportsScreen';
import SettingsScreen from './screens/SettingsScreen';
<<<<<<< HEAD
import RecentlyDeletedScreen from './screens/RecentlyDeletedScreen';
import DesktopBlockScreen from './screens/DesktopBlockScreen';
import CashWalletScreen from './screens/CashWalletScreen';
import BankAccountsScreen from './screens/BankAccountsScreen';
import WalletTransactionsScreen from './screens/WalletTransactionsScreen';
=======
import CashWalletScreen from './screens/CashWalletScreen';
import BankAccountsScreen from './screens/BankAccountsScreen';
import WalletHistoryScreen from './screens/WalletHistoryScreen';
import RecentlyDeletedScreen from './screens/RecentlyDeletedScreen';
import DesktopBlockScreen from './screens/DesktopBlockScreen';
>>>>>>> 41f113d (upgrade scanner)
import DeleteConfirmScreen from './screens/delete-recovery/DeleteConfirmScreen';
import DeleteTimerScreen from './screens/delete-recovery/DeleteTimerScreen';
import DeleteProgressScreen from './screens/delete-recovery/DeleteProgressScreen';
import DeleteSuccessScreen from './screens/delete-recovery/DeleteSuccessScreen';
import RecoverDataScreen from './screens/delete-recovery/RecoverDataScreen';
import RecoverProgressScreen from './screens/delete-recovery/RecoverProgressScreen';
import RecoverSuccessScreen from './screens/delete-recovery/RecoverSuccessScreen';
<<<<<<< HEAD
import { useSettingsStore } from './store/settingsStore';
import { useShopStore } from './store/shopStore';
=======
>>>>>>> 41f113d (upgrade scanner)

// ── Route depth for directional navigation ────────────────────────────────────
const ROUTE_DEPTH = {
  '/': 0,
  '/onboarding': 0,
  '/lock': 1,
  '/home': 2,
  '/bills-history': 3,
  '/customers': 3,
  '/reports': 3,
  '/settings': 3,
  '/items': 3,
  '/cash-wallet': 3,
  '/bank-accounts': 3,
  '/wallet-history': 4,
  '/create-bill': 4,
  '/send-bill': 5,
  '/bill': 4,
  '/customer': 4,
  '/recently-deleted': 4,
  '/delete-confirm': 4,
  '/delete-timer': 5,
  '/delete-progress': 6,
  '/delete-success': 7,
  '/recover-data': 4,
  '/recover-progress': 5,
  '/recover-success': 6,
<<<<<<< HEAD
=======
  '/cash-wallet': 3,
  '/bank-wallet': 3,
  '/wallet-history': 4,
>>>>>>> 41f113d (upgrade scanner)
};

function getDepth(pathname) {
  const base = '/' + pathname.split('/')[1];
  return ROUTE_DEPTH[pathname] ?? ROUTE_DEPTH[base] ?? 3;
}

// ── Animated page transitions ─────────────────────────────────────────────────
function AnimatedRoutes() {
  const location = useLocation();
  const prevPath = useRef(location.pathname);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const prev = prevPath.current;
    const next = location.pathname;
    const prevDepth = getDepth(prev);
    const nextDepth = getDepth(next);
    setDirection(nextDepth >= prevDepth ? 1 : -1);
    prevPath.current = next;
  }, [location.pathname]);

  const variants = {
    initial: (dir) => ({ x: dir > 0 ? '100%' : '-30%', opacity: dir > 0 ? 1 : 0 }),
    animate: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? '-30%' : '100%', opacity: dir > 0 ? 0 : 1 }),
  };

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={location.pathname}
        custom={direction}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        className="w-full"
        style={{ willChange: 'transform' }}
      >
        <Routes location={location}>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/onboarding" element={<OnboardingScreen />} />
          <Route path="/lock" element={<LockScreen />} />
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/create-bill" element={<CreateBillScreen />} />
          <Route path="/send-bill/:id" element={<SendBillScreen />} />
          <Route path="/bills-history" element={<BillHistoryScreen />} />
          <Route path="/bill/:id" element={<BillDetailScreen />} />
          <Route path="/customers" element={<CustomerBookScreen />} />
          <Route path="/customer/:id" element={<CustomerDetailScreen />} />
          <Route path="/items" element={<ItemsMenuScreen />} />
          <Route path="/reports" element={<ReportsScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
<<<<<<< HEAD
          <Route path="/cash-wallet" element={<CashWalletScreen />} />
          <Route path="/bank-accounts" element={<BankAccountsScreen />} />
          <Route path="/wallet-history" element={<WalletTransactionsScreen />} />
=======
>>>>>>> 41f113d (upgrade scanner)
          <Route path="/recently-deleted" element={<RecentlyDeletedScreen />} />
          <Route path="/delete-confirm" element={<DeleteConfirmScreen />} />
          <Route path="/delete-timer" element={<DeleteTimerScreen />} />
          <Route path="/delete-progress" element={<DeleteProgressScreen />} />
          <Route path="/delete-success" element={<DeleteSuccessScreen />} />
          <Route path="/recover-data" element={<RecoverDataScreen />} />
          <Route path="/recover-progress" element={<RecoverProgressScreen />} />
          <Route path="/recover-success" element={<RecoverSuccessScreen />} />
<<<<<<< HEAD
=======
          <Route path="/cash-wallet" element={<CashWalletScreen />} />
          <Route path="/bank-wallet" element={<BankAccountsScreen />} />
          <Route path="/wallet-history" element={<WalletHistoryScreen />} />
>>>>>>> 41f113d (upgrade scanner)
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Bottom Tab Bar — exact Spendly User style ─────────────────────────────────
const TAB_ROUTES = ['/home', '/bills-history', '/customers', '/reports', '/settings'];

const HAPTIC = {
  tap: { x: [0, -3, 3, -3, 3, 0], transition: { duration: 0.35, ease: 'easeInOut' } }
};

function TabButton({ tab, isActive, onClick }) {
  const Icon = tab.icon;
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
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
        style={{ fontFamily: "'Inter', sans-serif" }}
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
  );
}

function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { path: '/home',          label: 'Home',    icon: Home    },
    { path: '/bills-history', label: 'Bills',   icon: Receipt },
    { path: '/create-bill',   isFAB: true },
    { path: '/customers',     label: 'Clients', icon: Users   },
    { path: '/settings',      label: 'Profile', icon: User    },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[450px] z-[50] h-[90px] pointer-events-none flex items-end pb-4 px-4">
      <div className="w-full pointer-events-auto">
        <div className="bg-black/90 backdrop-blur-2xl rounded-[28px] flex items-center justify-between px-2 h-[68px] border border-white/10 max-w-lg mx-auto">
          {tabs.map((tab) => {
            if (tab.isFAB) {
              return (
                <div key="fab" className="flex-1 flex justify-center">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/create-bill')}
                    className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-black bg-white active:scale-90 transition-transform"
                  >
                    <Plus className="w-6 h-6" strokeWidth={3} />
                  </motion.button>
                </div>
              );
            }

            const isActive = location.pathname === tab.path;
            return (
              <TabButton
                key={tab.path}
                tab={tab}
                isActive={isActive}
                onClick={() => navigate(tab.path)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── App Shell ─────────────────────────────────────────────────────────────────
function AppShell() {
  const location = useLocation();
  const { isLocked, lockType, loadLockoutState } = useLockStore();
  const { settings } = useSettingsStore();
  
  const showTab = TAB_ROUTES.includes(location.pathname);
  const isOnboarding = location.pathname === '/onboarding';

  useEffect(() => {
    loadLockoutState();
  }, [loadLockoutState]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.body.scrollTo(0, 0);
    document.documentElement.scrollTo(0, 0);
    const appContent = document.querySelector('.app-content');
    if (appContent) appContent.scrollTo(0, 0);
  }, [location.pathname]);

  // Global Auth Guard: If app is locked and not on onboarding, force LockScreen
  if (settings?.onboardingDone && isLocked && lockType !== 'none' && !isOnboarding) {
    return <LockScreen />;
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AnimatedRoutes />
      {showTab && <BottomTabBar />}
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const loadSettings = useSettingsStore(state => state.loadSettings);

  useEffect(() => {
    loadSettings();
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    
<<<<<<< HEAD
    const { loadSettings } = useSettingsStore.getState();
    loadSettings();

=======
>>>>>>> 41f113d (upgrade scanner)
    // Maintenance check for recovery vault
    import('./services/recoveryVault').then(({ recoveryVaultService }) => {
      recoveryVaultService.getActiveVault(); // This triggers the expiry check & secure wipe
    });

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isMobile) return <DesktopBlockScreen />;

  return (
    <BrowserRouter>
      <div className="app-shell flex justify-center bg-[#F8F9FA] min-h-screen">
        <div className="app-content bg-white relative w-full max-w-[450px] border-x border-[#EEEEEE]">
          <AppShell />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
