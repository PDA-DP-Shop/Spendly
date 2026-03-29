// Expenses screen — calendar strip, income/expense cards, and full expense list
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
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

export default function ExpensesScreen() {
  const navigate = useNavigate()
  const { expenses, deleteExpense, restoreExpense, isLoading } = useExpenses()
  const { settings } = useSettingsStore()
  const currency = settings?.currency || 'USD'
  const [selectedDate, setSelectedDate] = useState(null)
  const [toast, setToast] = useState(null)

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
      id: Date.now(), type: 'success', message: 'Expense deleted', duration: 4000,
      action: { label: 'Undo', fn: async () => { await restoreExpense(deleted); setToast(null) } },
    })
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F5F5] dark:bg-[#0F0F1A] mb-tab">
      <TopHeader title="Expenses" showBell />

      {/* Calendar */}
      <CalendarStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      {/* Income + Expense cards */}
      <div className="mt-3">
        <SalaryExpenseCards income={received} expense={spent} currency={currency} />
      </div>

      {/* Expenses list */}
      <div className="mt-5">
        <div className="flex items-center justify-between px-4 mb-3">
          <p className="text-[17px] font-sora font-bold text-gray-900 dark:text-white">
            {selectedDate ? format(new Date(selectedDate), 'MMMM d') : 'This Month'}
          </p>
          {selectedDate && (
            <button onClick={() => setSelectedDate(null)} className="text-sm text-purple-600 font-medium">
              Show all
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <EmptyState type="expenses" title="No expenses here" message="Add some expenses to see them" action={() => navigate('/add?mode=type')} actionLabel="Add Expense" />
        ) : (
          filtered.map((exp, i) => (
            <TransactionItem
              key={exp.id}
              expense={exp}
              currency={currency}
              index={i}
              onDelete={handleDelete}
              onEdit={() => navigate(`/add?edit=${exp.id}`)}
            />
          ))
        )}
      </div>

      <ToastMessage toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
