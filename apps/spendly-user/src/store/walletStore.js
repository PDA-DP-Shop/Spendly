import { create } from 'zustand'
import { cashWalletService, bankAccountService, walletTransactionService } from '../services/database'
import { getNotesByUserCurrency } from '../constants/currencyNotes'

export const useWalletStore = create((set, get) => ({
  cashWallet: null,
  bankAccounts: [],
  isLoading: false,

  // Load cash wallet from Dexie
  loadCashWallet: async () => {
    const { useSettingsStore } = await import('./settingsStore')
    const currency = useSettingsStore.getState().settings?.currency || 'INR'
    const { cashWallet } = get()
    if (cashWallet?.currency !== currency) {
      set({ cashWallet: null })
    }
    set({ isLoading: true })
    try {
      let wallet = await cashWalletService.get(currency)
      // If no wallet exists for this currency, create an empty one
      if (!wallet) {
        await cashWalletService.update(currency, {
          notes: {},
          totalCash: 0
        })
        wallet = await cashWalletService.get(currency)
      }
      set({ cashWallet: wallet, isLoading: false })
    } catch (error) {
      console.error("Failed to load cash wallet:", error)
      set({ isLoading: false })
    }
  },

  // Load all bank accounts from Dexie (filtered by currency)
  loadBankAccounts: async () => {
    const { useSettingsStore } = await import('./settingsStore')
    const currency = useSettingsStore.getState().settings?.currency || 'INR'
    const { bankAccounts } = get()
    // Simple check: if first account has different currency (or no accounts but new currency potentially)
    if (bankAccounts.length > 0 && bankAccounts[0].currency !== currency) {
      set({ bankAccounts: [] })
    }
    set({ isLoading: true })
    try {
      const accounts = await bankAccountService.getAll(currency)
      set({ bankAccounts: accounts, isLoading: false })
    } catch (error) {
      console.error("Failed to load bank accounts:", error)
      set({ isLoading: false })
    }
  },

  // Update cash notes and total
  updateCashWallet: async (notesObject) => {
    const { useSettingsStore } = await import('./settingsStore')
    const currency = useSettingsStore.getState().settings?.currency || 'INR'
    const totalCash = get().calculateTotalCash(notesObject)
    
    const updatedWallet = { 
      currency,
      notes: notesObject, 
      totalCash,
      lastUpdated: new Date().toISOString()
    }
    
    try {
      await cashWalletService.update(currency, updatedWallet)
      set({ cashWallet: updatedWallet })
    } catch (error) {
      console.error("Failed to update cash wallet:", error)
    }
  },

  // Calculate total amount from notes object
  calculateTotalCash: (notesObject) => {
    return Object.entries(notesObject).reduce((total, [note, count]) => {
      // Sanitize key (e.g. "10_coin" -> 10)
      const value = parseFloat(note.toString().split('_')[0])
      return total + (value * (count || 0))
    }, 0)
  },

  // Add new bank account
  addBankAccount: async (accountData) => {
    const currency = localStorage.getItem('spendly_currency') || 'USD'
    const enrichedData = { ...accountData, currency }
    set({ isLoading: true })
    try {
      const id = await bankAccountService.add(enrichedData)
      const newAccount = { ...enrichedData, id }
      set(state => ({ 
        bankAccounts: [...state.bankAccounts, newAccount].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0)),
        isLoading: false 
      }))
      return id
    } catch (error) {
      console.error("Failed to add bank account:", error)
      set({ isLoading: false })
    }
  },

  // Edit bank account
  updateBankAccount: async (id, data) => {
    const currency = localStorage.getItem('spendly_currency') || 'USD'
    try {
      await bankAccountService.update(id, data)
      const accounts = await bankAccountService.getAll(currency)
      set({ bankAccounts: accounts })
    } catch (error) {
      console.error("Failed to update bank account:", error)
    }
  },

  // Delete bank account
  deleteBankAccount: async (id) => {
    try {
      await bankAccountService.remove(id)
      set(state => ({ 
        bankAccounts: state.bankAccounts.filter(acc => acc.id !== id) 
      }))
    } catch (error) {
      console.error("Failed to delete bank account:", error)
    }
  },

  // Reduce cash total and record transaction
  deductFromCash: async (amount, expenseId = null, notesUsed = null) => {
    const { cashWallet } = get()
    if (!cashWallet) return

    const newTotal = cashWallet.totalCash - amount
    try {
      await cashWalletService.update(cashWallet.currency, { ...cashWallet, totalCash: newTotal })
      await walletTransactionService.add({
        expenseId,
        walletType: 'cash',
        bankAccountId: null,
        amount,
        transactionType: 'debit',
        notesUsed,
        createdAt: new Date().toISOString()
      })
      set(state => ({ 
        cashWallet: { ...state.cashWallet, totalCash: newTotal } 
      }))
    } catch (error) {
      console.error("Failed to deduct from cash:", error)
    }
  },

  // NEW: Deduct specific notes from cash wallet
  deductCashNotes: async (notesGiven, expenseId = null, changeNotes = null, expenseAmount = 0) => {
    const { cashWallet } = get()
    if (!cashWallet || !notesGiven) return

    const newNotes = { ...(cashWallet.notes || {}) }
    
    // Reduce counts for given notes
    Object.entries(notesGiven).forEach(([denom, count]) => {
      const current = newNotes[denom] || 0
      newNotes[denom] = Math.max(0, current - count)
    })

    // Add counts for change notes (if any)
    if (changeNotes) {
      Object.entries(changeNotes).forEach(([denom, count]) => {
        const current = newNotes[denom] || 0
        newNotes[denom] = current + count
      })
    }

    const newTotal = get().calculateTotalCash(newNotes)
    
    try {
      await cashWalletService.update(cashWallet.currency, { 
        ...cashWallet, 
        notes: newNotes, 
        totalCash: newTotal,
        lastUpdated: new Date().toISOString()
      })
      
      // Record transaction
      await walletTransactionService.add({
        expenseId,
        walletType: 'cash',
        amount: expenseAmount,
        transactionType: 'debit',
        notesUsed: { given: notesGiven, change: changeNotes },
        createdAt: new Date().toISOString()
      })

      set({ cashWallet: { ...cashWallet, notes: newNotes, totalCash: newTotal } })
    } catch (error) {
      console.error("Failed to deduct cash notes:", error)
    }
  },

  // Add back to cash wallet
  refundToCash: async (amount, expenseId = null) => {
    const { cashWallet } = get()
    if (!cashWallet) return

    const newTotal = cashWallet.totalCash + amount
    try {
      await cashWalletService.update(cashWallet.currency, { ...cashWallet, totalCash: newTotal })
      await walletTransactionService.add({
        expenseId,
        walletType: 'cash',
        bankAccountId: null,
        amount,
        transactionType: 'credit',
        createdAt: new Date().toISOString()
      })
      set(state => ({ 
        cashWallet: { ...state.cashWallet, totalCash: newTotal } 
      }))
    } catch (error) {
      console.error("Failed to refund to cash:", error)
    }
  },

  // Reduce bank balance and record transaction
  deductFromBank: async (bankId, amount, expenseId = null) => {
    const account = get().bankAccounts.find(acc => acc.id === bankId)
    if (!account) return

    const newBalance = account.balance - amount
    try {
      await bankAccountService.update(bankId, { balance: newBalance })
      await walletTransactionService.add({
        expenseId,
        walletType: 'bank',
        bankAccountId: bankId,
        amount,
        transactionType: 'debit',
        createdAt: new Date().toISOString()
      })
      set(state => ({
        bankAccounts: state.bankAccounts.map(acc => 
          acc.id === bankId ? { ...acc, balance: newBalance } : acc
        )
      }))
    } catch (error) {
      console.error("Failed to deduct from bank:", error)
    }
  },

  // Add back to bank account
  refundToBank: async (bankId, amount, expenseId = null) => {
    const account = get().bankAccounts.find(acc => acc.id === bankId)
    if (!account) return

    const newBalance = account.balance + amount
    try {
      await bankAccountService.update(bankId, { balance: newBalance })
      await walletTransactionService.add({
        expenseId,
        walletType: 'bank',
        bankAccountId: bankId,
        amount,
        transactionType: 'credit',
        createdAt: new Date().toISOString()
      })
      set(state => ({
        bankAccounts: state.bankAccounts.map(acc => 
          acc.id === bankId ? { ...acc, balance: newBalance } : acc
        )
      }))
    } catch (error) {
      console.error("Failed to refund to bank:", error)
    }
  },

  // Change notes logic using greedy algorithm
  calculateChangeNotes: (givenAmount, expenseAmount) => {
    const { cashWallet } = get()
    const currency = cashWallet?.currency || 'USD'
    const denominations = getNotesByUserCurrency(currency)
    
    const changeAmount = givenAmount - expenseAmount
    
    if (changeAmount < 0) return { given: {}, change: {} }

    const getNotes = (amount) => {
      let remaining = amount
      const result = {}
      denominations.forEach(d => {
        const count = Math.floor(remaining / d)
        if (count > 0) {
          result[d] = count
          remaining -= d * count
        }
      })
      // If there's still a remainder (e.g. amount was not divisible by smallest denomination)
      // we can add it as "1"s if 1 exists or just floor it.
      return result
    }

    return {
      given: getNotes(givenAmount),
      change: getNotes(changeAmount)
    }
  }
}))
