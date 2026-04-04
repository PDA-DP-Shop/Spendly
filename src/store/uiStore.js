import { create } from 'zustand'

export const useUIStore = create((set) => ({
  notificationsOpen: false,
  hasUnreadNotifications: false,
  setHasUnreadNotifications: (val) => set({ hasUnreadNotifications: val }),
  toggleNotifications: () => set((s) => ({ 
    notificationsOpen: !s.notificationsOpen,
    hasUnreadNotifications: s.notificationsOpen ? s.hasUnreadNotifications : false 
  })),
  closeNotifications: () => set({ notificationsOpen: false }),
}))
