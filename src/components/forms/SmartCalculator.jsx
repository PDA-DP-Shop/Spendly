// SmartCalculator.jsx — Feature 14 & 15: Calculator with Tip/GST/Split logic
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Delete, Percent, Users, Receipt, CircleEqual } from 'lucide-react'

export default function SmartCalculator({ initialValue, onSave, onClose, currency }) {
  const [expression, setExpression] = useState(initialValue?.toString() || '0')
  const [result, setResult] = useState('')
  const [split, setSplit] = useState(1)
  const [gst, setGst] = useState(0) // percentage
  const [tip, setTip] = useState(0) // percentage

  // Handle calculator math safely
  useEffect(() => {
    try {
      const cleanExp = expression.replace(/×/g, '*').replace(/÷/g, '/')
      if (cleanExp.match(/[+\-*/]$/)) return // Don't eval if ends with operator
      
      // Basic safe eval for calculator using Function
      let evaluated = new Function(`return ${cleanExp}`)()
      
      // Apply GST
      if (gst > 0) evaluated = evaluated * (1 + (gst / 100))
      
      // Apply Tip
      if (tip > 0) evaluated = evaluated * (1 + (tip / 100))
      
      // Apply Split
      if (split > 1) evaluated = evaluated / split
      
      setResult(Number(evaluated.toFixed(2)).toString())
    } catch (e) {
      // Invalid expression, ignore
    }
  }, [expression, split, gst, tip])

  const handlePress = (val) => {
    if (expression === '0' && /[0-9]/.test(val)) {
      setExpression(val)
      return
    }
    
    // Prevent multiple decimals per number
    if (val === '.') {
      const parts = expression.split(/[+\-×÷]/)
      const currentNumber = parts[parts.length - 1]
      if (currentNumber.includes('.')) return
    }

    // Prevent consecutive operators
    if (/[+\-×÷.]/.test(val)) {
      const lastChar = expression.slice(-1)
      if (/[+\-×÷.]/.test(lastChar)) return
    }
    
    setExpression(prev => prev + val)
  }

  const handleDelete = () => {
    if (expression.length === 1) setExpression('0')
    else setExpression(prev => prev.slice(0, -1))
  }

  const handleApply = () => {
    onSave(result || expression)
  }

  const buttons = [
    'C', '÷', '×', '⌫',
    '7', '8', '9', '-',
    '4', '5', '6', '+',
    '1', '2', '3', '=',
    '%', '0', '.', 'DONE'
  ]

  return (
    <motion.div className="fixed inset-0 z-[100] flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <motion.div className="relative w-full bg-white dark:bg-[#1A1A2E] rounded-t-[32px] overflow-hidden flex flex-col"
        initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }} transition={{ type: 'spring', damping: 25 }}>
        
        <div className="p-5 pb-2">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[14px] font-semibold text-gray-400 mb-1">Smart Calculator</p>
              <div className="text-[28px] font-sora text-gray-500 break-all">{expression}</div>
            </div>
            <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full"><X className="w-5 h-5 text-gray-500" /></button>
          </div>
          
          <div className="flex items-end justify-between border-b 2 border-gray-100 dark:border-gray-800 pb-4">
            <span className="text-[24px] font-bold text-gray-400">{currency}</span>
            <span className="text-[42px] font-sora font-bold text-purple-600 dark:text-purple-400 break-all">
              {result || expression}
            </span>
          </div>
        </div>

        {/* GST, Tip, Split tools row */}
        <div className="flex gap-2 px-4 py-3 bg-gray-50 dark:bg-[#202035] overflow-x-auto no-scrollbar">
          {/* Split */}
          <button onClick={() => setSplit(s => s >= 10 ? 1 : s + 1)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold border transition-colors ${split > 1 ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 border-orange-200 dark:border-orange-500/30' : 'bg-white dark:bg-[#1A1A2E] text-gray-500 border-gray-200 dark:border-gray-700'}`}>
            <Users className="w-4 h-4" /> 
            {split > 1 ? `Split (${split})` : 'Split'}
          </button>
          
          {/* Tip */}
          <button onClick={() => setTip(t => t === 20 ? 0 : t + 5)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold border transition-colors ${tip > 0 ? 'bg-green-50 dark:bg-green-900/20 text-green-600 border-green-200 dark:border-green-500/30' : 'bg-white dark:bg-[#1A1A2E] text-gray-500 border-gray-200 dark:border-gray-700'}`}>
            <Receipt className="w-4 h-4" />
            {tip > 0 ? `Tip (${tip}%)` : 'Tip %'}
          </button>
          
          {/* GST */}
          <button onClick={() => setGst(g => g === 28 ? 0 : g === 0 ? 5 : g === 5 ? 12 : g === 12 ? 18 : 28)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold border transition-colors ${gst > 0 ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 border-purple-200 dark:border-purple-500/30' : 'bg-white dark:bg-[#1A1A2E] text-gray-500 border-gray-200 dark:border-gray-700'}`}>
            <Percent className="w-4 h-4" />
            {gst > 0 ? `GST (+${gst}%)` : '+ GST'}
          </button>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-2 p-4 pb-8 bg-white dark:bg-[#1A1A2E]">
          {buttons.map(btn => {
            const isOperator = ['÷','×','-','+','='].includes(btn)
            const isAction = ['C','⌫','%','DONE'].includes(btn)
            
            return (
              <motion.button key={btn} whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (btn === 'C') { setExpression('0'); setSplit(1); setTip(0); setGst(0); setResult('') }
                  else if (btn === '⌫') handleDelete()
                  else if (btn === 'DONE' || btn === '=') handleApply()
                  else if (btn === '%') {
                    try { setExpression(Number(eval(expression) / 100).toString()) } catch(e){}
                  }
                  else handlePress(btn)
                }}
                className={`py-4 rounded-2xl text-[22px] font-sora font-semibold flex items-center justify-center transition-colors 
                  ${btn === 'DONE' ? 'col-span-1 bg-purple-600 text-white text-[16px] shadow-sm' : ''}
                  ${btn === '=' ? 'bg-orange-500 text-white shadow-sm' : ''}
                  ${isOperator && btn !== '=' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 text-[26px]' : ''}
                  ${btn === 'C' || btn === '⌫' || btn === '%' ? 'bg-gray-100 dark:bg-gray-800 text-red-500' : ''}
                  ${!isOperator && !isAction ? 'bg-white dark:bg-[#1A1A2E] text-gray-900 dark:text-white border-2 border-gray-50 dark:border-gray-800' : ''}
                `}>
                {btn === '⌫' ? <Delete className="w-6 h-6" /> : btn}
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
