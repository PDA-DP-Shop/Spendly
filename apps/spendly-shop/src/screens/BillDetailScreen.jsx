import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, Share2, MoreVertical, Send, 
    FileText, CheckCircle2, Clock, SmartphoneNfc, 
    UserPlus, Banknote, MessageCircle, AlertCircle
} from 'lucide-react';

import { useBillStore } from '../store/billStore';
import { useShopStore } from '../store/shopStore';
import { formatMoney } from '../utils/formatMoney';
import { formatDate } from '../utils/formatDate';
import { generateBillPDF } from '../services/pdfGenerator';

const BillDetailScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { bills, updateBill } = useBillStore();
    const { shop } = useShopStore();

    const bill = bills.find(b => b.id === parseInt(id));

    if (!bill) return (
        <div className="p-12 text-center">
            <p className="text-slate-400 font-bold">Bill not found</p>
            <button onClick={() => navigate('/home')} className="mt-4 text-primary font-bold">Return Home</button>
        </div>
    );

    const handleDownloadPDF = () => {
        generateBillPDF(bill, shop);
    };

    const handleMarkAsPaid = async () => {
        await updateBill(bill.id, { status: 'paid' });
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <header className="bg-white p-6 pb-4 flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-slate-50">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-800 font-black">
                    <ArrowLeft className="w-5 h-5" /> Bill #{bill.billNumber}
                </button>
                <div className="flex gap-4">
                    <Share2 className="w-5 h-5 text-slate-400" />
                    <MoreVertical className="w-5 h-5 text-slate-400" />
                </div>
            </header>

            <div className="p-4 space-y-6">
                {/* Bill Card (Reusing preview style) */}
                <div className="bg-white rounded-card shadow-sm border border-slate-100 overflow-hidden opacity-90 grayscale-[20%]">
                    <div className="p-8 text-center border-b border-dashed border-slate-100">
                        <div className="text-4xl mb-2">{shop?.logoEmoji || '🏪'}</div>
                        <h2 className="text-lg font-black text-slate-900 leading-tight">{shop?.name || 'My Shop'}</h2>
                    </div>
                    
                    <div className="p-6 space-y-4">
                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                            <span>{bill.billNumber}</span>
                            <span>{formatDate(bill.createdAt)}</span>
                        </div>
                        
                        <div className="border-t border-slate-50 pt-4">
                            <table className="w-full text-xs font-bold">
                                <tbody>
                                    {bill.items.map((item, i) => (
                                        <tr key={i}>
                                            <td className="py-1 text-slate-600">{item.name} x {item.quantity}</td>
                                            <td className="py-1 text-right text-slate-900">{formatMoney(item.price * item.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="border-t-2 border-slate-50 pt-4 flex justify-between items-center">
                            <span className="text-lg font-black text-slate-900 leading-tight">TOTAL</span>
                            <span className="text-2xl font-black text-primary">{formatMoney(bill.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Main Action Buttons */}
                <div className="flex gap-3">
                    <button 
                        onClick={() => navigate(`/send-bill/${bill.id}`)}
                        className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
                    >
                        <Send className="w-4 h-4" /> Resend
                    </button>
                    <button 
                        onClick={handleDownloadPDF}
                        className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-center text-slate-600 active:bg-slate-50"
                    >
                        <FileText className="w-5 h-5" />
                    </button>
                    <button className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-center text-slate-600 active:bg-slate-50">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>

                {/* Status Timeline */}
                <div className="bg-white rounded-card p-6 border border-slate-100 shadow-sm space-y-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bill Status</h3>
                    
                    <div className="space-y-6 relative ml-2">
                        <div className="absolute left-[3px] top-2 bottom-2 w-0.5 bg-slate-100" />
                        
                        <div className="flex items-start gap-4 relative">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shadow-lg shadow-emerald-200" />
                            <div>
                                <div className="text-sm font-black text-slate-800">Bill Created</div>
                                <div className="text-[10px] font-bold text-slate-400">{formatDate(bill.createdAt, 'time')}</div>
                            </div>
                        </div>

                        {bill.status === 'sent' || bill.status === 'paid' ? (
                            <div className="flex items-start gap-4 relative">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
                                <div>
                                    <div className="text-sm font-black text-slate-800">Sent to Customer</div>
                                    <div className="text-[10px] font-bold text-slate-400">Via {bill.sentVia || 'QR Code'}</div>
                                </div>
                            </div>
                        ) : null}

                        {bill.status === 'paid' ? (
                            <div className="flex items-start gap-4 relative animate-bounce-in">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
                                <div>
                                    <div className="text-sm font-black text-slate-800">Payment Completed</div>
                                    <div className="text-[10px] font-bold text-slate-400">Marked as Paid</div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start gap-4 relative opacity-50">
                                <div className="w-2 h-2 rounded-full bg-slate-200 mt-1.5" />
                                <div>
                                    <div className="text-sm font-black text-slate-400">Awaiting Payment</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Credit Section (if status is not paid / credit logic) */}
                {bill.status !== 'paid' && (
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-amber-50 border border-amber-100 p-6 rounded-card space-y-4"
                    >
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            <h3 className="text-sm font-black text-amber-900 leading-tight">
                                {formatMoney(bill.total)} on credit
                            </h3>
                        </div>
                        <p className="text-xs font-bold text-amber-700">
                            Customer: {bill.customerName || 'Walk-in'}<br/>
                            Given on: {formatDate(bill.createdAt)}
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                            <button 
                                onClick={handleMarkAsPaid}
                                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-black text-sm active:scale-95 transition-transform"
                            >
                                Mark as Paid
                            </button>
                            <button className="w-full bg-white border border-amber-200 text-amber-700 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2">
                                <MessageCircle className="w-4 h-4" /> Send Reminder
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default BillDetailScreen;
