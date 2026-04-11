import { create } from 'zustand'
import { walletService } from '../services/database'

export const useWalletStore = create((set, get) => ({
  wallets: [],
  isLoading: false,

  loadWallets: async () => {
    set({ isLoading: true })
    try {
      const wallets = await walletService.getAll()
      set({ wallets, isLoading: false })
    } catch { set({ isLoading: false }) }
  },

  addWallet: async (wallet) => {
    const id = await walletService.add(wallet)
    const newWallet = { ...wallet, id }
    set(s => ({ wallets: [...s.wallets, newWallet] }))
    return id
  },

  updateWallet: async (id, changes) => {
    await walletService.update(id, changes)
    const wallets = await walletService.getAll()
    set({ wallets })
  },

  removeWallet: async (id) => {
    await walletService.remove(id)
    set(s => ({ wallets: s.wallets.filter(w => w.id !== id) }))
  },

  // Adjust wallet balance by delta (positive = add, negative = deduct)
  adjustBalance: async (id, delta) => {
    const wallet = get().wallets.find(w => w.id === id)
    if (!wallet) return
    const newBalance = (wallet.balance || 0) + delta
    await walletService.update(id, { balance: newBalance })
    set(s => ({ wallets: s.wallets.map(w => w.id === id ? { ...w, balance: newBalance } : w) }))
  },

  totalBalance: () => get().wallets.reduce((sum, w) => sum + (w.balance || 0), 0),
}))
