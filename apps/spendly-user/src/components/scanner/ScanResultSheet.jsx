import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Check, X, ArrowRight, RotateCcw, Package, Receipt, QrCode, 
  ShoppingBag, Calendar, Sparkles
} from 'lucide-react'
import { useExpenseStore } from '../../store/expenseStore'
import { useNavigate } from 'react-router-dom'
import { getSmartSuggestions, saveCategoryCorrection, learnFromExpense } from '../../services/scanIntelligence'
import { saveLearnedBarcode } from '../../services/barcodeService'

const S = { fontFamily: "'Inter', sans-serif" }

export default function ScanResultSheet({ result, onReset }) {
  const navigate = useNavigate()
  const { setScannedData } = useExpenseStore()
  
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: '',
    time: '',
    category: 'other'
  })

  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  useEffect(() => {
    if (!result) return
    setFormData({
      name: result.name || result.shopName || '',
      amount: result.totalAmount || result.price || result.amount || '',
      date: result.date || new Date().toISOString().split('T')[0],
      time: result.time || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      category: result.category || 'other'
    })
  }, [result])

  const handleNameChange = async (val) => {
    setFormData({ ...formData, name: val })
    if (val.length >= 2) {
      const sug = await getSmartSuggestions(val)
      setSuggestions(sug)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleAddExpense = async () => {
    if (result.category && formData.category !== result.category) {
       await saveCategoryCorrection(formData.name, result.category, formData.category)
    }
    const payload = {
      type: result.type,
      name: formData.name,
      amount: parseFloat(formData.amount) || result.predictedAmount || null,
      date: formData.date,
      time: formData.time,
      category: formData.category,
      source: result.source || result.type,
      rawData: result.rawData || result.barcode || null
    }

    // Learning Loop: Barcode Persistence
    if (result.type === 'barcode' && result.barcode) {
       await saveLearnedBarcode(result.barcode, formData.name, formData.amount, formData.category)
    }

    // Learning Loop: General Habits
    await learnFromExpense(payload)

    setScannedData(payload)
    setTimeout(() => navigate('/add'), 150)
  }

  if (!result) return null

  return (
    <motion.div
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      className="fixed inset-x-0 bottom-0 z-[110] bg-white rounded-t-[40px] px-8 pt-2 pb-12 shadow-[0_-20px_80px_rgba(0,0,0,0.15)]"
      style={S}
    >
      <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-10" />

      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center">
          {result.type === 'barcode' && <Package className="w-6 h-6" />}
          {result.type === 'bill' && <Receipt className="w-6 h-6" />}
          {(result.type === 'payment' || result.type === 'manual_suggestion') && <QrCode className="w-6 h-6" />}
          {result.type === 'spendly' && <ShoppingBag className="w-6 h-6" />}
        </div>
        <div>
          <h2 className="text-xl font-black text-black tracking-tight leading-none mb-1">
            {result.type.toUpperCase()} DETECTED
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-black" /> Verified Intelligence
          </p>
        </div>
      </div>

      <div className="space-y-10">
        {/* Name */}
        <div className="relative">
          <input 
            type="text" value={formData.name} onChange={e => handleNameChange(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-3xl p-6 text-lg font-black text-black outline-none placeholder:text-gray-300"
            placeholder="Shop / Item Name"
          />
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => { setFormData({...formData, name: s.name, category: s.category || formData.category}); setShowSuggestions(false); }} className="bg-white border rounded-full px-4 py-2 text-sm font-bold shrink-0">
                    {s.icon} {s.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Amount */}
        <div className="flex items-center justify-between px-2">
           <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-gray-300">₹</span>
              <input 
                type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                placeholder={result.predictedAmount || "0"}
                className="bg-transparent text-6xl font-black font-['Sora'] outline-none w-[200px]"
              />
           </div>
           {result.predictionBasis && !formData.amount && (
             <div className="bg-gray-50 px-3 py-1.5 rounded-full text-[9px] font-black uppercase text-gray-400 tracking-wide">
               Predicted
             </div>
           )}
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-4">
        <button onClick={handleAddExpense} className="w-full py-5 bg-black text-white rounded-3xl font-black text-lg uppercase tracking-wider flex items-center justify-center gap-4">
          Save Expense <ArrowRight className="w-5 h-5 opacity-30" />
        </button>
        <button onClick={onReset} className="w-full py-3 text-gray-400 font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2">
          <RotateCcw className="w-3.5 h-3.5" /> Start Again
        </button>
      </div>
    </motion.div>
  )
}
