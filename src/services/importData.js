// Import and restore Spendly data from encrypted .spendly backup file
import { db } from './database'
import { decryptExport } from './encryptData'
import { secureWipe } from './database'

export const importBackupFile = async (file, password) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const buffer = e.target.result
        const data = await decryptExport(buffer, password)

        if (!data.expenses || !data.settings) {
          throw new Error('Invalid backup file format')
        }

        // Clear all existing data securely
        await secureWipe()

        // Restore from backup (strip IDs so Dexie auto-assigns)
        for (const exp of data.expenses) {
          const { id, ...rest } = exp
          await db.expenses.add(rest)
        }
        for (const budget of data.budgets) {
          const { id, ...rest } = budget
          await db.budgets.add(rest)
        }
        for (const setting of data.settings) {
          const { id, ...rest } = setting
          await db.settings.add(rest)
        }
        for (const scan of (data.scans || [])) {
          const { id, ...rest } = scan
          await db.scans.add(rest)
        }

        resolve(data.expenses.length)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsArrayBuffer(file)
  })
}
