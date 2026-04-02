// AddExpenseScreen — white premium expense entry
import { useState, useRef, lazy, Suspense, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronDown, Calendar, Receipt, ScanBarcode, Check, Plus, Minus, Landmark } from 'lucide-react'
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

  const [type, setType] = useState('spent')
  const [amountStr, setAmountStr] = useState('0')
  const [category, setCategory] = useState('food')
  const [shopName, setShopName] = useState('')
  const [note, setNote] = useState('')
  const [dateStr, setDateStr] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"))
  const [isSplit, setIsSplit] = useState(false)
  const [splitPeople, setSplitPeople] = useState(2)
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [showCategories, setShowCategories] = useState(false)
  const [showCalc, setShowCalc] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [sharing, setSharing] = useState(false)
  const receiptRef = useRef(null)
  
  const S = { fontFamily: "'Nunito', sans-serif" }
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
        if (exp.isSplit) { setIsSplit(true); setSplitPeople(exp.splitPeople || 2) }
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
        if (navigator.clipboard.writeText) navigator.clipboard.writeText('')
      }
    } catch (e) {}
  }

  const handleSave = async () => {
    const amount = parseFloat(amountStr)
    if (!amount || amount <= 0) return
    const selectedDate = new Date(dateStr)
    if (selectedDate > new Date()) return

    setSaving(true)
    const expense = {
      type, amount, currency, category,
      shopName: shopName || getCategoryById(category).name,
      note, date: selectedDate.toISOString(), paymentMethod,
      isSplit, splitPeople: isSplit ? splitPeople : 1,
      isRepeating: false, repeatEvery: null, tags: [],
    }
    if (editId) await updateExpense(editId, expense)
    else await addExpense(expense)
    setSaved(true)
    setTimeout(() => navigate(-1), 700)
  }

  const selectedCat = getCategoryById(category)
  const maxDate = format(new Date(), "yyyy-MM-dd'T'HH:mm")

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF] overflow-x-hidden safe-top pb-8">
      {/* Ghost Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-[16px] flex items-center justify-center bg-white shadow-sm border border-[#F0F0F8]">
          <ChevronLeft className="w-5 h-5 text-[var(--primary)]" />
        </motion.button>
        <div className="flex flex-col items-center">
            <h1 className="text-[14px] font-[800] text-[#0F172A] uppercase tracking-widest" style={S}>
                {editId ? 'Edit Entry' : 'Manual Entry'}
            </h1>
        </div>
        <div className="w-11" />
      </div>

      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        className="flex-1 bg-white rounded-t-[40px] shadow-[0_-12px_40px_rgba(0,0,0,0.04)] flex flex-col relative mt-2"
      >
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-[#F0F0F8] rounded-full" />
        
        <div className="px-6 pt-12 pb-4">
          {/* Type picker */}
          <div className="flex bg-[#F8F7FF] p-1.5 rounded-[20px] mb-10 border border-[#F0F0F8]">
            <button
              className={`flex-1 py-3 text-[14px] font-[800] rounded-[16px] transition-all uppercase tracking-wider ${type === 'spent' ? 'bg-white text-[#FF7043] shadow-md' : 'text-[#94A3B8]'}`}
              style={S}
              onClick={() => setType('spent')}
            >
              Expense
            </button>
            <button
              className={`flex-1 py-3 text-[14px] font-[800] rounded-[16px] transition-all uppercase tracking-wider ${type === 'received' ? 'bg-white text-[#10B981] shadow-md' : 'text-[#94A3B8]'}`}
              style={S}
              onClick={() => setType('received')}
            >
              Income
            </button>
          </div>

          {/* Amount Area */}
          <div className="flex flex-col items-center mb-8">
            <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-2" style={S}>Tap to edit amount</p>
            <button 
              onClick={() => setShowCalc(true)}
              className="flex justify-center items-center gap-2 outline-none group"
            >
              <span className="text-[28px] font-[800] text-[#CBD5E1]" style={S}>{currObj.symbol}</span>
              <span className="bg-transparent text-center transition-all group-active:scale-95"
                style={{
                  fontSize: amountStr.length > 8 ? '44px' : amountStr.length > 6 ? '54px' : '64px',
                  fontWeight: 800,
                  color: type === 'spent' ? '#0F172A' : 'var(--primary)',
                  letterSpacing: '-0.02em',
                  fontFamily: 'Nunito',
                }}
              >
                {amountStr || '0'}
              </span>
            </button>

            {/* Category Button */}
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowCategories(s => !s)}
              className="inline-flex items-center gap-2.5 mt-6 px-6 py-3 rounded-full border border-[#F0F0F8] bg-[#F8F7FF] shadow-sm">
              <div 
                className="w-7 h-7 rounded-full flex items-center justify-center text-lg shadow-inner"
                style={{ background: '#FFFFFF' }}
              >
                {selectedCat.emoji}
              </div>
              <span className="text-[15px] font-[800] text-[#0F172A]" style={S}>{selectedCat.name}</span>
              <ChevronDown className={`w-4 h-4 text-[#94A3B8] transition-transform ${showCategories ? 'rotate-180' : ''}`} />
            </motion.button>
          </div>
        </div>

        {/* Category Grid */}
        <AnimatePresence>
          {showCategories && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mx-6 mb-6 rounded-[28px] p-5 bg-[#F8F7FF]">
              <div className="grid grid-cols-4 gap-4">
                {CATEGORIES.map(cat => (
                  <motion.button key={cat.id} whileTap={{ scale: 0.92 }}
                    onClick={() => { setCategory(cat.id); setShowCategories(false) }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-[24px] transition-all bg-white border ${category === cat.id ? 'border-[var(--primary)] shadow-md' : 'border-transparent'}`}
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <span className="text-[10px] font-[800] uppercase text-center truncate w-full"
                      style={{ color: category === cat.id ? 'var(--primary)' : '#94A3B8', fontFamily: 'Nunito' }}>
                      {cat.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inputs */}
        <div className="px-6 pb-14 overflow-y-auto w-full">
          <div className="flex flex-col gap-5">
            
            <div className="p-5 rounded-[28px] flex items-center justify-between border border-[#F0F0F8] bg-[#F8F7FF]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-[14px] bg-white flex items-center justify-center font-[800] text-[var(--primary)] shadow-sm">÷</div>
                <div>
                  <p className="text-[15px] font-[800] text-[#0F172A]" style={S}>Split with others</p>
                  <p className="text-[12px] font-[700] text-[#94A3B8] uppercase tracking-wider" style={S}>Divide payments</p>
                </div>
              </div>
              <button onClick={() => setIsSplit(!isSplit)}
                className="w-13 h-7.5 rounded-full transition-all relative border border-[#F0F0F8]"
                style={{ background: isSplit ? 'var(--primary)' : '#EEF2FF', width: '52px', height: '30px' }}>
                <motion.div className="w-6 h-6 rounded-full bg-white shadow-md absolute top-[2px]"
                  animate={{ left: isSplit ? '24px' : '2px' }} />
              </button>
            </div>

            <AnimatePresence>
              {isSplit && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden">
                  <div className="flex items-center justify-between p-5 rounded-[24px] bg-white border border-[#F0F0F8]">
                    <span className="text-[12px] font-[800] uppercase tracking-widest text-[#94A3B8]" style={S}>Total People {splitPeople}</span>
                    <div className="flex items-center gap-6 px-4 py-2 bg-[#F8F7FF] rounded-[16px]">
                       <button onClick={() => setSplitPeople(Math.max(2, splitPeople - 1))} className="text-[#FF7043] font-[800] text-2xl">－</button>
                       <button onClick={() => setSplitPeople(splitPeople + 1)} className="text-[var(--primary)] font-[800] text-2xl">＋</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="rounded-[28px] overflow-hidden border border-[#F0F0F8] bg-[#F8F9FA]/30">
              <div className="flex items-center px-5 py-5 border-b border-[#F0F0F8]">
                  <Landmark className="w-5 h-5 text-[#94A3B8] mr-3" />
                  <input
                    value={shopName}
                    onChange={e => { setShopName(e.target.value); setCategory(guessCategory(e.target.value)) }}
                    placeholder="Merchant / Purpose"
                    autoComplete="off"
                    className="flex-1 bg-transparent text-[16px] font-[800] text-[#0F172A] placeholder-[#CBD5E1] outline-none"
                    style={S}
                  />
              </div>
              <div className="flex items-center px-5 py-5 border-b border-[#F0F0F8]">
                <Calendar className="w-5 h-5 text-[#94A3B8] mr-3" />
                <input
                  type="datetime-local"
                  value={dateStr}
                  max={maxDate}
                  onChange={e => setDateStr(e.target.value)}
                  className="flex-1 bg-transparent text-[15px] font-[700] text-[#0F172A] outline-none styling-date-input"
                  style={S}
                />
              </div>
              <div className="px-5 py-5">
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Add a detailed note..."
                    rows={2}
                    className="w-full bg-transparent text-[15px] font-[700] text-[#64748B] placeholder-[#CBD5E1] outline-none resize-none"
                    style={S}
                  />
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="mt-8 mb-10">
            <div className="flex items-center justify-between mb-4 px-1">
                <p className="text-[12px] font-[800] uppercase tracking-widest text-[#94A3B8]" style={S}>Payment Method</p>
                <div className="text-[12px] font-[800] text-[var(--primary)]" style={S}>Select One</div>
            </div>
            <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-2">
              {PAYMENT_METHODS.map(pm => (
                <button key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                  className={`flex-shrink-0 px-5 py-3.5 rounded-[20px] text-[13px] font-[800] flex items-center gap-2.5 transition-all border ${paymentMethod === pm.id ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-lg' : 'bg-white text-[#64748B] border-[#F0F0F8]'}`}
                  style={S}>
                  <span className="text-lg">{pm.icon}</span> {pm.label}
                </button>
              ))}
            </div>
          </div>

          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
            className="w-full py-5 rounded-[24px] text-white text-[17px] font-[800] flex items-center justify-center gap-2 uppercase tracking-widest"
            style={{
              background: saved ? '#10B981' : 'var(--gradient-primary)',
              boxShadow: saved ? '0 8px 32px rgba(16,185,129,0.3)' : '0 12px 40px rgba(124,111,247,0.3)',
              fontFamily: 'Nunito'
            }}>
            {saved ? (
              <><Check className="w-6 h-6" /> Success!</>
            ) : saving ? (
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-white animate-bounce" />
                <div className="w-2.5 h-2.5 rounded-full bg-white animate-bounce [animation-delay:0.2s]" />
                <div className="w-2.5 h-2.5 rounded-full bg-white animate-bounce [animation-delay:0.4s]" />
              </div>
            ) : editId ? 'Update Record' : 'Record Transaction'}
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        <Suspense fallback={<div className="fixed inset-0 bg-white/80 z-[60] flex items-center justify-center"><div className="w-12 h-12 rounded-full border-4 border-[#EEF2FF] border-t-[var(--primary)] animate-spin" /></div>}>
          {mode === 'scan-product' && (
            <BarcodeScanner
              onProductFound={(product) => {
                if (product.name) setShopName(DOMPurify.sanitize(product.name || product.brand))
                if (product.scannedAmount) setAmountStr(product.scannedAmount.toString())
                if (product.paymentMethod) setPaymentMethod(product.paymentMethod)
                if (product.rawValue && !product.name && !product.scannedAmount) setNote(DOMPurify.sanitize(`Scanned Code: ${product.rawValue}`))
                if (product.categoryTags?.length > 0) setCategory(guessCategory(product.categoryTags.join(' ')))
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
            onSave={(val) => { setAmountStr(val.toString()); setShowCalc(false) }}
          />
        )}
      </AnimatePresence>

      <ShareReceipt
        ref={receiptRef}
        currency={currObj.symbol}
        expense={editId ? { amount: parseFloat(amountStr) || 0, type, shopName, category, date: dateStr, paymentMethod } : null}
      />
    </div>
  )
}
