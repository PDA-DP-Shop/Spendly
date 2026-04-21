/**
 * BillScanResult.jsx — Three-stage bill OCR result flow
 *
 * Stage 1 (isScanning=true):  Full-screen scanning overlay with animated line + rotating tips
 * Stage 2 (scanResult ready): Slide-up bottom sheet with editable pre-filled fields
 * Stage 3 (user confirms):    Navigate to AddExpenseScreen with prefilled data
 *
 * Props:
 *   isScanning      boolean         — true while OCR is running
 *   scanProgress    number 0-100    — feeds the progress bar in the overlay
 *   scanProgressMsg string          — dynamic status label ("Enhancing image…")
 *   scanResult      object | null   — output of ocrService.extractBillData()
 *   onRetake        () => void      — user wants to retake the photo
 *   onClose         () => void      — close without saving
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Store, DollarSign, Calendar, Clock,
  ArrowRight, RotateCcw, Receipt,
  CheckCircle2, AlertTriangle, XCircle,
  Camera, X,
} from 'lucide-react'
import { format } from 'date-fns'
import { guessCategory } from '../../utils/guessCategory'
import { useExpenseStore } from '../../store/expenseStore'
import { markScanAsAdded, saveShopCorrection } from '../../services/ocrService'

const S = { fontFamily: "'Inter', sans-serif" }

// ─── Rotating tip messages ────────────────────────────────────────────────────
const TIPS = [
  'Hold steady for better results',
  'Good lighting improves accuracy',
  'Make sure the total is clearly visible',
  'Place the bill flat on a surface',
  'Avoid shadows over the receipt',
]

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — SCANNING OVERLAY
// Shown while Tesseract.js is processing the image.
// ─────────────────────────────────────────────────────────────────────────────
function ScanningOverlay({ progress, progressMsg }) {
  const [tipIndex, setTipIndex] = useState(0)

  // Rotate tips every 2 seconds
  useEffect(() => {
    const id = setInterval(
      () => setTipIndex(i => (i + 1) % TIPS.length),
      2000
    )
    return () => clearInterval(id)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 bg-black/92 flex flex-col items-center justify-center gap-7 px-8"
    >
      {/* Scanning frame with animated laser line */}
      <div className="relative w-52 h-52 rounded-[28px] overflow-hidden border-2 border-black/10">
        {/* Dark tint */}
        <div className="absolute inset-0 bg-black/5" />

        {/* Laser line */}
        <motion.div
          animate={{ y: ['0%', '100%', '0%'] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-0 right-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(167,139,250,0.9) 50%, transparent 100%)',
            boxShadow: '0 0 12px 2px rgba(139,92,246,0.6)',
          }}
        />

        {/* Corner accent brackets */}
        {[
          'top-0 left-0 border-t-2 border-l-2 rounded-tl-[14px]',
          'top-0 right-0 border-t-2 border-r-2 rounded-tr-[14px]',
          'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-[14px]',
          'bottom-0 right-0 border-b-2 border-r-2 rounded-br-[14px]',
        ].map((cls, i) => (
          <div key={i} className={`absolute w-7 h-7 border-black/20 ${cls}`} />
        ))}

        {/* Centre icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Receipt className="w-16 h-16 text-black/20" strokeWidth={1} />
        </div>
      </div>

      {/* Heading + status */}
      <div className="text-center">
        <h2 className="text-[22px] font-[800] text-white mb-1" style={S}>
          Reading your bill...
        </h2>
        <p className="text-[13px] font-[500] text-white/45" style={S}>
          {progressMsg || 'Enhancing image quality'}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-52 h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${Math.max(progress, 5)}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full bg-black"
        />
      </div>

      {/* Rotating tip pill */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tipIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="px-4 py-2.5 rounded-2xl border border-white/10 bg-white/6"
        >
          <p className="text-[12px] font-[600] text-white/55" style={S}>
            💡 Tip: {TIPS[tipIndex]}
          </p>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Editable field — pre-filled by OCR, black border on focus,
// orange highlight + pulsing dot when value is empty (OCR missed it).
// ─────────────────────────────────────────────────────────────────────────────
function Field({ icon: Icon, label, value, onChange, placeholder, type = 'text', prefix }) {
  const [focused, setFocused] = useState(false)
  const isEmpty = value === null || value === undefined || String(value).trim() === ''

  return (
    <div className="space-y-2">
      <label
        className="flex items-center gap-1.5 text-[11px] font-[800] text-[#AFAFAF] uppercase tracking-[0.15em] ml-1"
        style={S}
      >
        <Icon className="w-3 h-3" />
        {label}
      </label>

      <div
        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 bg-white transition-all duration-200 ${
          focused
            ? 'border-black shadow-[0_0_0_3px_rgba(0,0,0,0.1)]'
            : isEmpty
            ? 'border-orange-300 bg-orange-50/60 shadow-[0_0_0_2px_rgba(249,115,22,0.07)]'
            : 'border-[#F1F5F9]'
        }`}
      >
        {prefix && (
          <span className="text-[15px] font-[700] text-[#94A3B8] flex-shrink-0" style={S}>
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent text-[15px] font-[600] text-black outline-none placeholder:text-orange-300"
          style={S}
        />
        {isEmpty && (
          <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse flex-shrink-0" />
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Confidence badge — colour + icon changes based on OCR quality
// ─────────────────────────────────────────────────────────────────────────────
function ConfidenceBadge({ confidence }) {
  const cfg = {
    high:   { Icon: CheckCircle2, text: 'High confidence',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-100', icn: 'text-emerald-500' },
    medium: { Icon: AlertTriangle, text: 'Please verify',   cls: 'bg-amber-50 text-amber-700 border-amber-100',       icn: 'text-amber-500'   },
    low:    { Icon: XCircle,       text: 'Low quality scan', cls: 'bg-red-50 text-red-600 border-red-100',             icn: 'text-red-500'     },
  }
  const { Icon, text, cls, icn } = cfg[confidence] ?? cfg.low

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-[800] mt-0.5 ${cls}`} style={S}>
      <Icon className={`w-3 h-3 ${icn}`} />
      {text}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — human-readable date/time display
// ─────────────────────────────────────────────────────────────────────────────

/** "2025-04-17" → "17 Apr 2025" */
function fmtDisplayDate(iso) {
  if (!iso) return ''
  try { return format(new Date(iso), 'dd MMM yyyy') } catch { return iso }
}

/** "19:30" → "7:30 PM" */
function fmtDisplayTime(hhmm) {
  if (!hhmm) return ''
  try {
    const [h, m] = hhmm.split(':').map(Number)
    const period = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${String(m).padStart(2, '0')} ${period}`
  } catch { return hhmm }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function BillScanResult({
  isScanning = false,
  scanProgress = 0,
  scanProgressMsg = '',
  scanResult = null,
  onRetake,
  onClose,
}) {
  const navigate = useNavigate()
  const { setScannedBill } = useExpenseStore()

  // Editable form state initialised from OCR output
  const [shopName, setShopName] = useState('')
  const [amount,   setAmount]   = useState('')
  const [dateIso,  setDateIso]  = useState('')   // stored as YYYY-MM-DD internally
  const [timeStr,  setTimeStr]  = useState('')   // stored as HH:MM (24h) internally

  // Human-readable strings shown in the input fields
  const [dispDate, setDispDate] = useState('')
  const [dispTime, setDispTime] = useState('')

  // Sync editable fields when OCR result arrives
  useEffect(() => {
    if (!scanResult) return
    setShopName(scanResult.shopName ?? '')
    setAmount(scanResult.totalAmount != null ? String(scanResult.totalAmount) : '')
    setDateIso(scanResult.date ?? '')
    setTimeStr(scanResult.time ?? '')
    setDispDate(fmtDisplayDate(scanResult.date))
    setDispTime(fmtDisplayTime(scanResult.time))
  }, [scanResult])

  // ── Step 3: Navigate to AddExpenseScreen with OCR data ──────────────────
  const handleAddExpense = async () => {
    // Check if user edited the auto-detected shop name
    if (shopName && shopName !== scanResult.shopName && shopName !== scanResult.originalShopName) {
      if (scanResult.originalShopName) {
        await saveShopCorrection(scanResult.originalShopName, shopName)
      }
    }

    // Mark history entry as used
    if (scanResult.historyId) {
      await markScanAsAdded(scanResult.historyId)
    }

    // Write to the Zustand bill bridge so AddExpenseScreen can show the badge
    setScannedBill({
      shopName,
      totalAmount: parseFloat(amount) || null,
      date: dateIso,
      time: timeStr,
      confidence: scanResult?.confidence ?? 'low',
      source: 'bill',
    })

    // Build a datetime ISO string AddExpenseScreen's format() call can read
    let datetimeStr = null
    if (dateIso) {
      // Merge date + time (fall back to midnight if no time was found)
      const t = timeStr || '00:00'
      datetimeStr = `${dateIso}T${t}`
    }

    // Auto-detect category from shop name
    const category = shopName ? guessCategory(shopName) : 'other'

    // Build brief items note for the Notes field
    const itemsNote =
      scanResult?.items?.length > 0
        ? scanResult.items.map(i => `${i.name} — ₹${i.price}`).join('\n')
        : ''

    navigate('/add-expense', {
      state: {
        prefilled: {
          shopName,
          productName: shopName,
          amount: parseFloat(amount) || null,
          category,
          date: datetimeStr,
          note: itemsNote,
          step: 2,          // jump straight to the Details screen
          billSource: 'ocr', // consumed by AddExpenseScreen to show badge
        },
      },
    })
  }

  const hasResult = !isScanning && scanResult !== null

  return (
    <>
      {/* ── STEP 1: Scanning overlay ── */}
      <AnimatePresence>
        {isScanning && (
          <ScanningOverlay progress={scanProgress} progressMsg={scanProgressMsg} />
        )}
      </AnimatePresence>

      {/* ── STEP 2: Result bottom sheet ── */}
      <AnimatePresence>
        {hasResult && (
          <>
            {/* Scrim — tap to dismiss */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 bg-black/40"
              onClick={onClose}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="absolute bottom-0 left-0 right-0 z-40 bg-white"
              style={{ borderRadius: '24px 24px 0 0', maxHeight: '92dvh' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Pull handle */}
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1 bg-[#E0E0E0] rounded-full" />
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto scrollbar-hide px-6 pt-3 pb-10" style={{ maxHeight: 'calc(92dvh - 20px)' }}>
                {/* ── Header ── */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-[18px] bg-neutral-100 border border-neutral-200 flex items-center justify-center flex-shrink-0">
                      <Receipt className="w-5 h-5 text-black" strokeWidth={2} />
                    </div>
                    <div>
                      <h2 className="text-[18px] font-[800] text-black tracking-tight leading-tight" style={S}>
                        Bill Scanned
                      </h2>
                      <div className="flex gap-2 flex-wrap">
                        <ConfidenceBadge confidence={scanResult.confidence} />
                        {scanResult.isAutoCorrected && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-[800] mt-0.5 bg-neutral-100 text-black border-neutral-200" style={S}>
                            <CheckCircle2 className="w-3 h-3 text-black" />
                            Auto-corrected
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-full bg-[#F6F6F6] flex items-center justify-center flex-shrink-0 mt-0.5"
                  >
                    <X className="w-4 h-4 text-[#AFAFAF]" />
                  </button>
                </div>

                {/* ── Editable fields ── */}
                <div className="space-y-4 mb-5">
                  <Field
                    icon={Store}
                    label="Shop Name"
                    value={shopName}
                    onChange={setShopName}
                    placeholder="Enter shop / restaurant name"
                  />
                  <Field
                    icon={DollarSign}
                    label="Total Amount"
                    value={amount}
                    onChange={setAmount}
                    placeholder="Enter total amount"
                    type="number"
                    prefix="₹"
                  />
                  <Field
                    icon={Calendar}
                    label="Date"
                    value={dispDate}
                    onChange={v => { setDispDate(v); setDateIso(v) }}
                    placeholder="e.g. 17 Apr 2025"
                  />
                  <Field
                    icon={Clock}
                    label="Time"
                    value={dispTime}
                    onChange={v => { setDispTime(v); setTimeStr(v) }}
                    placeholder="e.g. 7:30 PM"
                  />
                </div>

                {/* Orange fields reminder */}
                <AnimatePresence>
                  {(!shopName || !amount) && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-[11px] font-[600] text-orange-500 mb-4 flex items-center gap-2"
                      style={S}
                    >
                      <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0 animate-pulse" />
                      Orange fields need your attention before saving
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* ── Action buttons ── */}
                <div className="space-y-3">
                  {/* Primary — Add Expense */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddExpense}
                    className="w-full py-5 rounded-[20px] text-white font-[800] text-[16px] flex items-center justify-center gap-3"
                    style={{
                      background: 'linear-gradient(135deg, #222222 0%, #000000 100%)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.32)',
                      ...S,
                    }}
                  >
                    <Camera className="w-5 h-5 opacity-80" />
                    Add Expense
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>

                  {/* Secondary — Retake */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onRetake}
                    className="w-full py-4 rounded-[20px] border border-[#EEEEEE] bg-white text-[#94A3B8] font-[700] text-[14px] flex items-center justify-center gap-2"
                    style={S}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Retake Photo
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
