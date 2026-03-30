// EMIScreen.jsx — Feature 2: EMI & Loan Tracker
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TopHeader from '../components/shared/TopHeader'
import EmptyState from '../components/shared/EmptyState'
import { useEMIStore } from '../store/emiStore'
import { useSettingsStore } from '../store/settingsStore'
import { formatMoney } from '../utils/formatMoney'
import { Plus, X, CheckCircle, AlertCircle } from 'lucide-react'
import { format, parseISO, differenceInDays, addDays } from 'date-fns'

function AddEMISheet({ onSave, onClose }) {
  const [form, setForm] = useState({ name: '', lender: '', totalAmount: '', emiAmount: '', startDate: format(new Date(), 'yyyy-MM-dd'), months: '', interestRate: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const handleSave = () => {
    if (!form.name || !form.emiAmount || !form.months) return
    onSave({ ...form, totalAmount: parseFloat(form.totalAmount) || 0, emiAmount: parseFloat(form.emiAmount), months: parseInt(form.months), interestRate: parseFloat(form.interestRate) || 0 })
    onClose()
  }
  return (
    <motion.div className="fixed inset-0 z-50 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div className="relative w-full bg-white dark:bg-[#1A1A2E] rounded-t-[28px] p-6 pb-10 max-h-[85vh] overflow-y-auto"
        initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }} transition={{ type: 'spring', damping: 25 }}>
        <div className="flex items-center justify-between mb-6">
          <p className="text-[18px] font-sora font-bold text-gray-900 dark:text-white">Add EMI / Loan</p>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        {[
          { label: 'Loan / EMI Name *', key: 'name', placeholder: 'e.g. Phone EMI, Home Loan' },
          { label: 'Bank / Lender', key: 'lender', placeholder: 'e.g. HDFC Bank, Bajaj Finance' },
          { label: 'Total Loan Amount', key: 'totalAmount', placeholder: '₹500000', type: 'number' },
          { label: 'EMI per Month *', key: 'emiAmount', placeholder: '₹5000', type: 'number' },
          { label: 'Total Months *', key: 'months', placeholder: '24', type: 'number' },
          { label: 'Interest Rate % (optional)', key: 'interestRate', placeholder: '12', type: 'number' },
        ].map(f => (
          <div key={f.key} className="mb-4">
            <p className="text-[12px] font-semibold text-gray-500 mb-1">{f.label}</p>
            <input type={f.type || 'text'} value={form[f.key]} onChange={e => set(f.key, e.target.value)}
              placeholder={f.placeholder}
              className="w-full py-3 px-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 outline-none text-[15px] text-gray-900 dark:text-white" />
          </div>
        ))}
        <div className="mb-6">
          <p className="text-[12px] font-semibold text-gray-500 mb-1">Start Date</p>
          <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
            className="w-full py-3 px-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 outline-none text-[15px] text-gray-900 dark:text-white" />
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave}
          className="w-full py-4 rounded-[20px] text-white font-semibold" style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}>
          Add EMI
        </motion.button>
      </motion.div>
    </motion.div>
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
    <motion.div className="bg-white dark:bg-[#1A1A2E] rounded-[20px] p-4 shadow-sm"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-sora font-bold text-[16px] text-gray-900 dark:text-white">{emi.name}</p>
          {emi.lender && <p className="text-[12px] text-gray-400">{emi.lender}</p>}
        </div>
        <div className="text-right">
          <p className="text-[20px] font-sora font-bold text-red-500">-{formatMoney(emi.emiAmount, currency)}/mo</p>
          <p className="text-[11px] text-gray-400">{remaining} months left</p>
        </div>
      </div>
      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[11px] text-gray-400 mb-1">
          <span>Paid: {formatMoney(paidAmount, currency)}</span>
          <span>Left: {formatMoney(remainingAmount, currency)}</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div className="h-full bg-purple-600 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ delay: 0.2 }} />
        </div>
        <p className="text-[11px] text-purple-600 mt-1">{Math.round(progress)}% paid</p>
      </div>
      {/* Due date */}
      {emi.nextDueDate && (
        <div className={`flex items-center gap-1.5 mb-3 text-[12px] font-medium ${isOverdue ? 'text-red-500' : isDueSoon ? 'text-orange-500' : 'text-gray-500'}`}>
          {isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : null}
          Next due: {format(parseISO(emi.nextDueDate), 'dd MMM yyyy')}
          {isOverdue && ' — OVERDUE'}
          {isDueSoon && !isOverdue && ` — Due in ${daysToNext} days`}
        </div>
      )}
      <div className="flex gap-2">
        <button onClick={() => onMarkPaid(emi.id)}
          className="flex-1 py-2.5 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 font-semibold text-[13px] flex items-center justify-center gap-1">
          <CheckCircle className="w-4 h-4" /> Mark Paid
        </button>
        <button onClick={() => onDelete(emi.id)} className="px-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 text-[13px]">
          Remove
        </button>
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
    <div className="flex flex-col min-h-dvh bg-[#F5F5F5] dark:bg-[#0F0F1A] mb-tab">
      <TopHeader title="My EMIs" />

      {/* Monthly total hero */}
      {emis.length > 0 && (
        <div className="mx-4 mb-4 rounded-[20px] p-5 text-white" style={{ background: 'linear-gradient(135deg,#EF4444,#DC2626)', boxShadow: '0 8px 32px rgba(239,68,68,0.3)' }}>
          <p className="text-xs opacity-70 uppercase tracking-wide mb-1">This Month's EMIs</p>
          <p className="text-[32px] font-sora font-bold">-{formatMoney(monthlyTotal, currency)}</p>
          <p className="text-sm opacity-70 mt-1">{emis.filter(e => e.isActive).length} active loans</p>
        </div>
      )}

      {emis.length === 0 ? (
        <EmptyState type="emis" title="No EMIs added" message="Track your loans and EMIs here" />
      ) : (
        <div className="px-4 flex flex-col gap-3">
          {emis.map(emi => (
            <EMICard key={emi.id} emi={emi} currency={currency} onMarkPaid={markPaid} onDelete={removeEMI} />
          ))}
        </div>
      )}

      <motion.button whileTap={{ scale: 0.92 }} onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full text-white shadow-xl flex items-center justify-center z-40"
        style={{ background: '#F97316' }}>
        <Plus className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {showAdd && <AddEMISheet onSave={addEMI} onClose={() => setShowAdd(false)} />}
      </AnimatePresence>
    </div>
  )
}
