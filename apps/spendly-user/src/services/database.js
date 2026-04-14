// Dexie.js IndexedDB database setup for Spendly — all data stays on device
import Dexie from 'dexie'
import { CATEGORIES } from '../constants/categories'
import { debounce } from '../utils/security'
import { encryptData, decryptData, importKey } from '../utils/crypto'
import { useSessionStore } from '../store/sessionStore'

// Define the database with all tables
class SpendlyDB extends Dexie {
  constructor() {
    super('SpendlyDB')
    this.version(1).stores({
      expenses: '++id, type, category, date, addedAt, shopName',
      budgets: '++id, category, month, year',
      settings: '++id',
      scans: '++id, expenseId, addedAt',
      categories: '++id',
    })
    // Version 2: add permanent barcode → product cache (no expiry, offline-first)
    this.version(2).stores({
      expenses: '++id, type, category, date, addedAt, shopName',
      budgets: '++id, category, month, year',
      settings: '++id',
      scans: '++id, expenseId, addedAt',
      categories: '++id',
      productCache: 'barcode',
    })
    // Version 3: Feature expansion — wallets, EMIs, trips, goals, splits, badges, reports, score
    this.version(3).stores({
      expenses: '++id, type, category, date, addedAt, shopName',
      budgets: '++id, category, month, year',
      settings: '++id',
      scans: '++id, expenseId, addedAt',
      categories: '++id',
      productCache: 'barcode',
      wallets: '++id',
      emis: '++id',
      trips: '++id',
      goals: '++id',
      splits: '++id, expenseId',
      badges: '++id, badgeId',
      monthlyReports: '++id, month, year',
      spendingScore: '++id, month, year',
    })

    // Version 4: Intelligent Scanner — scanned products and AI learning
    this.version(4).stores({
      expenses: '++id, type, category, date, addedAt, shopName',
      budgets: '++id, category, month, year',
      settings: '++id',
      scans: '++id, expenseId, addedAt',
      categories: '++id',
      productCache: 'barcode',
      scannedProducts: '++id, barcode, productName, brand, category, amount',
      wallets: '++id',
      emis: '++id',
      trips: '++id',
      goals: '++id',
      splits: '++id, expenseId',
      badges: '++id, badgeId',
      monthlyReports: '++id, month, year',
      spendingScore: '++id, month, year',
    })

    // Version 5: Spendly Shop Ecosystem Integration
    this.version(5).stores({
      expenses: '++id, type, category, date, addedAt, shopName, billId, billSource',
      budgets: '++id, category, month, year',
      settings: '++id',
      scans: '++id, expenseId, addedAt',
      categories: '++id',
      productCache: 'barcode',
      scannedProducts: '++id, barcode, productName, brand, category, amount',
      wallets: '++id',
      emis: '++id',
      trips: '++id',
      goals: '++id',
      splits: '++id, expenseId',
      badges: '++id, badgeId',
      monthlyReports: '++id, month, year',
      spendingScore: '++id, month, year',
    })

    // Version 7: Refined Settings (remove 'key' index to avoid ConstraintErrors)
    this.version(7).stores({
      expenses: '++id, type, category, date, addedAt, shopName, billId, billSource, isDeleted, deletedAt',
      deletedExpenses: '++id, originalId, deletedAt, category, type, amount',
      budgets: '++id, category, month, year',
      settings: '++id', 
      scans: '++id, expenseId, addedAt',
      categories: '++id',
      productCache: 'barcode',
      scannedProducts: '++id, barcode, productName, brand, category, amount',
      wallets: '++id',
      emis: '++id',
      trips: '++id',
      goals: '++id',
      splits: '++id, expenseId',
      badges: '++id, badgeId',
      monthlyReports: '++id, month, year',
      spendingScore: '++id, month, year',
      backupHistory: '++id, backedUpAt, recordCount, fileName',
      browserInfo: '++id, preferredBrowser, firstOpenedAt, lastOpenedAt',
      storageInfo: '++id, isPersisted, lastChecked'
    })

    // Version 8: Smart Delete & Recovery System
    this.version(8).stores({
      expenses: '++id, type, category, date, addedAt, shopName, billId, billSource, isDeleted, deletedAt',
      deletedExpenses: '++id, originalId, deletedAt, category, type, amount',
      budgets: '++id, category, month, year',
      settings: '++id', 
      scans: '++id, expenseId, addedAt',
      categories: '++id',
      productCache: 'barcode',
      scannedProducts: '++id, barcode, productName, brand, category, amount',
      wallets: '++id',
      emis: '++id',
      trips: '++id',
      goals: '++id',
      splits: '++id, expenseId',
      badges: '++id, badgeId',
      monthlyReports: '++id, month, year',
      spendingScore: '++id, month, year',
      backupHistory: '++id, backedUpAt, recordCount, fileName',
      browserInfo: '++id, preferredBrowser, firstOpenedAt, lastOpenedAt',
      storageInfo: '++id, isPersisted, lastChecked',
      spendly_recovery_vault: '++id, deletedAt, expiresAt'
    })

    // Version 9: Cash Wallet and Bank Accounts Feature
    this.version(9).stores({
      expenses: '++id, type, category, date, addedAt, shopName, billId, billSource, isDeleted, deletedAt',
      deletedExpenses: '++id, originalId, deletedAt, category, type, amount',
      budgets: '++id, category, month, year',
      settings: '++id', 
      scans: '++id, expenseId, addedAt',
      categories: '++id',
      productCache: 'barcode',
      scannedProducts: '++id, barcode, productName, brand, category, amount',
      wallets: '++id',
      emis: '++id',
      trips: '++id',
      goals: '++id',
      splits: '++id, expenseId',
      badges: '++id, badgeId',
      monthlyReports: '++id, month, year',
      spendingScore: '++id, month, year',
      backupHistory: '++id, backedUpAt, recordCount, fileName',
      browserInfo: '++id, preferredBrowser, firstOpenedAt, lastOpenedAt',
      storageInfo: '++id, isPersisted, lastChecked',
      spendly_recovery_vault: '++id, deletedAt, expiresAt',
      cashWallet: '++id, currency, lastUpdated',
      bankAccounts: '++id, bankName, accountNickname, isDefault, lastUpdated',
      walletTransactions: '++id, expenseId, walletType, bankAccountId, createdAt'
    })
  }
}

