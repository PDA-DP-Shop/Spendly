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
    this.version(1).stores({
      shop: '++id',
      bills: '++id, billNumber, status, createdAt',
      customers: '++id, name, phone',
      savedItems: '++id, name, barcode, timesUsed',
      creditBook: '++id, customerId, billId, status',
      dailySales: '++id, date'
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
    return await decryptData(blob, key, iv);
  } catch (e) {
    console.error("Decryption failed", e);
    return null;
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
    if (!existing) return;
    const decrypted = await decryptRecord(existing);
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
  async getByNumber(billNumber) {
    const all = await this.getAll();
    return all.find(b => b.billNumber === billNumber);
  },
  async getByDateRange(start, end) {
    const all = await this.getAll();
    return all.filter(b => b.createdAt >= start && b.createdAt <= end);
  }
};
export const customerService = createEncryptedService(db.customers);
export const itemsService = createEncryptedService(db.savedItems);
export const creditService = createEncryptedService(db.creditBook);
export const salesService = createEncryptedService(db.dailySales);
