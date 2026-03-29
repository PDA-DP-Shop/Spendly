// Scans screen — grid of scanned bills and receipts
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScanLine, X, Trash2 } from 'lucide-react'
import TopHeader from '../components/shared/TopHeader'
import EmptyState from '../components/shared/EmptyState'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import { scanService } from '../services/database'
import { formatDate } from '../utils/formatDate'
import { formatMoney } from '../utils/formatMoney'
import { useSettingsStore } from '../store/settingsStore'
import { useNavigate } from 'react-router-dom'

export default function ScansScreen() {
  const navigate = useNavigate()
  const { settings } = useSettingsStore()
  const [scans, setScans] = useState([])
  const [selected, setSelected] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    scanService.getAll().then(setScans)
  }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    await scanService.remove(deleteId)
    setScans(s => s.filter(sc => sc.id !== deleteId))
    setDeleteId(null)
    if (selected?.id === deleteId) setSelected(null)
  }

  const currency = settings?.currency || 'USD'

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F5F5] dark:bg-[#0F0F1A] mb-tab">
      <TopHeader title="My Scans" />

      {/* Full-screen scan view */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col">
            <div className="flex items-center justify-between p-4 pt-safe">
              <button onClick={() => setSelected(null)} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <X className="w-5 h-5 text-white" />
              </button>
              <button onClick={() => setDeleteId(selected.id)} className="w-10 h-10 rounded-full bg-red-500/80 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-white" />
              </button>
            </div>
            {selected.photoUri ? (
              <img src={selected.photoUri} alt="Bill" className="flex-1 object-contain w-full" loading="lazy" />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-white/60">
                  <ScanLine className="w-16 h-16 mx-auto mb-4" />
                  <p>No photo available</p>
                </div>
              </div>
            )}
            <div className="p-5 bg-white dark:bg-[#1A1A2E]">
              <p className="text-[18px] font-sora font-bold text-gray-900 dark:text-white mb-1">{selected.shopName || 'Unknown Shop'}</p>
              {selected.amount > 0 && (
                <p className="text-[22px] font-sora font-bold text-purple-600">{formatMoney(selected.amount, currency)}</p>
              )}
              <p className="text-[12px] text-gray-400 mt-1">{formatDate(selected.addedAt)}</p>
              {selected.extractedText && (
                <p className="text-[12px] text-gray-500 mt-2 line-clamp-3">{selected.extractedText}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {scans.length === 0 ? (
        <EmptyState type="expenses" title="No scanned bills yet"
          message="Tap + to scan your first bill"
          action={() => navigate('/add?mode=scan-bill')} actionLabel="Scan a Bill" />
      ) : (
        <div className="px-4">
          <div className="grid grid-cols-2 gap-3">
            {scans.map((scan, i) => (
              <motion.button key={scan.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }} whileTap={{ scale: 0.97 }}
                onClick={() => setSelected(scan)}
                className="bg-white dark:bg-[#1A1A2E] rounded-[20px] overflow-hidden shadow-sm text-left">
                {scan.photoUri ? (
                  <img src={scan.photoUri} alt="Bill" className="w-full h-28 object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-28 bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                    <ScanLine className="w-8 h-8 text-purple-300" />
                  </div>
                )}
                <div className="p-3">
                  <p className="text-[13px] font-semibold text-gray-800 dark:text-white truncate">{scan.shopName || 'Unknown'}</p>
                  {scan.amount > 0 && (
                    <p className="text-[14px] font-sora font-bold text-purple-600 mt-0.5">{formatMoney(scan.amount, currency)}</p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(scan.addedAt)}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog show={!!deleteId} title="Delete Scan?" message="This will permanently delete this scanned bill."
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
