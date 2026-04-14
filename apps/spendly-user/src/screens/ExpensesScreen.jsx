// Expenses screen — Updated with wallet refund intelligence
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import TopHeader from '../components/shared/TopHeader'
import CalendarStrip from '../components/shared/CalendarStrip'
import SalaryExpenseCards from '../components/cards/SalaryExpenseCards'
import TransactionItem from '../components/cards/TransactionItem'
import EmptyState from '../components/shared/EmptyState'
import ToastMessage from '../components/shared/ToastMessage'
import { useExpenses } from '../hooks/useExpenses'
import { useSettingsStore } from '../store/settingsStore'
import { useWalletStore } from '../store/walletStore'
import SuperDeleteModal from '../components/modals/SuperDeleteModal'
import WalletDeleteModal from '../components/modals/WalletDeleteModal'
import { calculateSpent, calculateReceived } from '../utils/calculateTotal'
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns'
import { walletTransactionService } from '../services/database'

const HAPTIC_SHAKE = {
  tap: { 
    x: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.35, ease: "easeInOut" }
  }
}

export default function ExpensesScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { expenses, deleteExpense, loadExpenses, isLoading } = useExpenses()
  const { settings } = useSettingsStore()
  const { bankAccounts, refundToCash, refundToBank } = useWalletStore()
  
  const currency = settings?.currency || 'USD'
  const [selectedDate, setSelectedDate] = useState(null)
  const [toast, setToast] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  
  // Wallet Refund state
  const [walletTx, setWalletTx] = useState(null)
  
  const S = { fontFamily: "'Inter', sans-serif" }

  const filtered = expenses.filter(e => {
    if (selectedDate) return e.date && e.date.startsWith(selectedDate)
    try {
      const d = parseISO(e.date)
      return isWithinInterval(d, { start: startOfMonth(new Date()), end: endOfMonth(new Date()) })
    } catch { return false }
  })

  const spent = calculateSpent(filtered)
  const received = calculateReceived(filtered)

  const handleDelete = async (id) => {
    // Check for linked wallet transaction
    const tx = await walletTransactionService.getByExpenseId(id)
    if (tx) {
      setWalletTx(tx)
      setDeleteId(id)
    } else {
      setDeleteId(id)
    }
  }

  const performBasicDelete = async (id) => {
    // 1. Optimistic UI: Hide immediately (via local state if needed, but here we just wait for the store)
    // 2. Start the 5s holding pattern as per original logic
    const timer = setTimeout(async () => {
       await deleteExpense(id)
       setToast({
         id: Date.now(),
         message: 'Data cached. Recover in Settings > Deleted Cache.',
         type: 'info',
         duration: 4000
       })
       // navigate('/') // Keeping navigation logic
    }, 5000)

    setToast({ 
      id: Date.now(),
      message: 'Processing deletion...', 
      type: 'delete', 
      duration: 5000,
      action: { 
        label: 'STOP', 
        fn: () => {
          clearTimeout(timer)
          loadExpenses()
          setToast({ message: 'Deletion stopped!', type: 'success' })
        } 
      }
    })
  }

  const handleWalletPaid = async () => {
    const id = deleteId
    setWalletTx(null)
    setDeleteId(null)
    
    // Choice 1: Delete record only
    await deleteExpense(id)
    await walletTransactionService.removeByExpenseId(id)
    setToast({ message: 'Expense deleted', type: 'success' })
  }

  const handleWalletMistake = async () => {
    const id = deleteId
    const tx = walletTx
    const expense = expenses.find(e => e.id === id)
    setWalletTx(null)
    setDeleteId(null)
    
    // Choice 2: Delete + Refund
    await deleteExpense(id)
    await walletTransactionService.removeByExpenseId(id)
    
    if (tx.walletType === 'cash') {
      await refundToCash(expense.amount)
      setToast({ message: `${currency}${expense.amount.toLocaleString()} added back to Cash`, type: 'success' })
    } else if (tx.walletType === 'bank' && tx.bankAccountId) {
      await refundToBank(tx.bankAccountId, expense.amount)
      const bank = bankAccounts.find(b => b.id === tx.bankAccountId)
      setToast({ message: `${currency}${expense.amount.toLocaleString()} added back to ${bank?.bankName || 'Bank'}`, type: 'success' })
    }
  }

  return (
    <div className="flex flex-col min-h-dvh pb-tab bg-white safe-top">
      <TopHeader title={t('home.recent')} showBell />

      <div className="mt-4">
        <CalendarStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      </div>

      <div className="mt-8">
        <SalaryExpenseCards 
          income={received} 
          expense={spent} 
          currency={currency} 
          labels={{ income: t('home.inflow'), expense: t('home.spent') }}
        />
      </div>

      <div className="mt-12 pb-24">
        <div className="flex items-center justify-between px-7 mb-8">
          <div className="flex flex-col">
            <h2 className="text-[22px] font-[800] text-black tracking-tight" style={S}>
              {selectedDate ? format(new Date(selectedDate), 'dd MMMM, yyyy') : t('home.recent')}
            </h2>
            <p className="text-[12px] font-[600] text-[#AFAFAF] mt-1" style={S}>
              {selectedDate ? t('common.filtered') : t('home.activity')}
            </p>
          </div>
          {selectedDate && (
            <motion.button variants={HAPTIC_SHAKE} whileTap="tap"
              onClick={() => setSelectedDate(null)} 
              className="text-[12px] font-[700] text-black bg-[#F6F6F6] px-5 py-2.5 rounded-full border border-[#EEEEEE] shadow-sm" 
              style={S}>
              {t('common.reset')}
            </motion.button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-12">
            <EmptyState 
              type="expenses" 
              title="No records found" 
              message="No transactions were logged for the selected period." 
              onAction={() => navigate('/add?mode=type')} 
              action="Add Transaction" 
            />
          </div>
        ) : (
          <div className="flex flex-col">
            {filtered.map((exp, i) => (
              <TransactionItem
                key={exp.id}
                expense={exp}
                currency={currency}
                index={i}
                onDelete={handleDelete}
                onEdit={(e) => {
                  if (e.scanType === 'shop_bill' || e.billId) {
                    navigate(`/view-bill/${e.id}`)
                  } else {
                    navigate(`/add?edit=${e.id}`)
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

      <ToastMessage toast={toast} onClose={() => setToast(null)} />

      {/* Standard Delete Modal (for non-wallet expenses) */}
      <SuperDeleteModal
        show={!!deleteId && !walletTx}
        onClose={() => setDeleteId(null)}
        onDelete={() => performBasicDelete(deleteId)}
        itemName={expenses.find(e => e.id === deleteId)?.shopName || 'this expense'}
      />

      {/* Wallet Refund Modal (for pocket cash / bank expenses) */}
      <WalletDeleteModal
        show={!!walletTx}
        onClose={() => { setWalletTx(null); setDeleteId(null); }}
        onPaid={handleWalletPaid}
        onMistake={handleWalletMistake}
        expenseAmount={expenses.find(e => e.id === deleteId)?.amount || 0}
        walletName={walletTx?.walletType === 'cash' ? 'Cash' : (bankAccounts.find(b => b.id === walletTx?.bankAccountId)?.bankName || 'Bank')}
        currency={currency}
      />
    </div>
  )
}
