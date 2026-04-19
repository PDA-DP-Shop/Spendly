/**
 * Super Delete Modal — Premium Triple-Action Confirmation
 * 1. Confirm button
 * 2. Second Confirm
 * 3. Type "DELETE"
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, AlertTriangle, ChevronRight, Check, X } from 'lucide-react'
import { createPortal } from 'react-dom'

const S = { fontFamily: "'Inter', sans-serif" }

export default function SuperDeleteModal({ show, onDelete, onClose, itemName = 'this expense' }) {
  const [step, setStep] = useState(1) // 1: Initial, 2: Final Verify, 3: Type DELETE
  const [confirmValue, setConfirmValue] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  // Reset when closed
  useEffect(() => {
    if (!show) {
      setTimeout(() => {
        setStep(1)
        setConfirmValue('')
        setIsDeleting(false)
      }, 300)
    }
  }, [show])

  const handleFinalAction = async () => {
    if (confirmValue.toUpperCase() === 'DELETE') {
      setIsDeleting(true)
      // Small artificial delay for premium feel
      setTimeout(async () => {
         await onDelete()
         onClose()
      }, 800)
    }
  }

  if (!show) return null

  const content = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-md flex items-end justify-center px-4 pb-12 pointer-events-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 200, scale: 0.95 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 200, scale: 0.95 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="w-full max-w-[420px] bg-white rounded-[42px] p-8 pb-10 shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center mb-6 transition-colors duration-500 ${step === 3 ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
              <Trash2 className="w-10 h-10" />
            </div>
            <h2 className="text-[26px] font-[900] text-black tracking-tighter leading-tight" style={S}>
               {step === 1 && "Move to Recycle Bin?"}
               {step === 2 && "Are you absolutely sure?"}
               {step === 3 && "Final Confirmation"}
            </h2>
            <p className="text-[#64748B] text-[15px] font-[500] mt-3 px-4" style={S}>
               {step === 1 && `This will remove ${itemName} from your dashboard.`}
               {step === 2 && "This action can be undone from Settings for 3 days."}
               {step === 3 && "Please type DELETE to finalize."}
            </p>
          </div>

          {/* Stepper Visualization */}
          <div className="flex gap-2 justify-center mb-10">
             {[1,2,3].map(i => (
               <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i <= step ? 'w-10 bg-black' : 'w-4 bg-[#F1F5F9]'}`} />
             ))}
          </div>

          <AnimatePresence mode="wait">
             {step === 1 && (
               <motion.button 
                 key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                 whileTap={{ scale: 0.96 }}
                 onClick={() => setStep(2)}
                 className="w-full h-18 py-5 rounded-2xl bg-[#F1F5F9] text-black font-[802] text-[16px] flex items-center justify-center gap-3 transition-colors"
                 style={S}
               >
                 Review Delete <ChevronRight className="w-5 h-5" />
               </motion.button>
             )}

             {step === 2 && (
               <motion.button 
                 key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                 whileTap={{ scale: 0.96 }}
                 onClick={() => setStep(3)}
                 className="w-full py-5 rounded-2xl bg-orange-500 text-white font-[802] text-[16px] shadow-xl shadow-orange-500/20"
                 style={S}
               >
                 Confirm Delete
               </motion.button>
             )}

             {step === 3 && (
               <motion.div key="s3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                 <div className="relative">
                   <input 
                     autoFocus
                     type="text"
                     value={confirmValue}
                     onChange={e => setConfirmValue(e.target.value)}
                     placeholder="Type DELETE"
                     className="w-full h-18 bg-[#F8FAFC] border-2 border-[#F1F5F9] focus:border-red-500 focus:bg-white rounded-2xl text-center text-[18px] font-[900] tracking-[0.2em] outline-none transition-all placeholder:tracking-normal placeholder:font-[600]"
                     style={S}
                   />
                 </div>
                 
                 <div className="flex gap-4">
                   <button 
                     onClick={onClose}
                     className="flex-1 h-18 rounded-2xl border-2 border-[#F1F5F9] text-[#94A3B8] font-[800] text-[15px]" 
                     style={S}
                   >
                     Cancel
                   </button>
                   <button 
                     disabled={confirmValue.toUpperCase() !== 'DELETE' || isDeleting}
                     onClick={handleFinalAction}
                     className={`flex-[2] h-18 rounded-2xl font-[900] text-[16px] flex items-center justify-center gap-3 transition-all ${
                        confirmValue.toUpperCase() === 'DELETE' 
                        ? 'bg-red-500 text-white shadow-xl shadow-red-500/30' 
                        : 'bg-[#F1F5F9] text-[#CBD5E1]'
                     }`}
                     style={S}
                   >
                     {isDeleting ? (
                       <div className="w-6 h-6 rounded-full border-3 border-white/20 border-t-white animate-spin" />
                     ) : (
                       <>Final Delete <Check className="w-5 h-5" strokeWidth={3} /></>
                     )}
                   </button>
                 </div>
               </motion.div>
             )}
          </AnimatePresence>

          {/* Close Handle */}
          <div className="mt-8 flex justify-center">
             <button onClick={onClose} className="w-12 h-1.5 rounded-full bg-[#F1F5F9]" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )

  return createPortal(content, document.getElementById('modal-root') || document.body)
}
