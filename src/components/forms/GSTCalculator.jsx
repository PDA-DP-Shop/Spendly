// Feature 20: GST Calculator (Standalone Tool)
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, X, Percent, Check, Copy } from 'lucide-react'
import { formatMoney } from '../../utils/formatMoney'
import { useSettingsStore } from '../../store/settingsStore'
import { CURRENCIES } from '../../constants/currencies'

const S = { fontFamily: "'Nunito', sans-serif" }

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

  return (
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 32, stiffness: 350 }}
      className="fixed inset-0 z-[100] bg-[#F8F7FF] flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-safe h-20 bg-white border-b border-[#F0F0F8]">
        <h2 className="text-[18px] font-[800] text-[#0F172A] flex items-center gap-2.5 tracking-tight" style={S}>
          <div className="w-10 h-10 rounded-[14px] bg-[#EEF2FF] flex items-center justify-center">
             <Calculator className="w-5 h-5 text-[#7C6FF7]" />
          </div>
          Tax Intelligence
        </h2>
        <button onClick={onClose} className="w-11 h-11 rounded-full bg-[#F8F9FF] flex items-center justify-center border border-[#F0F0F8]">
          <X className="w-5 h-5 text-[#64748B]" />
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto pb-24">
        <div className="bg-white rounded-[36px] p-8 shadow-sm border border-[#F0F0F8] mb-6">
          {/* Mode Toggle */}
          <div className="flex bg-[#F8F7FF] border border-[#F0F0F8] rounded-[18px] p-1.5 mb-8">
            <button key="add" onClick={() => setIsReverse(false)}
              className={`flex-1 py-3 font-[800] text-[13px] rounded-[14px] transition-all uppercase tracking-wider ${!isReverse ? 'bg-white shadow-md text-[#7C6FF7]' : 'text-[#94A3B8]'}`} style={S}>
              Add GST
            </button>
            <button key="remove" onClick={() => setIsReverse(true)}
              className={`flex-1 py-3 font-[800] text-[13px] rounded-[14px] transition-all uppercase tracking-wider ${isReverse ? 'bg-white shadow-md text-[#7C6FF7]' : 'text-[#94A3B8]'}`} style={S}>
              Extract GST
            </button>
          </div>

          {/* Amount Input */}
          <div className="mb-8">
            <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-[0.2em] mb-3 ml-1" style={S}>
              {isReverse ? 'Gross Value' : 'Net Liquidity'}
            </p>
            <div className="flex items-center bg-[#F8F7FF] rounded-[24px] px-6 h-20 border border-[#F0F0F8] focus-within:border-[#7C6FF7] transition-colors">
              <span className="text-[24px] font-[800] text-[#CBD5E1] mr-3" style={S}>{currObj.symbol}</span>
              <input type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
                className="w-full bg-transparent outline-none text-[32px] font-[800] text-[#0F172A] tracking-tighter" style={S} />
            </div>
          </div>

          {/* Slabs */}
          <div>
            <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-[0.2em] mb-4 ml-1" style={S}>Tax Slab</p>
            <div className="grid grid-cols-3 gap-3">
              {[0, 5, 12, 18, 28].map(slab => (
                <button key={slab} onClick={() => setRate(slab)}
                  className={`py-3.5 font-[800] text-[15px] rounded-[18px] border-2 transition-all ${rate === slab ? 'bg-[#EEF2FF] border-[#7C6FF7] text-[#7C6FF7]' : 'bg-transparent border-[#F0F0F8] text-[#94A3B8]'}`} style={S}>
                  {slab}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-[#F0F0F8]">
          <div className="space-y-6">
            <div className="flex justify-between items-center group">
              <span className="text-[#94A3B8] text-[13px] font-[800] uppercase tracking-wider" style={S}>Core Amount</span>
              <div className="flex items-center gap-3">
                <span className="text-[16px] font-[800] text-[#0F172A]" style={S}>{formatMoney(baseAmount, currObj.symbol)}</span>
                <button onClick={() => handleCopy(baseAmount)} className="w-9 h-9 rounded-full bg-[#F8F7FF] flex items-center justify-center text-[#94A3B8]"><Copy className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex justify-between items-center bg-[#FFF5F5] p-5 rounded-[24px] border border-[#FFE0E0]">
              <span className="text-[#F43F5E] font-[800] text-[13px] uppercase tracking-wider" style={S}>Accumulated Tax</span>
              <div className="flex items-center gap-3">
                <span className="text-[18px] font-[800] text-[#F43F5E]" style={S}>+{formatMoney(taxAmount, currObj.symbol)}</span>
                <button onClick={() => handleCopy(taxAmount)} className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#F43F5E]"><Copy className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex justify-between items-center px-2">
              <div className="flex flex-col">
                <span className="text-[#94A3B8] text-[11px] font-[800] uppercase tracking-widest mb-1" style={S}>CGST ({(rate/2).toFixed(1)}%)</span>
                <span className="text-[14px] font-[800] text-[#475569]" style={S}>{formatMoney(cgst, currObj.symbol)}</span>
              </div>
              <div className="w-px h-10 bg-[#F0F0F8]" />
              <div className="flex flex-col text-right">
                <span className="text-[#94A3B8] text-[11px] font-[800] uppercase tracking-widest mb-1" style={S}>SGST ({(rate/2).toFixed(1)}%)</span>
                <span className="text-[14px] font-[800] text-[#475569]" style={S}>{formatMoney(sgst, currObj.symbol)}</span>
              </div>
            </div>

            <div className="h-px bg-[#F0F0F8] mx-2" />

            <div className="flex justify-between items-center pt-2">
              <span className="text-[#0F172A] font-[800] uppercase tracking-widest text-[14px]" style={S}>Net Total</span>
              <div className="flex items-center gap-3">
                <span className="text-[28px] font-[800] text-[#7C6FF7] tracking-tighter" style={S}>{formatMoney(totalAmount, currObj.symbol)}</span>
                <button onClick={() => handleCopy(totalAmount)} className="w-10 h-10 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#7C6FF7]"><Copy className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
