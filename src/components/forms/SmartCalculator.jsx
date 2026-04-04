import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Delete, Percent, Users, Receipt, X } from 'lucide-react'

const HAPTIC_SHAKE = {
  tap: { 
    x: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.35, ease: "easeInOut" }
  }
}

export default function SmartCalculator({ initialValue, onSave, onClose, currency }) {
  const [expression, setExpression] = useState(initialValue?.toString() || '0')
  const [result, setResult] = useState('')
  const [split, setSplit] = useState(1)
  const [gst, setGst] = useState(0)
  const [tip, setTip] = useState(0)
  const S = { fontFamily: "'Inter', sans-serif" }

  useEffect(() => {
    try {
      const cleanExp = expression.replace(/×/g, '*').replace(/÷/g, '/')
      if (cleanExp.match(/[+\-*/]$/)) return
      
      let evaluated = new Function(`return ${cleanExp}`)()
      
      if (gst > 0) evaluated = evaluated * (1 + (gst / 100))
      if (tip > 0) evaluated = evaluated * (1 + (tip / 100))
      if (split > 1) evaluated = evaluated / (split || 1)
      
      if (isNaN(evaluated) || !isFinite(evaluated)) {
        setResult('Error')
      } else {
        setResult(Number(evaluated.toFixed(2)).toString())
      }
    } catch (e) {}
  }, [expression, split, gst, tip])

  const handlePress = (val) => {
    if (expression === '0' && /[0-9]/.test(val)) {
      setExpression(val)
      return
    }
    if (val === '.') {
      const parts = expression.split(/[+\-×÷]/)
      const currentNumber = parts[parts.length - 1]
      if (currentNumber.includes('.')) return
    }
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
    '%', '0', '.', 'SAVE'
  ]

  return (
    <motion.div className="fixed inset-0 z-[100] flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      
      <motion.div className="relative w-full bg-white rounded-t-[32px] flex flex-col pt-4 overflow-hidden"
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}>
        
        <div className="w-12 h-1.5 bg-[#EEEEEE] rounded-full mx-auto mb-6 mt-2" />

        <div className="px-8 pb-8">
          <div className="flex flex-col mb-6">
            <span className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-wide mb-2" style={S}>Calculation</span>
            <div className="text-[20px] font-[700] text-[#D8D8D8] break-all tracking-tight leading-tight" style={S}>{expression}</div>
          </div>
          
          <div className="flex items-end justify-between border-b border-[#F6F6F6] pb-8">
            <span className="text-[24px] font-[800] text-black/20 mr-4" style={S}>{currency}</span>
            <span className="text-[52px] font-[800] text-black break-all leading-none tracking-tightest" style={S}>
              {result || expression}
            </span>
          </div>
        </div>

        <div className="flex gap-3 px-8 py-5 bg-[#F6F6F6] overflow-x-auto scrollbar-hide border-y border-[#EEEEEE]">
          <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => setSplit(s => s >= 10 ? 1 : s + 1)}
            className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-full text-[13px] font-[700] transition-all border ${split > 1 ? 'bg-black text-white border-black' : 'bg-white text-black border-[#EEEEEE]'}`} style={S}>
            <Users className="w-4 h-4" strokeWidth={3} /> 
            {split > 1 ? `Split ${split}` : 'Split'}
          </motion.button>
          
          <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => setTip(t => t === 20 ? 0 : t + 5)}
            className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-full text-[13px] font-[700] transition-all border ${tip > 0 ? 'bg-black text-white border-black' : 'bg-white text-black border-[#EEEEEE]'}`} style={S}>
            <Receipt className="w-4 h-4" strokeWidth={3} />
            {tip > 0 ? `Tip ${tip}%` : 'Tip'}
          </motion.button>
          
          <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => setGst(g => g === 28 ? 0 : g === 0 ? 5 : g === 5 ? 12 : g === 12 ? 18 : 28)}
            className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-full text-[13px] font-[700] transition-all border ${gst > 0 ? 'bg-black text-white border-black' : 'bg-white text-black border-[#EEEEEE]'}`} style={S}>
            <Percent className="w-4 h-4" strokeWidth={3} />
            {gst > 0 ? `GST ${gst}%` : 'GST'}
          </motion.button>
        </div>

        <div className="grid grid-cols-4 gap-3 p-8 pb-12 bg-white">
          {buttons.map(btn => {
            const isOperator = ['÷','×','-','+','='].includes(btn)
            const isAction = ['C','⌫','%','SAVE'].includes(btn)
            const isHighlight = btn === 'SAVE' || btn === '='
            
            return (
              <motion.button key={btn} variants={HAPTIC_SHAKE} whileTap="tap"
                onClick={() => {
                  if (btn === 'C') { setExpression('0'); setSplit(1); setTip(0); setGst(0); setResult('') }
                  else if (btn === '⌫') handleDelete()
                  else if (btn === 'SAVE' || btn === '=') handleApply()
                  else if (btn === '%') {
                    try { 
                      const currentVal = new Function(`return ${expression.replace(/×/g, '*').replace(/÷/g, '/')}`)()
                      setExpression((currentVal / 100).toString()) 
                    } catch(e){}
                  }
                  else handlePress(btn)
                }}
                className={`flex items-center justify-center rounded-[24px] transition-all border ${isHighlight ? 'bg-black border-black text-white shadow-lg' : isOperator || isAction ? 'bg-[#F6F6F6] border-[#EEEEEE] text-black' : 'bg-white border-[#EEEEEE] text-black active:bg-black active:text-white'}`}
                style={{
                  fontSize: isHighlight ? '14px' : (btn === '⌫' ? '28px' : '26px'),
                  fontWeight: 700,
                  height: '78px',
                  ...S
                }}>
                {btn === '⌫' ? <Delete className="w-7 h-7" strokeWidth={3} /> : btn}
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
