// WalletsScreen.jsx — Feature 4: Wallet Balance Tracker
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TopHeader from '../components/shared/TopHeader'
import EmptyState from '../components/shared/EmptyState'
import { useTranslation } from 'react-i18next'
import { useWalletStore } from '../store/walletStore'
import { useSettingsStore } from '../store/settingsStore'
import { formatMoney } from '../utils/formatMoney'
import { Plus, Minus, PlusCircle, Trash2, X, Wallet, ChevronRight, CreditCard, Smartphone } from 'lucide-react'

const WALLET_TYPES = [
  { id: 'cash', name: 'Cash', icon: '💵', color: '#10B981' },
  { id: 'gpay', name: 'Google Pay', icon: '📱', color: '#4285F4' },
  { id: 'paytm', name: 'Paytm', icon: '💙', color: '#00BAF2' },
  { id: 'phonepe', name: 'PhonePe', icon: '💜', color: '#7C6FF7' },
  { id: 'amazon', name: 'Amazon Pay', icon: '🛒', color: '#FF9900' },
  { id: 'custom', name: 'Other', icon: '💳', color: '#64748B' },
]

const HAPTIC_SHAKE = {
  tap: { 
    x: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.35, ease: "easeInOut" }
  }
}

function BottomSheet({ show, onClose, title, children }) {
  const S = { fontFamily: "'Inter', sans-serif" }
  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-[70]" style={{ background: 'rgba(0,0,0,0.4)' }} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 350 }}
            className="fixed bottom-0 left-0 right-0 z-[71] pb-safe bg-white flex flex-col"
            style={{ borderRadius: '40px 40px 0 0', maxHeight: '90dvh', boxShadow: '0 -20px 40px rgba(0,0,0,0.1)' }}>
            <div className="w-12 h-1.5 bg-[#F6F6F6] rounded-full mx-auto mt-4 mb-4" />
            <div className="flex items-center justify-between px-8 mb-5 mt-2">
              <h3 className="text-[22px] font-[800] text-black tracking-tight" style={S}>{title}</h3>
              <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={onClose} 
                className="w-11 h-11 rounded-full bg-[#F6F6F6] flex items-center justify-center border border-[#EEEEEE]">
                <X className="w-5 h-5 text-black" strokeWidth={2.5} />
              </motion.button>
            </div>
            <div className="flex-1 overflow-y-auto px-8 pb-10 scrollbar-hide">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function AddWalletSheet({ onSave, onClose, show }) {
  const { t } = useTranslation()
  const [type, setType] = useState(WALLET_TYPES[0])
  const [name, setName] = useState('')
  const [balance, setBalance] = useState('')
  const S = { fontFamily: "'Inter', sans-serif" }

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
    <BottomSheet show={show} onClose={onClose} title={t('wallets.addWallet')}>
        <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-wider mb-4" style={S}>{t('wallets.chooseType')}</p>
        <div className="grid grid-cols-3 gap-3 mb-8">
          {WALLET_TYPES.map(t => (
            <motion.button key={t.id} variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => setType(t)}
              className={`flex flex-col items-center p-5 rounded-[28px] border transition-all ${type.id === t.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-[#F6F6F6] border-transparent'}`}>
              <span className="text-3xl mb-3 grayscale-0">{t.icon}</span>
              <span className="text-[11px] font-[800] text-center uppercase tracking-tight text-black" style={S}>{t.name}</span>
            </motion.button>
          ))}
        </div>

        <div className="mb-6">
            <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-wider mb-3 ml-1" style={S}>{t('wallets.accountName')}</p>
            <input value={name} onChange={e => setName(e.target.value)} placeholder={t('wallets.accountPlaceholder')}
              className="w-full py-5 px-7 rounded-[24px] bg-[#F6F6F6] border border-[#EEEEEE] outline-none text-[16px] font-[700] text-black placeholder-[#D8D8D8]" style={S} />
        </div>

        <div className="mb-10">
           <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-wider mb-3 ml-1" style={S}>{t('wallets.initialBalance')}</p>
           <input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="0.00"
             className="w-full py-6 px-7 rounded-[24px] bg-[#F6F6F6] border border-[#EEEEEE] outline-none text-[32px] font-[800] text-black placeholder-[#D8D8D8]" style={S} />
        </div>

        <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={handleSave}
          className="w-full py-6 rounded-[24px] bg-black text-white font-[800] text-[16px] shadow-xl shadow-black/10" style={S}>
          {t('wallets.saveWallet')}
        </motion.button>
    </BottomSheet>
  )
}

