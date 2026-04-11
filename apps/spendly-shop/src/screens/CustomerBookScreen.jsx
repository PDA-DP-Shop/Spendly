import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, UserPlus, Users, Star, 
  AlertCircle, ChevronRight, ArrowLeft,
  Phone, MessageSquare, CreditCard
} from 'lucide-react';

import { useCustomerStore } from '../store/customerStore';
import { formatMoney } from '../utils/formatMoney';

const CustomerBookScreen = () => {
    const navigate = useNavigate();
    const { customers, loadCustomers } = useCustomerStore();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadCustomers();
    }, []);

    const filteredCustomers = customers.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.phone.includes(searchQuery)
    ).sort((a, b) => new Date(b.lastVisit || 0) - new Date(a.lastVisit || 0));

    const totalCredit = customers.reduce((sum, c) => sum + (c.creditAmount || 0), 0);
    const creditCustomers = customers.filter(c => (c.creditAmount || 0) > 0);
    const vipCount = customers.filter(c => c.isVIP).length;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="bg-white p-6 pb-4 flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-slate-50">
                <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-slate-800 font-black">
                    <ArrowLeft className="w-5 h-5" /> Customer Book
                </button>
                <div className="flex gap-4">
                    <Search className="w-5 h-5 text-slate-400" />
                    <UserPlus className="w-5 h-5 text-slate-400" />
                </div>
            </header>

            <div className="p-4 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search customers..."
                        className="w-full bg-white border border-slate-100 p-4 pl-11 rounded-2xl shadow-sm outline-none focus:border-primary transition-all font-bold text-sm"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center">
                        <div className="text-[8px] font-black text-slate-400 uppercase mb-1">Total</div>
                        <div className="text-sm font-black text-slate-800">{customers.length}</div>
                    </div>
                    <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center">
                        <div className="text-[8px] font-black text-slate-400 uppercase mb-1">VIP</div>
                        <div className="text-sm font-black text-emerald-600">{vipCount}</div>
                    </div>
                    <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center">
                        <div className="text-[8px] font-black text-slate-400 uppercase mb-1">Pending</div>
                        <div className="text-sm font-black text-red-500">{creditCustomers.length}</div>
                    </div>
                </div>

                {/* Credit Alert Section */}
                {totalCredit > 0 && (
                    <div className="bg-red-50 border border-red-100 rounded-3xl p-5 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                <span className="text-xl">💰</span>
                            </div>
                            <div>
                                <h3 className="font-black text-red-900 leading-tight">
                                    {creditCustomers.length} customers owe {formatMoney(totalCredit)}
                                </h3>
                                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-0.5">Payment Reminders Pending</p>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            {creditCustomers.slice(0, 3).map(cc => (
                                <div key={cc.id} className="flex items-center justify-between text-xs font-bold text-red-700 bg-white/40 p-2 rounded-lg">
                                    <span>{cc.name}</span>
                                    <span>{formatMoney(cc.creditAmount)}</span>
                                </div>
                            ))}
                        </div>

                        <button className="w-full bg-red-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-100 flex items-center justify-center gap-2">
                            <MessageSquare className="w-4 h-4" /> Send All Reminders
                        </button>
                    </div>
                )}

                {/* Customers List */}
                <div className="space-y-3 pt-2">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Registered Customers</h3>
                    <div className="space-y-3">
                        {filteredCustomers.map((c, idx) => (
                            <motion.div 
                                key={c.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={() => navigate(`/customer/${c.id}`)}
                                className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between active:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-50 to-emerald-100 text-primary font-black rounded-2xl flex items-center justify-center text-lg shadow-sm border border-emerald-50">
                                        {c.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-slate-800 leading-tight">{c.name}</span>
                                            {c.isVIP && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-400 tracking-wide mt-0.5">
                                            {c.phone} • Last: {c.lastVisit ? '2 days ago' : 'No visits'}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-black text-slate-400">{formatMoney(c.totalSpent || 0)}</div>
                                    {(c.creditAmount || 0) > 0 ? (
                                        <div className="mt-1 text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full uppercase">
                                            Owes {formatMoney(c.creditAmount)}
                                        </div>
                                    ) : (
                                        <div className="mt-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                                            No Dues ✅
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {filteredCustomers.length === 0 && (
                            <div className="p-12 text-center">
                                <Users className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold">No customers found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Add Button */}
            <button 
                onClick={() => navigate('/add-customer')}
                className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-transform z-40"
            >
                <UserPlus className="w-6 h-6" />
            </button>
        </div>
    );
};

export default CustomerBookScreen;
