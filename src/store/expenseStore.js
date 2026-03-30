// Expense state store using Zustand — loads and caches expenses from IndexedDB
import { create } from 'zustand'
import { expenseService } from '../services/database'
import { useLockStore } from './lockStore'

export const useExpenseStore = create((set, get) => ({
  expenses: [],
  isLoading: false,
  lastSaved: null,

  // Load all expenses from DB
  loadExpenses: async () => {
    if (useLockStore.getState().isDecoy) {
      set({ expenses: [], isLoading: false })
      return
    }
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
    if (useLockStore.getState().isDecoy) {
      const fakeId = Date.now()
      set(s => ({ expenses: [{ ...expense, id: fakeId }, ...s.expenses] }))
      return fakeId
    }
    const id = await expenseService.add(expense)
    const newExpense = { ...expense, id }
    set(s => ({ expenses: [newExpense, ...s.expenses], lastSaved: new Date() }))
    return id
  },

  // Update existing expense
  updateExpense: async (id, changes) => {
    // URL params are strings — Dexie needs the numeric primary key
    const numId = typeof id === 'string' ? parseInt(id, 10) : id
    await expenseService.update(numId, changes)
    // Reload all expenses so in-memory state matches the re-encrypted DB record
    const expenses = await expenseService.getAll()
    set({ expenses, lastSaved: new Date() })
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
