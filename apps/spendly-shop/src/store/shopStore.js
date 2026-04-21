import { create } from 'zustand';
import { shopService } from '../services/database';

export const useShopStore = create((set, get) => ({
  shop: null,
  isLoading: false,

  loadShop: async () => {
    set({ isLoading: true });
    try {
      const all = await shopService.getAll();
      // Ensure we treat it as a singleton. If multiple exist (bug), take the latest.
      set({ shop: all[all.length - 1] || null, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  saveShop: async (shopData) => {
<<<<<<< HEAD
    // If a shop already exists, update it instead of adding a new one
    const current = get().shop;
=======
    // Robust singleton check: even if state is null, check DB
    let current = get().shop;
    if (!current) {
        const all = await shopService.getAll();
        current = all[all.length - 1];
    }

>>>>>>> 41f113d (upgrade scanner)
    if (current?.id) {
      await shopService.update(current.id, shopData);
      set({ shop: { ...current, ...shopData } });
      return current.id;
    } else {
      const id = await shopService.add(shopData);
      set({ shop: { ...shopData, id } });
      return id;
    }
  },

  updateShop: async (changes) => {
    const current = get().shop;
    if (!current) {
        // Fallback: if somehow user calls update without a shop, treat as save
        return get().saveShop(changes);
    }
    await shopService.update(current.id, changes);
    set({ shop: { ...current, ...changes } });
  }
}));
