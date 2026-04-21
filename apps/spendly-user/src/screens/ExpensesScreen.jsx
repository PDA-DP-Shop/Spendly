<<<<<<< HEAD
// Expenses screen — Updated with wallet refund intelligence
import { useState } from 'react'
=======
// Expenses screen — calendar strip, income/expense cards, and full expense list
import { useState, useRef, useMemo } from 'react'
>>>>>>> 41f113d (upgrade scanner)
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import TopHeader from '../components/shared/TopHeader'
import CalendarStrip from '../components/shared/CalendarStrip'
import SalaryExpenseCards from '../components/cards/SalaryExpenseCards'
import TransactionItem from '../components/cards/TransactionItem'
import EmptyState from '../components/shared/EmptyState'
import { useExpenses } from '../hooks/useExpenses'
import { useSettingsStore } from '../store/settingsStore'
<<<<<<< HEAD
import { useWalletStore } from '../store/walletStore'
import SuperDeleteModal from '../components/modals/SuperDeleteModal'
import WalletDeleteModal from '../components/modals/WalletDeleteModal'
import { calculateSpent, calculateReceived } from '../utils/calculateTotal'
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns'
import { walletTransactionService } from '../services/database'
=======
import SuperDeleteModal from '../components/modals/SuperDeleteModal'
import WalletRefundModal from '../components/modals/WalletRefundModal'
import ToastMessage from '../components/shared/ToastMessage'
import { calculateSpent, calculateReceived } from '../utils/calculateTotal'
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns'
import { useWalletStore } from '../store/walletStore'
import { formatMoney } from '../utils/formatMoney'
import { useExpenseStore } from '../store/expenseStore'
import PageGuide from '../components/shared/PageGuide'
import { usePageGuide } from '../hooks/usePageGuide'
>>>>>>> 41f113d (upgrade scanner)

const HAPTIC_SHAKE = {
  tap: { 
    x: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.35, ease: "easeInOut" }
  }
}

export default function ExpensesScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
<<<<<<< HEAD
  const { expenses, deleteExpense, loadExpenses, isLoading } = useExpenses()
  const { settings } = useSettingsStore()
  const { bankAccounts, refundToCash, refundToBank } = useWalletStore()
  
=======
  const { expenses, deleteExpense, restoreExpense, isLoading, loadExpenses } = useExpenses()
  const { settings } = useSettingsStore()
  const { checkLinkedTransaction, refundToCash, refundToBank } = useWalletStore()
>>>>>>> 41f113d (upgrade scanner)
  const currency = settings?.currency || 'USD'
  const [selectedDate, setSelectedDate] = useState(null)
  const [toast, setToast] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
<<<<<<< HEAD
  
  // Wallet Refund state
  const [walletTx, setWalletTx] = useState(null)
  
  const S = { fontFamily: "'Inter', sans-serif" }

=======
  const [refundTarget, setRefundTarget] = useState(null)
  const S = { fontFamily: "'Inter', sans-serif" }

  const calendarRef = useRef(null)
  const cardsRef = useRef(null)
  const listRef = useRef(null)

  const { showGuide, currentStep, startGuide, nextStep, prevStep, skipGuide } = usePageGuide('expenses_page')

  const guideSteps = useMemo(() => [
    { targetRef: calendarRef, emoji: '🗓️', title: 'Daily Filter', description: 'Tap any date to see exactly what you spent on that day. Swipe left or right to see other days!', borderRadius: 20 },
    { targetRef: cardsRef, emoji: '📊', title: 'Income & Expense', description: 'Monitor how much money came in versus how much went out for the selected period.', borderRadius: 24 },
    { targetRef: listRef, emoji: '📝', title: 'Activity List', description: 'This is your detailed ledger. You can tap on any item to see more details, edit, or delete it.', borderRadius: 16 }
  ], [calendarRef, cardsRef, listRef])

  // Filter by selected date or show all this month
>>>>>>> 41f113d (upgrade scanner)
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
<<<<<<< HEAD
    // Check for linked wallet transaction
    const tx = await walletTransactionService.getByExpenseId(id)
    if (tx) {
      setWalletTx(tx)
      setDeleteId(id)
=======
    const tx = await checkLinkedTransaction(id)
    if (tx) {
      setRefundTarget({ expense: expenses.find(e => e.id === id), transaction: tx })
>>>>>>> 41f113d (upgrade scanner)
    } else {
      setDeleteId(id)
    }
  }

