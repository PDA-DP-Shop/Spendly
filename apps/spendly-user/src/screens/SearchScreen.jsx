// Search screen — white premium live search
import { useState, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import TransactionItem from '../components/cards/TransactionItem'
import EmptyState from '../components/shared/EmptyState'
import ToastMessage from '../components/shared/ToastMessage'
import { useExpenses } from '../hooks/useExpenses'
import { useSettingsStore } from '../store/settingsStore'
import { CATEGORIES } from '../constants/categories'
import { useNavigate } from 'react-router-dom'
import WalletRefundModal from '../components/modals/WalletRefundModal'
import { useWalletStore } from '../store/walletStore'
import { formatMoney } from '../utils/formatMoney'
import { useExpenseStore } from '../store/expenseStore'
<<<<<<< HEAD
=======
import PageGuide from '../components/shared/PageGuide'
import { usePageGuide } from '../hooks/usePageGuide'
>>>>>>> 41f113d (upgrade scanner)

const SORT_OPTIONS = ['Newest', 'Oldest', 'Most', 'Least']
const S = { fontFamily: "'Inter', sans-serif" }

export default function SearchScreen() {
  const navigate = useNavigate()
  const { expenses, deleteExpense, restoreExpense, loadExpenses } = useExpenses()
  const { settings } = useSettingsStore()
  const { checkLinkedTransaction, refundToCash, refundToBank } = useWalletStore()
  const currency = settings?.currency || 'USD'
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [sort, setSort] = useState('Newest')
<<<<<<< HEAD
  const [toast, setToast] = useState(null)
  const [refundTarget, setRefundTarget] = useState(null)
=======
  const [refundTarget, setRefundTarget] = useState(null)

  const searchBoxRef = useRef(null)
  const categoryScrollRef = useRef(null)
  const sortRowRef = useRef(null)
  const listRef = useRef(null)

  const { showGuide, currentStep, startGuide, nextStep, prevStep, skipGuide } = usePageGuide('search_page')

  const guideSteps = [
    { targetRef: searchBoxRef, emoji: '🔍', title: 'Find Anything', description: 'Search through your entire spending history by shop name or even a small note you added.', borderRadius: 100 },
    { targetRef: categoryScrollRef, emoji: '🧀', title: 'Drill Down', description: 'Filter results by specific categories to see only what you want.', borderRadius: 20 },
    { targetRef: sortRowRef, emoji: '↕️', title: 'Total Control', description: 'Sort by newest, oldest, or amount to find patterns in your spending.', borderRadius: 20 },
    { targetRef: listRef, emoji: '📝', title: 'Edit & Review', description: 'Found it? Tap the item to edit its details or see the full digital receipt.', borderRadius: 24 }
  ]
>>>>>>> 41f113d (upgrade scanner)

  const results = useMemo(() => {
    let exps = expenses
    if (query) {
      const q = query.toLowerCase()
      exps = exps.filter(e =>
        (e.shopName || '').toLowerCase().includes(q) ||
        (e.note || '').toLowerCase().includes(q) ||
        (e.category || '').toLowerCase().includes(q)
      )
    }
    if (activeCategory !== 'all') exps = exps.filter(e => e.category === activeCategory)
    if (sort === 'Newest') exps = [...exps].sort((a, b) => new Date(b.date) - new Date(a.date))
    if (sort === 'Oldest') exps = [...exps].sort((a, b) => new Date(a.date) - new Date(b.date))
    if (sort === 'Most') exps = [...exps].sort((a, b) => b.amount - a.amount)
    if (sort === 'Least') exps = [...exps].sort((a, b) => a.amount - b.amount)
    return exps
  }, [expenses, query, activeCategory, sort])

  const handleDelete = async (id) => {
    const tx = await checkLinkedTransaction(id)
    if (tx) {
      setRefundTarget({ expense: expenses.find(e => e.id === id), transaction: tx })
    } else {
      await executeProcessDelete(id, false)
    }
  }

  const handleRefundAction = async (action) => {
    if (!refundTarget) return
    const { expense, transaction } = refundTarget
    const id = expense.id
    const refund = action === 'refund_and_delete'
    
    await executeProcessDelete(id, refund, transaction)
    setRefundTarget(null)
  }

  const executeProcessDelete = async (id, shouldRefund, transaction = null) => {
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
          useExpenseStore.setState({ expenses: previousExpenses })
          setToast({ message: 'Deletion stopped!', type: 'success' })
        } 
      }
    })
  }

  return (
    <div className="flex flex-col min-h-dvh mb-tab bg-white">
      {/* Search bar */}
      <div className="px-6 safe-top pt-8 pb-5 bg-white sticky top-0 z-20 border-b border-[#EEEEEE] flex items-center gap-3">
        <div
          ref={searchBoxRef}
          className="flex-1 flex items-center gap-4 px-6 py-4 rounded-full transition-all bg-[#F6F6F6] border border-[#EEEEEE]"
        >
          <Search className="w-5 h-5 text-black flex-shrink-0" strokeWidth={3} />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search activities..."
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
            className="flex-1 bg-transparent text-[16px] font-[900] text-black outline-none placeholder-[#AFAFAF]"
            style={S}
          />
        </div>
      </div>

      {/* Category filter chips */}
      <div ref={categoryScrollRef} className="flex gap-3 px-6 py-6 overflow-x-auto scrollbar-hide bg-white border-b border-[#EEEEEE]">
        {[{ id: 'all', name: 'Total', emoji: '✨' }, ...CATEGORIES].map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-full text-[13px] font-[900] whitespace-nowrap flex-shrink-0 transition-all border ${
              activeCategory === cat.id 
                ? 'bg-black text-white border-black shadow-xl' 
                : 'bg-white text-black border-[#EEEEEE]'
            }`}
            style={S}>
            <span className="text-base">{cat.emoji}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Sort row */}
      <div ref={sortRowRef} className="flex items-center gap-4 px-6 py-5 overflow-x-auto scrollbar-hide bg-[#FBFBFB] border-b border-[#EEEEEE]">
        <div className="flex items-center gap-2 mr-2">
            <SlidersHorizontal className="w-4 h-4 text-black" strokeWidth={3} />
            <span className="text-[11px] font-[900] uppercase tracking-[0.2em] text-black flex-shrink-0" style={S}>Sort</span>
        </div>
        <div className="flex gap-3">
          {SORT_OPTIONS.map(s => (
            <button key={s} onClick={() => setSort(s)}
              className={`px-6 py-2.5 rounded-full text-[12px] font-[900] transition-all border tracking-[0.1em] ${
                sort === s ? 'bg-black text-white border-black' : 'bg-white text-black border-[#EEEEEE]'
              }`}
              style={S}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 pt-6">
        {results.length === 0 ? (
          <EmptyState
            type="search"
            title="Search Negative"
            message={query ? `No records found for "${query}" on this terminal.` : 'Enter search parameters to query the database.'}
          />
        ) : (
          <div ref={listRef} className="pb-tab">
            <div className="flex items-center gap-3 px-6 mb-6">
                <div className="w-2 h-2 rounded-full bg-black shadow-[0_0_8px_rgba(0,0,0,0.3)]" />
                <p className="text-[11px] font-[900] uppercase tracking-[0.2em] text-[#AFAFAF]" style={S}>
                  {results.length} Activity Encounters
                </p>
            </div>
            <div className="flex flex-col">
              {results.map((exp, i) => (
                <TransactionItem key={exp.id} expense={exp} currency={currency} index={i}
                  onDelete={handleDelete} onEdit={(e) => {
                    if (e.scanType === 'shop_bill' || e.billId) {
                      navigate(`/view-bill/${e.id}`)
                    } else {
                      navigate(`/add?edit=${e.id}`)
                    }
                  }} />
              ))}
            </div>
          </div>
        )}
      </div>

      <ToastMessage toast={toast} onClose={() => setToast(null)} />
      
      <WalletRefundModal
        show={!!refundTarget}
        expense={refundTarget?.expense}
        transaction={refundTarget?.transaction}
        currency={currency}
        onAction={handleRefundAction}
        onClose={() => setRefundTarget(null)}
      />
<<<<<<< HEAD
=======

      <PageGuide 
        show={showGuide} 
        steps={guideSteps} 
        currentStep={currentStep} 
        onNext={nextStep} 
        onPrev={prevStep} 
        onSkip={skipGuide} 
      />
>>>>>>> 41f113d (upgrade scanner)
    </div>
  )
}
