import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X } from 'lucide-react'
import { useEffect } from 'react'
import { useUIStore } from '../../store/uiStore'
import { useBudgetStore } from '../../store/budgetStore'
import { useExpenses } from '../../hooks/useExpenses'
import { calculateSpent } from '../../utils/calculateTotal'

export default function NotificationDrawer() {
  const { notificationsOpen, toggleNotifications, setHasUnreadNotifications } = useUIStore()
  const { overallBudget } = useBudgetStore()
  const { getThisMonth } = useExpenses()
  
  const spent = calculateSpent(getThisMonth())
  const budgetPct = overallBudget > 0 ? (spent / overallBudget) * 100 : 0
  const S = { fontFamily: "'Nunito', sans-serif" }

  useEffect(() => {
    if (budgetPct >= 80) {
      setHasUnreadNotifications(true)
    }
  }, [budgetPct, setHasUnreadNotifications])

  return (
    <AnimatePresence>
      {notificationsOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleNotifications}
            className="fixed inset-0 bg-black/5 backdrop-blur-sm z-[100]"
          />
          
          {/* Drawer Wrapper (Centered Shell) */}
          <div className="fixed inset-0 top-24 z-[101] pointer-events-none px-6">
            <div className="flex justify-end w-full">
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="w-[320px] bg-white border border-[#F0F0F8] rounded-[28px] shadow-[0_30px_90px_rgba(0,0,0,0.15)] p-5 overflow-hidden pointer-events-auto"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#F6F6F6] flex items-center justify-center">
                      <Bell className="w-4 h-4 text-black" />
                    </div>
                    <p className="text-[15px] font-[800] text-[#0F172A]" style={S}>Notifications</p>
                  </div>
                  <button 
                    onClick={toggleNotifications}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-[#F6F6F6] text-[#94A3B8]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-[#F8F7FF] rounded-2xl border border-[#F0EEFF] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Sparkles className="w-8 h-8 text-[var(--primary)]" />
                    </div>
                    <p className="text-[13px] font-[800] text-[#0F172A] mb-1" style={S}>Welcome to Spendly 🚀</p>
                    <p className="text-[12px] text-[#64748B] leading-relaxed" style={S}>Your private data stays 100% on this device. No cloud. No tracking. Just you.</p>
                  </div>

                  {budgetPct >= 80 && (
                    <div className="p-4 bg-[#FFF7F2] rounded-2xl border border-[#FFEBE4]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[14px]">⚠️</span>
                        <p className="text-[13px] font-[800] text-[#FF7043]" style={S}>Budget Alert</p>
                      </div>
                      <p className="text-[12px] text-[#94A3B8] leading-relaxed" style={S}>
                        Steady there! You've used {Math.round(budgetPct)}% of your monthly limit.
                      </p>
                      <div className="mt-3 h-1.5 w-full bg-[#FFEBE4] rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(budgetPct, 100)}%` }}
                          className="h-full bg-[#FF7043] rounded-full"
                        />
                      </div>
                    </div>
                  )}
                  
                  {budgetPct < 80 && (
                    <div className="p-4 bg-[#F0FDF4] rounded-2xl border border-[#DCFCE7]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[14px]">🌱</span>
                        <p className="text-[13px] font-[800] text-[#16A34A]" style={S}>Healthy Spending</p>
                      </div>
                      <p className="text-[12px] text-[#16A34A]/80 leading-relaxed" style={S}>
                        Great job! Your spending is well within your budget limits this month.
                      </p>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={toggleNotifications}
                  className="mt-6 w-full py-3 bg-[#F6F6F6] rounded-xl text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest hover:bg-[#EEEEEE] transition-colors"
                  style={S}
                >
                  Clear All
                </button>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

function Sparkles({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  )
}
