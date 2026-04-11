// Scans screen — grid of scanned bills and receipts
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScanLine, X, Trash2, ArrowLeft, MoreVertical, FileText, Calendar, Landmark, Receipt } from 'lucide-react'
import TopHeader from '../components/shared/TopHeader'
import EmptyState from '../components/shared/EmptyState'
import { useTranslation } from 'react-i18next'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import { scanService } from '../services/database'
import { formatDate } from '../utils/formatDate'
import { formatMoney } from '../utils/formatMoney'
import { useSettingsStore } from '../store/settingsStore'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'

const HAPTIC_SHAKE = {
  tap: { 
    x: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.35, ease: "easeInOut" }
  }
}

export default function ScansScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { settings } = useSettingsStore()
  const [scans, setScans] = useState([])
  const [selected, setSelected] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const S = { fontFamily: "'Inter', sans-serif" }

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
    <div className="flex flex-col min-h-dvh bg-white pb-24 safe-top">
      <TopHeader title={t('scans.title')} />

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-white flex flex-col">
            
            <div className="flex items-center justify-between px-7 pt-10 pb-5 border-b border-[#F6F6F6]">
              <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => setSelected(null)} 
                className="w-11 h-11 rounded-full bg-[#F6F6F6] flex items-center justify-center border border-[#EEEEEE]">
                <ArrowLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
              </motion.button>
              <h3 className="text-[17px] font-[800] text-black tracking-tight" style={S}>{t('scans.scanReceipt')}</h3>
              <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => setDeleteId(selected.id)} 
                className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                <Trash2 className="w-5 h-5 text-red-500" strokeWidth={2.5} />
              </motion.button>
            </div>
            
            <div className="flex-1 flex items-center justify-center p-6 bg-[#F6F6F6]">
               {selected.photoUri ? (
                 <div className="relative w-full h-full flex items-center justify-center">
                   <img src={selected.photoUri} alt="Receipt" className="max-w-full max-h-full object-contain rounded-[32px] shadow-xl border border-white" loading="lazy" />
                 </div>
              ) : (
                <div className="text-center opacity-30">
                  <ScanLine className="w-16 h-16 mx-auto mb-4 text-black" />
                  <p className="text-[13px] font-[700] text-black" style={S}>Receipt image missing</p>
                </div>
              )}
            </div>

            <div className="p-10 bg-white border-t border-[#F6F6F6] rounded-t-[40px] shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
              <div className="flex items-start justify-between mb-2">
                <p className="text-[22px] font-[800] text-black tracking-tight" style={S}>{selected.shopName || 'Unknown Merchant'}</p>
                {selected.amount > 0 && (
                  <p className="text-[24px] font-[800] text-blue-600 tracking-tight" style={S}>{formatMoney(selected.amount, currency)}</p>
                )}
              </div>
              <p className="text-[13px] font-[600] text-[#AFAFAF] mb-8" style={S}>{formatDate(selected.addedAt)}</p>
              
              {selected.extractedText && (
                <div className="bg-[#F6F6F6] p-6 rounded-[24px] border border-[#EEEEEE] max-h-40 overflow-y-auto scrollbar-hide">
                  <p className="text-[14px] font-[500] text-black/60 leading-relaxed italic" style={S}>{selected.extractedText}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {scans.length === 0 ? (
        <EmptyState type="expenses" title={t('scans.noScans')}
          message={t('scans.scanReceipt')}
          onAction={() => navigate('/add?mode=scan-bill')} action={t('common.add')} />
      ) : (
        <div className="px-6 grid grid-cols-2 gap-5 py-8">
            {scans.map((scan, i) => (
              <motion.button key={scan.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }} variants={HAPTIC_SHAKE} whileTap="tap"
                onClick={() => setSelected(scan)}
                className="bg-white border border-[#EEEEEE] rounded-[32px] overflow-hidden shadow-sm text-left active:shadow-md transition-shadow group">
                
                {scan.photoUri ? (
                  <div className="h-44 overflow-hidden border-b border-[#F6F6F6] relative">
                    <img src={scan.photoUri} alt="Receipt Preview" className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-active:opacity-100 transition-opacity" />
                  </div>
                ) : (
                  <div className="w-full h-44 bg-[#F6F6F6] flex items-center justify-center">
                    <Receipt className="w-10 h-10 text-[#D8D8D8]" />
                  </div>
                )}
                
                <div className="p-5">
                  <p className="text-[14px] font-[800] text-black truncate mb-1" style={S}>{scan.shopName || 'Unknown'}</p>
                  <div className="flex flex-col">
                    <p className="text-[16px] font-[800] text-blue-600 tracking-tight" style={S}>{scan.amount > 0 ? formatMoney(scan.amount, currency) : 'N/A'}</p>
                    <p className="text-[11px] font-[500] text-[#AFAFAF] mt-0.5" style={S}>{format(new Date(scan.addedAt), 'dd MMM, yyyy')}</p>
                  </div>
                </div>
              </motion.button>
            ))}
        </div>
      )}

      <ConfirmDialog show={!!deleteId} title="Delete Record?" message="Are you sure you want to delete this receipt? This cannot be undone."
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
