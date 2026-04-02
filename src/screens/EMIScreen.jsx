// EMIScreen.jsx — Feature 2: EMI & Loan Tracker
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TopHeader from '../components/shared/TopHeader'
import EmptyState from '../components/shared/EmptyState'
import { useEMIStore } from '../store/emiStore'
import { useSettingsStore } from '../store/settingsStore'
import { formatMoney } from '../utils/formatMoney'
import { Plus, X, CheckCircle, AlertCircle, Trash2, Calendar, Banknote } from 'lucide-react'
import { format, parseISO, differenceInDays } from 'date-fns'

const S = { fontFamily: "'Nunito', sans-serif" }

// Premium BottomSheet
function BottomSheet({ show, onClose, title, children }) {
  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-[70]" style={{ background: 'rgba(15,23,42,0.4)' }} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 350 }}
            className="fixed bottom-0 left-0 right-0 z-[71] pb-safe bg-white flex flex-col"
            style={{ borderRadius: '40px 40px 0 0', maxHeight: '90dvh', boxShadow: '0 -20px 40px rgba(0,0,0,0.1)' }}>
            <div className="w-12 h-1.5 bg-[#EEF2FF] rounded-full mx-auto mt-4 mb-4" />
            <div className="flex items-center justify-between px-6 mb-5">
              <h3 className="text-[22px] font-[800] text-[#0F172A] tracking-tight" style={S}>{title}</h3>
              <button onClick={onClose} className="w-11 h-11 rounded-full bg-[#F8F9FF] flex items-center justify-center border border-[#F0F0F8]">
                <X className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-8 scrollbar-hide">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function AddEMISheet({ onSave, onClose, show }) {
  const [form, setForm] = useState({ name: '', lender: '', totalAmount: '', emiAmount: '', startDate: format(new Date(), 'yyyy-MM-dd'), months: '', interestRate: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const handleSave = () => {
    if (!form.name || !form.emiAmount || !form.months) return
    onSave({ ...form, totalAmount: parseFloat(form.totalAmount) || 0, emiAmount: parseFloat(form.emiAmount), months: parseInt(form.months), interestRate: parseFloat(form.interestRate) || 0 })
    onClose()
  }
  return (
    <BottomSheet show={show} onClose={onClose} title="Add Loan / EMI">
        <div className="space-y-5 mb-8">
            <div>
                <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-2 ml-1" style={S}>Service Name</p>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. iPhone EMI, Home Loan"
                    className="w-full py-4.5 px-6 rounded-[22px] bg-[#F8F7FF] border border-[#F0F0F8] outline-none text-[16px] font-[800] text-[#0F172A] placeholder-[#CBD5E1]" style={S} />
            </div>
            <div>
                <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-2 ml-1" style={S}>Lender / Bank</p>
                <input value={form.lender} onChange={e => set('lender', e.target.value)} placeholder="e.g. HDFC, Bajaj Finance"
                    className="w-full py-4.5 px-6 rounded-[22px] bg-[#F8F7FF] border border-[#F0F0F8] outline-none text-[16px] font-[800] text-[#0F172A] placeholder-[#CBD5E1]" style={S} />
            </div>
            <div className="flex gap-4">
                <div className="flex-1">
                    <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-2 ml-1" style={S}>Monthly EMI</p>
                    <input type="number" value={form.emiAmount} onChange={e => set('emiAmount', e.target.value)} placeholder="0"
                        className="w-full py-4 px-5 rounded-[18px] bg-[#F8F7FF] border border-[#F0F0F8] outline-none text-[18px] font-[800] text-[#0F172A]" style={S} />
                </div>
                <div className="flex-1">
                    <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-2 ml-1" style={S}>Total Months</p>
                    <input type="number" value={form.months} onChange={e => set('months', e.target.value)} placeholder="12"
                        className="w-full py-4 px-5 rounded-[18px] bg-[#F8F7FF] border border-[#F0F0F8] outline-none text-[18px] font-[800] text-[#0F172A]" style={S} />
                </div>
            </div>
            <div>
                <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-2 ml-1" style={S}>Commencement Date</p>
                <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
                    className="w-full py-4.5 px-6 rounded-[22px] bg-[#F8F7FF] border border-[#F0F0F8] outline-none text-[16px] font-[800] text-[#0F172A]" style={S} />
            </div>
        </div>
        <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave}
          className="w-full py-5 rounded-[22px] text-white font-[800] text-[16px] shadow-lg shadow-[#7C6FF720] flex items-center justify-center gap-2" 
          style={{ background: 'var(--gradient-primary)', ...S }}>
          Assign Tracker
        </motion.button>
    </BottomSheet>
  )
}

function EMICard({ emi, currency, onMarkPaid, onDelete }) {
  const paidMonths = emi.paidMonths || 0
  const progress = Math.min((paidMonths / emi.months) * 100, 100)
  const remaining = emi.months - paidMonths
  const paidAmount = paidMonths * emi.emiAmount
  const remainingAmount = remaining * emi.emiAmount
  const daysToNext = emi.nextDueDate ? differenceInDays(parseISO(emi.nextDueDate), new Date()) : null
  const isOverdue = daysToNext !== null && daysToNext < 0
  const isDueSoon = daysToNext !== null && daysToNext >= 0 && daysToNext <= 3

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#F0F0F8] rounded-[32px] p-6 shadow-sm group">
      
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[20px] bg-[#F8F7FF] border border-[#F0F0F8] flex items-center justify-center text-[#7C6FF7]">
            <Banknote className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-[18px] font-[800] text-[#0F172A] tracking-tight leading-tight" style={S}>{emi.name}</h4>
            <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-wider" style={S}>{emi.lender || 'Credit Account'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[20px] font-[800] text-[#F43F5E] tracking-tight" style={S}>-{formatMoney(emi.emiAmount, currency)}</p>
          <p className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest mt-0.5" style={S}>{remaining} INST. LEFT</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-baseline mb-2">
           <span className="text-[12px] font-[800] text-[#94A3B8]" style={S}>{Math.round(progress)}% Liquidation</span>
           <span className="text-[12px] font-[800] text-[#0F172A]" style={S}>{formatMoney(remainingAmount, currency)} Unpaid</span>
        </div>
        <div className="h-2.5 bg-[#F8F7FF] border border-[#F0F0F8] rounded-full overflow-hidden">
          <motion.div className="h-full bg-[#7C6FF7] rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }} />
        </div>
      </div>

      {emi.nextDueDate && (
        <div className={`flex items-center gap-2 mb-6 p-4 rounded-[20px] border ${isOverdue ? 'bg-[#FFF5F5] border-[#FFE0E0] text-[#F43F5E]' : 'bg-[#F8F7FF] border-[#F0F0F8] text-[#64748B]'}`}>
           {isOverdue ? <AlertCircle className="w-4 h-4" /> : <Calendar className="w-4 h-4 text-[#94A3B8]" />}
           <p className="text-[13px] font-[800] tracking-tight" style={S}>
             Next: {format(parseISO(emi.nextDueDate), 'dd MMM yyyy')}
             {isOverdue && ' (OVERDUE)'}
             {isDueSoon && !isOverdue && ` (Due in ${daysToNext} days)`}
           </p>
        </div>
      )}

      <div className="flex gap-3">
        <motion.button whileTap={{ scale: 0.96 }} onClick={() => onMarkPaid(emi.id)}
          className="flex-[2] py-4 rounded-[18px] bg-[#7C6FF7] text-white font-[800] text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#7C6FF720]">
          <CheckCircle className="w-4 h-4" strokeWidth={3} /> Log Payment
        </motion.button>
        <motion.button whileTap={{ scale: 0.96 }} onClick={() => onDelete(emi.id)} 
          className="flex-1 py-4 rounded-[18px] bg-[#F8F7FF] border border-[#F0F0F8] text-[#94A3B8] font-[800] text-[13px] flex items-center justify-center">
          <Trash2 className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  )
}

export default function EMIScreen() {
  const { emis, loadEMIs, addEMI, markPaid, removeEMI, thisMonthTotal } = useEMIStore()
  const { settings } = useSettingsStore()
  const currency = settings?.currency || 'USD'
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => { loadEMIs() }, [])

  const monthlyTotal = thisMonthTotal()

  return (
    <div className="flex flex-col min-h-dvh bg-[#F8F7FF] pb-24">
      <TopHeader title="EMI Tracker" />

      {emis.length > 0 && (
        <div className="mx-6 mb-8 mt-2 rounded-[36px] p-8 text-white relative overflow-hidden shadow-xl" 
             style={{ background: 'linear-gradient(135deg, #F43F5E, #FB7185)' }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white opacity-10 -mr-16 -mt-16" />
          <p className="text-[12px] font-[800] text-white/70 uppercase tracking-[0.25em] mb-2" style={S}>Current Liability</p>
          <p className="text-[42px] font-[800] leading-none tracking-tighter" style={S}>-{formatMoney(monthlyTotal, currency)}</p>
          <div className="flex items-center gap-2 mt-6">
             <div className="px-3 py-1 rounded-full bg-white/20 border border-white/20">
                <p className="text-[10px] font-[800] text-white uppercase tracking-wider" style={S}>{emis.filter(e => e.isActive).length} Active Loans</p>
             </div>
          </div>
        </div>
      )}

      {emis.length === 0 ? (
        <EmptyState type="emis" title="No Obligations" message="Your active loan repository is currently vacant. Initialize a tracker to begin." />
      ) : (
        <div className="px-6 flex flex-col gap-6 pb-24">
          {emis.map(emi => (
            <EMICard key={emi.id} emi={emi} currency={currency} onMarkPaid={markPaid} onDelete={removeEMI} />
          ))}
        </div>
      )}

      {/* FAB */}
      <motion.button 
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} 
        onClick={() => setShowAdd(true)}
        className="fixed bottom-28 right-6 w-16 h-16 rounded-[22px] text-white shadow-xl flex items-center justify-center z-40"
        style={{ background: 'var(--gradient-primary)' }}>
        <Plus className="w-8 h-8" strokeWidth={3} />
      </motion.button>

      <AddEMISheet show={showAdd} onSave={addEMI} onClose={() => setShowAdd(false)} />
    </div>
  )
}
