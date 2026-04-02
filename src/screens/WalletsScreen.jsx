// WalletsScreen.jsx — Feature 4: Wallet Balance Tracker
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TopHeader from '../components/shared/TopHeader'
import EmptyState from '../components/shared/EmptyState'
import { useWalletStore } from '../store/walletStore'
import { useSettingsStore } from '../store/settingsStore'
import { formatMoney } from '../utils/formatMoney'
import { Plus, Minus, PlusCircle, Trash2, X, Wallet, ChevronRight } from 'lucide-react'

const WALLET_TYPES = [
  { id: 'cash', name: 'Fiat Cash', icon: '💵', color: '#10B981' },
  { id: 'gpay', name: 'Google Pay', icon: '📱', color: '#4285F4' },
  { id: 'paytm', name: 'Paytm', icon: '💙', color: '#00BAF2' },
  { id: 'phonepe', name: 'PhonePe', icon: '💜', color: '#7C6FF7' },
  { id: 'amazon', name: 'Amazon', icon: '🛒', color: '#FF9900' },
  { id: 'custom', name: 'Other', icon: '💳', color: '#64748B' },
]

const S = { fontFamily: "'Nunito', sans-serif" }

function BottomSheet({ show, onClose, title, children }) {
  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-[70]" style={{ background: 'rgba(15,23,42,0.4)' }} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 350 }}
            className="fixed bottom-0 left-0 right-0 z-[71] pb-safe bg-white flex flex-col"
            style={{ borderRadius: '40px 40px 0 0', maxHeight: '90dvh', boxShadow: '0 -20px 40px rgba(0,0,0,0.1)' }}>
            <div className="w-12 h-1.5 bg-[#EEF2FF] rounded-full mx-auto mt-4 mb-4" />
            <div className="flex items-center justify-between px-6 mb-5">
              <h3 className="text-[22px] font-[800] text-[#0F172A] tracking-tight" style={S}>{title}</h3>
              <button onClick={onClose} className="w-11 h-11 rounded-full bg-[#F8F9FF] flex items-center justify-center border border-[#F0F0F8]">
                <X className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-8 scrollbar-hide">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function AddWalletSheet({ onSave, onClose, show }) {
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
    <BottomSheet show={show} onClose={onClose} title="New Wallet">
        <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-4 ml-1" style={S}>Wallet Type</p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {WALLET_TYPES.map(t => (
            <button key={t.id} onClick={() => setType(t)}
              className={`flex flex-col items-center p-4 rounded-[24px] border transition-all ${type.id === t.id ? 'bg-[#F8F7FF] border-[var(--primary)] shadow-sm' : 'bg-white border-[#F0F0F8]'}`}>
              <span className="text-3xl mb-2">{t.icon}</span>
              <span className="text-[11px] font-[800] text-center uppercase tracking-wider text-[#0F172A]" style={S}>{t.name}</span>
            </button>
          ))}
        </div>

        <div className="mb-6">
            <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-3 ml-1" style={S}>Wallet Name</p>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Personal Savings"
              className="w-full py-4.5 px-6 rounded-[22px] bg-[#F8F7FF] border border-[#F0F0F8] outline-none text-[16px] font-[800] text-[#0F172A] placeholder-[#CBD5E1]" style={S} />
        </div>

        <div className="mb-8">
           <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-3 ml-1" style={S}>Starting Balance</p>
           <input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="0.00"
             className="w-full py-5 px-6 rounded-[22px] bg-[#F8F7FF] border border-[#F0F0F8] outline-none text-[28px] font-[800] text-[#0F172A] placeholder-[#CBD5E1]" style={S} />
        </div>

        <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave}
          className="w-full py-5 rounded-[22px] text-white font-[800] text-[16px] shadow-lg shadow-[#7C6FF720]" style={{ background: 'var(--gradient-primary)', ...S }}>
          Create Liquidity Node
        </motion.button>
    </BottomSheet>
  )
}

