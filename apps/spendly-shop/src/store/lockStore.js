import { create } from 'zustand';
import { shopService } from '../services/database';

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

  loadLockoutState: async () => {
    // Note: In Shop App, lock settings might be stored in the shop record or settings
    const all = await shopService.getAll();
    const shop = all[all.length - 1];
    if (shop) {
      set({ 
        wrongAttempts: shop.wrongAttempts || 0,
        lockoutUntil: shop.lockoutUntil || null,
        lockType: shop.lockType || 'none',
        biometricEnabled: shop.biometricEnabled || false,
        pinHash: shop.pinHash || null,
        salt: shop.salt || null
      });
    }
  },

  setupLock: async (config) => {
    const updates = {
      lockType: config.type,
      biometricEnabled: config.biometricEnabled,
      pinHash: config.pinHash,
      salt: config.salt,
      wrongAttempts: 0,
      lockoutUntil: null
    };
    // Update the shop record with lock info
    const all = await shopService.getAll();
    const shop = all[all.length - 1];
    if (shop) {
      await shopService.update(shop.id, updates);
    }
    set({ ...updates, isLocked: false });
    if (get().startAutoLockTimer) get().startAutoLockTimer();
  },

  lock: () => set({ isLocked: true, isDecoy: false }),

  unlock: async () => {
    const all = await shopService.getAll();
    const shop = all[all.length - 1];
    if (shop) {
      await shopService.update(shop.id, { wrongAttempts: 0, lockoutUntil: null });
    }
    set({ isLocked: false, isDecoy: false, wrongAttempts: 0, lockoutUntil: null });
  },

  recordWrongAttempt: async () => {
    const attempts = get().wrongAttempts + 1;
    let lockoutDuration = 0;
    if (attempts === 5) lockoutDuration = 30 * 1000;
    else if (attempts === 10) lockoutDuration = 5 * 60 * 1000;
    else if (attempts === 15) lockoutDuration = 60 * 60 * 1000;
    else if (attempts >= 20) lockoutDuration = 24 * 60 * 60 * 1000;

    const lockoutUntil = lockoutDuration > 0 ? Date.now() + lockoutDuration : null;
    const all = await shopService.getAll();
    const shop = all[all.length - 1];
    if (shop) {
      await shopService.update(shop.id, { wrongAttempts: attempts, lockoutUntil });
    }
    set({ wrongAttempts: attempts, lockoutUntil });
  },

  recordBiometricFailure: () => {
    const nextCount = get().biometricFailCount + 1;
    if (nextCount >= 3) {
      set({ biometricFailCount: nextCount, biometricBlocked: true });
    } else {
      set({ biometricFailCount: nextCount });
    }
  },

  resetBiometricFailCount: () => {
    set({ biometricFailCount: 0, biometricBlocked: false });
  }
}));
