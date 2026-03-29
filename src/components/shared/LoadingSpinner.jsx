// Loading spinner with purple color for Spendly loading states
import { motion } from 'framer-motion'

export default function LoadingSpinner({ size = 'md', label }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        className={`${sizes[size]} border-3 border-purple-200 border-t-purple-600 rounded-full`}
        style={{ borderWidth: 3 }}
      />
      {label && <p className="text-sm text-gray-400">{label}</p>}
    </div>
  )
}
