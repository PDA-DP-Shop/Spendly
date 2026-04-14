// Home screen — Updated with wallet refund intelligence
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Bell, Flame, Plus, ChevronUp, History, Target, Zap, Info, AlertCircle, TrendingUp, Receipt, Landmark, Banknote } from 'lucide-react'
import { useExpenses } from '../hooks/useExpenses'
import { useSettingsStore } from '../store/settingsStore'
import { useBudgetStore } from '../store/budgetStore'
import { calculateSpent, calculateBalance } from '../utils/calculateTotal'
import { formatMoney } from '../utils/formatMoney'
import { useExpenseStore } from '../store/expenseStore'
import { useWalletStore } from '../store/walletStore'
import TransactionItem from '../components/cards/TransactionItem'
import ToastMessage from '../components/shared/ToastMessage'
import { useUIStore } from '../store/uiStore'
import SuperDeleteModal from '../components/modals/SuperDeleteModal'
import WalletDeleteModal from '../components/modals/WalletDeleteModal'
import RecoveryBanner from '../components/shared/RecoveryBanner'
import { walletTransactionService } from '../services/database'

export default function HomeScreen() {
  const navigate = useNavigate()
  const { getToday, getThisMonth, getRecent, deleteExpense, loadExpenses, expenses } = useExpenses()
  const { getStreak } = useExpenseStore()
  const { settings } = useSettingsStore()
  const { overallBudget, loadBudgets } = useBudgetStore()
  const { toggleNotifications } = useUIStore()
  const { cashWallet, bankAccounts, loadCashWallet, loadBankAccounts, refundToCash, refundToBank } = useWalletStore()
  
  const [hideAmounts, setHideAmounts] = useState(false)
  const [toast, setToast] = useState(null)
  const [touchStart, setTouchStart] = useState(0)
  const [deleteId, setDeleteId] = useState(null)
  const [walletTx, setWalletTx] = useState(null)
  
  const currency = settings?.currency || 'USD'
  const name = settings?.profileName || 'User'
  const S = { fontFamily: "'Inter', sans-serif" }

  useEffect(() => { 
    loadBudgets()
    loadCashWallet()
    loadBankAccounts()
  }, [])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }, [])

  const handleDelete = async (id) => {
    const tx = await walletTransactionService.getByExpenseId(id)
    if (tx) {
      setWalletTx(tx)
      setDeleteId(id)
    } else {
      setDeleteId(id)
    }
  }

  const confirmRealDelete = async () => {
    if (!deleteId) return
    const id = deleteId
    setDeleteId(null)
    
    const timer = setTimeout(async () => {
       await deleteExpense(id)
       setToast({
         id: Date.now(),
         message: 'Recycled. Recover in Settings if needed.',
         type: 'info',
         duration: 4000
       })
       navigate('/')
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
          setToast({ message: 'Stopped!', type: 'success' })
        } 
      }
    })
  }

  const handleWalletPaid = async () => {
    const id = deleteId
    setWalletTx(null); setDeleteId(null)
    await deleteExpense(id)
    await walletTransactionService.removeByExpenseId(id)
    setToast({ message: 'Expense deleted', type: 'success' })
  }

  const handleWalletMistake = async () => {
    const id = deleteId
    const tx = walletTx
    const expense = expenses.find(e => e.id === id)
    setWalletTx(null); setDeleteId(null)
    
    await deleteExpense(id)
    await walletTransactionService.removeByExpenseId(id)
    
    if (tx.walletType === 'cash') {
      await refundToCash(expense.amount)
      setToast({ message: `${currency}${expense.amount.toLocaleString()} refunded to Cash`, type: 'success' })
    } else if (tx.walletType === 'bank' && tx.bankAccountId) {
      await refundToBank(tx.bankAccountId, expense.amount)
      const bank = bankAccounts.find(b => b.id === tx.bankAccountId)
      setToast({ message: `${currency}${expense.amount.toLocaleString()} refunded to ${bank?.bankName || 'Bank'}`, type: 'success' })
    }
  }

  const todayExpenses = getToday()
  const monthExpenses = getThisMonth()
  const spentToday = calculateSpent(todayExpenses)
  const spentThisMonth = calculateSpent(monthExpenses)
  const totalBalance = calculateBalance(expenses)
  const isBudgetSet = overallBudget > 0
  const isOverBudget = isBudgetSet && spentThisMonth > overallBudget
  const moneyLeft = isBudgetSet ? overallBudget - spentThisMonth : totalBalance
  const streak = getStreak()
  const recent3 = getRecent(3)
  const budgetStatus = isBudgetSet ? (spentThisMonth / overallBudget) * 100 : 0
  
  const getStatusLabel = () => {
    if (!isBudgetSet) return { label: 'Total Savings', color: 'bg-emerald-500/10 text-emerald-600', icon: TrendingUp }
    if (budgetStatus > 100) return { label: 'Over Budget', color: 'bg-red-500/20 text-red-500', icon: AlertCircle }
    if (budgetStatus > 80) return { label: 'Warning', color: 'bg-orange-500/20 text-orange-500', icon: Info }
    return { label: 'Safe', color: 'bg-white/10 text-white/60', icon: Target }
  }
  const status = getStatusLabel()

  return (
    <div className="flex flex-col min-h-dvh bg-white overflow-hidden safe-top pb-tab">
      <RecoveryBanner />
      <div className="px-7 pt-8 pb-4 flex justify-between items-center">
        <div>
           <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-widest" style={S}>{greeting},</p>
           <h2 className="text-[28px] font-[800] text-black tracking-tight" style={S}>{name.split(' ')[0]}</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 mr-2">
             <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
             <span className="text-[13px] font-[800] text-orange-600" style={S}>{streak}</span>
          </div>
          <button onClick={toggleNotifications} className="w-10 h-10 rounded-full flex items-center justify-center bg-[#F6F6F6] border border-[#EEEEEE] active:scale-95 transition-transform">
             <Bell className="w-5 h-5 text-black" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="px-6 py-4 grid grid-cols-2 gap-4">
        <motion.div 
          onDoubleClick={() => setHideAmounts(!hideAmounts)}
          className={`col-span-2 rounded-[32px] p-8 shadow-2xl relative overflow-hidden transition-colors duration-500 ${isOverBudget ? 'bg-red-950' : 'bg-black'}`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          <p className="text-white/40 text-[11px] font-[700] uppercase tracking-wider mb-2" style={S}>
            {!isBudgetSet ? 'Total Balance' : (isOverBudget ? 'Budget Exceeded By' : 'Money Left This Month')}
          </p>
          <h1 className="text-white text-[42px] font-[900] tracking-tighter mb-6 transition-all" style={S}>
            {hideAmounts ? '••••••' : formatMoney(Math.abs(moneyLeft), currency)}
          </h1>
          <div className="flex items-center justify-between">
             <div className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors ${status.color}`}>
                <status.icon className="w-4 h-4" />
                <span className="text-[11px] font-[800] uppercase tracking-wider" style={S}>{status.label}</span>
             </div>
             {isBudgetSet && (
               <div className="h-1.5 flex-1 mx-4 bg-white/10 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(budgetStatus, 100)}%`, backgroundColor: isOverBudget ? '#EF4444' : '#FFFFFF' }} className="h-full rounded-full" />
               </div>
             )}
          </div>
        </motion.div>

        <div className="bg-[#F6F6F6] rounded-[28px] p-6 border border-[#EEEEEE] flex flex-col justify-center">
           <p className="text-[#AFAFAF] text-[10px] font-[700] uppercase tracking-wider mb-1" style={S}>Spent Today</p>
           <h3 className="text-black text-[20px] font-[800]" style={S}>{hideAmounts ? '•••' : formatMoney(spentToday, currency)}</h3>
        </div>

        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="bg-black rounded-[32px] p-1 flex flex-col shadow-lg shadow-black/10"
        >
           <button onClick={() => navigate('/add')} className="h-full w-full rounded-[31px] flex flex-col justify-center items-center gap-1 bg-white/0 text-white p-5">
              <Plus className="w-6 h-6" strokeWidth={3} />
              <span className="text-[10px] font-[900] uppercase tracking-[0.2em]" style={S}>Quick Add</span>
           </button>
        </motion.div>

        <motion.button 
          whileTap={{ scale: 0.98 }} onClick={() => navigate('/bill-code')}
          className="col-span-2 bg-white border border-[#EEEEEE] rounded-[28px] p-5 flex items-center justify-between shadow-sm active:bg-[#F6F6F6] transition-colors"
        >
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                 <Receipt className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                 <h4 className="text-[14px] font-[800] text-black" style={S}>Enter Bill Code</h4>
                 <p className="text-[11px] font-[500] text-[#AFAFAF]" style={S}>Add digital bill from shopkeepers</p>
              </div>
           </div>
           <ChevronUp className="w-5 h-5 text-[#D8D8D8] rotate-90" />
        </motion.button>

        {/* Wallet Overview Selection — Redesigned for White Premium Design */}
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="col-span-1 rounded-[32px] bg-white border border-[#EEEEEE] p-6 flex flex-col gap-5 group active:bg-[#F8FAFC] transition-all cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.02)]" 
          onClick={() => navigate('/cash-wallet')}
        >
           <div className="w-11 h-11 rounded-2xl bg-black flex items-center justify-center text-xl shadow-lg shadow-black/5 group-hover:scale-110 transition-transform">
              <Banknote className="w-5 h-5 text-white" strokeWidth={2.5} />
           </div>
           <div>
              <p className="text-[10px] font-[802] text-[#AFAFAF] uppercase tracking-[0.2em] mb-1" style={S}>Cash</p>
              <p className="text-[18px] font-[900] text-black tracking-tight" style={{ ...S, fontFamily: "'Sora', sans-serif" }}>
                {currency}{cashWallet?.totalCash?.toLocaleString() || 0}
              </p>
           </div>
        </motion.div>

        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="col-span-1 rounded-[32px] bg-white border border-[#EEEEEE] p-6 flex flex-col gap-5 group active:bg-[#F8FAFC] transition-all cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.02)]" 
          onClick={() => navigate('/bank-accounts')}
        >
           <div className="w-11 h-11 rounded-2xl bg-black flex items-center justify-center text-xl shadow-lg shadow-black/5 group-hover:scale-110 transition-transform">
              <Landmark className="w-5 h-5 text-white" strokeWidth={2.5} />
           </div>
           <div>
              <p className="text-[10px] font-[802] text-[#AFAFAF] uppercase tracking-[0.2em] mb-1" style={S}>In Banks</p>
              <p className="text-[18px] font-[900] text-black tracking-tight" style={{ ...S, fontFamily: "'Sora', sans-serif" }}>
                {currency}{bankAccounts.reduce((sum, b) => sum + (b.balance || 0), 0).toLocaleString()}
              </p>
           </div>
        </motion.div>
      </div>

      <div className="h-[1px] mx-10 my-4 bg-[#F6F6F6]" />

      <div className="mt-4 px-7 flex-1">
        <div className="flex items-center justify-between mb-6">
           <p className="text-[13px] font-[700] uppercase tracking-wide text-black" style={S}>Latest Activity</p>
           <button onClick={() => navigate('/expenses')} className="text-[12px] font-[700] text-[#7C3AED]" style={S}>See All</button>
        </div>
        <div className="space-y-4">
          {recent3.map((exp, i) => (
            <TransactionItem key={exp.id} expense={exp} currency={currency} index={i} onDelete={handleDelete} onEdit={(e) => navigate(`/add?edit=${e.id}`)} />
          ))}
        </div>
      </div>
      <ToastMessage toast={toast} onClose={() => setToast(null)} />
      
      <SuperDeleteModal 
        show={!!deleteId && !walletTx}
        onClose={() => setDeleteId(null)}
        onDelete={confirmRealDelete}
        itemName={expenses.find(e => e.id === deleteId)?.shopName || 'this expense'}
      />

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
