// EMIScreen.jsx — Feature 2: EMI & Loan Tracker
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TopHeader from '../components/shared/TopHeader'
import EmptyState from '../components/shared/EmptyState'
import { useTranslation } from 'react-i18next'
import { useEMIStore } from '../store/emiStore'
import { useSettingsStore } from '../store/settingsStore'
import { formatMoney } from '../utils/formatMoney'
import { Plus, X, CheckCircle, AlertCircle, Trash2, Calendar, Banknote, CreditCard } from 'lucide-react'
import { format, parseISO, differenceInDays } from 'date-fns'

const HAPTIC_SHAKE = {
  tap: { 
    x: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.35, ease: "easeInOut" }
  }
}

function BottomSheet({ show, onClose, title, children }) {
  const S = { fontFamily: "'Inter', sans-serif" }
  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-[70]" style={{ background: 'rgba(0,0,0,0.4)' }} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 350 }}
            className="fixed bottom-0 left-0 right-0 z-[71] pb-safe bg-white flex flex-col"
            style={{ borderRadius: '40px 40px 0 0', maxHeight: '90dvh', boxShadow: '0 -20px 40px rgba(0,0,0,0.1)' }}>
            <div className="w-12 h-1.5 bg-[#F6F6F6] rounded-full mx-auto mt-4 mb-4" />
            <div className="flex items-center justify-between px-8 mb-5 mt-2">
              <h3 className="text-[22px] font-[800] text-black tracking-tight" style={S}>{title}</h3>
              <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={onClose} 
                className="w-11 h-11 rounded-full bg-[#F6F6F6] flex items-center justify-center border border-[#EEEEEE]">
                <X className="w-5 h-5 text-black" strokeWidth={2.5} />
              </motion.button>
            </div>
            <div className="flex-1 overflow-y-auto px-8 pb-10 scrollbar-hide">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function AddEMISheet({ onSave, onClose, show }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', lender: '', totalAmount: '', emiAmount: '', startDate: format(new Date(), 'yyyy-MM-dd'), months: '', interestRate: '' })
  const S = { fontFamily: "'Inter', sans-serif" }
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const handleSave = () => {
    if (!form.name || !form.emiAmount || !form.months) return
    onSave({ ...form, totalAmount: parseFloat(form.totalAmount) || 0, emiAmount: parseFloat(form.emiAmount), months: parseInt(form.months), interestRate: parseFloat(form.interestRate) || 0 })
    onClose()
  }
  return (
    <BottomSheet show={show} onClose={onClose} title={t('emis.addLoan')}>
        <div className="space-y-6 mb-10">
            <div>
                <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-wider mb-3 ml-1" style={S}>{t('emis.loanName')}</p>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Car Loan, iPhone EMI"
                    className="w-full py-5 px-7 rounded-[24px] bg-[#F6F6F6] border border-[#EEEEEE] outline-none text-[16px] font-[700] text-black placeholder-[#D8D8D8]" style={S} />
            </div>
            <div>
                <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-wider mb-3 ml-1" style={S}>Lender / Institution</p>
                <input value={form.lender} onChange={e => set('lender', e.target.value)} placeholder="e.g. HDFC Bank, Bajaj"
                    className="w-full py-5 px-7 rounded-[24px] bg-[#F6F6F6] border border-[#EEEEEE] outline-none text-[16px] font-[700] text-black placeholder-[#D8D8D8]" style={S} />
            </div>
            <div className="flex gap-4">
                <div className="flex-1">
                    <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-wider mb-3 ml-1" style={S}>{t('emis.emiAmount') || 'Monthly EMI'}</p>
                    <input type="number" value={form.emiAmount} onChange={e => set('emiAmount', e.target.value)} placeholder="0"
                        className="w-full py-5 px-6 rounded-[22px] bg-[#F6F6F6] border border-[#EEEEEE] outline-none text-[20px] font-[800] text-black" style={S} />
                </div>
                <div className="flex-1">
                    <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-wider mb-3 ml-1" style={S}>{t('emis.tenure')}</p>
                    <input type="number" value={form.months} onChange={e => set('months', e.target.value)} placeholder="12"
                        className="w-full py-5 px-6 rounded-[22px] bg-[#F6F6F6] border border-[#EEEEEE] outline-none text-[20px] font-[800] text-black" style={S} />
                </div>
            </div>
            <div>
                <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-wider mb-3 ml-1" style={S}>Start Date</p>
                <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
                    className="w-full py-5 px-7 rounded-[24px] bg-[#F6F6F6] border border-[#EEEEEE] outline-none text-[16px] font-[700] text-black" style={S} />
            </div>
        </div>
        <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={handleSave}
          className="w-full py-6 rounded-[24px] bg-black text-white font-[800] text-[16px] shadow-xl shadow-black/10 flex items-center justify-center gap-2" 
          style={S}>
          {t('common.save')}
        </motion.button>
    </BottomSheet>
  )
}

function EMICard({ emi, currency, onMarkPaid, onDelete }) {
  const { t } = useTranslation()
  const S = { fontFamily: "'Inter', sans-serif" }
  const paidMonths = emi.paidMonths || 0
  const progress = Math.min((paidMonths / emi.months) * 100, 100)
  const remaining = emi.months - paidMonths
  const remainingAmount = remaining * emi.emiAmount
  const daysToNext = emi.nextDueDate ? differenceInDays(parseISO(emi.nextDueDate), new Date()) : null
  const isOverdue = daysToNext !== null && daysToNext < 0
  const isDueSoon = daysToNext !== null && daysToNext >= 0 && daysToNext <= 3

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-[#F6F6F6] rounded-[36px] p-7 shadow-sm active:shadow-md transition-shadow">
      
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-[24px] bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
            <CreditCard className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <div>
            <h4 className="text-[19px] font-[800] text-black tracking-tight" style={S}>{emi.name}</h4>
            <p className="text-[13px] font-[600] text-[#AFAFAF] mt-0.5" style={S}>{emi.lender || 'Personal Loan'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[22px] font-[800] text-red-600 tracking-tight" style={S}>-{formatMoney(emi.emiAmount, currency)}</p>
          <p className="text-[11px] font-[700] text-[#AFAFAF] uppercase tracking-wider mt-1" style={S}>{remaining} Left</p>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-baseline mb-3">
           <span className="text-[13px] font-[700] text-[#AFAFAF]" style={S}>{Math.round(progress)}% {t('emis.paidItems')}</span>
           <span className="text-[13px] font-[800] text-black" style={S}>{formatMoney(remainingAmount, currency)} {t('common.unpaid') || 'Unpaid'}</span>
        </div>
        <div className="h-3 bg-[#F6F6F6] border border-[#EEEEEE] rounded-full overflow-hidden">
          <motion.div className="h-full bg-red-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.3)]" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }} />
        </div>
      </div>

      {emi.nextDueDate && (
        <div className={`flex items-center gap-3 mb-8 p-5 rounded-[24px] border ${isOverdue ? 'bg-red-50 border-red-100 text-red-600' : 'bg-[#F6F6F6] border-transparent text-[#AFAFAF]'}`}>
           {isOverdue ? <AlertCircle className="w-5 h-5" /> : <Calendar className="w-5 h-5 text-[#D8D8D8]" />}
           <p className="text-[14px] font-[700] tracking-tight" style={S}>
             Next Due: {format(parseISO(emi.nextDueDate), 'dd MMM, yyyy')}
             {isOverdue && ' (OVERDUE)'}
             {isDueSoon && !isOverdue && ` (In ${daysToNext} days)`}
           </p>
        </div>
      )}

      <div className="flex gap-4">
        <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => onMarkPaid(emi.id)}
          className="flex-[2] py-5 rounded-[20px] bg-black text-white font-[800] text-[14px] uppercase tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-black/10">
          <CheckCircle className="w-5 h-5" strokeWidth={2.5} /> {t('emis.paymentSuccess') || 'Log Payment'}
        </motion.button>
        <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => onDelete(emi.id)} 
          className="flex-1 py-5 rounded-[20px] bg-red-50 border border-red-100 text-red-500 flex items-center justify-center">
          <Trash2 className="w-5 h-5" strokeWidth={2.5} />
        </motion.button>
      </div>
    </motion.div>
  )
}

