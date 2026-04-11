import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SplashScreen from './screens/SplashScreen';
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
import DesktopBlockScreen from './screens/DesktopBlockScreen';
import { useSettingsStore } from './store/settingsStore';
import { useShopStore } from './store/shopStore';

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isMobile) {
    return <DesktopBlockScreen />;
  }

  return (
    <BrowserRouter>
      <div className="app-shell">
        <div className="app-content">
          <Routes>
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
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
