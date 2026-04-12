import { db } from './database';

export async function exportShopData() {
  try {
    const bills = await db.bills.toArray();
    const customers = await db.customers.toArray();
    const items = await db.savedItems.toArray();
    const shop = await db.shop.toArray();
    const creditBook = await db.creditBook.toArray();

    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      app: 'SpendlyShop',
      data: { shop, bills, customers, items, creditBook }
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `SpendlyShop_Backup_${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (e) {
    console.error('Export failed', e);
    return false;
  }
}

export async function importShopData(file, mode = 'merge') {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const backup = JSON.parse(e.target.result);
        if (!backup.data) throw new Error('Invalid backup file');

        if (mode === 'replace') {
          await db.bills.clear();
          await db.customers.clear();
          await db.savedItems.clear();
          await db.creditBook.clear();
        }

        const { bills, customers, items, creditBook } = backup.data;
        if (bills?.length) await db.bills.bulkAdd(bills.map(b => { const {id, ...r} = b; return r; }));
        if (customers?.length) await db.customers.bulkAdd(customers.map(c => { const {id, ...r} = c; return r; }));
        if (items?.length) await db.savedItems.bulkAdd(items.map(i => { const {id, ...r} = i; return r; }));
        if (creditBook?.length) await db.creditBook.bulkAdd(creditBook.map(c => { const {id, ...r} = c; return r; }));

        resolve(true);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
