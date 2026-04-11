import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Store, User, Bell, Shield, 
  MapPin, Globe, Palette, Database, Info,
  ChevronRight, Save, Trash2, LogOut,
  CreditCard, FileText, Smartphone, Lock,
  Users, Moon, Sun, Smartphone as PhoneIcon
} from 'lucide-react';

import { useShopStore } from '../store/shopStore';
import { useSettingsStore } from '../store/settingsStore';
import { useBillStore } from '../store/billStore';
import { formatMoney } from '../utils/formatMoney';

const SettingsScreen = () => {
    const navigate = useNavigate();
    const { shop, updateShop, saveShop } = useShopStore();
    const { settings, updateSetting } = useSettingsStore();
    const { bills } = useBillStore();

    const [form, setForm] = useState({
        name: shop?.name || '',
        ownerName: shop?.ownerName || '',
        phone: shop?.phone || '',
        email: shop?.email || '',
        address: shop?.address || '',
        gstNumber: shop?.gstNumber || '',
        upiId: shop?.upiId || '',
        billPrefix: shop?.billPrefix || 'INV',
        billFooterMessage: shop?.billFooterMessage || 'Thank you for shopping!',
    });

    const handleSaveProfile = async () => {
        await updateShop(form);
        // Toast success notification would be here
    };

    const handleFactoryReset = async () => {
        if (window.confirm("Are you sure? This will delete ALL shop data forever.")) {
            localStorage.clear();
            window.location.href = '/';
        }
    };

    const SettingsGroup = ({ title, children }) => (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-50">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</h3>
            </div>
            <div className="p-2">{children}</div>
        </div>
    );

    const SettingsRow = ({ icon: Icon, title, value, onClick, color = "text-slate-400", toggle, onToggle }) => (
        <div 
            onClick={onClick}
            className="flex items-center justify-between p-4 rounded-2xl active:bg-slate-50 transition-colors"
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <div className="text-sm font-black text-slate-800">{title}</div>
                    {value && <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{value}</div>}
                </div>
            </div>
            {toggle ? (
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggle(); }}
                    className={`w-10 h-6 rounded-full p-1 transition-colors ${settings[toggle] ? 'bg-primary' : 'bg-slate-200'}`}
                >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings[toggle] ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
            ) : (
                <ChevronRight className="w-4 h-4 text-slate-300" />
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="bg-white p-6 pb-4 flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-slate-50">
                <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-slate-800 font-black">
                    <ArrowLeft className="w-5 h-5" /> Settings
                </button>
            </header>

            <div className="p-4">
                {/* Shop Profile Section */}
                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm text-center space-y-6 mb-6">
                    <div className="relative inline-block mx-auto">
                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-[32px] flex items-center justify-center text-4xl shadow-inner border-2 border-white">
                            {shop?.logoEmoji || '🏪'}
                        </div>
                        <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                            <Plus className="w-5 h-5 rotate-45" style={{ transform: 'rotate(0)' }} />
                        </button>
                    </div>

                    <div className="space-y-4 text-left">
                        <div className="grid grid-cols-1 gap-4">
                             <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Shop Name</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-primary font-bold"
                                    value={form.name}
                                    onChange={e => setForm({...form, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Owner Name</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-primary font-bold"
                                    value={form.ownerName}
                                    onChange={e => setForm({...form, ownerName: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Phone</label>
                                <input 
                                    type="tel" 
                                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-primary font-bold"
                                    value={form.phone}
                                    onChange={e => setForm({...form, phone: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">UPI ID</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-primary font-bold"
                                    value={form.upiId}
                                    onChange={e => setForm({...form, upiId: e.target.value})}
                                />
                            </div>
                        </div>

                        <button 
                            onClick={handleSaveProfile}
                            className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 mt-4 active:scale-95 transition-transform"
                        >
                            <Save className="w-4 h-4" /> Save Shop Profile
                        </button>
                    </div>
                </div>

                <SettingsGroup title="Billing & Store">
                    <SettingsRow icon={FileText} title="Invoice Settings" value="Prefix, Start Number, etc." />
                    <SettingsRow icon={CreditCard} title="GST Settings" value="Rates, Display on Bill" />
                    <SettingsRow icon={ShoppingBag} title="Manage My Items" value={`${bills.length} saved items`} onClick={() => navigate('/items')} color="text-primary" />
                </SettingsGroup>

                <SettingsGroup title="Security & Access">
                    <SettingsRow icon={Users} title="Staff Access" value="Enable limited mode" toggle="staffPinEnabled" onToggle={() => updateSetting('staffPinEnabled', !settings.staffPinEnabled)} />
                    <SettingsRow icon={Lock} title="App Lock" value="Change PIN or Pattern" />
                    <SettingsRow icon={Smartphone} title="Biometric Unlock" toggle="biometricEnabled" onToggle={() => updateSetting('biometricEnabled', !settings.biometricEnabled)} />
                </SettingsGroup>

                <SettingsGroup title="Preferences">
                    <SettingsRow icon={Bell} title="Notifications" value="Daily sales, Reminders" />
                    <SettingsRow icon={Globe} title="Language" value={settings.language === 'en' ? 'English' : 'Hindi'} />
                    <SettingsRow icon={settings.theme === 'dark' ? Moon : Sun} title="Theme" value={settings.theme} />
                </SettingsGroup>

                <SettingsGroup title="Data Management">
                    <SettingsRow icon={Database} title="Export All Data" value="CSV, JSON Backup" />
                    <SettingsRow icon={Trash2} title="Clean Database" value="Clear bills older than 1 year" color="text-amber-500" />
                    <div className="p-4">
                        <button 
                            onClick={handleFactoryReset}
                            className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border border-red-100 active:bg-red-100 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" /> Factory Reset Shop
                        </button>
                    </div>
                </SettingsGroup>

                <SettingsGroup title="About & Legal">
                    <SettingsRow icon={Info} title="App Version" value="v1.0.0 (Stable)" />
                    <div className="p-6 text-center space-y-2">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Spendly Shop by Team Codinity</p>
                        <p className="text-[10px] font-bold text-primary underline">Privacy Policy</p>
                    </div>
                </SettingsGroup>
            </div>
        </div>
    );
};

// Simplified Plus icon for the emoji picker button
const Plus = ({ className, style }) => (
    <div style={style} className={className}>
        <div className="w-4 h-0.5 bg-current rounded-full rotate-90 absolute" />
        <div className="w-4 h-0.5 bg-current rounded-full absolute" />
    </div>
);

const ShoppingBag = ({ className }) => {
  return (
    <div className={className}>
      <div className="w-5 h-5 border-2 border-current rounded-lg relative">
        <div className="absolute top-1 left-1.5 right-1.5 h-1 border-t-2 border-current rounded-full" />
      </div>
    </div>
  )
}

const X = ({ className }) => <Plus className={className} style={{ transform: 'rotate(45deg)' }} />;

export default SettingsScreen;
