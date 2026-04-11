import { create } from 'zustand';

export const useSettingsStore = create((set, get) => ({
  settings: {
    theme: 'light',
    currency: 'USD',
    language: 'en',
    fontSize: 'normal',
    notificationsEnabled: true,
    autoBackupEnabled: false,
  },

  loadSettings: async () => {
    const saved = localStorage.getItem('spendly_shop_settings');
    if (saved) {
      set({ settings: JSON.parse(saved) });
    }
  },

  saveSettings: async (newSettings) => {
    set({ settings: newSettings });
    localStorage.setItem('spendly_shop_settings', JSON.stringify(newSettings));
  },

  updateSetting: (key, value) => {
    const newSettings = { ...get().settings, [key]: value };
    get().saveSettings(newSettings);
  }
}));
