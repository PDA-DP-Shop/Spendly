/**
 * Deleted Items Screen — Spendly Recycle Bin
 */
<<<<<<< HEAD
import { useState, useEffect } from 'react'
=======
import { useState, useEffect, useRef } from 'react'
>>>>>>> 41f113d (upgrade scanner)
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Trash2, RotateCcw, AlertCircle, Info, Clock } from 'lucide-react'
import { softDeleteService } from '../services/softDeleteService'
import { useExpenseStore } from '../store/expenseStore'
import EmptyState from '../components/shared/EmptyState'
import { formatMoney } from '../utils/formatMoney'
import { useSettingsStore } from '../store/settingsStore'
<<<<<<< HEAD
=======
import PageGuide from '../components/shared/PageGuide'
import { usePageGuide } from '../hooks/usePageGuide'
>>>>>>> 41f113d (upgrade scanner)

const S = { fontFamily: "'Inter', sans-serif" }

export default function DeletedItemsScreen() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { restoreExpense } = useExpenseStore()
  const { settings } = useSettingsStore()
  const currency = settings?.currency || 'USD'

<<<<<<< HEAD
=======
  const infoRef = useRef(null)
  const firstItemRef = useRef(null)

  const { showGuide, currentStep, startGuide, nextStep, prevStep, skipGuide } = usePageGuide('deleted_items_page')

  const guideSteps = [
    { targetRef: infoRef, emoji: '♻️', title: 'Safety Window', description: 'Deleted something by accident? Everything lands here first for 72 hours before being permanently erased.', borderRadius: 24 },
    { targetRef: firstItemRef, emoji: '⏪', title: 'One-Tap Recovery', description: 'Tap Restore to put this expense back into your history as if it never left.', borderRadius: 28 }
  ]

>>>>>>> 41f113d (upgrade scanner)
  const loadItems = async () => {
    setLoading(true)
    const data = await softDeleteService.getDeletedItems()
    setItems(data)
    setLoading(false)
  }

  useEffect(() => { loadItems() }, [])

  const handleRestore = async (originalId) => {
    await restoreExpense(originalId)
    setItems(items.filter(i => i.originalId !== originalId))
  }

  const formatRemaining = (ms) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24))
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    if (days > 0) return `${days}d ${hours}h remaining`
    return `${hours}h remaining`
  }

  return (
    <div className="min-h-dvh bg-white safe-top">
<<<<<<< HEAD
      <div className="flex items-center px-6 pt-10 pb-6 bg-white sticky top-0 z-20 border-b border-[#F6F6F6]">
        <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-full bg-white border border-[#EEEEEE] flex items-center justify-center mr-4">
          <ChevronLeft className="w-6 h-6 text-black" strokeWidth={2.5} />
        </button>
        <div>
          <h1 className="text-[22px] font-[800] text-black tracking-tight" style={S}>Deleted Cache</h1>
          <p className="text-[11px] font-[700] text-[#AFAFAF] uppercase tracking-widest mt-0.5" style={S}>3-Day Local Cache</p>
        </div>
      </div>

      <div className="px-7 py-6">
        <div className="bg-[#F8F9FA] rounded-[24px] p-5 mb-8 flex gap-4 border border-[#EEEEEE]">
=======
      <div className="flex items-center justify-between px-6 pt-10 pb-6 bg-white sticky top-0 z-20 border-b border-[#F6F6F6]">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-full bg-white border border-[#EEEEEE] flex items-center justify-center mr-4">
            <ChevronLeft className="w-6 h-6 text-black" strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-[22px] font-[800] text-black tracking-tight" style={S}>Deleted Cache</h1>
            <p className="text-[11px] font-[700] text-[#AFAFAF] uppercase tracking-widest mt-0.5" style={S}>3-Day Local Cache</p>
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

      <div className="px-7 py-6">
        <div ref={infoRef} className="bg-[#F8F9FA] rounded-[24px] p-5 mb-8 flex gap-4 border border-[#EEEEEE]">
>>>>>>> 41f113d (upgrade scanner)
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center flex-shrink-0">
             <Info className="w-5 h-5 text-white" />
          </div>
          <p className="text-[13px] font-[500] text-[#545454] leading-relaxed" style={S}>
            Items stay in this local cache for 3 days. After that, they are permanently removed to keep your data footprint small and secure.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-20">
            <div className="w-12 h-12 rounded-full border-4 border-black border-t-transparent animate-spin mb-4" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-20">
            <EmptyState 
              type="expenses" 
              title="Local cache is empty" 
              message="Expenses you delete will appear here in the 3-day cache before permanent removal." 
            />
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((item, idx) => (
                <motion.div
                  key={item.id}
<<<<<<< HEAD
=======
                  ref={idx === 0 ? firstItemRef : null}
>>>>>>> 41f113d (upgrade scanner)
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white border border-[#EEEEEE] rounded-[28px] p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#F6F6F6] rounded-2xl">
                        <Trash2 className="w-5 h-5 text-[#AFAFAF]" />
                      </div>
                      <div>
                        <p className="text-[15px] font-[800] text-black/40 line-through" style={S}>
                           {item.shopName || 'Expense Item'}
                        </p>
                        <p className="text-[14px] font-[800] text-black" style={S}>
                           {formatMoney(item.amount, currency)}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRestore(item.originalId)}
                      className="bg-black text-white px-5 py-2.5 rounded-2xl text-[12px] font-[802] flex items-center gap-2 shadow-lg"
                      style={S}
                    >
                      <RotateCcw className="w-3.5 h-3.5" strokeWidth={3} />
                      Restore
                    </motion.button>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-[#F6F6F6]">
                    <div className="flex items-center gap-1.5 text-orange-500">
                      <Clock className="w-3.5 h-3.5" strokeWidth={2.5} />
                      <span className="text-[11px] font-[802] uppercase tracking-wider" style={S}>
                        {formatRemaining(item.remainingMs)}
                      </span>
                    </div>
                    <span className="text-[11px] font-[700] text-[#D8D8D8] uppercase tracking-widest" style={S}>
                       Deleted {new Date(item.deletedAt).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
<<<<<<< HEAD
=======

      <PageGuide 
        show={showGuide} 
        steps={guideSteps} 
        currentStep={currentStep} 
        onNext={nextStep} 
        onPrev={prevStep} 
        onSkip={skipGuide} 
      />
>>>>>>> 41f113d (upgrade scanner)
    </div>
  )
}
