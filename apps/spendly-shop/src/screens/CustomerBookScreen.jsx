import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, UserPlus, Users, Star, 
  AlertCircle, ChevronRight, ArrowLeft,
  Phone, MessageSquare, CreditCard,
  Crown
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
        <div className="min-h-screen bg-white pb-32 relative overflow-x-hidden font-sans">
            <header className="bg-white/80 backdrop-blur-xl p-6 pb-4 flex items-center justify-between sticky top-0 z-40 border-b border-[#F1F5F9] shadow-sm">
                <button onClick={() => navigate('/home')} className="flex items-center gap-3 text-black font-[800] tracking-tight active:scale-95 transition-transform group">
                    <div className="p-2 bg-[#F8FAFC] rounded-xl group-hover:bg-black group-hover:text-white transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="text-[17px]">Client Registry</span>
                </button>
                <div className="flex gap-4">
                    <button onClick={() => navigate('/add-customer')} className="w-10 h-10 bg-[#F8FAFC] rounded-xl flex items-center justify-center text-black">
                        <UserPlus className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="p-6 space-y-10">
                {/* Search */}
                <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#CBD5E1]" />
                    <input 
                        className="w-full bg-[#F8FAFC] border border-transparent p-5 pl-14 rounded-[24px] outline-none focus:border-[#F1F5F9] focus:shadow-sm transition-all font-[700] text-black placeholder:text-[#CBD5E1] text-[15px]"
                        placeholder="Search clients..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#F8FAFC] p-5 rounded-[28px] text-center border border-transparent">
                        <div className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-1.5">Portfolio</div>
                        <div className="text-[18px] font-[800] text-black tracking-tight">{customers.length}</div>
                    </div>
                    <div className="bg-[#F8FAFC] p-5 rounded-[28px] text-center border border-transparent">
                        <div className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-1.5">Elite</div>
                        <div className="text-[18px] font-[800] text-black tracking-tight">{vipCount}</div>
                    </div>
                    <div className="bg-[#F8FAFC] p-5 rounded-[28px] text-center border border-transparent">
                        <div className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-1.5">Credit</div>
                        <div className="text-[18px] font-[800] text-black tracking-tight">{creditCustomers.length}</div>
                    </div>
                </div>

                {/* Credit Exposure */}
                {totalCredit > 0 && (
                    <div className="bg-black rounded-[32px] p-8 text-white shadow-xl space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
                        
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-[18px] font-[800] tracking-tight">{formatMoney(totalCredit)}</h3>
                                <p className="text-[11px] font-[800] text-white/40 uppercase tracking-widest mt-1">Pending Dues</p>
                            </div>
                        </div>
                        
                        <div className="space-y-3 relative z-10">
                            {creditCustomers.slice(0, 2).map(cc => (
                                <div key={cc.id} className="flex items-center justify-between text-[11px] font-[800] text-white/60 bg-white/5 p-4 rounded-xl">
                                    <span>{cc.name}</span>
                                    <span className="text-white">{formatMoney(cc.creditAmount)}</span>
                                </div>
                            ))}
                        </div>

                        <button 
                            className="w-full h-14 bg-white text-black rounded-full font-[800] text-[12px] uppercase tracking-widest flex items-center justify-center gap-3 transition-transform active:scale-95"
                        >
                            <MessageCircle className="w-5 h-5" /> Send Reminders
                        </button>
                    </div>
                )}

                {/* Client List */}
                <div className="space-y-6">
                    <h3 className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-widest px-2">Recent Clients</h3>
                    <div className="space-y-4">
                        {filteredCustomers.map((c, idx) => (
                            <button 
                                key={c.id}
                                onClick={() => navigate(`/customer/${c.id}`)}
                                className="w-full bg-[#F8FAFC] p-6 rounded-[32px] flex justify-between items-center group active:bg-slate-100 transition-all border border-transparent"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[22px] font-[800] text-black shadow-sm border border-[#F1F5F9]">
                                        {c.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-left">
                                        <div className="flex items-center gap-3">
                                            <span className="font-[800] text-black text-[16px] tracking-tight">{c.name}</span>
                                            {c.isVIP && (
                                                <div className="p-1 px-2 bg-amber-50 rounded-full flex items-center gap-1 border border-amber-100">
                                                    <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                            <Phone className="w-3 h-3" /> {c.phone}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1.5">
                                    <div className="text-[15px] font-[800] text-black tracking-tight">{formatMoney(c.totalSpent || 0)}</div>
                                    {(c.creditAmount || 0) > 0 && (
                                        <div className="text-[9px] font-[800] text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full uppercase tracking-widest border border-rose-100">
                                            -{formatMoney(c.creditAmount)}
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}

                        {filteredCustomers.length === 0 && (
                            <div className="p-20 text-center bg-[#F8FAFC] rounded-[44px] border-2 border-dashed border-[#F1F5F9]">
                                <Users className="w-12 h-12 text-[#CBD5E1] opacity-50 mx-auto mb-4" />
                                <h3 className="text-[18px] font-[800] text-black">Registry Empty</h3>
                                <p className="text-[#94A3B8] font-medium text-sm mt-1">No clients found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Fab */}
            <button 
                onClick={() => navigate('/add-customer')}
                className="fixed bottom-10 right-10 w-20 h-20 bg-black text-white rounded-full shadow-2xl flex items-center justify-center z-[90] border-4 border-white transition-transform active:scale-95"
            >
                <UserPlus className="w-8 h-8" strokeWidth={2.5} />
            </button>
        </div>
    );
};

export default CustomerBookScreen;
