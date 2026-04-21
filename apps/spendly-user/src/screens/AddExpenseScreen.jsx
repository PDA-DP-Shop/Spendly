<<<<<<< HEAD
// AddExpenseScreen — Updated with intelligent Payment Method section (Cash/Bank/Other)
=======
// AddExpenseScreen — Overhauled two-step premium expense entry
>>>>>>> 41f113d (upgrade scanner)
import { useState, useRef, lazy, Suspense, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { 
  ChevronLeft, ChevronDown, Calendar, Receipt, ScanBarcode, Check, Plus, Minus, 
  Landmark, Share2, MessageCircle, RotateCcw, Clock, Sparkles, X, Users, 
<<<<<<< HEAD
  Percent, DollarSign, ArrowRight, Wallet, History, Info, Package, QrCode,
  CreditCard, Smartphone, Globe, AlertCircle, Banknote, Calculator
=======
  Percent, DollarSign, ArrowRight, Wallet, History, Info, Package, QrCode, Smartphone
>>>>>>> 41f113d (upgrade scanner)
} from 'lucide-react'
import { useExpenseStore } from '../store/expenseStore'
import { useSettingsStore } from '../store/settingsStore'
import { useWalletStore } from '../store/walletStore'
<<<<<<< HEAD
=======
import CURRENCY_NOTES from '../constants/currencyNotes'
>>>>>>> 41f113d (upgrade scanner)
import { getCategoryById, CATEGORIES } from '../constants/categories'
import { guessCategory } from '../utils/guessCategory'
import { formatMoney } from '../utils/formatMoney'
import { format } from 'date-fns'
import { CURRENCIES } from '../constants/currencies'
import { lookupBarcode } from '../services/productLookup'
<<<<<<< HEAD
import CURRENCY_NOTES, { getNotesByUserCurrency } from '../constants/currencyNotes'
import SmartCashPanel from '../components/cash/SmartCashPanel'

const SmartScanner = lazy(() => import('../components/scanner/SmartScanner'))
const CustomDatePicker = lazy(() => import('../components/forms/CustomDatePicker'))

const S = {
  inter: { fontFamily: "'Inter', sans-serif" },
  sora: { fontFamily: "'Sora', sans-serif" },
  dmSans: { fontFamily: "'DM Sans', sans-serif" }
}
=======
import { lookupBarcode as lookupBarcodeWithLearning, saveLearnedBarcode } from '../services/barcodeService'
import { PAYMENT_METHODS } from '../constants/paymentMethods'
import SmartCashPanel from '../components/cash/SmartCashPanel'
import { walletTransactionService } from '../services/database'
import ToastMessage from '../components/shared/ToastMessage'
import { markScanAsAdded } from '../services/ocrService'
import { learnFromExpense } from '../services/scanIntelligence'

const CustomDatePicker = lazy(() => import('../components/forms/CustomDatePicker'))

const S = { fontFamily: "'Inter', sans-serif" }
>>>>>>> 41f113d (upgrade scanner)

export default function AddExpenseScreen() {
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') || 'manual'
  const editId = searchParams.get('edit')
  const navigate = useNavigate()
  
<<<<<<< HEAD
  const { addExpense, updateExpense } = useExpenseStore()
  const { getCurrency } = useSettingsStore()
  const { 
    cashWallet, bankAccounts, loadCashWallet, loadBankAccounts,
    deductFromCash, deductFromBank, deductCashNotes, isLoading 
  } = useWalletStore()
  
  const currency = getCurrency()
  const currObj = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0]
  const denominations = useMemo(() => getNotesByUserCurrency(currency), [currency])
  
  // -- Step state
  const [step, setStep] = useState(1) 
  
  // -- Form State
  const [type, setType] = useState('spent')
=======
  const { addExpense, updateExpense, expenses, loadExpenses, scannedData, clearScannedData } = useExpenseStore()
  const { settings } = useSettingsStore()
  const { cashWallet, bankAccounts, loadCashWallet, loadBankAccounts, deductFromCash, deductCashNotes, deductFromBank, calculateChangeNotes } = useWalletStore()
  
  const currency = settings?.currency || 'USD'
  const currObj = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0]
  
  // -- Step state
  const [step, setStep] = useState(1) // 1: Amount/Calc, 2: Details
  
  // -- Form State
  const [type, setType] = useState('spent') // 'spent' or 'received'
>>>>>>> 41f113d (upgrade scanner)
  const [amountStr, setAmountStr] = useState('0')
  const [category, setCategory] = useState('other')
  const [shopName, setShopName] = useState('')
  const [productBarcode, setProductBarcode] = useState('')
  const [productName, setProductName] = useState('')
  const [note, setNote] = useState('')
  const [dateStr, setDateStr] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"))
  
<<<<<<< HEAD
  // -- Payment Method State
  const [paymentType, setPaymentType] = useState('cash') // 'cash', 'bank', 'other'
  const [selectedBankId, setSelectedBankId] = useState(null)
  const [bankTxType, setBankTxType] = useState('upi')
  const [paymentDetails, setPaymentDetails] = useState(null)
=======
  // -- Payment State
  const [paymentTab, setPaymentTab] = useState('cash') // 'cash', 'bank', 'other'
  const [selectedBankId, setSelectedBankId] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [cashGiven, setCashGiven] = useState(0)
  const [paymentDetails, setPaymentDetails] = useState(null) // For UPI QR
>>>>>>> 41f113d (upgrade scanner)
  
  // -- Advanced Calculator State
  const [gstPercent, setGstPercent] = useState(0)
  const [tipAmount, setTipAmount] = useState(0)
  const [splitCount, setSplitCount] = useState(1)
<<<<<<< HEAD
  const [activeCalcTool, setActiveCalcTool] = useState(null)
=======
  const [activeCalcTool, setActiveCalcTool] = useState(null) // 'gst', 'split', 'tip'
>>>>>>> 41f113d (upgrade scanner)
  
  // -- UI State
  const [scanning, setScanning] = useState(mode === 'scan')
  const [showCategories, setShowCategories] = useState(false)
