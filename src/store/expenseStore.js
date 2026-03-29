// Expense state store using Zustand — loads and caches expenses from IndexedDB
import { create } from 'zustand'
import { expenseService } from '../services/database'

export const useExpenseStore = create((set, get) => ({
  expenses: [],
  isLoading: false,
  lastSaved: null,

  // Load all expenses from DB
  loadExpenses: async () => {
    set({ isLoading: true })
    try {
      const expenses = await expenseService.getAll()
      set({ expenses, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
    }
  },

  // Add a new expense
  addExpense: async (expense) => {
    const id = await expenseService.add(expense)
    const newExpense = { ...expense, id }
    set(s => ({ expenses: [newExpense, ...s.expenses], lastSaved: new Date() }))
    return id
  },

  // Update existing expense
  updateExpense: async (id, changes) => {
    await expenseService.update(id, changes)
    set(s => ({
      expenses: s.expenses.map(e => e.id === id ? { ...e, ...changes } : e)
    }))
  },

  // Delete expense (with undo support — returns the deleted expense)
  deleteExpense: async (id) => {
    const expense = get().expenses.find(e => e.id === id)
    await expenseService.remove(id)
    set(s => ({ expenses: s.expenses.filter(e => e.id !== id) }))
    return expense
  },

  // Put expense back (for undo)
  restoreExpense: async (expense) => {
    const id = await expenseService.add(expense)
    const restored = { ...expense, id }
    set(s => ({ expenses: [restored, ...s.expenses] }))
  },

  // Get filtered + searched expenses
  getFiltered: (category, dateStr) => {
    const expenses = get().expenses
    let filtered = expenses
    if (category && category !== 'all') filtered = filtered.filter(e => e.category === category)
    if (dateStr) filtered = filtered.filter(e => e.date && e.date.startsWith(dateStr))
    return filtered
  },
}))
