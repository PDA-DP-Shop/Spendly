import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { lookupBarcode } from '../../services/barcodeService'
import { 
  CAMERA_CONSTRAINTS, 
  startScanLoop, 
  checkTorchSupport, 
  toggleTorch,
  tryZoom
} from '../../services/multiScanner'
import { Zap, ZapOff, Sparkles } from 'lucide-react'

export default function BarcodeScanner({ onScanComplete, onError }) {
  const videoRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [status, setStatus] = useState('Initializing...')
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
          
          // Wait for video to be ready
          videoRef.current.onloadedmetadata = async () => {
            await videoRef.current.play()
            setIsReady(true)
            setStatus('Scanning...')
            
            // Check torch support
            const hasTorch = await checkTorchSupport(stream)
            setTorchSupported(hasTorch)
            
            // Start the optimized high-speed loop
            stopScanner = startScanLoop(
              videoRef.current, 
              handleScanResult,
              setStatus
            )
          }
        }
      } catch (err) {
        console.error('Camera Init Error:', err)
        onError?.(err)
      }
    }

    const handleScanResult = async (result) => {
      if (isProcessingRef.current) return
      isProcessingRef.current = true
      
      setSuccess(true)
      setStatus('Detected!')
      
      try {
        const barcodeData = await lookupBarcode(result.text)
        
        setTimeout(() => {
          onScanComplete({
            type: 'barcode',
            barcode: result.text,
            name: barcodeData.name,
            price: barcodeData.price,
            format: result.format,
            engine: result.engine,
            source: barcodeData.source
          })
        }, 150)
      } catch (e) {
        isProcessingRef.current = false
        setSuccess(false)
      }
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

  const handleManualZoom = () => {
    const track = videoRef.current?.srcObject?.getVideoTracks()[0]
    if (track) tryZoom(track, false) // Reset zoom
  }

  return (
    <div className="absolute inset-0 w-full h-full bg-black overflow-hidden" onClick={handleManualZoom}>
      {/* Video Feed */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
      />

      {/* Modern Scanning HUD */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
         {/* Success Flash */}
         <AnimatePresence>
            {success && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-green-500/30 z-20"
              />
            )}
         </AnimatePresence>

         {/* Scanning Status */}
         <div className="absolute bottom-[30%] px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
            <motion.div 
              animate={{ opacity: [1, 0.4, 1] }} 
              transition={{ repeat: Infinity, duration: 1 }}
              className={`w-1.5 h-1.5 rounded-full ${success ? 'bg-green-500' : 'bg-white'}`} 
            />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">{status}</span>
         </div>
      </div>

      {/* Controls */}
      <div className="absolute top-6 right-20 z-50 flex flex-col gap-4">
        {torchSupported && (
          <button 
            onClick={(e) => { e.stopPropagation(); handleToggleTorch(); }}
            className={`w-11 h-11 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center transition-all ${torchOn ? 'bg-yellow-400 border-yellow-500 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'bg-white/10'}`}
          >
            {torchOn ? <Zap className="w-5 h-5 text-black fill-black" /> : <ZapOff className="w-5 h-5 text-white" />}
          </button>
        )}
      </div>

      {/* High-Speed Indicator */}
      <div className="absolute top-6 left-20 z-50">
         <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
            <span className="text-[8px] font-black text-white/60 uppercase tracking-[0.2em]">High Speed WASM</span>
         </div>
      </div>
    </div>
  )
}
