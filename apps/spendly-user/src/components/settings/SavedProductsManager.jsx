/**
 * SavedProductsManager.jsx
 * Full CRUD manager for the user's learnedBarcodes IndexedDB table.
 * Launched as a bottom-sheet from SettingsScreen.
 *
 * Features:
 *  – Live count badge in the trigger row
 *  – Search/filter by name
 *  – Inline edit (name + price) with auto-save on blur
 *  – Swipe-left to reveal delete (via drag gesture)
 *  – Delete single / Delete all with confirmation
 *  – Empty state
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import { Search, Trash2, Package, X, ChevronRight, AlertTriangle, Check, ScanBarcode } from 'lucide-react'
import {
  getAllLearnedBarcodes,
  deleteLearnedBarcode,
  updateLearnedBarcode,
  clearAllLearnedBarcodes,
} from '../../services/barcodeService'
import { format } from 'date-fns'

const S = { fontFamily: "'Inter', sans-serif" }
const SWIPE_THRESHOLD = -72 // px to reveal delete button

// ─── Swipeable Product Card ────────────────────────────────────────────────────
function ProductCard({ item, onDelete, onUpdate, currency }) {
  const x = useMotionValue(0)
  const deleteOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0])
  const cardShadow = useTransform(x, [-SWIPE_THRESHOLD, 0], ['0 4px 24px rgba(239,68,68,0.18)', '0 1px 4px rgba(0,0,0,0.04)'])

  // Inline edit state
  const [editingName, setEditingName] = useState(false)
  const [editingPrice, setEditingPrice] = useState(false)
  const [draftName, setDraftName] = useState(item.name)
  const [draftPrice, setDraftPrice] = useState(item.price != null ? String(item.price) : '')
  const nameRef = useRef(null)
  const priceRef = useRef(null)

  useEffect(() => { if (editingName) nameRef.current?.focus() }, [editingName])
  useEffect(() => { if (editingPrice) priceRef.current?.focus() }, [editingPrice])

  const commitName = async () => {
    setEditingName(false)
    const trimmed = draftName.trim()
    if (trimmed && trimmed !== item.name) {
      await onUpdate(item.barcode, trimmed, item.price)
    } else {
      setDraftName(item.name) // reset on empty
    }
  }

  const commitPrice = async () => {
    setEditingPrice(false)
    const val = draftPrice.trim() === '' ? null : parseFloat(draftPrice)
    if (val !== item.price) {
      await onUpdate(item.barcode, item.name, isNaN(val) ? null : val)
    }
  }

  // Snap card back or keep open on drag end
  const handleDragEnd = (_, info) => {
    if (info.offset.x < SWIPE_THRESHOLD / 2) {
      animate(x, SWIPE_THRESHOLD, { type: 'spring', stiffness: 400, damping: 32 })
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 32 })
    }
  }

  return (
    <div className="relative overflow-hidden rounded-[20px] mb-3">
      {/* Delete button (revealed on swipe) */}
      <motion.div
        style={{ opacity: deleteOpacity }}
        className="absolute right-0 top-0 bottom-0 w-[72px] flex items-center justify-center bg-red-500 rounded-r-[20px]"
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onDelete(item.barcode)}
          className="w-full h-full flex items-center justify-center"
        >
          <Trash2 className="w-5 h-5 text-white" strokeWidth={2.5} />
        </motion.button>
      </motion.div>

      {/* Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: SWIPE_THRESHOLD, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x, boxShadow: cardShadow }}
        className="relative bg-white border border-[#EEEEEE] rounded-[20px] px-5 py-4 cursor-grab active:cursor-grabbing z-10"
      >
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center flex-shrink-0 border border-violet-100">
            <Package className="w-4.5 h-4.5 text-violet-600" strokeWidth={2.5} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Product name — tap to edit */}
            {editingName ? (
              <input
                ref={nameRef}
                value={draftName}
                onChange={e => setDraftName(e.target.value)}
                onBlur={commitName}
                onKeyDown={e => e.key === 'Enter' && commitName()}
                className="w-full text-[15px] font-[700] text-black outline-none bg-violet-50 rounded-lg px-2 py-0.5 border border-violet-200"
                style={S}
              />
            ) : (
              <button
                onClick={() => setEditingName(true)}
                className="text-left w-full"
              >
                <p className="text-[15px] font-[700] text-black truncate" style={S}>
                  {item.name}
                </p>
              </button>
            )}

            {/* Barcode + date row */}
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[10px] font-[600] text-[#AFAFAF] font-mono tracking-wider">
                {item.barcode}
              </span>
              <span className="text-[#EEEEEE]">•</span>
              <span className="text-[10px] font-[500] text-[#AFAFAF]">
                {item.addedAt ? format(new Date(item.addedAt), 'dd MMM yyyy') : '—'}
              </span>
            </div>
          </div>

          {/* Price — tap to edit */}
          <div className="flex-shrink-0 ml-2">
            {editingPrice ? (
              <input
                ref={priceRef}
                value={draftPrice}
                onChange={e => setDraftPrice(e.target.value)}
                onBlur={commitPrice}
                onKeyDown={e => e.key === 'Enter' && commitPrice()}
                type="number"
                placeholder="0"
                className="w-20 text-right text-[14px] font-[800] text-green-600 outline-none bg-green-50 rounded-lg px-2 py-0.5 border border-green-200"
                style={S}
              />
            ) : (
              <button onClick={() => setEditingPrice(true)} className="text-right">
                {item.price != null ? (
                  <span className="text-[14px] font-[800] text-green-600" style={S}>
                    ₹{parseFloat(item.price).toLocaleString()}
                  </span>
                ) : (
                  <span className="text-[11px] font-[600] text-[#D0D0D0]" style={S}>
                    Add price
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Subtle swipe hint chevron */}
          <ChevronRight className="w-4 h-4 text-[#E0E0E0] flex-shrink-0 -mr-1" strokeWidth={2.5} />
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
/**
 * SavedProductsManager
 *
 * @param {{ onClose: () => void }} props
 */
export default function SavedProductsManager({ onClose }) {
  const [products, setProducts] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [deletingAll, setDeletingAll] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type })
    setTimeout(() => setToast(null), 2800)
  }

  // Load on mount
  const reload = useCallback(async () => {
    setLoading(true)
    const data = await getAllLearnedBarcodes()
    setProducts(data)
    setLoading(false)
  }, [])

  useEffect(() => { reload() }, [reload])

  // Filter by search
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.barcode.includes(query)
  )

  // Delete single
  const handleDelete = async (barcode) => {
    try {
      await deleteLearnedBarcode(barcode)
      setProducts(prev => prev.filter(p => p.barcode !== barcode))
      showToast('Product removed')
    } catch {
      showToast('Failed to delete', 'error')
    }
  }

  // Inline update
  const handleUpdate = async (barcode, name, price) => {
    try {
      await updateLearnedBarcode(barcode, name, price)
      setProducts(prev => prev.map(p =>
        p.barcode === barcode ? { ...p, name, price } : p
      ))
    } catch {
      showToast('Failed to save', 'error')
    }
  }

  // Delete all
  const handleClearAll = async () => {
    setDeletingAll(true)
    try {
      await clearAllLearnedBarcodes()
      setProducts([])
      setShowClearConfirm(false)
      showToast('All products cleared')
    } catch {
      showToast('Failed to clear', 'error')
    } finally {
      setDeletingAll(false)
    }
  }

  return (
    <div className="flex flex-col h-full" style={S}>
      {/* Count badge + clear-all button */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-[800] text-white bg-violet-600 px-3 py-1 rounded-full">
            {products.length} saved
          </span>
          {products.length > 0 && (
            <span className="text-[11px] font-[600] text-[#AFAFAF]">
              Swipe card ← to delete
            </span>
          )}
        </div>
        {products.length > 0 && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 text-[11px] font-[800] text-red-500 uppercase tracking-widest px-3 py-2 rounded-xl bg-red-50"
          >
            <Trash2 className="w-3 h-3" />
            Clear All
          </motion.button>
        )}
      </div>

      {/* Search bar */}
      {products.length > 0 && (
        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AFAFAF]" strokeWidth={2.5} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name or barcode..."
            className="w-full py-3.5 pl-11 pr-4 rounded-2xl bg-[#F6F6F6] border border-[#EEEEEE] outline-none text-[14px] font-[600] text-black placeholder:text-[#C0C0C0]"
            style={S}
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-[#C0C0C0]" />
            </button>
          )}
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto pb-6 scrollbar-hide">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-8 h-8 border-2 border-violet-200 border-t-violet-600 rounded-full"
            />
            <p className="text-[13px] font-[600] text-[#AFAFAF]">Loading your products...</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 gap-4 text-center px-6"
          >
            <div className="w-20 h-20 rounded-[30px] bg-violet-50 border border-violet-100 flex items-center justify-center">
              <ScanBarcode className="w-9 h-9 text-violet-400" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[16px] font-[800] text-black mb-1.5" style={S}>
                {query ? 'No results found' : 'No saved products yet'}
              </p>
              <p className="text-[13px] font-[500] text-[#AFAFAF] leading-relaxed">
                {query
                  ? `Nothing matches "${query}"`
                  : 'Scan a barcode and enter details.\nWe\'ll remember it for next time.'}
              </p>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((item, i) => (
              <motion.div
                key={item.barcode}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
                transition={{ delay: i * 0.03, duration: 0.22 }}
              >
                <ProductCard
                  item={item}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Clear-all confirmation overlay */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center gap-6 px-8 rounded-[40px]"
          >
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-500" strokeWidth={2} />
            </div>
            <div className="text-center">
              <p className="text-[20px] font-[800] text-black mb-2" style={S}>Clear All Products?</p>
              <p className="text-[13px] font-[500] text-[#AFAFAF] leading-relaxed">
                This will permanently delete all {products.length} saved barcodes.
                Future scans won't auto-fill these products.
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-4 rounded-2xl bg-[#F6F6F6] border border-[#EEEEEE] text-black font-[800] text-[14px]" style={S}>
                Cancel
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleClearAll} disabled={deletingAll}
                className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-[800] text-[14px] shadow-lg shadow-red-200 disabled:opacity-60" style={S}>
                {deletingAll ? 'Clearing…' : 'Clear All'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-[13px] font-[700] ${
              toast.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-[#1A1A1A] text-white'
            }`}
            style={S}
          >
            {toast.type !== 'error' && <Check className="w-4 h-4 text-green-400" strokeWidth={3} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
