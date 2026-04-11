import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Receipt, Users, Clock, 
  Trophy, Download, Share2, ArrowLeft,
  ChevronRight, Banknote, CreditCard, PieChart
} from 'lucide-react';

import { useBillStore } from '../store/billStore';
import { useCustomerStore } from '../store/customerStore';
import { formatMoney } from '../utils/formatMoney';

const FILTERS = ['Today', 'This Week', 'This Month', 'Custom'];

const ReportsScreen = () => {
    const navigate = useNavigate();
    const { bills, loadBills } = useBillStore();
    const { customers, loadCustomers } = useCustomerStore();
    const [filter, setFilter] = useState('This Month');

    useEffect(() => {
        loadBills();
        loadCustomers();
    }, []);

    // Calculate report data based on filter
    const totalSales = bills.reduce((sum, b) => sum + b.total, 0);
    const avgBill = bills.length > 0 ? totalSales / bills.length : 0;
    
    const paymentMetrics = bills.reduce((acc, bill) => {
        const method = bill.paymentMethod?.toLowerCase() || 'cash';
        acc[method] = (acc[method] || 0) + bill.total;
        return acc;
    }, { cash: 0, upi: 0, card: 0, credit: 0 });

    const topItems = [
        { name: 'Parle-G 100g', qty: 45, amount: 2250 },
        { name: 'Amul Milk 500ml', qty: 32, amount: 1600 },
        { name: 'Coca Cola 250ml', qty: 28, amount: 1120 },
        { name: 'Maggi Noodles', qty: 25, amount: 1250 },
        { name: 'Surf Excel', qty: 12, amount: 1800 }
    ];

    const topCustomers = [
        { name: 'Devansh Patel', bills: 12, amount: 4500 },
        { name: 'Hardik Shah', bills: 8, amount: 3200 },
        { name: 'Rahul Sharma', bills: 5, amount: 1500 }
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <header className="bg-white p-6 pb-4 flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-slate-50">
                <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-slate-800 font-black">
                    <ArrowLeft className="w-5 h-5" /> Reports
                </button>
                <div className="flex gap-4">
                    <Download className="w-5 h-5 text-slate-400" />
                    <Share2 className="w-5 h-5 text-slate-400" />
                </div>
            </header>

            <div className="p-4 space-y-6">
                {/* Filter Row */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide px-1">
                    {FILTERS.map(f => (
                        <button 
                            key={f} 
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2.5 rounded-full text-[13px] font-[800] whitespace-nowrap transition-all border ${
                                filter === f ? 'bg-black text-white border-black shadow-md' : 'bg-white text-[#AFAFAF] border-slate-100'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-5 rounded-card border border-slate-100 shadow-sm space-y-2">
                        <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-primary">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Sales</div>
                        <div className="text-xl font-black text-slate-900">{formatMoney(totalSales)}</div>
                    </div>
                    <div className="bg-white p-5 rounded-card border border-slate-100 shadow-sm space-y-2">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Bills</div>
                        <div className="text-xl font-black text-slate-900">{bills.length}</div>
                    </div>
                    <div className="bg-white p-5 rounded-card border border-slate-100 shadow-sm space-y-2">
                        <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-500">
                            <Users className="w-5 h-5" />
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customers</div>
                        <div className="text-xl font-black text-slate-900">{customers.length}</div>
                    </div>
                    <div className="bg-white p-5 rounded-card border border-slate-100 shadow-sm space-y-2">
                        <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-500">
                            <Banknote className="w-5 h-5" />
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Bill</div>
                        <div className="text-xl font-black text-slate-900">{formatMoney(avgBill)}</div>
                    </div>
                </div>

                {/* Sales Chart Placeholder */}
                <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-900">Sales Trend</h3>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last 7 Days</div>
                    </div>
                    <div className="h-40 flex items-end justify-between gap-2 pt-4">
                        {[40, 65, 45, 90, 55, 75, 80].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    className={`w-full rounded-t-lg ${i === 6 ? 'bg-primary' : 'bg-emerald-50'}`}
                                />
                                <span className="text-[8px] font-black text-slate-300 uppercase">D0{i+1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Breakdown */}
                <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-900">Payment Modes</h3>
                        <PieChart className="w-4 h-4 text-slate-300" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Cash', val: paymentMetrics.cash, color: 'bg-emerald-500' },
                            { label: 'UPI', val: paymentMetrics.upi, color: 'bg-blue-500' },
                            { label: 'Card', val: paymentMetrics.card, color: 'bg-indigo-500' },
                            { label: 'Credit', val: paymentMetrics.credit, color: 'bg-red-500' }
                        ].map(p => (
                            <div key={p.label} className="flex items-center gap-3">
                                <div className={`w-2 h-8 rounded-full ${p.color}`} />
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">{p.label}</div>
                                    <div className="font-black text-slate-800 text-xs">{formatMoney(p.val)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Items Sold */}
                <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-900">Top Selling Items</h3>
                        <Trophy className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="space-y-4">
                        {topItems.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${idx === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <div className="font-black text-slate-800 text-xs">{item.name}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase">{item.qty} units sold</div>
                                    </div>
                                </div>
                                <div className="font-black text-slate-900 text-xs">{formatMoney(item.amount)}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Customers */}
                <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-6">
                    <h3 className="text-sm font-black text-slate-900">Top Customers</h3>
                    <div className="space-y-4">
                        {topCustomers.map((c, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-50 to-emerald-100 text-primary font-black rounded-xl flex items-center justify-center text-xs">
                                        {c.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-black text-slate-800 text-xs">{c.name}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase">{c.bills} bills created</div>
                                    </div>
                                </div>
                                <div className="font-black text-primary text-xs">{formatMoney(c.amount)}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                    <button className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-100">
                        <Download className="w-4 h-4" /> Download PDF Report
                    </button>
                    <button className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg">
                        <Share2 className="w-4 h-4" /> Share via WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportsScreen;
