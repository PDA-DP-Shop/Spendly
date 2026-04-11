import { create } from 'zustand';
import { itemsService } from '../services/database';

export const useItemsStore = create((set, get) => ({
  items: [],
  isLoading: false,

  loadItems: async () => {
    set({ isLoading: true });
    try {
      const items = await itemsService.getAll();
      set({ items, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  addItem: async (item) => {
    const id = await itemsService.add({ ...item, timesUsed: 0 });
    set(s => ({ items: [{ ...item, id, timesUsed: 0 }, ...s.items] }));
    return id;
  },

  updateItem: async (id, changes) => {
    await itemsService.update(id, changes);
    const items = await itemsService.getAll();
    set({ items });
  },

  deleteItem: async (id) => {
    await itemsService.delete(id);
    set(s => ({ items: s.items.filter(i => i.id !== id) }));
  },

  searchItems: (query) => {
    const lower = query.toLowerCase();
    return get().items.filter(i => 
      i.name.toLowerCase().includes(lower) || 
      (i.barcode && i.barcode.includes(query))
    );
  },

  getMostUsedItems: (count = 10) => {
    return [...get().items]
      .sort((a, b) => (b.timesUsed || 0) - (a.timesUsed || 0))
      .slice(0, count);
  },

  incrementUsage: async (id) => {
    const item = get().items.find(i => i.id === id);
    if (item) {
      await get().updateItem(id, { timesUsed: (item.timesUsed || 0) + 1 });
    }
  }
}));
