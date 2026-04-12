import { createPortal } from 'react-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, X, Percent, Check, Copy } from 'lucide-react'
import { formatMoney } from '../../utils/formatMoney'
import { useSettingsStore } from '../../store/settingsStore'
import { CURRENCIES } from '../../constants/currencies'

const S = { fontFamily: "'Inter', sans-serif" }

export default function GSTCalculator({ onClose }) {
  const [amount, setAmount] = useState('')
  const [rate, setRate] = useState(18)
  const [isReverse, setIsReverse] = useState(false)
  
  const { settings } = useSettingsStore()
  const currencyCode = settings?.currency || 'INR'
  const currObj = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0]
  
  const numVal = parseFloat(amount) || 0

  let baseAmount, taxAmount, totalAmount
  if (isReverse) {
    totalAmount = numVal
    baseAmount = numVal / (1 + (rate / 100))
    taxAmount = totalAmount - baseAmount
  } else {
    baseAmount = numVal
    taxAmount = numVal * (rate / 100)
    totalAmount = baseAmount + taxAmount
  }

  const cgst = taxAmount / 2
  const sgst = taxAmount / 2

  const handleCopy = (val) => {
    navigator.clipboard.writeText(val.toFixed(2))
  }

  const HAPTIC_SHAKE = {
    tap: { 
      x: [0, -3, 3, -3, 3, 0],
      transition: { duration: 0.35, ease: "easeInOut" }
    }
  }

  return createPortal(
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 32, stiffness: 350 }}
      className="fixed inset-0 z-[1001] bg-white flex flex-col pointer-events-auto left-1/2 -translate-x-1/2 w-full max-w-[450px]">
      
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-[#F6F6F6]">
        <h2 className="text-[24px] font-[800] text-black flex items-center gap-4 tracking-tight" style={S}>
          <div className="w-12 h-12 rounded-[18px] bg-black flex items-center justify-center">
             <Calculator className="w-5 h-5 text-white" />
          </div>
          Tax Hub
        </h2>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} 
          className="w-12 h-12 rounded-full bg-[#F6F6F6] flex items-center justify-center border border-[#EEEEEE]">
          <X className="w-6 h-6 text-black" strokeWidth={2.5} />
        </motion.button>
      </div>

      <div className="p-8 flex-1 overflow-y-auto pb-32">
        <div className="bg-white rounded-[40px] p-8 border border-[#EEEEEE] mb-8 shadow-sm">
          {/* Mode Toggle */}
          <div className="flex bg-[#F6F6F6] rounded-[24px] p-1.5 mb-10 border border-[#EEEEEE]">
            <button key="add" onClick={() => setIsReverse(false)}
              className={`flex-1 py-4 font-[800] text-[13px] rounded-[18px] transition-all uppercase tracking-widest ${!isReverse ? 'bg-black text-white shadow-xl' : 'text-[#AFAFAF]'}`} style={S}>
              Add GST
            </button>
            <button key="remove" onClick={() => setIsReverse(true)}
              className={`flex-1 py-4 font-[800] text-[13px] rounded-[18px] transition-all uppercase tracking-widest ${isReverse ? 'bg-black text-white shadow-xl' : 'text-[#AFAFAF]'}`} style={S}>
              Extract GST
            </button>
          </div>

          {/* Amount Input */}
          <div className="mb-10">
            <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-[0.2em] mb-4 ml-1" style={S}>
              {isReverse ? 'Gross Value' : 'Net Amount'}
            </p>
            <div className="flex items-center bg-[#F6F6F6] rounded-[28px] px-8 h-20 border border-[#EEEEEE] focus-within:border-black transition-all">
              <span className="text-[24px] font-[800] text-black/20 mr-4" style={S}>{currObj.symbol}</span>
              <input type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
                className="w-full bg-transparent outline-none text-[32px] font-[800] text-black tracking-tight" style={S} />
            </div>
          </div>

          {/* Slabs */}
          <div>
            <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-[0.2em] mb-5 ml-1" style={S}>Tax Slab</p>
            <div className="grid grid-cols-3 gap-3">
              {[0, 5, 12, 18, 28].map(slab => (
                <motion.button key={slab} whileTap={{ scale: 0.95 }} onClick={() => setRate(slab)}
                  className={`py-4 font-[800] text-[15px] rounded-[22px] border-2 transition-all ${rate === slab ? 'bg-black border-black text-white shadow-xl' : 'bg-transparent border-[#EEEEEE] text-[#AFAFAF]'}`} style={S}>
                  {slab}%
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-[40px] p-10 border border-[#EEEEEE] shadow-sm">
          <div className="space-y-10">
            <div className="flex justify-between items-center px-2">
              <span className="text-[#AFAFAF] text-[13px] font-[700] uppercase tracking-wider" style={S}>Base Total</span>
              <div className="flex items-center gap-4">
                <span className="text-[18px] font-[800] text-black tracking-tight" style={S}>{formatMoney(baseAmount, currObj.code)}</span>
                <button onClick={() => handleCopy(baseAmount)} className="w-11 h-11 rounded-full bg-[#F6F6F6] flex items-center justify-center text-black border border-[#EEEEEE] active:scale-90 transition-transform"><Copy className="w-4 h-4" strokeWidth={2.5} /></button>
              </div>
            </div>

            <div className="flex justify-between items-center bg-black p-8 rounded-[36px] shadow-2xl shadow-black/10">
              <span className="text-white/50 font-[800] text-[13px] uppercase tracking-wider" style={S}>Tax Component</span>
              <div className="flex items-center gap-4">
                <span className="text-[20px] font-[800] text-white" style={S}>+{formatMoney(taxAmount, currObj.code)}</span>
                <button onClick={() => handleCopy(taxAmount)} className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-95 transition-transform"><Copy className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex justify-between items-center px-4">
              <div className="flex flex-col">
                <span className="text-[#AFAFAF] text-[11px] font-[800] uppercase tracking-widest mb-1" style={S}>CGST ({(rate/2).toFixed(1)}%)</span>
                <span className="text-[15px] font-[800] text-black" style={S}>{formatMoney(cgst, currObj.code)}</span>
              </div>
              <div className="w-px h-10 bg-[#EEEEEE]" />
              <div className="flex flex-col text-right">
                <span className="text-[#AFAFAF] text-[11px] font-[800] uppercase tracking-widest mb-1" style={S}>SGST ({(rate/2).toFixed(1)}%)</span>
                <span className="text-[15px] font-[800] text-black" style={S}>{formatMoney(sgst, currObj.code)}</span>
              </div>
            </div>

            <div className="h-px bg-[#F6F6F6]" />

            <div className="flex justify-between items-center px-2">
              <span className="text-black font-[800] uppercase tracking-[0.25em] text-[12px]" style={S}>Final Value</span>
              <div className="flex items-center gap-4">
                <span className="text-[32px] font-[800] text-black tracking-tighter" style={S}>{formatMoney(totalAmount, currObj.code)}</span>
                <button onClick={() => handleCopy(totalAmount)} className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white shadow-xl active:scale-90 transition-transform"><Copy className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>,
    document.getElementById('modal-root') || document.body
  )
}
