import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Receipt, Users, Plus, 
  ChevronRight, CreditCard, Banknote, 
  TrendingUp, Clock, Trophy, Store,
  LayoutGrid, Settings, ArrowUpRight, Landmark, Zap
} from 'lucide-react';

import { useShopStore } from '../store/shopStore';
import { useBillStore } from '../store/billStore';
import { useCustomerStore } from '../store/customerStore';
import { useItemsStore } from '../store/itemsStore';
import { useWalletStore } from '../store/walletStore';
import { useSettingsStore } from '../store/settingsStore';
import { formatMoney } from '../utils/formatMoney';
import { formatDate } from '../utils/formatDate';
import RecoveryBanner from '../components/shared/RecoveryBanner';

const HomeScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { shop } = useShopStore();
    const { bills, loadBills, getTodaysBills } = useBillStore();
    const { customers, loadCustomers } = useCustomerStore();
    const { items, loadItems, getMostUsedItems } = useItemsStore();
    const { cashWallet, bankAccounts, loadCashWallet, loadBankAccounts } = useWalletStore();
    const { settings } = useSettingsStore();
    const currency = settings?.currency || 'USD';

    useEffect(() => {
        loadBills();
        loadCustomers();
        loadItems();
        loadCashWallet();
        loadBankAccounts();
    }, []);

    const todaysBills = getTodaysBills();
    const totalSales = todaysBills.reduce((sum, b) => sum + (b.total || 0), 0);
    const upiSales = todaysBills.filter(b => b.paymentMethod === 'upi').reduce((sum, b) => sum + (b.total || 0), 0);
    const cashSalesItems = totalSales - upiSales;
    
    const quickItems = getMostUsedItems(6);

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariant = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 200 } }
    };

    const S = { 
        inter: { fontFamily: "'Inter', sans-serif" },
        sora: { fontFamily: "'Sora', sans-serif" }
    }

    const greeting = (() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    })();

    return (
        <div className="min-h-dvh bg-white pb-tab relative overflow-x-hidden font-sans">
            <header className="bg-white/80 backdrop-blur-xl p-7 flex items-center justify-between sticky top-0 z-40 border-b border-[#F1F5F9] shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black rounded-[18px] flex items-center justify-center text-[24px] shadow-lg shadow-black/10 border border-white/10">
                        {shop?.logoEmoji || '🏪'}
                    </div>
                    <div>
                        <p className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-[0.2em] mb-0.5" style={S.inter}>{greeting}</p>
                        <h1 className="text-[19px] font-[900] text-black leading-tight tracking-tight" style={S.inter}>{shop?.name || 'My Shop'}</h1>
                    </div>
                </div>
                <div className="flex gap-2">
                    <motion.button 
                        whileTap={{ scale: 0.9 }}
                        className="w-11 h-11 bg-[#F8FAFC] rounded-2xl flex items-center justify-center text-[#64748B] border border-[#EDF2F7]"
                    >
                        <Bell className="w-5 h-5" />
                    </motion.button>
                </div>
            </header>

            <RecoveryBanner />

            <motion.div variants={container} initial="hidden" animate="show" className="p-7 space-y-10">
                {/* Revenue Card with Aura Blurs */}
                <motion.div variants={itemVariant} className="relative">
                    <div className="bg-black rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-black/20">
                        {/* Aura Blurs */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full -mr-24 -mt-24 blur-3xl opacity-50" />
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full -ml-20 -mb-20 blur-3xl opacity-30" />
                        
                        <div className="flex justify-between items-start mb-12 relative z-10">
                            <div>
                                <div className="text-[11px] font-[900] text-white/30 uppercase tracking-[0.3em] mb-4" style={S.inter}>Revenue Today</div>
                                <div className="text-[44px] font-[900] tracking-tighter leading-none" style={S.sora}>
                                    {formatMoney(totalSales, currency)}
                                </div>
                            </div>
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/10">
                                <TrendingUp className="w-6 h-6 text-emerald-400" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <div className="bg-white/5 p-6 rounded-[28px] border border-white/5 backdrop-blur-md">
                                <div className="flex items-center gap-2 mb-2">
                                    <Banknote className="w-4 h-4 text-emerald-400/40" />
                                    <span className="text-[10px] font-[900] uppercase text-white/20 tracking-[0.2em]" style={S.inter}>Cash</span>
                                </div>
                                <div className="text-[20px] font-[900]" style={S.sora}>{formatMoney(cashSalesItems, currency)}</div>
                            </div>
                            <div className="bg-white/5 p-6 rounded-[28px] border border-white/5 backdrop-blur-md">
                                <div className="flex items-center gap-2 mb-2">
                                    <CreditCard className="w-4 h-4 text-blue-400/40" />
                                    <span className="text-[10px] font-[900] uppercase text-white/20 tracking-[0.2em]" style={S.inter}>Online</span>
                                </div>
                                <div className="text-[20px] font-[900]" style={S.sora}>{formatMoney(upiSales, currency)}</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Primary Action */}
                <motion.div variants={itemVariant}>
                    <button 
                        onClick={() => navigate('/create-bill')} 
                        className="w-full group bg-white border border-[#EDF2F7] p-8 rounded-[40px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 flex items-center justify-between group active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-6 text-left">
                            <div className="w-16 h-16 bg-black rounded-[24px] flex items-center justify-center shadow-xl shadow-black/10 group-hover:rotate-6 transition-transform">
                                <Plus className="w-8 h-8 text-white" strokeWidth={3} />
                            </div>
                            <div>
                                <h3 className="text-[24px] font-[900] text-black tracking-tight" style={S.inter}>Create Bill</h3>
                                <p className="text-[13px] font-[500] text-[#94A3B8] mt-1" style={S.inter}>Smart checkout & barcode entry</p>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#F8FAFC]">
                            <ChevronRight className="w-6 h-6 text-black/10 group-hover:text-black transition-colors" />
                        </div>
                    </button>
                </motion.div>

                {/* Wallet & Bank Quick View */}
                <motion.div variants={itemVariant} className="grid grid-cols-2 gap-4">
                    <div className="bg-[#F8FAFC] border border-[#EDF2F7] rounded-[36px] p-7 flex flex-col gap-6 group hover:bg-white hover:shadow-xl hover:shadow-black/5 active:scale-[0.97] transition-all cursor-pointer" onClick={() => navigate('/cash-wallet')}>
                        <div className="w-12 h-12 rounded-2xl bg-white border border-[#EDF2F7] flex items-center justify-center text-[22px] shadow-sm group-hover:-translate-y-1 transition-transform">💵</div>
                       <div>
                          <p className="text-[11px] font-[900] text-[#94A3B8] uppercase tracking-[0.2em] mb-1.5" style={S.inter}>Cash Balance</p>
                          <p className="text-[20px] font-[900] text-black tabular-nums" style={S.sora}>{formatMoney(cashWallet?.totalCash || 0, currency)}</p>
                       </div>
                    </div>

                    <div className="bg-[#F8FAFC] border border-[#EDF2F7] rounded-[36px] p-7 flex flex-col gap-6 group hover:bg-white hover:shadow-xl hover:shadow-black/5 active:scale-[0.97] transition-all cursor-pointer" onClick={() => navigate('/bank-accounts')}>
                       <div className="w-12 h-12 rounded-2xl bg-white border border-[#EDF2F7] flex items-center justify-center text-[22px] shadow-sm group-hover:-translate-y-1 transition-transform">🏦</div>
                       <div>
                          <p className="text-[11px] font-[900] text-[#94A3B8] uppercase tracking-[0.2em] mb-1.5" style={S.inter}>In Banks</p>
                          <p className="text-[20px] font-[900] text-black tabular-nums" style={S.sora}>{formatMoney(bankAccounts.reduce((sum, b) => sum + (b.balance || 0), 0), currency)}</p>
                       </div>
                    </div>
                </motion.div>

                {/* Products & Reports */}
                <motion.div variants={itemVariant} className="grid grid-cols-2 gap-4">
                    <button onClick={() => navigate('/items')} className="bg-white border border-[#EDF2F7] p-8 rounded-[40px] flex flex-col items-center gap-5 shadow-[0_2px_15px_rgba(0,0,0,0.02)] active:scale-95 transition-all text-center">
                        <div className="w-16 h-16 bg-slate-900 rounded-[24px] flex items-center justify-center shadow-xl shadow-slate-900/10">
                            <Store className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <div className="font-[900] text-black text-[18px] tracking-tight" style={S.inter}>Products</div>
                            <div className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest mt-1">Manage Catalog</div>
                        </div>
                    </button>

                    <button onClick={() => navigate('/reports')} className="bg-white border border-[#EDF2F7] p-8 rounded-[40px] flex flex-col items-center gap-5 shadow-[0_2px_15px_rgba(0,0,0,0.02)] active:scale-95 transition-all text-center">
                        <div className="w-16 h-16 bg-slate-900 rounded-[24px] flex items-center justify-center shadow-xl shadow-slate-900/10">
                            <LayoutGrid className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <div className="font-[900] text-black text-[18px] tracking-tight" style={S.inter}>Analytics</div>
                            <div className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest mt-1">Sales Reports</div>
                        </div>
                    </button>
                </motion.div>

                {/* Bestsellers Section */}
                <motion.div variants={itemVariant} className="space-y-6 pt-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <Trophy className="w-5 h-5 text-amber-500" />
                            <h3 className="text-[13px] font-[900] text-black uppercase tracking-widest">Bestsellers</h3>
                        </div>
                        <button className="text-[12px] font-[900] text-[#7C3AED] uppercase tracking-widest flex items-center gap-1">Details <ArrowUpRight className="w-3.5 h-3.5" /></button>
                    </div>
                    
                    {quickItems.length > 0 ? (
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-7 px-7">
                            {quickItems.map((it, idx) => (
                                <motion.div 
                                    key={idx} 
                                    whileTap={{ scale: 0.95 }} 
                                    className="flex-shrink-0 bg-[#F8FAFC] border border-[#EDF2F7] p-7 rounded-[36px] flex flex-col items-center min-w-[150px] active:bg-white active:shadow-xl active:shadow-black/5 transition-all"
                                >
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-sm border border-[#F1F5F9]">
                                        📦
                                    </div>
                                    <div className="font-[900] text-black text-[15px] tracking-tight text-center" style={S.inter}>{it.name}</div>
                                    <div className="font-[900] text-[#7C3AED] text-[13px] mt-2" style={S.sora}>{formatMoney(it.price, currency)}</div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-[#F8FAFC] rounded-[40px] border border-dashed border-slate-200">
                            <p className="text-[14px] font-[700] text-[#94A3B8]" style={S.inter}>No sales yet — start billing to see tops!</p>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
};

export default HomeScreen;