export const db = new SpendlyDB()


// Encryption helper
export const encryptRecord = async (data) => {
  const bits = useSessionStore.getState().encryptionKeyBits
  if (!bits) return data // If no key bits, don't encrypt (e.g. during setup)
  
  const key = await importKey(bits)
  const { encrypted, iv } = await encryptData(data, key)
  return {
    _encrypted: true,
    iv: Array.from(iv),
    blob: Array.from(new Uint8Array(encrypted))
  }
}

// Decryption helper
export const decryptRecord = async (record) => {
  if (!record || !record._encrypted) return record
  const bits = useSessionStore.getState().encryptionKeyBits
  if (!bits) return null // Cannot decrypt without key bits
  
  try {
    const key = await importKey(bits)
    const iv = new Uint8Array(record.iv)
    const blob = new Uint8Array(record.blob).buffer
    return await decryptData(blob, key, iv)
  } catch (e) {
    console.error("Decryption failed", e)
    return null
  }
}

// Load sample data on very first open
export const initDatabase = async () => {
  if (!db.isOpen()) {
    await db.open()
  }
  
  // Wrap in transaction to prevent race conditions during parallel init
  return await db.transaction('rw', [db.settings, db.categories, db.cashWallet], async () => {
    const settingsCount = await db.settings.count()

    if (settingsCount === 0) {
      // First time — insert default settings
      await db.settings.put({
        id: 1,
        name: 'Friend',
        emoji: '😊',
        currency: 'USD',
        theme: 'light',
        fontSize: 'normal',
        lockType: 'none',
        lockPin: null,
        lockPattern: null,
        reminderTime: '20:00',
        notificationsOn: false,
        monthlyBudget: 2000,
        onboardingDone: false,
        installPromptCount: 0,
      })
    }

    // Initialize Empty Cash Wallet independently of settings (for upgraders)
    // Initialize Default USD Cash Wallet if none exists
    const walletCount = await db.cashWallet.count()
    if (walletCount === 0) {
      // We'll let the initial load in the store handle creating the first wallet 
      // based on the selected currency, but we'll add USD as a safe baseline here.
      await db.cashWallet.put(await encryptRecord({
        currency: 'USD',
        notes: {},
        totalCash: 0,
        lastUpdated: new Date().toISOString()
      }))
    }

    // Insert default categories (Encrypted)
    const catCount = await db.categories.count()
    if (catCount === 0) {
      let catIdCounter = 1
      for (const cat of CATEGORIES) {
        const encrypted = await encryptRecord({
          id: catIdCounter++, 
          name: cat.name,
          emoji: cat.emoji,
          color: cat.color,
          bgColor: cat.bgColor,
          isDefault: true,
          sortOrder: CATEGORIES.indexOf(cat),
          categoryId: cat.id,
        })
        await db.categories.put(encrypted)
      }
    }
  })
}

