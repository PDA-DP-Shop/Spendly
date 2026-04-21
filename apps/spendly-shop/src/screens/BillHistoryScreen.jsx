import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Receipt, ShoppingBag, 
  ChevronRight, Calendar, ArrowLeft,
  Banknote, CreditCard, Clock, X
} from 'lucide-react';

import { useBillStore } from '../store/billStore';
import { useSettingsStore } from '../store/settingsStore';
import { formatMoney } from '../utils/formatMoney';
import { formatDate } from '../utils/formatDate';

const BillHistoryScreen = () => {
    const navigate = useNavigate();
    const { bills, loadBills } = useBillStore();
    const { settings } = useSettingsStore();
    const currency = settings?.currency || 'USD';
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('All');

    useEffect(() => {
        loadBills();
        // Cleanup expired bills from recycle bin (older than 3 days)
        import('../services/softDeleteService').then(({ softDeleteBillService }) => {
            softDeleteBillService.cleanupExpiredDeleted();
        });
    }, []);

    const filteredBills = bills.filter(b => {
        const matchesSearch = b.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (b.customerName || '').toLowerCase().includes(searchQuery.toLowerCase());
        
        const today = new Date().toISOString().split('T')[0];
        const matchesDate = dateFilter === 'All' || (dateFilter === 'Today' && b.createdAt.startsWith(today));
        
        return matchesSearch && matchesDate;
    });

    const totalAmount = filteredBills.reduce((sum, b) => sum + (b.total || 0), 0);
    const pendingAmount = bills.filter(b => b.status === 'pending').reduce((sum, b) => sum + (b.total || 0), 0);

    const groupedBills = filteredBills.reduce((acc, bill) => {
        const date = bill.createdAt.split('T')[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(bill);
        return acc;
    }, {});

    const sortedDates = Object.keys(groupedBills).sort((a, b) => new Date(b) - new Date(a));

    return (
        <div className="min-h-dvh bg-white pb-tab relative overflow-x-hidden font-sans">
            <header className="bg-white/80 backdrop-blur-xl p-6 pb-4 flex items-center justify-between sticky top-0 z-40 border-b border-[#F1F5F9] shadow-sm">
                <button onClick={() => navigate('/home')} className="flex items-center gap-3 text-black font-[800] tracking-tight active:scale-95 transition-transform group">
                    <div className="p-2 bg-[#F8FAFC] rounded-xl group-hover:bg-black group-hover:text-white transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="text-[17px]">All Bills</span>
                </button>
                <div className="w-10 h-10 bg-[#F8FAFC] rounded-xl flex items-center justify-center text-[#94A3B8]">
                    <Filter className="w-5 h-5" />
                </div>
            </header>

            <div className="p-6 space-y-10">
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black p-8 rounded-[32px] shadow-xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-12 -mt-12" />
                        <div className="text-[10px] font-[800] text-white/40 uppercase tracking-widest mb-2">Total Sales</div>
                        <div className="text-[28px] font-[800] tracking-tight">{formatMoney(totalAmount, currency)}</div>
                    </div>
                    <div className="bg-[#F8FAFC] p-8 rounded-[32px] border border-transparent shadow-sm relative overflow-hidden">
                        <div className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-2">Pending</div>
                        <div className="text-[24px] font-[800] text-black tracking-tight">{formatMoney(pendingAmount, currency)}</div>
                        <div className="absolute bottom-0 right-0 p-4 opacity-5">
                            <Clock className="w-10 h-10 text-black" />
                        </div>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="space-y-6">
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#CBD5E1] transition-colors" />
                        <input 
                            className="w-full bg-[#F8FAFC] border border-transparent p-5 pl-14 rounded-[24px] outline-none focus:border-[#F1F5F9] focus:shadow-sm transition-all font-[700] text-black placeholder:text-[#CBD5E1] text-[15px]"
                            placeholder="Find Customer or Bill Number..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-6 px-6">
                        {['All', 'Today', 'This Week', 'This Month'].map(f => (
                            <button 
                                key={f}
                                onClick={() => setDateFilter(f)}
                                className={`px-6 py-3.5 rounded-full text-[11px] font-[800] uppercase tracking-widest transition-all whitespace-nowrap ${
                                    dateFilter === f ? 'bg-black text-white shadow-md' : 'bg-[#F8FAFC] text-[#64748B]'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bill List */}
                <div className="space-y-12">
                    {sortedDates.map((date, groupIdx) => (
                        <div key={date} className="space-y-6">
                            <div className="flex items-center gap-4 px-2">
                                <h3 className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-widest whitespace-nowrap">
                                    {date === new Date().toISOString().split('T')[0] ? 'Today — ' : ''}{formatDate(date, 'long')}
                                </h3>
                                <div className="h-px bg-[#F1F5F9] w-full" />
                            </div>

                            <div className="space-y-4">
                                {groupedBills[date].map((bill) => (
                                    <button 
                                        key={bill.id}
                                        onClick={() => navigate(`/bill/${bill.id}`)}
                                        className="w-full bg-[#F8FAFC] p-6 rounded-[32px] flex items-center justify-between active:bg-slate-100 transition-all border border-transparent group"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[22px] font-[800] text-black shadow-sm border border-[#F1F5F9]">
                                                {bill.customerName ? bill.customerName.charAt(0).toUpperCase() : 'C'}
                                            </div>
                                            <div className="text-left">
                                                <div className="font-[800] text-black text-[16px] tracking-tight">{bill.customerName || 'Customer'}</div>
                                                <div className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest mt-1.5 flex items-center gap-3">
                                                    <span className="text-black/40">{bill.billNumber}</span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {formatDate(bill.createdAt, 'time')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[17px] font-[800] text-black tracking-tight">{formatMoney(bill.total, currency)}</div>
                                            <div className={`text-[9px] font-[800] uppercase px-2.5 py-1 rounded-full tracking-widest mt-1.5 inline-block ${
                                                bill.paymentMethod === 'upi' ? 'bg-neutral-100 text-black' : 'bg-emerald-50 text-emerald-600'
                                            }`}>
                                                {bill.paymentMethod}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    {sortedDates.length === 0 && (
                        <div className="p-20 text-center bg-[#F8FAFC] rounded-[44px] border-2 border-dashed border-[#F1F5F9]">
                            <Receipt className="w-12 h-12 text-[#CBD5E1] opacity-50 mx-auto mb-4" />
                            <h3 className="text-[18px] font-[800] text-black">No Bills Found</h3>
                            <p className="text-[#94A3B8] font-medium text-sm mt-1">Try a different search.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BillHistoryScreen;
