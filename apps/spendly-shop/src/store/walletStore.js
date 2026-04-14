import { create } from 'zustand'
import { cashWalletService, bankAccountService, walletTransactionService } from '../services/database'

export const useWalletStore = create((set, get) => ({
  cashWallet: null,
  bankAccounts: [],
  walletTransactions: [],
  isLoading: false,

  loadCashWallet: async () => {
    const { useSettingsStore } = await import('./settingsStore')
    const currency = useSettingsStore.getState().settings?.currency || 'USD'
    const { cashWallet } = get()
    if (cashWallet?.currency !== currency) {
      set({ cashWallet: null })
    }
    set({ isLoading: true })
    const wallet = await cashWalletService.get(currency)
    set({ cashWallet: wallet, isLoading: false })
  },

  loadBankAccounts: async () => {
    const { useSettingsStore } = await import('./settingsStore')
    const currency = useSettingsStore.getState().settings?.currency || 'USD'
    const { bankAccounts } = get()
    if (bankAccounts.length > 0 && bankAccounts[0].currency !== currency) {
      set({ bankAccounts: [] })
    }
    set({ isLoading: true })
    const accounts = await bankAccountService.getAll(currency)
    set({ bankAccounts: accounts, isLoading: false })
  },

  loadWalletTransactions: async () => {
    const txs = await walletTransactionService.getAll()
    set({ walletTransactions: txs })
  },

  updateCashNotes: async (notes, totalCash) => {
    const { useSettingsStore } = await import('./settingsStore')
    const currency = useSettingsStore.getState().settings?.currency || 'USD'
    // Sanitize in-memory notes to ensure consistency
    const sanitizedNotes = {};
    Object.entries(notes).forEach(([key, val]) => {
      sanitizedNotes[key] = val;
    });

    await cashWalletService.update(currency, { 
      notes: sanitizedNotes, 
      totalCash,
      updatedAt: new Date().toISOString() 
    })
    await get().loadCashWallet()
  },

  deductFromCash: async (amount, expenseId) => {
    const { cashWallet } = get()
    if (!cashWallet) return

    let remaining = amount
    const notes = { ...cashWallet.notes }
    // Sort denominations descending, handle coins
    const denoms = Object.keys(notes).sort((a, b) => {
      const valA = parseFloat(a.split('_')[0]);
      const valB = parseFloat(b.split('_')[0]);
      if (valB !== valA) return valB - valA;
      return a.includes('_coin') ? 1 : -1;
    });

    for (const d of denoms) {
      const numVal = parseFloat(d.split('_')[0]);
      while (remaining >= numVal && notes[d] > 0) {
        notes[d]--
        remaining -= numVal
      }
    }

    const newTotal = cashWallet.totalCash - (amount - remaining);
    await cashWalletService.update(cashWallet.currency, { notes, totalCash: newTotal })
    
    await walletTransactionService.add({
      expenseId,
      amount: amount - remaining,
      walletType: 'cash',
      type: 'deduction'
    })

    await get().loadCashWallet()
  },

  refundToCash: async (amount) => {
    const { cashWallet } = get()
    if (!cashWallet) return

    // Simple greedy logic to add back notes (prefer notes over coins for merchant)
    const notes = { ...cashWallet.notes }
    const denoms = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1]
    let remaining = amount
    
    for (const d of denoms) {
      const count = Math.floor(remaining / d)
      if (count > 0) {
        notes[d] = (notes[d] || 0) + count
        remaining -= count * d
      }
    }

    const newTotal = cashWallet.totalCash + amount
    await cashWalletService.update(cashWallet.currency, { notes, totalCash: newTotal })
    
    await walletTransactionService.add({
      amount,
      walletType: 'cash',
      type: 'refund'
    })

    await get().loadCashWallet()
  },

  deductFromBank: async (bankId, amount, expenseId) => {
    const acc = get().bankAccounts.find(b => b.id === bankId)
    if (!acc) return

    const newBalance = acc.balance - amount
    await bankAccountService.update(bankId, { balance: newBalance })
    
    await walletTransactionService.add({
      expenseId,
      amount,
      walletType: 'bank',
      bankAccountId: bankId,
      type: 'deduction'
    })

    await get().loadBankAccounts()
  },

  refundToBank: async (bankId, amount) => {
    const acc = get().bankAccounts.find(b => b.id === bankId)
    if (!acc) return

    const newBalance = acc.balance + amount
    await bankAccountService.update(bankId, { balance: newBalance })
    
    await walletTransactionService.add({
      amount,
      walletType: 'bank',
      bankAccountId: bankId,
      type: 'refund'
    })

    await get().loadBankAccounts()
  },

  addBankAccount: async (account) => {
    const currency = JSON.parse(localStorage.getItem('spendly_shop_settings') || '{}')?.currency || 'USD'
    await bankAccountService.add({ ...account, currency })
    await get().loadBankAccounts()
  },

  updateBankAccount: async (id, changes) => {
    await bankAccountService.update(id, changes)
    await get().loadBankAccounts()
  },

  deleteBankAccount: async (id) => {
    await bankAccountService.delete(id)
    await get().loadBankAccounts()
  },

  calculateChangeNotes: (amount) => {
    const denoms = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1]
    let remaining = amount
    const result = {}
    for (const d of denoms) {
      const count = Math.floor(remaining / d)
      if (count > 0) {
        result[d] = count
        remaining -= count * d
      }
    }
    return result
  }
}))
