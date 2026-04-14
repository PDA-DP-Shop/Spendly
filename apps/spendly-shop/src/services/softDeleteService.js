/**
 * Soft Delete Service for Spendly Shop — 3-day undo system for bills
 */
import { db, decryptRecord, encryptRecord } from './database';

export const softDeleteBillService = {
  /**
   * Move a bill to the recycle bin (soft delete)
   */
  async softDeleteBill(id) {
    const bill = await db.bills.get(id);
    if (!bill) return null;

    const decrypted = await decryptRecord(bill);
    if (!decrypted) return null;

    // Record for recycle bin
    const deletedRecord = {
      originalId: id,
      deletedAt: Date.now(),
      billNumber: decrypted.billNumber,
      total: decrypted.total,
      fullRecord: bill // Store the encrypted blob for perfect restoration
    };

    // Add to deletedBills table
    await db.deletedBills.add(deletedRecord);

    // Mark original as deleted
    const updatedRecord = { ...decrypted, isDeleted: true, deletedAt: Date.now() };
    const encrypted = await encryptRecord(updatedRecord);
    await db.bills.put({ ...encrypted, id });

    return id;
  },

  /**
   * Restore a bill from the recycle bin
   */
  async restoreBill(originalId) {
    const deletedItems = await db.deletedBills.where('originalId').equals(originalId).toArray();
    if (deletedItems.length === 0) return false;

    const item = deletedItems[0];
    
    // Decrypt the record to strip deleted flags
    const decrypted = await decryptRecord(item.fullRecord);
    if (!decrypted) return false;

    const restoredData = { ...decrypted };
    delete restoredData.isDeleted;
    delete restoredData.deletedAt;

    const encrypted = await encryptRecord(restoredData);
    await db.bills.put({ ...encrypted, id: originalId });

    // Remove from recycle bin
    await db.deletedBills.delete(item.id);
    return true;
  },

  /**
   * Get all bills currently in the recycle bin
   */
  async getDeletedBills() {
    const items = await db.deletedBills.toArray();
    return items.map(item => {
      // Calculate remaining time
      const threeDays = 3 * 24 * 60 * 60 * 1000;
      const expiresAt = item.deletedAt + threeDays;
      const remainingMs = expiresAt - Date.now();
      
      return {
        ...item,
        remainingMs,
        isExpired: remainingMs <= 0
      };
    }).sort((a,b) => b.deletedAt - a.deletedAt);
  },

  /**
   * Permanently remove items older than 3 days
   */
  async cleanupExpiredDeleted() {
    const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
    
    // 1. Find the records in deletedBills to get originalIds
    const expired = await db.deletedBills.where('deletedAt').below(threeDaysAgo).toArray();
    
    for (const item of expired) {
      // 2. Permanently remove from main bills table
      await db.bills.delete(item.originalId);
      // 3. Remove from recycle bin
      await db.deletedBills.delete(item.id);
    }
    
    return expired.length;
  }
};
