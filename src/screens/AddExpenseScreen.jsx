// AddExpenseScreen — white premium expense entry
import { useState, useRef, lazy, Suspense, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronDown, Calendar, Receipt, ScanBarcode, Check } from 'lucide-react'
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
      const canvas = await html2canvas(receiptRef.current, { backgroundColor: '#FFFFFF', scale: 2 })
      canvas.toBlob(async (blob) => {
        if (!blob) return
        const file = new File([blob], `spendly-${editId}.png`, { type: 'image/png' })
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ title: 'My Expense', text: `Tracked via Spendly 💜`, files: [file] })
        } else {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        }
        setSharing(false)
      })
    } catch (e) { setSharing(false) }
  }

  const handleShopChange = (val) => {
    setShopName(val)
    setCategory(guessCategory(val))
  }

  const handleSave = async () => {
    const amount = parseFloat(amountStr)
    if (!amount || amount <= 0) return
    const selectedDate = new Date(dateStr)
    if (selectedDate > new Date()) { alert("You cannot add an expense in the future!"); return }

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
  const amount = parseFloat(amountStr) || 0
  const maxDate = format(new Date(), "yyyy-MM-dd'T'HH:mm")

  const S = { fontFamily: "'Plus Jakarta Sans', sans-serif" }

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 safe-top pt-5 pb-4">
        <div className="flex items-center gap-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: '#F8F9FF', border: '1px solid #F0F0F8' }}>
            <ChevronLeft className="w-5 h-5 text-[#64748B]" />
          </motion.button>
          <h1 className="text-[20px] font-bold text-[#0F172A]" style={S}>
            {editId ? 'Edit Expense' : 'Add Expense'}
          </h1>
        </div>
        {editId && (
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleShare} disabled={sharing}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: '#F8F9FF', border: '1px solid #F0F0F8' }}>
            <svg className={`w-5 h-5 text-[#6366F1] ${sharing ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </motion.button>
        )}
      </div>

      {/* Type toggle */}
      <div className="mx-5 mb-6">
        <div className="relative flex p-1 rounded-[14px]" style={{ background: '#F8F9FF', border: '1px solid #F0F0F8' }}>
          <motion.div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-[12px]"
            animate={{
              x: type === 'spent' ? 4 : 'calc(100% + 0px)',
              background: type === 'spent' ? 'linear-gradient(135deg, #F43F5E, #FB7185)' : 'linear-gradient(135deg, #6366F1, #8B5CF6)'
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          />
          {['spent', 'received'].map(t => (
            <button key={t} onClick={() => setType(t)}
              className="flex-1 py-3 z-10 text-[14px] font-bold relative transition-colors"
              style={{ color: type === t ? '#FFFFFF' : '#94A3B8', ...S }}>
              {t === 'spent' ? '💸 Expense' : '💰 Income'}
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div className="text-center mb-6 px-5">
        <p className="text-[12px] font-semibold uppercase tracking-widest text-[#94A3B8] mb-3" style={S}>Amount</p>
        <div className="flex justify-center items-baseline gap-2">
          <span className="text-[28px] font-bold text-[#94A3B8]" style={S}>{currObj.symbol}</span>
          <input
            type="number"
            inputMode="decimal"
            value={amountStr === '0' ? '' : amountStr}
            onChange={e => setAmountStr(e.target.value)}
            placeholder="0.00"
            autoFocus
            autoComplete="off"
            className="bg-transparent outline-none text-left placeholder-[#E2E8F0] max-w-[70vw]"
            style={{
              fontSize: amountStr.length > 8 ? '42px' : amountStr.length > 6 ? '52px' : '62px',
              fontWeight: 800,
              color: type === 'spent' ? '#F43F5E' : '#10B981',
              width: `${amountStr === '0' || !amountStr ? 4.2 : amountStr.length + 0.5}ch`,
              ...S
            }}
          />
        </div>

        {/* Category pill */}
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowCategories(s => !s)}
          className="inline-flex items-center gap-3 px-5 py-3 rounded-full mt-5"
          style={{ background: '#EEF2FF', border: '1px solid rgba(99,102,241,0.2)' }}>
          <span className="text-xl">{selectedCat.emoji}</span>
          <span className="text-[15px] font-semibold text-[#6366F1]" style={S}>{selectedCat.name}</span>
          <ChevronDown className={`w-4 h-4 text-[#6366F1] transition-transform ${showCategories ? 'rotate-180' : ''}`} />
        </motion.button>
      </div>

      {/* Category grid */}
      <AnimatePresence>
        {showCategories && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mx-5 mb-5 rounded-[20px] p-4"
            style={{ background: '#F8F9FF', border: '1px solid #F0F0F8' }}>
            <div className="grid grid-cols-4 gap-3">
              {CATEGORIES.map(cat => (
                <motion.button key={cat.id} whileTap={{ scale: 0.9 }}
                  onClick={() => { setCategory(cat.id); setShowCategories(false) }}
                  className="flex flex-col items-center gap-2 p-3 rounded-[16px] transition-all"
                  style={{
                    background: category === cat.id ? '#EEF2FF' : '#FFFFFF',
                    border: `1px solid ${category === cat.id ? '#6366F1' : '#F0F0F8'}`,
                  }}>
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-center"
                    style={{ color: category === cat.id ? '#6366F1' : '#94A3B8', ...S }}>
                    {cat.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inputs */}
      <div className="flex flex-col gap-4 mx-5 mb-5">
        <div className="rounded-[20px] overflow-hidden" style={{ border: '1px solid #F0F0F8', background: '#FFFFFF' }}>
          <input
            value={shopName}
            onChange={e => handleShopChange(e.target.value)}
            placeholder="Merchant / Purpose"
            autoComplete="off"
            className="w-full px-5 py-4 bg-transparent text-[16px] font-semibold text-[#0F172A] placeholder-[#CBD5E1] border-b border-[#F0F0F8] outline-none"
            style={S}
          />
          <div className="flex items-center px-5 border-b border-[#F0F0F8]">
            <Calendar className="w-4 h-4 text-[#6366F1] mr-3 flex-shrink-0" />
            <input
              type="datetime-local"
              value={dateStr}
              max={maxDate}
              onChange={e => setDateStr(e.target.value)}
              className="flex-1 py-4 bg-transparent text-[14px] font-medium text-[#0F172A] outline-none w-full styling-date-input"
              style={S}
            />
          </div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Note (optional)"
            rows={2}
            autoComplete="off"
            className="w-full px-5 py-4 bg-transparent text-[14px] text-[#64748B] placeholder-[#CBD5E1] outline-none resize-none"
            style={S}
          />
        </div>

        {/* Split bill */}
        <div className="p-5 rounded-[20px]" style={{ background: '#FFFFFF', border: '1px solid #F0F0F8' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: '#EEF2FF' }}>
                <span className="text-[#6366F1] text-lg font-bold">÷</span>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#0F172A]" style={S}>Split Bill</p>
                <p className="text-[12px] text-[#94A3B8]" style={S}>Divide with others</p>
              </div>
            </div>
            <button onClick={() => setIsSplit(!isSplit)}
              className="w-14 h-8 rounded-full transition-all relative"
              style={{ background: isSplit ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : '#E2E8F0' }}>
              <motion.div className="w-6 h-6 rounded-full bg-white shadow-md absolute top-1"
                animate={{ left: isSplit ? 'calc(100% - 28px)' : '4px' }} />
            </button>
          </div>
          <AnimatePresence>
            {isSplit && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden">
                <div className="mt-5 pt-4" style={{ borderTop: '1px solid #F0F0F8' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-[#94A3B8]" style={S}>People</span>
                    <div className="flex items-center gap-4 px-4 py-2 rounded-[12px]" style={{ background: '#F8F9FF', border: '1px solid #F0F0F8' }}>
                      <button onClick={() => setSplitPeople(Math.max(2, splitPeople - 1))} className="text-[#F43F5E] font-bold text-xl">－</button>
                      <span className="font-bold text-[20px] text-[#0F172A] w-6 text-center" style={S}>{splitPeople}</span>
                      <button onClick={() => setSplitPeople(splitPeople + 1)} className="text-[#6366F1] font-bold text-xl">＋</button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-[#94A3B8]" style={S}>Each pays</span>
                    <span className="font-bold text-[24px] text-[#6366F1]" style={S}>
                      {formatMoney((parseFloat(amountStr) || 0) / splitPeople, currObj.symbol)}
                    </span>
                  </div>
                  <motion.button whileTap={{ scale: 0.98 }} onClick={handleShareWA}
                    className="w-full py-3.5 rounded-[12px] flex items-center justify-center gap-2 font-semibold text-[14px]"
                    style={{ background: 'rgba(37,211,102,0.1)', color: '#15803D', border: '1px solid rgba(37,211,102,0.3)', ...S }}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 .002 5.383.002 12.029c0 2.124.553 4.192 1.605 6.01L0 24l6.111-1.604c1.745.962 3.733 1.474 5.92 1.474 6.645 0 12.03-5.384 12.03-12.03C24.062 5.385 18.676 0 12.031 0zm7.152 17.24c-.304.853-1.463 1.55-2.26 1.666-.66.096-1.503.27-4.322-.9-3.41-1.424-5.63-4.908-5.803-5.14-.17-.234-1.385-1.846-1.385-3.52 0-1.674.87-2.52 1.187-2.854.316-.334.693-.418.92-.418.228 0 .456.002.65-.008.2-.01.47-.077.737.564.267.643.91 2.228.988 2.388.077.16.126.347.03.55-.095.203-.144.32-.288.49-.143.17-.3.374-.432.505-.145.142-.296.297-.13.585.166.287.74 1.226 1.594 1.99.847.763 1.636.87 2.036 1.05.397.18.63.153.866-.118.236-.27 1.018-1.187 1.29-1.597.272-.41.543-.343.905-.205.362.138 2.288 1.08 2.68 1.277.394.198.656.298.752.463.097.165.097.962-.206 1.815z"/></svg>
                    Share via WhatsApp
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Scan options */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/add?mode=scan-bill')}
            className="py-4 rounded-[16px] flex items-center justify-center gap-2 font-semibold text-[13px]"
            style={{ background: '#F8F9FF', border: '1px solid #F0F0F8', color: '#64748B', ...S }}>
            <Receipt className="w-4 h-4 text-[#6366F1]" /> Scan Bill
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/add?mode=scan-product')}
            className="py-4 rounded-[16px] flex items-center justify-center gap-2 font-semibold text-[13px]"
            style={{ background: '#F8F9FF', border: '1px solid #F0F0F8', color: '#64748B', ...S }}>
            <ScanBarcode className="w-4 h-4 text-[#06B6D4]" /> Scan Product
          </motion.button>
        </div>

        {/* Payment method */}
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider text-[#94A3B8] mb-3 ml-1" style={S}>Payment Method</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {PAYMENT_METHODS.map(pm => (
              <button key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                className="flex-shrink-0 px-4 py-3 rounded-[12px] text-[13px] font-semibold flex items-center gap-2 transition-all"
                style={{
                  background: paymentMethod === pm.id ? '#EEF2FF' : '#F8F9FF',
                  border: `1px solid ${paymentMethod === pm.id ? '#6366F1' : '#F0F0F8'}`,
                  color: paymentMethod === pm.id ? '#6366F1' : '#64748B',
                  ...S
                }}>
                <span className="text-lg">{pm.icon}</span> {pm.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="px-5 pb-12 mt-auto">
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
          className="w-full py-5 rounded-[16px] text-white text-[16px] font-bold flex items-center justify-center gap-3"
          style={{
            background: saved ? '#10B981' : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            boxShadow: saved ? '0 8px 24px rgba(16,185,129,0.35)' : '0 8px 24px rgba(99,102,241,0.35)',
            ...S
          }}>
          {saved ? (
            <><Check className="w-6 h-6 animate-bounce" /> Saved!</>
          ) : saving ? (
            <>
              <span className="w-2 h-2 rounded-full bg-white dot-bounce-1" />
              <span className="w-2 h-2 rounded-full bg-white dot-bounce-2" />
              <span className="w-2 h-2 rounded-full bg-white dot-bounce-3" />
            </>
          ) : editId ? 'Update Expense' : 'Save Expense'}
        </motion.button>
      </div>

      <AnimatePresence>
        <Suspense fallback={<div className="fixed inset-0 bg-white/80 z-[60] flex items-center justify-center"><div className="w-12 h-12 rounded-full border-4 border-[#EEF2FF] border-t-[#6366F1] animate-spin" /></div>}>
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
        expense={editId ? { amount, type, shopName, category, date: dateStr, paymentMethod } : null}
      />
    </div>
  )
}
