// AddExpenseScreen — white premium expense entry
import { useState, useRef, lazy, Suspense, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronDown, Calendar, Receipt, ScanBarcode, Check, Plus, Minus, Landmark, Share2, MessageCircle, RotateCcw } from 'lucide-react'
import DOMPurify from 'dompurify'
import SmartCalculator from '../components/forms/SmartCalculator'
import VoiceAddModal from '../components/forms/VoiceAddModal'
import CustomDatePicker from '../components/forms/CustomDatePicker'
const BarcodeScanner = lazy(() => import('../components/scanner/BarcodeScanner'))
const BillScanner = lazy(() => import('../components/scanner/BillScanner'))
import { useExpenseStore } from '../store/expenseStore'
import { useSettingsStore } from '../store/settingsStore'
import { getCategoryById, CATEGORIES } from '../constants/categories'
import { guessCategory } from '../utils/guessCategory'
import { ShareReceipt } from '../components/shared/ShareReceipt'
import { formatMoney } from '../utils/formatMoney'
import { format } from 'date-fns'
import { CURRENCIES } from '../constants/currencies'
import { PAYMENT_METHODS } from '../constants/paymentMethods'
import { parseBankSMS } from '../utils/smsParser'
import { useLocation } from 'react-router-dom'
import { scannedProductService } from '../services/database'

const SmartScanner = lazy(() => import('../components/scanner/SmartScanner'))

