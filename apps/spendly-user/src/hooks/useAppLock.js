// useAppLock hook — handles lock/unlock, wrong PIN attempts, and auto-lock
import { useEffect, useCallback, useState } from 'react'
import { useLockStore } from '../store/lockStore'
import { useSessionStore } from '../store/sessionStore'
import { settingsService } from '../services/database'
import { hashPin, deriveSessionBits, generateSalt } from '../utils/crypto'

export const useAppLock = () => {
  const { isLocked, lock, unlock, wrongAttempts, recordWrongAttempt, getLockoutRemaining, resetAutoLockTimer } = useLockStore()
  const { setEncryptionKey, clearEncryptionKey } = useSessionStore()
  const [biometricFailures, setBiometricFailures] = useState(0)

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

    if (!settings?.lockSalt || !settings?.lockPinHash) {
      // No PIN set (should not happen if app is locked, but handled for safety)
      unlock()
      return true
    }

    const salt = new Uint8Array(Object.values(settings.lockSalt))
    const enteredHash = await hashPin(enteredPin, salt)

    if (settings.lockPinHash === enteredHash) {
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

  const setupBiometric = async () => {
    try {
      if (!window.PublicKeyCredential) return false
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      if (!available) return false
      
      const userId = new Uint8Array(16)
      window.crypto.getRandomValues(userId)
      const challenge = new Uint8Array(32)
      window.crypto.getRandomValues(challenge)
      
      const rpId = window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "Spendly Local", id: rpId },
          user: { id: userId, name: "Spendly User", displayName: "Spendly User" },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
          authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
          timeout: 60000,
        }
      })

      if (credential) {
        const credentialId = Array.from(new Uint8Array(credential.rawId))
        await settingsService.update({ biometricCredentialId: credentialId })
        return true
      }
      return false
    } catch (e) {
      console.error(e)
      return false
    }
  }

  // Biometric unlock via Web Authentication API
  const verifyBiometric = useCallback(async () => {
    if (biometricFailures >= 2) return false
    
    try {
      const settings = await settingsService.get()
      if (!settings?.biometricCredentialId) return false

      const challenge = new Uint8Array(32)
      window.crypto.getRandomValues(challenge)

      // Convert back to ArrayBuffer
      const credentialId = new Uint8Array(settings.biometricCredentialId).buffer
      const rpId = window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          rpId,
          allowCredentials: [{ type: "public-key", id: credentialId }],
          userVerification: "required",
          timeout: 60000,
        }
      })

      if (credential) {
        unlock()
        setBiometricFailures(0)
        return true
      }
      return false
    } catch (e) {
      console.error(e)
      setBiometricFailures(f => f + 1)
      return false
    }
  }, [unlock, biometricFailures])

  return { isLocked, lock, verifyPin, verifyPattern, setupBiometric, verifyBiometric, wrongAttempts, getLockoutRemaining, resetAutoLockTimer }
}
