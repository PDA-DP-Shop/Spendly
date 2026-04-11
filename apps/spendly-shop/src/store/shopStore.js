import { create } from 'zustand';
import { shopService } from '../services/database';

export const useShopStore = create((set, get) => ({
  shop: null,
  isLoading: false,

  loadShop: async () => {
    set({ isLoading: true });
    try {
      const all = await shopService.getAll();
      set({ shop: all[0] || null, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  saveShop: async (shopData) => {
    const id = await shopService.add(shopData);
    set({ shop: { ...shopData, id } });
    return id;
  },

  updateShop: async (changes) => {
    const current = get().shop;
    if (!current) return;
    await shopService.update(current.id, changes);
    set({ shop: { ...current, ...changes } });
  }
}));
