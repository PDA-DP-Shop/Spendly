// Bottom sheet for FAB — shows Type, Scan Product, Scan Bill options
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, Package, FileText, X, Mic } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const options = [
  {
    icon: Pencil,
    label: 'Type It In',
    desc: 'Add expense manually',
    color: '#7C3AED',
    bg: '#F3E8FF',
    path: '/add?mode=type',
  },
  {
    icon: Package,
    label: 'Scan Product',
    desc: 'Scan a product barcode',
    color: '#F97316',
    bg: '#FFF7ED',
    path: '/add?mode=scan-product',
  },
  {
    icon: FileText,
    label: 'Scan Bill',
    desc: 'Read a receipt or bill',
    color: '#22C55E',
    bg: '#F0FDF4',
    path: '/add?mode=scan-bill',
  },
  {
    icon: Mic,
    label: 'Voice Note',
    desc: 'Just say what you spent',
    color: '#3B82F6',
    bg: '#EFF6FF',
    path: '/add?mode=voice',
  },
]

export default function AddBottomSheet({ show, onClose }) {
  const navigate = useNavigate()

  const handleOption = (path) => {
    onClose()
    setTimeout(() => navigate(path), 200)
  }

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#1A1A2E] rounded-t-3xl px-6 pt-4 pb-10"
            style={{ paddingBottom: 'max(40px, calc(env(safe-area-inset-bottom) + 20px))' }}
          >
            {/* Handle bar */}
            <div className="w-12 h-1 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mb-6" />
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-sora font-bold text-gray-900 dark:text-white">Add Expense</h3>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {options.map(opt => {
                const Icon = opt.icon
                return (
                  <motion.button
                    key={opt.label}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleOption(opt.path)}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-[#242438] text-left"
                  >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: opt.bg }}>
                      <Icon className="w-6 h-6" style={{ color: opt.color }} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-[15px]">{opt.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
