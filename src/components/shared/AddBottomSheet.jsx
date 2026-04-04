// AddBottomSheet — white premium slide-up sheet for add options
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Plus, Keyboard, ScanBarcode, Mic, X } from 'lucide-react'

const OPTIONS = [
  {
    id: 'type',
    icon: Keyboard,
    title: 'Manual Entry',
    subtitle: 'Type it in yourself',
    color: '#000000',
    bg: '#F6F6F6',
    path: '/add?mode=type'
  },
  {
    id: 'scan-bill',
    icon: ScanBarcode,
    title: 'Digital Capture',
    subtitle: 'OCR from photo',
    color: '#000000',
    bg: '#F6F6F6',
    path: '/add?mode=scan-bill'
  },
  {
    id: 'voice',
    icon: Mic,
    title: 'Voice Command',
    subtitle: 'Neural processing',
    color: '#000000',
    bg: '#F6F6F6',
    path: '/add?mode=voice'
  },
]

export default function AddBottomSheet({ show, onClose }) {
  const navigate = useNavigate()
  const S = { fontFamily: "'Inter', sans-serif" }

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
            className="fixed inset-0 z-[100] backdrop-blur-sm"
            style={{ background: 'rgba(0,0,0,0.4)' }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 500, damping: 50 }}
            className="fixed bottom-0 left-0 right-0 z-[101] bg-white pb-safe"
            style={{
              borderRadius: '32px 32px 0 0',
              borderTop: '1px solid #EEEEEE'
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-5 pb-3">
              <div className="w-12 h-1.5 rounded-full bg-[#EEEEEE]" />
            </div>

            <div className="flex items-center justify-between px-7 pb-8 pt-2">
              <p className="text-[22px] font-[900] text-black tracking-tighter" style={S}>
                Access Platform
              </p>
              <button 
                onClick={onClose} 
                className="w-11 h-11 rounded-full bg-[#F6F6F6] border border-[#EEEEEE] flex items-center justify-center active:scale-90 transition-transform"
              >
                <X className="w-6 h-6 text-black" strokeWidth={3} />
              </button>
            </div>

            <div className="px-7 pb-14 flex flex-col gap-4">
              {OPTIONS.map(opt => {
                const Icon = opt.icon
                return (
                  <motion.button
                    key={opt.id}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => { onClose(); navigate(opt.path) }}
                    className="w-full flex items-center gap-6 px-6 py-6 rounded-[28px] text-left bg-white border border-[#EEEEEE] transition-all active:bg-[#F6F6F6]"
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 bg-black text-white"
                    >
                      <Icon className="w-8 h-8" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[17px] font-[900] text-black mb-1 uppercase tracking-tight" style={S}>
                        {opt.title}
                      </p>
                      <p className="text-[12px] font-[900] text-[#AFAFAF] uppercase tracking-[0.1em]" style={S}>
                        {opt.subtitle}
                      </p>
                    </div>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#F6F6F6] border border-[#EEEEEE]">
                      <Plus className="w-5 h-5 text-black" strokeWidth={4} />
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
