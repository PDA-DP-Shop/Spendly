// AddExpenseScreen — Updated with intelligent Payment Method section (Cash/Bank/Other)
import { useState, useRef, lazy, Suspense, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { 
  ChevronLeft, ChevronDown, Calendar, Receipt, ScanBarcode, Check, Plus, Minus, 
  Landmark, Share2, MessageCircle, RotateCcw, Clock, Sparkles, X, Users, 
  Percent, DollarSign, ArrowRight, Wallet, History, Info, Package, QrCode,
  CreditCard, Smartphone, Globe, AlertCircle, Banknote, Calculator
} from 'lucide-react'
import { useExpenseStore } from '../store/expenseStore'
import { useSettingsStore } from '../store/settingsStore'
import { useWalletStore } from '../store/walletStore'
import { getCategoryById, CATEGORIES } from '../constants/categories'
import { guessCategory } from '../utils/guessCategory'
import { formatMoney } from '../utils/formatMoney'
import { format } from 'date-fns'
import { CURRENCIES } from '../constants/currencies'
import { lookupBarcode } from '../services/productLookup'
import CURRENCY_NOTES, { getNotesByUserCurrency } from '../constants/currencyNotes'
import SmartCashPanel from '../components/cash/SmartCashPanel'

const SmartScanner = lazy(() => import('../components/scanner/SmartScanner'))
const CustomDatePicker = lazy(() => import('../components/forms/CustomDatePicker'))

const S = {
  inter: { fontFamily: "'Inter', sans-serif" },
  sora: { fontFamily: "'Sora', sans-serif" },
  dmSans: { fontFamily: "'DM Sans', sans-serif" }
}

export default function AddExpenseScreen() {
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') || 'manual'
  const editId = searchParams.get('edit')
  const navigate = useNavigate()
  
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
  const [amountStr, setAmountStr] = useState('0')
  const [category, setCategory] = useState('other')
  const [shopName, setShopName] = useState('')
  const [productBarcode, setProductBarcode] = useState('')
  const [productName, setProductName] = useState('')
  const [note, setNote] = useState('')
  const [dateStr, setDateStr] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"))
  
  // -- Payment Method State
  const [paymentType, setPaymentType] = useState('cash') // 'cash', 'bank', 'other'
  const [selectedBankId, setSelectedBankId] = useState(null)
  const [bankTxType, setBankTxType] = useState('upi')
  const [paymentDetails, setPaymentDetails] = useState(null)
  
  // -- Advanced Calculator State
  const [gstPercent, setGstPercent] = useState(0)
  const [tipAmount, setTipAmount] = useState(0)
  const [splitCount, setSplitCount] = useState(1)
  const [activeCalcTool, setActiveCalcTool] = useState(null)
  
  // -- UI State
  const [scanning, setScanning] = useState(mode === 'scan')
  const [showCategories, setShowCategories] = useState(false)
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
    }
  };

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
                {amountStr}
              </motion.span>
            </div>
            
            {(/[/*+\-]/.test(amountStr) || gstPercent > 0 || tipAmount > 0) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="mt-4 px-5 py-2.5 bg-black text-white rounded-2xl text-[16px] font-[900] shadow-xl shadow-black/10 flex items-center gap-3" style={S.dmSans}>
                <span className="text-[10px] font-[802] opacity-50 uppercase tracking-widest">Result</span>
                <span style={S.sora}>{formatMoney(currentAmount, currency)}</span>
              </motion.div>
            )}
          </div>

          <div className="mt-auto">
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
                  </motion.button>
                ))}
                
                <motion.button whileTap={{ scale: 0.98 }} onClick={() => setStep(2)}
                  className="col-span-4 mt-2 h-16 bg-black text-white rounded-2xl font-[900] text-[15px] flex items-center justify-center gap-3 uppercase tracking-widest shadow-2xl shadow-black/20">
                  Select Details <ArrowRight className="w-5 h-5 text-slate-400" strokeWidth={3} />
                </motion.button>
             </div>
          </div>
        </main>
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
