// Hero balance card — dark gradient with animated number counter
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, MoreHorizontal } from 'lucide-react'
import { formatMoney } from '../../utils/formatMoney'
import { useSecurityStore } from '../../store/securityStore'

function AnimatedNumber({ value, currency }) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    const start = 0
    const end = value
    const duration = 1000
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(start + (end - start) * eased)
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
      className="mx-4 rounded-[20px] p-5 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #2D2D3A, #1A1A2E)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.04)',
      }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
      <div className="absolute -bottom-10 -left-6 w-28 h-28 rounded-full bg-purple-600/15" />

      {/* Top row */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Total Balance</p>
        <button onClick={toggleHideBalances} className="text-gray-400 hover:text-white transition-colors">
          {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Balance amount */}
      <div className="mb-6">
        {hideBalances ? (
          <span className="text-[36px] font-sora font-bold text-white tracking-tight">••••••</span>
        ) : (
          <span className={`text-[36px] font-sora font-bold tracking-tight ${balance < 0 ? 'text-red-400' : 'text-white'}`}>
            <AnimatedNumber value={balance} currency={currency} />
          </span>
        )}
      </div>

      {/* Bottom row — card-style dots + brand */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 tracking-[0.15em] font-mono">●●●● ●●●● ●●●● 1965</p>
        <div className="flex items-center gap-0.5">
          <div className="w-5 h-5 rounded-full bg-orange-400/80" />
          <div className="w-5 h-5 rounded-full bg-orange-600/60 -ml-2" />
        </div>
      </div>
    </motion.div>
  )
}
