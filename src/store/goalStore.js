import { create } from 'zustand'
import { goalService } from '../services/database'
import { differenceInDays, parseISO } from 'date-fns'

export const useGoalStore = create((set, get) => ({
  goals: [],
  isLoading: false,

  loadGoals: async () => {
    set({ isLoading: true })
    try {
      const goals = await goalService.getAll()
      set({ goals, isLoading: false })
    } catch { set({ isLoading: false }) }
  },

  addGoal: async (goal) => {
    const fullGoal = { ...goal, savedAmount: goal.savedAmount || 0, isComplete: false }
    const id = await goalService.add(fullGoal)
    set(s => ({ goals: [{ ...fullGoal, id }, ...s.goals] }))
    return id
  },

  addSavings: async (id, amount) => {
    const goal = get().goals.find(g => g.id === id)
    if (!goal) return false
    const savedAmount = Math.min((goal.savedAmount || 0) + amount, goal.targetAmount)
    const isComplete = savedAmount >= goal.targetAmount
    await goalService.update(id, { savedAmount, isComplete })
    set(s => ({ goals: s.goals.map(g => g.id === id ? { ...g, savedAmount, isComplete } : g) }))
    return isComplete // returns true when just reached 100%
  },

  removeGoal: async (id) => {
    await goalService.remove(id)
    set(s => ({ goals: s.goals.filter(g => g.id !== id) }))
  },

  nearestGoal: () => {
    const incomplete = get().goals.filter(g => !g.isComplete)
    if (!incomplete.length) return null
    // nearest by target date
    return incomplete.sort((a, b) => {
      try { return differenceInDays(parseISO(a.targetDate), parseISO(b.targetDate)) } catch { return 0 }
    })[0]
  },
}))
