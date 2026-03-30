// Feature 20: GST Calculator (Standalone Tool)
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, X, Percent, Check, Copy } from 'lucide-react'
import { formatMoney } from '../../utils/formatMoney'
import { useSettingsStore } from '../../store/settingsStore'
import { CURRENCIES } from '../../constants/currencies'

export default function GSTCalculator({ onClose }) {
  const [amount, setAmount] = useState('')
  const [rate, setRate] = useState(18)
  const [isReverse, setIsReverse] = useState(false)
  
  const { settings } = useSettingsStore()
  const currencyCode = settings?.currency || 'INR'
  const currObj = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0]
  
  const numVal = parseFloat(amount) || 0

  // Standard GST (Add GST to Base)
  // Base = input, Tax = Base * (Rate/100), Total = Base + Tax
  
  // Reverse GST (Remove GST from Total)
  // Total = input, Base = Total / (1 + Rate/100), Tax = Total - Base

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
    alert(`Copied ${val.toFixed(2)} to clipboard!`)
  }

  return (
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[100] bg-[#F5F5F5] dark:bg-[#0F0F1A] flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 safe-top bg-white dark:bg-[#1A1A2E] shadow-sm">
        <h2 className="font-sora font-semibold text-[18px] text-gray-900 dark:text-white flex items-center gap-2">
          <Calculator className="w-5 h-5 text-purple-600" /> GST Calculator
        </h2>
        <button onClick={onClose} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-full">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="bg-white dark:bg-[#1A1A2E] rounded-3xl p-6 shadow-sm mb-4">
          {/* Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-[#242438] rounded-xl p-1 mb-6">
            <button key="add" onClick={() => setIsReverse(false)}
              className={`flex-1 py-2 font-semibold text-[13px] rounded-lg transition-all ${!isReverse ? 'bg-white dark:bg-gray-700 shadow-sm text-purple-600' : 'text-gray-500'}`}>
              Add GST (+Tax)
            </button>
            <button key="remove" onClick={() => setIsReverse(true)}
              className={`flex-1 py-2 font-semibold text-[13px] rounded-lg transition-all ${isReverse ? 'bg-white dark:bg-gray-700 shadow-sm text-purple-600' : 'text-gray-500'}`}>
              Remove GST (-Tax)
            </button>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wide mb-2 block">
              {isReverse ? 'Total Amount (Incl. GST)' : 'Base Amount (Excl. GST)'}
            </label>
            <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
              <span className="text-[20px] font-sora font-bold text-gray-400 mr-2">{currObj.symbol}</span>
              <input type="number" 
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent outline-none text-[28px] font-sora font-bold text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Slabs */}
          <div className="mb-2">
            <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wide mb-2 block">GST Rate Slab</label>
            <div className="flex flex-wrap gap-2">
              {[0, 3, 5, 12, 18, 28].map(slab => (
                <button key={slab} onClick={() => setRate(slab)}
                  className={`flex-1 py-3 font-bold text-sm rounded-xl border-2 transition-all ${rate === slab ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-700 dark:text-purple-400' : 'bg-transparent border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-purple-200'}`}>
                  {slab}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white dark:bg-[#1A1A2E] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wide mb-4 text-center">Breakdown</p>
          
          <div className="space-y-4 font-sora">
            <div className="flex justify-between items-center group">
              <span className="text-gray-500 text-sm">Base Amount</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-white">{formatMoney(baseAmount, currObj.symbol)}</span>
                <button onClick={() => handleCopy(baseAmount)} className="p-1.5 text-gray-400"><Copy className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex justify-between items-center bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
              <span className="text-red-500 font-semibold text-sm">Total Tax ({rate}%)</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-red-600 dark:text-red-400">+{formatMoney(taxAmount, currObj.symbol)}</span>
                <button onClick={() => handleCopy(taxAmount)} className="p-1.5 text-red-400"><Copy className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex justify-between items-center px-4">
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs font-semibold">CGST ({(rate/2).toFixed(1)}%)</span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">{formatMoney(cgst, currObj.symbol)}</span>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
              <div className="flex flex-col text-right">
                <span className="text-gray-400 text-xs font-semibold">SGST ({(rate/2).toFixed(1)}%)</span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">{formatMoney(sgst, currObj.symbol)}</span>
              </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />

            <div className="flex justify-between items-end">
              <span className="text-gray-500 font-bold uppercase tracking-wide text-sm">Net Total</span>
              <div className="flex items-center gap-2">
                <span className="font-black text-[22px] text-purple-600 dark:text-purple-400">{formatMoney(totalAmount, currObj.symbol)}</span>
                <button onClick={() => handleCopy(totalAmount)} className="p-1.5 text-purple-500 bg-purple-50 dark:bg-purple-900/20 rounded-lg"><Copy className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
