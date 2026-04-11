import { create } from 'zustand';
import { customerService, creditService } from '../services/database';

export const useCustomerStore = create((set, get) => ({
  customers: [],
  isLoading: false,

  loadCustomers: async () => {
    set({ isLoading: true });
    try {
      const customers = await customerService.getAll();
      set({ customers, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  addCustomer: async (customer) => {
    const id = await customerService.add(customer);
    set(s => ({ customers: [{ ...customer, id }, ...s.customers] }));
    return id;
  },

  updateCustomer: async (id, changes) => {
    await customerService.update(id, changes);
    const customers = await customerService.getAll();
    set({ customers });
  },

  getCustomer: (id) => {
    return get().customers.find(c => c.id === id);
  },

  searchCustomers: (query) => {
    const lower = query.toLowerCase();
    return get().customers.filter(c => 
      c.name.toLowerCase().includes(lower) || 
      c.phone.includes(query)
    );
  },

  getTopCustomers: (count = 5) => {
    return [...get().customers]
      .sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0))
      .slice(0, count);
  },

  addCredit: async (customerId, amount, billId, notes) => {
    const customer = get().getCustomer(customerId);
    if (!customer) return;

    // Create credit book entry
    await creditService.add({
      customerId,
      customerName: customer.name,
      customerPhone: customer.phone,
      billId,
      amount,
      paidAmount: 0,
      remainingAmount: amount,
      status: 'pending',
      givenAt: new Date().toISOString(),
      notes
    });

    // Update customer total credit
    const newCredit = (customer.creditAmount || 0) + amount;
    await get().updateCustomer(customerId, { creditAmount: newCredit });
  },

  payCredit: async (customerId, creditEntryId, amount) => {
    const entry = await creditService.get(creditEntryId);
    if (!entry) return;

    const newPaid = entry.paidAmount + amount;
    const remaining = entry.remainingAmount - amount;
    const status = remaining <= 0 ? 'paid' : 'pending';

    await creditService.update(creditEntryId, {
      paidAmount: newPaid,
      remainingAmount: Math.max(0, remaining),
      status,
      paidAt: status === 'paid' ? new Date().toISOString() : entry.paidAt
    });

    // Update customer total credit
    const customer = get().getCustomer(customerId);
    if (customer) {
      const newTotalCredit = Math.max(0, (customer.creditAmount || 0) - amount);
      await get().updateCustomer(customerId, { creditAmount: newTotalCredit });
    }
  }
}));
