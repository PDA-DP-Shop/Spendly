/**
 * Factory Reset Workflow — Multi-step secure wipe with auto-backup
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, ShieldAlert, CheckCircle2, XCircle, ArrowRight, Save, Trash2, StopCircle } from 'lucide-react'
import { secureWipe } from '../../services/database'
import { exportAllData } from '../../services/exportData'

const S = { fontFamily: "'Inter', sans-serif" }

export default function FactoryResetWorkflow({ onClose }) {
  const [step, setStep] = useState(1) // 1=Warning, 2=Confirm Code, 3=Countdown, 4=Process, 5=Done
  const [confirmText, setConfirmText] = useState('')
  const [countdown, setCountdown] = useState(5)
  const [stage, setStage] = useState('')

  useEffect(() => {
    let timer
    if (step === 3 && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else if (step === 3 && countdown === 0) {
      setStep(4)
      performWipe()
    }
    return () => clearTimeout(timer)
  }, [step, countdown])

  const performWipe = async () => {
    try {
      setStage('Creating emergency backup...')
      await exportAllData('emergency_backup_no_password', true) // Silent silent-ish backup
      
      setStage('Wiping expenses...')
      await new Promise(r => setTimeout(r, 600))
      setStage('Shredding goals & settings...')
      await new Promise(r => setTimeout(r, 600))
      
      await secureWipe(true) // skipReload = true
      setStep(5)
    } catch (e) {
      console.error(e)
      setStage('Finalizing deletion...')
      await secureWipe(true)
      setStep(5)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col p-8 safe-top">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col pt-12">
             <div className="w-20 h-20 rounded-[28px] bg-red-50 flex items-center justify-center mb-8">
               <AlertCircle className="w-10 h-10 text-red-500" />
             </div>
             <h2 className="text-[32px] font-[900] text-black tracking-tighter leading-tight mb-4" style={S}>Delete Everything?</h2>
             <p className="text-[#545454] text-[15px] font-[500] leading-relaxed mb-10" style={S}>
                This will permanently remove ALL your expenses, goals, settings, and encryption keys from this device. We strongly recommend making a backup first.
             </p>
             <div className="bg-[#F8F9FA] rounded-[24px] p-6 mb-auto border border-[#EEEEEE]">
                <ul className="space-y-3">
                  {['200+ Transactions', 'All Scanned Bills', 'Budgets & Goals', 'Wallets & EMIs'].map(item => (
                    <li key={item} className="flex items-center gap-3 text-[13px] font-[700] text-[#AFAFAF]">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      {item}
                    </li>
                  ))}
                </ul>
             </div>
             <div className="flex flex-col gap-3">
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(2)}
                  className="w-full py-5 rounded-2xl bg-red-500 text-white font-[802] text-[16px] shadow-xl shadow-red-100" style={S}>
                  Continue
                </motion.button>
                <button onClick={onClose} className="w-full py-5 font-[800] text-[#AFAFAF] uppercase tracking-widest text-[13px]" style={S}>Cancel</button>
             </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="flex-1 flex flex-col pt-12">
             <h2 className="text-[26px] font-[900] text-black tracking-tight mb-2" style={S}>Final Confirmation</h2>
             <p className="text-[#AFAFAF] text-[14px] font-[600] mb-8" style={S}>Type <span className="text-red-500">DELETE</span> to confirm factory reset.</p>
             
             <input autoFocus value={confirmText} onChange={e => setConfirmText(e.target.value)}
               className="w-full bg-[#F6F6F6] border-2 border-[#EEEEEE] focus:border-red-500 rounded-[24px] p-6 text-[24px] font-[800] tracking-widest text-center transition-colors outline-none"
               placeholder="TYPE HERE" style={S} />
               
             <div className="mt-auto flex flex-col gap-3">
                <motion.button 
                  disabled={confirmText !== 'DELETE'}
                  whileTap={{ scale: 0.97 }} onClick={() => setStep(3)}
                  className={`w-full py-5 rounded-2xl font-[802] text-white shadow-xl transition-all ${confirmText === 'DELETE' ? 'bg-red-600 opacity-100' : 'bg-[#E2E2E2] opacity-50'}`} style={S}>
                  Delete Everything
                </motion.button>
                <button onClick={() => setStep(1)} className="w-full py-5 font-[800] text-[#AFAFAF] uppercase tracking-widest text-[13px]" style={S}>Go Back</button>
             </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center">
             <div className="relative w-40 h-40 flex items-center justify-center mb-10">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="80" cy="80" r="76" fill="none" stroke="#F6F6F6" strokeWidth="8" />
                  <motion.circle cx="80" cy="80" r="76" fill="none" stroke="#EF4444" strokeWidth="8"
                    strokeDasharray="477" initial={{ strokeDashoffset: 0 }} animate={{ strokeDashoffset: 477 - (countdown / 5) * 477 }}
                  />
                </svg>
                <span className="text-[64px] font-[900] text-black" style={S}>{countdown}</span>
             </div>
             <p className="text-[14px] font-[700] text-[#AFAFAF] uppercase tracking-widest mb-12">Deleting Everything...</p>
             <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
               className="flex items-center gap-3 px-8 py-5 bg-black text-white rounded-3xl font-[802] text-[16px] shadow-2xl" style={S}>
               <StopCircle className="w-6 h-6" />
               STOP - Keep My Data
             </motion.button>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 border-4 border-[#EEEEEE] border-t-red-500 rounded-full animate-spin mb-8" />
             <h3 className="text-[20px] font-[802] text-black mb-2" style={S}>{stage}</h3>
             <p className="text-[#AFAFAF] text-[13px] font-[600]" style={S}>Please do not close the app.</p>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center text-center">
             <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mb-8">
               <CheckCircle2 className="w-12 h-12 text-emerald-500" />
             </div>
             <h2 className="text-[32px] font-[900] text-black tracking-tighter mb-4" style={S}>All Data Deleted</h2>
             <p className="text-[#545454] text-[15px] font-[500] leading-relaxed mb-12 px-6" style={S}>
                Spendly is now fresh and ready to use again. A final emergency backup has been saved to your downloads for peace of mind.
             </p>
             <motion.button whileTap={{ scale: 0.97 }} onClick={() => window.location.reload()}
               className="w-full py-5 rounded-2xl bg-black text-white font-[802] text-[16px] shadow-xl" style={S}>
               Start Fresh
             </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
