// BalanceCard — primary gradient hero card with animated counter and income/expenses
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { formatMoney } from '../../utils/formatMoney'
import { useSecurityStore } from '../../store/securityStore'

function AnimatedNumber({ value, currency }) {
  const [displayed, setDisplayed] = useState(0)
  
  useEffect(() => {
    const duration = 1200
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4) // easeOutQuart
      setDisplayed(value * eased)
      
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value])
  
  return <span>{formatMoney(displayed, currency)}</span>
}

export default function BalanceCard({ balance, income, expense, currency = 'USD' }) {
  const { hideBalances, toggleHideBalances } = useSecurityStore()
  const S = { fontFamily: "'Nunito', sans-serif" }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="mx-5 p-8 relative overflow-hidden"
      style={{
        background: 'var(--gradient-primary)',
        borderRadius: '32px',
        boxShadow: '0 12px 40px rgba(124,111,247,0.25)',
      }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white opacity-10 blur-2xl" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-black opacity-5 blur-2xl" />

      {/* Top row */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
           <p className="text-[12px] font-[800] uppercase tracking-widest text-white/80" style={S}>
             Total Balance
           </p>
        </div>
        <button
          onClick={toggleHideBalances}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30"
        >
          {hideBalances
            ? <EyeOff className="w-4 h-4 text-white" />
            : <Eye className="w-4 h-4 text-white" />
          }
        </button>
      </div>

      {/* Balance */}
      <div className="mb-10 relative z-10">
        {hideBalances ? (
          <span className="text-[42px] font-[800] text-white tracking-tighter" style={S}>
            ••••••
          </span>
        ) : (
          <span className="text-[42px] font-[800] text-white tracking-tighter" style={S}>
            <AnimatedNumber value={balance} currency={currency} />
          </span>
        )}
      </div>

      {/* Bottom values: Income and Expenses */}
      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[14px] flex items-center justify-center bg-white/20 border border-white/20">
            <ArrowDownLeft className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-white/60 text-[10px] font-[800] uppercase tracking-wider" style={S}>Income</span>
            <span className="text-white text-[16px] font-[800] truncate" style={S}>
              {hideBalances ? '••••' : formatMoney(income, currency)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end">
          <div className="flex flex-col items-end min-w-0 order-1 sm:order-2">
            <span className="text-white/60 text-[10px] font-[800] uppercase tracking-wider" style={S}>Spent</span>
            <span className="text-white text-[16px] font-[800] truncate" style={S}>
              {hideBalances ? '••••' : formatMoney(expense, currency)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-[14px] flex items-center justify-center bg-white/20 border border-white/20 order-2 sm:order-1">
            <ArrowUpRight className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
