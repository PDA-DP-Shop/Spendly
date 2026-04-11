import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Receipt, ShoppingBag, 
  ChevronRight, Calendar, ArrowLeft,
  Banknote, CreditCard, Clock
} from 'lucide-react';

import { useBillStore } from '../store/billStore';
import { formatMoney } from '../utils/formatMoney';
import { formatDate } from '../utils/formatDate';

const BillHistoryScreen = () => {
    const navigate = useNavigate();
    const { bills, loadBills } = useBillStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        loadBills();
    }, []);

    const filteredBills = bills.filter(b => {
        const matchesSearch = b.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (b.customerName || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || b.status === statusFilter.toLowerCase();
        
        // Date filters for current context
        const today = new Date().toISOString().split('T')[0];
        const matchesDate = dateFilter === 'All' || (dateFilter === 'Today' && b.createdAt.startsWith(today));
        
        return matchesSearch && matchesStatus && matchesDate;
    });

    const totalAmount = filteredBills.reduce((sum, b) => sum + b.total, 0);
    const pendingAmount = filteredBills.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.total, 0);

    // Grouping by date logic
    const groupedBills = filteredBills.reduce((acc, bill) => {
        const date = bill.createdAt.split('T')[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(bill);
        return acc;
    }, {});

    const sortedDates = Object.keys(groupedBills).sort((a, b) => new Date(b) - new Date(a));

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="bg-white p-6 pb-4 flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-slate-50">
                <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-slate-800 font-black">
                    <ArrowLeft className="w-5 h-5" /> Bill History
                </button>
                <Filter className="w-5 h-5 text-slate-400" />
            </header>

            <div className="p-4 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search bills or customers..."
                        className="w-full bg-white border border-slate-100 p-4 pl-11 rounded-2xl shadow-sm outline-none focus:border-primary transition-all font-bold text-sm"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filter Row */}
                <div className="space-y-3">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-1">
                        {['All', 'Today', 'This Week', 'This Month', 'Custom'].map(f => (
                            <button 
                                key={f} 
                                onClick={() => setDateFilter(f)}
                                className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all ${
                                    dateFilter === f ? 'bg-primary text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-1">
                        {['All', 'Sent', 'Pending', 'Credit', 'Paid'].map(f => (
                            <button 
                                key={f} 
                                onClick={() => setStatusFilter(f)}
                                className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all ${
                                    statusFilter === f ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center">
                        <div className="text-[8px] font-black text-slate-400 uppercase mb-1">Total Bills</div>
                        <div className="text-sm font-black text-slate-800">{filteredBills.length}</div>
                    </div>
                    <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center">
                        <div className="text-[8px] font-black text-slate-400 uppercase mb-1">Total Amount</div>
                        <div className="text-sm font-black text-primary">{formatMoney(totalAmount)}</div>
                    </div>
                    <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center">
                        <div className="text-[8px] font-black text-slate-400 uppercase mb-1">Pending</div>
                        <div className="text-sm font-black text-red-500">{formatMoney(pendingAmount)}</div>
                    </div>
                </div>

                {/* Bills List */}
                <div className="space-y-6 pt-4">
                    {sortedDates.map(date => (
                        <div key={date} className="space-y-3">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">
                                {date === new Date().toISOString().split('T')[0] ? 'Today' : formatDate(date, 'short')} — {formatDate(date, 'short')}
                            </h3>
                            <div className="space-y-3">
                                {groupedBills[date].map((bill, idx) => (
                                    <motion.div 
                                        key={bill.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => navigate(`/bill/${bill.id}`)}
                                        className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between active:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-50 to-emerald-100 text-primary font-black rounded-2xl flex items-center justify-center text-lg">
                                                {bill.customerName ? bill.customerName.charAt(0).toUpperCase() : 'W'}
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900 leading-tight">
                                                    {bill.customerName || 'Walk-in Customer'}
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-400 tracking-wide mt-0.5">
                                                    {bill.billNumber} • {bill.items.length} items • {formatDate(bill.createdAt, 'time')}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-black text-slate-900">{formatMoney(bill.total)}</div>
                                            <div className="mt-1 flex items-center gap-2 justify-end">
                                                {bill.status === 'paid' && <span className="p-1 bg-emerald-50 text-emerald-600 rounded-full"><Banknote className="w-2.5 h-2.5" /></span>}
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                    bill.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 
                                                    bill.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                                                }`}>
                                                    {bill.status}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {filteredBills.length === 0 && (
                        <div className="p-12 text-center flex flex-col items-center">
                            <Receipt className="w-16 h-16 text-slate-100 mb-4" />
                            <h3 className="text-lg font-black text-slate-300">No bills found</h3>
                            <p className="text-slate-400 font-bold text-sm mb-8">Tap + to create your first bill</p>
                            <button 
                                onClick={() => navigate('/create-bill')}
                                className="bg-primary text-white px-8 py-4 rounded-full font-black text-sm shadow-xl shadow-emerald-200"
                            >
                                Create Bill
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BillHistoryScreen;