<<<<<<< HEAD
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
=======
  const handleRefundAction = async (action) => {
    if (!refundTarget) return
    const { expense, transaction } = refundTarget
    const id = expense.id
    const refund = action === 'refund_and_delete'
    
    await executeProcessDelete(id, refund, transaction)
    setRefundTarget(null)
  }

  const executeProcessDelete = async (id, shouldRefund, transaction = null) => {
    setDeleteId(null)
    setRefundTarget(null)
    
    const expense = expenses.find(e => e.id === id)
    if (!expense) return

    const amount = expense.amount || 0
    const source = transaction?.walletType === 'bank' ? (transaction.bankName || 'Bank') : 'Cash'

    // Optimistic Update
    const previousExpenses = [...expenses]
    useExpenseStore.setState({ expenses: expenses.filter(e => e.id !== id) })

    const timer = setTimeout(async () => {
       await deleteExpense(id)
       
       if (shouldRefund && transaction) {
         if (transaction.walletType === 'cash') {
           await refundToCash(amount)
         } else {
           await refundToBank(transaction.bankAccountId, amount)
         }
         const { walletTransactionService } = await import('../services/database')
         await walletTransactionService.removeByExpenseId(id)
       }

       setToast({
         id: Date.now(),
         message: shouldRefund ? `${formatMoney(amount, currency)} added back to ${source}` : 'Activity Removed',
         type: 'info',
         duration: 4000
       })
>>>>>>> 41f113d (upgrade scanner)
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
<<<<<<< HEAD
          loadExpenses()
=======
          useExpenseStore.setState({ expenses: previousExpenses })
>>>>>>> 41f113d (upgrade scanner)
          setToast({ message: 'Deletion stopped!', type: 'success' })
        } 
      }
    })
  }

<<<<<<< HEAD
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
=======
  const confirmRealDelete = async () => {
    if (!deleteId) return
    await executeProcessDelete(deleteId, false)
  }
>>>>>>> 41f113d (upgrade scanner)

  return (
    <div className="flex flex-col min-h-dvh pb-tab bg-white safe-top">
      <TopHeader 
        title={t('home.recent')} 
        showBell 
        rightElement={
          <button 
             onClick={startGuide}
             className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-[14px] leading-none active:scale-95 transition-transform"
             style={{ fontFamily: "'DM Sans', sans-serif" }}
             title="How to use this page"
          >
             ?
          </button>
        }
      />

      <div ref={calendarRef} className="mt-4">
        <CalendarStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      </div>

      <div ref={cardsRef} className="mt-6">
        <SalaryExpenseCards 
          income={received} 
          expense={spent} 
          currency={currency} 
          labels={{ income: t('home.inflow'), expense: t('home.spent') }}
        />
      </div>

      <div ref={listRef} className="mt-8 pb-24 relative">
        <div className="flex items-center justify-between px-7 mb-6">
          <div className="flex flex-col">
            <h2 className="text-[19px] font-[800] text-black tracking-tight" style={S}>
              {selectedDate ? format(new Date(selectedDate), 'dd MMM, yyyy') : t('home.recent')}
            </h2>
            <p className="text-[11px] font-[600] text-[#AFAFAF] mt-0.5" style={S}>
              {selectedDate ? t('common.filtered') : t('home.activity')}
            </p>
          </div>
          {selectedDate && (
            <motion.button variants={HAPTIC_SHAKE} whileTap="tap"
              onClick={() => setSelectedDate(null)} 
              className="text-[11px] font-[700] text-black bg-[#F6F6F6] px-4 py-2 rounded-full border border-[#EEEEEE] shadow-sm" 
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
                key={exp.id || i}
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

<<<<<<< HEAD
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
=======
      <SuperDeleteModal
        show={!!deleteId}
        onClose={() => setDeleteId(null)}
        onDelete={confirmRealDelete}
        itemName={expenses.find(e => e.id === deleteId)?.shopName || 'this expense'}
      />

      <WalletRefundModal
        show={!!refundTarget}
        expense={refundTarget?.expense}
        transaction={refundTarget?.transaction}
        currency={currency}
        onAction={handleRefundAction}
        onClose={() => setRefundTarget(null)}
      />

      <PageGuide 
        show={showGuide} 
        steps={guideSteps} 
        currentStep={currentStep} 
        onNext={nextStep} 
        onPrev={prevStep} 
        onSkip={skipGuide} 
>>>>>>> 41f113d (upgrade scanner)
      />
    </div>
  )
}
