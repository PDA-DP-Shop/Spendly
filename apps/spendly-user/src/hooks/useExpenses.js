// useExpenses hook — loads and subscribes to expense data from Zustand store
import { useEffect } from 'react'
import { useExpenseStore } from '../store/expenseStore'
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns'

export const useExpenses = () => {
  const { expenses, isLoading, loadExpenses, addExpense, updateExpense, deleteExpense, restoreExpense } = useExpenseStore()

  useEffect(() => {
    if (expenses.length === 0) loadExpenses()
  }, [])

  // Get expenses for current day
  const getToday = () => {
    const today = new Date().toISOString().split('T')[0]
    return expenses.filter(e => e.date?.startsWith(today))
  }

  // Get expenses for current month
  const getThisMonth = () => {
    const start = startOfMonth(new Date())
    const end = endOfMonth(new Date())
    return expenses.filter(e => {
      try {
        const d = parseISO(e.date)
        return isWithinInterval(d, { start, end })
      } catch { return false }
    })
  }

  // Get last N expenses
  const getRecent = (n = 8) => expenses.slice(0, n)

  return {
    expenses,
    isLoading,
    loadExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    restoreExpense,
    getThisMonth,
    getToday,
    getRecent,
  }
}
