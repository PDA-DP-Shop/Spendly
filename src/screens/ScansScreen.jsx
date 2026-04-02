// Scans screen — grid of scanned bills and receipts
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScanLine, X, Trash2, ArrowLeft, MoreVertical } from 'lucide-react'
import TopHeader from '../components/shared/TopHeader'
import EmptyState from '../components/shared/EmptyState'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import { scanService } from '../services/database'
import { formatDate } from '../utils/formatDate'
import { formatMoney } from '../utils/formatMoney'
import { useSettingsStore } from '../store/settingsStore'
import { useNavigate } from 'react-router-dom'

const S = { fontFamily: "'Nunito', sans-serif" }

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
    <div className="flex flex-col min-h-dvh bg-[#F8F7FF] pb-24">
      <TopHeader title="Neural Scans" />

      {/* Full-screen scan view */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-white flex flex-col">
            
            <div className="flex items-center justify-between px-6 pt-safe h-20 border-b border-[#F0F0F8]">
              <button onClick={() => setSelected(null)} className="w-11 h-11 rounded-full bg-[#F8F9FF] flex items-center justify-center border border-[#F0F0F8]">
                <ArrowLeft className="w-5 h-5 text-[#0F172A]" />
              </button>
              <h3 className="text-[17px] font-[800] text-[#0F172A] tracking-tight" style={S}>Scan Intelligence</h3>
              <button onClick={() => setDeleteId(selected.id)} className="w-11 h-11 rounded-full bg-[#FFF5F5] flex items-center justify-center border border-[#FFE0E0]">
                <Trash2 className="w-5 h-5 text-[#F43F5E]" />
              </button>
            </div>
            
            <div className="flex-1 flex items-center justify-center p-6 bg-[#F8F7FF]">
               {selected.photoUri ? (
                 <div className="relative w-full h-full flex items-center justify-center">
                   <img src={selected.photoUri} alt="Bill" className="max-w-full max-h-full object-contain rounded-[32px] shadow-2xl shadow-indigo-500/10 border border-white" loading="lazy" />
                 </div>
              ) : (
                <div className="text-center opacity-40">
                  <ScanLine className="w-16 h-16 mx-auto mb-4 text-[#CBD5E1]" />
                  <p className="text-[14px] font-[800] text-[#94A3B8] uppercase tracking-widest" style={S}>Corrupt Telemetry</p>
                </div>
              )}
            </div>

            <div className="p-8 bg-white border-t border-[#F0F0F8] rounded-t-[40px] shadow-[0_-20px_40px_rgba(15,23,42,0.05)]">
              <div className="flex items-start justify-between mb-2">
                <p className="text-[24px] font-[800] text-[#0F172A] tracking-tight" style={S}>{selected.shopName || 'Unknown Merchant'}</p>
                {selected.amount > 0 && (
                  <p className="text-[24px] font-[800] text-[var(--primary)] tracking-tight" style={S}>{formatMoney(selected.amount, currency)}</p>
                )}
              </div>
              <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-6" style={S}>{formatDate(selected.addedAt)}</p>
              
              {selected.extractedText && (
                <div className="bg-[#F8F7FF] p-5 rounded-[22px] border border-[#F0F0F8] max-h-40 overflow-y-auto scrollbar-hide">
                  <p className="text-[14px] font-[600] text-[#64748B] leading-relaxed italic">"{selected.extractedText}"</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {scans.length === 0 ? (
        <EmptyState type="expenses" title="Repository Empty"
          message="Initiate a telemetry scan to populate this encrypted sector."
          action={() => navigate('/add?mode=scan-bill')} actionLabel="New Scan" />
      ) : (
        <div className="px-6 grid grid-cols-2 gap-5 py-4">
            {scans.map((scan, i) => (
              <motion.button key={scan.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setSelected(scan)}
                className="bg-white border border-[#F0F0F8] rounded-[32px] overflow-hidden shadow-sm text-left group">
                
                {scan.photoUri ? (
                  <div className="h-40 overflow-hidden border-b border-[#F0F0F8] relative">
                    <img src={scan.photoUri} alt="Bill" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-[#F8F7FF] flex items-center justify-center">
                    <ScanLine className="w-10 h-10 text-[#CBD5E1] opacity-40 animate-pulse" />
                  </div>
                )}
                
                <div className="p-4.5">
                  <p className="text-[15px] font-[800] text-[#0F172A] truncate mb-1 tracking-tight" style={S}>{scan.shopName || 'Unknown'}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-[16px] font-[800] text-[var(--primary)] tracking-tight" style={S}>{scan.amount > 0 ? formatMoney(scan.amount, currency) : '—'}</p>
                    <p className="text-[9px] font-[800] text-[#94A3B8] uppercase tracking-widest" style={S}>{format(new Date(scan.addedAt), 'MMM d')}</p>
                  </div>
                </div>
              </motion.button>
            ))}
        </div>
      )}

      <ConfirmDialog show={!!deleteId} title="Purge Record?" message="Confirm permanent deletion of this telemetry data scan."
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
