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
          // Merge mode: Add new festivals to existing festivals array, deduplicating them
          if (data.festivals && data.festivals.length > 0) {
             const existing = JSON.parse(localStorage.getItem('spendly_festivals') || '[]')
             const sigSet = new Set(existing.map(f => {
                const temp = { ...f }; delete temp.id; return JSON.stringify(temp)
             }))
             
             const toAdd = []
             for (const fest of data.festivals) {
               const { id, ...rest } = fest
               const sig = JSON.stringify(rest)
               if (!sigSet.has(sig)) {
                  toAdd.push(rest)
                  sigSet.add(sig)
               }
             }
             if (toAdd.length > 0) {
               localStorage.setItem('spendly_festivals', JSON.stringify([...existing, ...toAdd]))
             }
          }
        }

        // Bulk Deduplication Helper: checks cryptographic blobs to prevent identical duplicate rows
        const deduplicateAndAdd = async (store, records) => {
          if (!records || !records.length) return
          const existing = await store.toArray()
          const sigSet = new Set(existing.map(r => {
            const temp = { ...r }; delete temp.id;
            return (temp._encrypted && temp.blob) ? JSON.stringify(temp.blob) : JSON.stringify(temp)
          }))
          const toAdd = []
          for (const item of records) {
            const { id, ...rest } = item
            const sig = (rest._encrypted && rest.blob) ? JSON.stringify(rest.blob) : JSON.stringify(rest)
            if (!sigSet.has(sig)) {
              toAdd.push(rest)
              sigSet.add(sig)
            }
          }
          if (toAdd.length > 0) await store.bulkAdd(toAdd)
        }

        // Restore list items from backup (strip IDs so Dexie auto-assigns to prevent conflicts)
        await deduplicateAndAdd(db.expenses, data.expenses)
        await deduplicateAndAdd(db.budgets, data.budgets)
        await deduplicateAndAdd(db.scans, data.scans)
        await deduplicateAndAdd(db.wallets, data.wallets)
        await deduplicateAndAdd(db.emis, data.emis)
        await deduplicateAndAdd(db.trips, data.trips)
        await deduplicateAndAdd(db.goals, data.goals)
        await deduplicateAndAdd(db.splits, data.splits)
        await deduplicateAndAdd(db.badges, data.badges)

        resolve(data.expenses.length)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsArrayBuffer(file)
  })
}
