import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
<<<<<<< HEAD
  Plus, Landmark, CreditCard, Smartphone, 
  Globe, Trash2, Edit3, X, Check, ChevronRight 
} from 'lucide-react'
import { useWalletStore } from '../store/walletStore'
import { useSettingsStore } from '../store/settingsStore'
import TopHeader from '../components/shared/TopHeader'
import { createPortal } from 'react-dom'

const COUNTRY_BANKS = {
  INR: ['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'Yes Bank', 'PNB', 'BOB', 'Canara', 'Union'],
  USD: ['Chase', 'BofA', 'Wells Fargo', 'Citi', 'US Bank', 'PNC', 'Capital One', 'Goldman Sachs', 'TD Bank', 'BMO'],
  EUR: ['BNP Paribas', 'Deutsche Bank', 'Santander', 'HSBC', 'ING', 'Crédit Agricole', 'Société Générale', 'UniCredit'],
  GBP: ['Barclays', 'HSBC', 'NatWest', 'Lloyds', 'Standard Chartered', 'Santander UK', 'Nationwide']
}
const PRESET_COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F97316', '#EF4444', '#1E293B']
const ACCOUNT_TYPES = ['savings', 'current', 'wallet']
const PAYMENT_METHODS = [
  { id: 'upi', name: 'UPI', icon: <Smartphone className="w-3.5 h-3.5" /> },
  { id: 'netbanking', name: 'NetBanking', icon: <Globe className="w-3.5 h-3.5" /> },
  { id: 'debit', name: 'Debit Card', icon: <CreditCard className="w-3.5 h-3.5" /> }
]

const S = {
  sora: { fontFamily: "'Sora', sans-serif" },
  dmSans: { fontFamily: "'DM Sans', sans-serif" }
}

// Reusable BottomSheet Component
function BottomSheet({ show, onClose, title, children }) {
  return createPortal(
    <AnimatePresence>
      {show && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} 
            className="fixed inset-0 z-[2001] bg-black/40 backdrop-blur-[2px] pointer-events-auto" 
          />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 350 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[450px] z-[2002] pb-safe bg-white flex flex-col pointer-events-auto shadow-[0_-20px_40px_rgba(0,0,0,0.1)]"
            style={{ borderRadius: '40px 40px 0 0', maxHeight: '92dvh' }}
          >
            <div className="w-12 h-1.5 bg-[#F1F5F9] rounded-full mx-auto mt-4 mb-4" />
            <div className="flex items-center justify-between px-8 mb-4">
              <h3 className="text-[22px] font-[800] text-black tracking-tight" style={S.dmSans}>{title}</h3>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#F8FAFC] flex items-center justify-center border border-[#EDF2F7]">
                <X className="w-5 h-5 text-black" strokeWidth={2.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-8 pb-10 scrollbar-hide">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.getElementById('modal-root') || document.body
  )
}

=======
  ChevronLeft, Plus, Landmark, CreditCard, Smartphone, 
  Globe, Trash2, Edit2, Check, X, Star, Wallet, Trash, History
} from 'lucide-react'
import SuperDeleteModal from '../components/modals/SuperDeleteModal'
import { useWalletStore } from '../store/walletStore'
import { useSettingsStore } from '../store/settingsStore'
import { formatMoney } from '../utils/formatMoney'

const SORA = { fontFamily: "'Sora', sans-serif" }
const DM_SANS = { fontFamily: "'DM Sans', sans-serif" }
const S = { fontFamily: "'Inter', sans-serif" }

const POPULAR_BANKS = ['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'Yes Bank', 'PNB', 'BOB', 'Canara', 'Union']
const PRESET_COLORS = ['#000000', '#F97316', '#22C55E', '#3B82F6', '#EF4444', '#EC4899']
const ACCOUNT_TYPES = ['savings', 'current', 'wallet']
const PAYMENT_MODES = [
  { id: 'upi', label: 'UPI', icon: <Smartphone className="w-3 h-3" /> },
  { id: 'netbanking', label: 'NetBanking', icon: <Globe className="w-3 h-3" /> },
  { id: 'debit', label: 'Debit Card', icon: <CreditCard className="w-3 h-3" /> }
]

>>>>>>> 41f113d (upgrade scanner)
export default function BankAccountsScreen() {
  const navigate = useNavigate()
  const { bankAccounts, loadBankAccounts, addBankAccount, updateBankAccount, deleteBankAccount, isLoading } = useWalletStore()
  const { settings } = useSettingsStore()
<<<<<<< HEAD
  const currency = settings?.currency || 'USD'
  const popularBanks = COUNTRY_BANKS[currency] || ['My Bank', 'Savings', 'Wallet']

  const [showSheet, setShowSheet] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  
  // Form State
  const [formData, setFormData] = useState({
    bankName: '',
    accountNickname: '',
    accountType: 'savings',
    balance: '',
    paymentMethods: ['upi', 'debit'],
    upiId: '',
    bankColor: PRESET_COLORS[0],
    isDefault: false
  })

  useEffect(() => {
    loadBankAccounts()
  }, [])

  const totalBankBalance = useMemo(() => {
    return bankAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0)
  }, [bankAccounts])

  const openAdd = () => {
    setEditingAccount(null)
    setFormData({
      bankName: '',
      accountNickname: '',
      accountType: 'savings',
      balance: '',
      paymentMethods: ['upi', 'debit'],
      upiId: '',
      bankColor: PRESET_COLORS[0],
      isDefault: false
    })
    setShowSheet(true)
  }

  const openEdit = (acc) => {
    setEditingAccount(acc)
    setFormData({ ...acc, balance: acc.balance.toString() })
    setShowSheet(true)
  }

  const handleSave = async () => {
    if (!formData.bankName || formData.paymentMethods.length === 0) return
    
    const data = {
      ...formData,
      balance: parseFloat(formData.balance) || 0,
      lastUpdated: new Date().toISOString()
=======
  const currency = settings?.currency || 'INR'

  const [showAddSheet, setShowAddSheet] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  const [deleteAccount, setDeleteAccount] = useState(null)
  
  // Form State
  const initialForm = {
    bankName: '',
    accountNickname: '',
    balance: '',
    accountType: 'savings',
    paymentMethods: ['upi'],
    upiId: '',
    bankColor: PRESET_COLORS[0],
    isDefault: false
  }
  const [form, setForm] = useState(initialForm)

  useEffect(() => {
    loadBankAccounts(currency)
  }, [currency])

  const totalInBanks = useMemo(() => {
    return bankAccounts.reduce((sum, acc) => sum + (parseFloat(acc.balance) || 0), 0)
  }, [bankAccounts])

  const handleOpenAdd = () => {
    setForm(initialForm)
    setEditingAccount(null)
    setShowAddSheet(true)
  }

  const handleOpenEdit = (acc) => {
    setForm({
      ...acc,
      balance: acc.balance.toString()
    })
    setEditingAccount(acc)
    setShowAddSheet(true)
  }

  const handleSave = async () => {
    if (!form.bankName || form.paymentMethods.length === 0) return
    
    const data = {
      ...form,
      balance: parseFloat(form.balance) || 0
>>>>>>> 41f113d (upgrade scanner)
    }

    if (editingAccount) {
      await updateBankAccount(editingAccount.id, data)
    } else {
<<<<<<< HEAD
      await addBankAccount(data)
    }
    
    setShowSheet(false)
    window.dispatchEvent(new CustomEvent('toast', { 
      detail: { message: `Account ${editingAccount ? 'updated' : 'added'} successfully!`, type: 'success' } 
    }))
  }

  const toggleMethod = (id) => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(id)
        ? prev.paymentMethods.filter(m => m !== id)
        : [...prev.paymentMethods, id]
    }))
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F5F5] pb-32 safe-bottom">
      <TopHeader 
        title="Bank Accounts" 
        showBack 
        onBack={() => navigate(-1)}
        showBell={false}
        rightElement={
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={openAdd}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#7C3AED] text-white shadow-lg shadow-purple-500/30"
          >
            <Plus className="w-5 h-5" strokeWidth={3} />
          </motion.button>
        }
      />

      <div className="px-6 flex-1 overflow-y-auto pt-6">
        {/* Total Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full rounded-[32px] p-8 mb-8 relative overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)'
          }}
        >
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <p className="text-[12px] font-[800] text-purple-200 uppercase tracking-[0.2em] mb-3" style={S.dmSans}>
              Total in Banks
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-[24px] font-[800] text-purple-200" style={S.sora}>{currency}</span>
              <h2 className="text-[42px] font-[800] text-white tracking-tighter leading-none" style={S.sora}>
                {totalBankBalance.toLocaleString()}
              </h2>
            </div>
          </div>
        </motion.div>

        {/* Bank List */}
        <div className="space-y-4">
          {bankAccounts.length === 0 ? (
            <div className="bg-white rounded-[32px] p-10 text-center border border-dashed border-slate-200 mt-10">
              <Landmark className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-[14px] font-[700] text-slate-400" style={S.dmSans}>No accounts found. Tap + to add one.</p>
            </div>
          ) : (
            bankAccounts.map((acc, idx) => (
              <BankCard 
                key={acc.id} 
                account={acc} 
                currency={currency}
                onEdit={() => openEdit(acc)}
                onDelete={() => deleteBankAccount(acc.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Sheet */}
      <BottomSheet 
        show={showSheet} 
        onClose={() => setShowSheet(false)} 
        title={editingAccount ? "Edit Account" : "Add New Bank"}
      >
        <div className="space-y-6">
          {/* Bank Selection */}
          <div>
            <p className="text-[11px] font-[802] text-slate-400 uppercase tracking-widest mb-3 ml-1" style={S.dmSans}>Popular Banks</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {popularBanks.map(bank => (
                <button
                  key={bank}
                  onClick={() => setFormData(prev => ({ ...prev, bankName: bank, accountNickname: prev.accountNickname || bank }))}
                  className={`flex-shrink-0 px-5 py-2.5 rounded-full border text-[13px] font-[800] transition-all
                    ${formData.bankName === bank 
                      ? 'bg-[#7C3AED] border-[#7C3AED] text-white shadow-md' 
                      : 'bg-[#F8FAFC] border-[#EDF2F7] text-slate-500'
                    }`}
                  style={S.dmSans}
                >
                  {bank}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <p className="text-[11px] font-[802] text-slate-400 uppercase tracking-widest mb-3 ml-1" style={S.dmSans}>Bank Name</p>
              <input 
                value={formData.bankName}
                onChange={e => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                placeholder="Enter bank name"
                className="w-full py-4 px-6 rounded-2xl bg-[#F8FAFC] border border-[#EDF2F7] outline-none text-[16px] font-[700]" 
                style={S.dmSans} 
              />
            </div>
            <div className="col-span-2">
              <p className="text-[11px] font-[802] text-slate-400 uppercase tracking-widest mb-3 ml-1" style={S.dmSans}>Account Nickname</p>
              <input 
                value={formData.accountNickname}
                onChange={e => setFormData(prev => ({ ...prev, accountNickname: e.target.value }))}
                placeholder="e.g. Salary Account"
                className="w-full py-4 px-6 rounded-2xl bg-[#F8FAFC] border border-[#EDF2F7] outline-none text-[15px] font-[700]" 
                style={S.dmSans} 
              />
            </div>
            <div className="col-span-2">
              <p className="text-[11px] font-[802] text-slate-400 uppercase tracking-widest mb-3 ml-1" style={S.dmSans}>Current Balance</p>
              <div className="relative group">
                <span className={`absolute left-6 top-1/2 -translate-y-1/2 font-[900] text-slate-300 transition-colors group-focus-within:text-purple-500 flex items-center ${currency.length > 2 ? 'text-[14px]' : 'text-[22px]'}`} style={S.sora}>{currency}</span>
                <input 
                  type="number"
                  value={formData.balance}
                  onChange={e => setFormData(prev => ({ ...prev, balance: e.target.value }))}
                  placeholder="0.00"
                  className={`w-full py-5 pr-6 rounded-[24px] bg-[#F8FAFC] border border-[#EDF2F7] outline-none text-[28px] font-[900] transition-all focus:bg-white focus:border-purple-200 focus:shadow-xl focus:shadow-purple-500/5 ${currency.length > 2 ? 'pl-24' : 'pl-16'}`} 
                  style={S.sora} 
                />
              </div>
            </div>
          </div>

          <div>
             <p className="text-[11px] font-[802] text-slate-400 uppercase tracking-widest mb-3 ml-1" style={S.dmSans}>Account Type</p>
             <div className="flex gap-2">
                {ACCOUNT_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setFormData(prev => ({ ...prev, accountType: type }))}
                    className={`flex-1 py-3.5 rounded-2xl border text-[13px] font-[800] uppercase tracking-tighter transition-all
                      ${formData.accountType === type 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                        : 'bg-[#F8FAFC] border-[#EDF2F7] text-slate-400'
                      }`}
                    style={S.dmSans}
                  >
                    {type}
                  </button>
                ))}
             </div>
          </div>

          <div>
             <p className="text-[11px] font-[802] text-slate-400 uppercase tracking-widest mb-3 ml-1" style={S.dmSans}>Payment Methods</p>
             <div className="flex gap-2">
                {PAYMENT_METHODS.map(method => {
                  const isActive = formData.paymentMethods.includes(method.id)
                  return (
                    <button
                      key={method.id}
                      onClick={() => toggleMethod(method.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border transition-all
                        ${isActive 
                          ? 'border-[#7C3AED] bg-purple-50 text-[#7C3AED]' 
                          : 'border-[#EDF2F7] bg-[#F8FAFC] text-slate-400'
                        }`}
                    >
                      {method.icon}
                      <span className="text-[11px] font-[800]" style={S.dmSans}>{method.name}</span>
                    </button>
                  )
                })}
             </div>
          </div>

          {formData.paymentMethods.includes('upi') && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <p className="text-[11px] font-[802] text-slate-400 uppercase tracking-widest mb-3 ml-1" style={S.dmSans}>UPI ID (Optional)</p>
              <input 
                value={formData.upiId}
                onChange={e => setFormData(prev => ({ ...prev, upiId: e.target.value }))}
                placeholder="user@bank"
                className="w-full py-4 px-6 rounded-2xl bg-[#F8FAFC] border border-[#EDF2F7] outline-none text-[15px] font-[700]" 
                style={S.dmSans} 
              />
            </motion.div>
          )}

          <div>
             <p className="text-[11px] font-[802] text-slate-400 uppercase tracking-widest mb-3 ml-1" style={S.dmSans}>Card Color</p>
             <div className="flex justify-between items-center bg-[#F8FAFC] p-3 rounded-2xl border border-[#EDF2F7]">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setFormData(prev => ({ ...prev, bankColor: color }))}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ backgroundColor: color }}
                  >
                    {formData.bankColor === color && <Check className="w-5 h-5 text-white" />}
                  </button>
                ))}
             </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl border border-[#EDF2F7]">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.isDefault ? 'bg-amber-100 text-amber-500' : 'bg-slate-100 text-slate-400'}`}>
                <Check className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[14px] font-[800] text-slate-900" style={S.dmSans}>Set as Default</p>
                <p className="text-[11px] font-[600] text-slate-400" style={S.dmSans}>Use for future scans & entries</p>
              </div>
            </div>
            <button 
              onClick={() => setFormData(prev => ({ ...prev, isDefault: !prev.isDefault }))}
              className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${formData.isDefault ? 'bg-[#7C3AED]' : 'bg-slate-200'}`}
            >
              <motion.div 
                animate={{ x: formData.isDefault ? 24 : 0 }}
                className="w-6 h-6 bg-white rounded-full shadow-sm" 
              />
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleSave}
            disabled={!formData.bankName || formData.paymentMethods.length === 0}
            className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-[802] text-[16px] shadow-xl transition-all
              ${formData.bankName && formData.paymentMethods.length > 0
                ? 'bg-black text-white shadow-black/10' 
                : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
              }`}
            style={S.dmSans}
          >
            {editingAccount ? "Update Bank Details" : "Securely Add Bank"}
          </motion.button>
        </div>
      </BottomSheet>
    </div>
  )
}

function BankCard({ account, currency, onEdit, onDelete }) {
  return (
    <div className="relative group">
      {/* Swipe Options Background */}
      <div className="absolute inset-0 flex items-center justify-end px-6 gap-3">
         <button onClick={onEdit} className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm active:bg-slate-50 transition-all">
            <Edit3 className="w-5 h-5" />
         </button>
         <button onClick={onDelete} className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 border border-red-100 shadow-sm active:bg-red-100 transition-all">
            <Trash2 className="w-5 h-5" />
         </button>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -140, right: 0 }}
        onClick={onEdit}
        className="relative z-10 p-6 rounded-[32px] flex items-center gap-5 shadow-sm active:shadow-md transition-shadow cursor-pointer"
        style={{ 
          backgroundColor: account.bankColor || '#7C3AED',
          color: 'white'
        }}
      >
        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
          <Landmark className="w-7 h-7" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-[800] text-[16px] truncate tracking-tight" style={S.dmSans}>{account.bankName}</p>
            {account.isDefault && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />}
          </div>
          <p className="text-[12px] font-[600] opacity-70 truncate mb-2" style={S.dmSans}>{account.accountNickname}</p>
          
          <div className="flex gap-1.5">
            {account.paymentMethods?.map(m => (
              <div key={m} className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-[9px] font-[900] uppercase tracking-tighter">
                {m}
              </div>
            ))}
          </div>
        </div>

        <div className="text-right">
          <p className="text-[20px] font-[800] leading-none mb-1" style={S.sora}>
            {currency}{account.balance?.toLocaleString()}
          </p>
          <ChevronRight className="w-4 h-4 ml-auto opacity-30" />
        </div>
      </motion.div>
=======
      await addBankAccount(data, currency)
    }
    setShowAddSheet(false)
  }

  const handleDeleteTrigger = (acc) => {
    setDeleteAccount(acc)
    setShowAddSheet(false)
  }

  const handleConfirmDelete = async () => {
    if (deleteAccount) {
      await deleteBankAccount(deleteAccount.id)
      setDeleteAccount(null)
    }
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F5F5] overflow-x-hidden safe-top pb-32">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-transparent">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
          <ChevronLeft className="w-6 h-6 text-black" />
        </motion.button>
        <h1 className="text-[17px] font-[700] text-black" style={DM_SANS}>Bank Accounts</h1>
        <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/wallet-history')}
              className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#F1F5F9]">
              <History className="w-5 h-5 text-black" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleOpenAdd}
              className="w-11 h-11 rounded-full bg-black flex items-center justify-center shadow-lg shadow-black/10">
              <Plus className="w-5 h-5 text-white" strokeWidth={3} />
            </motion.button>
        </div>
      </header>

      {/* Total Card */}
      <div className="px-6 mt-2 mb-10">
        <div className="w-full rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-black/20 bg-black flex flex-col items-center justify-center min-h-[210px]"
          style={S}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-60" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16 blur-3xl opacity-40" />
          
          <div className="relative z-10 flex flex-col items-center gap-2 text-center">
            <p className="text-white/40 text-[10px] font-[800] uppercase tracking-[0.2em] mb-1" style={S}>Total in Banks</p>
            <div className="flex items-baseline gap-2">
              <span className="text-[52px] font-[900] leading-none tracking-tighter" style={SORA}>
                {formatMoney(totalInBanks, currency)}
              </span>
            </div>
            <div className="mt-8 px-5 py-2 rounded-full bg-white/10 border border-white/5 text-[10px] font-[800] uppercase tracking-widest text-white/60" style={DM_SANS}>
              {bankAccounts.length} ACTIVE ACCOUNTS
            </div>
          </div>
        </div>
      </div>

      {/* Account List */}
      <div className="px-6 flex flex-col gap-4">
        <h2 className="text-[13px] font-[700] text-[#AFAFAF] uppercase tracking-widest pl-2 mb-2" style={DM_SANS}>
          Your Linked Accounts
        </h2>
        
        <AnimatePresence>
          {bankAccounts.map((acc) => (
            <motion.div key={acc.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative group">
              <motion.div onClick={() => handleOpenEdit(acc)}
                className="w-full rounded-[28px] p-6 bg-white shadow-sm border border-[#F1F5F9] relative overflow-hidden z-10 active:scale-[0.99] transition-all cursor-pointer flex flex-col gap-6">
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden" 
                      style={{ backgroundColor: acc.bankColor }}>
                      <div className="absolute inset-0 bg-white/10" />
                      <Landmark className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[10px] font-[800] text-slate-400 uppercase tracking-widest" style={DM_SANS}>{acc.bankName}</p>
                        {acc.isDefault && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                      </div>
                      <p className="text-[18px] font-[800] text-black tracking-tight" style={SORA}>{acc.accountNickname}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[20px] font-[900] text-black" style={SORA}>
                      {formatMoney(acc.balance, currency)}
                    </p>
                    <p className="text-[9px] font-[800] text-slate-300 uppercase tracking-widest" style={DM_SANS}>Current Balance</p>
                  </div>
                </div>

                <div className="flex gap-2 relative z-10">
                  {acc.paymentMethods.map(pmId => {
                    const pm = PAYMENT_MODES.find(p => p.id === pmId)
                    return (
                      <div key={pmId} className="px-3 py-1.5 rounded-full bg-[#F6F6F6] border border-[#EEEEEE] flex items-center gap-2">
                        <span className="text-slate-400">{pm?.icon}</span>
                        <span className="text-[9px] font-[800] text-slate-500 tracking-widest uppercase">{pm?.label}</span>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
              
            </motion.div>
          ))}
        </AnimatePresence>
        
        {bankAccounts.length === 0 && (
          <div className="mt-10 flex flex-col items-center justify-center opacity-30 px-10 text-center">
            <Landmark className="w-16 h-16 mb-4" />
            <p className="text-[14px] font-[700]" style={DM_SANS}>No bank accounts found.<br/>Tap + to add your first bank.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Bottom Sheet */}
      <AnimatePresence>
        {showAddSheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddSheet(false)}
              className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm" />
            <motion.div initial={{ y: '100%', x: '-50%' }} animate={{ y: 0, x: '-50%' }} exit={{ y: '100%', x: '-50%' }}
              className="fixed bottom-0 left-1/2 w-full max-w-[450px] bg-white rounded-t-[40px] z-[101] flex flex-col max-h-[90vh]">
              <div className="w-12 h-1.5 bg-[#F1F5F9] rounded-full mx-auto mt-4 mb-6" />
              
              <div className="flex-1 overflow-y-auto px-8 pb-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[22px] font-[800] text-black" style={DM_SANS}>
                      {editingAccount ? 'Edit Bank' : 'Add New Bank'}
                    </h3>
                    {editingAccount && (
                      <button onClick={() => handleDeleteTrigger(editingAccount)} 
                        className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 active:bg-red-100 transition-colors ml-2">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <button onClick={() => setShowAddSheet(false)} className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center">
                    <X className="w-5 h-5 text-black" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Bank Name */}
                  <div>
                    <label className="text-[11px] font-[900] text-[#AFAFAF] uppercase tracking-widest ml-1 mb-3 block">Bank Name</label>
                    <input value={form.bankName} onChange={e => setForm({...form, bankName: e.target.value})}
                      placeholder="e.g. HDFC Bank" className="w-full p-5 rounded-2xl bg-[#F8FAFC] border border-[#F1F5F9] text-[16px] font-[700] outline-none focus:border-[#00000050]" style={DM_SANS} />
                    <div className="flex flex-wrap gap-2 mt-3">
                      {POPULAR_BANKS.map(b => (
                        <button key={b} onClick={() => setForm({...form, bankName: b})}
                          className={`px-4 py-1.5 rounded-full text-[10px] font-[800] border transition-all ${form.bankName === b ? 'bg-black text-white border-black' : 'bg-white text-black border-[#F1F5F9]'}`}>
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nickname & Balance */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-[900] text-[#AFAFAF] uppercase tracking-widest ml-1 mb-3 block">Nickname</label>
                      <input value={form.accountNickname} onChange={e => setForm({...form, accountNickname: e.target.value})}
                        placeholder="Salary Account" className="w-full p-5 rounded-2xl bg-[#F8FAFC] border border-[#F1F5F9] text-[15px] font-[700] outline-none" style={DM_SANS} />
                    </div>
                    <div>
                      <label className="text-[11px] font-[900] text-[#AFAFAF] uppercase tracking-widest ml-1 mb-3 block">Balance</label>
                      <input type="number" value={form.balance} onChange={e => setForm({...form, balance: e.target.value})}
                        placeholder="0.00" className="w-full p-5 rounded-2xl bg-[#F8FAFC] border border-[#F1F5F9] text-[15px] font-[800] outline-none" style={SORA} />
                    </div>
                  </div>

                  {/* Account Type */}
                  <div>
                    <label className="text-[11px] font-[900] text-[#AFAFAF] uppercase tracking-widest ml-1 mb-3 block">Account Type</label>
                    <div className="flex gap-2">
                       {ACCOUNT_TYPES.map(type => (
                         <button key={type} onClick={() => setForm({...form, accountType: type})}
                          className={`flex-1 py-4 rounded-xl text-[12px] font-[800] uppercase tracking-widest border transition-all ${form.accountType === type ? 'bg-[#000000] text-white border-[#000000]' : 'bg-white text-black border-[#F1F5F9]'}`}>
                           {type}
                         </button>
                       ))}
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div>
                    <label className="text-[11px] font-[900] text-[#AFAFAF] uppercase tracking-widest ml-1 mb-3 block">Payment Methods</label>
                    <div className="space-y-2">
                       {PAYMENT_MODES.map(pm => (
                         <button key={pm.id} onClick={() => {
                           const updated = form.paymentMethods.includes(pm.id)
                            ? form.paymentMethods.filter(id => id !== pm.id)
                            : [...form.paymentMethods, pm.id]
                           setForm({...form, paymentMethods: updated})
                         }}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${form.paymentMethods.includes(pm.id) ? 'bg-indigo-50 border-[#00000050]' : 'bg-white border-[#F1F5F9]'}`}>
                           <div className="flex items-center gap-4">
                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.paymentMethods.includes(pm.id) ? 'bg-[#000000] text-white' : 'bg-[#F1F5F9] text-gray-400'}`}>
                                {pm.icon}
                             </div>
                             <span className="text-[14px] font-[700]">{pm.label}</span>
                           </div>
                           <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${form.paymentMethods.includes(pm.id) ? 'bg-[#000000] border-[#000000]' : 'border-[#F1F5F9]'}`}>
                             {form.paymentMethods.includes(pm.id) && <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />}
                           </div>
                         </button>
                       ))}
                    </div>
                  </div>

                  {/* UPI ID */}
                  {form.paymentMethods.includes('upi') && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                       <label className="text-[11px] font-[900] text-[#AFAFAF] uppercase tracking-widest ml-1 mb-3 block">UPI ID</label>
                       <input value={form.upiId} onChange={e => setForm({...form, upiId: e.target.value})}
                        placeholder="yourname@bank" className="w-full p-5 rounded-2xl bg-[#F8FAFC] border border-[#F1F5F9] text-[15px] font-[700] outline-none" style={DM_SANS} />
                    </motion.div>
                  )}

                  {/* Color Picker */}
                  <div>
                    <label className="text-[11px] font-[900] text-[#AFAFAF] uppercase tracking-widest ml-1 mb-3 block">Theme Color</label>
                    <div className="flex justify-between items-center px-2">
                       {PRESET_COLORS.map(c => (
                         <button key={c} onClick={() => setForm({...form, bankColor: c})}
                          className={`w-10 h-10 rounded-full border-4 transition-all ${form.bankColor === c ? 'border-black scale-110 shadow-lg' : 'border-white'}`}
                          style={{ backgroundColor: c }} />
                       ))}
                    </div>
                  </div>

                  {/* Default Toggle */}
                  <div className="flex items-center justify-between p-5 rounded-2xl bg-[#F8FAFC] border border-[#F1F5F9]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <Star className={`w-5 h-5 ${form.isDefault ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      </div>
                      <span className="text-[14px] font-[800]">Set as Primary Account</span>
                    </div>
                    <button onClick={() => setForm({...form, isDefault: !form.isDefault})}
                      className={`w-14 h-8 rounded-full transition-all p-1 ${form.isDefault ? 'bg-[#000000]' : 'bg-[#E2E8F0]'}`}>
                      <div className={`w-6 h-6 bg-white rounded-full transition-all ${form.isDefault ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave}
                    className="w-full py-6 rounded-3xl bg-black text-white font-[900] text-[16px] uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3">
                    {editingAccount ? 'Update Account' : 'Confirm Account'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <SuperDeleteModal 
        show={!!deleteAccount}
        onClose={() => setDeleteAccount(null)}
        onDelete={handleConfirmDelete}
        itemName={deleteAccount?.bankName || 'this bank account'}
      />
>>>>>>> 41f113d (upgrade scanner)
    </div>
  )
}
