/**
 * SmartScanner Component - White Premium Edition
 * Integrated high-end scan experience with luminous HUD
 */
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, ZapOff, Camera, Package, ScanBarcode, Cpu } from 'lucide-react'
import { useCamera } from '../../hooks/useCamera'
import { useSmartScanner } from '../../hooks/useSmartScanner'
import ScannerOverlay from './ScannerOverlay'
import ScanResultCard from './ScanResultCard'

export default function SmartScanner({ onResult, onClose }) {
  const { videoRef, startCamera, stopCamera, toggleTorch, torch, isReady, setIsReady } = useCamera()
  const [result, setResult] = useState(null)
  const [activeTab, setActiveTab] = useState('SCAN') // 'SCAN' or 'BARCODE'
  const S = { fontFamily: "'Plus Jakarta Sans', sans-serif" }

  const handleScanResult = useCallback((res) => {
    if (res.instant) {
      if (window.navigator.vibrate) window.navigator.vibrate([50, 30, 50])
      onResult(res)
      return
    }
    setResult(res)
    if (window.navigator.vibrate) window.navigator.vibrate(100)
  }, [onResult])

  const { scanStatus, isScanning, isProcessing, setIsScanning, capturePhoto } = useSmartScanner(videoRef, handleScanResult, activeTab)

  useEffect(() => {
    startCamera()
    setIsScanning(true)
    const timer = setTimeout(() => setIsReady(true), 2000)
    return () => {
      clearTimeout(timer)
      stopCamera()
      setIsScanning(false)
    }
  }, [startCamera, stopCamera, setIsScanning, setIsReady])

  const handleConfirm = () => {
    if (!result) return
    onResult(result)
  }

  const handleEdit = () => {
    if (!result) return
    onResult({ ...result, forceEdit: true })
  }

  const handleCancel = () => {
    setResult(null)
    setIsScanning(true)
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden safe-area-padding"
    >
      <div className="absolute inset-0 bg-black/5" />
      {/* Live Camera Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onLoadedData={() => setIsReady(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${isReady ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Initialization Loader (White Premium) */}
      <AnimatePresence>
        {!isReady && (
          <motion.div 
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-white flex flex-col items-center justify-center"
          >
            <div className="w-14 h-14 border-[5px] border-gray-50 border-t-indigo-600 rounded-full animate-spin mb-6 shadow-sm" />
            <h2 className="text-black text-[14px] font-[900] uppercase tracking-[0.3em]" style={S}>
                AI_Insight Hub
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar Controls (Premium Frost) */}
      <div className="absolute top-0 left-0 right-0 px-6 pt-[env(safe-area-inset-top,24px)] flex items-center justify-between z-30">
        <button 
          onClick={onClose} 
          className="w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-2xl flex items-center justify-center border border-white/40 shadow-xl active:scale-95 transition-all"
        >
          <X className="w-6 h-6 text-gray-900" strokeWidth={3} />
        </button>
        
        <button 
          onClick={toggleTorch} 
          className="w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-2xl flex items-center justify-center border border-white/40 shadow-xl active:scale-95 transition-all"
        >
          {torch ? <Zap className="w-5 h-5 text-indigo-600 fill-indigo-600" /> : <ZapOff className="w-5 h-5 text-gray-900/40" />}
        </button>
      </div>

      {/* Neurall Processing Overlay (White Wash) */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-white/60 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center"
          >
            <div className="w-16 h-16 border-[6px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-8 shadow-2xl" />
            <h3 className="text-black text-[20px] font-[950] tracking-tighter mb-2" style={S}>
                Neural Shield Active
            </h3>
            <p className="text-gray-500 text-[11px] font-[850] uppercase tracking-[0.2em]" style={S}>
                Pixel-level precision lock enabled
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

      {/* Bottom Controls Area (White Premium) */}
      {!result && (
        <div className="absolute bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom,40px)] flex flex-col items-center gap-8 z-40">
          
          {/* Capture Button (Premium White Edition) */}
          {activeTab === 'SCAN' && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={capturePhoto}
              className="group relative w-20 h-20 rounded-full border-[6px] border-white/50 backdrop-blur-sm flex items-center justify-center shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-white group-active:bg-gray-100 transition-colors" />
              <Camera className="w-8 h-8 text-indigo-600 relative z-10" strokeWidth={2.5} />
              <div className="absolute inset-0 border-[2px] border-indigo-500/10 rounded-full" />
            </motion.button>
          )}

          {/* Mode Selector Tabs (White Premium Style) */}
          <div className="flex bg-white/80 backdrop-blur-3xl p-1.5 rounded-[32px] border border-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.15)] mx-6">
            <button 
              onClick={() => setActiveTab('SCAN')}
              className={`px-8 py-3 rounded-[24px] text-[11px] font-[900] tracking-[0.1em] uppercase transition-all flex items-center gap-2.5 ${activeTab === 'SCAN' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400'}`}
              style={S}
            >
              <Package className="w-4 h-4" strokeWidth={3} />
              Smart Scan
            </button>
            <button 
              onClick={() => setActiveTab('BARCODE')}
              className={`px-8 py-3 rounded-[24px] text-[11px] font-[900] tracking-[0.1em] uppercase transition-all flex items-center gap-2.5 ${activeTab === 'BARCODE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400'}`}
              style={S}
            >
              <ScanBarcode className="w-4 h-4" strokeWidth={3} />
              Barcode
            </button>
          </div>
        </div>
      )}

      {/* Branding Footer */}
      {!result && (
        <div className="absolute bottom-6 left-0 right-0 text-center opacity-30">
          <p className="text-gray-900 text-[9px] font-[900] uppercase tracking-[0.4em]" style={S}>
             Spendly_AI Powered
          </p>
        </div>
      )}
    </motion.div>
  )
}
