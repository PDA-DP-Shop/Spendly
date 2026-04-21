// BillCodeEntry — Premium White design, supports alphanumeric Smart Codes
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, KeyRound, Loader2, Clipboard, Globe, CheckCircle2, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { billService } from '../services/database' // Ensure this exists
import PageGuide from '../components/shared/PageGuide'
import { usePageGuide } from '../hooks/usePageGuide'

const S = { fontFamily: "'Inter', sans-serif" }

const HAPTIC = {
  tap: { x: [0, -3, 3, -3, 3, 0], transition: { duration: 0.35 } }
}

/**
 * Tries to fetch a bill by its smart alphanumeric claim code.
 * Searches the shared local database.
 */
async function lookupBillCode(code) {
  // 1. Basic format validation
  const cleanCode = code.trim().toUpperCase();
  if (cleanCode.length !== 6) throw new Error('INVALID_FORMAT')

  // 2. Database Lookup (Simulating server-side search)
  // In a real production app, this would be an API call
  try {
    const allBills = await billService.getAll();
    const found = allBills.find(b => (b.claimCode || "").toUpperCase() === cleanCode);
    
    if (found) {
      // Simulate network delay
      await new Promise(r => setTimeout(r, 600));
      return {
        ...found,
        isSpendlyBill: true,
        source: 'spendly-shop'
      };
    }
  } catch (dbErr) {
    console.warn("DB Lookup failed, falling back to legacy gen", dbErr);
  }

<<<<<<< HEAD
  // Any 6-digit code is accepted. We use the code as a seed for variety.
  if (/^[0-9]{6}$/.test(code)) {
    await new Promise(r => setTimeout(r, 800))
    
    // HIERARCHICAL DECODING:
    // [Group][Amt3][Qty][Salt]
    const groupDigit = code[0];
    const finalTotal = parseInt(code.slice(1, 4));
    const qty = parseInt(code[4]);
    const salt = code[5];
    
    // Group Mapping:
    const groups = [
      { shopName: 'Spendly Dining', category: 'food' },      // 0
      { shopName: 'Spendly Travel', category: 'travel' },    // 1
      { shopName: 'Spendly Shop', category: 'shopping' },    // 2
      { shopName: 'Spendly Bills', category: 'bills' },      // 3
      { shopName: 'Spendly Medical', category: 'health' },   // 4
      { shopName: 'Spendly Fun', category: 'fun' },          // 5
      { shopName: 'Spendly School', category: 'study' },     // 6
      { shopName: 'Spendly Tech', category: 'tech' },        // 7
      { shopName: 'Spendly Gym', category: 'gym' },          // 8
      { shopName: 'Spendly Other', category: 'other' }       // 9
    ];

    const pick = groups[parseInt(groupDigit)] || groups[9];
=======
  // 3. Smart Alphanumeric Decoder (Offline Fallback)
  // 30-Bit Schema Decode: Amount (13), Cat (4), Pay (1), Day (5), Checksum (7)
  const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const categories = ['food', 'shopping', 'travel', 'bills', 'health', 'tech', 'fun', 'study', 'gym', 'holiday', 'gifts', 'pets', 'rent', 'coffee', 'grocery', 'other'];
  
  try {
    let bits = 0n;
    for (let i = 0; i < 6; i++) {
      const char = cleanCode[i];
      const val = CHARS.indexOf(char);
      if (val === -1) throw new Error('INVALID_CHAR');
      bits = (bits << 5n) | BigInt(val);
    }

    // Decode fields
    const checksum = Number((bits >> 23n) & 0x7Fn);
    const day = Number((bits >> 18n) & 0x1Fn);
    const isBank = (bits >> 17n) & 1n;
    const catIdx = Number((bits >> 13n) & 0xFn);
    const amount = Number(bits & 0x1FFFn);

    // Validate Checksum (MOD 127 of bits 0-22)
    const calcChecksum = Number((bits & 0x7FFFFFn) % 127n);
    
    if (checksum === calcChecksum) {
      return {
        type: 'spent',
        isPartial: true,
        source: 'spendly-shop',
        billId: `SMART-${cleanCode}`,
        billNumber: `BN-${cleanCode}`,
        shopName: 'Spendly Merchant (Offline Check)',
        total: amount,
        category: categories[catIdx] || 'other',
        paymentMethod: isBank ? 'bank' : 'cash',
        timestamp: new Date().toISOString()
      };
    }
  } catch (e) {
    console.log("Smart decoding failed, trying legacy", e);
  }

  // 4. Legacy 6-digit fallback (Only for pure digits)
  if (/^[0-9]{6}$/.test(cleanCode)) {
    const groupDigit = cleanCode[0];
    const finalTotal = parseInt(cleanCode.slice(1, 4));
    const qty = parseInt(cleanCode[4]);
    
    const groups = [
      { shopName: 'Spendly Dining', category: 'food' },
      { shopName: 'Spendly Travel', category: 'travel' },
      { shopName: 'Spendly Shop', category: 'shopping' },
      { shopName: 'Spendly Bills', category: 'bills' }
    ];
    const pick = groups[parseInt(groupDigit)] || { shopName: 'Legacy Shop', category: 'other' };
>>>>>>> 41f113d (upgrade scanner)

    return {
      type: 'spent', 
      isPartial: true,
      source: 'spendly-shop',
<<<<<<< HEAD
      billId: `BILL-REF-${code}-${salt}`, 
      billNumber: `BN-${code.slice(-3)}`,
      shopName: pick.name || pick.shopName,
      total: finalTotal,
      subtotal: Math.floor(finalTotal * 0.92),
      tax: Math.floor(finalTotal * 0.08),
      items: Array(qty).fill({ name: `${pick.category} item`, price: 0, quantity: 1 }),
      category: pick.category,
      paymentMethod: 'UPI',
=======
      billId: `LEGACY-${cleanCode}`, 
      billNumber: `BN-${cleanCode}`,
      shopName: pick.shopName,
      total: finalTotal,
      category: pick.category,
      paymentMethod: 'cash',
>>>>>>> 41f113d (upgrade scanner)
      timestamp: new Date().toISOString()
    }
  }

  throw new Error('CODE_NOT_FOUND')
}

export default function BillCodeEntry({ onBillFound }) {
  const navigate = useNavigate()
  const inputRefs = useRef([])
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')

  const inputGroupRef = useRef(null)
  const pasteBtnRef = useRef(null)

  const { showGuide, currentStep, startGuide, nextStep, prevStep, skipGuide } = usePageGuide('bill_code_entry_page')

  const guideSteps = [
    { targetRef: inputGroupRef, emoji: '🔢', title: 'Receipt Code', description: 'Enter the unique 6-character code from your bill. It supports letters and numbers.', borderRadius: 24 },
    { targetRef: pasteBtnRef, emoji: '📋', title: 'Smart Clipboard', description: 'If you have a code copied, tap here to paste it instantly and start verification.', borderRadius: 100 }
  ]

  const focusNext = (idx) => inputRefs.current[idx + 1]?.focus()
  const focusPrev = (idx) => inputRefs.current[idx - 1]?.focus()

  const handleChange = (idx, value) => {
    // Alphanumeric support
    const clean = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-1)
    const next = [...code]
    next[idx] = clean
    setCode(next)
    setError('')
    if (clean && idx < 5) focusNext(idx)
  }

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace') {
      if (!code[idx] && idx > 0) {
        const next = [...code]
        next[idx - 1] = ''
        setCode(next)
        focusPrev(idx)
      } else {
        const next = [...code]
        next[idx] = ''
        setCode(next)
      }
    }
  }

  useEffect(() => {
    if (code.every(d => d !== '')) verifyCode(code.join(''))
  }, [code])

  const verifyCode = async (fullCode) => {
    setIsVerifying(true)
    setError('')
    try {
      const bill = await lookupBillCode(fullCode)
      onBillFound?.(bill)
      navigate('/', { replace: true })
    } catch (err) {
      if (err.message === 'CODE_NOT_FOUND') {
        setError('Code not found. Please check with the shopkeeper.')
      } else if (err.message === 'INVALID_FORMAT') {
        setError('Code must be 6 characters.')
      } else {
        setError('Something went wrong. Please try again.')
      }
      setCode(['', '', '', '', '', ''])
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col safe-top" style={S}>
      {/* Header */}
      <div className="px-7 pt-12 pb-6 flex items-center justify-between border-b border-[#F6F6F6]">
        <div className="flex items-center gap-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
            className="w-11 h-11 bg-[#F6F6F6] rounded-full flex items-center justify-center border border-[#EEEEEE]">
            <ArrowLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
          </motion.button>
          <div>
            <p className="text-[11px] font-[700] text-[#AFAFAF] uppercase tracking-widest">Spendly Alphanumeric</p>
            <h1 className="text-[20px] font-[800] text-black tracking-tight">Enter Smart Code</h1>
          </div>
        </div>
        <button 
           onClick={startGuide}
           className="w-[34px] h-[34px] rounded-full bg-black text-white flex items-center justify-center font-bold text-[16px] leading-none active:scale-95 transition-transform"
           style={{ fontFamily: "'DM Sans', sans-serif" }}
           title="How to use this page"
        >
           ?
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 -mt-12">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-black rounded-[28px] flex items-center justify-center mb-8 shadow-xl">
          <KeyRound className="w-9 h-9 text-white" strokeWidth={2.5} />
        </motion.div>

        <h2 className="text-[26px] font-[800] text-black tracking-tight text-center mb-2">Manual Entry</h2>
        <p className="text-[13px] font-[600] text-[#AFAFAF] text-center mb-10 leading-relaxed">
          Type the 6-character alphanumeric code from your receipt
        </p>

        {/* Improved Alphanumeric Inputs */}
        <div ref={inputGroupRef} className="flex justify-center gap-2 mb-8 w-full">
          {code.map((digit, idx) => (
            <input
              key={idx}
              ref={el => inputRefs.current[idx] = el}
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              value={digit}
              maxLength={1}
              onChange={e => handleChange(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(idx, e)}
              className={`flex-1 max-w-[50px] aspect-[4/5] rounded-[18px] text-center text-[24px] font-[900] text-black outline-none transition-all border-2 bg-[#F6F6F6] ${
                digit ? 'border-black bg-white shadow-md' : 'border-transparent'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {isVerifying ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-7 h-7 text-black animate-spin" />
              <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-widest">Verifying Smart Code…</p>
            </div>
          ) : error ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-100 rounded-[22px] px-6 py-4">
              <p className="text-[13px] font-[700] text-red-600 text-center leading-relaxed">{error}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.button 
          ref={pasteBtnRef}
          whileTap={{ scale: 0.95 }}
          onClick={async () => {
             const text = await navigator.clipboard.readText();
             if (text.length === 6) {
               const chars = text.split('').slice(0, 6);
               setCode(chars);
             } else {
               setError('No valid 6-character code in clipboard.');
             }
          }}
          className="mt-12 flex items-center gap-2.5 px-6 py-3 bg-slate-50 rounded-full border border-slate-100 group transition-all"
        >
          <Clipboard className="w-4 h-4 text-slate-300 group-hover:text-black" />
          <span className="text-[12px] font-[800] text-slate-400 uppercase tracking-widest group-hover:text-black">Paste from clipboard</span>
        </motion.button>
      </div>

      <div className="px-8 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full mb-3">
           <Sparkles className="w-3 h-3" />
           <span className="text-[9px] font-[900] uppercase tracking-wider">High Entropy Security</span>
        </div>
        <p className="text-[12px] font-[600] text-[#CFCFCF] leading-relaxed">
          Smart codes automatically sync your <span className="text-[#AFAFAF]">bill details</span> and <span className="text-[#AFAFAF]">payment method</span>.
        </p>
      </div>
      <PageGuide 
        show={showGuide} 
        steps={guideSteps} 
        currentStep={currentStep} 
        onNext={nextStep} 
        onPrev={prevStep} 
        onSkip={skipGuide} 
      />
    </div>
  )
}
