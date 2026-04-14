import { create } from 'zustand';
import { billService } from '../services/database';

export const useBillStore = create((set, get) => ({
  bills: [],
  currentBill: null,
  isLoading: false,

  loadBills: async () => {
    const { useSettingsStore } = await import('./settingsStore')
    const currency = useSettingsStore.getState().settings?.currency || 'USD'
    
    // Optional: Clear or keep old state? Better to clear IF currency mismatch
    // For now, simple reload is fine as database handles filtering
    set({ isLoading: true });
    try {
      const bills = await billService.getAll(currency);
      set({ bills: bills.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)), isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  createBill: (billData) => {
    set({ currentBill: billData });
  },

  saveBill: async (bill) => {
    const { useSettingsStore } = await import('./settingsStore')
    const currency = useSettingsStore.getState().settings?.currency || 'USD'
    const id = await billService.add(bill, currency);
    set(s => ({ bills: [{ ...bill, id, currency }, ...s.bills], currentBill: null }));
    return id;
  },

  updateBill: async (id, changes) => {
    const { useSettingsStore } = await import('./settingsStore')
    const currency = useSettingsStore.getState().settings?.currency || 'USD'
    await billService.update(id, changes);
    const bills = await billService.getAll(currency);
    set({ bills });
  },

  deleteBill: async (id) => {
    const { softDeleteBillService } = await import('../services/softDeleteService');
    await softDeleteBillService.softDeleteBill(id);
    set(s => ({ bills: s.bills.filter(b => b.id !== id) }));
  },

  restoreBill: async (id) => {
    const { useSettingsStore } = await import('./settingsStore')
    const currency = useSettingsStore.getState().settings?.currency || 'USD'
    const { softDeleteBillService } = await import('../services/softDeleteService');
    const success = await softDeleteBillService.restoreBill(id);
    if (success) {
      const bills = await billService.getAll(currency);
      set({ bills });
    }
    return success;
  },

  getBillByNumber: (billNumber) => {
    return get().bills.find(b => b.billNumber === billNumber);
  },

  getBillsByDate: (dateStr) => {
    return get().bills.filter(b => b.createdAt.startsWith(dateStr));
  },

  getBillsByCustomer: (customerPhone) => {
    return get().bills.filter(b => b.customerPhone === customerPhone);
  },

  getTodaysBills: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().bills.filter(b => b.createdAt.startsWith(today));
  },

  markBillAsSent: async (id, via) => {
    await get().updateBill(id, { sentVia: via, status: 'sent' });
  },

  markBillAsPaid: async (id) => {
    await get().updateBill(id, { status: 'paid' });
  }
}));
