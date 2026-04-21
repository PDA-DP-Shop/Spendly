import { create } from 'zustand'
import { cashWalletService, bankAccountService, walletTransactionService } from '../services/database'
<<<<<<< HEAD
import { getNotesByUserCurrency } from '../constants/currencyNotes'
=======
import { getItemsByUserCurrency, getNotesByUserCurrency } from '../constants/currencyNotes'

const parseKey = (key) => {
  const [val, type] = key.split('_')
  return { value: parseFloat(val), type }
}
>>>>>>> 41f113d (upgrade scanner)

export const useWalletStore = create((set, get) => ({
  cashWallet: null,
  bankAccounts: [],
<<<<<<< HEAD
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
=======
  transactions: [],
  isLoading: false,

  loadTransactions: async () => {
    try {
      const all = await walletTransactionService.getAll()
      set({ transactions: all })
    } catch (e) {
      console.error("Failed to load transactions", e)
    }
  },

  loadCashWallet: async (currency) => {
    set({ isLoading: true })
    try {
      const activeCurrency = currency || 'INR'
      const cash = await cashWalletService.get(activeCurrency)
      set({ cashWallet: cash, isLoading: false })
    } catch (error) {
      console.error('Failed to load cash wallet', error)
>>>>>>> 41f113d (upgrade scanner)
      set({ isLoading: false })
    }
  },

<<<<<<< HEAD
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
=======
  loadBankAccounts: async (currency) => {
    set({ isLoading: true })
    try {
      const activeCurrency = currency || 'INR'
      const banks = await bankAccountService.getAll(activeCurrency)
      set({ bankAccounts: banks, isLoading: false })
    } catch (error) {
      console.error('Failed to load bank accounts', error)
>>>>>>> 41f113d (upgrade scanner)
      set({ isLoading: false })
    }
  },

<<<<<<< HEAD
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
=======
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
      const activeBanks = await bankAccountService.getAll(currency)
      
      // If setting this as default, unset others first
      if (accountData.isDefault) {
        await Promise.all(activeBanks.map(async b => {
          if (b.isDefault) {
            await bankAccountService.update(b.id, { isDefault: false });
          }
        }));
      }

      const id = await bankAccountService.add({ ...accountData, currency })
      const banks = await bankAccountService.getAll(currency)
      set({ bankAccounts: banks, isLoading: false })
      return id
    } catch (error) {
      console.error('Failed to add bank account', error)
>>>>>>> 41f113d (upgrade scanner)
      set({ isLoading: false })
    }
  },

<<<<<<< HEAD
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
=======
  updateBankAccount: async (id, data) => {
    set({ isLoading: true })
    try {
      const targetCurrency = data.currency || get().cashWallet?.currency || 'INR'
      
      // If setting this as default, unset others first
      if (data.isDefault) {
        const activeBanks = await bankAccountService.getAll(targetCurrency)
        await Promise.all(activeBanks.map(async b => {
          if (b.isDefault && b.id !== id) {
            await bankAccountService.update(b.id, { isDefault: false });
          }
        }));
      }

      await bankAccountService.update(id, data)
      const banks = await bankAccountService.getAll(targetCurrency)
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

  deductFromCash: async (expenseId, amount, notesUsed, metadata = {}) => {
    let { cashWallet, updateCashWallet, loadCashWallet } = get()
    
    // 1. Ensure wallet is loaded
    if (!cashWallet) {
      const activeCurrency = metadata.currency || 'INR'
      await loadCashWallet(activeCurrency)
      cashWallet = get().cashWallet
    }
    
    if (!cashWallet) {
      console.warn("Wallet deduction skipped: No cash wallet found")
      return
    }

    // 2. Update physical notes count
    const newNotes = { ...(cashWallet.notes || {}) }
    
    if (notesUsed) {
      Object.entries(notesUsed.given || {}).forEach(([note, count]) => {
        newNotes[note] = (newNotes[note] || 0) - count
      })
      Object.entries(notesUsed.received || {}).forEach(([note, count]) => {
        newNotes[note] = (newNotes[note] || 0) + count
      })
    } else {
      // SMART INVENTORY-AWARE DEDUCTION
      const currency = cashWallet.currency || 'INR'
      const currencyItems = getItemsByUserCurrency(currency)
      const denominations = currencyItems.sort((a,b) => b.value - a.value)
      
      let amountNeeded = amount
      const given = {}

      // 1. Try to find the smallest SINGLE note/coin that the user actually HAS that covers the amount
      const availableNotes = Object.entries(newNotes)
        .filter(([_, count]) => count > 0)
        .map(([key]) => ({ ...parseKey(key), key }))
        .sort((a,b) => a.value - b.value)
      
      const bestCover = availableNotes.find(n => n.value >= amountNeeded)
      
      if (bestCover) {
        given[bestCover.key] = 1
      } else {
        // 2. Multi-note deduction using actual inventory (Highest to Lowest)
        let currentCover = 0
        const sortedInv = Object.entries(newNotes)
          .filter(([_, count]) => count > 0)
          .map(([key, count]) => ({ ...parseKey(key), key, count }))
          .sort((a,b) => b.value - a.value)

        for (const item of sortedInv) {
          let neededCount = Math.ceil((amountNeeded - currentCover) / item.value)
          let take = Math.min(neededCount, item.count)
          if (take > 0) {
            given[item.key] = take
            currentCover += item.value * take
          }
          if (currentCover >= amountNeeded) break
        }
      }

      // Calculate Change and Change-Notes to receive
      const totalGiven = Object.entries(given).reduce((s, [k, c]) => s + (parseKey(k).value * c), 0)
      const changeAmount = Math.max(0, totalGiven - amount)
      const received = {}
      
      if (changeAmount > 0) {
        let remainingChange = changeAmount
        for (const n of denominations) {
          const count = Math.floor(remainingChange / n.value)
          if (count > 0) {
            received[`${n.value}_${n.type}`] = count
            remainingChange -= n.value * count
          }
        }
      }

      // Apply to inventory
      Object.entries(given).forEach(([k, c]) => { newNotes[k] = (newNotes[k] || 0) - c })
      Object.entries(received).forEach(([k, c]) => { newNotes[k] = (newNotes[k] || 0) + c })
      notesUsed = { given, received }
    }

    await updateCashWallet(newNotes)
    
    // Record transaction
    await walletTransactionService.add({
      expenseId,
      walletType: 'cash',
      amount,
      transactionType: 'debit',
      notesUsed,
      shopName: metadata.shopName,
      category: metadata.category,
      currency: cashWallet.currency || 'INR',
      date: new Date().toISOString()
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

  deductFromBank: async (expenseId, bankId, amount, metadata = {}) => {
    let banks = get().bankAccounts
    
    if (banks.length === 0) {
      await get().loadBankAccounts(metadata.currency)
      banks = get().bankAccounts
    }

    // Robust ID matching (handles string vs number from different sources)
    const bank = banks.find(b => String(b.id) === String(bankId))
    
    if (!bank) {
      console.warn(`[WalletStore] Bank account ${bankId} not found for deduction.`, { banks, bankId })
      return
    }
    
    const newBalance = (bank.balance || 0) - amount
    await get().updateBankAccount(bank.id, { balance: newBalance })

    // Record transaction
    await walletTransactionService.add({
      expenseId,
      walletType: 'bank',
      bankAccountId: bankId,
      amount,
      transactionType: 'debit',
      shopName: metadata.shopName,
      category: metadata.category,
      currency: bank.currency || 'INR',
      date: new Date().toISOString()
    })
  },

  refundToCash: async (amount) => {
    const { cashWallet, updateCashWallet } = get()
    if (!cashWallet) return

    const currency = cashWallet.currency || 'INR'
    const currencyItems = getItemsByUserCurrency(currency)
    const denominations = currencyItems.filter(i => i.type === 'note').sort((a,b) => b.value - a.value)
    
    // Greedy algorithm to add back to notes using largest notes first
    const newNotes = { ...(cashWallet.notes || {}) }
    let remaining = amount
    
    for (const note of denominations) {
      const count = Math.floor(remaining / note.value)
      if (count > 0) {
        const key = `${note.value}_${note.type}`
        newNotes[key] = (newNotes[key] || 0) + count
        remaining -= note.value * count
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
>>>>>>> 41f113d (upgrade scanner)
    }
  }
}))
