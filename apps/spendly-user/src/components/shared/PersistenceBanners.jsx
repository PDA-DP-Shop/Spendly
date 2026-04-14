/**
 * Persistence Banners — Browser choice and Backup reminders
 */
import { motion, AnimatePresence } from 'framer-motion'
import { Monitor, Smartphone, Database, X } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { browserService } from '../../services/browserService'
import { useNavigate, useLocation } from 'react-router-dom'
import { useExpenseStore } from '../../store/expenseStore'
import { useEffect, useState } from 'react'

const S = { fontFamily: "'Inter', sans-serif" }

export default function PersistenceBanners() {
  const { banners, setBanner, browserState, setBrowserState } = useUIStore()
  const { expenses } = useExpenseStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [dismissPWA, setDismissPWA] = useState(localStorage.getItem('hide_pwa_banner') === 'true')

  const isHome = location.pathname === '/'

  const handleSetPreferred = async (choice) => {
    await browserService.setPreferredBrowser(choice)
    const newState = { ...browserState, preferred: choice }
    setBrowserState(newState)
    setBanner('browser', false)
  }

  const handleDismissPWA = (e) => {
    e.stopPropagation()
    setDismissPWA(true)
    localStorage.setItem('hide_pwa_banner', 'true')
  }

  if (!isHome) return null

  return (
    <div className="flex flex-col gap-3 px-6 py-2 pt-4">
      <AnimatePresence>
        {/* 1. Choose Main Browser Prompt (Shown once if no preference) */}
        {banners.browser && !browserState.isPWA && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-black rounded-[36px] p-8 text-white mb-4 shadow-2xl relative overflow-hidden ring-1 ring-white/10">
               <div className="absolute top-[-30px] right-[-30px] w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl opacity-50" />
               <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-5">
                   <div className="w-12 h-12 rounded-[22px] bg-indigo-500 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
                     <Monitor className="w-6 h-6 text-white" />
                   </div>
                   <h3 className="text-[19px] font-[900] tracking-tight" style={S}>Local Data Setup</h3>
                 </div>
                 <p className="text-white/60 text-[14px] font-[500] leading-relaxed mb-8" style={S}>
                   Spendly is <span className="text-white font-[800]">100% Offline</span>. To keep your <span className="text-indigo-400 font-[802]">3-Day Local Cache</span> synchronized, please pick your primary browser.
                 </p>
                 <div className="grid grid-cols-2 gap-4">
                   <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }} onClick={() => handleSetPreferred('safari')}
                     className="bg-white/10 border border-white/10 p-5 rounded-[24px] flex flex-col items-center gap-2 hover:bg-white/15 transition-all">
                     <span className="text-[14px] font-[802]" style={S}>iOS Safari</span>
                     <span className="text-[10px] font-[600] text-white/30 uppercase tracking-widest">Recommended</span>
                   </motion.button>
                   <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }} onClick={() => handleSetPreferred('chrome')}
                     className="bg-white/10 border border-white/10 p-5 rounded-[24px] flex flex-col items-center gap-2 hover:bg-white/15 transition-all">
                     <span className="text-[14px] font-[802]" style={S}>Chrome App</span>
                     <span className="text-[10px] font-[600] text-white/30 uppercase tracking-widest">Fast Sync</span>
                   </motion.button>
                 </div>
                 <button onClick={() => setBanner('browser', false)} className="mt-6 text-white/30 text-[11px] font-[802] uppercase tracking-[0.2em] w-full text-center hover:text-white/50 transition-colors">Setup later</button>
               </div>
            </div>
          </motion.div>
        )}

        {/* 2. Backup Reminder */}
        {banners.backup && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border-2 border-orange-500/10 rounded-[32px] p-6 mb-4 shadow-xl shadow-orange-500/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl -mr-12 -mt-12" />
               <div className="flex items-start gap-5">
                 <div className="w-12 h-12 rounded-[20px] bg-orange-500 shadow-lg shadow-orange-500/30 flex items-center justify-center flex-shrink-0">
                   <Database className="w-6 h-6 text-white" />
                 </div>
                 <div className="flex-1">
                   <div className="flex justify-between items-center mb-1">
                     <h4 className="text-[16px] font-[902] text-black tracking-tight" style={S}>Safety Backup Overdue</h4>
                     <button onClick={() => setBanner('backup', false)} className="p-1"><X className="w-5 h-5 text-black/10 hover:text-black/30 transition-colors" /></button>
                   </div>
                   <p className="text-slate-500 text-[13px] font-[500] leading-relaxed mb-5" style={S}>
                     Your data is saved in your <span className="text-black font-[800]">3-Day Local Cache</span>. Back up to keep it permanently safe beyond this device.
                   </p>
                   <motion.button 
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.96 }} 
                     onClick={() => navigate('/settings')}
                     className="bg-black text-white px-7 py-3 rounded-2xl text-[13px] font-[900] shadow-xl shadow-black/10" style={S}>
                     Back up now
                   </motion.button>
                 </div>
               </div>
            </div>
          </motion.div>
        )}

        {/* 3. Install PWA Prompt (Shown if browser is preferred + 3+ expenses added) */}
        {!browserState.isPWA && !banners.browser && !dismissPWA && expenses.length >= 3 && (
             <motion.div
               layout
               initial={{ height: 0, opacity: 0, scale: 0.95 }}
               animate={{ height: 'auto', opacity: 1, scale: 1 }}
               exit={{ height: 0, opacity: 0, scale: 0.95 }}
               className="overflow-hidden"
             >
               <div className="bg-[#F8F9FA] border border-[#EEEEEE] rounded-[24px] p-5 mb-4 relative pr-12">
                  <button 
                    onClick={handleDismissPWA}
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-white border border-[#EEEEEE] text-[#AFAFAF] active:scale-90 transition-transform"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-white border border-[#EEEEEE] flex items-center justify-center flex-shrink-0">
                      <Monitor className="w-5 h-5 text-black" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[14px] font-[800] text-black" style={S}>Run as Home App</h4>
                      <p className="text-[#AFAFAF] text-[11px] font-[500]" style={S}>Private data is safer as an app</p>
                    </div>
                    <motion.button whileTap={{ scale: 0.96 }} onClick={() => navigate('/migration-guide')}
                      className="text-[#7C3AED] text-[12px] font-[801] uppercase tracking-widest px-3 py-1.5" style={S}>
                      Show How
                    </motion.button>
                  </div>
               </div>
             </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
