import Dexie from 'dexie';
import { encryptData, decryptData, importKey } from './encryptData';

// Simple session key management for encryption
// In a real app, this would be set after PIN entry
let encryptionKeyBits = null;

export const setEncryptionKey = (bits) => {
  encryptionKeyBits = bits;
};

class SpendlyShopDB extends Dexie {
  constructor() {
    super('SpendlyShopDB');
    this.version(2).stores({
      shop: '++id',
      bills: '++id, billId, billNumber, status, createdAt',
      customers: '++id, name, phone',
      savedItems: '++id, name, barcode, timesUsed',
      creditBook: '++id, customerId, billId, status',
      dailySales: '++id, date'
    });

    this.version(3).stores({
      shop: '++id',
      bills: '++id, billId, billNumber, status, createdAt',
      customers: '++id, name, phone',
      savedItems: '++id, name, barcode, timesUsed',
      creditBook: '++id, customerId, billId, status',
      dailySales: '++id, date',
      backupHistory: '++id, backedUpAt',
      browserInfo: '++id',
      storageInfo: '++id'
    });

    this.version(4).stores({
      shop: '++id',
      bills: '++id, billId, billNumber, status, createdAt, isDeleted, deletedAt',
      deletedBills: '++id, originalId, deletedAt, billNumber, total',
      customers: '++id, name, phone',
      savedItems: '++id, name, barcode, timesUsed',
      creditBook: '++id, customerId, billId, status',
      dailySales: '++id, date',
      backupHistory: '++id, backedUpAt',
      browserInfo: '++id',
      storageInfo: '++id'
    });

    this.version(5).stores({
      shop: '++id',
      bills: '++id, billId, billNumber, status, createdAt, isDeleted, deletedAt',
      deletedBills: '++id, originalId, deletedAt, billNumber, total',
      customers: '++id, name, phone',
      savedItems: '++id, name, barcode, timesUsed',
      creditBook: '++id, customerId, billId, status',
      dailySales: '++id, date',
      backupHistory: '++id, backedUpAt',
      browserInfo: '++id',
      storageInfo: '++id',
      spendly_recovery_vault: '++id, deletedAt, expiresAt'
    });

<<<<<<< HEAD
    this.version(6).stores({
=======
    this.version(7).stores({
>>>>>>> 41f113d (upgrade scanner)
      shop: '++id',
      bills: '++id, billId, billNumber, status, createdAt, isDeleted, deletedAt',
      deletedBills: '++id, originalId, deletedAt, billNumber, total',
      customers: '++id, name, phone',
      savedItems: '++id, name, barcode, timesUsed',
      creditBook: '++id, customerId, billId, status',
      dailySales: '++id, date',
      backupHistory: '++id, backedUpAt',
      browserInfo: '++id',
      storageInfo: '++id',
      spendly_recovery_vault: '++id, deletedAt, expiresAt',
<<<<<<< HEAD
      cashWallet: '++id',
      bankAccounts: '++id',
      walletTransactions: '++id, expenseId'
=======
      cashWallet: '++id, currency',
      bankAccounts: '++id, type, name, currency',
      walletTransactions: '++id, referenceId, walletType, bankAccountId, date, currency'
>>>>>>> 41f113d (upgrade scanner)
    });
  }
}

export const db = new SpendlyShopDB();

// Encryption Helpers
export const encryptRecord = async (data) => {
  if (!encryptionKeyBits) return data; // No encryption if no key
  
  const key = await importKey(encryptionKeyBits);
  const { encrypted, iv } = await encryptData(data, key);
  return {
    _encrypted: true,
    iv: Array.from(iv),
    blob: Array.from(new Uint8Array(encrypted))
  };
};

export const decryptRecord = async (record) => {
  if (!record || !record._encrypted) return record;
  if (!encryptionKeyBits) return null;
  
  try {
    const key = await importKey(encryptionKeyBits);
    const iv = new Uint8Array(record.iv);
    const blob = new Uint8Array(record.blob).buffer;
    return await decryptData(blob, key, iv) || record; // Fallback to record if decryption fails
  } catch (e) {
    console.error("Decryption failed", e);
    return record; // Return encrypted record as fallback
  }
};

// Generic CRUD factory for encrypted tables
const createEncryptedService = (table) => ({
  async getAll() {
    const all = await table.toArray();
    const decrypted = await Promise.all(all.map(decryptRecord));
    return decrypted.filter(Boolean);
  },
  async get(id) {
    const record = await table.get(id);
    return decryptRecord(record);
  },
  async add(data) {
    const encrypted = await encryptRecord({ ...data, createdAt: new Date().toISOString() });
    return await table.add(encrypted);
  },
  async update(id, changes) {
    const existing = await table.get(id);
    const decrypted = existing ? await decryptRecord(existing) : {};
    const merged = { ...decrypted, ...changes, updatedAt: new Date().toISOString() };
    const encrypted = await encryptRecord(merged);
    await table.put({ ...encrypted, id });
  },
  async delete(id) {
    return await table.delete(id);
  }
});

export const shopService = createEncryptedService(db.shop);
export const billService = {
  ...createEncryptedService(db.bills),
<<<<<<< HEAD
  async getAll(currency, includeDeleted = false) {
    const all = await db.bills.toArray();
    const decrypted = await Promise.all(all.map(decryptRecord));
    let filtered = decrypted.filter(Boolean);
    
    if (currency) {
      filtered = filtered.filter(b => b.currency === currency);
    }
    
=======
  async add(data) {
    const encrypted = await encryptRecord({ ...data, createdAt: new Date().toISOString() });
    // Keep essential metadata searchable in plain text for ecosystem bridges (simulating a public API)
    return await db.bills.add({ 
      ...encrypted, 
      claimCode: data.claimCode, 
      billId: data.billId, 
      billNumber: data.billNumber,
      total: data.total,
      shopName: data.shopName,
      shopCategory: data.shopCategory || data.category,
      paymentMethod: data.paymentMethod,
      paymentDetails: data.paymentDetails,
      items: data.items // Keep items plain for demo purposes to avoid decryption issues between apps
    });
  },
  async getAll(includeDeleted = false) {
    const all = await db.bills.toArray();
    const decrypted = await Promise.all(all.map(decryptRecord));
    let filtered = decrypted.filter(Boolean);
>>>>>>> 41f113d (upgrade scanner)
    if (!includeDeleted) {
      filtered = filtered.filter(b => !b.isDeleted);
    }
    return filtered.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
<<<<<<< HEAD
=======
  },
  async getByNumber(billNumber) {
    const all = await this.getAll();
    return all.find(b => b.billNumber === billNumber);
>>>>>>> 41f113d (upgrade scanner)
  },
  async getByNumber(billNumber) {
    // This finds by number regardless of currency as numbers should be unique
    const all = await db.bills.toArray();
    const decrypted = await Promise.all(all.map(decryptRecord));
    return decrypted.find(b => b.billNumber === billNumber);
  },
  async add(bill, currency) {
    const encrypted = await encryptRecord({ 
      ...bill, 
      currency,
      createdAt: new Date().toISOString() 
    });
    return await db.bills.add(encrypted);
  }
};
export const customerService = createEncryptedService(db.customers);
export const itemsService = createEncryptedService(db.savedItems);
export const creditService = createEncryptedService(db.creditBook);
export const salesService = createEncryptedService(db.dailySales);

<<<<<<< HEAD
export const cashWalletService = {
  ...createEncryptedService(db.cashWallet),
  async get(currency) {
    const all = await this.getAll();
    return all.find(w => w && w.currency === currency) || null;
  },
  async update(currency, data) {
    return await db.transaction('rw', db.cashWallet, async () => {
      const allRaw = await db.cashWallet.toArray();
      let existingRecord = null;
      
      for (const raw of allRaw) {
        const dec = await decryptRecord(raw);
        if (dec && dec.currency === currency) {
          existingRecord = raw;
          break;
        }
      }
      
      const encrypted = await encryptRecord({ ...data, currency, updatedAt: new Date().toISOString() });
      if (existingRecord) {
        await db.cashWallet.put({ ...encrypted, id: existingRecord.id });
      } else {
        await db.cashWallet.add(encrypted);
      }
    });
  }
}

export const bankAccountService = {
  ...createEncryptedService(db.bankAccounts),
  async getAll(currency) {
    const all = await db.bankAccounts.toArray();
    const decrypted = await Promise.all(all.map(decryptRecord));
    let filtered = decrypted.filter(Boolean);
    if (currency) {
      filtered = filtered.filter(acc => acc.currency === currency);
    }
    return filtered.sort((a,b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
  }
};

export const walletTransactionService = {
  ...createEncryptedService(db.walletTransactions),
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
=======
// Wallet services
export const cashWalletService = {
  ...createEncryptedService(db.cashWallet),
  async get(currency = 'INR') {
    const all = await db.cashWallet.toArray();
    const decrypted = await Promise.all(all.map(decryptRecord));
    const found = decrypted.find(w => w && w.currency === currency);
    if (found) return found;
    
    // If not exists, create new one for this currency
    const initial = { currency, balance: 0, notes: {}, totalCash: 0 };
    await this.add(initial);
    return initial;
  },
  async update(data) {
    if (!data.currency) return;
    const all = await db.cashWallet.toArray();
    const decryptedWithId = await Promise.all(all.map(async r => ({ ...await decryptRecord(r), _id: r.id })));
    const existing = decryptedWithId.find(w => w && w.currency === data.currency);
    
    if (existing) {
        return await createEncryptedService(db.cashWallet).update(existing._id, data);
    } else {
        return await this.add(data);
    }
  }
};

export const bankAccountService = {
    ...createEncryptedService(db.bankAccounts),
    async getAll(currency = 'INR') {
        const all = await db.bankAccounts.toArray();
        const decrypted = await Promise.all(all.map(decryptRecord));
        return decrypted.filter(Boolean).filter(b => b.currency === currency);
    }
};
export const walletTransactionService = {
  ...createEncryptedService(db.walletTransactions),
  async getByReferenceId(referenceId) {
    const all = await this.getAll();
    return all.filter(t => t.referenceId === referenceId);
  }
};
>>>>>>> 41f113d (upgrade scanner)

// Secure Data Wipe — Zero Knowledge forensic deletion
export const secureWipe = async (skipReload = false) => {
  // 1. Clear all browser storage first
  localStorage.clear()
  sessionStorage.clear()
  
  try {
    // 2. Try to close the connection to prevent blocking
    if (db.isOpen()) {
       db.close()
    }

    // 3. Global delete by name
    await Dexie.delete('SpendlyShopDB')
  } catch (e) {
    console.error("IndexedDB wipe failed", e)
  }

  // 4. Final reload
  if (!skipReload) {
    window.location.reload()
  }
}
