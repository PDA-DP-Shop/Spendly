// Expenses screen — calendar strip, income/expense cards, and full expense list
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import TopHeader from '../components/shared/TopHeader'
import CalendarStrip from '../components/shared/CalendarStrip'
import SalaryExpenseCards from '../components/cards/SalaryExpenseCards'
import TransactionItem from '../components/cards/TransactionItem'
import EmptyState from '../components/shared/EmptyState'
import ToastMessage from '../components/shared/ToastMessage'
import { useExpenses } from '../hooks/useExpenses'
import { useSettingsStore } from '../store/settingsStore'
import { calculateSpent, calculateReceived } from '../utils/calculateTotal'
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns'

const HAPTIC_SHAKE = {
  tap: { 
    x: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.35, ease: "easeInOut" }
  }
}

export default function ExpensesScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { expenses, deleteExpense, restoreExpense, isLoading } = useExpenses()
  const { settings } = useSettingsStore()
  const currency = settings?.currency || 'USD'
  const [selectedDate, setSelectedDate] = useState(null)
  const [toast, setToast] = useState(null)
  const S = { fontFamily: "'Inter', sans-serif" }

  // Filter by selected date or show all this month
  const filtered = expenses.filter(e => {
    if (selectedDate) return e.date && e.date.startsWith(selectedDate)
    try {
      const d = parseISO(e.date)
      return isWithinInterval(d, { start: startOfMonth(new Date()), end: endOfMonth(new Date()) })
    } catch { return false }
  })

  const spent = calculateSpent(filtered)
  const received = calculateReceived(filtered)

  const handleDelete = async (id) => {
    const deleted = await deleteExpense(id)
    setToast({
      id: Date.now(), type: 'success', message: t('common.done'), duration: 4000,
      action: { label: t('common.undo'), fn: async () => { await restoreExpense(deleted); setToast(null) } },
    })
  }

  return (
    <div className="flex flex-col min-h-dvh mb-tab bg-white safe-top">
      <TopHeader title={t('home.recent')} showBell />

      <div className="mt-4">
        <CalendarStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      </div>

      <div className="mt-8">
        <SalaryExpenseCards 
          income={received} 
          expense={spent} 
          currency={currency} 
          labels={{ income: t('home.inflow'), expense: t('home.spent') }}
        />
      </div>

      <div className="mt-12 pb-24">
        <div className="flex items-center justify-between px-7 mb-8">
          <div className="flex flex-col">
            <h2 className="text-[22px] font-[800] text-black tracking-tight" style={S}>
              {selectedDate ? format(new Date(selectedDate), 'dd MMMM, yyyy') : t('home.recent')}
            </h2>
            <p className="text-[12px] font-[600] text-[#AFAFAF] mt-1" style={S}>
              {selectedDate ? t('common.filtered') : t('home.activity')}
            </p>
          </div>
          {selectedDate && (
            <motion.button variants={HAPTIC_SHAKE} whileTap="tap"
              onClick={() => setSelectedDate(null)} 
              className="text-[12px] font-[700] text-black bg-[#F6F6F6] px-5 py-2.5 rounded-full border border-[#EEEEEE] shadow-sm" 
              style={S}>
              {t('common.reset')}
            </motion.button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-12">
            <EmptyState 
              type="expenses" 
              title="No records found" 
              message="No transactions were logged for the selected period." 
              onAction={() => navigate('/add?mode=type')} 
              action="Add Transaction" 
            />
          </div>
        ) : (
          <div className="flex flex-col">
            {filtered.map((exp, i) => (
              <TransactionItem
                key={exp.id}
                expense={exp}
                currency={currency}
                index={i}
                onDelete={handleDelete}
                onEdit={() => navigate(`/add?edit=${exp.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <ToastMessage toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