<<<<<<< HEAD
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [saving, setSaving] = useState(false)

  const location = useLocation();

  useEffect(() => {
    loadCashWallet()
    loadBankAccounts()
  }, [loadCashWallet, loadBankAccounts])

  useEffect(() => {
    if (location.state?.prefilled) {
      const p = location.state.prefilled;
      if (p.amount) setAmountStr(p.amount.toString());
      if (p.category) setCategory(p.category);
      if (p.shopName) setShopName(p.shopName);
      if (p.note) setNote(p.note);
      if (p.date) setDateStr(format(new Date(p.date), "yyyy-MM-dd'T'HH:mm"));
      if (p.barcodeValue) setProductBarcode(p.barcodeValue);
      if (p.productName) setProductName(p.productName);
      if (p.step) setStep(p.step);
      else if (p.amount) setStep(2);
      else setStep(1);
    }
  }, [location.state]);

  const handleScannerResult = useCallback(async (data) => {
    const payload = data.detail || data;
    setScanning(false);

    if (payload.type === 'product-barcode') {
      setProductBarcode(payload.barcode);
      const resolved = await lookupBarcode(payload.barcode);
      if (resolved) {
        setProductName(resolved.name);
        setCategory(resolved.category?.toLowerCase() || 'shopping');
        setStep(2);
      } else {
        setStep(1);
      }
    } 
    else if (payload.type === 'payment-qr') {
      const upi = payload.upi || {};
      if (upi.am) setAmountStr(upi.am.toString());
      setShopName(upi.pn || '');
      setPaymentDetails(upi);
      setPaymentType('bank');
      setBankTxType('upi');
      setStep(1);
    }
    else if (payload.type === 'spendly-bill') {
      setAmountStr(payload.total?.toString() || '0');
      setShopName(payload.shopName || '');
      setCategory(payload.shopCategory?.toLowerCase() || 'shopping');
      const itemsList = (payload.items || []).map(i => `${i.name} x${i.quantity} @ ${i.price}`).join('\n');
      setNote(`Bill Details:\n${itemsList}`);
      setStep(2);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scanner-result', handleScannerResult);
    return () => window.removeEventListener('scanner-result', handleScannerResult);
  }, [handleScannerResult]);

  const safeEval = (str) => {
    try {
      return Function(`'use strict'; return (${str.replace(/[^-()\d/*+.]/g, '')})`)();
    } catch (e) {
      return parseFloat(str) || 0;
    }
  };

  const currentAmount = useMemo(() => {
    const base = safeEval(amountStr);
    const withGst = base + (base * (gstPercent / 100));
    const withTip = withGst + tipAmount;
    return withTip;
  }, [amountStr, gstPercent, tipAmount]);

  const handleType = (val) => {
    if (amountStr === '0' && !['+', '-', '*', '/', '.'].includes(val)) {
      setAmountStr(val);
      return;
    }
    setAmountStr(amountStr + val);
  };

  const handleDeleteChar = () => {
    if (amountStr.length <= 1) setAmountStr('0');
    else setAmountStr(amountStr.slice(0, -1));
  };

  const handleSave = async (finalType, paymentData = null) => {
    const amount = currentAmount;
    if (!amount || amount <= 0) return;
    
    setSaving(true);
    const expenseData = {
      type: finalType || type,
      amount: amount / splitCount, 
      originalAmount: amount,
      currency,
      category,
      shopName: productName || shopName || getCategoryById(category).name,
      note,
      date: new Date(dateStr).toISOString(),
      paymentMethod: paymentType === 'other' ? 'Other' : (paymentType === 'cash' ? 'Cash' : bankTxType),
      metadata: {
        productBarcode,
        gstPercent,
        tipAmount,
        splitCount,
        paymentDetails,
        paymentType,
        bankAccountId: selectedBankId,
        paymentData: paymentData || {} // Contains smart cash breakdown
      }
    };

    try {
      // 1. Save expense
      let savedId;
      if (editId) {
        await updateExpense(editId, expenseData);
        savedId = editId;
      } else {
        const id = await addExpense(expenseData);
        savedId = id;
      }

      // 2. Perform Wallet/Bank Deductions
      if (finalType !== 'received') {
        if (paymentType === 'cash') {
          if (paymentData && paymentData.notesGiven) {
            await deductCashNotes(
              paymentData.notesGiven, 
              savedId, 
              paymentData.changeNotes,
              amount
            );
          } else {
            await deductFromCash(amount, savedId);
          }
        } else if (paymentType === 'bank' && selectedBankId) {
          await deductFromBank(selectedBankId, amount, savedId);
        }
      }

      // 3. Learn barcode
      if (productBarcode && productName) {
        const { productCacheService } = await import('../services/database');
        await productCacheService.put(productBarcode, {
          name: productName,
          category,
          brand: shopName,
          source: 'learned'
        });
      }

      navigate(-1);
    } catch (err) {
      console.error('Failed to save expense', err);
      setSaving(false);
=======
  const [showPaymentPicker, setShowPaymentPicker] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  // Source of the last barcode lookup: "learned"|"offline"|"cached"|"online"|null
  const [scannedSource, setScannedSource] = useState(null)
  const [historyId, setHistoryId] = useState(null) // For bill OCR history marking

  const amountRef = useRef(null)
  const calcToolsRef = useRef(null)
  const keypadRef = useRef(null)
  const scanToggleRef = useRef(null)
  
  const detailsAmountRef = useRef(null)
  const shopInputRef = useRef(null)
  const catGridRef = useRef(null)
  const paymentRef = useRef(null)
  const saveActionsRef = useRef(null)

  const location = useLocation();

  useEffect(() => {
    loadExpenses()
    loadCashWallet()
    loadBankAccounts()
  }, [])

  useEffect(() => {
    if (bankAccounts.length > 0 && !selectedBankId) {
      const def = bankAccounts.find(b => b.isDefault) || bankAccounts[0]
      setSelectedBankId(def.id)
    }
  }, [bankAccounts])

  // EDIT MODE LOADER
  useEffect(() => {
    if (editId && expenses.length > 0) {
      const exp = expenses.find(e => e.id?.toString() === editId.toString())
      if (exp) {
        setType(exp.type || 'spent')
        setAmountStr(exp.amount.toString())
        setCategory(exp.category || 'other')
        setShopName(exp.shopName || '')
        setNote(exp.note || '')
        setDateStr(format(new Date(exp.date), "yyyy-MM-dd'T'HH:mm"))
        setPaymentMethod(exp.paymentMethod || 'UPI')
        if (exp.paymentMethod === 'Cash' || exp.paymentMethod === 'CASH') {
          setPaymentTab('cash')
        } else {
          setPaymentTab('bank')
        }
        setStep(2)
      }
    }
  }, [editId, expenses])


  useEffect(() => {
    if (location.state?.prefilled) {
      const p = location.state.prefilled;
      if (p.amount) setAmountStr(p.amount.toString());
      if (p.category) setCategory(p.category);
      if (p.shopName) setShopName(p.shopName);
      if (p.note) setNote(p.note);
      if (p.date) setDateStr(format(new Date(p.date), "yyyy-MM-dd'T'HH:mm"));
      if (p.barcodeValue) setProductBarcode(p.barcodeValue);
      if (p.productName) setProductName(p.productName);
      if (p.historyId) setHistoryId(p.historyId);
      
      // Intelligent Routing
      if (p.step) setStep(p.step);
      else if (p.amount) setStep(2); 
      else setStep(1);
    }
  }, [location.state]);

  // Also handle billSource flag from BillScanResult navigation
  useEffect(() => {
    if (location.state?.prefilled?.billSource === 'ocr') {
      setScannedSource('bill')
    }
  }, [location.state])

  // Consume unified scannedData from Zustand store
  useEffect(() => {
    if (!scannedData) return

    const { type, name, amount, date, time, category, source, rawData } = scannedData
    
    if (name) {
      setShopName(name)
      setProductName(name)
      setCategory(category || guessCategory(name))
    }
    
    if (amount) setAmountStr(amount.toString())
    if (date) {
      const fullDate = time ? `${date}T${time}` : `${date}T${format(new Date(), 'HH:mm')}`
      setDateStr(fullDate)
    }
    
    if (type === 'barcode') {
       setProductBarcode(rawData)
       setScannedSource(source)
    } else {
       setScannedSource(source)
>>>>>>> 41f113d (upgrade scanner)
    }
  };

<<<<<<< HEAD
  // -- Render Step 1
  if (step === 1 && !scanning) {
    return (
      <div className="h-dvh flex flex-col bg-white overflow-hidden safe-top">
        <header className="px-6 pt-8 pb-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full border border-[#F1F5F9] flex items-center justify-center transition-transform active:scale-95"><ChevronLeft className="w-6 h-6" /></button>
          <div className="flex bg-[#F8FAFC] p-1 rounded-full border border-[#F1F5F9]">
            <button className="px-6 py-2 bg-white rounded-full text-[12px] font-[802] shadow-sm tracking-tight" style={S.dmSans}>Entry Amount</button>
            <button onClick={() => navigate('/scans')} className="px-6 py-2 text-[12px] font-[802] text-[#94A3B8] flex items-center gap-2 tracking-tight" style={S.dmSans}><ScanBarcode className="w-4 h-4" /> Scan</button>
          </div>
          <div className="w-12" />
        </header>

        <main className="flex-1 flex flex-col px-6 pt-6 overflow-y-auto scrollbar-hide">
          <div className="mb-8 text-center flex flex-col items-center flex-shrink-0">
            <span className="text-[10px] font-[802] text-[#94A3B8] uppercase tracking-[0.2em] mb-2" style={S.dmSans}>Enter Amount</span>
            <div className="flex items-center justify-center gap-2 flex-wrap min-h-[64px]">
              <span className="text-[28px] font-[800] text-[#CBD5E1]" style={S.sora}>{currObj.symbol}</span>
              <motion.span key={amountStr} initial={{ scale: 0.95 }} animate={{ scale: 1 }} 
                className={`font-[900] text-black tracking-tighter leading-none transition-all ${amountStr.length > 8 ? 'text-[36px]' : 'text-[56px]'}`} style={S.sora}>
=======
    // Logic for Step Routing:
    // If it's a payment QR, stay on Step 1 to confirm amount
    // If it's a barcode or bill, jump to Step 2 for details
    if (type === 'payment') {
      setStep(1)
    } else {
      setStep(2)
    }

    clearScannedData() // Clear after consumption
  }, [scannedData])

  const safeEval = (str) => {
    try {
      return Function(`'use strict'; return (${str.replace(/[^-()\d/*+.]/g, '')})`)();
    } catch (e) {
      return parseFloat(str) || 0;
    }
  };

  const currentAmount = useMemo(() => {
    const base = safeEval(amountStr);
    const withGst = base + (base * (gstPercent / 100));
    const withTip = withGst + tipAmount;
    return withTip;
  }, [amountStr, gstPercent, tipAmount]);

  const handleType = (val) => {
    if (amountStr === '0' && !['+', '-', '*', '/', '.'].includes(val)) {
      setAmountStr(val);
      return;
    }
    setAmountStr(amountStr + val);
  };

  const handleDeleteChar = () => {
    if (amountStr.length <= 1) setAmountStr('0');
    else setAmountStr(amountStr.slice(0, -1));
  };

  const getExpenseData = (finalType = null) => ({
    type: finalType || type,
    amount: currentAmount / splitCount, 
    originalAmount: currentAmount,
    currency,
    category,
    shopName: productName || shopName || getCategoryById(category).name,
    note,
    date: new Date(dateStr).toISOString(),
    paymentMethod: paymentTab === 'cash' ? 'CASH' : (paymentTab === 'bank' ? paymentMethod : 'OTHER'),
    metadata: {
      productBarcode,
      gstPercent,
      tipAmount,
      splitCount,
      paymentDetails,
      paymentTab,
      bankId: paymentTab === 'bank' ? selectedBankId : null
    }
  });

  const handleCashPayment = async (paymentData) => {
    try {
      setSaving(true);
      const expenseData = getExpenseData('spent');
      
      let savedId;
      if (editId) {
        await updateExpense(editId, expenseData);
        savedId = editId;
      } else {
        // 1. Save expense first
        savedId = await addExpense(expenseData);
        
        // 2. Deduct physical notes (only on new payment)
        await deductCashNotes(paymentData.notesGiven);
        
        // 3. Add back change notes
        if (paymentData.changeAmount > 0) {
          const { cashWallet, updateCashWallet } = useWalletStore.getState();
          const newNotes = { ...(cashWallet.notes || {}) };
          Object.entries(paymentData.changeNotes).forEach(([note, count]) => {
            newNotes[note] = (newNotes[note] || 0) + count;
          });
          await updateCashWallet(newNotes);
        }

        // 4. Save transaction record
        await walletTransactionService.add({
          expenseId: savedId,
          walletType: "cash",
          amount: expenseData.amount,
          transactionType: 'debit',
          notesUsed: {
            given: paymentData.notesGiven,
            change: paymentData.changeNotes
          }
        });
      }

      if (historyId) {
        await markScanAsAdded(historyId);
      }

      // Learn from this habit (Offline AI)
      await learnFromExpense(expenseData);

      setSaving(false);
      navigate(-1);
      setToast({ 
        id: Date.now(), 
        message: editId ? 'Expense updated successfully.' : `Paid ${formatMoney(expenseData.amount, currency)} cash.`, 
        type: 'success' 
      });
    } catch (err) {
      console.error(err);
      setSaving(false);
      setToast({ id: Date.now(), message: 'Payment failed', type: 'error' });
    }
  };

  const handleSave = async (finalType) => {
    const expenseData = getExpenseData(finalType);
    if (!expenseData.amount || expenseData.amount <= 0) return;
    
    setSaving(true);
    let savedId;
    if (editId) {
      await updateExpense(editId, expenseData);
      savedId = editId;
    } else {
      savedId = await addExpense(expenseData);
    }

    if (historyId) {
      await markScanAsAdded(historyId);
    }

    // Deduct from wallet if not cash (cash handled by SmartCashPanel)
    if (paymentTab === 'bank' && selectedBankId) {
      await deductFromBank(savedId, selectedBankId, expenseData.amount);
    }

    // Learn from this experiment (Offline AI)
    await learnFromExpense(expenseData);

    // Auto-learn: barcode was scanned but wasn't in any DB → teach it for next time
    if (productBarcode && scannedSource === null && !editId) {
      const nameToLearn = productName || shopName
      if (nameToLearn) {
        try {
          await saveLearnedBarcode(productBarcode, nameToLearn, expenseData.amount)
          setSaving(false)
          setToast({ id: Date.now(), message: 'Product saved! Next scan will auto-fill 🎉', type: 'success' })
          setTimeout(() => navigate(-1), 2000)
          return
        } catch (e) {
          console.warn('[AddExpense] Failed to save learned barcode:', e)
        }
      }
    }

    setSaving(false);
    navigate(-1);
  };

  // -- Sub-Components (Step 1)
  const CalcTool = () => {
    if (!activeCalcTool) return null;
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#F1F5F9] mb-4">
        {activeCalcTool === 'gst' && (
          <div className="flex flex-col gap-3">
             <div className="flex items-center justify-between">
                <span className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-wider">GST Percentage</span>
                <span className="text-[14px] font-[900] text-black">+{formatMoney(safeEval(amountStr) * (gstPercent/100), currency)}</span>
             </div>
             <div className="flex gap-2">
                {[0, 5, 12, 18, 28].map(p => (
                  <button key={p} onClick={() => setGstPercent(p)}
                    className={`flex-1 py-3 rounded-xl text-[12px] font-[800] border transition-all ${gstPercent === p ? 'bg-black text-white border-black shadow-lg' : 'bg-white text-black border-[#F1F5F9]'}`}>
                    {p}%
                  </button>
                ))}
             </div>
          </div>
        )}
        {activeCalcTool === 'tip' && (
          <div className="flex flex-col gap-3">
             <div className="flex items-center justify-between">
                <span className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-wider">Add Tip</span>
                <span className="text-[14px] font-[900] text-black">Total: {formatMoney(currentAmount, currency)}</span>
             </div>
             <div className="grid grid-cols-4 gap-2">
                {[0, 20, 50, 100].map(tip => (
                  <button key={tip} onClick={() => setTipAmount(tip)}
                    className={`py-3 rounded-xl text-[12px] font-[800] border ${tipAmount === tip ? 'bg-black text-white border-black shadow-lg' : 'bg-white text-black border-[#F1F5F9]'}`}>
                    ₹{tip}
                  </button>
                ))}
             </div>
          </div>
        )}
      </motion.div>
    );
  };

  // -- Render
  if (step === 1) {
    return (
      <div className="h-dvh flex flex-col bg-white overflow-hidden safe-top">
        <header className="px-6 pt-8 pb-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full border border-[#F1F5F9] flex items-center justify-center"><ChevronLeft className="w-6 h-6" /></button>
          <div className="flex bg-[#F8FAFC] p-1 rounded-full border border-[#F1F5F9]">
            <button className="px-6 py-2 bg-white rounded-full text-[12px] font-[800] shadow-sm tracking-tight" style={S}>Entry Amount</button>
            <button ref={scanToggleRef} onClick={() => navigate('/scans')} className="px-6 py-2 text-[12px] font-[800] text-[#94A3B8] flex items-center gap-2 tracking-tight" style={S}><ScanBarcode className="w-4 h-4" /> Scan</button>
          </div>
        </header>

        <main className="flex-1 flex flex-col px-6 pt-6 overflow-y-auto overflow-x-hidden">
          <div ref={amountRef} className="mb-8 text-center flex flex-col items-center flex-shrink-0">
            <span className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-[0.2em] mb-2">Enter Amount</span>
            <div className="flex items-center justify-center gap-2 flex-wrap min-h-[64px]">
              <span className="text-[28px] font-[800] text-[#CBD5E1]">{currObj.symbol}</span>
              <motion.span key={amountStr} initial={{ scale: 0.95 }} animate={{ scale: 1 }} 
                className={`font-[900] text-black tracking-tighter leading-none transition-all ${amountStr.length > 8 ? 'text-[36px]' : 'text-[56px]'}`} style={S}>
>>>>>>> 41f113d (upgrade scanner)
                {amountStr}
              </motion.span>
            </div>
            
            {(/[/*+\-]/.test(amountStr) || gstPercent > 0 || tipAmount > 0) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
<<<<<<< HEAD
                className="mt-4 px-5 py-2.5 bg-black text-white rounded-2xl text-[16px] font-[900] shadow-xl shadow-black/10 flex items-center gap-3" style={S.dmSans}>
                <span className="text-[10px] font-[802] opacity-50 uppercase tracking-widest">Result</span>
                <span style={S.sora}>{formatMoney(currentAmount, currency)}</span>
=======
                className="mt-4 px-5 py-2.5 bg-black text-white rounded-2xl text-[16px] font-[900] shadow-xl shadow-black/10 flex items-center gap-3">
                <span className="text-[10px] font-[800] opacity-50 uppercase tracking-widest">Result</span>
                <span>{formatMoney(currentAmount, currency)}</span>
>>>>>>> 41f113d (upgrade scanner)
              </motion.div>
            )}
          </div>

          <div className="mt-auto">
<<<<<<< HEAD
             <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#F1F5F9] mb-4 h-24 flex items-center justify-center">
                {activeCalcTool ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
                    {activeCalcTool === 'gst' && (
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-[11px] font-[802] text-slate-400 uppercase tracking-widest mb-1 px-1">
                          <span>Apply GST</span>
                          <span className="text-black" style={S.sora}>+{formatMoney(safeEval(amountStr) * (gstPercent/100), currency)}</span>
                        </div>
                        <div className="flex gap-2">
                          {[0, 5, 12, 18, 28].map(p => (
                            <button key={p} onClick={() => setGstPercent(p)}
                              className={`flex-1 py-2.5 rounded-xl text-[12px] font-[802] border transition-all ${gstPercent === p ? 'bg-black text-white border-black' : 'bg-white text-black border-[#F1F5F9]'}`}>
                               {p}%
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {activeCalcTool === 'tip' && (
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-[11px] font-[802] text-slate-400 uppercase tracking-widest mb-1 px-1">
                          <span>Add Tip</span>
                          <span className="text-black" style={S.sora}>Total: {formatMoney(currentAmount, currency)}</span>
                        </div>
                        <div className="flex gap-2">
                          {[0, 20, 50, 100].map(tip => (
                            <button key={tip} onClick={() => setTipAmount(tip)}
                              className={`flex-1 py-2.5 rounded-xl text-[12px] font-[802] border transition-all ${tipAmount === tip ? 'bg-black text-white border-black' : 'bg-white text-black border-[#F1F5F9]'}`}>
                               ₹{tip}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <p className="text-[11px] font-[802] text-[#CBD5E1] uppercase tracking-[0.2em]">Calculator Active</p>
                )}
             </div>

             <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setActiveCalcTool(activeCalcTool === 'gst' ? null : 'gst')} 
                  className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-[11px] font-[802] border transition-all ${activeCalcTool === 'gst' ? 'bg-black text-white border-black shadow-lg' : 'bg-white text-black border-[#F1F5F9]'}`} style={S.dmSans}>
                  <Percent className="w-4 h-4" /> GST
                </button>
                <button onClick={() => setActiveCalcTool(activeCalcTool === 'tip' ? null : 'tip')}
                  className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-[11px] font-[802] border transition-all ${activeCalcTool === 'tip' ? 'bg-black text-white border-black shadow-lg' : 'bg-white text-black border-[#F1F5F9]'}`} style={S.dmSans}>
                  <DollarSign className="w-4 h-4" strokeWidth={3} /> Tip
                </button>
             </div>

             <div className="grid grid-cols-4 gap-2.5 pb-8">
                {['7','8','9','/','4','5','6','*','1','2','3','-','.', '0', 'del', '+'].map(k => (
                  <motion.button key={k} whileTap={{ scale: 0.9 }} onClick={() => k === 'del' ? handleDeleteChar() : handleType(k)}
                    className={`h-14 rounded-2xl text-[20px] font-[800] flex items-center justify-center active:bg-slate-50 border ${['/','*','-','+','del'].includes(k) ? 'bg-[#F8FAFC] border-[#EDF2F7] text-slate-400' : 'bg-white border-[#F1F5F9] text-black'}`} style={S.sora}>
                    {k === 'del' ? <RotateCcw className="w-5 h-5" strokeWidth={3} /> : k}
=======
             <CalcTool />
             <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setActiveCalcTool(activeCalcTool === 'gst' ? null : 'gst')} 
                  className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-[11px] font-[800] border transition-all ${activeCalcTool === 'gst' ? 'bg-black text-white border-black' : 'bg-white text-black border-[#F1F5F9]'}`} style={S}>
                  <Percent className="w-4 h-4" /> GST
                </button>
                <button onClick={() => setActiveCalcTool(activeCalcTool === 'tip' ? null : 'tip')}
                  className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-[11px] font-[800] border transition-all ${activeCalcTool === 'tip' ? 'bg-black text-white border-black' : 'bg-white text-black border-[#F1F5F9]'}`} style={S}>
                  <DollarSign className="w-4 h-4" /> Tip
                </button>
             </div>

             <div className="grid grid-cols-4 gap-2 pb-6">
                {['7','8','9','/','4','5','6','*','1','2','3','-','.', '0', 'del', '+'].map(k => (
                  <motion.button key={k} whileTap={{ scale: 0.9 }} onClick={() => k === 'del' ? handleDeleteChar() : handleType(k)}
                    className="h-14 rounded-xl bg-white border border-[#F1F5F9] text-[18px] font-[700] flex items-center justify-center active:bg-slate-50">
                    {k === 'del' ? <RotateCcw className="w-4 h-4" /> : k}
>>>>>>> 41f113d (upgrade scanner)
                  </motion.button>
                ))}
                
                <motion.button whileTap={{ scale: 0.98 }} onClick={() => setStep(2)}
<<<<<<< HEAD
                  className="col-span-4 mt-2 h-16 bg-black text-white rounded-2xl font-[900] text-[15px] flex items-center justify-center gap-3 uppercase tracking-widest shadow-2xl shadow-black/20">
                  Select Details <ArrowRight className="w-5 h-5 text-slate-400" strokeWidth={3} />
=======
                  className="col-span-4 mt-2 h-14 bg-black text-white rounded-xl font-[900] text-[14px] flex items-center justify-center gap-3 uppercase tracking-widest shadow-xl">
                  Next <ArrowRight className="w-4 h-4 text-white/50" />
>>>>>>> 41f113d (upgrade scanner)
                </motion.button>
             </div>
          </div>
        </main>
<<<<<<< HEAD
      </div>
    );
  }

  // -- Render Step 2
  if (step === 2 && !scanning) {
    const activeBank = bankAccounts.find(b => b.id === selectedBankId)
    const isInsufficientBank = paymentType === 'bank' && activeBank && currentAmount > activeBank.balance
    
    return (
      <div className="h-dvh flex flex-col bg-[#F9FBFF] overflow-hidden safe-top">
        <header className="px-6 pt-8 pb-4 flex items-center justify-between border-b border-slate-100 bg-white">
          <button onClick={() => setStep(1)} className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center transition-all bg-[#F8FAFC] active:scale-95"><ChevronLeft className="w-6 h-6" strokeWidth={3} /></button>
          <div className="text-center">
            <h1 className="text-[17px] font-[900] text-black tracking-tight" style={S.dmSans}>Finalize Expense</h1>
            <div className="flex items-center gap-1.5 justify-center mt-1">
              <div className="w-3 h-1 bg-black rounded-full" />
              <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
            </div>
          </div>
          <div className="w-12" />
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
          {/* Amount Card */}
          <motion.div whileTap={{ scale: 0.98 }} onClick={() => setStep(1)}
            className="w-full bg-slate-900 text-white p-8 rounded-[40px] mb-8 relative overflow-hidden group shadow-2xl shadow-slate-900/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <span className="text-[10px] font-[900] uppercase tracking-[0.3em] text-slate-500 mb-2 block" style={S.dmSans}>Settlement Total</span>
            <div className="flex items-baseline gap-2">
              <span className="text-[24px] font-[800] text-slate-400" style={S.sora}>{currObj.symbol}</span>
              <span className="text-[52px] font-[900] tracking-tighter leading-none" style={S.sora}>{currentAmount.toLocaleString()}</span>
            </div>
            
            <div className="mt-6 flex items-center gap-3">
              <div className="flex -space-x-2">
                 {[...Array(Math.min(splitCount, 3))].map((_, i) => (
                   <div key={i} className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                   </div>
                 ))}
                 {splitCount > 3 && <div className="w-7 h-7 rounded-full bg-black border-2 border-slate-900 flex items-center justify-center text-[9px] font-[900]">+{splitCount-3}</div>}
              </div>
              <span className="text-[11px] font-[802] text-slate-400 uppercase tracking-widest" style={S.dmSans}>
                {splitCount > 1 ? `${formatMoney(currentAmount / splitCount, currency)} / each` : 'Personal Entry'}
              </span>
            </div>
          </motion.div>

          <div className="space-y-10">
            {/* Category selection */}
            <div>
              <div className="flex items-center justify-between mb-4 px-1">
                <label className="text-[11px] font-[900] text-black uppercase tracking-[0.2em] opacity-50" style={S.dmSans}>Category</label>
                <button onClick={() => setShowCategories(true)} className="text-[10px] font-[900] text-black uppercase tracking-widest" style={S.dmSans}>Full List</button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                 {[...CATEGORIES.slice(0, 3)].map(cat => (
                   <button key={cat.id} onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-3xl border transition-all ${category === cat.id ? 'bg-black text-white border-black shadow-xl' : 'bg-white border-slate-100 active:bg-slate-50'}`}>
                    <span className="text-2xl mb-1">{cat.emoji}</span>
                    <span className="text-[10px] font-[900] truncate w-full text-center uppercase tracking-tighter text-slate-400" style={S.dmSans}>{cat.name}</span>
                   </button>
                 ))}
                 <button onClick={() => setCategory('other')}
                  className={`flex flex-col items-center justify-center p-4 rounded-3xl border transition-all ${category === 'other' ? 'bg-black text-white border-black shadow-xl' : 'bg-white border-slate-100'}`}>
                    <span className="text-2xl mb-1">✨</span>
                    <span className="text-[10px] font-[900] uppercase tracking-tighter text-slate-400" style={S.dmSans}>Other</span>
                 </button>
              </div>
            </div>

            {/* Merchant Area */}
            <div className="space-y-4">
               <label className="text-[11px] font-[900] text-black uppercase tracking-[0.2em] opacity-50 px-1" style={S.dmSans}>Merchant / Product</label>
               <div className="bg-white p-6 rounded-[36px] border border-slate-100 shadow-sm space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-black" />
                    </div>
                    <input value={productName || shopName} onChange={e => setShopName(e.target.value)} 
                        placeholder="Where did you spend?" className="flex-1 bg-transparent text-[16px] font-[802] outline-none" style={S.dmSans} />
                  </div>
                  {productBarcode && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full w-fit">
                      <ScanBarcode className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] font-[802] text-slate-400 uppercase tracking-widest">{productBarcode}</span>
                    </div>
                  )}
               </div>
            </div>

            {/* PAYMENT METHOD SECTION */}
            <div className="space-y-5">
               <label className="text-[11px] font-[900] text-black uppercase tracking-[0.2em] opacity-50 px-1" style={S.dmSans}>Settlement Method</label>
               
               {/* Tabs */}
                <div className="flex bg-[#F1F5F9] p-1.5 rounded-[24px] gap-1">
                   {['cash', 'bank', 'other'].map(t => (
                     <button key={t} onClick={() => setPaymentType(t)}
                       className={`flex-1 py-3 rounded-[20px] text-[10px] font-[950] uppercase tracking-[0.2em] transition-all ${paymentType === t ? 'bg-black text-white shadow-xl shadow-black/10' : 'text-[#94A3B8]'}`} style={S.dmSans}>
                       {t}
                     </button>
                   ))}
                </div>

               <AnimatePresence mode="wait">
                  {paymentType === 'cash' && (
                    <motion.div key="cash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <SmartCashPanel 
                          expenseAmount={currentAmount}
                          userNotes={cashWallet?.notes || {}}
                          currency={currency}
                          onPaymentConfirmed={(paymentData) => {
                            handleSave('spent', paymentData);
                          }}
                        />
                    </motion.div>
                  )}

                  {paymentType === 'bank' && (
                    <motion.div key="bank" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                       <div className="flex gap-4 overflow-x-auto py-4 scrollbar-hide px-1">
                          {bankAccounts.map(acc => (
                            <button key={acc.id} onClick={() => setSelectedBankId(acc.id)}
                              className={`flex-shrink-0 w-44 p-6 rounded-[32px] border transition-all relative text-left ${selectedBankId === acc.id ? 'border-2 border-black bg-white shadow-2xl shadow-black/5 scale-[1.05]' : 'bg-white border-[#F1F5F9] opacity-60'}`}>
                               <div className="w-12 h-12 rounded-2xl mb-4 flex items-center justify-center text-white shadow-lg shadow-black/5" style={{ backgroundColor: acc.bankColor || '#000000' }}>
                                  <Landmark className="w-6 h-6" />
                               </div>
                               <div className="space-y-0.5">
                                 <p className="text-[14px] font-[950] text-black truncate" style={S.dmSans}>{acc.bankName}</p>
                                 <p className="text-[11px] font-[900] text-[#AFAFAF] uppercase tracking-widest" style={S.dmSans}>{acc.accountNickname || 'Bank Account'}</p>
                                 <p className="text-[17px] font-[900] text-black pt-2 tracking-tighter" style={S.sora}>{currency}{acc.balance?.toLocaleString()}</p>
                               </div>
                               
                               {selectedBankId === acc.id && (
                                 <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute top-6 right-6 w-7 h-7 bg-black rounded-full flex items-center justify-center shadow-xl shadow-black/20">
                                   <Check className="w-4 h-4 text-white" strokeWidth={4} />
                                 </motion.div>
                               )}
                            </button>
                          ))}
                       </div>

                       {selectedBankId && (
                         <div className="bg-white p-7 rounded-[36px] border border-[#EEEEEE] shadow-sm">
                            <div className="flex justify-between items-center mb-5">
                               <p className="text-[10px] font-[950] text-[#AFAFAF] uppercase tracking-[0.2em]" style={S.dmSans}>Payment Mode</p>
                               {isInsufficientBank && <span className="text-[10px] font-[950] text-red-500 uppercase tracking-widest flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Insufficient</span>}
                            </div>
                            <div className="flex gap-2">
                               {['upi', 'netbanking', 'debit'].map(m => (
                                 <button key={m} onClick={() => setBankTxType(m)}
                                   className={`flex-1 py-4 rounded-2xl border text-[10px] font-[950] uppercase tracking-widest transition-all ${bankTxType === m ? 'bg-black text-white border-black shadow-xl shadow-black/10' : 'bg-[#F8FAFC] text-[#94A3B8] border-transparent'}`} style={S.dmSans}>
                                   {m}
                                 </button>
                               ))}
                            </div>
                         </div>
                       )}
                    </motion.div>
                  )}

                  {paymentType === 'other' && (
                    <motion.div key="other" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} 
                      className="bg-slate-900/5 p-8 rounded-[32px] border border-dashed border-slate-200 text-center">
                       <Info className="w-6 h-6 text-slate-300 mx-auto mb-3" />
                       <p className="text-[13px] font-[700] text-slate-400 leading-relaxed" style={S.dmSans}>This expense will not be tracked<br/>against your wallet or bank balance.</p>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>

            {/* Split Section */}
            <div className="pt-4 space-y-4 pb-10">
               <div className="flex items-center justify-between px-2">
                 <label className="text-[11px] font-[900] text-black uppercase tracking-[0.2em] opacity-50" style={S.dmSans}>Settlement Split</label>
                 {splitCount > 1 && (
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => {/* WA logic */}}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white rounded-full text-[10px] font-[950] uppercase tracking-widest shadow-lg shadow-green-500/30">
                      <MessageCircle className="w-4 h-4 fill-white" /> WhatsApp Share
                    </motion.button>
                 )}
               </div>
               <div className="bg-white p-7 rounded-[40px] border border-[#EEEEEE] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex items-center justify-between">
                  <div className="flex items-center gap-5">
                     <div className="w-16 h-16 bg-black rounded-[24px] flex items-center justify-center shadow-xl shadow-black/5">
                        <Users className="w-7 h-7 text-white" strokeWidth={2.5} />
                     </div>
                     <div>
                        <p className="text-[20px] font-[900] text-black tracking-tighter" style={S.sora}>{splitCount} People</p>
                        <p className="text-[11px] font-[950] text-[#AFAFAF] uppercase tracking-[0.1em]" style={S.dmSans}>{formatMoney(currentAmount / splitCount, currency)} each</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button onClick={() => setSplitCount(Math.max(1, splitCount - 1))} className="w-12 h-12 rounded-2xl bg-[#F8FAFC] border border-[#F1F5F9] flex items-center justify-center active:scale-90"><Minus className="w-5 h-5 text-black" /></button>
                    <button onClick={() => setSplitCount(splitCount + 1)} className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl active:scale-90"><Plus className="w-5 h-5 text-white" /></button>
                  </div>
               </div>
            </div>
          </div>
        </main>

        {/* Footer for non-cash modes */}
        {paymentType !== 'cash' && (
          <div className="px-6 pb-12 pt-8 border-t border-[#F1F5F9] bg-white/80 backdrop-blur-xl">
            <div className="flex gap-4">
               <motion.button disabled={saving} whileTap={{ scale: 0.96 }} onClick={() => handleSave('received')}
                className="flex-1 h-18 py-5 bg-[#10B981] text-white rounded-[32px] font-[950] text-[14px] shadow-[0_12px_32px_rgba(16,185,129,0.3)] uppercase tracking-[0.2em] flex items-center justify-center gap-2 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all" style={S.dmSans}>
                 Income
               </motion.button>
               <motion.button disabled={saving || isInsufficientBank} whileTap={{ scale: 0.96 }} onClick={() => handleSave('spent')}
                className={`flex-1 h-18 py-5 rounded-[32px] font-[950] text-[14px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all border-b-4 active:border-b-0 active:translate-y-1 ${saving || isInsufficientBank ? 'bg-slate-100 text-slate-300 border-b-slate-200' : 'bg-[#EF4444] text-white shadow-[0_12px_32px_rgba(239,68,68,0.3)] border-b-red-700'}`} style={S.dmSans}>
                 {saving ? 'Saving...' : 'Spent'}
               </motion.button>
            </div>
          </div>
        )}

        {/* Categories Bottom Sheet */}
        <AnimatePresence>
          {showCategories && (
            <div className="fixed inset-0 z-[100] bg-black/40" onClick={() => setShowCategories(false)}>
               <motion.div initial={{ y: '100%', x: '-50%' }} animate={{ y: 0, x: '-50%' }} exit={{ y: '100%', x: '-50%' }}
                 onClick={e => e.stopPropagation()}
                 className="fixed bottom-0 left-1/2 w-full max-w-[450px] bg-white rounded-t-[40px] p-8 max-h-[85vh] overflow-y-auto z-[101]">
                 <div className="w-12 h-1.5 bg-[#F1F5F9] rounded-full mx-auto mb-8" />
                 <h3 className="text-[20px] font-[800] text-black mb-8 px-2" style={S.dmSans}>All Categories</h3>
                 <div className="grid grid-cols-4 gap-4">
                    {CATEGORIES.map(cat => (
                       <button key={cat.id} onClick={() => { setCategory(cat.id); setShowCategories(false) }}
                        className={`flex flex-col items-center justify-center p-4 rounded-3xl border transition-all ${category === cat.id ? 'bg-black text-white border-black shadow-xl' : 'bg-[#F8FAFC] border-[#F1F5F9]'}`}>
                         <span className="text-2xl mb-2">{cat.emoji}</span>
                         <span className="text-[10px] font-[950] uppercase tracking-tighter text-center">{cat.name}</span>
                       </button>
                    ))}
                 </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showDatePicker && (
            <div className="fixed inset-0 z-[200]">
              <Suspense fallback={null}>
                <CustomDatePicker value={dateStr} onChange={setDateStr} onClose={() => setShowDatePicker(false)} />
              </Suspense>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
}
=======
        <ToastMessage toast={toast} onClose={() => setToast(null)} />
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="h-dvh flex flex-col bg-white overflow-hidden safe-top">
        <header className="px-6 pt-8 pb-4 flex items-center justify-between border-b border-[#F1F5F9]">
          <button onClick={() => setStep(1)} className="w-12 h-12 rounded-full border border-[#F1F5F9] flex items-center justify-center transition-all bg-[#F8FAFC]"><ChevronLeft className="w-6 h-6" /></button>
          <div className="text-center">
            <h1 className="text-[17px] font-[800] text-black tracking-tight" style={S}>Details Entry</h1>
            <div className="flex items-center gap-1.5 justify-center mt-0.5 opacity-50">
              <div className="w-3 h-1 bg-black rounded-full" />
              <div className="w-1.5 h-1.5 bg-black rounded-full" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
          <motion.button ref={detailsAmountRef} whileTap={{ scale: 0.98 }} onClick={() => setStep(1)}
            className={`w-full bg-black text-white p-8 rounded-[36px] mb-4 relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col items-center transition-all ${
              productBarcode && currentAmount === 0 ? 'ring-2 ring-white/20 shadow-black/10' : ''
            }`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/10 transition-all" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 blur-2xl opacity-30" />
            <span className="text-[10px] font-[900] uppercase tracking-[0.3em] text-white/30 mb-3 block text-center">Premium Settlement</span>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-[24px] font-[800] text-white/60 leading-none">{currObj.symbol}</span>
              <span className="text-[52px] font-[900] tracking-tighter leading-none" style={S}>{currentAmount.toLocaleString()}</span>
            </div>
            {productBarcode && currentAmount === 0 && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-[10px] font-[800] text-white/50 uppercase tracking-[0.2em] mt-3" style={S}>
                Tap to enter price ↑
              </motion.p>
            )}
          </motion.button>

          <AnimatePresence>
            {scannedSource && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-[11px] font-[800] mb-4 ${
                  scannedSource === 'learned'
                    ? 'bg-neutral-100 text-black border-neutral-200'
                    : scannedSource === 'online'
                    ? 'bg-neutral-50 text-black border-neutral-200'
                    : scannedSource === 'bill'
                    ? 'bg-neutral-100 text-black border-neutral-200'
                    : 'bg-slate-50 text-slate-500 border-slate-100'
                }`}>
                <Check className="w-3 h-3" />
                {scannedSource === 'learned' && '✓ Your saved product'}
                {(scannedSource === 'offline' || scannedSource === 'cached') && '✓ Found offline'}
                {scannedSource === 'online' && '✓ Found online'}
                {scannedSource === 'bill' && '📷 Scanned from bill'}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-8">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <label className="text-[11px] font-[900] text-black uppercase tracking-[0.2em] ml-2 mb-3 block opacity-80">
                {productBarcode ? 'Product Name' : 'Shop / Reference'}
              </label>
              <div ref={shopInputRef} className={`bg-white p-5 rounded-[32px] border shadow-sm flex items-center gap-4 transition-all duration-300 ${
                productBarcode && scannedSource === null && !(productName || shopName)
                  ? 'border-black/30 shadow-black/10 ring-2 ring-black/10'
                  : 'border-[#F1F5F9]'
              }`}>
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  value={productName || shopName}
                  onChange={e => { setProductName(e.target.value); setShopName(e.target.value) }}
                  placeholder={
                    productBarcode && scannedSource === null
                      ? 'Enter product name'
                      : 'Shop or product name...'
                  }
                  className="flex-1 bg-transparent text-[15px] font-[700] outline-none text-black placeholder:text-slate-300"
                  style={S}
                />
              </div>
              {productBarcode && scannedSource === null && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] font-[700] text-black/60 ml-2 mt-2 flex items-center gap-1.5" style={S}>
                  🧠 We'll remember this for next time
                </motion.p>
              )}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-end justify-between px-2 mb-4">
                <label className="text-[11px] font-[900] text-black uppercase tracking-[0.2em] opacity-80">Category</label>
                <button onClick={() => setShowCategories(true)} className="text-[10px] font-[900] text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">Full List <ChevronDown className="w-3 h-3" /></button>
              </div>
              <div ref={catGridRef} className="grid grid-cols-4 gap-2.5">
                 {[...CATEGORIES.slice(0, 3)].map(cat => (
                   <button key={cat.id} onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-[28px] border transition-all duration-300 ${category === cat.id ? 'bg-black text-white border-black shadow-[0_15px_30px_rgba(0,0,0,0.1)] scale-105' : 'bg-white text-black border-[#F1F5F9] active:bg-slate-50'}`}>
                    <span className="text-2xl mb-2">{cat.emoji}</span>
                    <span className="text-[10px] font-[900] truncate w-full text-center uppercase tracking-tighter opacity-70">{cat.name}</span>
                   </button>
                 ))}
                 <button onClick={() => setCategory('other')}
                  className={`flex flex-col items-center justify-center p-4 rounded-[28px] border transition-all duration-300 ${category === 'other' ? 'bg-black text-white border-black shadow-xl scale-105' : 'bg-white text-black border-[#F1F5F9]'}`}>
                    <span className="text-2xl mb-1">✨</span>
                    <span className="text-[10px] font-[900] uppercase tracking-tighter opacity-70">Other</span>
                 </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-[900] text-black uppercase tracking-[0.2em] ml-2 block opacity-80">Reference Notes</label>
              <div className="bg-white p-6 rounded-[36px] border border-[#F1F5F9] shadow-inner">
                <textarea value={note} onChange={e => setNote(e.target.value)} 
                  placeholder="Optional details..." rows={2}
                  className="w-full bg-transparent text-[15px] font-[600] outline-none resize-none leading-relaxed text-slate-600 placeholder:text-slate-300" style={S} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
               <div className="bg-white p-5 rounded-[32px] border border-[#F1F5F9] shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all" onClick={() => setShowDatePicker(true)}>
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center transition-colors group-active:bg-indigo-100">
                      <Clock className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-[11px] font-[900] text-gray-400 uppercase tracking-widest mb-0.5">Timeline</p>
                      <p className="text-[14px] font-[800] text-black" style={S}>{format(new Date(dateStr), 'EEEE, MMMM dd • HH:mm')}</p>
                    </div>
                  </div>
                  <Calendar className="w-5 h-5 text-gray-300" />
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <label className="text-[11px] font-[900] text-black uppercase tracking-[0.2em] opacity-80">Payment Method</label>
                  </div>
                  
                  <div ref={paymentRef} className="bg-[#F8FAFC] p-1.5 rounded-3xl border border-[#F1F5F9] flex">
                    {['cash', 'bank', 'other'].map(tab => (
                      <button key={tab} onClick={() => setPaymentTab(tab)}
                        className={`flex-1 py-3.5 rounded-[22px] text-[12px] font-[900] uppercase tracking-widest transition-all ${paymentTab === tab ? 'bg-black text-white shadow-xl' : 'text-[#94A3B8]'}`}>
                        {tab}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {paymentTab === 'cash' && (
                      <motion.div key="cash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="py-2">
                        <SmartCashPanel 
                          expenseAmount={currentAmount}
                          userNotes={cashWallet?.notes || {}}
                          currency={currency}
                          onPaymentConfirmed={handleCashPayment}
                        />
                      </motion.div>
                    )}

                    {paymentTab === 'bank' && (
                      <motion.div key="bank" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-4">
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
                           {bankAccounts.map(acc => (
                             <button key={acc.id} onClick={() => setSelectedBankId(acc.id)}
                               className={`min-w-[160px] p-5 rounded-[28px] border-2 transition-all flex flex-col items-start gap-3 flex-shrink-0 ${selectedBankId === acc.id ? 'border-indigo-600 bg-indigo-50/10' : 'border-transparent bg-white shadow-sm'}`}>
                               <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: acc.bankColor }}>
                                 <Landmark className="w-5 h-5" />
                               </div>
                               <div className="text-left">
                                  <p className="text-[14px] font-[800] text-black truncate w-full">{acc.bankName}</p>
                                  <p className="text-[11px] font-[700] text-[#AFAFAF] uppercase tracking-widest">{formatMoney(acc.balance, currency)}</p>
                               </div>
                               {acc.balance < currentAmount && selectedBankId === acc.id && (
                                 <div className="mt-1 text-[8px] font-[900] text-red-500 uppercase tracking-widest bg-red-50 px-2 py-1 rounded-full">Insufficient Balance</div>
                               )}
                             </button>
                           ))}
                           <button onClick={() => navigate('/bank-accounts')} className="min-w-[120px] rounded-[28px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400">
                             <Plus className="w-5 h-5" />
                             <span className="text-[10px] font-[900] uppercase tracking-widest">Add Bank</span>
                           </button>
                        </div>
                        
                        <div className="bg-white p-5 rounded-[32px] border border-[#F1F5F9] shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all" onClick={() => setShowPaymentPicker(true)}>
                            <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                                <Smartphone className="w-5 h-5 text-indigo-600" />
                              </div>
                              <div>
                                <p className="text-[11px] font-[900] text-gray-400 uppercase tracking-widest mb-0.5">Payment Method</p>
                                <p className="text-[14px] font-[800] text-black">{PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label || paymentMethod}</p>
                              </div>
                            </div>
                            <ChevronDown className="w-5 h-5 text-gray-300" />
                        </div>
                      </motion.div>
                    )}

                    {paymentTab === 'other' && (
                      <motion.div key="other" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="bg-slate-100 p-8 rounded-[36px] border border-slate-200 border-dashed text-center">
                        <Info className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                        <p className="text-[13px] font-[700] text-slate-500 leading-relaxed">This expense won't be tracked against your wallets. Your balance will remain unchanged.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
            </div>
          </div>
        </main>

        {paymentTab !== 'cash' && (
          <div className="px-6 pb-12 pt-4 border-t border-[#F1F5F9] bg-white">
            <div ref={saveActionsRef} className="flex gap-4">
               <motion.button whileTap={{ scale: 0.96 }} onClick={() => handleSave('received')}
                className="flex-1 h-16 bg-[#22C55E] text-white rounded-[24px] font-[900] text-[15px] shadow-xl uppercase tracking-widest flex items-center justify-center gap-2">
                 Income
               </motion.button>
               <motion.button whileTap={{ scale: 0.96 }} onClick={() => handleSave('spent')}
                className="flex-1 h-16 bg-[#EF4444] text-white rounded-[24px] font-[900] text-[15px] shadow-xl uppercase tracking-widest flex items-center justify-center gap-2">
                 Expense
               </motion.button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showCategories && (
            <div className="fixed inset-0 z-[100] bg-black/40" onClick={() => setShowCategories(false)}>
               <motion.div initial={{ y: '100%', x: '-50%' }} animate={{ y: 0, x: '-50%' }} exit={{ y: '100%', x: '-50%' }}
                 onClick={e => e.stopPropagation()}
                 className="fixed bottom-0 left-1/2 w-full max-w-[450px] bg-white rounded-t-[40px] p-8 max-h-[85vh] overflow-y-auto z-[101]">
                 <div className="w-12 h-1.5 bg-[#F1F5F9] rounded-full mx-auto mb-8" />
                 <h3 className="text-[20px] font-[800] text-black mb-8 px-2" style={S}>All Categories</h3>
                 <div className="grid grid-cols-4 gap-4">
                    {CATEGORIES.map(cat => (
                       <button key={cat.id} onClick={() => { setCategory(cat.id); setShowCategories(false) }}
                        className={`flex flex-col items-center justify-center p-4 rounded-3xl border ${category === cat.id ? 'bg-black text-white border-black shadow-xl' : 'bg-[#F8FAFC] border-[#F1F5F9]'}`}>
                         <span className="text-2xl mb-2">{cat.emoji}</span>
                         <span className="text-[10px] font-[800] uppercase tracking-tighter text-center">{cat.name}</span>
                       </button>
                    ))}
                 </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showPaymentPicker && (
            <div className="fixed inset-0 z-[100] bg-black/40" onClick={() => setShowPaymentPicker(false)}>
               <motion.div initial={{ y: '100%', x: '-50%' }} animate={{ y: 0, x: '-50%' }} exit={{ y: '100%', x: '-50%' }}
                 onClick={e => e.stopPropagation()}
                 className="fixed bottom-0 left-1/2 w-full max-w-[450px] bg-white rounded-t-[40px] p-8 max-h-[85vh] overflow-y-auto z-[101]">
                 <div className="w-12 h-1.5 bg-[#F1F5F9] rounded-full mx-auto mb-8" />
                 <h3 className="text-[20px] font-[800] text-black mb-8 px-2" style={S}>Payment Method</h3>
                 <div className="grid grid-cols-1 gap-3">
                    {PAYMENT_METHODS.map(m => (
                       <button key={m.id} onClick={() => { setPaymentMethod(m.id); setShowPaymentPicker(false) }}
                        className={`flex items-center gap-4 p-5 rounded-3xl border transition-all ${paymentMethod === m.id ? 'bg-black text-white border-black shadow-xl' : 'bg-[#F8FAFC] border-[#F1F5F9]'}`}>
                         <span className="text-2xl">{m.icon}</span>
                         <span className="text-[15px] font-[800] tracking-tight">{m.label}</span>
                       </button>
                    ))}
                 </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showDatePicker && (
            <div className="fixed inset-0 z-[200]">
              <Suspense fallback={null}>
                <CustomDatePicker value={dateStr} onChange={setDateStr} onClose={() => setShowDatePicker(false)} />
              </Suspense>
            </div>
          )}
        </AnimatePresence>

        <ToastMessage toast={toast} onClose={() => setToast(null)} />
      </div>
    );
  }

  return null;
}
>>>>>>> 41f113d (upgrade scanner)
