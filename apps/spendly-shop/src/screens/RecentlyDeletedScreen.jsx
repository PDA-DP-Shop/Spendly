import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Trash2, RotateCcw, AlertCircle, Info, Clock, Receipt } from 'lucide-react';
import { softDeleteBillService } from '../services/softDeleteService';
import { useBillStore } from '../store/billStore';

const S = { fontFamily: "'Inter', sans-serif" };

const DeletedBillsScreen = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { restoreBill } = useBillStore();

    const loadItems = async () => {
        setLoading(true);
        const data = await softDeleteBillService.getDeletedBills();
        setItems(data);
        setLoading(false);
    };

    useEffect(() => {
        loadItems();
    }, []);

    const handleRestore = async (originalId) => {
        await restoreBill(originalId);
        setItems(prev => prev.filter(i => i.originalId !== originalId));
    };

    const formatRemaining = (ms) => {
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (days > 0) return `${days}d ${hours}h remaining`;
        return `${hours}h remaining`;
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans select-none" style={S}>
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl px-6 pt-12 pb-6 border-b border-[#F1F5F9] flex items-center gap-4">
                <button 
                  onClick={() => navigate(-1)}
                  className="w-12 h-12 rounded-full bg-[#F8FAFC] border border-[#F1F5F9] flex items-center justify-center active:scale-90 transition-transform"
                >
                    <ChevronLeft className="w-6 h-6 text-black" strokeWidth={2.5} />
                </button>
                <div>
                    <h1 className="text-[22px] font-[900] text-black tracking-tight">Recycle Bin</h1>
                    <p className="text-[12px] font-[700] text-[#94A3B8] uppercase tracking-wider mt-0.5">Recently Deleted Bills</p>
                </div>
            </header>

            <main className="flex-grow p-6">
                <div className="bg-[#F8FAFC] rounded-[28px] p-6 mb-8 flex gap-4 border border-[#F1F5F9]">
                    <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center flex-shrink-0">
                        <Info className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-[14px] font-[500] text-[#64748B] leading-relaxed">
                        Deleted bills stay here for 3 days. After that, they are permanently removed from the terminal database.
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 opacity-20">
                        <div className="w-12 h-12 rounded-full border-4 border-black border-t-transparent animate-spin mb-4" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 bg-[#F8FAFC] rounded-[32px] flex items-center justify-center mb-6">
                            <Receipt className="w-10 h-10 text-[#CBD5E1]" />
                        </div>
                        <h3 className="text-[18px] font-[800] text-black tracking-tight">No Deleted Bills</h3>
                        <p className="text-[14px] font-[500] text-[#94A3B8] mt-2 max-w-[240px]">
                            Bills you delete will appear here for 3 days before permanent removal.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {items.map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white border border-[#F1F5F9] rounded-[32px] p-6 shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-[#F8FAFC] rounded-2xl flex items-center justify-center">
                                                <Trash2 className="w-6 h-6 text-[#CBD5E1]" />
                                            </div>
                                            <div>
                                                <p className="text-[14px] font-[800] text-[#94A3B8] line-through uppercase tracking-wider">
                                                    #{item.billNumber}
                                                </p>
                                                <p className="text-[20px] font-[900] text-black tracking-tight">
                                                    ₹{item.total || 0}
                                                </p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleRestore(item.originalId)}
                                            className="bg-black text-white px-6 h-12 rounded-full text-[13px] font-[800] flex items-center gap-2 shadow-lg"
                                        >
                                            <RotateCcw className="w-4 h-4" strokeWidth={3} />
                                            Restore
                                        </motion.button>
                                    </div>
                                    
                                    <div className="flex items-center justify-between pt-5 border-t border-[#F1F5F9]">
                                        <div className="flex items-center gap-2 text-orange-600">
                                            <Clock className="w-4 h-4" strokeWidth={2.5} />
                                            <span className="text-[12px] font-[800] uppercase tracking-wider">
                                                {formatRemaining(item.remainingMs)}
                                            </span>
                                        </div>
                                        <span className="text-[12px] font-[700] text-[#CBD5E1] uppercase tracking-widest">
                                            Deleted {new Date(item.deletedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DeletedBillsScreen;
