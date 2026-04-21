import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CAMERA_CONSTRAINTS, 
  startScanLoop, 
  checkTorchSupport, 
  toggleTorch 
} from '../../services/multiScanner'
import { Zap, ZapOff, Sparkles } from 'lucide-react'

export default function PaymentQRScanner({ onScanComplete, onError }) {
  const videoRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [torchSupported, setTorchSupported] = useState(false)
  const [torchOn, setTorchOn] = useState(false)
  const [success, setSuccess] = useState(false)
  const isProcessingRef = useRef(false)

  // UPI Format: upi://pay?pa=xxx&pn=xxx&am=xxx
  const parseUPIString = (upiString) => {
    try {
      const normalizedString = upiString.startsWith('upi://') 
        ? upiString.replace('upi://', 'https://') 
        : upiString;
        
      const url = new URL(normalizedString)
      const params = url.searchParams
      
      const pa = params.get('pa')
      const pn = params.get('pn')
      const am = params.get('am')
      
      return {
        upiId: pa,
        name: pn ? decodeURIComponent(pn) : (pa ? pa.split('@')[0] : 'Merchant'),
        amount: am ? parseFloat(am) : null,
        note: params.get('tn') ? decodeURIComponent(params.get('tn')) : null,
        merchantCategory: params.get('mc'),
        type: 'upi'
      }
    } catch (e) {
      if (upiString.includes('@')) {
        return {
          upiId: upiString,
          name: upiString.split('@')[0],
          amount: null,
          type: 'upi-simple'
        }
      }
      return null
    }
  }

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
      
      setSuccess(true)
      const paymentData = parseUPIString(result.text)
      
      setTimeout(() => {
        onScanComplete({
          type: 'payment',
          ...paymentData,
          rawData: result.text,
          engine: result.engine
        })
      }, 150)
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
        {success && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-green-500/20 z-10" />}
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-[30%] flex justify-center pointer-events-none">
        <div className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-[10px] text-white font-bold uppercase tracking-widest">
           Detecting UPI QR...
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
