// AddBottomSheet — white premium slide-up sheet for add options
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Plus, Keyboard, ScanBarcode, Mic, X } from 'lucide-react'

const OPTIONS = [
  {
    id: 'type',
    icon: Keyboard,
    title: 'Type it in',
    subtitle: 'Add expense manually',
    color: '#6366F1',
    bg: '#EEF2FF',
    path: '/add?mode=type'
  },
  {
    id: 'scan-bill',
    icon: ScanBarcode,
    title: 'Scan a Bill',
    subtitle: 'OCR from photo / camera',
    color: '#06B6D4',
    bg: '#ECFEFF',
    path: '/add?mode=scan-bill'
  },
  {
    id: 'voice',
    icon: Mic,
    title: 'Voice Entry',
    subtitle: 'Speak your expense',
    color: '#10B981',
    bg: '#ECFDF5',
    path: '/add?mode=voice'
  },
]

export default function AddBottomSheet({ show, onClose }) {
  const navigate = useNavigate()

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(0,0,0,0.3)' }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="fixed bottom-0 left-0 right-0 z-[61] bg-white pb-safe"
            style={{
              borderRadius: '28px 28px 0 0',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.1)',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-4">
              <div className="w-9 h-1 rounded-full bg-[#E2E8F0]" />
            </div>

            <div className="flex items-center justify-between px-5 pb-4">
              <p className="text-[18px] font-bold text-[#0F172A]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Add Transaction
              </p>
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#F8F9FF] flex items-center justify-center">
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>

            <div className="px-5 pb-8 flex flex-col gap-3">
              {OPTIONS.map(opt => {
                const Icon = opt.icon
                return (
                  <motion.button
                    key={opt.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { onClose(); navigate(opt.path) }}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-[16px] text-left"
                    style={{ background: '#F8F9FF', border: '1px solid #F0F0F8' }}
                  >
                    <div
                      className="w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0"
                      style={{ background: opt.bg }}
                    >
                      <Icon className="w-6 h-6" style={{ color: opt.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[16px] font-semibold text-[#0F172A]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                        {opt.title}
                      </p>
                      <p className="text-[13px] text-[#64748B]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                        {opt.subtitle}
                      </p>
                    </div>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: opt.bg }}>
                      <Plus className="w-4 h-4" style={{ color: opt.color }} />
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
