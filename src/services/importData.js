// Import and restore Spendly data from encrypted .spendly backup file
import { db } from './database'
import { decryptExport } from './encryptData'
import { secureWipe } from './database'

export const importBackupFile = async (file, password, mode = 'replace') => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const buffer = e.target.result
        const data = await decryptExport(buffer, password)

        if (!data.expenses || !data.settings) {
          throw new Error('Invalid backup file format')
        }

        if (mode === 'replace') {
          // Clear all existing data securely without reloading page
          await secureWipe(true)
          if (data.settings) for (const setting of data.settings) { const { id, ...rest } = setting; await db.settings.add(rest) }
          if (data.categories) for (const cat of data.categories) { const { id, ...rest } = cat; await db.categories.add(rest) }
          if (data.festivals) { localStorage.setItem('spendly_festivals', JSON.stringify(data.festivals)) }
        } else {
          // Merge mode: Add new festivals to existing festivals array
          if (data.festivals) {
             const existing = JSON.parse(localStorage.getItem('spendly_festivals') || '[]')
             const merged = [...existing, ...data.festivals]
             localStorage.setItem('spendly_festivals', JSON.stringify(merged))
          }
        }

        // Restore list items from backup (strip IDs so Dexie auto-assigns to prevent conflicts)
        for (const exp of data.expenses) { const { id, ...rest } = exp; await db.expenses.add(rest) }
        if (data.budgets) for (const budget of data.budgets) { const { id, ...rest } = budget; await db.budgets.add(rest) }
        if (data.scans) for (const scan of data.scans) { const { id, ...rest } = scan; await db.scans.add(rest) }
        if (data.wallets) for (const wallet of data.wallets) { const { id, ...rest } = wallet; await db.wallets.add(rest) }
        if (data.emis) for (const emi of data.emis) { const { id, ...rest } = emi; await db.emis.add(rest) }
        if (data.trips) for (const trip of data.trips) { const { id, ...rest } = trip; await db.trips.add(rest) }
        if (data.goals) for (const goal of data.goals) { const { id, ...rest } = goal; await db.goals.add(rest) }
        if (data.splits) for (const split of data.splits) { const { id, ...rest } = split; await db.splits.add(rest) }
        if (data.badges) for (const badge of data.badges) { const { id, ...rest } = badge; await db.badges.add(rest) }

        resolve(data.expenses.length)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsArrayBuffer(file)
  })
}