// Expense CRUD operations
export const expenseService = {
  async getAll(currency, includeDeleted = false) {
    const all = await db.expenses.toArray()
    const decrypted = await Promise.all(all.map(decryptRecord))
    let filtered = decrypted.filter(Boolean)
    
    if (currency) {
      filtered = filtered.filter(e => e.currency === currency)
    }
    
    if (!includeDeleted) {
      filtered = filtered.filter(e => !e.isDeleted)
    }
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
  },
  async getByMonth(month, year) {
    const all = await this.getAll()
    return all.filter(e => {
      const d = new Date(e.date)
      return d.getMonth() + 1 === month && d.getFullYear() === year
    })
  },
  async getByDate(dateStr) {
    const all = await this.getAll()
    return all.filter(e => e.date && e.date.startsWith(dateStr))
  },
  async add(expense, currency) {
    const encrypted = await encryptRecord({ 
      ...expense, 
      currency,
      addedAt: new Date().toISOString() 
    })
    return await db.expenses.add(encrypted)
  },
  async update(id, changes) {
    // Must decrypt existing record, merge with changes, re-encrypt, then replace.
    // Dexie auto-increment id is always a number — coerce to be safe.
    const numId = typeof id === 'string' ? parseInt(id, 10) : id
    const existing = await db.expenses.get(numId)
    if (!existing) return
    const decrypted = await decryptRecord(existing)
    if (!decrypted) return
    const merged = { ...decrypted, ...changes }
    const encrypted = await encryptRecord(merged)
    await db.expenses.put({ ...encrypted, id: numId })
  },
  async remove(id) {
    return await db.expenses.delete(id)
  },
  async search(query) {
    const all = await db.expenses.toArray()
    const lower = query.toLowerCase()
    return all.filter(e =>
      (e.shopName || '').toLowerCase().includes(lower) ||
      (e.note || '').toLowerCase().includes(lower) ||
      (e.category || '').toLowerCase().includes(lower)
    )
  },
  // Debounced search for UI usage
  searchDebounced: debounce(async (query, callback) => {
    const results = await expenseService.search(query)
    callback(results)
  }, 300),
}

// Settings operations
export const settingsService = {
  async get() {
    const all = await db.settings.toArray()
    const record = all[0] || null
    if (!record) return null
    
    // Some fields in settings MUST be unencrypted (lockSalt, lockPinHash)
    // The rest is encrypted
    if (record._encrypted) {
      const decrypted = await decryptRecord(record)
      return { ...decrypted, lockSalt: record.lockSalt, lockPinHash: record.lockPinHash, id: record.id }
    }
    return record
  },
  async update(changes) {
    return await db.transaction('rw', db.settings, async () => {
      const all = await db.settings.toArray()
      const current = all[0] || {}
      
      const { lockSalt, lockPinHash, ...sensitive } = changes
      const currentDecrypted = await this.get() || {}
      const mergedSensitive = { ...currentDecrypted, ...sensitive }
      
      delete mergedSensitive.lockSalt
      delete mergedSensitive.lockPinHash
      delete mergedSensitive.id
      
      const encrypted = await encryptRecord(mergedSensitive)
      const finalRecord = {
        ...encrypted,
        lockSalt: lockSalt || current.lockSalt,
        lockPinHash: lockPinHash || current.lockPinHash
      }

      if (current.id) {
        await db.settings.update(current.id, finalRecord)
      } else {
        await db.settings.add(finalRecord)
      }
    })
  },
}

