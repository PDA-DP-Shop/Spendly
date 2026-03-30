// Add expense screen — three modes: Type It In, Scan Product, Scan Bill
import { useState, useRef, lazy, Suspense, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronDown, RotateCcw, Calendar, Receipt, ScanBarcode } from 'lucide-react'
import DOMPurify from 'dompurify'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import NumberKeypad from '../components/forms/NumberKeypad'
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
import { generateId } from '../utils/generateId'
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
  const [showShare, setShowShare] = useState(false)
  
  const handleShareWA = () => {
    const perPerson = (parseFloat(amountStr) || 0) / splitPeople
    const msg = `Hey! We split a bill for ${shopName || getCategoryById(category)?.name || 'something'}. Your share is ${currObj.symbol}${perPerson.toFixed(2)}. Please pay me back when you can! 💸`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const [showCalc, setShowCalc] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [sharing, setSharing] = useState(false)
  const receiptRef = useRef(null)

  useEffect(() => {
    if (editId && expenses.length > 0) {
      // IndexedDB uses integer IDs, but URL params are strings
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
      // Check clipboard for SMS auto-detect
      checkClipboardForSMS()
    }
  }, [editId, expenses, mode])

  const checkClipboardForSMS = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (!text) return
      const parsed = parseBankSMS(text)
      if (parsed) {
        // Confirmation prompt or toast? We'll just auto-fill for frictionless UX
        setType(parsed.type)
        setAmountStr(parsed.amount.toString())
        if (parsed.shopName !== 'Unknown Merchant') setShopName(parsed.shopName)
        setCategory(parsed.category)
        setNote(parsed.note)
        // clear clipboard to prevent duplicate detection loop if user leaves and comes back
        navigator.clipboard.writeText('') 
      }
    } catch (e) {
      // Silent fail if permission not granted or clipboard empty
    }
  }

  const handleShare = async () => {
    if (!receiptRef.current) return
    setSharing(true)
    try {
      const canvas = await html2canvas(receiptRef.current, { backgroundColor: '#0F0F1A', scale: 2 })
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
          // Fallback to clipboard
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

  const currObj = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0]

  const handleShopChange = (val) => {
    setShopName(val)
    const guessed = guessCategory(val)
    setCategory(guessed)
  }

  const handleSave = async () => {
    const amount = parseFloat(amountStr)
    if (!amount || amount <= 0) return
    
    // Block future dates
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
    <div className="min-h-screen flex flex-col bg-[#F5F5F5] dark:bg-[#0F0F1A]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 safe-top pt-4 pb-3">
        <div className="flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#1A1A2E] flex items-center justify-center shadow-sm">
            <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-white" />
          </motion.button>
          <h1 className="text-[20px] font-sora font-bold text-gray-900 dark:text-white">
            {editId ? 'Edit Expense' : 'Add Expense'}
          </h1>
        </div>
        {editId && (
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleShare} disabled={sharing}
            className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-sm">
            <svg className={`w-5 h-5 text-purple-600 ${sharing ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </motion.button>
        )}
      </div>

      {/* Type toggle */}
      <div className="flex mx-4 mb-4 p-1 bg-white dark:bg-[#1A1A2E] rounded-2xl shadow-sm">
        {['spent','received'].map(t => (
          <motion.button key={t} whileTap={{ scale: 0.97 }} onClick={() => setType(t)}
            className={`flex-1 py-3 rounded-xl text-[14px] font-semibold transition-all ${
              type === t ? (t === 'spent' ? 'bg-orange-500 text-white shadow-sm' : 'bg-purple-600 text-white shadow-sm') : 'text-gray-500'
            }`}>
            {t === 'spent' ? '💸 I Spent' : '💰 I Received'}
          </motion.button>
        ))}
      </div>

      {/* Giant Native Input */}
      <div className="text-center mb-5 px-4 mt-6 relative">
        <div className={`flex justify-center items-center font-sora font-bold text-gray-900 dark:text-white tracking-tight transition-all duration-200 ${amountStr.length > 8 ? 'text-[36px]' : amountStr.length > 6 ? 'text-[46px]' : 'text-[56px]'}`}>
           <span className={`${type === 'spent' ? 'text-orange-500' : 'text-purple-500'} font-black mr-1 flex-shrink-0`}>{type === 'spent' ? '-' : '+'}</span>
           <span className={`${amountStr.length > 8 ? 'text-[28px]' : amountStr.length > 6 ? 'text-[32px]' : 'text-[40px]'} text-gray-300 dark:text-gray-600 flex-shrink-0 transition-all`}>{currObj.symbol}</span>
           <input 
             type="number" 
             inputMode="decimal"
             value={amountStr === '0' ? '' : amountStr}
             onChange={e => setAmountStr(e.target.value)}
             placeholder="0.00"
             autoFocus
             autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
             style={{ width: `${amountStr === '0' || !amountStr ? 4.2 : amountStr.length + 0.5}ch` }}
             className="bg-transparent outline-none text-left ml-2 placeholder-gray-200 dark:placeholder-gray-700 max-w-[80vw]"
           />
        </div>
        
        {/* Calculator Toggle */}
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowCalc(true)}
          className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/></svg>
        </motion.button>
        
        {/* Category tag */}
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowCategories(s => !s)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full mt-4 shadow-sm transition-transform active:scale-95 border-2 border-transparent"
          style={{ backgroundColor: selectedCat.bgColor, borderColor: selectedCat.color + '40' }}>
          <span className="text-xl">{selectedCat.emoji}</span>
          <span className="text-[16px] font-bold" style={{ color: selectedCat.color }}>{selectedCat.name}</span>
          <ChevronDown className="w-5 h-5 ml-1" style={{ color: selectedCat.color }} />
        </motion.button>
      </div>

      {/* Category grid (expandable) */}
      <AnimatePresence>
        {showCategories && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mx-4 mb-3 bg-white dark:bg-[#1A1A2E] rounded-2xl p-3 shadow-sm">
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map(cat => (
                <motion.button key={cat.id} whileTap={{ scale: 0.92 }} onClick={() => { setCategory(cat.id); setShowCategories(false) }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium transition-all ${
                    category === cat.id ? 'bg-purple-600 text-white' : 'bg-gray-50 dark:bg-[#242438] text-gray-600 dark:text-gray-300'
                  }`}>
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="text-[10px] leading-tight text-center">{cat.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simple Inputs */}
      <div className="flex flex-col gap-3 mx-4 mb-4">
        <div className="bg-white dark:bg-[#1A1A2E] rounded-[24px] shadow-sm p-1 flex flex-col border border-transparent focus-within:border-purple-400/30 focus-within:ring-4 focus-within:ring-purple-500/5 transition-all duration-300">
          <input
            value={shopName}
            onChange={e => handleShopChange(e.target.value)}
            placeholder="Name of shop or person..."
            autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
            className="w-full px-5 py-4 bg-transparent text-[17px] font-semibold text-gray-900 dark:text-white placeholder-gray-400 border-b border-gray-100 dark:border-[#242438] outline-none"
          />
          <div className="flex items-center border-b border-gray-100 dark:border-[#242438] px-5 relative group hover:bg-gray-50 dark:hover:bg-[#1f1f33] transition-colors cursor-pointer">
            <Calendar className="w-5 h-5 text-gray-400 mr-3 group-hover:text-purple-500 transition-colors" />
            <input
              type="datetime-local"
              value={dateStr}
              max={maxDate}
              onChange={e => setDateStr(e.target.value)}
              className="flex-1 py-4 bg-transparent text-[15px] font-medium text-gray-700 dark:text-gray-300 outline-none w-full styling-date-input cursor-pointer"
              style={{ colorScheme: 'dark light' }}
            />
          </div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add an optional note or receipt details..."
            rows={3}
            autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
            className="w-full px-5 py-4 bg-transparent text-[15px] text-gray-600 dark:text-gray-300 placeholder-gray-400 outline-none resize-none"
          />
        </div>

        {/* Split Bill Toggle */}
        <div className="bg-white dark:bg-[#1A1A2E] rounded-[24px] shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <label className="text-[14px] font-bold text-gray-900 dark:text-white block">Split Bill</label>
              <p className="text-[12px] text-gray-500 mt-0.5">Divide this cost with friends</p>
            </div>
            <button
              onClick={() => setIsSplit(!isSplit)}
              className={`w-12 h-6 rounded-full transition-colors ${isSplit ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform m-0.5 ${isSplit ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <AnimatePresence>
            {isSplit && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="bg-purple-50 dark:bg-purple-900/10 rounded-2xl p-4 border border-purple-100 dark:border-purple-900/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-purple-700 dark:text-purple-400">Number of people</span>
                    <div className="flex items-center gap-4 bg-white dark:bg-[#1A1A2E] px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800">
                      <button onClick={() => setSplitPeople(Math.max(2, splitPeople - 1))} className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 font-bold text-xl leading-none shadow-sm pb-1">-</button>
                      <span className="font-sora font-bold text-[18px] text-gray-900 dark:text-white w-4 text-center">{splitPeople}</span>
                      <button onClick={() => setSplitPeople(splitPeople + 1)} className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xl leading-none shadow-sm pb-1">+</button>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-purple-200/50 dark:border-purple-800/50 flex justify-between items-center mb-4">
                    <span className="text-[13px] text-gray-500">Per person</span>
                    <span className="font-sora font-bold text-[20px] text-gray-900 dark:text-white">
                      {formatMoney((parseFloat(amountStr) || 0) / splitPeople, '')}
                    </span>
                  </div>
                  <button onClick={handleShareWA} type="button" className="w-full py-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-[13px] rounded-xl flex items-center justify-center gap-2 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 .002 5.383.002 12.029c0 2.124.553 4.192 1.605 6.01L0 24l6.111-1.604c1.745.962 3.733 1.474 5.92 1.474 6.645 0 12.03-5.384 12.03-12.03C24.062 5.385 18.676 0 12.031 0zm7.152 17.24c-.304.853-1.463 1.55-2.26 1.666-.66.096-1.503.27-4.322-.9-3.41-1.424-5.63-4.908-5.803-5.14-.17-.234-1.385-1.846-1.385-3.52 0-1.674.87-2.52 1.187-2.854.316-.334.693-.418.92-.418.228 0 .456.002.65-.008.2-.01.47-.077.737.564.267.643.91 2.228.988 2.388.077.16.126.347.03.55-.095.203-.144.32-.288.49-.143.17-.3.374-.432.505-.145.142-.296.297-.13.585.166.287.74 1.226 1.594 1.99.11.085.222.17.33.25.105.08.216.157.324.225.845.534 1.636.87 2.036 1.05.397.18.63.153.866-.118.236-.27 1.018-1.187 1.29-1.597.272-.41.543-.343.905-.205.362.138 2.288 1.08 2.68 1.277.394.198.656.298.752.463.097.165.097.962-.206 1.815z"/></svg>
                    Share via WhatsApp
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Quick Rescan Buttons */}
        <div className="flex gap-3 mt-1">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/add?mode=scan-bill')} 
            className="flex-1 py-3.5 bg-white dark:bg-[#1A1A2E] border border-gray-100 dark:border-[#242438] text-gray-700 dark:text-gray-300 font-bold text-[13px] rounded-2xl flex items-center justify-center gap-2 shadow-sm">
             <Receipt className="w-4 h-4 text-purple-500" /> Rescan Bill
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/add?mode=scan-product')} 
            className="flex-1 py-3.5 bg-white dark:bg-[#1A1A2E] border border-gray-100 dark:border-[#242438] text-gray-700 dark:text-gray-300 font-bold text-[13px] rounded-2xl flex items-center justify-center gap-2 shadow-sm">
             <ScanBarcode className="w-4 h-4 text-purple-500" /> Scan QR
          </motion.button>
        </div>

        {/* Payment Method */}
        <div className="mt-4">
          <p className="text-[12px] font-semibold text-gray-500 mb-2 ml-1">Payment Method</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {PAYMENT_METHODS.map(pm => (
              <button key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-full text-[13px] font-semibold flex items-center gap-1.5 transition-all border ${
                  paymentMethod === pm.id 
                    ? 'bg-purple-600 border-purple-600 text-white shadow-sm' 
                    : 'bg-white dark:bg-[#1A1A2E] border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300'
                }`}>
                <span>{pm.icon}</span> {pm.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-end px-4 pb-8 pt-3">
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave}
          disabled={saving}
          className={`w-full py-4 rounded-[20px] text-white text-[16px] font-semibold transition-all ${saved ? 'bg-green-500' : 'bg-purple-600'}`}
          style={{ boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}>
          {saved ? '✓ Saved!' : saving ? 'Saving...' : editId ? 'Update Expense' : 'Save Expense'}
        </motion.button>
      </div>

      <AnimatePresence>
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" /></div>}>
          {mode === 'scan-product' && (
            <BarcodeScanner 
              onProductFound={(product) => {
                if (product.name) {
                  setShopName(DOMPurify.sanitize(product.name || product.brand))
                }
                if (product.scannedAmount) {
                  setAmountStr(product.scannedAmount.toString())
                }
                if (product.paymentMethod) {
                  setPaymentMethod(product.paymentMethod)
                }
                if (product.rawValue && !product.name && !product.scannedAmount) {
                  setNote(DOMPurify.sanitize(`Scanned Code: ${product.rawValue}`))
                }
                if (product.categoryTags && product.categoryTags.length > 0) {
                  setCategory(guessCategory(product.categoryTags.join(' ')))
                }
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
