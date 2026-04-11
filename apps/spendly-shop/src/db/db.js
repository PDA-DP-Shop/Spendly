import Dexie from 'dexie';

export const db = new Dexie('SpendlyShopDB');

db.version(1).stores({
  shop: '++id, name, owner, category, phone, gst, upi',
  bills: '++id, billNumber, customerName, customerPhone, subtotal, gst, discount, total, paymentMethod, status, sentVia, createdAt',
  quickItems: '++id, name, price, category',
  customers: '++id, name, phone, totalBills, totalAmount, lastVisit'
});
