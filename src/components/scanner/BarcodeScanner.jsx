import { useEffect, useRef, useState, useCallback } from 'react'
import { BrowserMultiFormatReader } from '@zxing/library'
import { X, Camera } from 'lucide-react'
import { motion } from 'framer-motion'
import { lookupBarcode } from '../../services/productLookup'
import { throttle } from '../../utils/security'
import { useSecurityStore } from '../../store/securityStore'

export default function BarcodeScanner({ onProductFound, onClose }) {
  const videoRef = useRef(null)
  const [error, setError] = useState(null)
  const [scanning, setScanning] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    useSecurityStore.getState().setPauseSecurity(true)
    return () => useSecurityStore.getState().setPauseSecurity(false)
  }, [])

  const handleScan = useCallback(async (result) => {
    if (!result || !scanning || loading) return
    setScanning(false)
    setLoading(true)

    // Immediate haptic feedback that the camera caught the barcode
    if (navigator.vibrate) navigator.vibrate(200)
    
    const product = await lookupBarcode(result.text)
    if (product) {
      onProductFound({ ...product, rawValue: result.text })
    } else {
      if (navigator.vibrate) navigator.vibrate([200, 100, 200])
      setError(`Not found in database. Adding raw code to expense...`)
      setTimeout(() => {
        onProductFound({ name: '', brand: '', categoryTags: [], rawValue: result.text })
      }, 1500)
    }
  }, [scanning, loading, onProductFound])

  // Throttle the actual scan processing to 1 scan per 2 seconds to prevent DOS on the lookup service
  const throttledScan = useCallback(
    throttle((result) => handleScan(result), 2000),
    [handleScan]
  )

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader()
    let stream = null

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
          
          codeReader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
            if (result) throttledScan(result)
          })
        }
      } catch (e) {
        setError('Camera access denied or unavailable. Please enable permissions.')
      }
    }

    startCamera()

    return () => {
      codeReader.reset()
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [handleScan])

  return (
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 safe-top bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10 text-white">
        <h2 className="font-sora font-semibold text-[18px] flex items-center gap-2">
          <Camera className="w-5 h-5" /> Scan Product
        </h2>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full backdrop-blur-md">
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover" 
          playsInline
          muted
        />
        
        {/* Scanning frame overlay */}
        <div className="absolute inset-0 pointer-events-none flex flex-col">
          <div className="flex-1 bg-black/60" />
          <div className="flex">
            <div className="w-[10vw] sm:flex-1 bg-black/60" />
            <div className="w-[80vw] h-[25vh] sm:w-[400px] border-2 border-green-500 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] overflow-hidden">
              {scanning && (
                <motion.div 
                  animate={{ y: ['0%', '250px', '0%'] }} 
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  className="w-full h-1 bg-green-400 absolute top-0 shadow-[0_0_15px_3px_rgba(74,222,128,0.8)]" 
                />
              )}
            </div>
            <div className="w-[10vw] sm:flex-1 bg-black/60" />
          </div>
          <div className="flex-1 bg-black/60 flex flex-col items-center justify-center p-6">
            {loading ? (
              <div className="bg-purple-600/90 backdrop-blur-md px-6 py-4 rounded-2xl flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-white font-medium">Looking up product...</span>
              </div>
            ) : error ? (
              <p className="text-white bg-red-500/90 backdrop-blur-md px-5 py-3 rounded-2xl font-medium text-center">
                {error}
              </p>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <p className="text-white/70 text-sm font-medium">Align barcode inside the frame</p>
                <button onClick={() => onProductFound({ name: '', brand: '', categoryTags: [] })} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-sm font-medium rounded-xl backdrop-blur-md transition-colors">
                  Enter Manually Instead
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
