import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle2, StopCircle } from 'lucide-react'
import { secureWipe } from '../../services/database'

const S = { fontFamily: "'Inter', sans-serif" }

export default function FactoryResetWorkflow({ onClose }) {
  const [step, setStep] = useState(1) // 1=Warning, 2=Confirm, 3=Countdown, 4=Process, 5=Done
  const [confirmText, setConfirmText] = useState('')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    let timer
    if (step === 3 && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else if (step === 3 && countdown === 0) {
      setStep(4)
      secureWipe(false)
    }
    return () => clearTimeout(timer)
  }, [step, countdown])

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col p-8 safe-top">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col pt-12">
             <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mb-8">
               <AlertCircle className="w-10 h-10 text-red-500" />
             </div>
             <h2 className="text-[32px] font-[900] text-black tracking-tighter mb-4" style={S}>Reset Shop?</h2>
             <p className="text-[#545454] mt-4 mb-10 text-[15px] font-[500] leading-relaxed" style={S}>
                All bills, customer books, and inventory will be permanently deleted. This cannot be undone.
             </p>
             <div className="flex flex-col gap-3 mt-auto">
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(2)} className="w-full py-5 rounded-2xl bg-red-500 text-white font-[802] text-[16px] shadow-lg" style={S}>Continue</motion.button>
                <button onClick={onClose} className="w-full py-5 font-[800] text-[#AFAFAF] uppercase tracking-widest text-[13px]" style={S}>Cancel</button>
             </div>
          </motion.div>
        )}
        {step === 2 && (
          <motion.div key="2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col pt-12">
             <h2 className="text-[26px] font-[900] text-black tracking-tight mb-2" style={S}>Confirm Deletion</h2>
             <p className="text-[#AFAFAF] text-[14px] font-[600] mb-8" style={S}>Type <span className="text-red-500">DELETE</span> to wipe all shop data.</p>
             <input autoFocus value={confirmText} onChange={e => setConfirmText(e.target.value)} className="w-full bg-[#F6F6F6] border-2 border-[#EEEEEE] focus:border-red-500 rounded-[24px] p-6 text-[24px] font-[800] tracking-widest text-center transition-colors outline-none" placeholder="TYPE HERE" style={S} />
             <div className="mt-auto flex flex-col gap-3">
                <motion.button disabled={confirmText !== 'DELETE'} whileTap={{ scale: 0.97 }} onClick={() => setStep(3)} className={`w-full py-5 rounded-2xl font-[802] text-white ${confirmText === 'DELETE' ? 'bg-red-600' : 'bg-[#E2E2E2]'} transition-colors`} style={S}>Delete My Shop</motion.button>
                <button onClick={() => setStep(1)} className="w-full py-5 font-[800] text-[#AFAFAF] uppercase tracking-widest text-[13px]" style={S}>Go Back</button>
             </div>
          </motion.div>
        )}
        {step === 3 && (
          <motion.div key="3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center">
             <div className="text-[120px] font-[900] text-black mb-10" style={S}>{countdown}</div>
             <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="flex items-center gap-3 px-8 py-5 bg-black text-white rounded-3xl font-[802] text-[16px] shadow-2xl" style={S}>
               <StopCircle className="w-6 h-6" /> STOP
             </motion.button>
          </motion.div>
        )}
        {step === 4 && (
          <motion.div key="4" className="flex-1 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 border-4 border-t-red-500 rounded-full animate-spin mb-8" />
             <h3 className="text-[20px] font-[802] text-black" style={S}>Wiping Shop Data...</h3>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
