// Festival state store using Zustand
import { create } from 'zustand'
import { useLockStore } from './lockStore'

export const useFestivalStore = create((set, get) => ({
  festivals: [],
  isLoading: true,
  
  loadFestivals: () => {
    if (useLockStore.getState().isDecoy) {
      set({ festivals: [], isLoading: false })
      return
    }
    try {
      const data = localStorage.getItem('spendly_festivals')
      set({ festivals: data ? JSON.parse(data) : [], isLoading: false })
    } catch (e) {
      set({ festivals: [], isLoading: false })
    }
  },

  addFestival: (festival) => {
    const newFestival = { ...festival, id: Date.now(), isDecoy: useLockStore.getState().isDecoy }
    set(s => {
      const updated = [newFestival, ...s.festivals]
      if (!useLockStore.getState().isDecoy) {
        localStorage.setItem('spendly_festivals', JSON.stringify(updated))
      }
      return { festivals: updated }
    })
  },

  updateFestival: (id, updates) => {
    set(s => {
      const updated = s.festivals.map(f => f.id === id ? { ...f, ...updates } : f)
      if (!useLockStore.getState().isDecoy) {
        localStorage.setItem('spendly_festivals', JSON.stringify(updated))
      }
      return { festivals: updated }
    })
  },

  deleteFestival: (id) => {
    set(s => {
      const updated = s.festivals.filter(f => f.id !== id)
      if (!useLockStore.getState().isDecoy) {
        localStorage.setItem('spendly_festivals', JSON.stringify(updated))
      }
      return { festivals: updated }
    })
  }
}))
