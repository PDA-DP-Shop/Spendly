/**
 * Backup Service — Manage reminders and history for data backups
 */
import { db } from './database'

export const backupService = {
  /**
   * Log a successful backup
   */
  async logBackup(recordCount, fileName) {
    const timestamp = new Date().toISOString()
    await db.backupHistory.add({
      backedUpAt: timestamp,
      recordCount,
      fileName
    })
    
    // Also save to settings for quick access
    localStorage.setItem('spendly_last_backup_date', timestamp)
    return timestamp
  },

  /**
   * Get the last backup date
   */
  async getLastBackup() {
    const history = await db.backupHistory.reverse().toArray()
    return history[0] || null
  },

  /**
   * Determine if a backup reminder should be shown
   */
  async shouldRemind() {
    const lastBackup = await this.getLastBackup()
    const browserInfo = await db.browserInfo.get(1)
    
    if (!browserInfo) return false
    
    const firstOpened = new Date(browserInfo.firstOpenedAt).getTime()
    const now = Date.now()
    const daysSinceStart = (now - firstOpened) / (1000 * 60 * 60 * 24)
    
    // Rule 1: Never backed up + 7 days of use
    if (!lastBackup) {
      return daysSinceStart >= 7
    }
    
    // Rule 2: Last backup > 30 days
    const lastBackupTime = new Date(lastBackup.backedUpAt).getTime()
    const daysSinceBackup = (now - lastBackupTime) / (1000 * 60 * 60 * 24)
    
    return daysSinceBackup >= 30
  }
}
