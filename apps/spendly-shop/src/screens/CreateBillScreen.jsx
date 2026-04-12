import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, User, Phone, Package, Plus, Minus, 
  Trash2, X, Percent, Calculator, MessageSquare,
  ChevronDown, Search, ArrowRight, Wallet, CreditCard as CardIcon,
  ShoppingBag
} from 'lucide-react';

import { useBillStore } from '../store/billStore';
import { useCustomerStore } from '../store/customerStore';
import { useItemsStore } from '../store/itemsStore';
import { useShopStore } from '../store/shopStore';
import { formatMoney } from '../utils/formatMoney';
import { generateQRData } from '../utils/qrCode';
import * as Calc from '../utils/calculateBill';

const CreateBillScreen = () => {
    const navigate = useNavigate();
    const { saveBill, bills } = useBillStore();
    const { customers, loadCustomers } = useCustomerStore();
    const { items, loadItems, getMostUsedItems } = useItemsStore();
    const { shop } = useShopStore();

    const [customer, setCustomer] = useState({ name: '', phone: '' });
    const [billItems, setBillItems] = useState([{ id: Date.now(), name: '', price: 0, quantity: 1 }]);
    const [gstEnabled, setGstEnabled] = useState(false);
    const [gstRate, setGstRate] = useState(18);
    const [discountEnabled, setDiscountEnabled] = useState(false);
    const [discountType, setDiscountType] = useState('percentage'); 
    const [discountValue, setDiscountValue] = useState(0);
    const [roundOffEnabled, setRoundOffEnabled] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        loadCustomers();
        loadItems();
    }, []);

    // We no longer rely on 'nextBillNumber' hook for creating sequences iteratively.
    // Instead, it is dynamically uniquely generated on actual creation block context.
    const [previewBillNumber, setPreviewBillNumber] = useState('Generating...');
    
    useEffect(() => {
       const initialQR = generateQRData({ shopId: shop?.id, shopName: shop?.name });
       setPreviewBillNumber(initialQR.billNumber);
    }, [shop]);

    const recentCustomers = customers.slice(0, 5);
    const quickItems = getMostUsedItems(8);

    const subtotal = Calc.calculateSubtotal(billItems);
    const gstAmount = gstEnabled ? Calc.calculateGST(subtotal, gstRate) : 0;
    const discountAmount = discountEnabled ? Calc.calculateDiscount(subtotal, discountType, discountValue) : 0;
    const tempTotal = subtotal + gstAmount - discountAmount;
    const roundOff = roundOffEnabled ? Calc.calculateRoundOff(tempTotal) : 0;
    const finalTotal = subtotal + gstAmount - discountAmount + roundOff;

    const addItem = (item = null) => {
        if (item) {
            // Remove any blank placeholder rows first, then add the real item
            setBillItems(prev => {
                const withoutBlanks = prev.filter(i => i.name || i.price > 0)
                return [...withoutBlanks, { ...item, id: Date.now(), quantity: 1 }]
            })
        } else {
            setBillItems(prev => [...prev, { id: Date.now(), name: '', price: 0, quantity: 1 }])
        }
    };

    const updateItem = (id, field, value) => {
        setBillItems(billItems.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const removeItem = (id) => {
        if (billItems.length > 1) {
            setBillItems(billItems.filter(item => item.id !== id));
        } else {
            setBillItems([{ id: Date.now(), name: '', price: 0, quantity: 1 }]);
        }
    };

    const handleCreateBill = async () => {
        // Only submit filled items — ignore blank/placeholder rows
        const validItems = billItems.filter(i => i.name && i.price > 0)
        if (validItems.length === 0) return

        const {
            billNumber,
            billId,
            qrString,
            qrData
        } = generateQRData({
            shopId: shop?.id,
            shopName: shop?.name || 'Spendly Shop',
            shopAddress: shop?.address,
            items: validItems,
            subtotal,
            tax: gstAmount,
            total: finalTotal,
            paymentMethod: paymentMethod,
            cashierId: null // or customer.user?
        })

        const billData = {
            billId: billId,
            billNumber: billNumber,
            customerName: customer.name,
            customerPhone: customer.phone,
            items: validItems,
            subtotal,
            gstPercent: gstEnabled ? gstRate : 0,
            gstAmount,
            discountType: discountEnabled ? discountType : 'none',
            discountValue: discountEnabled ? discountValue : 0,
            discountAmount,
            roundOff,
            total: finalTotal,
            paymentMethod,
            status: 'paid',
            notes,
            qrString: qrString,
            createdAt: new Date().toISOString()
        };

        const id = await saveBill(billData);
        navigate(`/send-bill/${id}`, { state: { billData } });
    };

    // Valid when at least one filled item exists (blank/unfilled rows are filtered on submit)
    const filledItems = billItems.filter(i => i.name && i.price > 0)
    const isValid = filledItems.length > 0;

    return (
        <div className="min-h-screen bg-white pb-44 overflow-x-hidden relative font-sans">
            <header className="bg-white/80 backdrop-blur-xl p-6 pb-4 flex items-center justify-between sticky top-0 z-40 border-b border-[#F1F5F9] shadow-sm">
                <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-black font-[800] tracking-tight active:scale-95 transition-transform group">
                    <div className="p-2 bg-[#F8FAFC] rounded-xl group-hover:bg-black group-hover:text-white transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                </button>
                <div className="text-right">
                    <div className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-0.5">{previewBillNumber}</div>
                    <div className="text-[17px] font-[800] text-black leading-tight">Create Bill</div>
                </div>
            </header>

            <div className="p-6 space-y-8">
                {/* Section: Customer */}
                <section className="bg-[#F8FAFC] rounded-[32px] p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-5 bg-black rounded-full" />
                        <h3 className="text-[12px] font-[800] text-black uppercase tracking-widest">Customer</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-white rounded-[24px] p-5 border border-transparent focus-within:border-[#F1F5F9] focus-within:shadow-sm transition-all">
                            <User className="w-5 h-5 text-[#CBD5E1]" />
                            <input 
                                className="bg-transparent w-full outline-none font-[700] text-black text-[16px] placeholder:text-[#CBD5E1]"
                                placeholder="Customer Name"
                                value={customer.name}
                                onChange={e => setCustomer({...customer, name: e.target.value})}
                            />
                        </div>
                        <div className="flex items-center gap-4 bg-white rounded-[24px] p-5 border border-transparent focus-within:border-[#F1F5F9] focus-within:shadow-sm transition-all">
                            <Phone className="w-5 h-5 text-[#CBD5E1]" />
                            <input 
                                className="bg-transparent w-full outline-none font-[700] text-black text-[16px] placeholder:text-[#CBD5E1]"
                                placeholder="Phone Number"
                                type="tel"
                                value={customer.phone}
                                onChange={e => setCustomer({...customer, phone: e.target.value})}
                            />
                        </div>
                    </div>

                    {recentCustomers.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-2 px-2">
                            {recentCustomers.map(rc => (
                                <button 
                                    key={rc.id}
                                    onClick={() => setCustomer({ name: rc.name, phone: rc.phone })}
                                    className="bg-white border border-[#F1F5F9] rounded-full px-5 py-2 text-[11px] font-[700] text-[#64748B] whitespace-nowrap active:bg-black active:text-white transition-all shadow-sm"
                                >
                                    {rc.name}
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                {/* Section: Items */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-5 bg-black rounded-full" />
                            <h3 className="text-[12px] font-[800] text-black uppercase tracking-widest">Items</h3>
                        </div>
                        <button 
                            onClick={() => addItem()} 
                            className="bg-black py-3 px-6 rounded-2xl text-white shadow-lg flex items-center gap-2 active:scale-95 transition-transform"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="text-[13px] font-[800]">Add Item</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence initial={false}>
                            {billItems.map((bi) => (
                                <motion.div 
                                    key={bi.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-[#F8FAFC] rounded-[28px] p-6 space-y-5 relative"
                                >
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex-1 flex items-center gap-4 bg-white rounded-[20px] p-4 border border-[#F1F5F9]/50 focus-within:border-[#F1F5F9] transition-all">
                                            <Package className="w-5 h-5 text-[#CBD5E1]" />
                                            <input 
                                                className="bg-transparent w-full outline-none font-[700] text-black text-[16px] placeholder:text-[#CBD5E1]"
                                                placeholder="Item Name"
                                                value={bi.name}
                                                onChange={e => updateItem(bi.id, 'name', e.target.value)}
                                            />
                                        </div>
                                        <button onClick={() => removeItem(bi.id)} className="p-4 text-[#CBD5E1] active:text-red-500 transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-[#F1F5F9] shadow-sm">
                                            <button onClick={() => updateItem(bi.id, 'quantity', Math.max(0.5, bi.quantity - 1))} className="w-10 h-10 bg-[#F8FAFC] rounded-full text-slate-400 flex items-center justify-center active:bg-slate-200"><Minus className="w-4 h-4" /></button>
                                            <div className="w-10 text-center font-[800] text-[16px] text-black">{bi.quantity}</div>
                                            <button onClick={() => updateItem(bi.id, 'quantity', bi.quantity + 1)} className="w-10 h-10 bg-black rounded-full text-white flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                                        </div>

                                        <div className="flex items-center bg-white rounded-[20px] px-5 h-12 border border-[#F1F5F9]/50 focus-within:border-[#F1F5F9] w-32 shadow-sm">
                                            <span className="text-[#CBD5E1] font-[800] mr-2 text-[15px]">₹</span>
                                            <input 
                                                type="number" 
                                                className="bg-transparent w-full outline-none font-[800] text-black text-right text-[16px]"
                                                value={bi.price || ''}
                                                onChange={e => updateItem(bi.id, 'price', parseFloat(e.target.value) || 0)}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </section>

                {/* Quick Add */}
                <section className="space-y-4">
                    <h3 className="text-[12px] font-[800] text-black uppercase tracking-widest px-2">Quick Add</h3>
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
                        {quickItems.map(qi => (
                            <button
                                key={qi.id}
                                onClick={() => addItem({ name: qi.name, price: qi.price })}
                                className="flex-shrink-0 bg-[#F8FAFC] rounded-[24px] p-5 flex flex-col items-center min-w-[124px] active:bg-slate-100 transition-all border border-transparent"
                            >
                                <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center text-[22px] mb-3 shadow-sm border border-[#F1F5F9]">
                                    📦
                                </div>
                                <div className="text-[13px] font-[800] text-black tracking-tight">{qi.name}</div>
                                <div className="text-[11px] font-[700] text-[#94A3B8] mt-1">{formatMoney(qi.price)}</div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Bill Summary */}
                <section className="bg-black rounded-[32px] p-8 text-white shadow-2xl space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16" />
                    
                    <div className="space-y-5 relative z-10">
                        <div className="flex items-center justify-between opacity-40">
                            <span className="text-[11px] font-[800] uppercase tracking-widest">Subtotal</span>
                            <span className="font-[800] text-[16px]">{formatMoney(subtotal)}</span>
                        </div>

                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-[11px] font-[800] uppercase tracking-widest opacity-40">Add GST</div>
                                    <button onClick={() => setGstEnabled(!gstEnabled)} className={`w-11 h-6 rounded-full p-1 transition-colors ${gstEnabled ? 'bg-white' : 'bg-white/10'}`}>
                                        <div className={`w-4 h-4 rounded-full transition-transform ${gstEnabled ? 'bg-black translate-x-5' : 'bg-white/40 translate-x-0'}`} />
                                    </button>
                                </div>
                                {gstEnabled && <span className="font-[800] text-[16px] text-white">+{formatMoney(gstAmount)}</span>}
                            </div>
                            {gstEnabled && (
                                <div className="flex gap-2 overflow-x-auto py-1 scrollbar-hide">
                                    {[0, 5, 12, 18, 28].map(rate => (
                                        <button 
                                            key={rate} 
                                            onClick={() => setGstRate(rate)} 
                                            className={`px-4 py-2 rounded-xl text-[10px] font-[900] transition-all whitespace-nowrap ${
                                                gstRate === rate ? 'bg-white text-black scale-105' : 'bg-white/10 text-white/40'
                                            }`}
                                        >
                                            {rate}%
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-[11px] font-[800] uppercase tracking-widest opacity-40">Discount</div>
                                    <button onClick={() => setDiscountEnabled(!discountEnabled)} className={`w-11 h-6 rounded-full p-1 transition-colors ${discountEnabled ? 'bg-white' : 'bg-white/10'}`}>
                                        <div className={`w-4 h-4 rounded-full transition-transform ${discountEnabled ? 'bg-black translate-x-5' : 'bg-white/40 translate-x-0'}`} />
                                    </button>
                                </div>
                                {discountEnabled && <span className="font-[800] text-[16px] text-rose-400">-{formatMoney(discountAmount)}</span>}
                            </div>
                            {discountEnabled && (
                                <div className="flex items-center bg-white/10 rounded-2xl px-5 h-12 border border-white/5">
                                    <span className="text-white/30 font-[900] mr-2 text-[13px]">% Discount</span>
                                    <input 
                                        type="number" 
                                        className="bg-transparent w-full outline-none font-[900] text-white text-right text-[16px] placeholder:text-white/20"
                                        value={discountValue || ''}
                                        onChange={e => setDiscountValue(parseFloat(e.target.value) || 0)}
                                        placeholder="0"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/10 flex items-center justify-between relative z-10">
                        <div className="text-[12px] font-[800] uppercase tracking-widest opacity-30">Grand Total</div>
                        <div className="text-[36px] font-[800] tracking-tight">{formatMoney(finalTotal)}</div>
                    </div>
                </section>

                {/* Payment Method */}
                <section className="space-y-6 pb-10">
                    <h3 className="text-[12px] font-[800] text-black uppercase tracking-widest px-2">Payment Mode</h3>
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { id: 'upi', label: 'Online', emoji: '📱' },
                            { id: 'cash', label: 'Cash', emoji: '💵' },
                            { id: 'card', label: 'Card', emoji: '💳' },
                            { id: 'credit', label: 'Credit', emoji: '🔖' }
                        ].map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setPaymentMethod(opt.id)}
                                className={`flex flex-col items-center gap-3 p-5 rounded-[24px] border transition-all ${
                                    paymentMethod === opt.id 
                                    ? 'bg-black border-black text-white shadow-xl translate-y-[-2px]' 
                                    : 'bg-[#F8FAFC] border-transparent text-[#94A3B8]'
                                }`}
                            >
                                <span className="text-[22px]">{opt.emoji}</span>
                                <span className="text-[10px] font-[800] uppercase tracking-widest">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </section>
            </div>

            {/* Save Button */}
            <div className="fixed bottom-0 left-0 right-0 p-8 bg-white/80 backdrop-blur-3xl border-t border-[#F1F5F9] z-50">
                <button 
                    onClick={handleCreateBill}
                    disabled={!isValid}
                    className={`w-full h-16 rounded-full flex items-center justify-center gap-4 font-[800] text-[17px] tracking-tight transition-all ${
                        isValid 
                        ? 'bg-black text-white shadow-xl active:bg-slate-900 active:scale-[0.98]' 
                        : 'bg-[#F1F5F9] text-[#CBD5E1] cursor-not-allowed'
                    }`}
                >
                    Create Bill <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default CreateBillScreen;
