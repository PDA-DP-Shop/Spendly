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
  { id: 'cash', name: 'Physical Fiat', icon: '💵', color: '#00FF87' },
  { id: 'gpay', name: 'Google Pay', icon: '📱', color: '#4285F4' },
  { id: 'paytm', name: 'Paytm Vault', icon: '💙', color: '#00BAF2' },
  { id: 'phonepe', name: 'PhonePe', icon: '💜', color: '#5F259F' },
  { id: 'amazon', name: 'Amazon Cloud', icon: '🛒', color: '#FF9900' },
  { id: 'custom', name: 'Secure Custom', icon: '💳', color: '#00D4FF' },
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
    <motion.div className="fixed inset-0 z-[70] flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-[#050B18]/60 backdrop-blur-md" onClick={onClose} />
      <motion.div className="relative w-full max-w-lg bg-[#070D1F]/95 border-t border-white/10 rounded-t-[32px] p-8 pb-12"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
        <div className="flex items-center justify-between mb-8">
          <p className="text-[20px] font-display font-bold text-[#F0F4FF] tracking-tight">Deploy New Wallet</p>
          <button onClick={onClose} className="w-9 h-9 rounded-full glass border-none flex items-center justify-center text-[#7B8DB0]"><X className="w-5 h-5" /></button>
        </div>
        
        <p className="text-[11px] font-display font-bold text-[#3D4F70] uppercase tracking-[0.2em] mb-4">Architecture Selection</p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {WALLET_TYPES.map(t => (
            <button key={t.id} onClick={() => setType(t)}
              className={`flex flex-col items-center p-4 rounded-2xl border transition-all duration-300 ${type.id === t.id ? 'glass-accent border-cyan-glow/30 shadow-glowSmall' : 'glass border-transparent text-[#7B8DB0]'}`}>
              <span className="text-3xl mb-2 filter drop-shadow-md">{t.icon}</span>
              <span className="text-[11px] font-body font-bold text-center leading-tight">{t.name}</span>
            </button>
          ))}
        </div>

        {type.id === 'custom' && (
          <div className="mb-6">
            <p className="text-[11px] font-display font-bold text-[#3D4F70] uppercase tracking-[0.2em] mb-3">Identification</p>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter Alias..."
              className="w-full py-4 px-5 rounded-2xl glass-elevated border-white/5 outline-none text-[15px] text-[#F0F4FF] placeholder-[#3D4F70] focus:border-cyan-glow/30" />
          </div>
        )}

        <div className="mb-8">
           <p className="text-[11px] font-display font-bold text-[#3D4F70] uppercase tracking-[0.2em] mb-3">Initial Liquidity</p>
           <div className="relative">
              <input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="0.00"
                className="w-full py-4 px-5 rounded-2xl glass-elevated border-white/5 outline-none text-[24px] font-display font-bold text-[#F0F4FF] placeholder-[#3D4F70] focus:border-cyan-glow/30" />
           </div>
        </div>

        <motion.button 
          whileTap={{ scale: 0.96 }} 
          onClick={handleSave}
          className="w-full py-5 rounded-2xl bg-cyan-glow text-white font-display font-bold text-[16px] shadow-glow"
        >
          Initialize Wallet
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
    <motion.div className="fixed inset-0 z-[70] flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-[#050B18]/60 backdrop-blur-md" onClick={onClose} />
      <motion.div className="relative w-full max-w-lg bg-[#070D1F]/95 border-t border-white/10 rounded-t-[32px] p-8 pb-12"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
             <span className="text-2xl">{wallet.icon}</span>
             <p className="text-[20px] font-display font-bold text-[#F0F4FF] tracking-tight">{wallet.name}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full glass border-none flex items-center justify-center text-[#7B8DB0]"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="flex gap-3 mb-6">
          {['add', 'deduct'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-4 rounded-xl font-display font-bold text-[14px] transition-all border ${
                mode === m 
                  ? (m === 'add' ? 'bg-cyan-dim border-cyan-glow/30 text-cyan-glow shadow-glowSmall' : 'bg-expense/10 border-expense/30 text-expense') 
                  : 'glass border-transparent text-[#7B8DB0]'
              }`}>
              {m === 'add' ? '+ INJECT' : '− BURN'}
            </button>
          ))}
        </div>
        
        <div className="mb-8">
           <p className="text-[11px] font-display font-bold text-[#3D4F70] uppercase tracking-[0.2em] mb-3">Transaction Amount</p>
           <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
             className="w-full py-5 px-5 rounded-2xl glass-elevated border-white/5 outline-none text-[28px] font-display font-bold text-[#F0F4FF] placeholder-[#3D4F70] focus:border-cyan-glow/30" />
        </div>

        <motion.button 
          whileTap={{ scale: 0.96 }} 
          onClick={handleSave}
          className={`w-full py-5 rounded-2xl font-display font-bold text-[16px] text-white shadow-glow transition-colors ${
            mode === 'add' ? 'bg-cyan-glow' : 'bg-expense shadow-[0_0_20px_rgba(255,77,109,0.3)]'
          }`}
        >
          {mode === 'add' ? 'EXECUTE INJECTION' : 'CONFIRM BURN'}
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
    <div className="flex flex-col min-h-dvh mb-tab">
      <TopHeader title="Liquidity" />

      {/* Total balance hero */}
      <div className="mx-6 mb-8 rounded-[32px] p-8 text-white glass-accent shadow-glowLg relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-[11px] font-display font-bold text-cyan-glow/60 uppercase tracking-[0.2em] mb-3">Aggregated Portfolio Balance</p>
          <p className="text-[42px] font-display font-bold leading-tight tracking-tighter">
            <span className="text-[20px] opacity-50 mr-2 font-body font-medium">{currency}</span>
            {formatMoney(totalBalance(), '').replace(currency, '').trim()}
          </p>
          <div className="flex items-center gap-2 mt-4">
             <div className="h-1.5 w-1.5 rounded-full bg-cyan-glow animate-pulse" />
             <p className="text-[11px] font-body font-bold text-cyan-glow">Live Terminal Active</p>
          </div>
        </div>
      </div>

      <div className="px-6 mb-4 flex items-center justify-between">
         <p className="text-[16px] font-display font-bold text-[#F0F4FF] tracking-tight">Active Nodes</p>
         <span className="text-[11px] font-body font-bold text-[#3D4F70] uppercase tracking-widest">{wallets.length} Wallets</span>
      </div>

      {wallets.length === 0 ? (
        <EmptyState type="wallets" title="System Empty" message="Initialize your first liquidity node to begin tracking." />
      ) : (
        <div className="px-6 flex flex-col gap-4 pb-32">
          {wallets.map((wallet, i) => (
            <motion.div key={wallet.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              className="glass-elevated border-white/5 rounded-[28px] p-6 shadow-sm relative group overflow-hidden">
              {/* Subtle accent glow */}
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] opacity-10" style={{ backgroundColor: wallet.color }} />
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl glass border-none shadow-glowSmall"
                  style={{ backgroundColor: wallet.color + '15' }}>{wallet.icon}</div>
                <div className="flex-1">
                  <p className="font-display font-bold text-[16px] text-[#F0F4FF] tracking-tight">{wallet.name}</p>
                  <p className="text-[24px] font-display font-bold mt-1" style={{ color: wallet.color }}>
                    {formatMoney(wallet.balance || 0, currency)}
                  </p>
                </div>
                <button 
                  onClick={() => removeWallet(wallet.id)} 
                  className="w-10 h-10 rounded-xl glass border-none flex items-center justify-center text-[#3D4F70] hover:text-expense transition-colors"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setAdjustTarget(wallet)}
                  className="flex-1 py-3.5 rounded-xl glass border-white/5 text-cyan-glow font-display font-bold text-[12px] flex items-center justify-center gap-2 hover:bg-white/5 transition-all">
                  <Plus className="w-4 h-4" /> INJECT
                </button>
                <button onClick={() => setAdjustTarget(wallet)}
                  className="flex-1 py-3.5 rounded-xl glass border-white/5 text-[#7B8DB0] font-display font-bold text-[12px] flex items-center justify-center gap-2 hover:bg-white/5 transition-all">
                  <Minus className="w-4 h-4" /> BURN
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* FAB */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }} 
        onClick={() => setShowAdd(true)}
        className="fixed bottom-28 right-6 w-16 h-16 rounded-[22px] bg-cyan-glow text-white shadow-glow flex items-center justify-center z-40 group"
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
      </motion.button>

      <AnimatePresence>
        {showAdd && <AddWalletSheet onSave={w => { addWallet(w); setShowAdd(false) }} onClose={() => setShowAdd(false)} />}
        {adjustTarget && <AdjustSheet wallet={adjustTarget} currency={currency} onSave={adjustBalance} onClose={() => setAdjustTarget(null)} />}
      </AnimatePresence>
    </div>
  )
}
