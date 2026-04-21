import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CAMERA_CONSTRAINTS, 
  startScanLoop, 
  checkTorchSupport, 
  toggleTorch 
} from '../../services/multiScanner'
import { Zap, ZapOff } from 'lucide-react'

/**
 * SpendlyQRScanner
 * Handles both JSON-based digital bills and URL-based deep links from Spendly Shop.
 */
export default function SpendlyQRScanner({ onScanComplete, onError }) {
  const videoRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [torchSupported, setTorchSupported] = useState(false)
  const [torchOn, setTorchOn] = useState(false)
  const [success, setSuccess] = useState(false)
  const isProcessingRef = useRef(false)

  useEffect(() => {
    let stopScanner = null
    let localStream = null

    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(CAMERA_CONSTRAINTS)
        localStream = stream
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = async () => {
            await videoRef.current.play()
            setIsReady(true)
            const hasTorch = await checkTorchSupport(stream)
            setTorchSupported(hasTorch)
            
            stopScanner = startScanLoop(videoRef.current, handleScanResult)
          }
        }
      } catch (err) {
        onError?.(err)
      }
    }

    const handleScanResult = (result) => {
      if (isProcessingRef.current) return
      isProcessingRef.current = true
      
      const rawText = result.text
      console.log("[SpendlyQR] Raw Text:", rawText)

      try {
        // Pattern 1: JSON Bill
        if (rawText.startsWith('{')) {
          const data = JSON.parse(rawText)
          if (data.type === 'spendly_bill' || data.s || data.v === 2) {
             return triggerSuccess(data, result.engine)
          }
        }

        // Pattern 2: Spendly URL (Deep Link)
        // Format: https://.../scans?data=xxx
        if (rawText.includes('data=')) {
           const url = new URL(rawText)
           const dataParam = url.searchParams.get('data')
           if (dataParam) {
              const decoded = decodeURIComponent(dataParam)
              const jsonStr = decodeURIComponent(escape(atob(decoded)))
              const data = JSON.parse(jsonStr)
              return triggerSuccess(data, result.engine)
           }
        }

        // Default: If it's not a spendly bill, don't block other scans
        isProcessingRef.current = false

      } catch (err) {
        console.warn("[SpendlyQR] Parse failed:", err)
        isProcessingRef.current = false
      }
    }

    const triggerSuccess = (data, engine) => {
       setSuccess(true)
       
       // Transform Minified Version (v2) if present
       const bill = (data.v === 2 || data.s) ? {
          shopName: data.s,
          total: data.t,
          shopCategory: data.c,
          billNumber: data.bn,
          timestamp: data.ts,
          items: (data.i || []).map(it => ({ name: it.n, price: it.p, quantity: it.q })),
          type: 'spendly_bill'
       } : data

       setTimeout(() => {
         onScanComplete({
           type: 'spendly',
           ...bill,
           name: bill.shopName || bill.name,
           totalAmount: bill.total || bill.amount,
           source: 'Spendly Shop',
           engine
         })
       }, 200)
    }

    initCamera()

    return () => {
      if (stopScanner) stopScanner()
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [onScanComplete, onError])

  const handleToggleTorch = async () => {
    const success = await toggleTorch(videoRef.current, !torchOn)
    if (success) setTorchOn(!torchOn)
  }

  return (
    <div className="absolute inset-0 w-full h-full bg-black">
      <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
      
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="absolute inset-0 bg-green-500/20 z-10 border-[10px] border-green-500/40" 
          />
        )}
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-[30%] flex justify-center pointer-events-none">
        <div className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-[10px] text-white font-bold uppercase tracking-widest">
           Receipt Receiver Active
        </div>
      </div>

      <div className="absolute top-6 right-20 z-50">
        {torchSupported && (
          <button onClick={handleToggleTorch} className={`w-11 h-11 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center transition-all ${torchOn ? 'bg-yellow-400 border-yellow-500' : 'bg-white/10'}`}>
            {torchOn ? <Zap className="w-5 h-5 text-black fill-black" /> : <ZapOff className="w-5 h-5 text-white" />}
          </button>
        )}
      </div>
    </div>
  )
}
