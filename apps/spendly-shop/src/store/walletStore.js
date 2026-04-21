import { create } from 'zustand'
import { cashWalletService, bankAccountService, walletTransactionService } from '../services/database'
<<<<<<< HEAD
=======
import { getNotesByUserCurrency } from '../constants/currencyNotes'
>>>>>>> 41f113d (upgrade scanner)

export const useWalletStore = create((set, get) => ({
  cashWallet: null,
  bankAccounts: [],
<<<<<<< HEAD
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
=======
  isLoading: false,

  loadCashWallet: async (currency) => {
    set({ isLoading: true })
    try {
      const activeCurrency = currency || 'INR'
      const cash = await cashWalletService.get(activeCurrency)
      set({ cashWallet: cash, isLoading: false })
    } catch (error) {
      console.error('Failed to load cash wallet', error)
      set({ isLoading: false })
    }
  },

  loadBankAccounts: async (currency) => {
    set({ isLoading: true })
    try {
      const activeCurrency = currency || 'INR'
      const banks = await bankAccountService.getAll(activeCurrency)
      set({ bankAccounts: banks, isLoading: false })
    } catch (error) {
      console.error('Failed to load bank accounts', error)
      set({ isLoading: false })
    }
  },

  updateCashWallet: async (notesObject) => {
    set({ isLoading: true })
    try {
      const totalCash = get().calculateTotalCash(notesObject)
      const current = get().cashWallet
      if (!current) throw new Error('Wallet not loaded')
      const updated = { ...current, notes: notesObject, totalCash }
      await cashWalletService.update(updated)
      set({ cashWallet: updated, isLoading: false })
    } catch (error) {
      console.error('Failed to update cash wallet', error)
      set({ isLoading: false })
    }
  },

  calculateTotalCash: (notesObject) => {
    if (!notesObject) return 0
    return Object.entries(notesObject).reduce((sum, [key, count]) => {
      const value = parseFloat(key.split('_')[0])
      return sum + (value * count)
    }, 0)
  },

  addBankAccount: async (accountData, currency) => {
    set({ isLoading: true })
    try {
      const id = await bankAccountService.add({ ...accountData, currency })
      const banks = await bankAccountService.getAll(currency)
      set({ bankAccounts: banks, isLoading: false })
      return id
    } catch (error) {
      console.error('Failed to add bank account', error)
      set({ isLoading: false })
    }
  },

  updateBankAccount: async (id, data) => {
    set({ isLoading: true })
    try {
      const currentCurrency = get().cashWallet?.currency || 'INR'
      await bankAccountService.update(id, data)
      const banks = await bankAccountService.getAll(currentCurrency)
      set({ bankAccounts: banks, isLoading: false })
    } catch (error) {
      console.error('Failed to update bank account', error)
      set({ isLoading: false })
    }
  },

  deleteBankAccount: async (id) => {
    set({ isLoading: true })
    try {
      const currentCurrency = get().cashWallet?.currency || 'INR'
      await bankAccountService.remove(id)
      const banks = await bankAccountService.getAll(currentCurrency)
      set({ bankAccounts: banks, isLoading: false })
    } catch (error) {
      console.error('Failed to delete bank account', error)
      set({ isLoading: false })
    }
  },

  deductFromCash: async (expenseId, amount, notesUsed) => {
    const { cashWallet, updateCashWallet } = get()
    if (!cashWallet) return

    // Update physical notes count
    const newNotes = { ...(cashWallet.notes || {}) }
    if (notesUsed) {
      Object.entries(notesUsed.given || {}).forEach(([note, count]) => {
        newNotes[note] = (newNotes[note] || 0) + count
      })
      Object.entries(notesUsed.received || {}).forEach(([note, count]) => {
        newNotes[note] = (newNotes[note] || 0) - count
      })
    }

    await updateCashWallet(newNotes)
    
    // Record transaction
    await walletTransactionService.add({
      expenseId,
      walletType: 'cash',
      amount,
      transactionType: 'debit',
      notesUsed
    })
  },

  deductCashNotes: async (notesGiven) => {
    const { cashWallet, updateCashWallet } = get()
    if (!cashWallet) return
    const newNotes = { ...(cashWallet.notes || {}) }
    Object.entries(notesGiven).forEach(([note, count]) => {
      newNotes[note] = (newNotes[note] || 0) - count
    })
    await updateCashWallet(newNotes)
  },

  deductFromBank: async (expenseId, bankId, amount) => {
    const banks = get().bankAccounts
    const bank = banks.find(b => b.id === bankId)
    if (!bank) return
    
    const newBalance = (bank.balance || 0) - amount
    await get().updateBankAccount(bankId, { balance: newBalance })

    // Record transaction
    await walletTransactionService.add({
      expenseId,
      walletType: 'bank',
      bankAccountId: bankId,
      amount,
      transactionType: 'debit'
    })
  },

  recordIncomeCash: async (billId, amount, notesReceived) => {
    const { cashWallet, updateCashWallet } = get()
    if (!cashWallet) return

    // Update physical notes count
    const newNotes = { ...(cashWallet.notes || {}) }
    if (notesReceived) {
      // notesReceived can be in the format { given: { 500: 1 }, received: { 100: 2 } } from Cash Assistant
      Object.entries(notesReceived.given || {}).forEach(([note, count]) => {
        newNotes[note] = (newNotes[note] || 0) + count
      })
      Object.entries(notesReceived.received || {}).forEach(([note, count]) => {
        newNotes[note] = (newNotes[note] || 0) - count
      })
    } else {
       // Greedy fallback if no direct note mapping (standardize to 'note' type)
       const currency = cashWallet.currency || 'INR'
       const currencyItems = getItemsByUserCurrency(currency)
       const denominations = currencyItems.filter(i => i.type === 'note').sort((a,b) => b.value - a.value)
       
       let remaining = amount
       for (const note of denominations) {
         const count = Math.floor(remaining / note.value)
         if (count > 0) {
           const key = `${note.value}_${note.type}`
           newNotes[key] = (newNotes[key] || 0) + count
           remaining -= note.value * count
         }
       }
    }

    await updateCashWallet(newNotes)
    
    // Record transaction
    await walletTransactionService.add({
      billId,
      walletType: 'cash',
      amount,
      transactionType: 'credit',
      notesUsed: notesReceived // Storing the given/received breakdown
    })
  },

  recordIncomeBank: async (billId, bankId, amount) => {
    const banks = get().bankAccounts
    const bank = banks.find(b => b.id === bankId)
    if (!bank) return
    
    const newBalance = (bank.balance || 0) + amount
    await get().updateBankAccount(bankId, { balance: newBalance })

    // Record transaction
    await walletTransactionService.add({
      billId,
      walletType: 'bank',
      bankAccountId: bankId,
      amount,
      transactionType: 'credit'
    })
  },

  refundToCash: async (amount) => {
    const { cashWallet, updateCashWallet } = get()
    if (!cashWallet) return

    const currency = cashWallet.currency || 'USD'
    const denominations = getNotesByUserCurrency(currency)
    
    // Greedy algorithm to add back to notes using largest notes first
    const newNotes = { ...(cashWallet.notes || {}) }
    let remaining = amount
    
    for (const note of denominations) {
      const count = Math.floor(remaining / note)
      if (count > 0) {
        newNotes[note] = (newNotes[note] || 0) + count
        remaining -= note * count
      }
    }

    await updateCashWallet(newNotes)
  },

  refundToBank: async (bankId, amount) => {
    if (!bankId) return
    const banks = get().bankAccounts
    const bank = banks.find(b => b.id === bankId)
    if (!bank) return
    
    const newBalance = (bank.balance || 0) + amount
    await get().updateBankAccount(bankId, { balance: newBalance })
  },

  checkLinkedTransaction: async (expenseId) => {
    try {
      const tx = await walletTransactionService.getByExpenseId(expenseId)
      return tx
    } catch (e) {
      return null
    }
  },

  calculateChangeNotes: (givenAmount, expenseAmount) => {
    const currency = get().cashWallet?.currency || 'USD'
    const denominations = getNotesByUserCurrency(currency)

    const getBreakdown = (amount) => {
      let remaining = amount
      const breakdown = {}
      for (const note of denominations) {
        const count = Math.floor(remaining / note)
        if (count > 0) {
          breakdown[note] = count
          remaining -= note * count
        }
      }
      return breakdown
    }

    const givenNotes = getBreakdown(givenAmount)
    const changeAmount = givenAmount - expenseAmount
    const changeNotes = changeAmount > 0 ? getBreakdown(changeAmount) : {}

    return {
      given: givenNotes,
      received: changeNotes // Using 'received' as requested for transaction record
    }
>>>>>>> 41f113d (upgrade scanner)
  }
}))