// Budget operations
export const budgetService = {
  async getByMonth(month, year) {
    const all = await db.budgets.toArray()
    const decrypted = await Promise.all(all.map(decryptRecord))
    return decrypted.filter(b => b && b.month === month && b.year === year)
  },
  async setCategory(category, limit, month, year) {
    return await db.transaction('rw', db.budgets, async () => {
      const all = await db.budgets.toArray()
      const decryptedWithId = await Promise.all(all.map(async (b) => ({ ...await decryptRecord(b), _id: b.id })))
      const existing = decryptedWithId.find(b => b && b.category === category && b.month === month && b.year === year)
      
      const data = { category, monthlyLimit: limit, month, year }
      const encrypted = await encryptRecord(data)
      
      if (existing) {
        await db.budgets.update(existing._id, encrypted)
      } else {
        await db.budgets.add(encrypted)
      }
    })
  },
  async getOverall(month, year) {
    const settings = await settingsService.get()
    return settings?.monthlyBudget || 2000
  },
  async setOverall(amount, month, year) {
    await settingsService.update({ monthlyBudget: amount })
  },
}

// Scans operations
export const scanService = {
  async getAll() {
    const all = await db.scans.toArray()
    const decrypted = await Promise.all(all.map(decryptRecord))
    return decrypted.filter(Boolean).sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
  },
  async add(scan) {
    const encrypted = await encryptRecord({ ...scan, addedAt: new Date().toISOString() })
    return await db.scans.add(encrypted)
  },
  async remove(id) {
    return await db.scans.delete(id)
  },
}

// Categories operations
export const categoryService = {
  async getAll() {
    const all = await db.categories.toArray()
    const decrypted = await Promise.all(all.map(decryptRecord))
    return decrypted.filter(Boolean).sort((a, b) => a.sortOrder - b.sortOrder)
  },
  async add(category) {
    const encrypted = await encryptRecord(category)
    return await db.categories.add(encrypted)
  }
}

// Product barcode cache — API results stored permanently in IndexedDB
// These are NOT encrypted (they're public product names) and never expire.
export const productCacheService = {
  async get(barcode) {
    return await db.productCache.get(barcode) || null
  },
  async put(barcode, product) {
    await db.productCache.put({ barcode, ...product, cachedAt: new Date().toISOString() })
  },
}

// Scanned products with user corrections (Intelligence)
export const scannedProductService = {
  async get(barcode) {
    return await db.scannedProducts.where('barcode').equals(barcode).first() || null
  },
  async add(product) {
    return await db.transaction('rw', db.scannedProducts, async () => {
      const existing = await this.get(product.barcode)
      if (existing) {
        return await db.scannedProducts.update(existing.id, { ...product, updatedAt: new Date().toISOString() })
      }
      return await db.scannedProducts.add({ ...product, createdAt: new Date().toISOString() })
    })
  },
  async getAll() {
    return await db.scannedProducts.reverse().toArray()
  }
}

// ── New Feature Services (all encrypted) ────────────────────────────────────

export const walletService = {
  async getAll() {
    const all = await db.wallets.toArray()
    const decrypted = await Promise.all(all.map(decryptRecord))
    return decrypted.filter(Boolean).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  },
  async add(wallet) {
    const encrypted = await encryptRecord({ ...wallet, createdAt: new Date().toISOString() })
    return await db.wallets.add(encrypted)
  },
  async update(id, changes) {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id
    const existing = await db.wallets.get(numId)
    if (!existing) return
    const decrypted = await decryptRecord(existing)
    const merged = { ...decrypted, ...changes }
    const encrypted = await encryptRecord(merged)
    await db.wallets.put({ ...encrypted, id: numId })
  },
  async remove(id) {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id
    return await db.wallets.delete(numId)
  },
}

