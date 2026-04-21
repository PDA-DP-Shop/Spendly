import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Receipt, Users, Clock, 
  Trophy, Download, Share2, ArrowLeft,
  ChevronRight, Banknote, CreditCard, PieChart,
  Target, Zap, Activity, Filter, BarChart, X, HelpCircle
} from 'lucide-react';

import { useBillStore } from '../store/billStore';
import { useCustomerStore } from '../store/customerStore';
import { useSettingsStore } from '../store/settingsStore';
import { formatMoney } from '../utils/formatMoney';
import PageGuide from '../components/shared/PageGuide';
import { usePageGuide } from '../hooks/usePageGuide';

const FILTERS = ['Today', 'This Week', 'This Month', 'All Time'];

const ReportsScreen = () => {
    const navigate = useNavigate();
    const { bills, loadBills } = useBillStore();
    const { customers, loadCustomers } = useCustomerStore();
    const { settings } = useSettingsStore();
    const currency = settings?.currency || 'USD';
    const [filter, setFilter] = useState('This Month');

    const filterRef = useRef(null);
    const metricsRef = useRef(null);
    const chartRef = useRef(null);
    const productsRef = useRef(null);

    const { showGuide, currentStep, startGuide, nextStep, prevStep, skipGuide } = usePageGuide('shop_reports');

    const guideSteps = useMemo(() => [
        { targetRef: filterRef, emoji: '📅', title: 'Time Range', description: 'Switch between daily, weekly, or monthly views to see how your shop is trending.', borderRadius: 32 },
        { targetRef: metricsRef, emoji: '📊', title: 'Key Data', description: 'Quickly see total revenue, bill count, and your customer base size at a glance.', borderRadius: 32 },
        { targetRef: chartRef, emoji: '📈', title: 'Sales Trend', description: 'A visual breakdown of your weekly performance to help you identify peak business days.', borderRadius: 32 },
        { targetRef: productsRef, emoji: '🏆', title: 'Best Sellers', description: 'Your top 5 items by revenue. Use this to decide which inventory to restock first!', borderRadius: 32 }
    ], [filterRef, metricsRef, chartRef, productsRef]);

    useEffect(() => {
        loadBills();
        loadCustomers();
    }, []);

    const totalSales = bills.reduce((sum, b) => sum + (b.total || 0), 0);
    const avgBill = bills.length > 0 ? totalSales / bills.length : 0;
    
    const topItems = useMemo(() => {
        const itemMap = {};
        bills.forEach(bill => {
            (bill.items || []).forEach(item => {
                const name = item.name || 'Unknown Item';
                if (!itemMap[name]) itemMap[name] = { name, qty: 0, amount: 0 };
                itemMap[name].qty += (item.quantity || 1);
                itemMap[name].amount += (item.price * (item.quantity || 1));
            });
        });
        return Object.values(itemMap).sort((a, b) => b.amount - a.amount).slice(0, 5);
    }, [bills]);

    // Real weekly sales — last 7 days from actual bills
    const weeklyBars = useMemo(() => {
        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });
        const totals = days.map(day =>
            bills.filter(b => b.createdAt?.startsWith(day)).reduce((s, b) => s + (b.total || 0), 0)
        );
        const max = Math.max(...totals, 1);
        return days.map((day, i) => ({
            pct: Math.round((totals[i] / max) * 100),
            label: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][new Date(day).getDay()],
            isToday: i === 6,
        }));
    }, [bills]);

    return (
        <div className="min-h-dvh bg-white pb-tab relative overflow-x-hidden font-sans">
            <header className="bg-white/80 backdrop-blur-xl p-6 pb-4 flex items-center justify-between sticky top-0 z-40 border-b border-[#F1F5F9] shadow-sm">
                <button onClick={() => navigate('/home')} className="flex items-center gap-3 text-black font-[800] tracking-tight active:scale-95 transition-transform group">
                    <div className="p-2 bg-[#F8FAFC] rounded-xl group-hover:bg-black group-hover:text-white transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="text-[17px]">Sales Reports</span>
                </button>
                <div className="flex gap-2">
                    <button onClick={startGuide} className="w-10 h-10 bg-[#F8FAFC] rounded-xl flex items-center justify-center text-black active:bg-black active:text-white transition-all border border-[#F1F5F9]">
                        <HelpCircle className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 bg-[#F8FAFC] rounded-xl flex items-center justify-center text-[#64748B]">
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 space-y-10"
            >
                {/* Time Filter */}
                <div ref={filterRef} className="flex gap-3 overflow-x-auto scrollbar-hide -mx-6 px-6">
                    {FILTERS.map((f, idx) => (
                        <button 
                            key={f} 
                            onClick={() => setFilter(f)}
                            className={`px-6 py-3.5 rounded-full text-[11px] font-[800] uppercase tracking-widest whitespace-nowrap transition-all border ${
                                filter === f ? 'bg-black text-white border-black shadow-md' : 'bg-[#F8FAFC] text-[#64748B] border-transparent'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Main Metrics */}
                <div ref={metricsRef} className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Revenue', val: formatMoney(totalSales, currency), icon: TrendingUp, color: 'text-black', bg: 'bg-[#F8FAFC]' },
                        { label: 'Bills', val: bills.length, icon: Receipt, color: 'text-black', bg: 'bg-[#F8FAFC]' },
                        { label: 'Clients', val: customers.length, icon: Users, color: 'text-black', bg: 'bg-[#F8FAFC]' },
                        { label: 'Avg Bill', val: formatMoney(avgBill, currency), icon: Activity, color: 'text-black', bg: 'bg-[#F8FAFC]' },
                    ].map((s, i) => (
                        <div 
                            key={i}
                            className="bg-[#F8FAFC] p-8 rounded-[32px] space-y-4 border border-transparent shadow-sm"
                        >
                            <div className={`w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm`}>
                                <s.icon className={`w-6 h-6 ${s.color}`} />
                            </div>
                            <div>
                                <div className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-1.5">{s.label}</div>
                                <div className="text-[20px] font-[800] text-black tracking-tight">{s.val}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Performance Graph */}
                <div ref={chartRef} className="bg-black rounded-[32px] p-8 text-white shadow-xl space-y-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16" />
                    
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <h3 className="text-[18px] font-[800] tracking-tight">Weekly Performance</h3>
                            <span className="text-[10px] font-[800] text-white/40 uppercase tracking-widest mt-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-white/40 rounded-full inline-block" /> Revenue Trend
                            </span>
                        </div>
                        <div className="p-3 bg-white/10 rounded-xl">
                            <BarChart className="w-5 h-5 text-white/60" />
                        </div>
                    </div>

                    <div className="h-44 flex items-end justify-between gap-3 pt-4 relative z-10 px-2">
                        {weeklyBars.map((bar, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max(bar.pct, 4)}%` }}
                                    transition={{ duration: 1, ease: [0.33, 1, 0.68, 1], delay: i * 0.05 }}
                                    className={`w-full rounded-t-lg ${bar.isToday ? 'bg-white' : 'bg-white/10'}`}
                                />
                                <span className={`text-[9px] font-[800] uppercase tracking-widest ${bar.isToday ? 'text-white/60' : 'text-white/20'}`}>{bar.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Selling */}
                <div ref={productsRef} className="bg-[#F8FAFC] rounded-[32px] p-8 space-y-8 border border-transparent">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[18px] font-[800] text-black tracking-tight">Top Products</h3>
                        <Trophy className="w-5 h-5 text-black" />
                    </div>
                    <div className="space-y-6">
                        {topItems.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between group">
                                <div className="flex items-center gap-5">
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-[800] text-[15px] bg-white border border-[#F1F5F9] shadow-sm`}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <div className="font-[800] text-black text-[16px] tracking-tight">{item.name}</div>
                                        <div className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest mt-1">{item.qty} Sold</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-[800] text-black text-[17px] tracking-tight">{formatMoney(item.amount, currency)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                    <button className="bg-white border border-[#F1F5F9] rounded-[24px] py-6 flex flex-col items-center justify-center gap-3 shadow-sm transition-active active:bg-slate-50">
                        <Download className="w-6 h-6 text-black" />
                        <span className="text-[10px] font-[800] uppercase tracking-widest text-[#94A3B8]">PDF Report</span>
                    </button>
                    <button className="bg-black text-white rounded-[24px] py-6 flex flex-col items-center justify-center gap-3 shadow-md active:bg-slate-900 transition-all">
                        <Share2 className="w-6 h-6 text-white" />
                        <span className="text-[10px] font-[800] uppercase tracking-widest text-white/40">Share Stats</span>
                    </button>
                </div>
            </motion.div>
            <PageGuide 
                show={showGuide} 
                steps={guideSteps} 
                currentStep={currentStep} 
                onNext={() => nextStep(guideSteps.length)} 
                onPrev={prevStep} 
                onSkip={skipGuide} 
            />
        </div>
    );
};

export default ReportsScreen;
