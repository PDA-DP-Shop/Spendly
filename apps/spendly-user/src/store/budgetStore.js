// Budget state store using Zustand — manages monthly category limits
import { create } from 'zustand'
import { budgetService } from '../services/database'
import { useSettingsStore } from './settingsStore'

export const useBudgetStore = create((set, get) => ({
  budgets: [],
  overallBudget: 2000,
  currentMonth: new Date().getMonth() + 1,
  currentYear: new Date().getFullYear(),

  // Load this month's budgets from DB
  loadBudgets: async () => {
    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()
    const budgets = await budgetService.getByMonth(month, year)
    const overallBudget = await budgetService.getOverall(month, year)
    set({ budgets, overallBudget, currentMonth: month, currentYear: year })
  },

  // Set budget for a category
  setCategoryBudget: async (category, limit) => {
    const { currentMonth, currentYear } = get()
    await budgetService.setCategory(category, limit, currentMonth, currentYear)
    await get().loadBudgets()
  },

  // Set overall monthly budget
  setOverallBudget: async (amount) => {
    await budgetService.setOverall(amount, get().currentMonth, get().currentYear)
    // Sync with settings store - Static Sync
    await useSettingsStore.getState().updateSetting('monthlyBudget', amount)
    set({ overallBudget: amount })
  },

  // Get budget for a category
  getCategoryBudget: (category) => {
    return get().budgets.find(b => b.category === category)?.monthlyLimit || 0
  },

  // Calculate progress percentage
  getBudgetProgress: (category, spent) => {
    const limit = get().getCategoryBudget(category)
    if (limit === 0) return 0
    return Math.min((spent / limit) * 100, 100)
  },
}))
