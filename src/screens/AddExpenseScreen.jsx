// Add expense screen — three modes: Type It In, Scan Product, Scan Bill
import { useState, useRef, lazy, Suspense, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronDown, Calendar, Receipt, ScanBarcode, Loader2 } from 'lucide-react'
import DOMPurify from 'dompurify'
import SmartCalculator from '../components/forms/SmartCalculator'
import VoiceAddModal from '../components/forms/VoiceAddModal'
const BarcodeScanner = lazy(() => import('../components/scanner/BarcodeScanner'))
const BillScanner = lazy(() => import('../components/scanner/BillScanner'))
import { useExpenseStore } from '../store/expenseStore'
import { useSettingsStore } from '../store/settingsStore'
import { getCategoryById, CATEGORIES } from '../constants/categories'
import { guessCategory } from '../utils/guessCategory'
import { ShareReceipt } from '../components/shared/ShareReceipt'
import html2canvas from 'html2canvas'
import { formatMoney } from '../utils/formatMoney'
import { format } from 'date-fns'
import { CURRENCIES } from '../constants/currencies'
import { PAYMENT_METHODS } from '../constants/paymentMethods'
import { parseBankSMS } from '../utils/smsParser'

export default function AddExpenseScreen() {
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') || 'type'
  const editId = searchParams.get('edit')
  const navigate = useNavigate()
  const { addExpense, updateExpense, expenses } = useExpenseStore()
  const { settings } = useSettingsStore()
  const currency = settings?.currency || 'USD'

  // Manual entry state
  const [type, setType] = useState('spent')
  const [amountStr, setAmountStr] = useState('0')
  const [category, setCategory] = useState('food')
  const [shopName, setShopName] = useState('')
  const [note, setNote] = useState('')
  const [dateStr, setDateStr] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"))
  
  // Split support
  const [isSplit, setIsSplit] = useState(false)
  const [splitPeople, setSplitPeople] = useState(2)

  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [showCategories, setShowCategories] = useState(false)
  
  const [showCalc, setShowCalc] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [sharing, setSharing] = useState(false)
  const receiptRef = useRef(null)

  const currObj = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0]

  useEffect(() => {
    if (editId && expenses.length > 0) {
      const numericId = parseInt(editId)
      const exp = expenses.find(e => e.id === numericId || e.id === editId)
      
      if (exp) {
        setType(exp.type)
        setAmountStr(exp.amount.toString())
        setCategory(exp.category)
        setShopName(exp.shopName)
        setNote(exp.note)
        setDateStr(format(new Date(exp.date), "yyyy-MM-dd'T'HH:mm"))
        if (exp.paymentMethod) setPaymentMethod(exp.paymentMethod)
        if (exp.isSplit) {
          setIsSplit(true)
          setSplitPeople(exp.splitPeople || 2)
        }
      }
    } else if (mode === 'type' && !editId) {
      checkClipboardForSMS()
    }
  }, [editId, expenses, mode])

  const checkClipboardForSMS = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (!text) return
      const parsed = parseBankSMS(text)
      if (parsed) {
        setType(parsed.type)
        setAmountStr(parsed.amount.toString())
        if (parsed.shopName !== 'Unknown Merchant') setShopName(parsed.shopName)
        setCategory(parsed.category)
        setNote(parsed.note)
        navigator.clipboard.writeText('') 
      }
    } catch (e) {}
  }

  const handleShareWA = () => {
    const perPerson = (parseFloat(amountStr) || 0) / splitPeople
    const msg = `Hey! We split a bill for ${shopName || getCategoryById(category)?.name || 'something'}. Your share is ${currObj.symbol}${perPerson.toFixed(2)}. Please pay me back when you can! 💸`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const handleShare = async () => {
    if (!receiptRef.current) return
    setSharing(true)
    try {
      const canvas = await html2canvas(receiptRef.current, { backgroundColor: '#050B18', scale: 2 })
      canvas.toBlob(async (blob) => {
        if (!blob) return
        const file = new File([blob], `spendly-${editId}.png`, { type: 'image/png' })
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'My Expense',
            text: `Tracked via Spendly 💜`,
            files: [file]
          })
        } else {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
          alert('Image copied to clipboard!')
        }
        setSharing(false)
      })
    } catch (e) {
      console.error(e)
      setSharing(false)
    }
  }

  const handleShopChange = (val) => {
    setShopName(val)
    const guessed = guessCategory(val)
    setCategory(guessed)
  }

  const handleSave = async () => {
    const amount = parseFloat(amountStr)
    if (!amount || amount <= 0) return
    
    const selectedDate = new Date(dateStr)
    if (selectedDate > new Date()) {
       alert("You cannot add an expense in the future!")
       return
    }

    setSaving(true)
    const expense = {
      type,
      amount,
      currency,
      category,
      shopName: shopName || getCategoryById(category).name,
      note,
      date: selectedDate.toISOString(),
      paymentMethod,
      isSplit,
      splitPeople: isSplit ? splitPeople : 1,
      isRepeating: false,
      repeatEvery: null,
      tags: [],
    }
    
    if (editId) {
      await updateExpense(editId, expense)
    } else {
      await addExpense(expense)
    }
    
    setSaved(true)
    setTimeout(() => navigate(-1), 700)
  }

  const selectedCat = getCategoryById(category)
  const amount = parseFloat(amountStr) || 0
  const maxDate = format(new Date(), "yyyy-MM-dd'T'HH:mm")

  return (
    <div className="min-h-screen flex flex-col mb-20 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 safe-top pt-6 pb-6 relative z-50">
        <div className="flex items-center gap-5">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }} 
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-2xl glass border-white/5 flex items-center justify-center shadow-glowSmall transition-all"
          >
            <ChevronLeft className="w-6 h-6 text-[#7B8DB0]" />
          </motion.button>
          <h1 className="text-[22px] font-display font-bold text-[#F0F4FF] tracking-tight">
            {editId ? 'Verify Record' : 'Log Transaction'}
          </h1>
        </div>
        {editId && (
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }} 
            onClick={handleShare} 
            disabled={sharing}
            className="w-12 h-12 rounded-2xl glass border-white/5 flex items-center justify-center shadow-glowSmall active:shadow-none"
          >
            <svg className={`w-5 h-5 text-cyan-glow ${sharing ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </motion.button>
        )}
      </div>

      {/* Type toggle */}
      <div className="mx-6 mb-8 p-1.5 glass-elevated border-white/5 rounded-2xl relative">
        <motion.div
           className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] rounded-xl shadow-glow transition-colors duration-500"
           animate={{ 
             x: type === 'spent' ? 0 : '100%', 
             background: type === 'spent' ? 'linear-gradient(135deg, #FF4D6D, #FF708D)' : 'linear-gradient(135deg, #0066FF, #00D4FF)' 
           }}
        />
        {['spent','received'].map(t => (
          <button key={t} onClick={() => setType(t)}
            className={`flex-1 py-3.5 z-10 text-[13px] font-display font-bold transition-all relative ${
              type === t ? 'text-white' : 'text-[#3D4F70]'
            }`}>
            {t === 'spent' ? 'BURN OUTFLOW' : 'SECURE INFLOW'}
          </button>
        ))}
      </div>

      {/* Amount Display */}
      <div className="text-center mb-10 px-6 relative z-10">
        <div className="flex flex-col items-center">
           <p className="text-[11px] font-display font-bold text-[#3D4F70] uppercase tracking-[.25em] mb-4">Transaction Quantum</p>
           <div className={`flex justify-center items-center font-display font-bold tracking-tighter transition-all duration-300 ${amountStr.length > 8 ? 'text-[44px]' : amountStr.length > 6 ? 'text-[52px]' : 'text-[64px]'}`}>
              <span className={`${type === 'spent' ? 'text-expense' : 'text-income'} mr-3 opacity-50`}>{type === 'spent' ? '-' : '+'}</span>
              <span className="text-[#3D4F70] mr-2 text-[28px] mt-2">{currObj.symbol}</span>
              <input 
                type="number" 
                inputMode="decimal"
                value={amountStr === '0' ? '' : amountStr}
                onChange={e => setAmountStr(e.target.value)}
                placeholder="0.00"
                autoFocus
                autoComplete="off"
                className={`bg-transparent outline-none text-left placeholder-[#0F1626] max-w-[80vw] ${type === 'spent' ? 'text-expense drop-shadow-[0_0_15px_rgba(255,77,109,0.2)]' : 'text-income drop-shadow-[0_0_15px_rgba(0,255,135,0.2)]'}`}
                style={{ width: `${amountStr === '0' || !amountStr ? 4.2 : amountStr.length + 0.5}ch` }}
              />
           </div>
        </div>
        
        {/* Calculator Toggle */}
        <motion.button 
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }} 
          onClick={() => setShowCalc(true)}
          className="w-14 h-14 glass border-white/5 rounded-[18px] flex items-center justify-center text-cyan-glow mt-8 mx-auto shadow-glowSmall hover:shadow-glow transition-all"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/></svg>
        </motion.button>
        
        {/* Category tag */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }} 
          onClick={() => setShowCategories(s => !s)}
          className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl mt-10 glass-elevated border-white/5 hover:border-cyan-glow/30 transition-all shadow-glowLg"
        >
          <div className="w-10 h-10 rounded-xl glass border-none flex items-center justify-center text-2xl shadow-inner">
            {selectedCat.emoji}
          </div>
          <div className="text-left">
            <p className="text-[10px] font-display font-bold text-[#3D4F70] uppercase tracking-widest leading-none mb-1">Silo Category</p>
            <p className="text-[16px] font-display font-bold text-[#F0F4FF] leading-none">{selectedCat.name}</p>
          </div>
          <ChevronDown className={`w-5 h-5 text-cyan-glow transition-transform duration-300 ${showCategories ? 'rotate-180' : ''}`} />
        </motion.button>
      </div>

      {/* Category grid (expandable) */}
      <AnimatePresence>
        {showCategories && (
          <motion.div initial={{ height: 0, opacity: 0, y: -20 }} animate={{ height: 'auto', opacity: 1, y: 0 }} exit={{ height: 0, opacity: 0, y: -20 }}
            className="overflow-hidden mx-6 mb-8 glass-accent border-white/5 p-5 rounded-[32px] shadow-glowLg relative">
            <div className="absolute inset-0 bg-cyan-glow/5 pointer-events-none" />
            <div className="grid grid-cols-4 gap-4 relative z-10">
              {CATEGORIES.map(cat => (
                <motion.button key={cat.id} whileTap={{ scale: 0.92 }} onClick={() => { setCategory(cat.id); setShowCategories(false) }}
                  className={`flex flex-col items-center gap-2.5 p-3.5 rounded-[22px] transition-all border duration-300 ${
                    category === cat.id ? 'bg-cyan-dim border-cyan-glow/40 shadow-glow' : 'glass border-transparent hover:bg-white/5'
                  }`}>
                  <span className="text-2xl filter drop-shadow-md">{cat.emoji}</span>
                  <span className={`text-[10px] font-display font-bold leading-tight text-center uppercase tracking-widest ${category === cat.id ? 'text-[#F0F4FF]' : 'text-[#7B8DB0]'}`}>{cat.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simple Inputs */}
      <div className="flex flex-col gap-4 mx-6 mb-8">
        <div className="glass-elevated border-white/5 rounded-[32px] p-2 flex flex-col gap-1 focus-within:border-cyan-glow/30 transition-all duration-300 shadow-glowSmall">
          <input
            value={shopName}
            onChange={e => handleShopChange(e.target.value)}
            placeholder="Recipient / Purpose"
            autoComplete="off"
            className="w-full px-6 py-5 bg-transparent text-[17px] font-display font-bold text-[#F0F4FF] placeholder-[#3D4F70] border-b border-white/5 outline-none"
          />
          <div className="flex items-center border-b border-white/5 px-6 relative group hover:bg-white/5 transition-colors cursor-pointer">
            <Calendar className="w-5 h-5 text-cyan-glow mr-4 group-hover:drop-shadow-glow transition-all" />
            <input
              type="datetime-local"
              value={dateStr}
              max={maxDate}
              onChange={e => setDateStr(e.target.value)}
              className="flex-1 py-5 bg-transparent text-[15px] font-body font-bold text-[#F0F4FF] outline-none w-full styling-date-input cursor-pointer"
            />
          </div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Encrypted Memo (optional)"
            rows={2}
            autoComplete="off"
            className="w-full px-6 py-5 bg-transparent text-[15px] font-body font-medium text-[#7B8DB0] placeholder-[#3D4F70] outline-none resize-none"
          />
        </div>

        {/* Split Bill Toggle */}
        <div className="glass border-white/5 rounded-[32px] p-6 shadow-glowLg relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="flex items-center justify-between mb-0 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[18px] bg-cyan-dim flex items-center justify-center shadow-inner">
                <span className="text-cyan-glow text-xl font-display font-bold">÷</span>
              </div>
              <div>
                <label className="text-[14px] font-display font-bold text-[#F0F4FF] block">Protocol: Split</label>
                <p className="text-[12px] font-body font-bold text-[#3D4F70] uppercase tracking-wider mt-0.5">Divide Liquidity</p>
              </div>
            </div>
            <button
              onClick={() => setIsSplit(!isSplit)}
              className={`w-14 h-8 rounded-full transition-all relative ${isSplit ? 'bg-cyan-glow shadow-glow' : 'bg-[#0F1626] border border-white/10'}`}
            >
              <motion.div 
                className="w-6 h-6 rounded-full bg-white shadow-lg absolute top-1"
                animate={{ left: isSplit ? 'calc(100% - 28px)' : '4px' }}
              />
            </button>
          </div>

          <AnimatePresence>
            {isSplit && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden relative z-10">
                <div className="mt-8 pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-display font-bold text-[#7B8DB0] uppercase tracking-widest">Active Peers</span>
                    <div className="flex items-center gap-6 glass-elevated px-5 py-2.5 rounded-2xl border-white/10">
                      <button onClick={() => setSplitPeople(Math.max(2, splitPeople - 1))} className="text-expense font-bold text-2xl active:scale-90 transition-transform">－</button>
                      <span className="font-display font-bold text-[22px] text-[#F0F4FF] w-8 text-center">{splitPeople}</span>
                      <button onClick={() => setSplitPeople(splitPeople + 1)} className="text-cyan-glow font-bold text-2xl active:scale-90 transition-transform">＋</button>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-between items-center mb-6">
                    <span className="text-[12px] font-display font-bold text-[#7B8DB0] uppercase tracking-widest">Per Peer Allocation</span>
                    <span className="font-display font-bold text-[28px] text-cyan-glow drop-shadow-glow">
                      {formatMoney((parseFloat(amountStr) || 0) / splitPeople, currObj.symbol)}
                    </span>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleShareWA} type="button" className="w-full py-4 glass bg-[#25D366]/10 border-[#25D366]/30 text-[#25D366] font-display font-bold text-[13px] rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-[#25D366]/20 tracking-widest">
                    <svg className="w-5 h-5 shadow-glowSmall" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 .002 5.383.002 12.029c0 2.124.553 4.192 1.605 6.01L0 24l6.111-1.604c1.745.962 3.733 1.474 5.92 1.474 6.645 0 12.03-5.384 12.03-12.03C24.062 5.385 18.676 0 12.031 0zm7.152 17.24c-.304.853-1.463 1.55-2.26 1.666-.66.096-1.503.27-4.322-.9-3.41-1.424-5.63-4.908-5.803-5.14-.17-.234-1.385-1.846-1.385-3.52 0-1.674.87-2.52 1.187-2.854.316-.334.693-.418.92-.418.228 0 .456.002.65-.008.2-.01.47-.077.737.564.267.643.91 2.228.988 2.388.077.16.126.347.03.55-.095.203-.144.32-.288.49-.143.17-.3.374-.432.505-.145.142-.296.297-.13.585.166.287.74 1.226 1.594 1.99.11.085.222.17.33.25.105.08.216.157.324.225.845.534 1.636.87 2.036 1.05.397.18.63.153.866-.118.236-.27 1.018-1.187 1.29-1.597.272-.41.543-.343.905-.205.362.138 2.288 1.08 2.68 1.277.394.198.656.298.752.463.097.165.097.962-.206 1.815z"/></svg>
                    BROADCAST SPLIT
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Quick Scan Options */}
        <div className="grid grid-cols-2 gap-4">
          <motion.button 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/add?mode=scan-bill')} 
            className="flex-1 py-5 glass-elevated border-white/5 text-[#F0F4FF] font-display font-bold text-[12px] rounded-[24px] flex items-center justify-center gap-3 shadow-glow hover:shadow-cyan-glow/20 transition-all uppercase tracking-widest">
             <Receipt className="w-5 h-5 text-cyan-glow" /> Scan Ledger
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/add?mode=scan-product')} 
            className="flex-1 py-5 glass-elevated border-white/5 text-[#F0F4FF] font-display font-bold text-[12px] rounded-[24px] flex items-center justify-center gap-3 shadow-glow hover:shadow-cyan-glow/20 transition-all uppercase tracking-widest">
             <ScanBarcode className="w-5 h-5 text-cyan-glow" /> Vision Scan
          </motion.button>
        </div>

        {/* Payment Method */}
        <div className="mt-4">
          <p className="text-[11px] font-display font-bold text-[#3D4F70] tracking-[0.2em] uppercase mb-4 ml-1">Payment Infrastructure</p>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {PAYMENT_METHODS.map(pm => (
              <button key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                className={`flex-shrink-0 px-6 py-4 rounded-2xl text-[13px] font-display font-bold flex items-center gap-3 transition-all border duration-300 ${
                  paymentMethod === pm.id 
                    ? 'glass bg-cyan-dim border-cyan-glow/50 text-[#F0F4FF] shadow-glowSmall' 
                    : 'glass bg-white/5 border-transparent text-[#7B8DB0] hover:bg-white/10'
                }`}>
                <span className="text-xl filter drop-shadow-md">{pm.icon}</span> {pm.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 pb-12 mt-auto relative z-10">
        <motion.button 
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.97 }} 
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-5 rounded-[28px] text-white text-[16px] font-display font-bold transition-all shadow-glowLg flex items-center justify-center gap-3 ${saved ? 'bg-[#00FF87]' : 'bg-gradient-to-br from-[#0066FF] to-[#00D4FF]'}`}
        >
          {saved ? (
            <>
              <svg className="w-6 h-6 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              RECORD COMMITTED
            </>
          ) : saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              SYNCHRONIZING...
            </>
          ) : editId ? 'UPDATE LEDGER' : 'COMMIT TRANSACTION'}
        </motion.button>
      </div>

      <AnimatePresence>
        <Suspense fallback={<div className="fixed inset-0 bg-[#050B18]/80 z-[60] flex items-center justify-center backdrop-blur-xl"><div className="w-16 h-16 border-4 border-cyan-dim border-t-cyan-glow rounded-full animate-spin shadow-glow" /></div>}>
          {mode === 'scan-product' && (
            <BarcodeScanner 
              onProductFound={(product) => {
                if (product.name) setShopName(DOMPurify.sanitize(product.name || product.brand))
                if (product.scannedAmount) setAmountStr(product.scannedAmount.toString())
                if (product.paymentMethod) setPaymentMethod(product.paymentMethod)
                if (product.rawValue && !product.name && !product.scannedAmount) setNote(DOMPurify.sanitize(`Scanned Code: ${product.rawValue}`))
                if (product.categoryTags && product.categoryTags.length > 0) setCategory(guessCategory(product.categoryTags.join(' ')))
                navigate('/add?mode=type', { replace: true })
              }}
              onClose={() => navigate(-1)}
            />
          )}
          {mode === 'scan-bill' && (
            <BillScanner
              onBillScanned={(data) => {
                if (data.amount > 0) setAmountStr(data.amount.toString())
                if (data.name) setShopName(DOMPurify.sanitize(data.name))
                if (data.notes) setNote(DOMPurify.sanitize(data.notes))
                if (data.date) setDateStr(format(data.date, "yyyy-MM-dd'T'HH:mm"))
                navigate('/add?mode=type', { replace: true })
              }}
              onClose={() => navigate(-1)}
            />
          )}
          {mode === 'voice' && (
            <VoiceAddModal
              onParsed={(data) => {
                setType(data.type)
                setAmountStr(data.amount.toString())
                if (data.shopName) setShopName(DOMPurify.sanitize(data.shopName))
                if (data.category) setCategory(data.category)
                if (data.note) setNote(DOMPurify.sanitize(data.note))
                navigate('/add?mode=type', { replace: true })
              }}
              onClose={() => navigate(-1)}
            />
          )}
        </Suspense>
      </AnimatePresence>

      <AnimatePresence>
        {showCalc && (
          <SmartCalculator
            initialValue={amountStr === '0' ? '' : amountStr}
            currency={currObj.symbol}
            onClose={() => setShowCalc(false)}
            onSave={(val) => {
              setAmountStr(val.toString())
              setShowCalc(false)
            }}
          />
        )}
      </AnimatePresence>

      <ShareReceipt 
        ref={receiptRef} 
        currency={currObj.symbol}
        expense={editId ? { amount, type, shopName, category, date: dateStr, paymentMethod } : null} 
      />
    </div>
  )
}
