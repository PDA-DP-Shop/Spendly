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
    <div className="flex flex-col min-h-dvh bg-[#050B18] mb-tab">
      <TopHeader title="Neural Scans" />

      {/* Full-screen scan view */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#050B18]/95 backdrop-blur-xl flex flex-col">
            <div className="flex items-center justify-between p-6 pt-safe z-10">
              <button onClick={() => setSelected(null)} className="w-12 h-12 rounded-2xl glass border-white/5 flex items-center justify-center shadow-glowSmall">
                <X className="w-6 h-6 text-[#7B8DB0]" />
              </button>
              <button onClick={() => setDeleteId(selected.id)} className="w-12 h-12 rounded-2xl glass bg-expense/10 border-expense/20 flex items-center justify-center shadow-glowSmall">
                <Trash2 className="w-5 h-5 text-expense" />
              </button>
            </div>
            
            <div className="flex-1 flex items-center justify-center p-6 mt-[-40px]">
               {selected.photoUri ? (
                <div className="relative group">
                   <div className="absolute inset-0 bg-cyan-glow/10 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                   <img src={selected.photoUri} alt="Bill" className="max-w-full max-h-[65dvh] object-contain rounded-3xl shadow-glowLg border border-white/10 relative z-10" loading="lazy" />
                </div>
              ) : (
                <div className="text-center">
                  <ScanLine className="w-16 h-16 mx-auto mb-4 text-cyan-glow opacity-30" />
                  <p className="text-[14px] font-display font-bold text-[#3D4F70] uppercase tracking-widest">Image Data Corrupt</p>
                </div>
              )}
            </div>

            <div className="p-8 glass-elevated border-white/5 rounded-t-[40px] shadow-glowLg">
              <div className="flex items-start justify-between mb-2">
                <p className="text-[24px] font-display font-bold text-[#F0F4FF] tracking-tight">{selected.shopName || 'Anonymous Merchant'}</p>
                {selected.amount > 0 && (
                  <p className="text-[28px] font-display font-bold text-cyan-glow drop-shadow-glow">{formatMoney(selected.amount, currency)}</p>
                )}
              </div>
              <p className="text-[12px] font-display font-bold text-[#3D4F70] uppercase tracking-[0.2em] mb-4">{formatDate(selected.addedAt)}</p>
              {selected.extractedText && (
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 max-h-32 overflow-y-auto scrollbar-hide">
                  <p className="text-[13px] font-body text-[#7B8DB0] leading-relaxed italic">"{selected.extractedText}"</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {scans.length === 0 ? (
        <EmptyState type="expenses" title="No telemetry data"
          message="Initiate a scan to populate this sector"
          action={() => navigate('/add?mode=scan-bill')} actionLabel="Initiate Scan" />
      ) : (
        <div className="px-6 pb-20">
          <div className="grid grid-cols-2 gap-4">
            {scans.map((scan, i) => (
              <motion.button key={scan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} whileTap={{ scale: 0.97 }}
                onClick={() => setSelected(scan)}
                className="glass-elevated border-white/5 rounded-[28px] overflow-hidden shadow-glowSmall text-left group relative">
                <div className="absolute inset-0 bg-cyan-glow/5 opacity-0 group-hover:opacity-100 transition-all pointer-events-none" />
                {scan.photoUri ? (
                  <div className="h-32 overflow-hidden border-b border-white/5 relative">
                    <img src={scan.photoUri} alt="Bill" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  </div>
                ) : (
                  <div className="w-full h-32 bg-cyan-dim flex items-center justify-center">
                    <ScanLine className="w-8 h-8 text-cyan-glow opacity-40 animate-pulse" />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-[15px] font-display font-bold text-[#F0F4FF] truncate mb-1">{scan.shopName || 'Anonymous'}</p>
                  {scan.amount > 0 && (
                    <p className="text-[17px] font-display font-bold text-cyan-glow">{formatMoney(scan.amount, currency)}</p>
                  )}
                  <p className="text-[10px] font-display font-bold text-[#3D4F70] uppercase tracking-widest mt-1.5 opacity-60">{formatDate(scan.addedAt)}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog show={!!deleteId} title="Purge Record?" message="This will permanently delete this telemetry scan. Are you sure?"
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
