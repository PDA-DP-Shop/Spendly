// BalanceCard — indigo→purple gradient hero card with animated counter
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { formatMoney } from '../../utils/formatMoney'
import { useSecurityStore } from '../../store/securityStore'

function AnimatedNumber({ value, currency }) {
  const [displayed, setDisplayed] = useState(0)
  useEffect(() => {
    const end = value
    const duration = 1000
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed((end) * eased)
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value])
  return <span>{formatMoney(displayed, currency)}</span>
}

export default function BalanceCard({ balance, currency = 'USD' }) {
  const { hideBalances, toggleHideBalances } = useSecurityStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="mx-5 p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
        borderRadius: '24px',
        boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
      }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-10" style={{ background: '#FFFFFF' }} />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-5" style={{ background: '#FFFFFF' }} />

      {/* Top row */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <p className="text-[13px] font-medium tracking-[0.06em] uppercase text-white opacity-80" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Total Balance
        </p>
        <button
          onClick={toggleHideBalances}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.15)' }}
        >
          {hideBalances
            ? <EyeOff className="w-4 h-4 text-white opacity-80" />
            : <Eye className="w-4 h-4 text-white opacity-80" />
          }
        </button>
      </div>

      {/* Balance */}
      <div className="mb-1 relative z-10">
        {hideBalances ? (
          <span className="text-[38px] font-extrabold text-white tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            ••••••
          </span>
        ) : (
          <span className="text-[38px] font-extrabold text-white tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <AnimatedNumber value={balance} currency={currency} />
          </span>
        )}
      </div>

      {/* Bottom pills */}
      <div className="flex items-center gap-3 mt-5 relative z-10">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }}>
          <div className="w-2 h-2 rounded-full bg-emerald-300" />
          <span className="text-white text-[12px] opacity-80" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Income</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }}>
          <div className="w-2 h-2 rounded-full bg-rose-300" />
          <span className="text-white text-[12px] opacity-80" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Expenses</span>
        </div>
        <div className="ml-auto flex items-center gap-0.5 opacity-50">
          <div className="w-5 h-5 rounded-full" style={{ background: '#FFFFFF' }} />
          <div className="w-5 h-5 rounded-full -ml-2" style={{ background: 'rgba(255,255,255,0.6)' }} />
        </div>
      </div>
    </motion.div>
  )
}
