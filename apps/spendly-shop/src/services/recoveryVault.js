import { db } from './database';

export const recoveryVaultService = {
  async saveToVault() {
    const bills = await db.bills.toArray();
    const customers = await db.customers.toArray();
    const savedItems = await db.savedItems.toArray();
    const creditBook = await db.creditBook.toArray();
    const dailySales = await db.dailySales.toArray();

    const now = new Date();
    const expires = new Date(now.getTime() + 72 * 60 * 60 * 1000);

    const vaultRecord = {
      deletedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      billsData: bills,
      customersData: customers,
      itemsData: savedItems,
      creditData: creditBook,
      salesData: dailySales,
      totalBills: bills.length,
      totalCustomers: customers.length,
      totalItems: savedItems.length
    };

    await db.spendly_recovery_vault.clear();
    await db.spendly_recovery_vault.add(vaultRecord);
    return vaultRecord;
  },

  async getActiveVault() {
    const vault = await db.spendly_recovery_vault.toCollection().last();
    if (!vault) return null;
    if (new Date() > new Date(vault.expiresAt)) {
      await this.secureDeleteVault();
      return null;
    }
    return vault;
  },

  async restoreFromVault() {
    const vault = await this.getActiveVault();
    if (!vault) return false;

    await db.transaction('rw', [
      db.bills, db.customers, db.savedItems, db.creditBook, db.dailySales, db.spendly_recovery_vault
    ], async () => {
      await db.bills.clear();
      await db.customers.clear();
      await db.savedItems.clear();
      await db.creditBook.clear();
      await db.dailySales.clear();

      if (vault.billsData.length > 0) await db.bills.bulkAdd(vault.billsData);
      if (vault.customersData.length > 0) await db.customers.bulkAdd(vault.customersData);
      if (vault.itemsData.length > 0) await db.savedItems.bulkAdd(vault.itemsData);
      if (vault.creditData.length > 0) await db.creditBook.bulkAdd(vault.creditData);
      if (vault.salesData.length > 0) await db.dailySales.bulkAdd(vault.salesData);

      await db.spendly_recovery_vault.clear();
    });
    return true;
  },

  async secureDeleteVault() {
    const vault = await db.spendly_recovery_vault.toCollection().last();
    if (!vault) return;
    await db.spendly_recovery_vault.update(vault.id, { garbage: Math.random().toString() });
    await db.spendly_recovery_vault.clear();
  },

  async clearMainData() {
    await db.transaction('rw', [
      db.bills, db.customers, db.savedItems, db.creditBook, db.dailySales, db.deletedBills
    ], async () => {
      await db.bills.clear();
      await db.customers.clear();
      await db.savedItems.clear();
      await db.creditBook.clear();
      await db.dailySales.clear();
      await db.deletedBills.clear();
    });
  }
};
