// Export all Spendly data as encrypted .spendly backup file
import { db } from './database'
import { encryptExport } from './encryptData'
import { format } from 'date-fns'

export const exportAllData = async (password) => {
  const expenses = await db.expenses.toArray()
  const budgets = await db.budgets.toArray()
  const settings = await db.settings.toArray()
  const scans = await db.scans.toArray()

  const payload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    expenses,
    budgets,
    settings,
    scans,
  }

  const encrypted = await encryptExport(payload, password)
  const dateStr = format(new Date(), 'yyyy-MM-dd')
  const filename = `spendly-backup-${dateStr}.spendly`

  // Create blob and download
  const blob = new Blob([encrypted], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)

  return filename
}
