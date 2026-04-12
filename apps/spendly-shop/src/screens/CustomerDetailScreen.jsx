import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, Edit3, Star, ShoppingBag, 
    Banknote, Activity, MessageSquare, AlertCircle,
    ChevronRight, Phone, Crown, Calendar, 
    Smartphone, MessageCircle, BarChart2, X
} from 'lucide-react';

import { useCustomerStore } from '../store/customerStore';
import { useBillStore } from '../store/billStore';
import { formatMoney } from '../utils/formatMoney';
import { formatDate } from '../utils/formatDate';

const CustomerDetailScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { customers, updateCustomer } = useCustomerStore();
    const { bills, loadBills } = useBillStore();

    const customer = customers.find(c => c.id === parseInt(id));
    const customerBills = bills.filter(b => b.customerPhone === customer?.phone);

    useEffect(() => {
        loadBills();
    }, []);

    if (!customer) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <X className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-[24px] font-[800] text-black mb-2">Error</h2>
            <p className="text-[#94A3B8] font-[500] mb-8">Customer data not found.</p>
            <button onClick={() => navigate('/home')} className="bg-black text-white px-8 py-4 rounded-full font-[800]">Back to Home</button>
        </div>
    );

    const totalSpent = customerBills.reduce((sum, b) => sum + (b.total || 0), 0);
    const avgBill = customerBills.length > 0 ? totalSpent / customerBills.length : 0;

    const handleMarkAsPaid = async () => {
        await updateCustomer(customer.id, { creditAmount: 0 });
    };

    return (
        <div className="min-h-screen bg-white pb-32 relative overflow-x-hidden font-sans">
            <header className="bg-white/80 backdrop-blur-xl p-6 pb-4 flex items-center justify-between sticky top-0 z-40 border-b border-[#F1F5F9] shadow-sm">
                <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-black font-[800] tracking-tight active:scale-95 transition-transform group">
                    <div className="p-2 bg-[#F8FAFC] rounded-xl group-hover:bg-black group-hover:text-white transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                </button>
                <h1 className="text-[17px] font-[800] text-black tracking-tight">Customer Detail</h1>
                <div className="flex gap-4">
                    <button className="w-10 h-10 bg-[#F8FAFC] rounded-xl flex items-center justify-center text-[#64748B]">
                        <Edit3 className="w-4 h-4" />
                    </button>
                </div>
            </header>

            <div className="p-6 space-y-10">
                {/* Profile Card */}
                <div className="bg-[#F8FAFC] rounded-[32px] p-8 text-center space-y-6 relative overflow-hidden">
                    <div className="w-24 h-24 bg-white rounded-[24px] flex items-center justify-center text-[32px] font-[800] text-black mx-auto shadow-sm border border-[#F1F5F9]">
                        {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center justify-center gap-3">
                            <h2 className="text-[24px] font-[800] text-black tracking-tight leading-tight">{customer.name}</h2>
                            {customer.isVIP && (
                                <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
                            )}
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="text-[13px] font-[500] text-[#94A3B8] tracking-widest">{customer.phone}</span>
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-[10px] font-[800] text-[#CBD5E1] uppercase tracking-widest pt-2">
                        Member since {formatDate(customer.createdAt || new Date(), 'short')}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#F8FAFC] p-5 rounded-[24px] text-center border border-transparent shadow-sm">
                        <div className="text-[9px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-1.5 text-center">Visits</div>
                        <div className="text-[17px] font-[800] text-black tracking-tight">{customerBills.length}</div>
                    </div>
                    <div className="bg-[#F8FAFC] p-5 rounded-[24px] text-center border border-transparent shadow-sm">
                        <div className="text-[9px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-1.5 text-center">Total</div>
                        <div className="text-[17px] font-[800] text-black tracking-tight">{formatMoney(totalSpent)}</div>
                    </div>
                    <div className="bg-[#F8FAFC] p-5 rounded-[24px] text-center border border-transparent shadow-sm">
                        <div className="text-[9px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-1.5 text-center">Avg</div>
                        <div className="text-[17px] font-[800] text-black tracking-tight">{formatMoney(avgBill)}</div>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { icon: Phone, label: 'Call' },
                        { icon: MessageCircle, label: 'WhatsApp' },
                        { icon: MessageSquare, label: 'SMS' },
                        { icon: BarChart2, label: 'Stats' }
                    ].map(opt => (
                        <button 
                            key={opt.label}
                            className="bg-[#F8FAFC] p-5 rounded-[24px] flex flex-col items-center gap-2 transition-all active:bg-slate-100"
                        >
                            <opt.icon className="w-5 h-5 text-black" />
                            <span className="text-[8px] font-[800] uppercase tracking-widest text-[#94A3B8]">{opt.label}</span>
                        </button>
                    ))}
                </div>

                {/* History */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[12px] font-[800] text-black uppercase tracking-widest">History</h3>
                        <div className="text-[9px] font-[800] text-white bg-black px-3 py-1 rounded-full uppercase tracking-widest">{customerBills.length} Bills</div>
                    </div>
                    
                    <div className="space-y-4">
                        {customerBills.map((bill, idx) => (
                            <button 
                                key={bill.id}
                                onClick={() => navigate(`/bill/${bill.id}`)}
                                className="w-full bg-[#F8FAFC] p-6 rounded-[28px] flex items-center justify-between active:bg-slate-100 transition-all border border-transparent"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-black shadow-sm">
                                        <ShoppingBag className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-[800] text-black text-[16px] tracking-tight">{bill.billNumber}</div>
                                        <div className="text-[11px] font-[500] text-[#94A3B8] mt-1">
                                            {formatDate(bill.createdAt, 'short')} • {bill.items.length} Items
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[17px] font-[800] text-black tracking-tight">{formatMoney(bill.total)}</div>
                                </div>
                            </button>
                        ))}

                        {customerBills.length === 0 && (
                            <div className="p-16 text-center bg-[#F8FAFC] rounded-[32px] border-2 border-dashed border-[#F1F5F9]">
                                <Activity className="w-12 h-12 text-[#CBD5E1] opacity-50 mx-auto mb-6" />
                                <h3 className="text-[16px] font-[800] text-black">No History</h3>
                                <p className="text-[#94A3B8] font-medium text-sm mt-1">No orders yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetailScreen;