export const cashWalletService = {
  async get(currency) {
    const all = await db.cashWallet.toArray()
    const decrypted = await Promise.all(all.map(decryptRecord))
    return decrypted.find(w => w && w.currency === currency) || null
  },
  async update(currency, data) {
    return await db.transaction('rw', db.cashWallet, async () => {
      const all = await db.cashWallet.toArray()
      let existingRecord = null
      
      for (const raw of all) {
        const dec = await decryptRecord(raw)
        if (dec && dec.currency === currency) {
          existingRecord = raw
          break
        }
      }
      
      const encrypted = await encryptRecord({ ...data, currency, lastUpdated: new Date().toISOString() })
      if (existingRecord) {
        await db.cashWallet.put({ ...encrypted, id: existingRecord.id })
      } else {
        await db.cashWallet.add(encrypted)
      }
    })
  }
}

export const bankAccountService = {
  async getAll(currency) {
    const all = await db.bankAccounts.toArray()
    const decrypted = await Promise.all(all.map(decryptRecord))
    let filtered = decrypted.filter(Boolean)
    if (currency) {
      filtered = filtered.filter(acc => acc.currency === currency)
    }
    return filtered.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
  },
  async add(account) {
    const encrypted = await encryptRecord({ 
      ...account, 
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString() 
    })
    return await db.bankAccounts.add(encrypted)
  },
  async update(id, changes) {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id
    const existing = await db.bankAccounts.get(numId)
    if (!existing) return
    const decrypted = await decryptRecord(existing)
    const merged = { ...decrypted, ...changes, lastUpdated: new Date().toISOString() }
    const encrypted = await encryptRecord(merged)
    await db.bankAccounts.put({ ...encrypted, id: numId })
  },
  async remove(id) {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id
    return await db.bankAccounts.delete(numId)
  }
}

export const walletTransactionService = {
  async add(transaction) {
    const encrypted = await encryptRecord({ ...transaction, createdAt: new Date().toISOString() })
    return await db.walletTransactions.add(encrypted)
  },
  async getAll() {
    const all = await db.walletTransactions.toArray()
    const decrypted = await Promise.all(all.map(decryptRecord))
    return decrypted.filter(Boolean).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },
  async getByExpenseId(expenseId) {
    const all = await db.walletTransactions.toArray()
    const decrypted = await Promise.all(all.map(async r => ({ ...await decryptRecord(r), _id: r.id })))
    return decrypted.find(t => t && t.expenseId === expenseId)
  },
  async removeByExpenseId(expenseId) {
    const existing = await this.getByExpenseId(expenseId)
    if (existing) await db.walletTransactions.delete(existing._id)
  }
}

export const emiService = {
  async getAll() {
    const all = await db.emis.toArray()
    const decrypted = await Promise.all(all.map(decryptRecord))
    return decrypted.filter(Boolean).sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
  },
  async add(emi) {
    const encrypted = await encryptRecord({ ...emi, createdAt: new Date().toISOString() })
    return await db.emis.add(encrypted)
  },
  async update(id, changes) {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id
    const existing = await db.emis.get(numId)
    if (!existing) return
    const decrypted = await decryptRecord(existing)
    const merged = { ...decrypted, ...changes }
    const encrypted = await encryptRecord(merged)
    await db.emis.put({ ...encrypted, id: numId })
  },
  async remove(id) {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id
    return await db.emis.delete(numId)
  },
}

export const tripService = {
  async getAll() {
    const all = await db.trips.toArray()
    const decrypted = await Promise.all(all.map(decryptRecord))
    return decrypted.filter(Boolean).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },
  async add(trip) {
    const encrypted = await encryptRecord({ ...trip, createdAt: new Date().toISOString() })
    return await db.trips.add(encrypted)
  },
  async update(id, changes) {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id
    const existing = await db.trips.get(numId)
    if (!existing) return
    const decrypted = await decryptRecord(existing)
    const merged = { ...decrypted, ...changes }
    const encrypted = await encryptRecord(merged)
    await db.trips.put({ ...encrypted, id: numId })
  },
  async remove(id) {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id
    return await db.trips.delete(numId)
  },
}

