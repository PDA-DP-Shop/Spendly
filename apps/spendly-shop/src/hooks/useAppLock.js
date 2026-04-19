import { useState, useCallback, useEffect } from 'react';
import { useLockStore } from '../store/lockStore';
import { biometricAuth } from '../services/biometricAuth';
import { hashPin } from '../services/encryptData';
import { db } from '../db/db';

export function useAppLock() {
  const { 
    isLocked, 
    unlock, 
    pinHash, 
    salt, 
    lockType, 
    biometricEnabled,
    biometricBlocked,
    loadLockoutState,
    recordBiometricFailure,
    resetBiometricFailCount,
    recordWrongAttempt 
  } = useLockStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load state on mount
  useEffect(() => {
    loadLockoutState();
  }, [loadLockoutState]);

  const verifyPin = useCallback(async (pin) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!pinHash || !salt) return false;
      
      const hashHex = await hashPin(pin, salt);

      if (hashHex === pinHash) {
        await unlock();
        resetBiometricFailCount();
        return true;
      } else {
        await recordWrongAttempt();
        setError('Invalid PIN');
        return false;
      }
    } catch (err) {
      console.error('PIN verification failed', err);
      setError('Verification failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [pinHash, salt, unlock, recordWrongAttempt, resetBiometricFailCount]);

  const triggerBiometric = useCallback(async () => {
    if (!biometricEnabled || biometricBlocked) return false;

    setIsLoading(true);
    try {
      // Get stored credentialId
      const credentials = await db.biometric_credentials.toArray();
      if (credentials.length === 0) return false;

      const success = await biometricAuth.verify(credentials[0].credentialId);
      if (success) {
        await unlock();
        resetBiometricFailCount();
        return true;
      } else {
        recordBiometricFailure();
        return false;
      }
    } catch (err) {
      console.error('Biometric failed', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [biometricEnabled, biometricBlocked, unlock, recordBiometricFailure, resetBiometricFailCount]);

  return {
    isLocked,
    isLoading,
    error,
    verifyPin,
    triggerBiometric,
    biometricBlocked
  };
}
