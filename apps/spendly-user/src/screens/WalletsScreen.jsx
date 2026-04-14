// WalletsScreen.jsx — Updated to handle Cash Wallet and Bank Accounts
import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import TopHeader from '../components/shared/TopHeader'
import EmptyState from '../components/shared/EmptyState'
import { useTranslation } from 'react-i18next'
import { useWalletStore } from '../store/walletStore'
import { useSettingsStore } from '../store/settingsStore'
import { formatMoney } from '../utils/formatMoney'
import { Plus, Minus, PlusCircle, Trash2, X, Wallet, ChevronRight, CreditCard, Landmark } from 'lucide-react'

const ACCOUNT_TYPES = [
  { id: 'savings', name: 'Savings Account', icon: <Landmark className="w-6 h-6" />, color: '#3B82F6' },
  { id: 'current', name: 'Current Account', icon: <Landmark className="w-6 h-6" />, color: '#7C3AED' },
  { id: 'wallet', name: 'Digital Wallet', icon: <Wallet className="w-6 h-6" />, color: '#10B981' },
]

const HAPTIC_SHAKE = {
  tap: { 
    x: [0, -2, 2, -2, 2, 0],
    transition: { duration: 0.2, ease: "easeInOut" }
  }
}

function BottomSheet({ show, onClose, title, children }) {
  const S = { fontFamily: "'DM Sans', sans-serif" }
  return createPortal(
    <AnimatePresence>
      {show && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-[2001] pointer-events-auto bg-black/40 backdrop-blur-[2px]" />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 350 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[450px] z-[2002] pb-safe bg-white flex flex-col pointer-events-auto shadow-[0_-20px_40px_rgba(0,0,0,0.1)]"
            style={{ borderRadius: '40px 40px 0 0', maxHeight: '90dvh' }}>
            <div className="w-12 h-1.5 bg-[#F1F5F9] rounded-full mx-auto mt-4 mb-4" />
            <div className="flex items-center justify-between px-8 mb-4">
              <h3 className="text-[22px] font-[800] text-black tracking-tight" style={S}>{title}</h3>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#F8FAFC] flex items-center justify-center border border-[#EDF2F7]">
                <X className="w-5 h-5 text-black" strokeWidth={2.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-8 pb-10">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.getElementById('modal-root') || document.body
  )
}

function AddAccountSheet({ onSave, onClose, show }) {
  const [type, setType] = useState('savings')
  const [bankName, setBankName] = useState('')
  const [balance, setBalance] = useState('')
  const S = { fontFamily: "'DM Sans', sans-serif" }

  const handleSave = () => {
    if (!bankName || !balance) return
    onSave({
      bankName,
      accountNickname: bankName,
      accountType: type,
      balance: parseFloat(balance) || 0,
      paymentMethods: ['upi', 'debit'],
      bankColor: ACCOUNT_TYPES.find(t => t.id === type).color,
      bankIcon: 'Landmark',
      isDefault: false
    })
    setBankName('')
    setBalance('')
    onClose()
  }

  return (
    <BottomSheet show={show} onClose={onClose} title="Add Bank Account">
        <div className="flex gap-3 mb-8">
          {ACCOUNT_TYPES.map(t => (
            <button key={t.id} onClick={() => setType(t.id)}
              className={`flex-1 flex flex-col items-center p-4 rounded-2xl border transition-all ${type === t.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-[#F8FAFC] border-transparent'}`}>
              <div className="mb-2" style={{ color: t.color }}>{t.icon}</div>
              <span className="text-[10px] font-[800] uppercase tracking-tight text-slate-800" style={S}>{t.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        <div className="space-y-6 mb-10">
          <div>
            <p className="text-[11px] font-[800] text-slate-400 uppercase tracking-widest mb-3 ml-1" style={S}>Bank Name</p>
            <input value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. HDFC Bank"
              className="w-full py-4 px-6 rounded-2xl bg-[#F8FAFC] border border-[#EDF2F7] outline-none text-[16px] font-[700]" style={S} />
          </div>
          <div>
            <p className="text-[11px] font-[800] text-slate-400 uppercase tracking-widest mb-3 ml-1" style={S}>Initial Balance</p>
            <input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="0.00"
              className="w-full py-5 px-6 rounded-2xl bg-[#F8FAFC] border border-[#EDF2F7] outline-none text-[32px] font-[800]" style={S} />
          </div>
        </div>

        <motion.button whileTap={{ scale: 0.96 }} onClick={handleSave}
          className="w-full py-5 rounded-2xl bg-[#7C3AED] text-white font-[800] text-[16px] shadow-xl shadow-purple-500/10" style={S}>
          Securely Add Account
        </motion.button>
    </BottomSheet>
  )
}

export default function WalletsScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { 
    cashWallet, loadCashWallet, 
    bankAccounts, loadBankAccounts, 
    addBankAccount, deleteBankAccount 
  } = useWalletStore()
  const { getCurrency } = useSettingsStore()
  const [showAdd, setShowAdd] = useState(false)
  const currency = getCurrency()
  const S = { 
    sora: { fontFamily: "'Sora', sans-serif" },
    dmSans: { fontFamily: "'DM Sans', sans-serif" }
  }

  useEffect(() => { 
    loadCashWallet()
    loadBankAccounts()
  }, [loadCashWallet, loadBankAccounts])

  const overallBalance = useMemo(() => {
    const cash = cashWallet?.totalCash || 0
    const banks = bankAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0)
    return cash + banks
  }, [cashWallet, bankAccounts])

  return (
    <div className="flex flex-col min-h-dvh mb-tab bg-[#F9FBFF] safe-top">
      <TopHeader title="My Wallets" />

      {/* Hero Balance Card */}
      <div className="mx-6 mb-8 mt-6 rounded-[36px] p-8 text-white relative overflow-hidden shadow-2xl bg-slate-900 shadow-slate-900/10">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-indigo-500/20 -mr-20 -mt-20 blur-3xl" />
        <div className="relative z-10">
          <p className="text-[11px] font-[800] text-slate-400 uppercase tracking-[0.2em] mb-3" style={S.dmSans}>Combined Balance</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[24px] font-[800] text-indigo-400" style={S.sora}>{currency}</span>
            <p className="text-[48px] font-[900] leading-none tracking-tighter" style={S.sora}>
                {overallBalance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="px-7 mb-6">
         <h2 className="text-[20px] font-[800] text-black tracking-tight" style={S.dmSans}>Physical Cash</h2>
      </div>

      {/* Cash Wallet Shortcut Card */}
      <div className="px-6 mb-10">
        <motion.div 
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/cash-wallet')}
          className="bg-white rounded-[32px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.03)] border border-white flex items-center gap-5 relative overflow-hidden"
        >
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-3xl shadow-inner">
             💵
          </div>
          <div className="flex-1">
            <p className="font-[800] text-[17px] text-slate-900 tracking-tight" style={S.dmSans}>Pocket Cash</p>
            <p className="text-[24px] font-[800] mt-0.5 tracking-tight text-emerald-600" style={S.sora}>
              {currency}{cashWallet?.totalCash?.toLocaleString() || '0'}
            </p>
          </div>
          <ChevronRight className="w-6 h-6 text-slate-300" />
        </motion.div>
      </div>

      <div className="px-7 mb-6 flex items-center justify-between">
         <h2 className="text-[20px] font-[800] text-black tracking-tight" style={S.dmSans}>Bank Accounts</h2>
         <button 
           onClick={() => navigate('/bank-accounts')}
           className="px-4 py-1.5 rounded-full bg-slate-100 text-[11px] font-[802] text-[#7C3AED] uppercase tracking-widest active:bg-slate-200 transition-colors" 
           style={S.dmSans}
         >
            Manage
         </button>
      </div>

      {bankAccounts.length === 0 ? (
        <div className="px-6">
           <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] p-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                <Plus className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-[14px] font-[700] text-slate-400" style={S.dmSans}>No bank accounts added yet</p>
           </div>
        </div>
      ) : (
        <div className="px-6 flex flex-col gap-4 pb-40">
          {bankAccounts.map((acc, i) => (
            <motion.div 
              key={acc.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-[28px] p-5 shadow-sm border border-slate-50 flex items-center gap-5 relative group"
            >
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: acc.bankColor || '#7C3AED' }}
              >
                <Landmark className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-[800] text-[15px] text-slate-900 truncate" style={S.dmSans}>{acc.bankName}</p>
                <p className="text-[18px] font-[800] mt-0.5 tracking-tight text-slate-900" style={S.sora}>
                  {currency}{acc.balance?.toLocaleString() || '0'}
                </p>
              </div>
              <button 
                onClick={() => deleteBankAccount(acc.id)} 
                className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* FAB */}
      <motion.button 
        variants={HAPTIC_SHAKE}
        whileTap="tap"
        onClick={() => setShowAdd(true)}
        className="fixed bottom-28 right-7 w-16 h-16 rounded-full bg-[#7C3AED] text-white shadow-2xl flex items-center justify-center z-40 border-4 border-white"
      >
        <Plus className="w-8 h-8" strokeWidth={3} />
      </motion.button>

      <AddAccountSheet 
        show={showAdd} 
        onSave={addBankAccount} 
        onClose={() => setShowAdd(false)} 
      />
    </div>
  )
}