const HAPTIC_SHAKE = {
  tap: { 
    x: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.35, ease: "easeInOut" }
  }
}

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
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const receiptRef = useRef(null)
  
  const S = { fontFamily: "'Inter', sans-serif" }
  const currObj = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0]

  const location = useLocation()
  const prefilled = location.state?.prefilled

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
    } else if (prefilled) {
      // Handle data from Smart Scanner
      if (prefilled.amount) setAmountStr(prefilled.amount.toString())
      if (prefilled.shopName) setShopName(prefilled.shopName)
      if (prefilled.category) setCategory(prefilled.category.toLowerCase())
      if (prefilled.note) setNote(prefilled.note)
      if (prefilled.date) setDateStr(format(new Date(prefilled.date), "yyyy-MM-dd'T'HH:mm"))
    } else if (mode === 'type' && !editId) {
      checkClipboardForSMS()
    }
  }, [editId, expenses, mode, prefilled])

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

  const handleWhatsAppShare = () => {
    const total = parseFloat(amountStr) || 0
    const liability = (total / splitPeople).toFixed(2)
    const cat = getCategoryById(category)
    const dateFormatted = format(new Date(dateStr), 'MMM dd, yyyy')
    
    const text = `*Expense Split via Spendly* 💸\n\n` +
      `*Merchant:* ${shopName || 'Miscellaneous'}\n` +
      `*Category:* ${cat.emoji} ${cat.name}\n` +
      `*Date:* ${dateFormatted}\n` +
      `*Total Bill:* ${formatMoney(total, currency)}\n\n` +
      `---------------------------\n` +
      `👉 *YOUR SHARE: ${formatMoney(liability, currency)}*\n` +
      `---------------------------\n\n` +
      `📊 _Split between ${splitPeople} people_\n` +
      `⚖️ _Calculated on Spendly_`
      
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
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

    // Intelligent Learning Loop: Save user corrections back to database
    if (prefilled?.barcodeValue) {
      await scannedProductService.add({
        barcode: prefilled.barcodeValue,
        productName: shopName,
        brand: note.split(' • ')[0] || '', // Extract brand if possible from note
        category: category
      })
    }

    if (editId) await updateExpense(editId, expense)
    else await addExpense(expense)
    setSaved(true)
    setTimeout(() => navigate(-1), 700)
  }

  const selectedCat = getCategoryById(category)
  const splitAmount = (parseFloat(amountStr) || 0) / splitPeople

  return (
    <div className="min-h-dvh flex flex-col bg-white overflow-x-hidden safe-top pb-8">
      <div className="flex items-center justify-between px-6 pt-10 pb-5 bg-white sticky top-0 z-50">
        <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-full flex items-center justify-center bg-white border border-[#EEEEEE]">
          <ChevronLeft className="w-6 h-6 text-black" strokeWidth={2.5} />
        </motion.button>
        <h1 className="text-[20px] font-[800] text-black tracking-tight" style={S}>
          {editId ? 'Edit Entry' : 'New Transaction'}
        </h1>
        <div className="w-11" />
      </div>

      {/* Scan Source Badge & Rescan */}
      {prefilled && (
        <div className="px-6 pb-2 flex items-center justify-between">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${
            prefilled.scanType === 'bill' ? 'bg-orange-50 border-orange-100 text-orange-600' :
            prefilled.scanType === 'barcode' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
            prefilled.scanType === 'product_package' ? 'bg-blue-50 border-blue-100 text-blue-600' :
            'bg-purple-50 border-purple-100 text-purple-600'
          }`}>
             {prefilled.scanType === 'bill' ? <Receipt className="w-3.5 h-3.5" /> : 
              prefilled.scanType === 'barcode' ? <ScanBarcode className="w-3.5 h-3.5" /> : 
              prefilled.scanType === 'upi_qr' ? <Check className="w-3.5 h-3.5" /> :
              <ScanBarcode className="w-3.5 h-3.5" />}
             <span className="text-[11px] font-[800] uppercase tracking-wider" style={S}>
               From {prefilled.scanType.replace('_', ' ')} scan
             </span>
          </div>
          
          <motion.button 
            variants={HAPTIC_SHAKE} whileTap="tap"
            onClick={() => navigate('/add?mode=smart-scan', { replace: true })}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black text-white text-[11px] font-[800] uppercase tracking-wider shadow-sm active:scale-90 transition-transform"
            style={S}
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={3} />
            Rescan
          </motion.button>
        </div>
      )}

      <div className="flex-1 flex flex-col pt-4">
        <div className="px-6 mb-10">
          <div className="flex bg-[#F6F6F6] p-1.5 rounded-full border border-[#EEEEEE]">
            <motion.button variants={HAPTIC_SHAKE} whileTap="tap"
              className={`flex-1 py-3.5 text-[13px] font-[700] rounded-full transition-all tracking-wide ${type === 'spent' ? 'bg-white text-black border border-[#EEEEEE] shadow-sm' : 'text-[#AFAFAF]'}`}
              style={S} onClick={() => setType('spent')}>
              Expense
            </motion.button>
            <motion.button variants={HAPTIC_SHAKE} whileTap="tap"
              className={`flex-1 py-3.5 text-[13px] font-[700] rounded-full transition-all tracking-wide ${type === 'received' ? 'bg-white text-black border border-[#EEEEEE] shadow-sm' : 'text-[#AFAFAF]'}`}
              style={S} onClick={() => setType('received')}>
              Income
            </motion.button>
          </div>
        </div>

        <div className="flex flex-col items-center mb-12 px-6">
          <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-widest mb-3" style={S}>Amount</p>
          <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => setShowCalc(true)}
            className="flex justify-center items-center gap-4 outline-none">
            <span className="text-[24px] font-[800] text-black/20" style={S}>{currObj.symbol}</span>
            <span className="text-center" style={{ fontSize: amountStr.length > 8 ? '52px' : '64px', fontWeight: 800, color: '#000000', letterSpacing: '-0.04em', lineHeight: 1, ...S }}>
              {amountStr || '0'}
            </span>
          </motion.button>

          <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => setShowCategories(s => !s)}
            className={`inline-flex items-center gap-3 mt-10 px-6 py-3.5 rounded-full border transition-all ${showCategories ? 'bg-black text-white border-black' : 'bg-white text-black border-[#EEEEEE]'}`}>
            <span className="text-xl">{selectedCat.emoji}</span>
            <span className="text-[14px] font-[700]" style={S}>{selectedCat.name}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showCategories ? 'rotate-180' : ''}`} strokeWidth={3} />
          </motion.button>
        </div>

        <AnimatePresence>
          {showCategories && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mx-6 mb-8 rounded-[28px] p-6 bg-[#F6F6F6] border border-[#EEEEEE]">
              <div className="grid grid-cols-4 gap-3">
                {CATEGORIES.map(cat => (
                  <motion.button key={cat.id} variants={HAPTIC_SHAKE} whileTap="tap"
                    onClick={() => { setCategory(cat.id); setShowCategories(false) }}
                    className={`flex flex-col items-center gap-2.5 p-3.5 rounded-2xl transition-all border ${category === cat.id ? 'bg-white border-[#EEEEEE] shadow-sm' : 'bg-transparent border-transparent'}`}>
                    <span className="text-xl transition-all">{cat.emoji}</span>
                    <span className={`text-[10px] font-[700] text-center truncate w-full ${category === cat.id ? 'text-black' : 'text-[#AFAFAF]'}`} style={S}>{cat.name}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-6 pb-20 w-full space-y-5">
          <motion.div variants={HAPTIC_SHAKE} whileTap="tap"
            className={`p-6 rounded-[28px] flex items-center justify-between border transition-all ${isSplit ? 'bg-blue-50 border-blue-100' : 'bg-[#F6F6F6] border-[#EEEEEE]'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center font-[800] text-[18px] ${isSplit ? 'bg-blue-600 text-white' : 'bg-white text-black border border-[#EEEEEE]'}`}>÷</div>
              <div>
                <p className="text-[15px] font-[700] text-black" style={S}>Split Bill</p>
                <p className="text-[11px] font-[500] text-[#AFAFAF]" style={S}>Share with friends</p>
              </div>
            </div>
            <button onClick={() => setIsSplit(!isSplit)}
              className="w-12 h-7 rounded-full transition-all relative border border-[#EEEEEE]"
              style={{ background: isSplit ? '#2563EB' : '#E2E2E2' }}>
              <motion.div className="w-5 h-5 rounded-full bg-white shadow-md absolute top-[3px]" animate={{ left: isSplit ? '23px' : '3px' }} />
            </button>
          </motion.div>

          <AnimatePresence>
            {isSplit && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-4">
                <div className="p-7 rounded-[32px] bg-white border border-[#EEEEEE] shadow-sm">
                  <div className="flex items-end justify-between mb-6">
                    <div>
                      <p className="text-[11px] font-[700] text-[#AFAFAF] uppercase mb-2" style={S}>Per Person</p>
                      <h4 className="text-[32px] font-[800] text-black tracking-tight" style={S}>{formatMoney(splitAmount, currency)}</h4>
                    </div>
                    <div className="flex items-center gap-5 px-5 py-2 bg-[#F6F6F6] rounded-full border border-[#EEEEEE]">
                       <button onClick={() => setSplitPeople(Math.max(2, splitPeople - 1))} className="text-black font-[800] text-xl active:scale-75 transition-transform">－</button>
                       <p className="text-[15px] font-[800] text-black" style={S}>{splitPeople}</p>
                       <button onClick={() => setSplitPeople(splitPeople + 1)} className="text-black font-[800] text-xl active:scale-110 transition-transform">＋</button>
                    </div>
                  </div>
                  <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={handleWhatsAppShare}
                    className="w-full py-4 rounded-2xl bg-[#25D366] text-white flex items-center justify-center gap-3 shadow-md" style={S}>
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span className="text-[14px] font-[700]">Send to WhatsApp</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="rounded-[28px] overflow-hidden border border-[#EEEEEE] bg-[#F6F6F6] divide-y divide-[#EEEEEE]">
              <div className="flex items-center px-7 py-5 bg-white">
                  <Landmark className="w-5 h-5 text-[#D8D8D8] mr-4" strokeWidth={2.5} />
                  <input value={shopName} onChange={e => { setShopName(e.target.value); setCategory(guessCategory(e.target.value)) }}
                    placeholder="Merchant Name" className="flex-1 bg-transparent text-[15px] font-[600] text-black placeholder-[#D8D8D8] outline-none" style={S} />
              </div>
              <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => setShowDatePicker(true)}
                className="flex items-center px-7 py-5 bg-white w-full text-left active:bg-[#F6F6F6]">
                <Calendar className="w-5 h-5 text-[#D8D8D8] mr-4" strokeWidth={2.5} />
                <span className="flex-1 text-[15px] font-[600] text-black" style={S}>{format(new Date(dateStr), 'MMM dd, HH:mm')}</span>
              </motion.button>
              <div className="px-7 py-5 bg-white">
                <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note..." rows={2}
                  className="w-full bg-transparent text-[15px] font-[600] text-black placeholder-[#D8D8D8] outline-none resize-none leading-relaxed" style={S} />
              </div>
          </div>

          <div className="pt-6">
            <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-widest mb-5 ml-2" style={S}>Payment Method</p>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {PAYMENT_METHODS.map(pm => (
                <motion.button key={pm.id} variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => setPaymentMethod(pm.id)}
                  className={`flex-shrink-0 px-6 py-4 rounded-2xl text-[14px] font-[700] flex items-center gap-3 transition-all border ${paymentMethod === pm.id ? 'bg-black text-white border-black shadow-lg' : 'bg-white text-[#AFAFAF] border-[#EEEEEE]'}`} style={S}>
                  <span className={`text-xl ${paymentMethod === pm.id ? '' : 'opacity-40'}`}>{pm.icon}</span> 
                  <span>{pm.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={handleSave} disabled={saving}
            className="w-full py-5 mt-8 rounded-2xl text-white text-[16px] font-[800] bg-black shadow-xl" style={S}>
            {saved ? 'Saved!' : saving ? 'Saving...' : editId ? 'Update' : 'Save'}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        <Suspense fallback={<div className="fixed inset-0 bg-white/80 z-[60] flex items-center justify-center"><div className="w-10 h-10 rounded-full border-4 border-[#EEEEEE] border-t-black animate-spin" /></div>}>
          {mode === 'smart-scan' && (
            <SmartScanner 
              onResult={(data) => {
                if (data.forceEdit) {
                   navigate('/add?mode=type', { state: { prefilled: data }, replace: true })
                } else {
                   navigate('/add?mode=type', { state: { prefilled: data }, replace: true })
                }
              }} 
              onClose={() => navigate(-1)} 
            />
          )}
          {mode === 'scan-product' && <BarcodeScanner onProductFound={(p) => navigate('/add?mode=type', { replace: true })} onClose={() => navigate(-1)} />}
          {mode === 'scan-bill' && <BillScanner onBillScanned={(d) => navigate('/add?mode=type', { replace: true })} onClose={() => navigate(-1)} />}
          {mode === 'voice' && <VoiceAddModal onParsed={(d) => navigate('/add?mode=type', { replace: true })} onClose={() => navigate(-1)} />}
        </Suspense>
      </AnimatePresence>

      <AnimatePresence>
        {showCalc && <SmartCalculator initialValue={amountStr === '0' ? '' : amountStr} currency={currObj.symbol} onClose={() => setShowCalc(false)} onSave={(val) => { setAmountStr(val.toString()); setShowCalc(false) }} />}
      </AnimatePresence>
      <AnimatePresence>
        {showDatePicker && <CustomDatePicker value={dateStr} onChange={setDateStr} onClose={() => setShowDatePicker(false)} />}
      </AnimatePresence>
      <ShareReceipt
        ref={receiptRef}
        currency={currObj.symbol}
        expense={editId ? { amount: parseFloat(amountStr) || 0, type, shopName, category, date: dateStr, paymentMethod } : null}
      />
    </div>
  )
}
