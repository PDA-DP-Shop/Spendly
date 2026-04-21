import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
<<<<<<< HEAD
import { ArrowLeft, Pencil, Plus, Minus, Save, Wallet } from 'lucide-react'
import { useWalletStore } from '../store/walletStore'
import { useSettingsStore } from '../store/settingsStore'
import CURRENCY_NOTES, { getNotesByUserCurrency } from '../constants/currencyNotes'
import TopHeader from '../components/shared/TopHeader'
import { formatMoney } from '../utils/formatMoney'
import NoteCard from '../components/cash/NoteCard'

const NOTE_VARIANTS = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export default function CashWalletScreen() {
  const navigate = useNavigate()
  const { cashWallet, loadCashWallet, updateCashWallet, isLoading } = useWalletStore()
  const { getCurrency } = useSettingsStore()
  
  const currencyCode = getCurrency()
  const currencyConfig = CURRENCY_NOTES[currencyCode] || CURRENCY_NOTES.INR
  const denominations = useMemo(() => getNotesByUserCurrency(currencyCode), [currencyCode])
  
  const [notes, setNotes] = useState({})
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadCashWallet()
  }, [loadCashWallet])

  useEffect(() => {
    const initial = {}
    const denomStrings = denominations.map(String)
    denominations.forEach(d => initial[d] = 0)
    
    if (cashWallet?.notes) {
      // ONLY take notes that exist in current denominations list (type-safe check)
      Object.keys(cashWallet.notes).forEach(k => {
        if (denomStrings.includes(String(k))) {
          initial[k] = cashWallet.notes[k]
        }
      })
    }
    setNotes(initial)
  }, [cashWallet, denominations])

  const totalCash = useMemo(() => {
    return Object.entries(notes).reduce((total, [val, count]) => {
      const numVal = parseFloat(val.toString().split('_')[0])
      return total + (numVal * (count || 0))
    }, 0)
  }, [notes])

  const totalNotesCount = useMemo(() => {
    return Object.values(notes).reduce((total, count) => total + (count || 0), 0)
  }, [notes])

  const updateCount = (denom, delta) => {
    const currentCount = notes[denom] || 0
    const newCount = Math.max(0, currentCount + delta)
    
    if (currentCount !== newCount) {
      setNotes(prev => ({ ...prev, [denom]: newCount }))
      setHasChanges(true)
      if (navigator.vibrate) navigator.vibrate(10)
=======
import { ChevronLeft, Edit2, Plus, Minus, CheckCircle, Save } from 'lucide-react'
import { useWalletStore } from '../store/walletStore'
import { useSettingsStore } from '../store/settingsStore'
import CURRENCY_NOTES, { getItemsByUserCurrency } from '../constants/currencyNotes'
import { formatMoney } from '../utils/formatMoney'
import NoteCard from '../components/cash/NoteCard'
import WalletHistory from '../components/wallet/WalletHistory'
import PageGuide from '../components/shared/PageGuide'
import { usePageGuide } from '../hooks/usePageGuide'
import { useRef } from 'react'

const SORA = { fontFamily: "'Sora', sans-serif" }
const DM_SANS = { fontFamily: "'DM Sans', sans-serif" }
const S = { fontFamily: "'Inter', sans-serif" }

export default function CashWalletScreen() {
  const navigate = useNavigate()
  const { 
    cashWallet, loadCashWallet, updateCashWallet, calculateTotalCash, 
    transactions, loadTransactions, isLoading 
  } = useWalletStore()
  const { settings } = useSettingsStore()
  
  const [activeTab, setActiveTab] = useState('inventory')
  
  const currencyCode = settings?.currency || 'INR'
  const currencyData = CURRENCY_NOTES[currencyCode] || CURRENCY_NOTES.INR
  
  // Local state for counts to make interaction instant
  const [counts, setCounts] = useState({})
  const [showToast, setShowToast] = useState(false)

  const totalCardRef = useRef(null)
  const tabToggleRef = useRef(null)
  const firstNoteRef = useRef(null)
  const saveBtnRef = useRef(null)

  const { showGuide, currentStep, startGuide, nextStep, prevStep, skipGuide } = usePageGuide('cash_wallet_page')

  const guideSteps = [
    { targetRef: totalCardRef, emoji: '💵', title: 'Cash in Pocket', description: 'This reflects the actual physical cash you have. It updates automatically when you log cash expenses.', borderRadius: 40 },
    { targetRef: tabToggleRef, emoji: '📊', title: 'Ledger vs Stock', description: 'Switch between Inventory (counting notes) and History (tracking cash flow).', borderRadius: 16 },
    { targetRef: firstNoteRef, emoji: '➕', title: 'Balance Audit', description: 'Found a loose note? Manually adjust counts here to match your physical wallet.', borderRadius: 24 },
    { targetRef: saveBtnRef, emoji: '💾', title: 'Confirm State', description: 'Always save your inventory after manual adjustments to keep your net worth calculations accurate.', borderRadius: 24 }
  ]

  const currencyItems = useMemo(() => getItemsByUserCurrency(currencyCode), [currencyCode])
  const notesList = useMemo(() => currencyItems.filter(i => i.type === 'note'), [currencyItems])
  const coinsList = useMemo(() => currencyItems.filter(i => i.type === 'coin'), [currencyItems])

  // Initialize local state from store
  useEffect(() => {
    loadCashWallet(currencyCode)
    loadTransactions()
  }, [currencyCode])

  useEffect(() => {
    if (cashWallet?.notes) {
      const normalized = {}
      // 1. Build a map of value -> preferred type for the current currency
      const typeMap = {}
      currencyItems.forEach(item => {
        if (!typeMap[item.value]) typeMap[item.value] = item.type
      })

      Object.entries(cashWallet.notes).forEach(([key, val]) => {
        if (!key.includes('_')) {
          // Legacy key (just "5") -> assign preferred type or fallback to note
          const preferredType = typeMap[key] || 'note'
          const newKey = `${key}_${preferredType}`
          normalized[newKey] = (normalized[newKey] || 0) + val
        } else {
          // New format key (like "5_note") but might need merging if user sees it as a coin
          const [valStr, type] = key.split('_')
          const value = parseFloat(valStr)
          
          // Check if this value exists in our current currency items as a DIFFERENT type
          const existsAsType = currencyItems.find(i => i.value === value && i.type === type)
          
          if (!existsAsType) {
            // If it's a "5_note" but our current list ONLY has "5_coin", merge it into "5_coin"
            const preferredType = typeMap[value] || type
            const targetKey = `${value}_${preferredType}`
            normalized[targetKey] = (normalized[targetKey] || 0) + val
          } else {
            normalized[key] = (normalized[key] || 0) + val
          }
        }
      })
      setCounts(normalized)
    } else {
      const initial = {}
      currencyItems.forEach(item => initial[`${item.value}_${item.type}`] = 0)
      setCounts(initial)
    }
  }, [cashWallet, currencyItems])

  const totalCash = useMemo(() => {
    return Object.entries(counts).reduce((sum, [key, count]) => {
      const value = parseFloat(key.split('_')[0])
      return sum + (value * count)
    }, 0)
  }, [counts])
  
  const totalNotes = useMemo(() => Object.values(counts).reduce((s, c) => s + c, 0), [counts])

  const handleAdjust = (value, type, delta) => {
    const key = `${value}_${type}`
    const current = counts[key] || 0
    const next = Math.max(0, current + delta)
    if (next !== current) {
      if (typeof navigator.vibrate === 'function') navigator.vibrate(10)
      setCounts(prev => ({ ...prev, [key]: next }))
>>>>>>> 41f113d (upgrade scanner)
    }
  }

  const handleSave = async () => {
<<<<<<< HEAD
    await updateCashWallet(notes)
    setHasChanges(false)
    window.dispatchEvent(new CustomEvent('toast', { 
      detail: { message: 'Cash wallet updated!', type: 'success' } 
    }))
  }

  const S = {
    sora: { fontFamily: "'Sora', sans-serif" },
    dmSans: { fontFamily: "'DM Sans', sans-serif" }
  }

  return (
    <div className="flex flex-col h-dvh bg-[#F8F9FB] overflow-hidden">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#F1F5F9]">
        <TopHeader 
          title="My Cash" 
          showBack 
          onBack={() => navigate(-1)}
          showBell={false}
          rightElement={
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600 border border-emerald-100">
               <Wallet className="w-5 h-5" strokeWidth={2.5} />
            </div>
          }
        />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-64 scroll-smooth">
        {/* Total Cash Card with Aura Blur */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full rounded-[40px] p-10 mb-8 relative overflow-hidden shadow-2xl shadow-slate-900/10 bg-slate-900"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full -ml-16 -mb-16 blur-3xl" />
          
          <div className="relative z-10">
            <p className="text-[11px] font-[802] text-white/40 uppercase tracking-[0.3em] mb-4" style={S.dmSans}>
              Current Liquidity
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-[28px] font-[900] text-emerald-400" style={S.sora}>{currencyConfig.symbol}</span>
              <h2 className="text-[52px] font-[900] text-white tracking-tighter leading-none" style={S.sora}>
                {totalCash.toLocaleString()}
              </h2>
            </div>
          </div>
        </motion.div>

        {/* Note Denominations Grid */}
        <div className="space-y-3">
          <p className="text-[11px] font-[902] text-slate-400 uppercase tracking-widest ml-1 mb-4">Update your wallet</p>
          {denominations.map((denom, idx) => {
            const count = notes[denom] || 0
            
            return (
              <motion.div
                key={denom}
                variants={NOTE_VARIANTS}
                initial="initial"
                animate="animate"
                transition={{ delay: idx * 0.03 }}
                className="bg-white rounded-[28px] p-3 pr-6 shadow-sm border border-[#F1F5F9] flex items-center gap-4 group"
              >
                <div className="w-24 flex justify-center text-center">
                   <NoteCard value={denom} currency={currencyCode} size="md" showCount={false} />
                </div>

                <div className="flex-1 flex items-center justify-between">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateCount(denom, -1)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${count > 0 ? 'bg-slate-50 text-slate-900 border border-slate-200 active:bg-slate-200' : 'bg-slate-50/50 text-slate-200 cursor-not-allowed'}`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-[18px] font-[902] text-black w-8 text-center" style={S.sora}>{count}</span>
                      <button
                        onClick={() => updateCount(denom, 1)}
                        className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center active:scale-90 transition-transform shadow-lg shadow-black/10"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-[17px] font-[902] ${count > 0 ? 'text-black' : 'text-slate-300'}`} style={S.sora}>
                      {currencyConfig.symbol}{(parseFloat(denom.toString().split('_')[0]) * count).toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Modern Floating Summary Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[450px] p-6 pb-[calc(1.5rem+var(--safe-bottom))] bg-white/80 backdrop-blur-3xl border-t border-[#F1F5F9] z-[100]">
        <div className="flex items-center justify-between mb-6 px-2">
           <div>
              <p className="text-[10px] font-[902] text-slate-400 uppercase tracking-widest mb-1">Total Notes</p>
              <p className="text-[18px] font-[902] text-black" style={S.sora}>{totalNotesCount}</p>
           </div>
           <div className="text-right">
              <p className="text-[10px] font-[902] text-slate-400 uppercase tracking-widest mb-1">Total Value</p>
              <p className="text-[24px] font-[902] text-[#7C3AED]" style={S.sora}>
                {currencyConfig.symbol}{totalCash.toLocaleString()}
              </p>
           </div>
        </div>

        <motion.button
          disabled={!hasChanges || isLoading}
          whileTap={{ scale: 0.96 }}
          onClick={handleSave}
          className={`w-full h-16 rounded-[24px] flex items-center justify-center gap-3 font-[902] text-[16px] transition-all
            ${hasChanges 
              ? 'bg-black text-white shadow-2xl shadow-black/20 active:bg-slate-900' 
              : 'bg-slate-100 text-slate-300 cursor-not-allowed'
            }`}
          style={S.dmSans}
        >
          <Save className="w-5 h-5 text-emerald-400" strokeWidth={3} />
          <span>Save Changes</span>
        </motion.button>
      </div>
=======
    await updateCashWallet(counts)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const formatValue = (val, type) => {
    if (type === 'coin' && val < 1) {
       if (currencyCode === 'USD') return `${(val * 100).toFixed(0)}¢`
       if (currencyCode === 'EUR' || currencyCode === 'GBP') return `${(val * 100).toFixed(0)}c`
       return val.toString()
    }
    return val.toString()
  }

  const renderItem = (item, i) => {
    const key = `${item.value}_${item.type}`
    const count = counts[key] || 0
    
    return (
      <motion.div key={key} ref={i === 0 ? firstNoteRef : null} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
        className="flex items-center justify-between bg-white rounded-[24px] p-4 shadow-sm border border-[#F1F5F9] active:scale-[0.99] transition-all">
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-1.5 min-w-[100px]">
            <NoteCard value={item.value} currency={currencyCode} type={item.type} size="md" showCount={false} />
            <p className="text-[10px] font-[900] text-slate-400 uppercase tracking-tighter" style={S}>
              {currencyData.symbol}{formatValue(item.value, item.type)} {item.type}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[15px] font-[900] text-black" style={SORA}>
              {formatMoney(item.value * count, currencyCode)}
            </p>
            <p className="text-[9px] font-[800] text-[#CBD5E1] uppercase tracking-widest" style={DM_SANS}>Subtotal</p>
          </div>
        </div>

        <div className="flex items-center bg-[#F6F6F6] rounded-full p-1 border border-[#EEEEEE]">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleAdjust(item.value, item.type, -1)}
            disabled={count === 0}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${count === 0 ? 'text-slate-200' : 'text-slate-500 active:bg-slate-200'}`}>
            <Minus className="w-4 h-4" strokeWidth={3} />
          </motion.button>
          <span className="w-10 text-center text-[16px] font-[900] text-black" style={SORA}>{count}</span>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleAdjust(item.value, item.type, 1)}
            className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center shadow-lg active:scale-95">
            <Plus className="w-4 h-4" strokeWidth={3} />
          </motion.button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F5F5] overflow-x-hidden safe-top pb-48">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-transparent">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
          <ChevronLeft className="w-6 h-6 text-black" />
        </motion.button>
        <h1 className="text-[17px] font-[700] text-black" style={DM_SANS}>My Cash</h1>
        <div className="flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={startGuide}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm font-bold text-[18px]">
            ?
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
            <Edit2 className="w-4 h-4 text-black" />
          </motion.button>
        </div>
      </header>

      {/* Total Cash Card */}
      <div className="px-6 mt-2 mb-10">
        <div ref={totalCardRef} className="w-full rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-black/20 bg-black flex flex-col items-center justify-center min-h-[210px]"
          style={S}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16 blur-3xl opacity-50" />
          
          <div className="relative z-10 flex flex-col items-center gap-2">
            <p className="text-white/40 text-[10px] font-[800] uppercase tracking-[0.2em] mb-1" style={S}>Cash in pocket</p>
            <div className="flex items-baseline gap-2">
              <span className="text-[28px] font-[600] text-white/30" style={SORA}>{currencyData.symbol}</span>
              <span className="text-[52px] font-[900] leading-none tracking-tighter" style={SORA}>
                {totalCash.toLocaleString()}
              </span>
            </div>
            <div className="mt-8 px-5 py-2 rounded-full bg-white/10 border border-white/5 text-[10px] font-[800] uppercase tracking-widest text-white/60" style={DM_SANS}>
              {totalNotes} NOTES TOTAL
            </div>
          </div>
        </div>
      </div>

      {/* Inventory vs History Toggle */}
      <div ref={tabToggleRef} className="px-6 mb-8 flex gap-2">
         {['inventory', 'history'].map(tab => (
           <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3.5 rounded-2xl text-[11px] font-[900] uppercase tracking-[0.2em] transition-all border ${
              activeTab === tab ? 'bg-black text-white border-black shadow-xl' : 'bg-white text-slate-400 border-slate-100'
            }`} style={DM_SANS}>
             {tab}
           </button>
         ))}
      </div>

      {activeTab === 'inventory' ? (
        <div className="flex-1 px-6 pb-10">
          <h2 className="text-[12px] font-[800] text-black uppercase tracking-[0.2em] mb-6 px-2 flex items-center gap-3" style={DM_SANS}>
            <div className="w-2 h-2 rounded-full bg-black" />
            Cash Banknotes
          </h2>
          <div className="flex flex-col gap-5 mb-12">
            {notesList.map((item, i) => renderItem(item, i))}
          </div>

          {coinsList.length > 0 && (
            <>
              <h2 className="text-[12px] font-[800] text-black uppercase tracking-[0.2em] mb-6 px-2 flex items-center gap-3" style={DM_SANS}>
                <div className="w-2 h-2 rounded-full bg-black" />
                Metal Coins
              </h2>
              <div className="flex flex-col gap-5">
                {coinsList.map((item, i) => renderItem(item, i + notesList.length))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex-1 px-6 pb-32">
           <WalletHistory transactions={transactions} filterType="cash" currency={currencyCode} />
        </div>
      )}

      {/* Summary Tab Bar (Fixed Bottom) */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[450px] bg-white/95 backdrop-blur-lg border-t border-[#F1F5F9] px-6 pt-5 pb-9 z-50 rounded-t-[32px] shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-5 px-2">
          <div className="flex flex-col">
            <p className="text-[10px] font-[700] text-[#AFAFAF] uppercase tracking-widest mb-0.5" style={DM_SANS}>Notes Count</p>
            <p className="text-[18px] font-[800] text-black" style={SORA}>{totalNotes}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-[700] text-[#AFAFAF] uppercase tracking-widest mb-0.5" style={DM_SANS}>Grand Total</p>
            <p className="text-[18px] font-[800] text-[#7C3AED]" style={SORA}>{formatMoney(totalCash, currencyCode)}</p>
          </div>
        </div>
        
        
        <motion.button 
          ref={saveBtnRef}
          whileTap={{ scale: 0.98 }} 
          onClick={handleSave} 
          disabled={isLoading}
          className={`w-full py-5 rounded-[24px] bg-black text-white font-[800] text-[15px] shadow-xl shadow-black/10 flex items-center justify-center gap-3 active:bg-[#111111] transition-all ${isLoading ? 'opacity-70' : ''}`} style={DM_SANS}>
          <Save className="w-5 h-5" /> 
          {isLoading ? 'Saving...' : 'SAVE INVENTORY'}
        </motion.button>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-36 left-1/2 -translate-x-1/2 w-fit px-6 py-3 bg-black text-white rounded-full flex items-center gap-3 shadow-2xl z-[60]">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-[13px] font-[700]" style={DM_SANS}>Cash inventory updated successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

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
