import { create } from 'zustand'
import { splitService } from '../services/database'

export const useSplitStore = create((set, get) => ({
  splits: [],
  isLoading: false,

  loadSplits: async () => {
    set({ isLoading: true })
    try {
      const splits = await splitService.getAll()
      set({ splits, isLoading: false })
    } catch { set({ isLoading: false }) }
  },

  addSplit: async (split) => {
    const id = await splitService.add({ ...split, isSettled: false })
    const newSplit = { ...split, id, isSettled: false }
    set(s => ({ splits: [newSplit, ...s.splits] }))
    return id
  },

  settle: async (id) => {
    await splitService.update(id, { isSettled: true, settledAt: new Date().toISOString() })
    set(s => ({ splits: s.splits.map(sp => sp.id === id ? { ...sp, isSettled: true } : sp) }))
  },

  removeSplit: async (id) => {
    await splitService.remove(id)
    set(s => ({ splits: s.splits.filter(sp => sp.id !== id) }))
  },

  totalOwed: () => get().splits
    .filter(sp => !sp.isSettled)
    .reduce((sum, sp) => sum + (sp.owedToMe || 0), 0),
}))
