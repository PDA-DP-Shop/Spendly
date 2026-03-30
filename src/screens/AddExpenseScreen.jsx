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
const BarcodeScanner = lazy(() => import('../components/scanner/BarcodeScanner'))
const BillScanner = lazy(() => import('../components/scanner/BillScanner'))
import { useExpenseStore } from '../store/expenseStore'
import { useSettingsStore } from '../store/settingsStore'
import { getCategoryById, CATEGORIES } from '../constants/categories'
import { guessCategory } from '../utils/guessCategory'
import { generateId } from '../utils/generateId'
import { formatMoney } from '../utils/formatMoney'
import { format } from 'date-fns'
import { CURRENCIES } from '../constants/currencies'

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
  const [showCategories, setShowCategories] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

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
      }
    }
  }, [editId, expenses])

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
      <div className="flex items-center gap-3 px-4 safe-top pt-4 pb-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white dark:bg-[#1A1A2E] flex items-center justify-center shadow-sm">
          <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-white" />
        </motion.button>
        <h1 className="text-[20px] font-sora font-bold text-gray-900 dark:text-white">
          {editId ? 'Edit Expense' : 'Add Expense'}
        </h1>
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
      <div className="text-center mb-5 px-4 mt-6">
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
             <ScanBarcode className="w-4 h-4 text-purple-500" /> Scan Barcode
          </motion.button>
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
                if (product.rawValue && !product.name) {
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
        </Suspense>
      </AnimatePresence>
    </div>
  )
}
