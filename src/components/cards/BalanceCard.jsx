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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ stiffness: 300, damping: 30 }}
      className="mx-4 p-5 relative overflow-hidden glass-accent"
    >
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
      <div className="absolute -bottom-10 -left-6 w-28 h-28 rounded-full bg-cyan-glow/15" />

      {/* Top row */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-[13px] font-body font-medium tracking-[0.08em] uppercase text-[#7B8DB0]">Total Balance</p>
        <button onClick={toggleHideBalances} className="w-9 h-9 rounded-full glass border-none flex items-center justify-center text-[#7B8DB0] hover:text-[#F0F4FF] transition-colors">
          {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Balance amount */}
      <div className="mb-6">
        {hideBalances ? (
          <span className="text-[42px] font-display font-bold text-[#F0F4FF] tracking-[-0.02em]">••••••</span>
        ) : (
          <span className={`text-[42px] font-display font-bold tracking-[-0.02em] ${balance < 0 ? 'text-expense' : 'text-[#F0F4FF]'}`}>
            <AnimatedNumber value={balance} currency={currency} />
          </span>
        )}
      </div>

      {/* Bottom row — card-style dots + brand */}
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-body text-[#7B8DB0] tracking-[0.15em]">●●●● ●●●● ●●●● 1965</p>
        <div className="flex items-center gap-0.5 opacity-50">
          <div className="w-5 h-5 rounded-full bg-cyan-glow" />
          <div className="w-5 h-5 rounded-full bg-blue-glow -ml-2" />
        </div>
      </div>
    </motion.div>
  )
}
