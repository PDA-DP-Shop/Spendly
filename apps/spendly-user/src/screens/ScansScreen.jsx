/**
 * SmartScanScreen — Spendly User
 * Google Pay-inspired full-screen scanner with 3 modes:
 *  1. Bill     — Spendly Shop QR bill
 *  2. Barcode  — Product barcode lookup
 *  3. Payment  — UPI QR / payment QR
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ScanLine, Barcode, QrCode,
  Receipt, CheckCircle2, AlertCircle,
  Copy, Check, ExternalLink,
  Wallet, ArrowLeft, CreditCard, Clock,
  Tag, ShoppingCart, FileText, Camera, Loader2, ChevronRight
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatMoney } from '../utils/formatMoney'
import { useSettingsStore } from '../store/settingsStore'
import { useExpenseStore } from '../store/expenseStore'
import { lookupBarcode } from '../services/productLookup'
import { scannedProductService, expenseService } from '../services/database'
import { parseScannedQR } from '../utils/qrCode'
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library'

const S = { fontFamily: "'Inter', sans-serif" }

// ─── Mode config ────────────────────────────────────────────────────────────
const MODES = [
  { id: 'bill',    label: 'Bill',    Icon: Receipt,  hint: 'Scan Spendly Shop QR',     viewfinder: 'square' },
  { id: 'barcode', label: 'Barcode', Icon: Barcode,  hint: 'Scan any product barcode',  viewfinder: 'wide'   },
  { id: 'payment', label: 'Payment', Icon: QrCode,   hint: 'Scan UPI / payment QR',    viewfinder: 'square' },
  { id: 'receipt', label: 'Receipt', Icon: FileText, hint: 'Point at any receipt & tap', viewfinder: 'full'  },
]


// ─── Decode helpers ──────────────────────────────────────────────────────────
function decodeBillUrl(text) {
  try {
    if (!text.includes('?data=')) return null
    const params = new URLSearchParams(text.split('?')[1])
    const data = params.get('data')
    if (!data) return null
    const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(data))))
    const bill = JSON.parse(jsonStr)
    return bill?.type === 'SPENDLY_BILL' ? bill : null
  } catch { return null }
}

function decodeUPIUrl(text) {
  // UPI deep-link: upi://pay?pa=abc@upi&pn=Name&am=100&tn=Note
  if (!text.startsWith('upi://') && !text.startsWith('UPI://')) return null
  try {
    const url = new URL(text.replace(/^upi:\/\//i, 'https://upi/'))
    return {
      pa: url.searchParams.get('pa') || '',          // payee address
      pn: url.searchParams.get('pn') || 'Unknown',  // payee name
      am: parseFloat(url.searchParams.get('am') || '0'),
      tn: url.searchParams.get('tn') || '',          // note
      mc: url.searchParams.get('mc') || '',          // merchant code
    }
  } catch { return null }
}

function isBarcode(text) {
  // EAN-13, EAN-8, UPC-A, Code128 etc — pure numeric or short alphanumeric
  return /^[0-9]{6,18}$/.test(text) || /^[A-Z0-9\-\.\ ]{4,20}$/.test(text)
}

function mapCategoryFromTags(category, tags) {
  const all = [category || '', ...(tags || [])].join(' ').toLowerCase()
  if (/food|grocery|beverage|snack|drink|biscuit|dairy|bakery|noodle|rice|oil/.test(all)) return 'food'
  if (/health|pharma|medicine|medical|vitamin|supplement|baby/.test(all)) return 'health'
  if (/electronic|phone|mobile|laptop|gadget|camera|computer|tv|appliance/.test(all)) return 'electronics'
  if (/fuel|petrol|diesel|transport|travel/.test(all)) return 'travel'
  if (/stationery|book|education|school|pen|pencil/.test(all)) return 'education'
  return 'shopping'
}

// ─── QR / Barcode scanner engine ────────────────────────────────────────────
function useCameraScanner({ onResult, paused }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)
  const zxingRef = useRef(null)
  const detectorRef = useRef(null)
  const lastResult = useRef(null)
  const [hasCamera, setHasCamera] = useState(null) // null=loading

  useEffect(() => {
    // Initialize ZXing MultiFormat reader
    const hints = new Map()
    // Prioritize QR codes but support standard barcodes too
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.QR_CODE,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.CODE_128,
      BarcodeFormat.UPC_A
    ])
    zxingRef.current = new BrowserMultiFormatReader(hints)
    
    return () => {
      zxingRef.current?.reset()
    }
  }, [])

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          // 640x480 is plenty for QR/barcode detection — 9× less data than 1920x1080
          width: { ideal: 640 },
          height: { ideal: 480 },
        }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setHasCamera(true)
    } catch {
      setHasCamera(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }, [])

  useEffect(() => {
    startCamera()
    return stopCamera
  }, [startCamera, stopCamera])

  // Scan loop — throttled to 5fps max, downscaled canvas, non-overlapping
  useEffect(() => {
    if (!hasCamera) return

    const SCAN_INTERVAL = 200   // ms between decode attempts (5fps)
    const SCAN_W = 320           // decode at 320px wide — fast but accurate enough
    const SCAN_H = 240

    let lastScanAt = 0
    let processing = false

    const tick = async (now) => {
      rafRef.current = requestAnimationFrame(tick)
      if (paused || processing) return

      // Throttle: only process at SCAN_INTERVAL
      if (now - lastScanAt < SCAN_INTERVAL) return

      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.readyState < 2) return

      processing = true
      lastScanAt = now

      // ── Draw video frame to downscaled canvas (320x240) for fast processing ──
      canvas.width = SCAN_W
      canvas.height = SCAN_H
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      ctx.drawImage(video, 0, 0, SCAN_W, SCAN_H)

      const tryResult = (text) => {
        if (!text || text === lastResult.current) { 
          processing = false
          return 
        }
        lastResult.current = text
        try { navigator.vibrate?.(60) } catch {}
        processing = false
        onResult(text)
      }

      const tryFallbackToZXing = async () => {
        if (!zxingRef.current) { processing = false; return }
        try {
          // Await async decode from current canvas content
          const result = await zxingRef.current.decodeFromCanvas(canvas)
          if (result) {
            tryResult(result.getText())
          } else {
            processing = false
          }
        } catch (e) {
          // No barcode found in this frame (ZXing throws on miss)
          processing = false
        }
      }

      if ('BarcodeDetector' in window) {
        try {
          if (!detectorRef.current) {
            detectorRef.current = new window.BarcodeDetector({
              formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'upc_a']
            })
          }
          const codes = await detectorRef.current.detect(canvas)
          if (codes.length > 0) {
            tryResult(codes[0].rawValue)
          } else {
            // No result from native detector, try ZXing
            await tryFallbackToZXing()
          }
        } catch (e) {
          await tryFallbackToZXing()
        }
      } else {
        await tryFallbackToZXing()
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [hasCamera, paused, onResult])

  // Allow re-scan
  const resetScan = () => { lastResult.current = null }

  return { videoRef, canvasRef, hasCamera, resetScan }
}

// ─── Viewfinder overlays ─────────────────────────────────────────────────────
function SquareViewfinder({ scanning, color }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
      {/* Shadow mask */}
      <div
        className="absolute"
        style={{
          width: 260, height: 260,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
          borderRadius: 24,
        }}
      />
      {/* Corner brackets */}
      {[
        'top-0 left-0 border-l-[3px] border-t-[3px] rounded-tl-2xl',
        'top-0 right-0 border-r-[3px] border-t-[3px] rounded-tr-2xl',
        'bottom-0 left-0 border-l-[3px] border-b-[3px] rounded-bl-2xl',
        'bottom-0 right-0 border-r-[3px] border-b-[3px] rounded-br-2xl',
      ].map((cls, i) => (
        <div key={i} className={`absolute w-9 h-9 border-white ${cls}`} />
      ))}
      {/* Sweep line */}
      {scanning && (
        <motion.div
          className="absolute left-2 right-2 h-[2px] rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, white, transparent)' }}
          initial={{ top: 4 }}
          animate={{ top: [4, 252, 4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  )
}

function WideViewfinder({ scanning }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 300, height: 120 }}>
      <div
        className="absolute"
        style={{
          width: 300, height: 120,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
          borderRadius: 14,
        }}
      />
      {[
        'top-0 left-0 border-l-[3px] border-t-[3px] rounded-tl-xl',
        'top-0 right-0 border-r-[3px] border-t-[3px] rounded-tr-xl',
        'bottom-0 left-0 border-l-[3px] border-b-[3px] rounded-bl-xl',
        'bottom-0 right-0 border-r-[3px] border-b-[3px] rounded-br-xl',
      ].map((cls, i) => (
        <div key={i} className={`absolute w-7 h-7 border-white ${cls}`} />
      ))}
      {scanning && (
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 left-2 right-2 h-[2px] rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, white, transparent)' }}
          initial={{ scaleX: 0.3 }}
          animate={{ scaleX: [0.3, 1, 0.3] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  )
}

// ─── Bill Sheet — Full Receipt with direct expense save ─────────────────────
function BillSheet({ bill, onClose, currency }) {
  const addExpense = useExpenseStore(s => s.addExpense)
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isDuplicate, setIsDuplicate] = useState(false)

  useEffect(() => {
    if (!bill.billId) return
    expenseService.getAll().then(all => {
      const match = all.find(e => e.billId === bill.billId)
      if (match) setIsDuplicate(true)
    })
  }, [bill.billId])

  // Category mapping
  const CAT_MAP = {
    grocery: 'shopping', food: 'food', medical: 'health',
    health: 'health', fashion: 'shopping', electronics: 'electronics',
    travel: 'travel', other: 'other'
  }

  const handleAdd = async () => {
    if (saving || saved) return
    setSaving(true)
    try {
      await addExpense({
        amount: bill.total,
        category: CAT_MAP[bill.shopCategory?.toLowerCase()] || CAT_MAP[bill.shop?.category?.toLowerCase()] || 'shopping',
        note: `${bill.shopName || bill.shop?.name} — Shop Bill`,
        date: bill.timestamp || bill.createdAt || new Date().toISOString(),
        // Store full bill detail for reference
        shopName: bill.shopName || bill.shop?.name,
        billNumber: bill.billNumber,
        billId: bill.billId,
        billSource: 'spendly-shop',
        billItems: bill.items,
        scanType: 'shop_bill',
        paymentMethod: bill.paymentMethod,
      })
      setSaved(true)
      try { navigator.vibrate?.([50, 30, 80]) } catch {}
      setTimeout(onClose, 1400)
    } catch {
      setSaving(false)
    }
  }

  const items = bill.items || []

  return (
    <motion.div
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 32, stiffness: 340 }}
      className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[36px] z-20 shadow-[0_-20px_60px_rgba(0,0,0,0.22)] overflow-hidden"
      style={{ maxHeight: '88dvh' }}
    >
      {/* Handle */}
      <div className="pt-4 pb-2 flex flex-col items-center">
        <div className="w-12 h-1.5 bg-[#EEEEEE] rounded-full" />
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: 'calc(88dvh - 20px)' }}>
        <div className="px-7 pt-4 pb-8">

          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-black rounded-[20px] flex items-center justify-center flex-shrink-0 shadow-lg">
              <Receipt className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-[800] text-[#AFAFAF] uppercase tracking-widest mb-0.5" style={S}>Bill received</p>
              <h3 className="text-[22px] font-[800] text-black tracking-tight leading-tight truncate" style={S}>
                {bill.shopName || 'Shop'}
              </h3>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-4 mb-5">
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#AFAFAF]" />
              <span className="text-[11px] font-[700] text-[#AFAFAF] uppercase tracking-widest" style={S}>
                #{bill.billNumber}
              </span>
            </div>
            {bill.paymentMethod && (
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#AFAFAF]" />
                <span className="text-[11px] font-[700] text-[#AFAFAF] uppercase tracking-widest" style={S}>
                  {bill.paymentMethod}
                </span>
              </div>
            )}
            {bill.createdAt && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#AFAFAF]" />
                <span className="text-[11px] font-[700] text-[#AFAFAF]" style={S}>
                  {new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>

          {/* Items list — full, scrollable */}
          <div className="bg-[#F6F6F6] rounded-[20px] overflow-hidden mb-5">
            <div className="px-5 py-3 border-b border-[#EEEEEE] flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[#AFAFAF]" />
              <span className="text-[11px] font-[800] text-[#AFAFAF] uppercase tracking-widest" style={S}>
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="divide-y divide-[#EEEEEE]">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5 gap-3">
                  <span className="text-[14px] font-[700] text-black flex-1 truncate" style={S}>
                    {item.name}
                  </span>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[12px] font-[600] text-[#AFAFAF]" style={S}>
                      {item.quantity || 1}×
                    </span>
                    <span className="text-[14px] font-[800] text-black" style={S}>
                      {formatMoney(item.price * (item.quantity || 1), currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bill totals breakdown */}
          <div className="bg-[#F6F6F6] rounded-[20px] px-5 py-4 mb-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-[13px] font-[600] text-[#AFAFAF]" style={S}>Subtotal</span>
              <span className="text-[13px] font-[700] text-black" style={S}>
                {formatMoney(bill.subtotal || bill.total, currency)}
              </span>
            </div>
            {(bill.gstAmount > 0) && (
              <div className="flex justify-between">
                <span className="text-[13px] font-[600] text-[#AFAFAF]" style={S}>
                  GST ({bill.gstPercent}%)
                </span>
                <span className="text-[13px] font-[700] text-black" style={S}>
                  +{formatMoney(bill.gstAmount, currency)}
                </span>
              </div>
            )}
            {(bill.discountAmount > 0) && (
              <div className="flex justify-between">
                <span className="text-[13px] font-[600] text-[#AFAFAF]" style={S}>Discount</span>
                <span className="text-[13px] font-[700] text-red-500" style={S}>
                  -{formatMoney(bill.discountAmount, currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t border-[#EEEEEE]">
              <span className="text-[16px] font-[800] text-black uppercase tracking-wide" style={S}>Total</span>
              <span className="text-[26px] font-[800] text-black tracking-tight" style={S}>
                {formatMoney(bill.total, currency)}
              </span>
            </div>
          </div>

          {/* CTA */}
          <AnimatePresence mode="wait">
            {saved ? (
              <motion.div
                key="saved"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-2 py-5"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" strokeWidth={2} />
                </motion.div>
                <p className="text-[15px] font-[800] text-black" style={S}>Added to Spendly!</p>
              </motion.div>
            ) : isDuplicate ? (
              <motion.div key="duplicate" className="flex flex-col gap-4 mt-3">
                <div className="bg-[#FEF2F2] rounded-[20px] p-5 border border-red-100 flex flex-col items-center text-center">
                  <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                  <h4 className="text-[15px] font-[800] text-[#991B1B]" style={S}>Already Saved!</h4>
                  <p className="text-[12px] font-[600] text-red-800/80 mt-1" style={S}>
                    You already added this bill on<br/>
                    {new Date(bill.timestamp || bill.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { onClose(); navigate('/expenses'); }}
                    className="flex-1 h-14 bg-[#F6F6F6] rounded-full font-[800] text-[14px] text-black" style={S}>
                    View Existing
                  </button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleAdd} disabled={saving}
                    className="flex-1 h-14 bg-red-500 text-white rounded-full font-[800] text-[14px] shadow-[0_8px_16px_rgba(239,68,68,0.2)]" style={S}>
                    {saving ? 'Saving...' : 'Save Again'}
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="cta" className="flex gap-3 mt-3">
                <button onClick={onClose}
                  className="flex-1 h-14 bg-[#F6F6F6] rounded-full font-[800] text-[14px] text-[#545454]" style={S}>
                  Dismiss
                </button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleAdd} disabled={saving}
                  className="flex-1 h-14 bg-black text-white rounded-full font-[800] text-[14px] shadow-lg flex items-center justify-center gap-2" style={S}>
                  {saving ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                  ) : (
                    <><Check className="w-4 h-4" strokeWidth={3} /> Add to Spendly</>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

function BarcodeSheet({ code, onClose, onAdd }) {
  const [copied, setCopied] = useState(false)

  const copyCode = () => {
    navigator.clipboard?.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 32, stiffness: 340 }}
      className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[36px] p-8 pb-10 z-20 shadow-[0_-20px_60px_rgba(0,0,0,0.18)]"
    >
      <div className="w-12 h-1.5 bg-[#EEEEEE] rounded-full mx-auto mb-6" />

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center flex-shrink-0">
          <Barcode className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className="text-[18px] font-[800] text-black tracking-tight" style={S}>Barcode Scanned</h3>
          <p className="text-[11px] font-[700] text-[#AFAFAF] uppercase tracking-widest mt-0.5" style={S}>Product code</p>
        </div>
      </div>

      <div className="bg-[#F6F6F6] rounded-[20px] p-6 mb-6 flex items-center justify-between gap-4">
        <span className="text-[22px] font-[800] text-black tracking-widest font-mono flex-1" style={S}>{code}</span>
        <motion.button whileTap={{ scale: 0.9 }} onClick={copyCode}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${copied ? 'bg-black' : 'bg-white border border-[#EEEEEE]'}`}>
          {copied
            ? <Check className="w-4 h-4 text-white" strokeWidth={3} />
            : <Copy className="w-4 h-4 text-[#545454]" strokeWidth={2.5} />}
        </motion.button>
      </div>

      <p className="text-[12px] font-[600] text-[#AFAFAF] text-center mb-6" style={S}>
        Record this as a product expense in Spendly
      </p>

      <div className="flex gap-3">
        <button onClick={onClose}
          className="flex-1 h-14 bg-[#F6F6F6] rounded-full font-[800] text-[14px] text-[#545454]" style={S}>
          Dismiss
        </button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={onAdd}
          className="flex-1 h-14 bg-black text-white rounded-full font-[800] text-[14px] shadow-lg" style={S}>
          Log Expense
        </motion.button>
      </div>
    </motion.div>
  )
}

function PaymentSheet({ upi, onClose, onLogExpense }) {
  const [copied, setCopied] = useState(false)

  const copyUPI = () => {
    navigator.clipboard?.writeText(upi.pa)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openUPI = () => {
    const url = `upi://pay?pa=${upi.pa}&pn=${encodeURIComponent(upi.pn)}${upi.am ? `&am=${upi.am}` : ''}`
    window.open(url, '_blank')
  }

  return (
    <motion.div
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 32, stiffness: 340 }}
      className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[36px] p-8 pb-10 z-20 shadow-[0_-20px_60px_rgba(0,0,0,0.18)]"
    >
      <div className="w-12 h-1.5 bg-[#EEEEEE] rounded-full mx-auto mb-6" />

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center flex-shrink-0">
          <Wallet className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[20px] font-[800] text-black tracking-tight truncate" style={S}>{upi.pn}</h3>
          <p className="text-[12px] font-[600] text-[#AFAFAF] mt-0.5 truncate" style={S}>{upi.pa}</p>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={copyUPI}
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${copied ? 'bg-black' : 'bg-[#F6F6F6] border border-[#EEEEEE]'}`}>
          {copied
            ? <Check className="w-4 h-4 text-white" strokeWidth={3} />
            : <Copy className="w-4 h-4 text-[#545454]" strokeWidth={2.5} />}
        </motion.button>
      </div>

      {upi.am > 0 && (
        <div className="bg-[#F6F6F6] rounded-[20px] p-5 mb-4 flex items-center justify-between">
          <span className="text-[13px] font-[700] text-[#AFAFAF] uppercase tracking-widest" style={S}>Amount</span>
          <span className="text-[22px] font-[800] text-black tracking-tight" style={S}>₹{upi.am}</span>
        </div>
      )}

      {upi.tn && (
        <div className="bg-[#F6F6F6] rounded-[20px] p-5 mb-6">
          <span className="text-[11px] font-[700] text-[#AFAFAF] uppercase tracking-widest block mb-1" style={S}>Note</span>
          <span className="text-[14px] font-[700] text-black" style={S}>{upi.tn}</span>
        </div>
      )}

      {/* Two CTAs: Open UPI app + Log in Spendly */}
      <div className="space-y-3">
        <motion.button whileTap={{ scale: 0.97 }} onClick={openUPI}
          className="w-full h-14 bg-black text-white rounded-full font-[800] text-[14px] shadow-lg flex items-center justify-center gap-2" style={S}>
          Open &amp; Pay <ExternalLink className="w-4 h-4" />
        </motion.button>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 h-12 bg-[#F6F6F6] rounded-full font-[800] text-[13px] text-[#545454]" style={S}>
            Dismiss
          </button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => onLogExpense(upi)}
            className="flex-1 h-12 bg-[#F6F6F6] rounded-full font-[800] text-[13px] text-black border border-[#EEEEEE] flex items-center justify-center gap-1.5" style={S}>
            <Receipt className="w-4 h-4" /> Log Expense
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}


// ─── Receipt OCR Capture ─────────────────────────────────────────────────────
// Uses existing ocrProcessor + billExtractor services
function ReceiptOCRCapture({ videoRef }) {
  const navigate = useNavigate()
  const captureCanvasRef = useRef(null)
  const [ocrState, setOcrState] = useState('idle') // idle | processing | done
  const [stage, setStage] = useState('')

  const STAGES = [
    'Enhancing image…',
    'Reading text…',
    'Extracting details…',
    'Done!',
  ]

  const handleCapture = async () => {
    if (ocrState !== 'idle') return
    const video = videoRef.current
    if (!video || video.readyState < 2) return

    setOcrState('processing')

    const canvas = captureCanvasRef.current || document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)

    try {
      setStage(STAGES[0])
      const { runOCR } = await import('../services/scanner/ocrProcessor')
      const ocrText = await runOCR(canvas)

      setStage(STAGES[1])
      const { extractBillData } = await import('../services/scanner/billExtractor')
      const extracted = extractBillData(ocrText)

      setStage(STAGES[2])
      try { navigator.vibrate?.([50, 30, 100]) } catch {}

      // Build the prefill object — only include amount if non-zero
      const amountNum = parseFloat(extracted.amount) || 0
      const dateISO = extracted.date
        ? new Date(extracted.date + 'T' + (extracted.time || '12:00')).toISOString()
        : new Date().toISOString()

      setStage(STAGES[3])
      setOcrState('done')

      setTimeout(() => {
        navigate('/add?mode=type', {
          state: {
            prefilled: {
              ...(amountNum > 0 ? { amount: amountNum } : {}),
              shopName: extracted.shopName !== 'Miscellaneous Merchant' ? extracted.shopName : '',
              category: extracted.category || 'shopping',
              note: extracted.shopName && extracted.shopName !== 'Miscellaneous Merchant'
                ? `${extracted.shopName} receipt`
                : 'Receipt scan',
              date: dateISO,
              scanType: 'receipt_ocr',
            }
          }
        })
      }, 600)
    } catch (err) {
      console.error('OCR failed', err)
      setStage('Could not read receipt. Try better lighting.')
      setTimeout(() => { setOcrState('idle'); setStage('') }, 3000)
    }
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between pointer-events-none">
      {/* Guide text */}
      <div className="mt-32 px-10 pointer-events-none">
        <p className="text-white/60 text-[12px] font-[700] uppercase tracking-widest text-center" style={S}>
          Hold steady · Keep receipt flat · Good light
        </p>
      </div>

      {/* OCR state overlay */}
      <AnimatePresence>
        {ocrState === 'processing' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-6 pointer-events-auto"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
              className="w-16 h-16 rounded-full border-4 border-white/20 border-t-white"
            />
            <motion.p
              key={stage}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white text-[14px] font-[800] uppercase tracking-widest text-center"
              style={S}
            >
              {stage}
            </motion.p>
          </motion.div>
        )}

        {ocrState === 'done' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-black/70 flex items-center justify-center pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            >
              <CheckCircle2 className="w-20 h-20 text-emerald-400" strokeWidth={1.5} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shutter button */}
      <div className="mb-8 pointer-events-auto">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={handleCapture}
          disabled={ocrState !== 'idle'}
          className="relative w-20 h-20 flex items-center justify-center"
        >
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-white/60" />
          {/* Inner fill */}
          <div className={`w-[60px] h-[60px] rounded-full transition-all ${ocrState === 'idle' ? 'bg-white' : 'bg-white/40'}`} />
        </motion.button>
        <p className="text-white/50 text-[10px] font-[700] uppercase tracking-widest text-center mt-3" style={S}>
          Tap to read
        </p>
      </div>

      <canvas ref={captureCanvasRef} className="hidden" />
    </div>
  )
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ScansScreen() {
  const navigate = useNavigate()
  const { settings } = useSettingsStore()
  const currency = settings?.currency || 'INR'

  const [mode, setMode] = useState('bill')   // 'bill' | 'barcode' | 'payment' | 'receipt'
  const [result, setResult] = useState(null)
  const [rawText, setRawText] = useState('')
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(true)
  const [barcodeResolving, setBarcodeResolving] = useState(false) // lookup in progress

  const currentMode = MODES.find(m => m.id === mode)

  const handleRaw = useCallback((text) => {
    setScanning(false)
    setRawText(text)

    if (mode === 'bill') {
      const result = parseScannedQR(text)
      if (result.isSpendlyBill) {
        setResult({ type: 'bill', data: result.data })
      } else {
        // Fallback for extremely old legacy generic QR links
        const bill = decodeBillUrl(text)
        if (bill) {
          setResult({ type: 'bill', data: bill })
        } else {
          setError('No Spendly bill found in this QR code')
          setTimeout(() => { setError(''); setScanning(true) }, 2500)
        }
      }

    } else if (mode === 'payment') {
      const upi = decodeUPIUrl(text)
      if (upi) {
        setResult({ type: 'payment', data: upi })
      } else if (text.startsWith('http') || text.includes('@')) {
        setResult({ type: 'payment', data: { pa: text, pn: 'Unknown', am: 0, tn: '' } })
      } else {
        setError('Not a payment QR code')
        setTimeout(() => { setError(''); setScanning(true) }, 2500)
      }

    } else if (mode === 'barcode') {
      if (isBarcode(text) || text.length > 2) {
        try { navigator.vibrate?.(60) } catch {}
        setBarcodeResolving(true)

        // ── 3-Tier intelligent product lookup ──────────────────────────────
        ;(async () => {
          let productName = ''
          let productBrand = ''
          let productCategory = 'shopping'
          let productPrice = undefined

          // Tier 0: User's own scan history (fastest — their own past entries)
          try {
            const personal = await scannedProductService.get(text)
            if (personal) {
              productName   = personal.productName || ''
              productBrand  = personal.brand || ''
              productCategory = personal.category || 'shopping'
              productPrice  = personal.amount > 0 ? personal.amount : undefined
            }
          } catch {}

          // Tier 1+2: local 50k DB → IndexedDB cache → remote API
          if (!productName) {
            try {
              const found = await lookupBarcode(text)
              if (found) {
                productName    = found.name || ''
                productBrand   = found.brand || ''
                productCategory = mapCategoryFromTags(found.category, found.categoryTags)
                // API sometimes returns a price range
                if (found.amount && !productPrice) productPrice = found.amount
              }
            } catch {}
          }

          setBarcodeResolving(false)

          navigate('/add?mode=type', {
            state: {
              prefilled: {
                shopName:  productName
                  ? (productBrand ? `${productName} (${productBrand})` : productName)
                  : '',
                note:      productName
                  ? `${productName}${productBrand ? ' — ' + productBrand : ''}`
                  : `Barcode: ${text}`,
                // Pre-fill price only if we have a confident value from personal history
                ...(productPrice > 0 ? { amount: productPrice } : {}),
                category:   productCategory,
                scanType:  'barcode',
                barcodeValue: text,
              }
            }
          })
        })()
      } else {
        setError('Could not read barcode')
        setTimeout(() => { setError(''); setScanning(true) }, 2500)
      }
    }
  }, [mode, navigate])

  const handleModeChange = (newMode) => {
    dismiss()
    setMode(newMode)
  }

  // Log UPI payment as expense in Add Expense
  const handleLogUPIExpense = (upi) => {
    navigate('/add?mode=type', {
      state: {
        prefilled: {
          shopName: upi.pn !== 'Unknown' ? upi.pn : upi.pa,
          amount: upi.am > 0 ? upi.am : undefined,
          category: 'bills',
          note: upi.tn || `UPI payment to ${upi.pa}`,
          scanType: 'payment_qr',
        }
      }
    })
    dismiss()
  }

  const { videoRef, canvasRef, hasCamera, resetScan } = useCameraScanner({
    onResult: handleRaw,
    paused: !!result || mode === 'receipt',
  })

  // Handle dismiss with cache reset
  const dismiss = () => {
    setResult(null)
    setError('')
    setRawText('')
    setScanning(true)
    resetScan()
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col overflow-hidden">
      {/* Camera */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-14 pb-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="w-11 h-11 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10"
        >
          <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2.5} />
        </motion.button>

        <div className="text-center">
          <p className="text-white text-[17px] font-[800] tracking-tight" style={S}>Smart Scan</p>
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" />
            <span className="text-white/50 text-[10px] font-[700] uppercase tracking-widest" style={S}>Auto-detecting</span>
          </div>
        </div>

        {/* Torch placeholder */}
        <div className="w-11 h-11" />
      </div>

      {/* ── Camera not available ── */}
      {hasCamera === false && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60 px-10 text-center z-10">
          <div className="w-20 h-20 bg-white/10 rounded-[28px] flex items-center justify-center mb-6">
            <ScanLine className="w-10 h-10 text-white/40" />
          </div>
          <p className="text-[17px] font-[800] text-white mb-2" style={S}>Camera Access Needed</p>
          <p className="text-[13px] font-[600] text-white/50 leading-relaxed" style={S}>
            Allow camera access in your browser settings to use Smart Scan.
          </p>
        </div>
      )}

      {/* ── Viewfinder area ── */}
      {hasCamera && (
        <div className="flex-1 flex flex-col items-center justify-center relative">
          {/* Animated hint label above viewfinder */}
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 px-5 py-2 bg-black/40 backdrop-blur-sm rounded-full border border-white/10"
          >
            <span className="text-white text-[12px] font-[700] uppercase tracking-widest" style={S}>
              {currentMode?.hint}
            </span>
          </motion.div>

          {/* Viewfinder — hidden in receipt mode (full-frame capture instead) */}
          {mode !== 'receipt' && (
            <AnimatePresence mode="wait">
              {barcodeResolving ? (
                <motion.div key="resolving"
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="w-64 h-32 border-2 border-white/40 rounded-3xl flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                    <span className="text-white text-[11px] font-[800] uppercase tracking-widest mt-2" style={S}>Looking up...</span>
                  </div>
                </motion.div>
              ) : currentMode?.viewfinder === 'wide' ? (
                <motion.div key="wide"
                  initial={{ opacity: 0, scaleX: 0.8 }} animate={{ opacity: 1, scaleX: 1 }}
                  exit={{ opacity: 0, scaleX: 0.8 }}>
                  <WideViewfinder scanning={scanning} />
                </motion.div>
              ) : (
                <motion.div key="square"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}>
                  <SquareViewfinder scanning={scanning} />
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Receipt OCR shutter UI */}
          {mode === 'receipt' && (
            <ReceiptOCRCapture videoRef={videoRef} />
          )}

          {/* Success flash — not for receipt mode */}
          {mode !== 'receipt' && (
            <AnimatePresence>
              {result && !error && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="mt-6 flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-3 rounded-full border border-white/20"
                >
                  <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                  <span className="text-white text-[13px] font-[800]" style={S}>Scanned!</span>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Error toast */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="mt-6 flex items-center gap-2 bg-black/70 backdrop-blur-md px-5 py-3 rounded-full border border-red-400/30"
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-white text-[12px] font-[700]" style={S}>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Mode tabs at bottom ── */}
      <div className="relative z-10 pb-8">
        <div className="mx-5 bg-black/70 backdrop-blur-2xl rounded-[28px] border border-white/10 p-2 flex items-center gap-1">
          {MODES.map((m) => {
            const Icon = m.Icon
            const active = mode === m.id
            return (
              <motion.button
                key={m.id}
                whileTap={{ scale: 0.93 }}
                onClick={() => handleModeChange(m.id)}
                className={`relative flex-1 flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-[20px] overflow-hidden transition-colors duration-200 ${
                  active ? 'bg-white' : 'bg-transparent'
                }`}
              >
                <Icon
                  className={`w-5 h-5 relative z-10 transition-all duration-200 ${active ? 'text-black' : 'text-white/50'}`}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span
                  className={`text-[10px] font-[800] uppercase tracking-wide relative z-10 transition-all duration-200 ${active ? 'text-black' : 'text-white/50'}`}
                  style={S}
                >
                  {m.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>


      {/* ── Result sheets ── */}
      <AnimatePresence>
        {result?.type === 'bill' && (
          <>
            <motion.div
              key="overlay-bill"
              initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black z-10"
              onClick={dismiss}
            />
            <BillSheet
              key="bill-sheet"
              bill={result.data}
              currency={currency}
              onClose={dismiss}
            />
          </>
        )}
        {result?.type === 'payment' && (
          <>
            <motion.div
              key="overlay-payment"
              initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black z-10"
              onClick={dismiss}
            />
            <PaymentSheet
              key="payment-sheet"
              upi={result.data}
              onClose={dismiss}
              onLogExpense={handleLogUPIExpense}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
