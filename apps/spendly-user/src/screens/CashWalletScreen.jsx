import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
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
    }
  }

  const handleSave = async () => {
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
    </div>
  )
}
