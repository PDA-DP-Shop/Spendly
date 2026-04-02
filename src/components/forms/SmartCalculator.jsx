// SmartCalculator.jsx — Feature 14 & 15: Calculator with Tip/GST/Split logic
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Delete, Percent, Users, Receipt } from 'lucide-react'

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
      
      let evaluated = new Function(`return ${cleanExp}`)()
      
      if (gst > 0) evaluated = evaluated * (1 + (gst / 100))
      if (tip > 0) evaluated = evaluated * (1 + (tip / 100))
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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div className="relative w-full bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col pt-2"
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}>
        
        {/* Handle */}
        <div className="w-12 h-1.5 bg-[#E2E8F0] rounded-full mx-auto mb-2" />

        <div className="p-5 pb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[14px] font-[700] text-gray-400 mb-1" style={{ fontFamily: 'Nunito' }}>Expression</p>
              <div className="text-[26px] font-[700] text-gray-400 break-all" style={{ fontFamily: 'Nunito' }}>{expression}</div>
            </div>
          </div>
          
          <div className="flex items-end justify-between border-b-2 border-[#F0F0F8] pb-4">
            <span className="text-[24px] font-[800] text-gray-400" style={{ fontFamily: 'Nunito' }}>{currency}</span>
            <span className="text-[44px] font-[800] text-[var(--primary)] break-all leading-none" style={{ fontFamily: 'Nunito' }}>
              {result || expression}
            </span>
          </div>
        </div>

        {/* GST, Tip, Split tools row */}
        <div className="flex gap-2 px-5 py-3 bg-[#F8F7FF] overflow-x-auto scrollbar-hide">
          {/* Split */}
          <button onClick={() => setSplit(s => s >= 10 ? 1 : s + 1)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-[14px] text-[13px] font-[700] transition-colors ${split > 1 ? 'bg-[#FFDBCF] text-[var(--secondary)] border border-[#FFDBCF]' : 'bg-white text-gray-500 border border-[#F0F0F8]'}`} style={{ fontFamily: 'Nunito' }}>
            <Users className="w-4 h-4" /> 
            {split > 1 ? `Split (${split})` : 'Split'}
          </button>
          
          {/* Tip */}
          <button onClick={() => setTip(t => t === 20 ? 0 : t + 5)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-[14px] text-[13px] font-[700] transition-colors ${tip > 0 ? 'bg-[#D1FAE5] text-[#059669] border border-[#D1FAE5]' : 'bg-white text-gray-500 border border-[#F0F0F8]'}`} style={{ fontFamily: 'Nunito' }}>
            <Receipt className="w-4 h-4" />
            {tip > 0 ? `Tip (${tip}%)` : 'Tip'}
          </button>
          
          {/* GST */}
          <button onClick={() => setGst(g => g === 28 ? 0 : g === 0 ? 5 : g === 5 ? 12 : g === 12 ? 18 : 28)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-[14px] text-[13px] font-[700] transition-colors ${gst > 0 ? 'bg-purple-100/50 text-[var(--primary)] border border-purple-100' : 'bg-white text-gray-500 border border-[#F0F0F8]'}`} style={{ fontFamily: 'Nunito' }}>
            <Percent className="w-4 h-4" />
            {gst > 0 ? `+ GST ${gst}%` : '+ GST'}
          </button>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-2 p-5 pb-10 bg-white">
          {buttons.map(btn => {
            const isOperator = ['÷','×','-','+','='].includes(btn)
            const isAction = ['C','⌫','%','DONE'].includes(btn)
            
            return (
              <motion.button key={btn} whileTap={{ scale: 0.92 }}
                onClick={() => {
                  if (btn === 'C') { setExpression('0'); setSplit(1); setTip(0); setGst(0); setResult('') }
                  else if (btn === '⌫') handleDelete()
                  else if (btn === 'DONE' || btn === '=') handleApply()
                  else if (btn === '%') {
                    try { setExpression(Number(eval(expression) / 100).toString()) } catch(e){}
                  }
                  else handlePress(btn)
                }}
                className={`flex items-center justify-center py-4 rounded-[20px] transition-colors `}
                style={{
                  fontFamily: 'Nunito',
                  fontSize: isOperator || btn === '.' ? '28px' : btn === 'DONE' ? '15px' : '24px',
                  fontWeight: 800,
                  color: btn === 'DONE' || btn === '=' ? '#FFFFFF' : isOperator ? 'var(--primary)' : btn === 'C' || btn === '⌫' || btn === '%' ? '#F43F5E' : '#1A1A2E',
                  background: btn === 'DONE' ? 'var(--primary)' : btn === '=' ? 'var(--gradient-primary)' : isOperator ? '#EEF2FF' : isAction ? '#FFF1F2' : '#F8F9FF',
                  boxShadow: btn === 'DONE' || btn === '=' ? 'var(--shadow-fab)' : 'none',
                  gridColumn: btn === 'DONE' ? 'span 1' : undefined
                }}>
                {btn === '⌫' ? <Delete className="w-6 h-6" /> : btn}
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
