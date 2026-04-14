/**
 * Persistence Service — Manage browser storage safety and persistence
 */
import { db } from './database'

export const persistenceService = {
  /**
   * Request persistent storage from the browser.
   * On iOS Safari, this is often auto-granted if the app is added to home screen.
   */
  async requestPersistence() {
    if (navigator.storage && navigator.storage.persist) {
      const isPersisted = await navigator.storage.persist()
      
      // Save status to DB
      await db.storageInfo.put({
        id: 1,
        isPersisted,
        lastChecked: new Date().toISOString()
      })
      
      return isPersisted
    }
    return false
  },

  /**
   * Check current storage usage and quota
   */
  async checkStorageHealth() {
    let health = {
      isPersisted: false,
      usedMB: 0,
      totalMB: 0,
      percentUsed: 0,
      quotaAvailable: false
    }

    // Check persistence status from DB first
    const info = await db.storageInfo.get(1)
    if (info) health.isPersisted = info.isPersisted

    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate()
      health.usedMB = Math.round(estimate.usage / 1024 / 1024)
      health.totalMB = Math.round(estimate.quota / 1024 / 1024)
      health.percentUsed = Math.round((estimate.usage / estimate.quota) * 100) || 0
      health.quotaAvailable = true
    }

    return health
  },

  /**
   * Get storage info record directly
   */
  async getInfo() {
    return await db.storageInfo.get(1)
  }
}