function AdjustSheet({ wallet, onSave, onClose, show }) {
  const { t } = useTranslation()
  const [mode, setMode] = useState('add')
  const [amount, setAmount] = useState('')
  const S = { fontFamily: "'Inter', sans-serif" }

  const handleSave = () => {
    const delta = (parseFloat(amount) || 0) * (mode === 'add' ? 1 : -1)
    if (!delta) return
    onSave(wallet.id, delta)
    onClose()
  }

  return (
    <BottomSheet show={show} onClose={onClose} title={wallet?.name || t('wallets.quickTx')}>
        <div className="flex gap-4 mb-8 mt-2">
          {['add', 'deduct'].map(m => (
            <motion.button key={m} variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => setMode(m)}
              className={`flex-1 py-5 rounded-[24px] font-[800] text-[14px] transition-all border ${
                mode === m 
                  ? 'bg-black text-white border-black' 
                  : 'bg-[#F6F6F6] border-transparent text-[#AFAFAF]'
              }`} style={S}>
              {m === 'add' ? t('wallets.deposit') : t('wallets.withdraw')}
            </motion.button>
          ))}
        </div>
        
        <div className="mb-10">
           <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-wider mb-3 ml-1" style={S}>{t('wallets.txAmount')}</p>
           <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
             className="w-full py-6 px-7 rounded-[24px] bg-[#F6F6F6] border border-[#EEEEEE] outline-none text-[32px] font-[800] text-black placeholder-[#D8D8D8]" style={S} />
        </div>

        <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={handleSave}
          className={`w-full py-6 rounded-[24px] font-[800] text-[16px] text-white shadow-xl transition-colors ${mode === 'add' ? 'bg-emerald-500 shadow-emerald-500/10' : 'bg-red-500 shadow-red-500/10'}`} style={S}>
          {t('wallets.confirmTx', { type: mode === 'add' ? t('wallets.deposit') : t('wallets.withdraw') })}
        </motion.button>
    </BottomSheet>
  )
}

export default function WalletsScreen() {
  const { t } = useTranslation()
  const { wallets, loadWallets, addWallet, adjustBalance, removeWallet, totalBalance } = useWalletStore()
  const { settings } = useSettingsStore()
  const currency = settings?.currency || 'USD'
  const [showAdd, setShowAdd] = useState(false)
  const [adjustTarget, setAdjustTarget] = useState(null)
  const S = { fontFamily: "'Inter', sans-serif" }

  useEffect(() => { loadWallets() }, [])

  return (
    <div className="flex flex-col min-h-dvh mb-tab bg-white safe-top">
      <TopHeader title={t('wallets.title')} />

      <div className="mx-6 mb-10 mt-6 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-500/10 bg-blue-600">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -mr-16 -mt-16" />
        <div className="relative z-10">
          <p className="text-[13px] font-[700] text-blue-100 uppercase tracking-widest mb-4" style={S}>{t('wallets.total')}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[22px] font-[800] text-blue-200" style={S}>{currency}</span>
            <p className="text-[48px] font-[900] leading-none tracking-tighter" style={S}>
                {formatMoney(totalBalance(), '').replace(/[^0-9.,]/g, '').trim()}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-8 bg-black/10 w-fit px-5 py-2 rounded-full border border-white/10">
             <div className="h-2 w-2 rounded-full bg-emerald-400" />
             <p className="text-[12px] font-[800] text-white/90 uppercase tracking-widest" style={S}>{t('wallets.luminous')}</p>
          </div>
        </div>
      </div>

      <div className="px-7 mb-6 flex items-center justify-between">
         <h2 className="text-[20px] font-[800] text-black tracking-tight" style={S}>{t('wallets.accounts')}</h2>
         <div className="px-4 py-1.5 rounded-full bg-[#F6F6F6] border border-[#EEEEEE]">
            <span className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-widest" style={S}>{wallets.length} {t('wallets.active')}</span>
         </div>
      </div>

      {wallets.length === 0 ? (
        <EmptyState type="wallets" title={t('wallets.noWallets')} message={t('wallets.noWalletsDesc')} />
      ) : (
        <div className="px-6 flex flex-col gap-6 pb-32">
          {wallets.map((wallet, i) => (
            <motion.div key={wallet.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              className="bg-white border border-[#F6F6F6] rounded-[32px] p-7 shadow-sm relative group overflow-hidden active:shadow-md transition-shadow">
              
              <div className="flex items-center gap-5 mb-8">
                <div className="w-16 h-16 rounded-[24px] flex items-center justify-center text-3xl border border-[#F6F6F6]"
                  style={{ backgroundColor: wallet.color + '10', color: wallet.color }}>{wallet.icon}</div>
                <div className="flex-1">
                  <p className="font-[800] text-[18px] text-black tracking-tight" style={S}>{wallet.name}</p>
                  <p className="text-[26px] font-[800] mt-0.5 tracking-tight text-blue-600" style={S}>
                    {formatMoney(wallet.balance || 0, currency)}
                  </p>
                </div>
                <motion.button variants={HAPTIC_SHAKE} whileTap="tap"
                  onClick={() => removeWallet(wallet.id)} 
                  className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center text-red-500 border border-red-100"
                >
                  <Trash2 className="w-5 h-5" strokeWidth={2.5} />
                </motion.button>
              </div>
              <div className="flex gap-4">
                <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => setAdjustTarget(wallet)}
                  className="flex-1 py-4 rounded-[20px] bg-[#F6F6F6] border border-[#EEEEEE] text-black font-[800] text-[13px] flex items-center justify-center gap-2 uppercase tracking-wide" style={S}>
                  <Plus className="w-4 h-4" /> {t('wallets.deposit')}
                </motion.button>
                <motion.button variants={HAPTIC_SHAKE} whileTap="tap" onClick={() => setAdjustTarget(wallet)}
                  className="flex-1 py-4 rounded-[20px] bg-white border border-[#EEEEEE] text-[#AFAFAF] font-[800] text-[13px] flex items-center justify-center gap-2 uppercase tracking-wide" style={S}>
                  <Minus className="w-4 h-4" /> {t('wallets.withdraw')}
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
        variants={HAPTIC_SHAKE}
        whileTap="tap"
        onClick={() => setShowAdd(true)}
        className="fixed bottom-28 right-7 w-16 h-16 rounded-full bg-black text-white shadow-2xl flex items-center justify-center z-40 border-4 border-white"
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