export const goalService = {
  async getAll() {
    const all = await db.goals.toArray()
    const decrypted = await Promise.all(all.map(decryptRecord))
    return decrypted.filter(Boolean).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },
  async add(goal) {
    const encrypted = await encryptRecord({ ...goal, createdAt: new Date().toISOString() })
    return await db.goals.add(encrypted)
  },
  async update(id, changes) {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id
    const existing = await db.goals.get(numId)
    if (!existing) return
    const decrypted = await decryptRecord(existing)
    const merged = { ...decrypted, ...changes }
    const encrypted = await encryptRecord(merged)
    await db.goals.put({ ...encrypted, id: numId })
  },
  async remove(id) {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id
    return await db.goals.delete(numId)
  },
}

export const splitService = {
  async getAll() {
    const all = await db.splits.toArray()
    const decrypted = await Promise.all(all.map(decryptRecord))
    return decrypted.filter(Boolean).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },
  async getUnsettled() {
    const all = await this.getAll()
    return all.filter(s => !s.isSettled)
  },
  async add(split) {
    const encrypted = await encryptRecord({ ...split, createdAt: new Date().toISOString() })
    return await db.splits.add(encrypted)
  },
  async update(id, changes) {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id
    const existing = await db.splits.get(numId)
    if (!existing) return
    const decrypted = await decryptRecord(existing)
    const merged = { ...decrypted, ...changes }
    const encrypted = await encryptRecord(merged)
    await db.splits.put({ ...encrypted, id: numId })
  },
  async remove(id) {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id
    return await db.splits.delete(numId)
  },
}

export const badgeService = {
  async getAll() {
    const all = await db.badges.toArray()
    return all  // badges store { badgeId, earnedAt, isNew } — NOT encrypted (not personal data)
  },
  async earn(badgeId) {
    const existing = await db.badges.where('badgeId').equals(badgeId).first()
    if (existing) return  // already earned
    await db.badges.add({ badgeId, earnedAt: new Date().toISOString(), isNew: true })
  },
  async markSeen(badgeId) {
    const existing = await db.badges.where('badgeId').equals(badgeId).first()
    if (existing) await db.badges.update(existing.id, { isNew: false })
  },
  async hasEarned(badgeId) {
    const existing = await db.badges.where('badgeId').equals(badgeId).first()
    return !!existing
  },
}

export const scoreService = {
  async getByMonth(month, year) {
    const all = await db.spendingScore.toArray()
    const decrypted = await Promise.all(all.map(decryptRecord))
    return decrypted.find(s => s && s.month === month && s.year === year) || null
  },
  async getHistory(count = 6) {
    const all = await db.spendingScore.toArray()
    const decrypted = await Promise.all(all.map(decryptRecord))
    return decrypted.filter(Boolean).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    }).slice(0, count)
  },
  async upsert(month, year, score, breakdown, tips) {
    return await db.transaction('rw', db.spendingScore, async () => {
      const all = await db.spendingScore.toArray()
      const decryptedWithId = await Promise.all(all.map(async r => ({ ...await decryptRecord(r), _id: r.id })))
      const existing = decryptedWithId.find(s => s && s.month === month && s.year === year)
      
      const data = { month, year, score, breakdown, tips, updatedAt: new Date().toISOString() }
      const encrypted = await encryptRecord(data)
      
      if (existing) {
        await db.spendingScore.put({ ...encrypted, id: existing._id })
      } else {
        await db.spendingScore.add(encrypted)
      }
    })
  },
}

// Secure Data Wipe — Zero Knowledge forensic deletion
export const secureWipe = async (skipReload = false) => {
  // 1. Clear all browser storage first (Guaranteed to work)
  localStorage.clear()
  sessionStorage.clear()
  
  try {
    // 2. Try to close the connection to prevent blocking
    if (db.isOpen()) {
       db.close()
    }

    // 3. Global delete by name (more aggressive than db.delete())
    await Dexie.delete('SpendlyDB')
  } catch (e) {
    console.error("IndexedDB wipe failed", e)
  }

  // 4. Final reload to start with a fresh slate
  if (!skipReload) {
    window.location.reload()
  }
}
