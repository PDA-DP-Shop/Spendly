import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, Edit3, Star, ShoppingBag, 
    Banknote, Activity, MessageSquare, AlertCircle,
    ChevronRight, Phone
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
        <div className="p-12 text-center text-slate-400 font-bold">
            Customer not found
        </div>
    );

    const totalSpent = customerBills.reduce((sum, b) => sum + b.total, 0);
    const avgBill = customerBills.length > 0 ? totalSpent / customerBills.length : 0;

    const handleMarkAsPaid = async () => {
        await updateCustomer(customer.id, { creditAmount: 0 });
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="bg-white p-6 pb-4 flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-slate-50">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-800 font-black">
                    <ArrowLeft className="w-5 h-5" /> {customer.name}
                </button>
                <Edit3 className="w-5 h-5 text-slate-400" />
            </header>

            <div className="p-4 space-y-6">
                {/* Profile Card */}
                <div className="bg-white rounded-card p-8 border border-slate-100 shadow-sm text-center space-y-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-emerald-600 rounded-3xl flex items-center justify-center text-3xl text-white font-black mx-auto shadow-xl shadow-emerald-100">
                        {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 leading-tight">{customer.name}</h2>
                        <div className="flex items-center justify-center gap-2 mt-1">
                            <span className="text-xs font-bold text-slate-400">{customer.phone}</span>
                            {customer.isVIP && (
                                <span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                                    <Star className="w-2.5 h-2.5 fill-amber-500" /> VIP
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest pt-2">
                        Member since {formatDate(customer.createdAt || new Date(), 'short')}
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Visits</div>
                        <div className="text-sm font-black text-slate-800">{customerBills.length}</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Spent</div>
                        <div className="text-sm font-black text-primary">{formatMoney(totalSpent)}</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Avg Bill</div>
                        <div className="text-sm font-black text-slate-800">{formatMoney(avgBill)}</div>
                    </div>
                </div>

                {/* Credit Section */}
                {(customer.creditAmount || 0) > 0 && (
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-amber-50 border border-amber-100 p-6 rounded-card space-y-4"
                    >
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            <h3 className="text-sm font-black text-amber-900 leading-tight">
                                This customer owes {formatMoney(customer.creditAmount)}
                            </h3>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleMarkAsPaid}
                                className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest"
                            >
                                Mark as Paid
                            </button>
                            <button className="flex-1 bg-white border border-amber-200 text-amber-700 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                <MessageCircle className="w-4 h-4" /> Remind
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Action Row */}
                <div className="flex gap-3">
                    <button className="flex-1 bg-white border border-slate-100 p-4 rounded-2xl flex flex-col items-center gap-2 active:bg-slate-50">
                        <Phone className="w-5 h-5 text-primary" />
                        <span className="text-[10px] font-black uppercase text-slate-400">Call</span>
                    </button>
                    <button className="flex-1 bg-white border border-slate-100 p-4 rounded-2xl flex flex-col items-center gap-2 active:bg-slate-50">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        <span className="text-[10px] font-black uppercase text-slate-400">WhatsApp</span>
                    </button>
                    <button className="flex-1 bg-white border border-slate-100 p-4 rounded-2xl flex flex-col items-center gap-2 active:bg-slate-50">
                        <Banknote className="w-5 h-5 text-primary" />
                        <span className="text-[10px] font-black uppercase text-slate-400">Dues</span>
                    </button>
                </div>

                {/* Bill History */}
                <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bill History</h3>
                        <span className="text-[10px] font-bold text-slate-300 uppercase">{customerBills.length} Bills</span>
                    </div>
                    <div className="space-y-3">
                        {customerBills.map((bill, idx) => (
                            <motion.div 
                                key={bill.id}
                                onClick={() => navigate(`/bill/${bill.id}`)}
                                className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between active:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                        <ShoppingBag className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-black text-slate-800 text-sm leading-tight">{bill.billNumber}</div>
                                        <div className="text-[10px] font-bold text-slate-400 tracking-wide mt-0.5">
                                            {formatDate(bill.createdAt, 'short')} • {bill.items.length} items
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-black text-slate-900">{formatMoney(bill.total)}</div>
                                    <div className="mt-1 flex items-center justify-end">
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                            bill.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                            {bill.status}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {customerBills.length === 0 && (
                            <div className="p-8 text-center bg-white rounded-card border-2 border-dashed border-slate-100 flex flex-col items-center">
                                <ShoppingBag className="w-10 h-10 text-slate-100 mb-2" />
                                <p className="text-[10px] font-black text-slate-300 uppercase">No bills found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetailScreen;
