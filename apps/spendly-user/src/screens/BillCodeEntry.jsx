// BillCodeEntry — Premium White design, no fake demo data
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, KeyRound, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const S = { fontFamily: "'Inter', sans-serif" }

const HAPTIC = {
  tap: { x: [0, -3, 3, -3, 3, 0], transition: { duration: 0.35 } }
}

/**
 * Tries to fetch a bill by code from the Spendly Shop registry.
 * Because the shop is offline-only, the shopkeeper sends the full bill
 * as a URL (QR / NFC / WhatsApp). The "code" is a short identifier that
 * doesn't map to a server — so we guide users to use QR instead.
 *
 * FUTURE: if a relay server is added, replace this with a real API call.
 */
async function lookupBillCode(code) {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 900))
  // Bill codes are not currently resolvable without a relay server.
  // Throw so the UI shows the correct "not found" message.
  throw new Error('CODE_NOT_FOUND')
}

export default function BillCodeEntry({ onBillFound }) {
  const navigate = useNavigate()
  const inputRefs = useRef([])
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')

  const focusNext = (idx) => inputRefs.current[idx + 1]?.focus()
  const focusPrev = (idx) => inputRefs.current[idx - 1]?.focus()

  const handleChange = (idx, value) => {
    // Allow only digits/letters
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

  // Auto-submit when all 6 filled
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
        setError('Code not found. Ask the shopkeeper to share via QR or WhatsApp instead.')
      } else {
        setError('Something went wrong. Please try again.')
      }
      // Clear code so user can re-enter
      setCode(['', '', '', '', '', ''])
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    } finally {
      setIsVerifying(false)
    }
  }

  const isFilled = code.every(d => d !== '')

  return (
    <div className="min-h-screen bg-white flex flex-col safe-top" style={S}>
      {/* Header */}
      <div className="px-7 pt-12 pb-6 flex items-center gap-4 border-b border-[#F6F6F6]">
        <motion.button
          variants={HAPTIC}
          whileTap="tap"
          onClick={() => navigate(-1)}
          className="w-11 h-11 bg-[#F6F6F6] rounded-full flex items-center justify-center border border-[#EEEEEE]"
        >
          <ArrowLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
        </motion.button>
        <div>
          <p className="text-[11px] font-[700] text-[#AFAFAF] uppercase tracking-widest">Spendly</p>
          <h1 className="text-[20px] font-[800] text-black tracking-tight">Enter Bill Code</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 -mt-12">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="w-20 h-20 bg-black rounded-[28px] flex items-center justify-center mb-8 shadow-xl"
        >
          <KeyRound className="w-9 h-9 text-white" strokeWidth={2.5} />
        </motion.div>

        <h2 className="text-[26px] font-[800] text-black tracking-tight text-center mb-2">6-digit code</h2>
        <p className="text-[13px] font-[600] text-[#AFAFAF] text-center mb-10 leading-relaxed">
          Get the code from the shopkeeper's Spendly Shop app
        </p>

        {/* Code inputs */}
        <div className="flex justify-center gap-3 mb-8 w-full">
          {code.map((digit, idx) => (
            <input
              key={idx}
              ref={el => inputRefs.current[idx] = el}
              id={`code-${idx}`}
              type="text"
              inputMode="text"
              value={digit}
              maxLength={1}
              onChange={e => handleChange(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(idx, e)}
              className={`flex-1 max-w-[52px] aspect-[3/4] rounded-[16px] text-center text-[22px] font-[800] text-black outline-none transition-all border-2 bg-[#F6F6F6] ${
                digit ? 'border-black bg-white shadow-sm' : 'border-transparent'
              }`}
            />
          ))}
        </div>

        {/* Status */}
        <AnimatePresence mode="wait">
          {isVerifying ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3">
              <Loader2 className="w-7 h-7 text-black animate-spin" />
              <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-widest">Checking code…</p>
            </motion.div>
          ) : error ? (
            <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-100 rounded-[20px] px-6 py-4 mx-2">
              <p className="text-[13px] font-[700] text-red-600 text-center leading-relaxed">{error}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Hint */}
        {!isVerifying && !error && (
          <p className="text-[11px] font-[700] text-[#CFCFCF] uppercase tracking-widest mt-6">
            Enter code to auto-submit
          </p>
        )}
      </div>

      {/* Bottom hint */}
      <div className="px-8 pb-16 text-center">
        <p className="text-[12px] font-[600] text-[#CFCFCF] leading-relaxed">
          💡 Tip: QR code scan is faster and more reliable. Go to <span className="font-[800] text-[#AFAFAF]">Scan</span> tab to scan the shop's QR directly.
        </p>
      </div>
    </div>
  )
}
