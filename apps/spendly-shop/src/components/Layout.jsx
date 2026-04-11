import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import BottomTabBar from './shared/BottomTabBar';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Pages that show the bottom tab bar
  const showNav = ['/', '/history', '/settings'].includes(location.pathname);

  return (
    <div className="app-shell flex justify-center bg-[#F8F9FA] min-h-dvh">
      <div className="app-content bg-white shadow-2xl shadow-black/5 relative overflow-x-hidden flex flex-col w-full max-w-[450px]">
        {/* Desktop Blocker (styled exactly like user app) */}
        <div className="hidden lg:flex fixed inset-0 bg-white z-[9999] justify-center items-center text-center p-10">
          <div className="max-w-[400px]">
            <div className="w-20 h-20 bg-emerald-500 rounded-[28px] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-200">
               <img src="/spendly-logo.png" className="w-12 h-12 grayscale invert" alt="Logo" />
            </div>
            <h1 className="text-3xl font-[900] text-black mb-4 uppercase tracking-tighter">Shop Mode Active</h1>
            <p className="text-[#AFAFAF] font-[700] text-[11px] uppercase tracking-[0.3em] leading-relaxed">
              This interface is optimized for high-speed mobile billing. Please open on a mobile device for the full experience.
            </p>
          </div>
        </div>

        <main className={`flex-1 ${showNav ? 'pb-24' : ''}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {showNav && (
            <BottomTabBar onCreatePress={() => navigate('/create-bill')} />
        )}
      </div>
    </div>
  );
}
