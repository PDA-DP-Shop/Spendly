// WalletsScreen.jsx — Feature 4: Wallet Balance Tracker
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TopHeader from '../components/shared/TopHeader'
import EmptyState from '../components/shared/EmptyState'
import { useWalletStore } from '../store/walletStore'
import { useSettingsStore } from '../store/settingsStore'
import { formatMoney } from '../utils/formatMoney'
import { Plus, Minus, PlusCircle, Trash2, X, Wallet } from 'lucide-react'

const WALLET_TYPES = [
  { id: 'cash', name: 'Cash in Hand', icon: '💵', color: '#22C55E' },
  { id: 'gpay', name: 'GPay', icon: '📱', color: '#4285F4' },
  { id: 'paytm', name: 'Paytm', icon: '💙', color: '#00BAF2' },
  { id: 'phonepe', name: 'PhonePe', icon: '💜', color: '#5F259F' },
  { id: 'amazon', name: 'Amazon Pay', icon: '🛒', color: '#FF9900' },
  { id: 'custom', name: 'Custom', icon: '💳', color: '#7C3AED' },
]

function AddWalletSheet({ onSave, onClose }) {
  const [type, setType] = useState(WALLET_TYPES[0])
  const [name, setName] = useState('')
  const [balance, setBalance] = useState('')

  const handleSave = () => {
    if (!balance) return
    onSave({
      name: name || type.name,
      icon: type.icon,
      color: type.color,
      balance: parseFloat(balance) || 0,
      type: type.id,
    })
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div className="relative w-full bg-white dark:bg-[#1A1A2E] rounded-t-[28px] p-6 pb-10"
        initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} transition={{ type: 'spring', damping: 25 }}>
        <div className="flex items-center justify-between mb-6">
          <p className="text-[18px] font-sora font-bold text-gray-900 dark:text-white">Add Wallet</p>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        {/* Wallet type picker */}
        <p className="text-[12px] font-semibold text-gray-500 uppercase mb-3">Wallet Type</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {WALLET_TYPES.map(t => (
            <button key={t.id} onClick={() => setType(t)}
              className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${type.id === t.id ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-100 dark:border-gray-700'}`}>
              <span className="text-2xl mb-1">{t.icon}</span>
              <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">{t.name}</span>
            </button>
          ))}
        </div>
        {type.id === 'custom' && (
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Wallet name"
            className="w-full py-3 px-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 outline-none text-[15px] mb-4 text-gray-900 dark:text-white" />
        )}
        <p className="text-[12px] font-semibold text-gray-500 uppercase mb-2">Starting Balance</p>
        <input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="0.00"
          className="w-full py-3 px-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 outline-none text-[15px] mb-6 text-gray-900 dark:text-white" />
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave}
          className="w-full py-4 rounded-[20px] text-white font-semibold" style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}>
          Add Wallet
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

function AdjustSheet({ wallet, onSave, onClose, currency }) {
  const [mode, setMode] = useState('add')
  const [amount, setAmount] = useState('')
  const handleSave = () => {
    const delta = (parseFloat(amount) || 0) * (mode === 'add' ? 1 : -1)
    if (!delta) return
    onSave(wallet.id, delta)
    onClose()
  }
  return (
    <motion.div className="fixed inset-0 z-50 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div className="relative w-full bg-white dark:bg-[#1A1A2E] rounded-t-[28px] p-6 pb-10"
        initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} transition={{ type: 'spring', damping: 25 }}>
        <div className="flex items-center justify-between mb-6">
          <p className="text-[18px] font-sora font-bold text-gray-900 dark:text-white">{wallet.name}</p>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="flex gap-3 mb-5">
          {['add', 'deduct'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-3 rounded-2xl font-semibold text-[14px] ${mode === m ? (m === 'add' ? 'bg-green-500 text-white' : 'bg-red-500 text-white') : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
              {m === 'add' ? '+ Add Money' : '− Deduct'}
            </button>
          ))}
        </div>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount"
          className="w-full py-4 px-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 outline-none text-[16px] mb-6 text-gray-900 dark:text-white" />
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave}
          className="w-full py-4 rounded-[20px] text-white font-semibold"
          style={{ background: mode === 'add' ? 'linear-gradient(135deg,#22C55E,#16A34A)' : 'linear-gradient(135deg,#EF4444,#DC2626)' }}>
          {mode === 'add' ? 'Add Money' : 'Deduct Money'}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

export default function WalletsScreen() {
  const { wallets, loadWallets, addWallet, adjustBalance, removeWallet, totalBalance } = useWalletStore()
  const { settings } = useSettingsStore()
  const currency = settings?.currency || 'USD'
  const [showAdd, setShowAdd] = useState(false)
  const [adjustTarget, setAdjustTarget] = useState(null)

  useEffect(() => { loadWallets() }, [])

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F5F5] dark:bg-[#0F0F1A] mb-tab">
      <TopHeader title="My Wallets" />

      {/* Total balance hero */}
      <div className="mx-4 mb-4 rounded-[20px] p-5 text-white"
        style={{ background: 'linear-gradient(135deg, #2D2D3A, #1A1A2E)', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Across All Wallets</p>
        <p className="text-[36px] font-sora font-bold">{formatMoney(totalBalance(), currency)}</p>
      </div>

      {wallets.length === 0 ? (
        <EmptyState type="wallets" title="No wallets yet" message="Add your first wallet to track balances" />
      ) : (
        <div className="px-4 flex flex-col gap-3">
          {wallets.map((wallet, i) => (
            <motion.div key={wallet.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-[#1A1A2E] rounded-[20px] p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: wallet.color + '20' }}>{wallet.icon}</div>
                <div className="flex-1">
                  <p className="font-sora font-bold text-[15px] text-gray-900 dark:text-white">{wallet.name}</p>
                  <p className="text-[22px] font-sora font-bold" style={{ color: wallet.color }}>
                    {formatMoney(wallet.balance || 0, currency)}
                  </p>
                </div>
                <button onClick={() => removeWallet(wallet.id)} className="p-2 text-gray-300"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setAdjustTarget(wallet)}
                  className="flex-1 py-2.5 rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-600 font-semibold text-[13px] flex items-center justify-center gap-1">
                  <Plus className="w-4 h-4" /> Add
                </button>
                <button onClick={() => setAdjustTarget(wallet)}
                  className="flex-1 py-2.5 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-500 font-semibold text-[13px] flex items-center justify-center gap-1">
                  <Minus className="w-4 h-4" /> Deduct
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* FAB */}
      <motion.button whileTap={{ scale: 0.92 }} onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full text-white shadow-xl flex items-center justify-center z-40"
        style={{ background: '#F97316' }}>
        <Plus className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {showAdd && <AddWalletSheet onSave={w => { addWallet(w); setShowAdd(false) }} onClose={() => setShowAdd(false)} />}
        {adjustTarget && <AdjustSheet wallet={adjustTarget} currency={currency} onSave={adjustBalance} onClose={() => setAdjustTarget(null)} />}
      </AnimatePresence>
    </div>
  )
}
