// Settings state store using Zustand — user profile, theme, currency, notifications
import { create } from 'zustand'
import { settingsService } from '../services/database'

export const useSettingsStore = create((set, get) => ({
  settings: null,
  isLoaded: false,

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
  },

  // Update a setting value
  updateSetting: async (key, value) => {
    await settingsService.update({ [key]: value })
    set(s => ({ settings: { ...s.settings, [key]: value } }))
    // Handle theme changes
    if (key === 'theme') {
      localStorage.setItem('spendly-theme', value)
      if (value === 'dark') document.documentElement.classList.add('dark')
      else if (value === 'light') document.documentElement.classList.remove('dark')
      else if (value === 'auto') {
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

  getCurrency: () => get().settings?.currency || 'USD',
  getName: () => get().settings?.name || 'Friend',
  getEmoji: () => get().settings?.emoji || '😊',
  getTheme: () => get().settings?.theme || 'light',
  getMonthlyBudget: () => get().settings?.monthlyBudget || 2000,
}))
