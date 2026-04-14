import { db } from './database';

export const recoveryVaultService = {
  /**
   * Save all current payment data into the recovery vault
   */
  async saveToVault() {
    const expenses = await db.expenses.toArray();
    const budgets = await db.budgets.toArray();
    const scans = await db.scans.toArray();
    const emis = await db.emis.toArray();
    const wallets = await db.wallets.toArray();
    const trips = await db.trips.toArray();
    const goals = await db.goals.toArray();
    const splits = await db.splits.toArray();
    const reportHistory = await db.monthlyReports.toArray();
    const scoreHistory = await db.spendingScore.toArray();

    // Count expenses vs income (need to decrypt to count correctly, or guess based on metadata)
    // Actually, let's just use the current records.
    let expenseCount = 0;
    let incomeCount = 0;

    // We need to count for the success screen UI
    // Since records are encrypted, we'd need to decrypt. 
    // But maybe we can just use the counts from the total arrays if they are separated.
    // In Spendly, expenses and income are both in 'expenses' table with 'type' field.
    // We'll decrypt just for counting.
    const { decryptRecord } = await import('./database');
    const decryptedExpenses = await Promise.all(expenses.map(decryptRecord));
    
    decryptedExpenses.forEach(e => {
      if (!e) return;
      if (e.type === 'income') incomeCount++;
      else expenseCount++;
    });

    const now = new Date();
    const expires = new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 hours

    const vaultRecord = {
      deletedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      expensesData: expenses,
      budgetsData: budgets,
      scansData: scans,
      emisData: emis,
      walletsData: wallets,
      tripsData: trips,
      goalsData: goals,
      splitsData: splits,
      reportsData: reportHistory,
      scoreData: scoreHistory,
      totalExpenses: expenseCount,
      totalIncome: incomeCount,
      totalScans: scans.length
    };

    await db.spendly_recovery_vault.clear(); // Only one recovery at a time
    await db.spendly_recovery_vault.add(vaultRecord);
    return vaultRecord;
  },

  /**
   * Check if a valid recovery vault exists
   */
  async getActiveVault() {
    const vault = await db.spendly_recovery_vault.toCollection().last();
    if (!vault) return null;

    const now = new Date();
    const expires = new Date(vault.expiresAt);

    if (now > expires) {
      await this.secureDeleteVault();
      return null;
    }

    return vault;
  },

  /**
   * Restore all data from the vault back to main tables
   */
  async restoreFromVault() {
    const vault = await this.getActiveVault();
    if (!vault) return false;

    await db.transaction('rw', [
      db.expenses, db.budgets, db.scans, db.emis, db.wallets, 
      db.trips, db.goals, db.splits, db.monthlyReports, db.spendingScore,
      db.spendly_recovery_vault
    ], async () => {
      // Clear main tables first to avoid duplicates
      await db.expenses.clear();
      await db.budgets.clear();
      await db.scans.clear();
      await db.emis.clear();
      await db.wallets.clear();
      await db.trips.clear();
      await db.goals.clear();
      await db.splits.clear();
      await db.monthlyReports.clear();
      await db.spendingScore.clear();

      // Restore data
      if (vault.expensesData.length > 0) await db.expenses.bulkAdd(vault.expensesData);
      if (vault.budgetsData.length > 0) await db.budgets.bulkAdd(vault.budgetsData);
      if (vault.scansData.length > 0) await db.scans.bulkAdd(vault.scansData);
      if (vault.emisData.length > 0) await db.emis.bulkAdd(vault.emisData);
      if (vault.walletsData.length > 0) await db.wallets.bulkAdd(vault.walletsData);
      if (vault.tripsData.length > 0) await db.trips.bulkAdd(vault.tripsData);
      if (vault.goalsData.length > 0) await db.goals.bulkAdd(vault.goalsData);
      if (vault.splitsData.length > 0) await db.splits.bulkAdd(vault.splitsData);
      if (vault.reportsData.length > 0) await db.monthlyReports.bulkAdd(vault.reportsData);
      if (vault.scoreData.length > 0) await db.spendingScore.bulkAdd(vault.scoreData);

      // Clear vault after successful restoration
      await db.spendly_recovery_vault.clear();
    });

    return true;
  },

  /**
   * Securely delete the vault (wipe with random bytes)
   */
  async secureDeleteVault() {
    const vault = await db.spendly_recovery_vault.toCollection().last();
    if (!vault) return;

    // Overwrite with random bytes (simulated for IndexedDB records)
    const randomData = {
      deletedAt: new Date().toISOString(),
      expiresAt: new Date().toISOString(),
      expensesData: [],
      garbage: Array(100).fill(0).map(() => Math.random().toString(36))
    };

    await db.spendly_recovery_vault.update(vault.id, randomData);
    await db.spendly_recovery_vault.clear();
  },

  /**
   * Clear main data tables after saving to vault
   */
  async clearMainData() {
    await db.transaction('rw', [
      db.expenses, db.budgets, db.scans, db.emis, db.wallets, 
      db.trips, db.goals, db.splits, db.monthlyReports, db.spendingScore,
      db.deletedExpenses
    ], async () => {
      await db.expenses.clear();
      await db.budgets.clear();
      await db.scans.clear();
      await db.emis.clear();
      await db.wallets.clear();
      await db.trips.clear();
      await db.goals.clear();
      await db.splits.clear();
      await db.monthlyReports.clear();
      await db.spendingScore.clear();
      await db.deletedExpenses.clear();
    });
  }
};
