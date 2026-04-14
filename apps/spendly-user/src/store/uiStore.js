import { create } from 'zustand'

export const useUIStore = create((set) => ({
  notificationsOpen: false,
  hasUnreadNotifications: false,
  
  // Data Safety & Persistence
  browserState: { browser: 'other', isPWA: false, isWrong: false },
  storageHealth: { isPersisted: false, usedMB: 0, totalMB: 0 },
  banners: {
    browser: false,
    backup: false,
    install: false
  },

  setBrowserState: (state) => set({ browserState: state }),
  setStorageHealth: (health) => set({ storageHealth: health }),
  setBanner: (type, visible) => set((s) => ({ 
    banners: { ...s.banners, [type]: visible } 
  })),

  setHasUnreadNotifications: (val) => set({ hasUnreadNotifications: val }),
  toggleNotifications: () => set((s) => ({ 
    notificationsOpen: !s.notificationsOpen,
    hasUnreadNotifications: s.notificationsOpen ? s.hasUnreadNotifications : false 
  })),
  closeNotifications: () => set({ notificationsOpen: false }),
}))
