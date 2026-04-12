import React, { useState, useRef } from 'react';
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
  MessageSquare
} from 'lucide-react';

import { useShopStore } from '../store/shopStore';
import { useSettingsStore } from '../store/settingsStore';
import { useBillStore } from '../store/billStore';
import { useCustomerStore } from '../store/customerStore';
import { formatMoney } from '../utils/formatMoney';
import { exportShopData, importShopData } from '../services/exportData';
import { db } from '../services/database';

// ─── Reusable Bottom Sheet ───────────────────────────────────────────────────
const BottomSheet = ({ show, onClose, title, children }) => (
  <AnimatePresence>
    {show && (
      <>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] bg-black/40"
        />
        <motion.div
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 32, stiffness: 350 }}
          className="fixed bottom-0 left-0 right-0 z-[61] bg-white"
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

// ─── Bill Prefix Picker Options ───────────────────────────────────────────────
const BILL_PREFIXES = ['INV', 'BILL', 'REC', 'TXN', 'ORD'];

// ─── GST Rate Presets ─────────────────────────────────────────────────────────
const GST_RATES = [0, 5, 12, 18, 28];

// ─── Main Component ────────────────────────────────────────────────────────────
const SettingsScreen = () => {
  const navigate = useNavigate();
  const { shop, updateShop } = useShopStore();
  const { settings, updateSetting } = useSettingsStore();
  const { bills } = useBillStore();
  const { customers } = useCustomerStore();

  // Profile form state
  const [form, setForm] = useState({
    name: shop?.name || '',
    ownerName: shop?.ownerName || '',
    phone: shop?.phone || '',
    upiId: shop?.upiId || '',
    address: shop?.address || '',
    gstNumber: shop?.gstNumber || '',
    billPrefix: shop?.billPrefix || 'INV',
    billFooterMessage: shop?.billFooterMessage || 'Thank you for your business!',
  });

  // Bottom sheet visibility
  const [showInvoice, setShowInvoice] = useState(false);
  const [showTax, setShowTax] = useState(false);
  const [showLock, setShowLock] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showNotifSheet, setShowNotifSheet] = useState(false);

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
    await updateShop(form);
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
    <div className="min-h-screen bg-white pb-32 relative overflow-x-hidden font-sans">
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
            {bills.length} bills · {customers.length} clients · {formatMoney(totalRevenue)}
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
          <SettingsRow icon={FileText} title="Invoice Setup" subtitle="Bill prefix, numbering & footer" onClick={() => setShowInvoice(true)} />
          <SettingsRow icon={Percent} title="Tax & GST" subtitle="Default GST rate and GSTIN" onClick={() => setShowTax(true)} />
          <SettingsRow icon={Package} title="Inventory" subtitle="Manage saved products" onClick={() => navigate('/items')} />
          <SettingsRow icon={Users} title="Clients" subtitle="Customer book" onClick={() => navigate('/customers')} last />
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
          <div className="overflow-hidden bg-red-50 rounded-[24px] border border-red-100">
            <SettingsRow icon={Trash2} title="Factory Reset" subtitle="Delete ALL data permanently" onClick={() => setShowClearConfirm(true)} danger last />
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

      {/* ── About Sheet ─────────────────────────────────────── */}
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
            { label: 'Total Revenue', value: formatMoney(totalRevenue) },
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

      {/* ── Factory Reset Confirm ─────────────────────────── */}
      <AnimatePresence>
        {showClearConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowClearConfirm(false)} className="fixed inset-0 z-[60] bg-black/40" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-x-8 top-1/2 -translate-y-1/2 z-[61] bg-white rounded-[32px] p-8 shadow-2xl text-center space-y-6"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-[22px] font-[800] text-black">Factory Reset?</h3>
                <p className="text-[13px] text-[#94A3B8] font-[500] mt-2 leading-relaxed">This will permanently delete ALL bills, customers, and shop data. This action cannot be reversed.</p>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={handleFactoryReset} className="w-full h-14 bg-red-500 text-white rounded-full font-[800] text-[15px] active:bg-red-700 transition-all">Yes, Delete Everything</button>
                <button onClick={() => setShowClearConfirm(false)} className="w-full h-14 bg-[#F8FAFC] text-black rounded-full font-[800] text-[15px] active:bg-slate-100 transition-all">Cancel</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Toast msg={toast} />
    </div>
  );
};

export default SettingsScreen;
