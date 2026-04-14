import { db } from './database'

export const backupService = {
  async logBackup(recordCount) {
    await db.backupHistory.add({ backedUpAt: new Date().toISOString() })
    localStorage.setItem('spendly_shop_last_backup', new Date().toISOString())
  },

  async shouldRemind() {
    const lastBackup = await db.backupHistory.reverse().toArray()
    if (lastBackup.length === 0) {
      // Logic: If they have more than 50 bills, remind them if they never backed up
      const bills = await db.bills.count()
      return bills > 50
    }
    const lastTime = new Date(lastBackup[0].backedUpAt).getTime()
    const daysSince = (Date.now() - lastTime) / (1000 * 60 * 60 * 24)
    return daysSince >= 30
  }
}
