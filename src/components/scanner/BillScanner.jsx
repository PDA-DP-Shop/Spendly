import { useEffect, useRef, useState } from 'react'
import { X, Camera } from 'lucide-react'
import { motion } from 'framer-motion'
import Tesseract from 'tesseract.js'
import { useSecurityStore } from '../../store/securityStore'

export default function BillScanner({ onBillScanned, onClose }) {
  const videoRef = useRef(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [stream, setStream] = useState(null)

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 2560 },
          height: { ideal: 1440 }
        }
      })
      setStream(s)
      if (videoRef.current) {
        videoRef.current.srcObject = s
        videoRef.current.play()
      }
    } catch (e) {
      setError('Camera access denied or unavailable.')
    }
  }

  useEffect(() => {
    useSecurityStore.getState().setPauseSecurity(true)
    startCamera()
    return () => {
      useSecurityStore.getState().setPauseSecurity(false)
      if (stream) stream.getTracks().forEach(track => track.stop())
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const captureAndScan = async () => {
    if (!videoRef.current || loading) return
    setLoading(true)

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
    
    if (stream) stream.getTracks().forEach(t => t.stop())

    try {
      const result = await Tesseract.recognize(canvas, 'eng')
      const text = result.data.text
      
      // Improved regex to catch Tesseract mistakes like 19,99 or 19 99 for receipts
      const sanitizedText = text.replace(/,| /g, '.')
      const amounts = sanitizedText.match(/\d+\.\d{2}/g)
      let maxAmount = 0
      if (amounts) {
        maxAmount = Math.max(...amounts.map(a => parseFloat(a)))
      }
      
      onBillScanned({ text, amount: maxAmount })
    } catch (e) {
      setError('Failed to read receipt. Please try again.')
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (stream) stream.getTracks().forEach(t => t.stop())
    onClose()
  }

  return (
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 safe-top bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10 text-white">
        <h2 className="font-sora font-semibold text-[18px] flex items-center gap-2">
          <Camera className="w-5 h-5" /> Scan Receipt
        </h2>
        <button onClick={handleClose} className="p-2 bg-white/10 rounded-full backdrop-blur-md">
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex-1 relative bg-black flex flex-col items-center justify-center overflow-hidden pt-12">
        {!loading && !error && (
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover" 
            playsInline
            muted
          />
        )}
        
        {/* Scanning frame overlay */}
        {!loading && !error && (
          <div className="absolute inset-0 pointer-events-none flex flex-col">
            <div className="flex-1 bg-black/60" />
            <div className="flex h-[60vh]">
              <div className="w-[10vw] sm:flex-1 bg-black/60" />
              <div className="w-[80vw] h-full sm:w-[400px] border-2 border-white/50 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] overflow-hidden" />
              <div className="w-[10vw] sm:flex-1 bg-black/60" />
            </div>
            <div className="flex-1 bg-black/60 flex items-center justify-center pb-8">
               <button onClick={captureAndScan} className="w-[72px] h-[72px] rounded-full border-4 border-white/50 flex items-center justify-center pointer-events-auto active:scale-95 transition-transform">
                  <div className="w-14 h-14 bg-white rounded-full shadow-lg" />
               </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center gap-5">
             <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
             <div className="text-center">
               <p className="text-white font-sora font-bold text-lg mb-1">Reading Receipt...</p>
               <p className="text-white/60 text-sm">This might take a few seconds</p>
             </div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center px-6">
             <p className="text-white bg-red-500/90 px-6 py-4 rounded-2xl font-medium text-center mb-6">
               {error}
             </p>
             <button onClick={() => { setError(null); startCamera(); }} className="px-8 py-3 bg-white text-black font-semibold rounded-xl">
               Try Again
             </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
