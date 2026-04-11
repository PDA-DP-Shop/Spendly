import { create } from 'zustand';
import { billService } from '../services/database';

export const useBillStore = create((set, get) => ({
  bills: [],
  currentBill: null,
  isLoading: false,

  loadBills: async () => {
    set({ isLoading: true });
    try {
      const bills = await billService.getAll();
      set({ bills: bills.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)), isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  createBill: (billData) => {
    set({ currentBill: billData });
  },

  saveBill: async (bill) => {
    const id = await billService.add(bill);
    set(s => ({ bills: [{ ...bill, id }, ...s.bills], currentBill: null }));
    return id;
  },

  updateBill: async (id, changes) => {
    await billService.update(id, changes);
    const bills = await billService.getAll();
    set({ bills });
  },

  deleteBill: async (id) => {
    await billService.delete(id);
    set(s => ({ bills: s.bills.filter(b => b.id !== id) }));
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
