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
    <div className="flex flex-col min-h-dvh mb-tab bg-white">
      <TopHeader title="Activities" showBell />

      {/* Calendar Strip */}
      <CalendarStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      {/* Income + Expense cards (using new glass style) */}
      <div className="mt-4">
        <SalaryExpenseCards income={received} expense={spent} currency={currency} />
      </div>

      {/* Activities list */}
      <div className="mt-8">
        <div className="flex items-center justify-between px-5 mb-4">
          <p className="text-[16px] font-semibold text-[#0F172A] tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {selectedDate ? format(new Date(selectedDate), 'MMMM d, yyyy') : 'Recent Activity'}
          </p>
          {selectedDate && (
            <button onClick={() => setSelectedDate(null)} className="text-[13px] font-semibold text-[#6366F1]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Clear Filter
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <EmptyState 
            type="expenses" 
            title="No Records Found" 
            message="Your financial history is empty for this period." 
            action={() => navigate('/add?mode=type')} 
            actionLabel="Initialize Record" 
          />
        ) : (
          <div className="flex flex-col gap-3">
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
