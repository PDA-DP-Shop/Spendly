import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, Share2, MoreVertical, Send, 
    FileText, CheckCircle2, Clock, SmartphoneNfc, 
    UserPlus, Banknote, MessageCircle, AlertCircle,
    Download, Printer, Trash2, X
} from 'lucide-react';

import { useBillStore } from '../store/billStore';
import { useShopStore } from '../store/shopStore';
import { useSettingsStore } from '../store/settingsStore';
import { formatMoney } from '../utils/formatMoney';
import { formatDate } from '../utils/formatDate';
import { generateBillPDF } from '../services/pdfGenerator';
import { parseBillNumber } from '../utils/billNumber';


const BillDetailScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { bills, updateBill, deleteBill } = useBillStore();
    const { shop } = useShopStore();
    const { settings } = useSettingsStore();
    const currency = settings?.currency || 'USD';

    const bill = bills.find(b => b.id === parseInt(id));

    const isExpired = React.useMemo(() => {
        if (!bill?.createdAt) return false;
        const created = new Date(bill.createdAt).getTime();
        const now = new Date().getTime();
        const diff = (now - created) / (1000 * 60);
        return diff > 10;
    }, [bill?.createdAt]);

    if (!bill) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <X className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-[24px] font-[800] text-black mb-2">Error</h2>
            <p className="text-[#94A3B8] font-[500] mb-8">Bill could not be found.</p>
            <button onClick={() => navigate('/home')} className="bg-black text-white px-8 py-4 rounded-full font-[800]">Return Home</button>
        </div>
    );

    const handleDownloadPDF = () => {
        generateBillPDF(bill, shop);
    };

    const handleMarkAsPaid = async () => {
        await updateBill(bill.id, { status: 'paid' });
    };

    const handleDeleteBill = async () => {
        if (window.confirm('Move this bill to Recycle Bin? It will be stored for 3 days.')) {
            await deleteBill(bill.id);
            navigate('/bills-history');
        }
    };

    return (
        <div className="min-h-dvh bg-white pb-tab relative overflow-x-hidden font-sans">
            <header className="bg-white/80 backdrop-blur-xl p-6 pb-4 flex items-center justify-between sticky top-0 z-40 border-b border-[#F1F5F9] shadow-sm">
                <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-black font-[800] tracking-tight active:scale-95 transition-transform group">
                    <div className="p-2 bg-[#F8FAFC] rounded-xl group-hover:bg-black group-hover:text-white transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="text-[17px]">Invoice Details</span>
                </button>
                <div className="flex items-center gap-2">
<<<<<<< HEAD
=======
                    {!isExpired && (
                        <button 
                            onClick={() => navigate('/create-bill', { state: { editBill: bill } })}
                            className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 active:bg-indigo-100 transition-all shadow-sm border border-indigo-100"
                            title="Edit Bill"
                        >
                            <FileText className="w-5 h-5" />
                        </button>
                    )}
>>>>>>> 41f113d (upgrade scanner)
                    <button 
                        onClick={handleDeleteBill}
                        className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 active:bg-red-100 transition-all shadow-sm border border-red-100"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 bg-[#F8FAFC] rounded-xl flex items-center justify-center text-[#94A3B8] shadow-sm border border-[#F1F5F9]">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="p-6 space-y-8">
                {/* Invoice Card */}
                <div className="bg-white rounded-[32px] border border-[#F1F5F9] shadow-sm overflow-hidden relative">
                    <div className="p-10 text-center space-y-4 bg-[#F8FAFC] border-b border-[#F1F5F9]">
                        <div className="w-20 h-20 bg-white rounded-[24px] shadow-sm border border-[#F1F5F9] flex items-center justify-center text-[36px] mx-auto">
                            {shop?.logoEmoji || '🏪'}
                        </div>
                        <div>
                            <h2 className="text-[24px] font-[800] text-black tracking-tight">{shop?.name || 'Shop Name'}</h2>
                            <p className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest mt-2">{bill.billNumber}</p>
                        </div>
                    </div>

                    <div className="p-10 space-y-8">
                        <div className="bg-[#F8FAFC] rounded-[24px] p-6 border border-[#F1F5F9] text-center">
                            <h3 className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-3">Unique Bill Identifier</h3>
                            {(() => {
                                const parsed = parseBillNumber(bill.billNumber);
                                if (!parsed) return <div className="text-[17px] font-[800] tracking-tight">{bill.billNumber}</div>;
                                return (
                                    <div className="flex items-center justify-center gap-1.5 flex-wrap text-[15px] font-[900] tracking-tight font-mono bg-white p-4 rounded-[16px] shadow-sm">
                                        <span className="text-[#8B5CF6]">{parsed.shopCode}</span>
                                        <span className="text-[#CBD5E1]">-</span>
                                        <span className="text-[#94A3B8]">{parsed.date}</span>
                                        <span className="text-[#CBD5E1]">-</span>
                                        <span className="text-black">{parsed.sequence}</span>
                                        <span className="text-[#CBD5E1]">-</span>
                                        <span className="text-[#F97316]">{parsed.random}</span>
                                    </div>
                                )
                            })()}
                        </div>

                        <div className="flex justify-between items-center text-[11px] font-[800] uppercase tracking-widest text-[#94A3B8]">
                            <div>Processed</div>
                            <div className="text-right">Date & Time</div>
                        </div>
                        <div className="flex justify-between items-center text-[15px] font-[800] text-black">
                            <div className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> Success</div>
                            <div className="text-right">{formatDate(bill.createdAt, 'short')}</div>
                        </div>

                        <div className="space-y-4">
                            <div className="h-px bg-[#F1F5F9]" />
                            <table className="w-full text-sm font-[800]">
                                <thead>
                                    <tr className="text-[10px] font-[800] text-[#CBD5E1] uppercase tracking-widest border-b border-[#F1F5F9]">
                                        <th className="text-left pb-4">Item</th>
                                        <th className="text-center pb-4">Qty</th>
                                        <th className="text-right pb-4">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bill.items.map((item, i) => (
                                        <tr key={i} className="border-b border-[#F1F5F9]/50">
                                            <td className="py-4 text-black text-[15px]">{item.name}</td>
                                            <td className="py-4 text-center text-[#94A3B8]">{item.quantity}</td>
                                            <td className="py-4 text-right text-black font-[800]">{formatMoney(item.price * item.quantity, currency)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="pt-4 space-y-4">
                            <div className="flex justify-between items-center text-[#94A3B8] text-[15px] font-[800]">
                                <span>Subtotal</span>
                                <span>{formatMoney(bill.subtotal || bill.total, currency)}</span>
                            </div>
                            {bill.gstAmount > 0 && (
                                <div className="flex justify-between items-center text-black text-[15px] font-[800]">
                                    <span>GST ({bill.gstPercent}%)</span>
                                    <span>+{formatMoney(bill.gstAmount, currency)}</span>
                                </div>
                            )}
                            {bill.discountAmount > 0 && (
                                <div className="flex justify-between items-center text-[#EF4444] text-[15px] font-[800]">
                                    <span>Discount</span>
                                    <span>-{formatMoney(bill.discountAmount, currency)}</span>
                                </div>
                            )}
                            <div className="pt-4 border-t border-[#F1F5F9] flex justify-between items-end">
                                <span className="text-[12px] font-[800] text-black uppercase tracking-widest">Total Amount</span>
                                <span className="text-[36px] font-[800] text-black tracking-tight">{formatMoney(bill.total, currency)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-4 gap-3">
                    <button 
                        onClick={() => navigate(`/send-bill/${bill.id}`)}
                        className="col-span-2 bg-black text-white rounded-[24px] h-[72px] font-[800] text-[15px] flex items-center justify-center gap-3 shadow-lg active:bg-slate-900 transition-all font-sans"
                    >
                        <Send className="w-5 h-5 text-white/50" /> Send Invoice
                    </button>
                    <button 
                        onClick={handleDownloadPDF}
                        className="bg-[#F8FAFC] rounded-[24px] flex flex-col items-center justify-center gap-2 text-[#94A3B8] h-[72px] active:bg-slate-100 transition-all"
                    >
                        <Download className="w-5 h-5" />
                        <span className="text-[9px] font-[800] uppercase tracking-widest">PDF</span>
                    </button>
                    <button 
                        className="bg-[#F8FAFC] rounded-[24px] flex flex-col items-center justify-center gap-2 text-[#94A3B8] h-[72px] active:bg-slate-100 transition-all"
                    >
                        <Printer className="w-5 h-5" />
                        <span className="text-[9px] font-[800] uppercase tracking-widest">Print</span>
                    </button>
                </div>

                {/* Timeline */}
                <div className="bg-[#F8FAFC] rounded-[32px] p-8 space-y-8 border border-transparent">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[12px] font-[800] text-black uppercase tracking-widest">Tracking</h3>
                        <div className={`text-[10px] font-[800] uppercase px-3 py-1 rounded-full tracking-widest ${
                            bill.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                            {bill.status} Status
                        </div>
                    </div>
                    
                    <div className="space-y-8 relative ml-4">
                        <div className="absolute left-0 top-2 bottom-2 w-px bg-[#F1F5F9]" />
                        
                        <div className="flex items-start gap-5 relative">
                            <div className="w-2.5 h-2.5 rounded-full bg-black -ml-[5px]" />
                            <div>
                                <div className="text-[15px] font-[800] text-black tracking-tight leading-none">Created</div>
                                <div className="text-[11px] font-[500] text-[#94A3B8] mt-1.5">{formatDate(bill.createdAt, 'time')} • Invoice ready</div>
                            </div>
                        </div>

                        <div className="flex items-start gap-5 relative">
                            <div className={`w-2.5 h-2.5 rounded-full -ml-[5px] ${bill.status === 'sent' || bill.status === 'paid' ? 'bg-black' : 'bg-[#CBD5E1]'}`} />
                            <div>
                                <div className={`text-[15px] font-[800] tracking-tight leading-none ${bill.status === 'sent' || bill.status === 'paid' ? 'text-black' : 'text-[#CBD5E1]'}`}>Sent</div>
                                <div className="text-[11px] font-[500] text-[#94A3B8] mt-1.5">Delivered via Digital Link</div>
                            </div>
                        </div>

                        <div className="flex items-start gap-5 relative">
                            <div className={`w-2.5 h-2.5 rounded-full -ml-[5px] ${bill.status === 'paid' ? 'bg-black' : 'bg-[#CBD5E1]'}`} />
                            <div>
                                <div className={`text-[15px] font-[800] tracking-tight leading-none ${bill.status === 'paid' ? 'text-black' : 'text-[#CBD5E1]'}`}>Settled</div>
                                <div className="text-[11px] font-[500] text-[#94A3B8] mt-1.5">{bill.status === 'paid' ? 'Payment Confirmed' : 'Waiting for payment'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {bill.status !== 'paid' && !isExpired && (
                    <div className="bg-[#FEF2F2] p-8 rounded-[32px] space-y-6">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-[#EF4444]" />
                            <h3 className="text-[17px] font-[800] text-[#991B1B] tracking-tight">Pending Payment</h3>
                        </div>
                        <p className="text-[13px] font-[500] text-[#B91C1C] opacity-80 uppercase tracking-widest">
                            {formatMoney(bill.total, currency)} Outstanding
                        </p>
                        <button 
                            onClick={handleMarkAsPaid}
                            className="w-full h-16 bg-[#EF4444] text-white rounded-full font-[800] text-[15px] active:bg-red-700 transition-all shadow-md"
                        >
                            Mark as Paid
                        </button>
                    </div>
                )}

                {isExpired && (
                    <div className="bg-slate-50 p-8 rounded-[32px] flex items-center gap-4 border border-slate-100">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-[14px] font-[800] text-slate-600">Bill Locked</h3>
                            <p className="text-[11px] font-[500] text-slate-400 uppercase tracking-widest">Editing period (10m) has ended</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BillDetailScreen;
