import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Plus, Landmark, CreditCard, Smartphone, 
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

export default function BankAccountsScreen() {
  const navigate = useNavigate()
  const { bankAccounts, loadBankAccounts, addBankAccount, updateBankAccount, deleteBankAccount, isLoading } = useWalletStore()
  const { settings } = useSettingsStore()
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
    }

    if (editingAccount) {
      await updateBankAccount(editingAccount.id, data)
    } else {
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
  const [dragX, setDragX] = useState(0)
  
  return (
    <div className="relative">
      {/* Swipe Options Background */}
      <div className="absolute inset-0 flex items-center justify-end px-6 gap-3">
         <button onClick={onEdit} className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            <Edit3 className="w-5 h-5" />
         </button>
         <button onClick={onDelete} className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 border border-red-100">
            <Trash2 className="w-5 h-5" />
         </button>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -140, right: 0 }}
        onDrag={(e, info) => setDragX(info.offset.x)}
        onClick={onEdit}
        className="relative z-10 p-6 rounded-[32px] flex items-center gap-5 shadow-sm active:shadow-md transition-shadow"
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
            {account.paymentMethods.map(m => (
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
    </div>
  )
}
