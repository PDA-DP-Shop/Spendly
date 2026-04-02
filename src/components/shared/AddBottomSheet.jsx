import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, Package, FileText, X, Mic, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const options = [
  {
    icon: Pencil,
    label: 'Type It In',
    desc: 'Add expense manually',
    gradient: 'from-[#0066FF] to-[#00D4FF]',
    path: '/add?mode=type',
  },
  {
    icon: Package,
    label: 'Scan Product',
    desc: 'Scan a product barcode',
    gradient: 'from-[#F97316] to-[#EA580C]',
    path: '/add?mode=scan-product',
  },
  {
    icon: FileText,
    label: 'Scan Bill',
    desc: 'Read a receipt or bill',
    gradient: 'from-[#00FF87] to-[#00C853]',
    path: '/add?mode=scan-bill',
  },
  {
    icon: Mic,
    label: 'Voice Note',
    desc: 'Just say what you spent',
    gradient: 'from-[#3B82F6] to-[#2196F3]',
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
            className="fixed inset-0 bg-[#050B18]/80 z-50 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#070D1F]/95 rounded-t-[28px] border-t border-cyan-glow/15 px-6 pt-4 pb-10 backdrop-blur-[40px]"
            style={{ paddingBottom: 'max(40px, calc(env(safe-area-inset-bottom) + 20px))' }}
          >
            {/* Handle bar */}
            <div className="w-12 h-1.5 bg-white/15 rounded-full mx-auto mb-8" />
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[20px] font-display font-bold text-[#F0F4FF]">Add Transaction</h3>
              <button onClick={onClose} className="w-9 h-9 rounded-full glass border-none flex items-center justify-center text-[#7B8DB0]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {options.map(opt => (
                <motion.button
                  key={opt.label}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOption(opt.path)}
                  className="flex items-center gap-4 p-4 rounded-[22px] glass-elevated border-white/5 text-left group"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${opt.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <opt.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-body font-bold text-[#F0F4FF] text-[15px]">{opt.label}</p>
                    <p className="text-[12px] font-body text-[#7B8DB0] mt-0.5">{opt.desc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-cyan-glow group-hover:translate-x-1 transition-transform" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
