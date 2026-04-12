import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Receipt, Users, Plus, 
  ChevronRight, CreditCard, Banknote, 
  TrendingUp, Clock, Trophy, Store,
  LayoutGrid, Settings, ArrowUpRight
} from 'lucide-react';

import { useShopStore } from '../store/shopStore';
import { useBillStore } from '../store/billStore';
import { useCustomerStore } from '../store/customerStore';
import { useItemsStore } from '../store/itemsStore';
import { formatMoney } from '../utils/formatMoney';
import { formatDate } from '../utils/formatDate';

const HomeScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { shop } = useShopStore();
    const { bills, loadBills, getTodaysBills } = useBillStore();
    const { customers, loadCustomers } = useCustomerStore();
    const { items, loadItems, getMostUsedItems } = useItemsStore();

    useEffect(() => {
        loadBills();
        loadCustomers();
        loadItems();
    }, []);

    const todaysBills = getTodaysBills();
    const totalSales = todaysBills.reduce((sum, b) => sum + (b.total || 0), 0);
    const upiSales = todaysBills.filter(b => b.paymentMethod === 'upi').reduce((sum, b) => sum + (b.total || 0), 0);
    const cashSales = totalSales - upiSales;
    
    const quickItems = getMostUsedItems(6);

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariant = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 200 } }
    };

    return (
        <div className="min-h-screen bg-white pb-40 overflow-x-hidden relative font-sans">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[90px] -z-10 -mr-40 -mt-40" />

            <header className="bg-white/80 backdrop-blur-xl p-6 pb-4 flex items-center justify-between sticky top-0 z-40 border-b border-[#F1F5F9] shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-black rounded-[14px] flex items-center justify-center text-[22px] shadow-lg shadow-black/5 border border-white/20">
                        {shop?.logoEmoji || '🏪'}
                    </div>
                    <div>
                        <h1 className="text-[17px] font-[800] text-black leading-tight tracking-tight">{shop?.name || 'My Shop'}</h1>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            <span className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-wider">Live View</span>
                        </div>
                    </div>
                </div>
                <motion.button 
                    whileTap={{ scale: 0.9 }}
                    className="w-11 h-11 bg-[#F8FAFC] rounded-2xl flex items-center justify-center text-[#64748B] border border-transparent"
                >
                    <Bell className="w-5 h-5" />
                </motion.button>
            </header>

            <motion.div variants={container} initial="hidden" animate="show" className="p-6 space-y-10">
                <motion.div variants={itemVariant} className="px-1">
                    <h2 className="text-[28px] font-[800] text-black leading-tight tracking-tight">Today's Sales</h2>
                    <p className="text-[14px] font-[500] text-[#94A3B8] mt-1">{formatDate(new Date(), 'long')}</p>
                </motion.div>

                <motion.div variants={itemVariant} className="relative">
                    <div className="bg-black rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <div className="text-[10px] font-[800] text-white/40 uppercase tracking-[0.2em] mb-3">Gross Revenue</div>
                                <div className="text-[36px] font-[800] tracking-tight">{formatMoney(totalSales)}</div>
                            </div>
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-5 rounded-[24px] border border-white/5">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Banknote className="w-3.5 h-3.5 text-white/30" />
                                    <span className="text-[9px] font-[800] uppercase text-white/30 tracking-widest">Cash</span>
                                </div>
                                <div className="text-[18px] font-[800]">{formatMoney(cashSales)}</div>
                            </div>
                            <div className="bg-white/5 p-5 rounded-[24px] border border-white/5">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <CreditCard className="w-3.5 h-3.5 text-white/30" />
                                    <span className="text-[9px] font-[800] uppercase text-white/30 tracking-widest">Online</span>
                                </div>
                                <div className="text-[18px] font-[800]">{formatMoney(upiSales)}</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariant} className="grid grid-cols-2 gap-4">
                    <button onClick={() => navigate('/create-bill')} className="col-span-2 group bg-[#F8FAFC] px-8 py-9 rounded-[32px] hover:bg-black hover:text-white transition-all duration-500 flex items-center justify-between border border-transparent">
                        <div className="text-left">
                            <h3 className="text-[22px] font-[800] mb-1 tracking-tight">Create Bill</h3>
                            <p className="text-[13px] font-[500] opacity-50">New customer checkout</p>
                        </div>
                        <div className="w-14 h-14 bg-black group-hover:bg-white text-white group-hover:text-black rounded-full flex items-center justify-center shadow-lg transition-all duration-500">
                            <Plus className="w-7 h-7" strokeWidth={3} />
                        </div>
                    </button>

                    <button onClick={() => navigate('/items')} className="bg-[#F8FAFC] p-7 rounded-[32px] flex flex-col gap-6 text-left group transition-all hover:bg-white hover:shadow-xl hover:shadow-black/5 active:scale-95">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black shadow-sm group-hover:bg-black group-hover:text-white transition-all">
                            <Store className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="font-[800] text-black text-[17px] tracking-tight">Products</div>
                            <div className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-wider mt-1">Manage Menu</div>
                        </div>
                    </button>

                    <button onClick={() => navigate('/reports')} className="bg-[#F8FAFC] p-7 rounded-[32px] flex flex-col gap-6 text-left group transition-all hover:bg-white hover:shadow-xl hover:shadow-black/5 active:scale-95">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black shadow-sm group-hover:bg-black group-hover:text-white transition-all">
                            <LayoutGrid className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="font-[800] text-black text-[17px] tracking-tight">Analytics</div>
                            <div className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-wider mt-1">View Reports</div>
                        </div>
                    </button>
                </motion.div>

                <motion.div variants={itemVariant} className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[12px] font-[800] text-black uppercase tracking-widest">Bestsellers</h3>
                        <button className="text-[11px] font-[800] text-[#64748B] uppercase tracking-widest flex items-center gap-1">Details <ArrowUpRight className="w-3 h-3" /></button>
                    </div>
                    {quickItems.length > 0 ? (
                        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-6 px-6">
                            {quickItems.map((it, idx) => (
                                <motion.div key={idx} whileTap={{ scale: 0.95 }} className="flex-shrink-0 bg-[#F8FAFC] p-6 rounded-[28px] flex flex-col items-center min-w-[130px] active:bg-slate-100 transition-all">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm border border-[#F1F5F9]">
                                        📦
                                    </div>
                                    <div className="font-[800] text-black text-sm tracking-tight text-center">{it.name}</div>
                                    <div className="font-[800] text-[#64748B] text-[12px] mt-1">{formatMoney(it.price)}</div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-[#F8FAFC] rounded-[28px]">
                            <p className="text-[13px] font-[700] text-[#94A3B8]">No items yet — add products to see bestsellers</p>
                        </div>
                    )}
                </motion.div>
            </motion.div>

        </div>
    );
};

export default HomeScreen;