function AdjustSheet({ wallet, onSave, onClose, show }) {
  const [mode, setMode] = useState('add')
  const [amount, setAmount] = useState('')
  const handleSave = () => {
    const delta = (parseFloat(amount) || 0) * (mode === 'add' ? 1 : -1)
    if (!delta) return
    onSave(wallet.id, delta)
    onClose()
  }
  return (
    <BottomSheet show={show} onClose={onClose} title={wallet?.name || 'Adjust Balance'}>
        <div className="flex gap-3 mb-6 mt-2">
          {['add', 'deduct'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-4.5 rounded-[22px] font-[800] text-[14px] transition-all border uppercase tracking-wider ${
                mode === m 
                  ? (m === 'add' ? 'bg-[#ECFDF5] border-[#10B981] text-[#10B981]' : 'bg-[#FFF5F5] border-[#F43F5E] text-[#F43F5E]') 
                  : 'bg-[#F8F7FF] border-transparent text-[#94A3B8]'
              }`} style={S}>
              {m === 'add' ? 'Deposit' : 'Withdraw'}
            </button>
          ))}
        </div>
        
        <div className="mb-8">
           <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-3 ml-1" style={S}>Transaction Amount</p>
           <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
             className="w-full py-5 px-6 rounded-[22px] bg-[#F8F7FF] border border-[#F0F0F8] outline-none text-[28px] font-[800] text-[#0F172A] placeholder-[#CBD5E1]" style={S} />
        </div>

        <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave}
          className={`w-full py-5 rounded-[22px] font-[800] text-[16px] text-white shadow-lg transition-colors ${mode === 'add' ? 'bg-[#10B981] shadow-[#10B98120]' : 'bg-[#F43F5E] shadow-[#F43F5E20]'}`} style={S}>
          Confirm {mode === 'add' ? 'Deposit' : 'Withdrawal'}
        </motion.button>
    </BottomSheet>
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
    <div className="flex flex-col min-h-dvh mb-tab bg-[#F8F7FF]">
      <TopHeader title="Liquidity" />

      {/* Total balance hero */}
      <div className="mx-6 mb-10 mt-2 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl" style={{ background: 'var(--gradient-primary)' }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white opacity-10 -mr-16 -mt-16" />
        <div className="relative z-10">
          <p className="text-[12px] font-[800] text-white/70 uppercase tracking-[0.2em] mb-3" style={S}>Aggregated Net Worth</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[20px] font-[800] opacity-60" style={S}>{currency}</span>
            <p className="text-[44px] font-[800] leading-none tracking-tight" style={S}>
                {formatMoney(totalBalance(), '').replace(/[^0-9.,]/g, '').trim()}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-6 bg-white/10 w-fit px-4 py-1.5 rounded-full border border-white/10">
             <div className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
             <p className="text-[11px] font-[800] text-white/90 uppercase tracking-widest" style={S}>Live Sync Active</p>
          </div>
        </div>
      </div>

      <div className="px-6 mb-5 flex items-center justify-between">
         <p className="text-[18px] font-[800] text-[#0F172A] tracking-tight" style={S}>Active Nodes</p>
         <div className="px-3 py-1 rounded-full bg-[#EEF2FF] border border-[#E0E7FF]">
            <span className="text-[11px] font-[800] text-[var(--primary)] uppercase tracking-widest" style={S}>{wallets.length} Wallets</span>
         </div>
      </div>

      {wallets.length === 0 ? (
        <EmptyState type="wallets" title="System Empty" message="Initialize your first liquidity node to begin tracking." />
      ) : (
        <div className="px-6 flex flex-col gap-5 pb-32">
          {wallets.map((wallet, i) => (
            <motion.div key={wallet.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white border border-[#F0F0F8] rounded-[28px] p-6 shadow-sm relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] opacity-5" style={{ backgroundColor: wallet.color }} />
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-[20px] flex items-center justify-center text-3xl shadow-sm border border-[#F0F0F8]"
                  style={{ backgroundColor: wallet.color + '15', color: wallet.color }}>{wallet.icon}</div>
                <div className="flex-1">
                  <p className="font-[800] text-[17px] text-[#0F172A] tracking-tight" style={S}>{wallet.name}</p>
                  <p className="text-[24px] font-[800] mt-0.5 tracking-tight" style={{ color: '#0F172A', fontFamily: 'Nunito' }}>
                    {formatMoney(wallet.balance || 0, currency)}
                  </p>
                </div>
                <motion.button whileTap={{ scale: 0.9 }}
                  onClick={() => removeWallet(wallet.id)} 
                  className="w-11 h-11 rounded-[16px] bg-[#FFF5F5] border border-[#FFE0E0] flex items-center justify-center text-[#F43F5E]"
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => setAdjustTarget(wallet)}
                  className="flex-1 py-4 rounded-[18px] bg-[#F8F7FF] border border-[#F0F0F8] text-[var(--primary)] font-[800] text-[13px] flex items-center justify-center gap-2 uppercase tracking-wider" style={S}>
                  <Plus className="w-4 h-4" /> Deposit
                </motion.button>
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => setAdjustTarget(wallet)}
                  className="flex-1 py-4 rounded-[18px] bg-white border border-[#F0F0F8] text-[#94A3B8] font-[800] text-[13px] flex items-center justify-center gap-2 uppercase tracking-wider" style={S}>
                  <Minus className="w-4 h-4" /> Withdraw
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* FAB */}
      <motion.button 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }} 
        onClick={() => setShowAdd(true)}
        className="fixed bottom-28 right-6 w-16 h-16 rounded-[22px] text-white shadow-xl flex items-center justify-center z-40"
        style={{ background: 'var(--gradient-primary)' }}
      >
        <Plus className="w-8 h-8" strokeWidth={3} />
      </motion.button>

      <AddWalletSheet 
        show={showAdd} 
        onSave={w => { addWallet(w); setShowAdd(false) }} 
        onClose={() => setShowAdd(false)} 
      />
      <AdjustSheet 
        show={!!adjustTarget} 
        wallet={adjustTarget} 
        currency={currency} 
        onSave={adjustBalance} 
        onClose={() => setAdjustTarget(null)} 
      />
      
    </div>
  )
}
