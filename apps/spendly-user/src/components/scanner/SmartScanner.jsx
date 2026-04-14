/**
 * SmartScanner Component — Integrated Premium Edition
 * Google Pay-inspired high-perf scanner with 4 modes
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Zap, ZapOff, Camera, Package, ScanBarcode, QrCode, Receipt, FileText, 
  Clock, Check, AlertCircle, ShoppingBag, Landmark 
} from 'lucide-react'
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library'

const S = { fontFamily: "'Inter', sans-serif" }

const MODES = [
  { id: 'bill',    label: 'Bill',    Icon: Receipt,  hint: 'Scan Spendly Shop QR' },
  { id: 'barcode', label: 'Barcode', Icon: ScanBarcode, hint: 'Scan product barcode' },
  { id: 'payment', label: 'Payment', Icon: QrCode,   hint: 'Scan UPI / Payment QR' },
  { id: 'receipt', label: 'Receipt', Icon: FileText, hint: 'Point at bill & tap' },
]

export default function SmartScanner({ onResult, onClose }) {
  const [activeTab, setActiveTab] = useState('bill')
  const [isReady, setIsReady] = useState(false)
  const [torch, setTorch] = useState(false)
  
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)
  const zxingRef = useRef(null)
  const lastResult = useRef(null)

  // ── Initialize Camera ──
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      const video = videoRef.current
      if (video) {
        video.srcObject = stream
        const playPromise = video.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsReady(true))
            .catch(() => { /* Interrupted */ })
        }
      }
    } catch (e) {
      console.error('Camera failed', e)
    }
  }, [])

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }, [])

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (track && 'applyConstraints' in track) {
      try {
        await track.applyConstraints({ advanced: [{ torch: !torch }] })
        setTorch(!torch)
      } catch {}
    }
  }

  useEffect(() => {
    const hints = new Map()
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.QR_CODE, BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, 
      BarcodeFormat.CODE_128, BarcodeFormat.UPC_A
    ])
    zxingRef.current = new BrowserMultiFormatReader(hints)
    startCamera()
    return stopCamera
  }, [startCamera, stopCamera])

  // ── Scan Loop ──
  useEffect(() => {
    if (!isReady || activeTab === 'receipt') return

    const tick = async () => {
      rafRef.current = requestAnimationFrame(tick)
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.readyState < 2) return

      // Throttled processing
      canvas.width = 640
      canvas.height = 360
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      ctx.drawImage(video, 0, 0, 640, 360)

      try {
        const res = await zxingRef.current.decodeFromCanvas(canvas)
        if (res && res.getText() !== lastResult.current) {
          lastResult.current = res.getText()
          handleDetected(res.getText())
        }
      } catch {}
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isReady, activeTab])

  const handleDetected = (text) => {
    if (window.navigator.vibrate) window.navigator.vibrate(60)
    
    // Logic for routing based on detection
    if (text.startsWith('upi://')) {
      onResult({ type: 'payment-qr', text, instant: true })
    } else if (text.includes('spendly') || text.trim().startsWith('{')) {
      onResult({ type: 'spendly-bill', text, instant: true })
    } else if (/^[0-9]{8,13}$/.test(text)) {
      onResult({ type: 'product-barcode', barcode: text, instant: true })
    } else {
      // Generic fallback
      onResult({ type: 'generic', text, instant: true })
    }
  }

  const handleCaptureReceipt = async () => {
    // Basic animation to simulate capture
    if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100])
    onResult({ type: 'receipt-ocr', instant: true })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col overflow-hidden">
      
      {/* Viewfinder Background */}
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" autoPlay playsInline muted />
      <canvas ref={canvasRef} className="hidden" />

      {/* Mask and Overlay */}
      <div className="absolute inset-0 bg-black/40 z-10" />
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-30 pt-[env(safe-area-inset-top,24px)]">
        <button onClick={onClose} className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center">
          <X className="w-6 h-6 text-white" />
        </button>
        <div className="bg-black/20 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-white text-[11px] font-[900] uppercase tracking-widest">{activeTab}_MODE</span>
        </div>
        <button onClick={toggleTorch} className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center">
          {torch ? <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" /> : <ZapOff className="w-5 h-5 text-white/50" />}
        </button>
      </div>

      {/* Viewfinder Frame */}
      <div className="flex-1 flex items-center justify-center relative z-20">
         <div className={`relative transition-all duration-500 ${activeTab === 'barcode' ? 'w-[300px] h-[140px]' : 'w-[260px] h-[260px]'}`}>
            <div className="absolute inset-0 border-2 border-white/30 rounded-[32px]" />
            <div className="absolute -inset-1 border-t-4 border-l-4 border-white w-10 h-10 rounded-tl-[32px]" />
            <div className="absolute -inset-1 border-t-4 border-r-4 border-white w-10 h-10 rounded-tr-[32px]" style={{left:'auto'}} />
            <div className="absolute -inset-1 border-b-4 border-l-4 border-white w-10 h-10 rounded-bl-[32px]" style={{top:'auto'}} />
            <div className="absolute -inset-1 border-b-4 border-r-4 border-white w-10 h-10 rounded-br-[32px]" style={{top:'auto', left:'auto'}} />
            
            <motion.div className="absolute left-4 right-4 h-1 bg-white/50 blur-sm brightness-150 rounded-full"
              animate={{ top: ['10%', '90%', '10%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
         </div>
         
         <p className="absolute bottom-[20%] text-white/60 text-[12px] font-[800] uppercase tracking-widest text-center px-12">
           {MODES.find(m => m.id === activeTab)?.hint}
         </p>
      </div>

      {/* Mode Selector */}
      <div className="absolute bottom-0 left-0 right-0 p-8 pb-[env(safe-area-inset-bottom,40px)] z-30">
        <div className="max-w-[360px] mx-auto">
           {activeTab === 'receipt' && (
             <div className="flex justify-center mb-10">
                <motion.button whileTap={{ scale: 0.9 }} onClick={handleCaptureReceipt}
                  className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/10 backdrop-blur-md">
                   <div className="w-16 h-16 rounded-full bg-white" />
                </motion.button>
             </div>
           )}
           
           <div className="bg-black/40 backdrop-blur-2xl p-2 rounded-[32px] border border-white/10 flex items-center justify-between">
              {MODES.map(mode => {
                const Icon = mode.Icon
                const isSel = activeTab === mode.id
                return (
                  <button key={mode.id} onClick={() => setActiveTab(mode.id)}
                    className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-[24px] transition-all ${isSel ? 'bg-white text-black shadow-2xl scale-105' : 'text-white/40 active:text-white'}`}>
                    <Icon className={`w-5 h-5 ${isSel ? 'text-black' : 'text-current'}`} strokeWidth={isSel ? 3 : 2} />
                    <span className="text-[9px] font-[900] uppercase tracking-tighter">{mode.label}</span>
                  </button>
                )
              })}
           </div>
        </div>
      </div>

      {/* Boot Loader */}
      <AnimatePresence>
        {!isReady && (
          <motion.div exit={{ opacity: 0 }} className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center">
             <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin mb-6" />
             <p className="text-white text-[11px] font-[900] uppercase tracking-[0.4em]">Optimizing Lens</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
