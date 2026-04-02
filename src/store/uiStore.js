import { create } from 'zustand'

export const useUIStore = create((set) => ({
  showNotifications: false,
  toggleNotifications: () => set((state) => ({ showNotifications: !state.showNotifications })),
  setNotifications: (val) => set({ showNotifications: val }),
}))
