import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera as CameraIcon, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { runOCR } from '../../services/ocrService'

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

export default function BillScanner({ onScanComplete }) {
  const [loading, setLoading] = useState(false)
  const [tipIndex, setTipIndex] = useState(0)
  const fileInputRef = useRef(null)
  
  const tips = [
    "Good lighting helps accuracy",
    "Make sure total amount is visible",
    "Hold camera steady for best results"
  ]

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setTipIndex(prev => (prev + 1) % tips.length)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [loading])

  const handleCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleBillImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const result = await runOCR(file)
      // Small delay for UI smoothness
      setTimeout(() => {
        onScanComplete({
          type: 'bill',
          ...result,
          source: 'OCR'
        })
        setLoading(false)
      }, 500)
    } catch (err) {
      console.error('OCR Process error:', err)
      setLoading(false)
    }
  }

  return (
    <div className="absolute inset-0 w-full h-full bg-black flex flex-col items-center justify-center p-8">
      {/* Hidden File Input for iOS/Android camera trigger */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleBillImage}
        className="hidden"
      />

      {!loading ? (
        <div className="flex flex-col items-center gap-8 text-center">
          <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
            <Receipt className="w-12 h-12 text-white" />
          </div>
          <div>
            <h2 className="text-white text-xl font-bold mb-2 font-['DM_Sans']">Bill Receipt Scan</h2>
            <p className="text-white/40 text-sm font-['DM_Sans'] max-w-[240px]">
              {isIOS 
                ? "Tap the button to take a clear photo of your paper bill" 
                : "Point your camera at the receipt and tap capture"}
            </p>
          </div>
          
          <button 
            onClick={handleCapture}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/10 backdrop-blur-md active:scale-95 transition-transform"
          >
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
              <CameraIcon className="w-8 h-8 text-black" />
            </div>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-8 text-center animate-in fade-in duration-500">
           <div className="relative">
              <div className="w-20 h-20 border-4 border-white/10 border-t-white rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="w-8 h-8 text-white" />
              </div>
           </div>
           
           <div className="space-y-2">
             <h3 className="text-white font-bold font-['Inter',sans-serif]">Reading your bill...</h3>
             <AnimatePresence mode="wait">
               <motion.p 
                 key={tipIndex}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className="text-[#9CA3AF] text-xs italic font-['DM_Sans'] h-4"
               >
                 "{tips[tipIndex]}"
               </motion.p>
             </AnimatePresence>
           </div>
        </div>
      )}
    </div>
  )
}

function Receipt({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
      <path d="M12 17.5v-11"/>
    </svg>
  )
}
