/**
 * ScansScreen.jsx — Bill OCR scan history
 * Shows a grid of past receipt scans with their thumbnail and OCR data.
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Trash2, Image as ImageIcon, CheckCircle2, ChevronRight, UploadCloud, AlertCircle, Maximize2, Share2, Receipt } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { getScanHistory, deleteScan, markScanAsAdded } from '../services/ocrService'
import { formatMoney } from '../utils/formatMoney'
import { useSettingsStore } from '../store/settingsStore'
import PageGuide from '../components/shared/PageGuide'
import { usePageGuide } from '../hooks/usePageGuide'

const S = { fontFamily: "'Inter', sans-serif" }

export default function ScansHistoryScreen() {
  const navigate = useNavigate()
  const { settings } = useSettingsStore()
  const currency = settings?.currency || 'INR'

  const [selectedScan, setSelectedScan] = useState(null)
  
  const headerRef = useRef(null)
  const gridRef = useRef(null)
  const firstCardRef = useRef(null)

  const { showGuide, currentStep, startGuide, nextStep, prevStep, skipGuide } = usePageGuide('scans_history_page')

  const guideSteps = [
    { targetRef: headerRef, emoji: '📸', title: 'Bill History', description: 'Every receipt you scan using the AI camera is stored here permanently.', borderRadius: 20 },
    { targetRef: gridRef, emoji: '🗂️', title: 'The Vault', description: 'Browse your past scans, categorized by shop name and total amount automatically.', borderRadius: 24 },
    { targetRef: firstCardRef, emoji: '✨', title: 'Smart Sync', description: 'Look for the "Added" badge to see if you have already converted a scan into a real expense.', borderRadius: 32 }
  ]
  
  // Long press / delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  const loadScans = async () => {
    setLoading(true)
    const history = await getScanHistory()
    setScans(history)
    setLoading(false)
  }

  useEffect(() => {
    loadScans()
  }, [])

  // ─── Thumbnail Card ────────────────────────────────────────────────────────
  const ScanCard = ({ scan, innerRef }) => {
    const [imgUrl, setImgUrl] = useState('')

    useEffect(() => {
      // Create local URL for the blob
      if (scan.imageBlob) {
        const url = URL.createObjectURL(scan.imageBlob)
        setImgUrl(url)
        return () => URL.revokeObjectURL(url)
      }
    }, [scan.imageBlob])

    // Touch handlers for long-press to delete
    let pressTimer = null
    const startPress = () => {
      pressTimer = setTimeout(() => setShowDeleteConfirm(scan.id), 600)
    }
    const endPress = () => {
      if (pressTimer) clearTimeout(pressTimer)
    }

    return (
      <motion.div
        ref={innerRef}
        whileTap={{ scale: 0.96 }}
        className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.04)] border border-[#F6F6F6] relative"
        onTouchStart={startPress}
        onTouchEnd={endPress}
        onMouseDown={startPress}
        onMouseUp={endPress}
        onMouseLeave={endPress}
        onClick={() => {
          if (!pressTimer) setSelectedScan(scan) // Prevent tap after long press
        }}
      >
        {/* Thumbnail Image area */}
        <div className="w-full h-32 bg-[#F6F6F6] relative group">
          {imgUrl ? (
            <img src={imgUrl} className="w-full h-full object-cover opacity-90 transition-opacity" alt="Scan" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-[#E0E0E0]" />
            </div>
          )}
          
          {/* Badge overlays */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <div className={`px-2 py-0.5 rounded-full text-[9px] font-[800] uppercase tracking-widest backdrop-blur-md shadow-sm ${scan.addedAsExpense ? 'bg-black/90 text-white' : 'bg-white/90 text-[#94A3B8]'}`} style={S}>
              {scan.addedAsExpense ? 'Added' : 'Not added'}
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="p-4">
          <p className="text-[14px] font-[800] text-black tracking-tight truncate" style={S}>
            {scan.shopName || 'Unknown Shop'}
          </p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[16px] font-[800] text-emerald-600 tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
              {formatMoney(scan.totalAmount || 0, currency)}
            </p>
          </div>
          <p className="text-[10px] font-[700] text-[#AFAFAF] uppercase tracking-widest mt-2" style={S}>
            {scan.scannedAt ? format(new Date(scan.scannedAt), 'dd MMM, HH:mm') : 'Unknown'}
          </p>
        </div>
      </motion.div>
    )
  }

  // ─── Delete Confirmation Modal ─────────────────────────────────────────────
  const handleDelete = async () => {
    if (!showDeleteConfirm) return
    await deleteScan(showDeleteConfirm)
    setShowDeleteConfirm(null)
    loadScans()
  }

  // ─── Full Screen Bill View ──────────────────────────────────────────────────
  const FullScreenView = () => {
    const scan = selectedScan
    if (!scan) return null

    const [fullImgUrl, setFullImgUrl] = useState('')
    useEffect(() => {
      if (scan.imageBlob) {
        const url = URL.createObjectURL(scan.imageBlob)
        setFullImgUrl(url)
        return () => URL.revokeObjectURL(url)
      }
    }, [scan.imageBlob])

    const handleShare = async () => {
      // In a real device environment, share the image using Web Share API if possible
      if (navigator.share && scan.imageBlob) {
        try {
          const file = new File([scan.imageBlob], "receipt-scan.jpg", { type: "image/jpeg" })
          await navigator.share({
            title: `Receipt - ${scan.shopName}`,
            text: `Receipt for ${formatMoney(scan.totalAmount, currency)} from ${scan.shopName}`,
            files: [file]
          })
        } catch (e) {
          console.error("Error sharing:", e)
        }
      }
    }

    const handleLogExpense = () => {
      setSelectedScan(null)
      navigate('/add-expense', {
        state: {
          prefilled: {
            shopName: scan.shopName,
            productName: scan.shopName,
            amount: scan.totalAmount,
            date: scan.scannedAt,
            scanType: 'receipt_ocr',
            billSource: 'ocr',
            step: 2,
            historyId: scan.id
          }
        }
      })
    }

    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black flex flex-col"
      >
        {/* Top Navbar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex flex-col bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center justify-between px-6 pt-14 pb-4">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSelectedScan(null)}
              className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleShare}
              className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <Share2 className="w-4 h-4 text-white" />
            </motion.button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Bill Image - Full width */}
          {fullImgUrl ? (
            <img src={fullImgUrl} className="w-full object-contain bg-black mt-20" style={{ maxHeight: '60dvh' }} alt="Full Bill" />
          ) : (
            <div className="w-full h-[60dvh] bg-[#111] flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-[#333]" />
            </div>
           )}

          {/* Extracted Details - Bottom sheet look */}
          <div className="bg-white px-7 py-8 min-h-[40dvh]" style={{ borderRadius: '40px 40px 0 0', marginTop: '-20px', position: 'relative', zIndex: 5 }}>
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-[26px] font-[900] text-black tracking-tight leading-tight" style={S}>
                  {scan.shopName || 'Unknown Shop'}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                   <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-widest" style={S}>
                     {scan.date ? format(new Date(scan.date), 'dd MMM yyyy') : 'No Date'}
                   </p>
                   {scan.time && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-[#E0E0E0]" />
                        <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-widest" style={S}>
                           {scan.time}
                        </p>
                      </>
                   )}
                </div>
              </div>
              <div className="bg-emerald-50 px-4 py-2.5 rounded-2xl">
                 <p className="text-[20px] font-[800] text-emerald-600 tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
                    {formatMoney(scan.totalAmount || 0, currency)}
                 </p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-[#F8F9FA] rounded-3xl p-5 border border-[#EEEEEE]">
                 <span className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-[0.1em] mb-2 block" style={S}>Confidence</span>
                 <div className="flex items-center gap-2">
                   {scan.confidence === 'high' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-orange-500" />}
                   <span className="text-[14px] font-[800] text-black capitalize" style={S}>{scan.confidence} Quality</span>
                 </div>
              </div>
              
              {scan.rawText && (
                <div className="bg-[#F8F9FA] rounded-3xl p-5 border border-[#EEEEEE]">
                   <span className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-[0.1em] mb-2 block" style={S}>Raw OCR Text</span>
                   <p className="text-[12px] font-[600] text-black/60 leading-relaxed max-h-32 overflow-y-auto font-mono whitespace-pre-wrap rounded-xl bg-white p-3 border border-[#EAEAEA]">
                      {scan.rawText.substring(0, 300)}{scan.rawText.length > 300 ? '...' : ''}
                   </p>
                </div>
              )}
            </div>

            {/* CTA */}
            {!scan.addedAsExpense ? (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleLogExpense}
                className="w-full py-5 rounded-[20px] text-white font-[800] text-[16px] flex items-center justify-center gap-3"
                style={{ background: 'linear-gradient(135deg, #222222 0%, #000000 100%)', boxShadow: '0 12px 32px rgba(0,0,0,0.32)' }}
              >
                Add as Expense <ArrowRight className="w-5 h-5" />
              </motion.button>
            ) : (
              <div className="w-full py-5 rounded-[20px] bg-[#F6F6F6] text-[#AFAFAF] font-[800] text-[16px] flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Already Logged
              </div>
            )}
            <div className="pb-10" />
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#F8F9FA] flex flex-col">
      {/* Top Navbar */}
      <div className="sticky top-0 z-50 bg-[#F8F9FA]/90 backdrop-blur-2xl border-b border-[#EEEEEE]/50 px-6 pt-14 pb-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button onClick={() => navigate(-1)} whileTap={{ scale: 0.8 }}
            className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-[#EEEEEE] flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6 text-black" strokeWidth={2.5} />
          </motion.button>
          <div>
            <h1 className="text-[25px] font-[900] text-black tracking-tight leading-none" style={S}>Bill Scans</h1>
            <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-widest mt-1.5" style={S}>Receipt History</p>
          </div>
        </div>
        <button 
           onClick={startGuide}
           className="w-[34px] h-[34px] rounded-full bg-black text-white flex items-center justify-center font-bold text-[16px] leading-none active:scale-95 transition-transform"
           style={{ fontFamily: "'DM Sans', sans-serif" }}
           title="How to use this page"
        >
           ?
        </button>
      </div>

      {/* Grid Content */}
      <div className="flex-1 px-6 pt-6 pb-32">
        {loading ? (
          <div className="flex justify-center mt-20">
            <div className="w-8 h-8 border-4 border-[#EEEEEE] border-t-black rounded-full animate-spin" />
          </div>
        ) : scans.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-center">
            <div className="w-24 h-24 bg-white rounded-[32px] border border-[#EEEEEE] flex items-center justify-center mb-6 shadow-sm">
              <Receipt className="w-10 h-10 text-[#CBD5E1]" strokeWidth={1.5} />
            </div>
            <h3 className="text-[20px] font-[800] text-black tracking-tight mb-2" style={S}>No Scans Yet</h3>
            <p className="text-[14px] font-[600] text-[#94A3B8] leading-relaxed max-w-[240px]" style={S}>
              Your recently scanned receipts will appear here.
            </p>
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-2 gap-4">
            {scans.map((scan, i) => (
              <ScanCard key={scan.id} scan={scan} innerRef={i === 0 ? firstCardRef : null} />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex justify-center items-end pb-10"
            onClick={() => setShowDeleteConfirm(null)}
          >
             <motion.div 
               initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
               transition={{ type: 'spring', damping: 30, stiffness: 350 }}
               className="w-full max-w-[400px] bg-white mx-4 rounded-3xl p-6 shadow-2xl relative"
               onClick={e => e.stopPropagation()}
             >
                <div className="w-14 h-14 rounded-[20px] bg-red-50 flex items-center justify-center mb-5">
                   <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-[20px] font-[900] text-black mb-2" style={S}>Delete Scan?</h3>
                <p className="text-[14px] font-[600] text-[#94A3B8] mb-6">This will permanently delete this scanned receipt image and its data.</p>
                
                <div className="flex gap-3">
                   <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-4 bg-[#F8F9FA] rounded-[18px] text-[#AFAFAF] font-[800] text-[15px]">Cancel</button>
                   <button onClick={handleDelete} className="flex-1 py-4 bg-red-500 rounded-[18px] text-white font-[800] text-[15px] shadow-[0_8px_20px_rgba(239,68,68,0.3)]">Delete</button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedScan && <FullScreenView />}
      </AnimatePresence>

      <PageGuide 
        show={showGuide} 
        steps={guideSteps} 
        currentStep={currentStep} 
        onNext={nextStep} 
        onPrev={prevStep} 
        onSkip={skipGuide} 
      />
    </div>
  )
}
