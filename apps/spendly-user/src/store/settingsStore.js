// Settings state store using Zustand — user profile, theme, currency, notifications
import { create } from 'zustand'
import { settingsService } from '../services/database'
import i18n from '../i18n'

export const useSettingsStore = create((set, get) => ({
  settings: null,
  isLoaded: false,
  showPWAInstall: false,
  setPWAInstallVisible: (visible) => set({ showPWAInstall: visible }),

  // Load settings from IndexedDB
  loadSettings: async () => {
    const settings = await settingsService.get()
    set({ settings, isLoaded: true })
    // Apply dark mode if saved
    if (settings?.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (settings?.theme === 'light') {
      document.documentElement.classList.remove('dark')
    } else if (settings?.theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) document.documentElement.classList.add('dark')
    }
    // Apply language if saved
    if (settings?.language) {
      i18n.changeLanguage(settings.language)
    }
  },

  // Update a setting value
  updateSetting: async (key, value) => {
    const updates = typeof key === 'object' ? key : { [key]: value }
    await settingsService.update(updates)
    set(s => ({ settings: { ...s.settings, ...updates } }))
    
    // Handle theme changes
    const theme = updates.theme
    if (theme) {
      localStorage.setItem('spendly-theme', theme)
      if (theme === 'dark') document.documentElement.classList.add('dark')
      else if (theme === 'light') document.documentElement.classList.remove('dark')
      else if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
      }
    }
  },

  // Mark onboarding as complete
  completeOnboarding: async () => {
    await settingsService.update({ onboardingDone: true })
    set(s => ({ settings: { ...s.settings, onboardingDone: true } }))
  },

  getCurrency: () => get().settings?.currency || 'INR',
  getName: () => get().settings?.name || 'Friend',
  getEmoji: () => get().settings?.emoji || '😊',
  getTheme: () => get().settings?.theme || 'light',
  getMonthlyBudget: () => get().settings?.monthlyBudget || 2000,
}))