export default function EMIScreen() {
  const { t } = useTranslation()
  const { emis, loadEMIs, markPaid, removeEMI, thisMonthTotal } = useEMIStore()
  const { settings } = useSettingsStore()
  const currency = settings?.currency || 'USD'
  const [showAdd, setShowAdd] = useState(false)
  const S = { fontFamily: "'Inter', sans-serif" }

  useEffect(() => { loadEMIs() }, [])

  const monthlyTotal = thisMonthTotal()

  return (
    <div className="flex flex-col min-h-dvh bg-white pb-24 safe-top">
      <TopHeader title={t('emis.title')} />

      {emis.length > 0 && (
        <div className="mx-6 mb-10 mt-6 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-red-500/10 bg-red-500">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -mr-16 -mt-16" />
          <p className="text-[13px] font-[700] text-red-100 uppercase tracking-widest mb-4" style={S}>Current Dues</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[22px] font-[800] text-red-200" style={S}>{currency}</span>
            <p className="text-[48px] font-[900] leading-none tracking-tighter" style={S}>
                {formatMoney(monthlyTotal, '').replace(/[^0-9.,]/g, '').trim()}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-8 bg-black/10 w-fit px-5 py-2 rounded-full border border-white/10">
             <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
             <p className="text-[12px] font-[800] text-white/90 uppercase tracking-widest" style={S}>Liability Engine</p>
          </div>
        </div>
      )}

      {emis.length === 0 ? (
        <EmptyState type="emis" title={t('emis.activeLoans')} message={t('emis.paymentSuccess') || 'No active loans'} />
      ) : (
        <div className="px-6 flex flex-col gap-8 pb-32">
          {emis.map(emi => (
            <EMICard key={emi.id} emi={emi} currency={currency} onMarkPaid={markPaid} onDelete={removeEMI} />
          ))}
        </div>
      )}

      {/* FAB */}
      <motion.button 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        variants={HAPTIC_SHAKE}
        whileTap="tap"
        onClick={() => setShowAdd(true)}
        className="fixed bottom-28 right-7 w-16 h-16 rounded-full bg-black text-white shadow-2xl flex items-center justify-center z-40 border-4 border-white"
      >
        <Plus className="w-8 h-8" strokeWidth={3} />
      </motion.button>

      <AddEMISheet show={showAdd} onSave={addEMI} onClose={() => setShowAdd(false)} />
    </div>
  )
}
