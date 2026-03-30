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

  const startCamera = async (isMounted) => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 2560 },
          height: { ideal: 1440 }
        }
      })
      if (!isMounted) {
        s.getTracks().forEach(track => track.stop())
        return
      }
      setStream(s)
      if (videoRef.current) {
        videoRef.current.srcObject = s
        videoRef.current.play()
      }
    } catch (e) {
      if (isMounted) setError('Camera access denied or unavailable.')
    }
  }

  useEffect(() => {
    let isMounted = true
    useSecurityStore.getState().setPauseSecurity(true)
    startCamera(isMounted)
    return () => {
      isMounted = false
      useSecurityStore.getState().setPauseSecurity(false)
      setStream(s => {
        if (s) s.getTracks().forEach(track => track.stop())
        return null
      })
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
    
    // OCR Pre-Processing: Grayscale and High Contrast
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imgData.data
    const contrast = 120 // high contrast
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast))
    for (let i = 0; i < data.length; i += 4) {
      let grayscale = 0.3 * data[i] + 0.59 * data[i+1] + 0.11 * data[i+2]
      let c = factor * (grayscale - 128) + 128
      c = Math.max(0, Math.min(255, c))
      data[i] = c; data[i+1] = c; data[i+2] = c;
    }
    ctx.putImageData(imgData, 0, 0)
    
    if (stream) stream.getTracks().forEach(t => t.stop())

    try {
      const result = await Tesseract.recognize(canvas, 'eng')
      const rawText = result.data.text
      const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 2)
      
      // 1. EXTRACT SHOP NAME (Usually the first few clear non-numeric lines)
      const junkWords = ['TAX', 'TOTAL', 'SUBTOTAL', 'CASH', 'VISA', 'DATE', 'TIME', 'RECEIPT', 'INVOICE', 'TEL', 'PHONE', 'WWW', 'WELCOME', 'THANK', 'ITEMS', 'REGISTER', 'STORE']
      let shopName = ''
      for (let line of lines) {
         const cleanLine = line.toUpperCase()
         if (!junkWords.some(j => cleanLine.includes(j)) && !/\d{5,}/.test(line) && !/^\d+[.,]\d{2}$/.test(line)) {
            shopName = line
            break
         }
      }

      // 2. EXTRACT DATE & TIME
      // Regex for common date formats: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
      const dateMatch = rawText.match(/(\d{1,4}[/.-]\d{1,2}[/.-]\d{1,4})/g)
      const timeMatch = rawText.match(/(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)/gi)
      
      let detectedDate = null
      if (dateMatch) {
         // Attempt to parse the first date found
         const d = new Date(dateMatch[0].replace(/\//g, '-'))
         if (!isNaN(d.getTime())) detectedDate = d
      }
      if (timeMatch && detectedDate) {
         // If we have a date and found a time, try to merge them or just trust the string
      }

      // 3. EXTRACT AMOUNT
      const normalizedText = rawText.replace(/\n| /g, ' ').toUpperCase()
      const rawAmounts = normalizedText.match(/\d{1,3}(?:[.,\s]\d{3})*[.,\s]\d{2}(?!\d)/g) || []
      let validAmounts = rawAmounts.map(a => {
        let clean = a.replace(/[^\d.,]/g, '')
        let lastSep = Math.max(clean.lastIndexOf('.'), clean.lastIndexOf(','))
        if(lastSep > -1) clean = clean.substring(0, lastSep).replace(/[.,]/g, '') + '.' + clean.substring(lastSep + 1)
        return parseFloat(clean)
      }).filter(n => !isNaN(n) && n > 0 && n < 20000)
      
      const maxAmount = validAmounts.length > 0 ? Math.max(...validAmounts) : 0

      // 4. CLEAN NOTES (Filter out junk, keep items)
      const cleanedNotes = lines
         .filter(l => l.length > 4)
         .filter(l => !junkWords.some(j => l.toUpperCase().includes(j)))
         .filter(l => !/\d{10,}/.test(l)) // Filter phone numbers / large IDs
         .slice(1, 6) // Take first few items but skip name
         .join('\n')

      onBillScanned({ 
         name: shopName, 
         amount: maxAmount, 
         date: detectedDate,
         notes: cleanedNotes,
         fullText: rawText 
      })
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
