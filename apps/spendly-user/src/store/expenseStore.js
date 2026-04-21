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
      const { useSettingsStore } = await import('./settingsStore')
      const currency = useSettingsStore.getState().settings?.currency || 'INR'
      const expenses = await expenseService.getAll(currency)
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
    const { useSettingsStore } = await import('./settingsStore')
    const currency = useSettingsStore.getState().settings?.currency || 'INR'
    const id = await expenseService.add(expense, currency)
    const newExpense = { ...expense, id, currency }
    set(s => ({ expenses: [newExpense, ...s.expenses], lastSaved: new Date() }))
    return id
  },

  // Update existing expense
  updateExpense: async (id, changes) => {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id
    await expenseService.update(numId, changes)
    
    const { useSettingsStore } = await import('./settingsStore')
    const currency = useSettingsStore.getState().settings?.currency || 'INR'
    const expenses = await expenseService.getAll(currency)
    set({ expenses, lastSaved: new Date() })
  },

  // Delete expense (with soft delete / recursive bin support)
  deleteExpense: async (id) => {
    const { softDeleteService } = await import('../services/softDeleteService')
    const expense = get().expenses.find(e => e.id === id)
    await softDeleteService.softDeleteExpense(id)
    // Remove from active list immediately
    set(s => ({ expenses: s.expenses.filter(e => e.id !== id) }))
    return expense
  },

  // Put expense back (for undo)
  restoreExpense: async (id) => {
    const { softDeleteService } = await import('../services/softDeleteService')
    const success = await softDeleteService.restoreExpense(id)
    if (success) {
<<<<<<< HEAD
      const { useSettingsStore } = await import('./settingsStore')
      const currency = useSettingsStore.getState().settings?.currency || 'INR'
      const { expenseService } = await import('../services/database')
      const expenses = await expenseService.getAll(currency)
      set({ expenses })
    }
    return success;
=======
      const { expenseService } = await import('../services/database')
      const expenses = await expenseService.getAll()
      set({ expenses })
    }
    return success
>>>>>>> 41f113d (upgrade scanner)
  },

  // Get filtered + searched expenses
  getFiltered: (category, dateStr) => {
    const expenses = get().expenses
    let filtered = expenses
    if (category && category !== 'all') filtered = filtered.filter(e => e.category === category)
    if (dateStr) filtered = filtered.filter(e => e.date && e.date.startsWith(dateStr))
    return filtered
  },

  // NEW: Get last 5 unique expenses as shortcuts
  getRecentShortcuts: () => {
    const expenses = get().expenses
    const seen = new Set()
    const shortcuts = []
    
    for (const exp of expenses) {
      if (shortcuts.length >= 5) break
      const key = `${exp.shopName}-${exp.amount}-${exp.category}`
      if (!seen.has(key)) {
        shortcuts.push(exp)
        seen.add(key)
      }
    }
    return shortcuts
  },

  // NEW: Calculate Current Streak
  getStreak: () => {
    const expenses = get().expenses
    if (expenses.length === 0) return 0
    
    // Sort by date desc
    const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date))
    
    let streak = 0
    let lastDate = new Date()
    lastDate.setHours(0,0,0,0)
    
    // Check if added today
    const today = new Date()
    today.setHours(0,0,0,0)
    const hasToday = sorted.some(e => {
      const d = new Date(e.date)
      d.setHours(0,0,0,0)
      return d.getTime() === today.getTime()
    })
    
    if (!hasToday) {
      // Check if added yesterday
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const hasYesterday = sorted.some(e => {
        const d = new Date(e.date)
        d.setHours(0,0,0,0)
        return d.getTime() === yesterday.getTime()
      })
      if (!hasYesterday) return 0
      lastDate = yesterday
    } else {
      lastDate = today
    }
    
    // Count consecutive days backwards
    const daySet = new Set(sorted.map(e => {
      const d = new Date(e.date)
      d.setHours(0,0,0,0)
      return d.getTime()
    }))
    
    let checkDate = new Date(lastDate)
    while (daySet.has(checkDate.getTime())) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    }
    
    return streak
<<<<<<< HEAD
  }
=======
  },

  // ── Unified Scanner Bridge ────────────────────────────────────────────────
  // Bridge between ScansScreen results and AddExpenseScreen pre-fill.
  // Shape: { type, name, amount, date, time, category, source, rawData }
  scannedData: null,
  setScannedData: (data) => set({ scannedData: data }),
  clearScannedData: () => set({ scannedData: null }),
>>>>>>> 41f113d (upgrade scanner)
}))
