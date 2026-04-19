// useAppLock hook — handles lock/unlock, wrong PIN attempts, and auto-lock
import { useEffect, useCallback, useState } from 'react'
import { useLockStore } from '../store/lockStore'
import { useSessionStore } from '../store/sessionStore'
import { settingsService } from '../services/database'
import { hashPin, deriveSessionBits, generateSalt } from '../utils/crypto'
import { verifyBiometric as verifyBio, registerBiometric as registerBio } from '../services/biometricAuth'

export const useAppLock = () => {
  const { isLocked, lock, unlock, wrongAttempts, recordWrongAttempt, getLockoutRemaining, resetAutoLockTimer, recordBiometricFailure, biometricBlocked, biometricFailCount } = useLockStore()
  const { setEncryptionKey, clearEncryptionKey } = useSessionStore()

  // Lock when app goes to background
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        clearEncryptionKey()
        lock()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [lock])

  // Verify PIN against saved settings
  const verifyPin = useCallback(async (enteredPin) => {
    const settings = await settingsService.get()
    
    // Check Decoy PIN first
    if (settings?.decoyPin && settings.decoyPin === enteredPin) {
      useLockStore.getState().unlockDecoy()
      return true
    }

    if (!settings?.salt || !settings?.pinHash) {
      // No PIN set (should not happen if app is locked, but handled for safety)
      unlock()
      return true
    }

    const salt = new Uint8Array(Object.values(settings.salt))
    const enteredHash = await hashPin(enteredPin, salt)

    if (settings.pinHash === enteredHash) {
      // Correct PIN -> Derive key bits and unlock
      const bits = await deriveSessionBits(enteredPin, salt)
      setEncryptionKey(bits)
      unlock()
      return true
    } else {
      recordWrongAttempt()
      return false
    }
  }, [unlock, recordWrongAttempt, setEncryptionKey])

  // Verify pattern
  const verifyPattern = useCallback(async (enteredPattern) => {
    const settings = await settingsService.get()
    if (settings?.lockPattern === enteredPattern) {
      unlock()
      return true
    } else {
      recordWrongAttempt()
      return false
    }
  }, [unlock, recordWrongAttempt])

  const setupBiometric = async (name) => {
    const res = await registerBio(name)
    return res.success
  }

  // Biometric unlock via Web Authentication API
  const verifyBiometric = useCallback(async () => {
    if (biometricBlocked) return false
    
    const res = await verifyBio()
    if (res.success) {
      unlock()
      return true
    } else {
      if (res.error !== 'cancelled') {
        recordBiometricFailure()
      }
      return false
    }
  }, [unlock, biometricBlocked, recordBiometricFailure])

  return { isLocked, lock, verifyPin, verifyPattern, setupBiometric, verifyBiometric, wrongAttempts, getLockoutRemaining, resetAutoLockTimer, biometricBlocked, biometricFailCount }
}
