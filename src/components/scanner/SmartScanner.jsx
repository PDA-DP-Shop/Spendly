/**
 * SmartScanner Component
 * Final Refinement: Bottom tab switcher and manual capture for SCAN mode.
 */
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, ZapOff, Camera, Package, ScanBarcode } from 'lucide-react'
import { useCamera } from '../../hooks/useCamera'
import { useSmartScanner } from '../../hooks/useSmartScanner'
import ScannerOverlay from './ScannerOverlay'
import ScanResultCard from './ScanResultCard'

export default function SmartScanner({ onResult, onClose }) {
  const { videoRef, startCamera, stopCamera, toggleTorch, torch, isReady, setIsReady } = useCamera()
  const [result, setResult] = useState(null)
  const [activeTab, setActiveTab] = useState('SCAN') // 'SCAN' or 'BARCODE'
  const S = { fontFamily: "'Inter', sans-serif" }

  const handleScanResult = useCallback((res) => {
    // Handling automatic results (Barcodes/QR)
    if (res.instant) {
      if (window.navigator.vibrate) window.navigator.vibrate([50, 30, 50])
      onResult(res.result)
      return
    }

    // Handling manual results (OCR)
    setResult(res)
    if (window.navigator.vibrate) window.navigator.vibrate(100)
  }, [onResult])

  const { scanStatus, isScanning, setIsScanning, capturePhoto } = useSmartScanner(videoRef, handleScanResult, activeTab)

  useEffect(() => {
    startCamera()
    setIsScanning(true)
    
    // Fallback loader clear
    const timer = setTimeout(() => setIsReady(true), 2000)
    
    return () => {
      clearTimeout(timer)
      stopCamera()
      setIsScanning(false)
    }
  }, [startCamera, stopCamera, setIsScanning, setIsReady])

  const handleConfirm = () => {
    if (!result) return
    onResult(result.data)
  }

  const handleEdit = () => {
    if (!result) return
    onResult({ ...result.data, forceEdit: true })
  }

  const handleCancel = () => {
    setResult(null)
    setIsScanning(true)
  }

  const HAPTIC_SHAKE = {
    tap: { 
      scale: 0.9,
      transition: { duration: 0.1 }
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col overflow-hidden"
    >
      {/* Live Camera Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onLoadedData={() => setIsReady(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${isReady ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Initialization Loader */}
      <AnimatePresence>
        {!isReady && (
          <motion.div 
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-white flex flex-col items-center justify-center font-sans"
          >
            <div className="w-12 h-12 border-4 border-[#F6F6F6] border-t-black rounded-full animate-spin mb-4" />
            <p className="text-black text-[12px] font-[800] uppercase tracking-widest">Neural Eye Initializing...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar Controls */}
      <div className="absolute top-0 left-0 right-0 px-8 pt-14 pb-8 flex items-center justify-between z-30 bg-gradient-to-b from-black/40 to-transparent">
        <button 
          onClick={onClose} 
          className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-xl flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
        >
          <X className="w-6 h-6 text-white" strokeWidth={3} />
        </button>
        
        <button 
          onClick={toggleTorch} 
          className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-xl flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
        >
          {torch ? <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" /> : <ZapOff className="w-5 h-5 text-white" />}
        </button>
      </div>

      {/* Processing Neural Shield Overlay */}
      <AnimatePresence>
        {scanStatus.includes('Reading') && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center"
          >
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(255,255,255,0.2)]" />
            <h3 className="text-white text-[18px] font-[900] uppercase tracking-widest mb-3" style={S}>
                Neural Accuracy Shield
            </h3>
            <p className="text-white/60 text-[11px] font-[800] uppercase tracking-[0.2em] max-w-[200px] leading-relaxed" style={S}>
                {scanStatus.includes('Binary') ? 'Running deep pixel-level analysis for 99.9% precision' : 'Analyzing text structure and normalizing data...'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Viewfinder UI */}
      <AnimatePresence>
        {!result && <ScannerOverlay status={scanStatus} mode={activeTab} />}
      </AnimatePresence>

      {/* Result Confirmation Card */}
      <AnimatePresence>
        {result && (
          <ScanResultCard 
            result={result} 
            onConfirm={handleConfirm}
            onEdit={handleEdit}
            onCancel={handleCancel}
          />
        )}
      </AnimatePresence>

      {/* Bottom Controls Area */}
      {!result && (
        <div className="absolute bottom-0 left-0 right-0 pb-16 pt-32 bg-gradient-to-t from-black/60 to-transparent flex flex-col items-center gap-8 z-40">
          
          {/* Capture Button for SCAN mode */}
          {activeTab === 'SCAN' && (
            <motion.button
              variants={HAPTIC_SHAKE}
              whileTap="tap"
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full border-[6px] border-white/30 flex items-center justify-center active:scale-95 transition-all shadow-2xl relative"
            >
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-inner">
                <Camera className="w-7 h-7 text-black" strokeWidth={2.5} />
              </div>
            </motion.button>
          )}

          {/* Mode Selector Tabs (BOTTOM) */}
          <div className="flex bg-black/40 backdrop-blur-3xl p-1.5 rounded-full border border-white/10 shadow-2xl">
            <button 
              onClick={() => setActiveTab('SCAN')}
              className={`px-8 py-3 rounded-full text-[12px] font-[900] tracking-[0.15em] uppercase transition-all flex items-center gap-2.5 ${activeTab === 'SCAN' ? 'bg-white text-black shadow-lg scale-105' : 'text-white/60'}`}
              style={S}
            >
              <Package className={`w-4 h-4 ${activeTab === 'SCAN' ? 'text-black' : 'text-white/40'}`} strokeWidth={activeTab === 'SCAN' ? 3 : 2} />
              Scan
            </button>
            <button 
              onClick={() => setActiveTab('BARCODE')}
              className={`px-8 py-3 rounded-full text-[12px] font-[900] tracking-[0.15em] uppercase transition-all flex items-center gap-2.5 ${activeTab === 'BARCODE' ? 'bg-white text-black shadow-lg scale-105' : 'text-white/60'}`}
              style={S}
            >
              <ScanBarcode className={`w-4 h-4 ${activeTab === 'BARCODE' ? 'text-black' : 'text-white/40'}`} strokeWidth={activeTab === 'BARCODE' ? 3 : 2} />
              Barcode
            </button>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      {!result && (
        <div className="absolute bottom-6 left-0 right-0 text-center opacity-40">
          <p className="text-white text-[9px] font-[800] uppercase tracking-[0.4em]" style={S}>
            Powered by Neural Insight Engine
          </p>
        </div>
      )}
    </motion.div>
  )
}
