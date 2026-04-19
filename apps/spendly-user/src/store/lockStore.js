import { create } from 'zustand'
import { settingsService } from '../services/database'

export const useLockStore = create((set, get) => ({
  isLocked: true,
  isDecoy: false,
  wrongAttempts: 0,
  lockoutUntil: null,
  autoLockTimer: null,
  lockType: 'none',
  biometricEnabled: false,
  biometricFailCount: 0,
  biometricBlocked: false,
  pinHash: null,
  salt: null,

  // Load lockout state from encrypted settings
  loadLockoutState: async () => {
    const settings = await settingsService.get()
    if (settings) {
      set({ 
        wrongAttempts: settings.wrongAttempts || 0,
        lockoutUntil: settings.lockoutUntil || null,
        lockType: settings.lockType || 'none',
        biometricEnabled: settings.biometricEnabled || false,
        pinHash: settings.pinHash || null,
        salt: settings.salt || null
      })
    }
  },

  // Setup initial lock config
  setupLock: async (config) => {
    const updates = {
      lockType: config.type,
      biometricEnabled: config.biometricEnabled,
      pinHash: config.pinHash,
      salt: config.salt,
      wrongAttempts: 0,
      lockoutUntil: null
    }
    await settingsService.update(updates)
    set({ ...updates, isLocked: false })
    if (get().startAutoLockTimer) get().startAutoLockTimer()
  },

  // Lock the app
  lock: () => {
    set({ isLocked: true, isDecoy: false })
  },

  // Unlock with correct credential
  unlock: async () => {
    await settingsService.update({ 
      wrongAttempts: 0, 
      lockoutUntil: null 
    })
    set({ isLocked: false, isDecoy: false, wrongAttempts: 0, lockoutUntil: null, biometricFailCount: 0, biometricBlocked: false })
    get().startAutoLockTimer()
  },

  // Record a biometric failure
  recordBiometricFailure: () => {
    const currentFailCount = get().biometricFailCount + 1
    if (currentFailCount >= 3) {
      set({ biometricFailCount: 0, biometricBlocked: true })
    } else {
      set({ biometricFailCount: currentFailCount })
    }
  },

  // Reset biometric failures manually
  resetBiometricFailures: () => {
    set({ biometricFailCount: 0, biometricBlocked: false })
  },

  // Unlock in Stealth Mode
  unlockDecoy: () => {
    set({ isLocked: false, isDecoy: true, wrongAttempts: 0 })
    get().startAutoLockTimer()
  },

  // Record a wrong PIN/pattern attempt
  recordWrongAttempt: async () => {
    const attempts = get().wrongAttempts + 1
    let lockoutDuration = 0
    
    // User requirements: 5=30s, 10=5m, 15=1h, 20=24h
    if (attempts === 5) {
      lockoutDuration = 30 * 1000 // 30 seconds
    } else if (attempts === 10) {
      lockoutDuration = 5 * 60 * 1000 // 5 minutes
    } else if (attempts === 15) {
      lockoutDuration = 60 * 60 * 1000 // 1 hour
    } else if (attempts >= 20) {
      lockoutDuration = 24 * 60 * 60 * 1000 // 24 hours
    }

    const lockoutUntil = lockoutDuration > 0 ? Date.now() + lockoutDuration : null
    
    await settingsService.update({ 
      wrongAttempts: attempts, 
      lockoutUntil 
    })
    
    set({ wrongAttempts: attempts, lockoutUntil })
  },

  // Check if locked out and how many seconds remain
  getLockoutRemaining: () => {
    const { lockoutUntil } = get()
    if (!lockoutUntil) return 0
    const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000)
    return remaining > 0 ? remaining : 0
  },

  // Start auto-lock countdown timer (1 minute)
  startAutoLockTimer: (seconds = 60) => {
    const { autoLockTimer } = get()
    if (autoLockTimer) clearTimeout(autoLockTimer)
    const timer = setTimeout(() => {
      set({ isLocked: true })
    }, seconds * 1000)
    set({ autoLockTimer: timer })
  },

  // Reset auto-lock timer (called on user activity)
  resetAutoLockTimer: (seconds = 60) => {
    if (!get().isLocked) get().startAutoLockTimer(seconds)
  },

  // Clear timer on unmount
  clearTimer: () => {
    const { autoLockTimer } = get()
    if (autoLockTimer) clearTimeout(autoLockTimer)
    set({ autoLockTimer: null })
  },
}))

