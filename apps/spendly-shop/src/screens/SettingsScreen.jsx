import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Store, User, Bell, Shield, 
  MapPin, Globe, Palette, Database, Info,
  ChevronRight, Save, Trash2, LogOut,
  CreditCard, FileText, Lock,
  Users, Moon, Sun, Plus, Download, Upload,
  Smartphone, ShieldCheck, X, Check,
  Receipt, Package, BarChart2, Phone, Percent,
  MessageSquare, Landmark, Wallet, History
} from 'lucide-react';

import { useShopStore } from '../store/shopStore';
import { useSettingsStore } from '../store/settingsStore';
import { useBillStore } from '../store/billStore';
import { useCustomerStore } from '../store/customerStore';
import { formatMoney } from '../utils/formatMoney';
import CURRENCY_NOTES from '../constants/currencyNotes';
import { exportShopData, importShopData } from '../services/exportData';
import { db } from '../services/database';
import FactoryResetWorkflow from '../components/shared/FactoryResetWorkflow';
import { recoveryVaultService } from '../services/recoveryVault';
import RecoveryBanner from '../components/shared/RecoveryBanner';
import { RefreshCw } from 'lucide-react';

// ─── Reusable Bottom Sheet ───────────────────────────────────────────────────
const BottomSheet = ({ show, onClose, title, children }) => {
<<<<<<< HEAD
  return createPortal(
=======
  const content = (
>>>>>>> 41f113d (upgrade scanner)
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
<<<<<<< HEAD
            className="fixed inset-0 z-[2001] bg-black/40 backdrop-blur-[2px]"
=======
            className="fixed inset-0 z-[100] bg-black/40"
>>>>>>> 41f113d (upgrade scanner)
          />
          <motion.div
            initial={{ y: '100%', x: '-50%' }} animate={{ y: 0, x: '-50%' }} exit={{ y: '100%', x: '-50%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 350 }}
<<<<<<< HEAD
            className="fixed bottom-0 left-1/2 w-full max-w-[450px] z-[2002] bg-white overflow-hidden pb-10"
            style={{ borderRadius: '40px 40px 0 0', maxHeight: '92dvh', display: 'flex', flexDirection: 'column' }}
          >
            <div className="w-12 h-1.5 bg-[#F1F5F9] rounded-full mx-auto mt-4 mb-4 flex-shrink-0" />
            <div className="flex items-center justify-between px-8 mb-4">
              <h3 className="text-[22px] font-[800] text-black tracking-tight">{title}</h3>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#F8FAFC] flex items-center justify-center border border-[#F1F5F9] active:scale-95">
                <X className="w-5 h-5 text-black" strokeWidth={2.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-8 pb-10 scrollbar-hide">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.getElementById('modal-root') || document.body
  );
=======
            className="fixed bottom-0 left-1/2 w-full max-w-[450px] z-[101] bg-white"
            style={{ borderRadius: '40px 40px 0 0', maxHeight: '85dvh', display: 'flex', flexDirection: 'column' }}
          >
            <div className="w-12 h-1.5 bg-[#F1F5F9] rounded-full mx-auto mt-4 mb-4" />
            <div className="flex items-center justify-between px-8 mb-5">
              <h3 className="text-[22px] font-[800] text-black tracking-tight">{title}</h3>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#F8FAFC] flex items-center justify-center border border-[#F1F5F9]">
                <X className="w-5 h-5 text-black" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-8 pb-12 scrollbar-hide">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
  return createPortal(content, document.body);
>>>>>>> 41f113d (upgrade scanner)
};

// ─── Settings Row ────────────────────────────────────────────────────────────
const SettingsRow = ({ icon: Icon, title, subtitle, value, onClick, danger, toggle, toggled, onToggle, last }) => (
  <button
    onClick={toggle ? onToggle : onClick}
    className={`w-full flex items-center gap-4 px-6 py-5 text-left transition-colors pointer-events-auto ${!last ? 'border-b border-[#F1F5F9]' : ''} ${danger ? 'active:bg-red-50' : 'active:bg-[#F8FAFC]'}`}
  >
    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${danger ? 'bg-red-50' : 'bg-[#F8FAFC]'} border border-[#F1F5F9] pointer-events-none`}>
      <Icon className={`w-4.5 h-4.5 ${danger ? 'text-red-500' : 'text-black'}`} strokeWidth={2.5} />
    </div>
    <div className="flex-1 min-w-0 pointer-events-none">
      <span className={`text-[15px] font-[700] block tracking-tight ${danger ? 'text-red-500' : 'text-black'}`}>{title}</span>
      {subtitle && <span className="text-[11px] font-[500] text-[#94A3B8] mt-0.5 block">{subtitle}</span>}
    </div>
    {value && !toggle && <span className="text-[13px] font-[600] text-[#94A3B8] mr-2 truncate max-w-[100px] pointer-events-none">{value}</span>}
    {toggle ? (
      <div
        className="w-12 h-7 rounded-full transition-all relative border border-[#F1F5F9] flex-shrink-0 pointer-events-none"
        style={{ background: toggled ? '#000' : '#E2E8F0' }}
      >
        <motion.div
          className="w-5 h-5 rounded-full bg-white shadow absolute top-[3px]"
          animate={{ left: toggled ? '23px' : '3px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      </div>
    ) : (
      !danger && <ChevronRight className="w-4 h-4 text-[#CBD5E1] flex-shrink-0 pointer-events-none" strokeWidth={3} />
    )}
  </button>
);

// ─── Section Card ─────────────────────────────────────────────────────────────
const SectionCard = ({ title, children }) => (
  <div className="mx-6 mb-8">
    {title && <p className="text-[12px] font-[700] uppercase tracking-wider text-[#94A3B8] mb-3 ml-2">{title}</p>}
    <div className="overflow-hidden bg-white rounded-[24px] border border-[#F1F5F9] shadow-sm">
      {children}
    </div>
  </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, onClose }) => (
  <AnimatePresence>
    {msg && (
      <motion.div
        initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-4 rounded-full text-[13px] font-[700] shadow-2xl z-[80] whitespace-nowrap"
      >
        {msg}
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Shop Categories (Worldwide) ──────────────────────────────────────────────
const SHOP_CATEGORIES = [
  { id: 'food', name: 'Food & Dining', emoji: '🍔', group: '0' },
  { id: 'coffee', name: 'Cafe & Coffee', emoji: '☕', group: '0' },
  { id: 'grocery', name: 'Groceries', emoji: '🛒', group: '0' },
  { id: 'travel', name: 'Travel & Taxi', emoji: '🚗', group: '1' },
  { id: 'holiday', name: 'Holiday & Tours', emoji: '✈️', group: '1' },
  { id: 'shopping', name: 'General Shop', emoji: '🛍️', group: '2' },
  { id: 'clothes', name: 'Fashion & Wear', emoji: '👕', group: '2' },
  { id: 'gifts', name: 'Gift Shop', emoji: '🎁', group: '2' },
  { id: 'pets', name: 'Pet Care', emoji: '🐾', group: '2' },
  { id: 'health', name: 'Pharmacy & Medical', emoji: '💊', group: '4' },
  { id: 'bills', name: 'Utility Bills', emoji: '💡', group: '3' },
  { id: 'rent', name: 'Rent & Accommodation', emoji: '🏠', group: '3' },
  { id: 'fun', name: 'Entertainment', emoji: '🎮', group: '5' },
  { id: 'study', name: 'Education', emoji: '📚', group: '6' },
  { id: 'tech', name: 'Electronics & Gadgets', emoji: '💻', group: '7' },
  { id: 'gym', name: 'Gym & Fitness', emoji: '💪', group: '8' },
];

const BILL_PREFIXES = ['INV', 'BILL', 'REC', 'TXN', 'ORD'];
const GST_RATES = [0, 5, 12, 18, 28];
const CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', locale: 'en-IN' },
  { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US' },
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE' },
  { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', locale: 'ar-AE' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', locale: 'ja-JP' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$', locale: 'en-CA' },
  { code: 'AUD', name: 'Australian Dollar', symbol: '$', locale: 'en-AU' },
];

// ─── Main Component ────────────────────────────────────────────────────────────
const SettingsScreen = () => {
  const navigate = useNavigate();
  const { shop, updateShop, saveShop, loadShop } = useShopStore();
  const { settings, updateSetting } = useSettingsStore();
  const { bills } = useBillStore();
  const { customers } = useCustomerStore();

  const [form, setForm] = useState({
    name: '', ownerName: '', phone: '', upiId: '', 
    address: '', gstNumber: '', billPrefix: 'INV',
    billFooterMessage: 'Thank you for your business!'
  });
  const [activeVault, setActiveVault] = useState(null);

  // Sync form with store data when it loads
  React.useEffect(() => {
    loadShop();
    recoveryVaultService.getActiveVault().then(v => setActiveVault(v));
  }, []);

  React.useEffect(() => {
    if (shop) {
      setForm({
        name: shop.name || '',
        ownerName: shop.ownerName || '',
        phone: shop.phone || '',
        upiId: shop.upiId || '',
        address: shop.address || '',
        gstNumber: shop.gstNumber || '',
        billPrefix: shop.billPrefix || 'INV',
        billFooterMessage: shop.billFooterMessage || 'Thank you for your business!',
      });
    }
  }, [shop]);

  // Bottom sheet visibility
  const [showInvoice, setShowInvoice] = useState(false);
  const [showTax, setShowTax] = useState(false);
  const [showLock, setShowLock] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
<<<<<<< HEAD
  const [showCurrency, setShowCurrency] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
=======
  const [showCategory, setShowCategory] = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);
>>>>>>> 41f113d (upgrade scanner)
  const [catSearch, setCatSearch] = useState('');
  const filteredCats = SHOP_CATEGORIES.filter(c => 
    c.name.toLowerCase().includes(catSearch.toLowerCase()) || 
    c.id.toLowerCase().includes(catSearch.toLowerCase())
  );

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  // Import state
  const [importFile, setImportFile] = useState(null);
  const [importMode, setImportMode] = useState('merge');
  const fileInputRef = useRef();

  // Stats
  const totalRevenue = bills.reduce((s, b) => s + (b.total || 0), 0);

  const handleSaveProfile = async () => {
    if (shop) {
        await updateShop(form);
    } else {
        await saveShop(form);
    }
    showToast('Profile saved ✓');
  };

  const handleExport = async () => {
    const ok = await exportShopData();
    showToast(ok ? 'Backup downloaded ✓' : 'Export failed ✗');
  };

  const handleImport = async () => {
    if (!importFile) return showToast('Select a file first');
    try {
      await importShopData(importFile, importMode);
      showToast('Data imported ✓');
      setShowImport(false);
      setImportFile(null);
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      showToast('Import failed — invalid file');
    }
  };

  const handleFactoryReset = async () => {
    await db.bills.clear();
    await db.customers.clear();
    await db.savedItems.clear();
    await db.creditBook.clear();
    await db.shop.clear();
    localStorage.clear();
    window.location.href = '/';
  };

  const handleSaveInvoice = async () => {
    await updateShop({ 
      billPrefix: form.billPrefix, 
      billFooterMessage: form.billFooterMessage 
    });
    setShowInvoice(false);
    showToast('Invoice settings saved ✓');
  };

  const handleSaveTax = async () => {
    await updateShop({ 
      gstNumber: form.gstNumber,
      defaultGstRate: form.defaultGstRate || shop?.defaultGstRate || 18
    });
    setShowTax(false);
    showToast('Tax settings saved ✓');
  };

  return (
    <div className="min-h-dvh bg-white pb-tab relative overflow-x-hidden font-sans">
      <RecoveryBanner />
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl p-6 pb-4 flex items-center justify-between sticky top-0 z-40 border-b border-[#F1F5F9] shadow-sm">
        <button onClick={() => navigate('/home')} className="flex items-center gap-3 text-black font-[800] tracking-tight active:scale-95 transition-transform group">
          <div className="p-2 bg-[#F8FAFC] rounded-xl group-hover:bg-black group-hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
        </button>
        <h1 className="text-[17px] font-[800] text-black tracking-tight">Settings</h1>
        <div className="w-10" />
      </header>

      <div className="pt-8">
        {/* Profile Card */}
        <div className="mx-6 mb-10 p-10 text-center bg-white border border-[#F1F5F9] rounded-[32px] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-black/5 rounded-t-[32px]" />
          <div className="w-24 h-24 rounded-full bg-[#F8FAFC] border-2 border-[#F1F5F9] flex items-center justify-center text-[40px] font-[800] text-black mx-auto mb-6 shadow-inner">
            {shop?.logoEmoji || '🏪'}
          </div>
          <p className="text-[26px] font-[800] text-black tracking-tight">{shop?.name || 'My Shop'}</p>
          <p className="text-[12px] font-[700] text-[#94A3B8] uppercase tracking-widest mt-2">
            {bills.length} bills · {customers.length} clients · {formatMoney(totalRevenue, settings.currency)}
          </p>
        </div>

        {/* Profile Section */}
        <div className="mx-6 mb-8">
          <p className="text-[12px] font-[700] uppercase tracking-wider text-[#94A3B8] mb-3 ml-2">Shop Profile</p>
          <div className="overflow-hidden bg-[#F8FAFC] rounded-[28px] border border-[#F1F5F9] p-6 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest ml-1 block mb-1.5">Shop Name</label>
                <input
                  className="w-full bg-white border border-[#F1F5F9] p-4 rounded-[16px] outline-none font-[700] text-black text-[15px] placeholder:text-[#CBD5E1]"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Shop name"
                />
              </div>
              <div>
                <label className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest ml-1 block mb-1.5">Owner Name</label>
                <input
                  className="w-full bg-white border border-[#F1F5F9] p-4 rounded-[16px] outline-none font-[700] text-black text-[15px] placeholder:text-[#CBD5E1]"
                  value={form.ownerName}
                  onChange={e => setForm({ ...form, ownerName: e.target.value })}
                  placeholder="Owner name"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest ml-1 block mb-1.5">Phone</label>
                  <input
                    className="w-full bg-white border border-[#F1F5F9] p-4 rounded-[16px] outline-none font-[700] text-black text-[14px] placeholder:text-[#CBD5E1]"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="Phone"
                    type="tel"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest ml-1 block mb-1.5">UPI ID</label>
                  <input
                    className="w-full bg-white border border-[#F1F5F9] p-4 rounded-[16px] outline-none font-[700] text-black text-[14px] placeholder:text-[#CBD5E1]"
                    value={form.upiId}
                    onChange={e => setForm({ ...form, upiId: e.target.value })}
                    placeholder="UPI ID"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest ml-1 block mb-1.5">Shop Category</label>
                <button
                  onClick={() => setShowCategory(true)}
                  className="w-full bg-white border border-[#F1F5F9] p-4 rounded-[16px] outline-none font-[700] text-black text-[15px] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{SHOP_CATEGORIES.find(c => c.id === (form.category || shop?.category))?.emoji || '🏪'}</span>
                    <span>{SHOP_CATEGORIES.find(c => c.id === (form.category || shop?.category))?.name || 'Select Category'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#CBD5E1]" />
                </button>
              </div>
              <div>
                <label className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest ml-1 block mb-1.5">Address</label>
                <textarea
                  className="w-full bg-white border border-[#F1F5F9] p-4 rounded-[16px] outline-none font-[700] text-black text-[14px] placeholder:text-[#CBD5E1] resize-none"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  placeholder="Shop address"
                  rows={2}
                />
              </div>
            </div>
            <button
              onClick={handleSaveProfile}
              className="w-full h-14 bg-black text-white rounded-full font-[800] text-[15px] flex items-center justify-center gap-2 shadow-xl active:bg-slate-900 transition-all"
            >
              <Save className="w-5 h-5 text-white/40" /> Save Profile
            </button>
          </div>
        </div>

        {/* Business Section */}
        <SectionCard title="Business">
          <SettingsRow icon={Globe} title="Currency" subtitle="Change shop currency" value={`${settings.currency} (${CURRENCY_NOTES[settings.currency]?.symbol || '$'})`} onClick={() => setShowCurrency(true)} />
          <SettingsRow icon={FileText} title="Invoice Setup" subtitle="Bill prefix, numbering & footer" onClick={() => setShowInvoice(true)} />
          <SettingsRow icon={Percent} title="Tax & GST" subtitle="Default GST rate and GSTIN" onClick={() => setShowTax(true)} />
          <SettingsRow icon={Globe} title="Currency" subtitle="Shop transaction currency" value={CURRENCIES.find(c => c.code === settings.currency)?.name || settings.currency} onClick={() => setShowCurrency(true)} />
          <SettingsRow icon={Package} title="Inventory" subtitle="Manage saved products" onClick={() => navigate('/items')} />
          <SettingsRow icon={Users} title="Clients" subtitle="Customer book" onClick={() => navigate('/customers')} last />
        </SectionCard>

        <SectionCard title="Wallet & Money">
           <SettingsRow icon={Wallet} title="Cash Wallet" subtitle="Store cash, notes & coins" onClick={() => navigate('/cash-wallet')} />
           <SettingsRow icon={Landmark} title="Bank Accounts" subtitle="Manage business accounts" onClick={() => navigate('/bank-accounts')} />
           <SettingsRow icon={History} title="In/Out Transactions" subtitle="Audit wallet movements" onClick={() => navigate('/wallet-history')} last />
        </SectionCard>

        {/* Privacy & Security */}
        <SectionCard title="Privacy & Security">
          <SettingsRow
            icon={Bell}
            title="Daily Reminders"
            subtitle="Sales reports and alerts"
            toggle
            toggled={settings.notificationsEnabled}
            onToggle={() => updateSetting('notificationsEnabled', !settings.notificationsEnabled)}
          />
          <SettingsRow icon={Lock} title="App Lock" subtitle="Set PIN for app access" onClick={() => setShowLock(true)} />
          <SettingsRow
            icon={Smartphone}
            title="Staff Mode"
            subtitle="Separate PIN for staff"
            toggle
            toggled={settings.staffPinEnabled}
            onToggle={() => updateSetting('staffPinEnabled', !settings.staffPinEnabled)}
            last
          />
        </SectionCard>

        {/* Data Management */}
        <SectionCard title="Data Management">
          <SettingsRow icon={Download} title="Export Backup" subtitle="Download all shop data as JSON" onClick={handleExport} />
          <SettingsRow icon={Upload} title="Import Backup" subtitle="Restore from a backup file" onClick={() => setShowImport(true)} />
          <SettingsRow icon={BarChart2} title="Sales Reports" subtitle="View analytics dashboard" onClick={() => navigate('/reports')} last />
        </SectionCard>

        {/* About */}
        <SectionCard title="About">
          <SettingsRow icon={Info} title="About Spendly Shop" subtitle="Version info & licenses" onClick={() => setShowAbout(true)} />
          <SettingsRow icon={ShieldCheck} title="Privacy Policy" subtitle="How your data is protected" onClick={() => {}} last />
        </SectionCard>

        {/* Privacy Card */}
        <div className="mx-6 mb-8 p-8 rounded-[28px] bg-black text-white shadow-xl flex flex-col items-center text-center">
          <ShieldCheck className="w-12 h-12 mb-4 opacity-80" strokeWidth={2} />
          <h3 className="text-[20px] font-[800] mb-2">100% Private</h3>
          <p className="text-[13px] font-[500] text-white/50 leading-relaxed">All your data stays on your device.<br/>No cloud. No tracking. Ever.</p>
        </div>

        {/* Danger Zone */}
        <div className="mx-6 mb-12">
          <p className="text-[12px] font-[700] uppercase tracking-wider text-[#94A3B8] mb-3 ml-2">Danger Zone</p>
          <div className="space-y-4">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/delete-confirm')}
              className="w-full py-5 rounded-[28px] border-2 border-red-500/10 bg-white text-red-500 font-[802] text-[16px] flex items-center justify-center gap-3 active:bg-red-50 transition-all duration-300 shadow-sm"
            >
              <Trash2 className="w-5 h-5 text-red-400" /> 
              <span className="tracking-tight">Delete All Shop Data</span>
            </motion.button>
            <p className="text-[10px] font-[700] text-[#94A3B8] text-center px-10 leading-relaxed uppercase tracking-[0.2em]">
              Safe: Shop Profile & Settings
            </p>
          </div>
        </div>

        <div className="text-center pb-12">
          <p className="text-[11px] font-[700] text-[#CBD5E1] uppercase tracking-widest">Spendly Shop v1.0.0</p>
        </div>
      </div>

      {/* ── Invoice Setup Sheet ─────────────────────────────── */}
      <BottomSheet show={showInvoice} onClose={() => setShowInvoice(false)} title="Invoice Setup">
        <div className="space-y-6">
          <div>
            <label className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-widest ml-1 block mb-2">Bill Prefix</label>
            <div className="flex gap-3 flex-wrap">
              {BILL_PREFIXES.map(p => (
                <button
                  key={p}
                  onClick={() => setForm({ ...form, billPrefix: p })}
                  className={`px-5 py-3 rounded-2xl text-[13px] font-[800] border transition-all ${form.billPrefix === p ? 'bg-black text-white border-black' : 'bg-[#F8FAFC] text-[#64748B] border-transparent'}`}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#94A3B8] mt-2 ml-1">Bills will be named: <span className="font-[800] text-black">{form.billPrefix}-001</span></p>
          </div>
          <div>
            <label className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-widest ml-1 block mb-2">Footer Message</label>
            <textarea
              className="w-full bg-[#F8FAFC] border border-[#F1F5F9] p-5 rounded-[20px] outline-none font-[700] text-black text-[15px] placeholder:text-[#CBD5E1] resize-none"
              value={form.billFooterMessage}
              onChange={e => setForm({ ...form, billFooterMessage: e.target.value })}
              placeholder="Thank you for your business!"
              rows={3}
            />
          </div>
          <button onClick={handleSaveInvoice} className="w-full h-16 bg-black text-white rounded-full font-[800] text-[15px] flex items-center justify-center gap-2 shadow-xl active:bg-slate-900 transition-all">
            <Save className="w-5 h-5 text-white/40" /> Save Invoice Settings
          </button>
        </div>
      </BottomSheet>

      {/* ── Tax & GST Sheet ────────────────────────────────── */}
      <BottomSheet show={showTax} onClose={() => setShowTax(false)} title="Tax & GST">
        <div className="space-y-6">
          <div>
            <label className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-widest ml-1 block mb-2">GSTIN Number</label>
            <input
              className="w-full bg-[#F8FAFC] border border-[#F1F5F9] p-5 rounded-[20px] outline-none font-[700] text-black text-[15px] placeholder:text-[#CBD5E1] uppercase"
              value={form.gstNumber}
              onChange={e => setForm({ ...form, gstNumber: e.target.value.toUpperCase() })}
              placeholder="22AAAAA0000A1Z5"
            />
          </div>
          <div>
            <label className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-widest ml-1 block mb-2">Default GST Rate</label>
            <div className="flex gap-3 flex-wrap">
              {GST_RATES.map(rate => (
                <button
                  key={rate}
                  onClick={() => setForm({ ...form, defaultGstRate: rate })}
                  className={`px-5 py-3 rounded-2xl text-[13px] font-[800] border transition-all ${(form.defaultGstRate ?? shop?.defaultGstRate ?? 18) === rate ? 'bg-black text-white border-black' : 'bg-[#F8FAFC] text-[#64748B] border-transparent'}`}
                >
                  {rate}%
                </button>
              ))}
            </div>
          </div>
          <div className="bg-[#F8FAFC] rounded-[20px] p-5 space-y-2">
            <p className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-widest">GST Breakdown</p>
            <div className="flex justify-between text-[13px] font-[700]">
              <span className="text-[#64748B]">CGST ({(form.defaultGstRate ?? 18) / 2}%)</span>
              <span className="text-black">Applies on subtotal</span>
            </div>
            <div className="flex justify-between text-[13px] font-[700]">
              <span className="text-[#64748B]">SGST ({(form.defaultGstRate ?? 18) / 2}%)</span>
              <span className="text-black">Applies on subtotal</span>
            </div>
          </div>
          <button onClick={handleSaveTax} className="w-full h-16 bg-black text-white rounded-full font-[800] text-[15px] flex items-center justify-center gap-2 shadow-xl active:bg-slate-900 transition-all">
            <Save className="w-5 h-5 text-white/40" /> Save Tax Settings
          </button>
        </div>
      </BottomSheet>

      {/* ── App Lock Sheet ─────────────────────────────────── */}
      <BottomSheet show={showLock} onClose={() => setShowLock(false)} title="App Lock">
        <div className="space-y-4">
          {[
            { label: 'No Lock', emoji: '🔓', value: 'none' },
            { label: '4-Digit PIN', emoji: '🔢', value: 'pin4' },
            { label: '6-Digit PIN', emoji: '🔐', value: 'pin6' },
            { label: 'Biometric', emoji: '👆', value: 'biometric' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => { updateSetting('lockType', opt.value); setShowLock(false); showToast('Lock updated ✓'); }}
              className={`w-full flex items-center justify-between px-6 py-5 rounded-[20px] border transition-all ${settings.lockType === opt.value ? 'bg-black border-black' : 'bg-[#F8FAFC] border-transparent'}`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{opt.emoji}</span>
                <span className={`text-[15px] font-[700] ${settings.lockType === opt.value ? 'text-white' : 'text-black'}`}>{opt.label}</span>
              </div>
              {settings.lockType === opt.value && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* ── Import Sheet ───────────────────────────────────── */}
      <BottomSheet show={showImport} onClose={() => setShowImport(false)} title="Import Backup">
        <div className="space-y-5">
          <p className="text-[13px] font-[500] text-[#94A3B8] leading-relaxed">Select a SpendlyShop JSON backup file to restore your data.</p>

          {/* File picker */}
          <div
            className="relative w-full py-5 px-6 rounded-[20px] bg-[#F8FAFC] border-2 border-dashed border-[#F1F5F9] overflow-hidden cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept=".json" onChange={e => setImportFile(e.target.files?.[0] || null)} className="hidden" />
            <div className="flex items-center gap-3">
              <Upload className="w-5 h-5 text-black" />
              <span className="text-[15px] font-[700] text-black truncate">
                {importFile ? importFile.name : 'Tap to select file'}
              </span>
            </div>
          </div>

          {/* Mode */}
          <div className="flex gap-3">
            {[{ label: 'Merge', value: 'merge' }, { label: 'Replace All', value: 'replace' }].map(m => (
              <button
                key={m.value}
                onClick={() => setImportMode(m.value)}
                className={`flex-1 py-4 rounded-[16px] text-[13px] font-[800] border transition-all ${importMode === m.value ? 'bg-black text-white border-black' : 'bg-[#F8FAFC] text-[#64748B] border-transparent'}`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-1">
            {importMode === 'replace' ? '⚠️ Replace will delete all current data first.' : 'Merge will add imported data alongside existing records.'}
          </p>

          <button onClick={handleImport} className="w-full h-16 bg-black text-white rounded-full font-[800] text-[15px] flex items-center justify-center gap-2 shadow-xl active:bg-slate-900 transition-all">
            <Upload className="w-5 h-5 text-white/40" /> Import Data
          </button>
        </div>
      </BottomSheet>

      {/* ── Category Picker ─────────────────────────────────── */}
      <BottomSheet show={showCategory} onClose={() => setShowCategory(false)} title="Worldwide Categories">
        <div className="space-y-6">
          <div className="relative">
            <X className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CBD5E1] transition-opacity ${catSearch ? 'opacity-100' : 'opacity-0'}`} onClick={() => setCatSearch('')} />
            <input
              className="w-full bg-[#F8FAFC] border border-[#F1F5F9] p-4 pl-12 rounded-[20px] outline-none font-[700] text-black text-[15px] placeholder:text-[#94A3B8]"
              value={catSearch}
              onChange={e => setCatSearch(e.target.value)}
              placeholder="Search category (e.g. food, gym...)"
              autoFocus
            />
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#CBD5E1]" />
          </div>

          <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredCats.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  setForm({ ...form, category: c.id });
                  setShowCategory(false);
                  setCatSearch('');
                }}
                className={`w-full flex items-center justify-between p-4 rounded-[18px] transition-all ${form.category === c.id ? 'bg-black text-white shadow-lg' : 'bg-[#F8FAFC] active:bg-[#F1F5F9]'}`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{c.emoji}</span>
                  <span className={`text-[15px] font-[700] ${form.category === c.id ? 'text-white' : 'text-black'}`}>{c.name}</span>
                </div>
                {form.category === c.id && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
              </button>
            ))}
            {filteredCats.length === 0 && (
              <div className="py-12 text-center text-[#94A3B8] font-[600] text-[13px]">No matching categories found</div>
            )}
          </div>
        </div>
      </BottomSheet>
<<<<<<< HEAD
=======
      
      {/* ── Currency Picker ─────────────────────────────────── */}
      <BottomSheet show={showCurrency} onClose={() => setShowCurrency(false)} title="Select Currency">
        <div className="space-y-4">
          <p className="text-[13px] font-[500] text-[#94A3B8] px-1 mb-2 leading-relaxed">Choose the primary currency for your shop billing and reports.</p>
          <div className="grid grid-cols-1 gap-2">
            {CURRENCIES.map(c => (
              <button
                key={c.code}
                onClick={() => {
                  updateSetting('currency', c.code);
                  setShowCurrency(false);
                  showToast(`Currency updated to ${c.code} ✓`);
                }}
                className={`w-full flex items-center justify-between p-5 rounded-[22px] border transition-all ${settings.currency === c.code ? 'bg-black border-black text-white shadow-lg' : 'bg-[#F8FAFC] border-[#F1F5F9]'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-[800] text-[18px] ${settings.currency === c.code ? 'bg-white/10' : 'bg-white border border-[#F1F5F9]'}`}>
                    {c.symbol}
                  </div>
                  <div className="text-left">
                    <span className={`text-[15px] font-[700] block ${settings.currency === c.code ? 'text-white' : 'text-black'}`}>{c.name}</span>
                    <span className={`text-[11px] font-[600] ${settings.currency === c.code ? 'text-white/50' : 'text-[#94A3B8]'}`}>{c.code}</span>
                  </div>
                </div>
                {settings.currency === c.code && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>
      </BottomSheet>

>>>>>>> 41f113d (upgrade scanner)
      <BottomSheet show={showAbout} onClose={() => setShowAbout(false)} title="About">
        <div className="space-y-6 text-center py-4">
          <div className="w-20 h-20 bg-black rounded-[24px] flex items-center justify-center mx-auto shadow-xl">
            <Store className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-[24px] font-[800] text-black">Spendly Shop</h3>
            <p className="text-[#94A3B8] font-[600] text-sm mt-1">Version 1.0.0</p>
          </div>
          {[
            { label: 'Total Bills Created', value: bills.length },
            { label: 'Total Clients', value: customers.length },
            { label: 'Total Revenue', value: formatMoney(totalRevenue, settings.currency) },
          ].map(s => (
            <div key={s.label} className="flex justify-between items-center bg-[#F8FAFC] px-6 py-5 rounded-[20px]">
              <span className="text-[14px] font-[700] text-[#64748B]">{s.label}</span>
              <span className="text-[17px] font-[800] text-black">{s.value}</span>
            </div>
          ))}
          <p className="text-[12px] font-[500] text-[#94A3B8] max-w-[280px] mx-auto leading-relaxed pb-4">
            Built with ❤️ for shop owners across India. 100% private, offline-first billing.
          </p>
        </div>
      </BottomSheet>

<<<<<<< HEAD
      {/* ── Currency Sheet ────────────────────────────────── */}
      <BottomSheet show={showCurrency} onClose={() => setShowCurrency(false)} title="Select Currency">
        <div className="space-y-4">
          {[
            { id: 'INR', name: 'Indian Rupee', flag: '🇮🇳', sym: '₹' },
            { id: 'USD', name: 'US Dollar', flag: '🇺🇸', sym: '$' },
            { id: 'EUR', name: 'Euro', flag: '🇪🇺', sym: '€' },
            { id: 'GBP', name: 'British Pound', flag: '🇬🇧', sym: '£' },
          ].map(c => (
            <button
              key={c.id}
              onClick={() => { updateSetting('currency', c.id); setShowCurrency(false); showToast(`Currency set to ${c.id} ✓`); }}
              className={`w-full flex items-center justify-between px-6 py-5 rounded-[24px] border transition-all ${settings.currency === c.id ? 'bg-black border-black shadow-lg shadow-black/10' : 'bg-[#F8FAFC] border-transparent active:bg-slate-100'}`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{c.flag}</span>
                <div className="text-left">
                  <p className={`text-[15px] font-[800] ${settings.currency === c.id ? 'text-white' : 'text-black'}`}>{c.id}</p>
                  <p className={`text-[11px] font-[600] ${settings.currency === c.id ? 'text-white/40' : 'text-[#94A3B8]'}`}>{c.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[18px] font-[800] ${settings.currency === c.id ? 'text-white' : 'text-slate-400'}`}>{c.sym}</span>
                {settings.currency === c.id && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
              </div>
            </button>
          ))}
        </div>
      </BottomSheet>

=======
>>>>>>> 41f113d (upgrade scanner)
      {/* ── Factory Reset ─────────────────────────── */}
      {showClearConfirm && createPortal(
        <FactoryResetWorkflow onClose={() => setShowClearConfirm(false)} />,
        document.body
      )}

      <Toast msg={toast} />
    </div>
  );
};

export default SettingsScreen;
