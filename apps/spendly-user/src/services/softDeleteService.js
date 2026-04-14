/**
 * Soft Delete Service — 3-day undo system for expenses
 */
import { db, decryptRecord, encryptRecord } from './database'

export const softDeleteService = {
  /**
   * Move an expense to the recycle bin (soft delete)
   */
  async softDeleteExpense(id) {
    const expense = await db.expenses.get(id)
    if (!expense) return null

    const decrypted = await decryptRecord(expense)
    if (!decrypted) return null

    // Record for recycle bin
    const deletedRecord = {
      originalId: id,
      deletedAt: Date.now(),
      category: decrypted.category,
      type: decrypted.type || 'spent',
      amount: decrypted.amount,
      fullRecord: expense // Store the encrypted blob for perfect restoration
    }

    // Add to deletedExpenses table
    await db.deletedExpenses.add(deletedRecord)

    // Mark original as deleted (optional, but good for UI consistency)
    const updatedRecord = { ...decrypted, isDeleted: true, deletedAt: Date.now() }
    const encrypted = await encryptRecord(updatedRecord)
    await db.expenses.put({ ...encrypted, id })

    return id
  },

  /**
   * Restore an expense from the recycle bin
   */
  async restoreExpense(originalId) {
    const deletedItems = await db.deletedExpenses.where('originalId').equals(originalId).toArray()
    if (deletedItems.length === 0) return false

    const item = deletedItems[0]
    
    // Decrypt the record to strip deleted flags
    const decrypted = await decryptRecord(item.fullRecord)
    if (!decrypted) return false

    const restoredData = { ...decrypted }
    delete restoredData.isDeleted
    delete restoredData.deletedAt

    const encrypted = await encryptRecord(restoredData)
    await db.expenses.put({ ...encrypted, id: originalId })

    // Remove from recycle bin
    await db.deletedExpenses.delete(item.id)
    return true
  },

  /**
   * Get all items currently in the recycle bin
   */
  async getDeletedItems() {
    const items = await db.deletedExpenses.toArray()
    return items.map(item => {
      // Calculate remaining time
      const threeDays = 3 * 24 * 60 * 60 * 1000
      const expiresAt = item.deletedAt + threeDays
      const remainingMs = expiresAt - Date.now()
      
      return {
        ...item,
        remainingMs,
        isExpired: remainingMs <= 0
      }
    }).sort((a,b) => b.deletedAt - a.deletedAt)
  },

  /**
   * Permanently remove items older than 3 days
   */
  async cleanupExpiredDeleted() {
    const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000)
    
    // 1. Find the records in deletedExpenses to get originalIds
    const expired = await db.deletedExpenses.where('deletedAt').below(threeDaysAgo).toArray()
    
    for (const item of expired) {
      // 2. Permanently remove from main expenses table
      await db.expenses.delete(item.originalId)
      // 3. Remove from recycle bin
      await db.deletedExpenses.delete(item.id)
    }
    
    return expired.length
  }
}
