import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, User, Phone, Package, Plus, Minus, 
  Trash2, X, Percent, Calculator, MessageSquare,
  ChevronDown, Search, ArrowRight, Wallet, CreditCard as CardIcon,
<<<<<<< HEAD
  ShoppingBag, Landmark, Banknote, RotateCcw
=======
  ShoppingBag, QrCode
>>>>>>> 41f113d (upgrade scanner)
} from 'lucide-react';

import { useBillStore } from '../store/billStore';
import { useCustomerStore } from '../store/customerStore';
import { useItemsStore } from '../store/itemsStore';
import { useShopStore } from '../store/shopStore';
<<<<<<< HEAD
import { useWalletStore } from '../store/walletStore';
import { useSettingsStore } from '../store/settingsStore';
=======
import { useSettingsStore } from '../store/settingsStore';
import { useWalletStore } from '../store/walletStore';
import CounterCashAssistant from '../components/cash/CounterCashAssistant';
>>>>>>> 41f113d (upgrade scanner)
import { formatMoney } from '../utils/formatMoney';
import { generateQRData } from '../utils/qrCode';
import { generateBillCode } from '../utils/generateBillCode';
import * as Calc from '../utils/calculateBill';
<<<<<<< HEAD
import SmartCashPanel from '../components/cash/SmartCashPanel';
import CURRENCY_NOTES from '../constants/currencyNotes';

const S = { fontFamily: "'Inter', sans-serif" }

const CreateBillScreen = () => {
    const navigate = useNavigate();
    const { shop } = useShopStore();
    const { saveBill } = useBillStore();
    const { customers, loadCustomers } = useCustomerStore();
    const { items, loadItems, getMostUsedItems } = useItemsStore();
    const { cashWallet, bankAccounts, loadCashWallet, loadBankAccounts, refundToCash, refundToBank } = useWalletStore();
    const { settings } = useSettingsStore();
    const currency = settings?.currency || 'USD';
=======
import PageGuide from '../components/shared/PageGuide';
import { usePageGuide } from '../hooks/usePageGuide';

const GST_RATES = [0, 5, 12, 18, 28];

const CreateBillScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { saveBill, bills, updateBill } = useBillStore();
    const { customers, loadCustomers } = useCustomerStore();
    const { items, loadItems, getMostUsedItems } = useItemsStore();
    const { shop } = useShopStore();
    const { settings } = useSettingsStore();
    const { cashWallet, bankAccounts, loadCashWallet, loadBankAccounts } = useWalletStore();
    const currency = settings?.currency || 'INR';

    const getSymbol = (code) => {
        const symbols = { 'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'AED': 'د.إ', 'JPY': '¥', 'CAD': '$', 'AUD': '$' };
        return symbols[code] || '$';
    };
    const currencySymbol = getSymbol(currency);
>>>>>>> 41f113d (upgrade scanner)

    const [customer, setCustomer] = useState({ name: '', phone: '' });
    const [billItems, setBillItems] = useState([{ id: Date.now(), name: '', price: 0, quantity: 1 }]);
    const [gstEnabled, setGstEnabled] = useState(false);
    const [gstRate, setGstRate] = useState(18);
    const [discountEnabled, setDiscountEnabled] = useState(false);
    const [discountType, setDiscountType] = useState('percentage'); 
    const [discountValue, setDiscountValue] = useState(0);
    const [roundOffEnabled, setRoundOffEnabled] = useState(true);
<<<<<<< HEAD
    const [paymentMethod, setPaymentMethod] = useState('upi');
=======
    const [paymentTab, setPaymentTab] = useState('cash'); // 'cash', 'bank', 'credit'
    const [bankSubMethod, setBankSubMethod] = useState('upi'); // 'upi', 'card', 'online'
>>>>>>> 41f113d (upgrade scanner)
    const [selectedBankId, setSelectedBankId] = useState(null);
    const [notes, setNotes] = useState('');
    const [step, setStep] = useState(1); // 1: Items/Totals, 2: Customer/Payment
    const [cashData, setCashData] = useState({ amount: 0, notes: null }); 
    const { recordIncomeCash, recordIncomeBank } = useWalletStore();

    const addItemBtnRef = useRef(null);
    const summaryRef = useRef(null);
    const proceedBtnRef = useRef(null);
    const customerRef = useRef(null);
    const payModeRef = useRef(null);
    const finalBtnRef = useRef(null);

    const { showGuide, currentStep, nextStep, prevStep, skipGuide } = usePageGuide('shop_create_bill');

    const guideSteps = useMemo(() => [
        { targetRef: addItemBtnRef, emoji: '➕', title: 'Add Products', description: 'Tap here to add a new item row or select one from your quick-add catalog below.', borderRadius: 16 },
        { targetRef: summaryRef, emoji: '🧾', title: 'Tax & Discounts', description: 'Enable GST or apply discounts. The total updates in real-time as you type.', borderRadius: 32 },
        { targetRef: proceedBtnRef, emoji: '💳', title: 'Next Step', description: 'Once your items are ready, proceed to choose a customer and payment method.', borderRadius: 32 },
        // Step 2
        { targetRef: customerRef, emoji: '👤', title: 'Customer Info', description: 'Enter details or pick a recent customer. This helps in tracking credit and sharing bills.', borderRadius: 32 },
        { targetRef: payModeRef, emoji: '⚡', title: 'Settle Payment', description: 'Choose Cash, Bank (UPI/Card), or Credit. For Cash, we even help you calculate change!', borderRadius: 32 },
        { targetRef: finalBtnRef, emoji: '✨', title: 'Instant Bill', description: 'Finalize to generate a unique QR bill that the customer can scan with their phone.', borderRadius: 32 }
    ], [addItemBtnRef, summaryRef, proceedBtnRef, customerRef, payModeRef, finalBtnRef]);

    // Memoize callback to prevent infinite loops with CounterCashAssistant
    const handleCashFinalize = useCallback((data) => {
        setCashData({ amount: data.totalReceived, notes: data.notes });
    }, []);

    useEffect(() => {
        const editBill = location.state?.editBill;
        if (editBill) {
            setCustomer({ name: editBill.customerName || '', phone: editBill.customerPhone || '' });
            setBillItems(editBill.items.map((it, idx) => ({ ...it, id: Date.now() + idx })));
            setGstEnabled(editBill.gstPercent > 0);
            if (editBill.gstPercent > 0) setGstRate(editBill.gstPercent);
            setDiscountEnabled(editBill.discountAmount > 0);
            if (editBill.discountAmount > 0) {
                setDiscountType(editBill.discountType);
                setDiscountValue(editBill.discountValue);
            }
            setPaymentTab(editBill.paymentMethod === 'cash' ? 'cash' : (['upi', 'card', 'online'].includes(editBill.paymentMethod) ? 'bank' : 'credit'));
            if (['upi', 'card', 'online'].includes(editBill.paymentMethod)) setBankSubMethod(editBill.paymentMethod);
            setNotes(editBill.notes || '');
            setPreviewBillNumber(editBill.billNumber);
        }

        loadCustomers();
        loadItems();
<<<<<<< HEAD
        loadCashWallet();
        loadBankAccounts();
    }, []);
=======
        loadCashWallet(currency);
        loadBankAccounts(currency);
    }, [currency, location.state]);
>>>>>>> 41f113d (upgrade scanner)

    useEffect(() => {
      if (bankAccounts.length > 0 && !selectedBankId) {
        setSelectedBankId(bankAccounts[0].id);
      }
    }, [bankAccounts]);

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

    const cashSuggestions = useMemo(() => {
        if (!finalTotal) return [];
        const s = new Set([
            finalTotal,
            Math.ceil(finalTotal / 10) * 10,
            Math.ceil(finalTotal / 50) * 50,
            Math.ceil(finalTotal / 100) * 100,
            Math.ceil(finalTotal / 500) * 500,
            Math.ceil(finalTotal / 2000) * 2000
        ]);
        return Array.from(s).filter(v => v >= finalTotal).sort((a,b) => a-b).slice(0, 5);
    }, [finalTotal]);

    const changeToReturn = Math.max(0, cashData.amount - finalTotal);

    const changeBreakdown = useMemo(() => {
        if (changeToReturn <= 0) return [];
        const denominations = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
        let remaining = changeToReturn;
        const breakdown = [];
        for (const denom of denominations) {
            const count = Math.floor(remaining / denom);
            if (count > 0) {
                breakdown.push({ denom, count });
                remaining -= denom * count;
            }
        }
        return breakdown;
    }, [changeToReturn]);

    const addItem = (item = null) => {
        if (item) {
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

    const [step, setStep] = useState(1);

    const handleCreateBill = async () => {
        const validItems = billItems.filter(i => i.name && i.price > 0)
        if (validItems.length === 0) return

<<<<<<< HEAD
        // Smart Item Auto-Save Logic
        const currentCatalog = items;
        for (const billItem of validItems) {
            const existing = currentCatalog.find(
                i => i.name.toLowerCase().trim() === billItem.name.toLowerCase().trim()
            );
            
            if (!existing) {
                // New item - save to catalog
                await useItemsStore.getState().addItem({
                    name: billItem.name.trim(),
                    price: billItem.price,
                });
            } else {
                // Existing item - increment usage to improve "Most Used" sorting
                await useItemsStore.getState().incrementUsage(existing.id);
            }
        }
=======
        const resolvedMethod = paymentTab === 'cash' ? 'cash' : (paymentTab === 'bank' ? bankSubMethod : 'credit');
        const claimCode = generateBillCode({
            amount: finalTotal,
            category: 'other', // Default for now
            paymentMethod: paymentTab,
            date: new Date()
        });
>>>>>>> 41f113d (upgrade scanner)

        const {
            billNumber,
            billId,
            qrString
        } = generateQRData({
            shopId: shop?.id,
            shopName: shop?.name || 'Spendly Shop',
            shopAddress: shop?.address,
            items: validItems,
            subtotal,
            total: finalTotal,
<<<<<<< HEAD
            paymentMethod: paymentMethod,
=======
            paymentMethod: resolvedMethod,
            paymentDetails: paymentTab === 'bank' ? { 
                bankName: bankAccounts.find(b => b.id === selectedBankId)?.bankName 
            } : (paymentTab === 'cash' ? {
                receivedNotes: cashData.notes // Include the exact notes selected by shopkeeper
            } : null),
            claimCode: claimCode,
            cashierId: null // or customer.user?
>>>>>>> 41f113d (upgrade scanner)
        })

        const editBill = location.state?.editBill;
        let id;
        const billData = {
<<<<<<< HEAD
            billId, billNumber,
=======
            billId: editBill?.billId || billId,
            billNumber: editBill?.billNumber || billNumber,
>>>>>>> 41f113d (upgrade scanner)
            customerName: customer.name,
            customerPhone: customer.phone,
            items: validItems,
            subtotal, gstPercent: gstEnabled ? gstRate : 0, gstAmount,
            discountType: discountEnabled ? discountType : 'none',
            discountValue: discountEnabled ? discountValue : 0,
<<<<<<< HEAD
            discountAmount, roundOff, total: finalTotal,
            paymentMethod, status: 'paid', notes, qrString,
            createdAt: new Date().toISOString()
        };

        const id = await saveBill(billData);

        if (paymentMethod === 'cash') {
           await refundToCash(finalTotal);
        } else if (paymentMethod === 'upi' && selectedBankId) {
           await refundToBank(selectedBankId, finalTotal);
=======
            discountAmount,
            roundOff,
            total: finalTotal,
            paymentMethod: resolvedMethod,
            claimCode: editBill?.claimCode || claimCode,
            status: editBill?.status || (paymentTab === 'credit' ? 'pending' : 'paid'),
            notes,
            qrString: editBill?.qrString || qrString,
            createdAt: editBill?.createdAt || new Date().toISOString(),
            updatedAt: editBill ? new Date().toISOString() : undefined
        };

        if (editBill) {
            id = editBill.id;
            await updateBill(id, billData);
        } else {
            id = await saveBill(billData);
        }

        // --- Wallet Balance Synchronization ---
        try {
            if (paymentTab === 'cash') {
                await recordIncomeCash(id, finalTotal, cashData.notes);
            } else if (paymentTab === 'bank' && selectedBankId) {
                await recordIncomeBank(id, selectedBankId, finalTotal);
            }
        } catch (err) {
            console.error("Wallet sync failed:", err);
        }

        // --- Intelligent Item Learning ---
        try {
            const catalogItems = items; // From useItemsStore
            for (const item of validItems) {
                const existing = catalogItems.find(i => i.name.toLowerCase() === item.name.toLowerCase());
                if (existing) {
                    // Update usage and latest price
                    await useItemsStore.getState().updateItem(existing.id, {
                        timesUsed: (existing.timesUsed || 0) + 1,
                        price: item.price // Learning the latest price
                    });
                } else {
                    // Automatically add to catalog for future quick add
                    await useItemsStore.getState().addItem({
                        name: item.name,
                        price: item.price
                    });
                }
            }
            // Reload catalog
            await loadItems();
        } catch (err) {
            console.error("Failed to learn from bill items:", err);
>>>>>>> 41f113d (upgrade scanner)
        }

        navigate(`/send-bill/${id}`, { state: { billData } });
    };

    const isValid = billItems.filter(i => i.name && i.price > 0).length > 0;

    return (
        <div className="h-dvh bg-white flex flex-col overflow-x-hidden relative font-sans">
<<<<<<< HEAD
            <header className="bg-white/80 backdrop-blur-xl p-6 pb-4 flex items-center justify-between sticky top-0 z-40 border-b border-[#F1F5F9] shadow-sm">
                <button onClick={() => step === 2 ? setStep(1) : navigate(-1)} className="flex items-center gap-3 text-black font-[800] tracking-tight active:scale-95 transition-transform group">
=======
            <header className="bg-white/80 backdrop-blur-xl p-6 pb-4 flex items-center justify-between sticky top-0 z-40 border-b border-[#F1F5F9]">
                <button 
                  onClick={() => step === 1 ? navigate(-1) : setStep(1)} 
                  className="flex items-center gap-3 text-black font-[800] tracking-tight active:scale-95 transition-transform group"
                >
>>>>>>> 41f113d (upgrade scanner)
                    <div className="p-2 bg-[#F8FAFC] rounded-xl group-hover:bg-black group-hover:text-white transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                </button>
                <div className="text-center">
                    <div className="text-[10px] font-[900] text-[#94A3B8] uppercase tracking-[0.2em] mb-1">{previewBillNumber}</div>
                    <div className="flex items-center gap-1.5 justify-center">
                      <div className={`h-1 rounded-full transition-all duration-500 ${step === 1 ? 'w-4 bg-black' : 'w-1.5 bg-slate-200'}`} />
                      <div className={`h-1 rounded-full transition-all duration-500 ${step === 2 ? 'w-4 bg-black' : 'w-1.5 bg-slate-200'}`} />
                    </div>
                </div>
                <div className="text-right">
<<<<<<< HEAD
                    <div className="text-[15px] font-[900] text-black leading-tight">Step {step}/2</div>
                    <div className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest">{step === 1 ? 'Billing' : 'Payment'}</div>
                </div>
            </header>

            <div className={`flex-1 overflow-y-auto ${step === 1 ? 'bg-white' : 'bg-[#F9FBFF]'}`}>
                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div 
                            key="step1" 
                            initial={{ opacity: 0, x: -20 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            exit={{ opacity: 0, x: 20 }}
                            className="p-6 space-y-8 pb-40"
                        >
=======
                    <div className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest mb-0.5">{previewBillNumber}</div>
                    <div className="text-[17px] font-[800] text-black leading-tight">
                      {step === 1 ? 'Bill Details' : 'Finalize Bill'}
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto pb-32">
                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div 
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-6 space-y-8"
                        >
                            {/* Section: Items */}
>>>>>>> 41f113d (upgrade scanner)
                            <section className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1 h-5 bg-black rounded-full" />
<<<<<<< HEAD
                                        <h3 className="text-[12px] font-[800] text-black uppercase tracking-widest">Bill Items</h3>
                                    </div>
                                    <button onClick={() => addItem()} className="bg-black py-3 px-6 rounded-2xl text-white shadow-lg flex items-center gap-2 active:scale-95 transition-transform">
=======
                                        <h3 className="text-[12px] font-[800] text-black uppercase tracking-widest">Items</h3>
                                    </div>
                                    <button 
                                        ref={addItemBtnRef}
                                        onClick={() => addItem()} 
                                        className="bg-black py-3 px-6 rounded-2xl text-white flex items-center gap-2 active:scale-95 transition-transform"
                                    >
>>>>>>> 41f113d (upgrade scanner)
                                        <Plus className="w-5 h-5" />
                                        <span className="text-[13px] font-[800]">Add Item</span>
                                    </button>
                                </div>
<<<<<<< HEAD
                                <div className="space-y-4">
                                    <AnimatePresence initial={false}>
                                        {billItems.map((bi) => (
                                            <motion.div key={bi.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#F8FAFC] rounded-[28px] p-6 space-y-5 relative border border-transparent hover:border-slate-100 transition-all">
                                                <div className="flex justify-between items-start gap-3">
                                                    <div className="flex-1 flex items-center gap-4 bg-white rounded-[20px] p-4 border border-[#F1F5F9]/50 focus-within:border-[#F1F5F9] transition-all shadow-sm">
                                                        <Package className="w-5 h-5 text-[#CBD5E1]" />
                                                        <input className="bg-transparent w-full outline-none font-[700] text-black text-[16px] placeholder:text-[#CBD5E1]" placeholder="Item Name" value={bi.name} onChange={e => updateItem(bi.id, 'name', e.target.value)} />
                                                    </div>
                                                    <button onClick={() => removeItem(bi.id)} className="p-4 text-[#CBD5E1] active:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-[#F1F5F9] shadow-sm">
=======

                                <div className="space-y-4">
                                    <AnimatePresence initial={false}>
                                        {billItems.map((bi) => (
                                            <motion.div 
                                                key={bi.id}
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-[#F8FAFC] rounded-[28px] p-6 space-y-5 relative"
                                            >
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex-1 flex items-center gap-4 bg-white rounded-[20px] p-4 border border-[#F1F5F9]/50 focus-within:border-black transition-all">
                                                        <Package className="w-5 h-5 text-[#CBD5E1]" />
                                                         <div className="relative w-full">
                                                             <input 
                                                                 className="bg-transparent w-full outline-none font-[700] text-black text-[16px] placeholder:text-[#CBD5E1]"
                                                                 placeholder="Item Name"
                                                                 value={bi.name}
                                                                 onChange={e => updateItem(bi.id, 'name', e.target.value)}
                                                             />
                                                             {bi.name && items.filter(i => i.name.toLowerCase().includes(bi.name.toLowerCase()) && i.name.toLowerCase() !== bi.name.toLowerCase()).length > 0 && (
                                                                 <div className="absolute top-12 left-0 w-full bg-white rounded-2xl shadow-xl border border-[#F1F5F9] z-[100] max-h-48 overflow-y-auto p-2 space-y-1">
                                                                     {items
                                                                         .filter(i => i.name.toLowerCase().includes(bi.name.toLowerCase()))
                                                                         .slice(0, 5)
                                                                         .map(suggestion => (
                                                                             <button
                                                                                 key={suggestion.id}
                                                                                 onClick={() => {
                                                                                     updateItem(bi.id, 'name', suggestion.name);
                                                                                     updateItem(bi.id, 'price', suggestion.price);
                                                                                 }}
                                                                                 className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between"
                                                                             >
                                                                                 <span className="text-[14px] font-[700] text-black">{suggestion.name}</span>
                                                                                 <span className="text-[12px] font-[800] text-indigo-600">{formatMoney(suggestion.price)}</span>
                                                                             </button>
                                                                         ))
                                                                     }
                                                                 </div>
                                                             )}
                                                         </div>
                                                     </div>
                                                    <button onClick={() => removeItem(bi.id)} className="p-4 text-[#CBD5E1] active:text-red-500 transition-colors">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-[#F1F5F9]">
>>>>>>> 41f113d (upgrade scanner)
                                                        <button onClick={() => updateItem(bi.id, 'quantity', Math.max(0.5, bi.quantity - 1))} className="w-10 h-10 bg-[#F8FAFC] rounded-full text-slate-400 flex items-center justify-center active:bg-slate-200"><Minus className="w-4 h-4" /></button>
                                                        <div className="w-10 text-center font-[800] text-[16px] text-black">{bi.quantity}</div>
                                                        <button onClick={() => updateItem(bi.id, 'quantity', bi.quantity + 1)} className="w-10 h-10 bg-black rounded-full text-white flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                                                    </div>
<<<<<<< HEAD
                                                    <div className="flex items-center bg-white rounded-[20px] px-5 h-12 border border-[#F1F5F9]/50 focus-within:border-[#F1F5F9] w-32 shadow-sm">
                                                        <span className="text-[#CBD5E1] font-[800] mr-2 text-[15px]">{currency === 'USD' ? '$' : '₹'}</span>
                                                        <input type="number" className="bg-transparent w-full outline-none font-[800] text-black text-right text-[16px]" value={bi.price || ''} onChange={e => updateItem(bi.id, 'price', parseFloat(e.target.value) || 0)} placeholder="0" />
=======

                                                    <div className="flex items-center bg-white rounded-[20px] px-5 h-12 border border-[#F1F5F9]/50 focus-within:border-black w-32">
                                                        <span className="text-[#CBD5E1] font-[800] mr-2 text-[15px]">{currencySymbol}</span>
                                                        <input 
                                                            type="number" 
                                                            className="bg-transparent w-full outline-none font-[800] text-black text-right text-[16px]"
                                                            value={bi.price || ''}
                                                            onChange={e => updateItem(bi.id, 'price', parseFloat(e.target.value) || 0)}
                                                            placeholder="0"
                                                        />
>>>>>>> 41f113d (upgrade scanner)
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-[12px] font-[800] text-black uppercase tracking-widest px-2">Quick Add</h3>
                                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
                                    {quickItems.map(qi => (
<<<<<<< HEAD
                                        <button key={qi.id} onClick={() => addItem({ name: qi.name, price: qi.price })} className="flex-shrink-0 bg-[#F8FAFC] rounded-[24px] p-5 flex flex-col items-center min-w-[124px] active:bg-slate-100 transition-all border border-transparent shadow-sm">
                                            <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center text-[22px] mb-3 shadow-sm border border-[#F1F5F9]">📦</div>
                                            <div className="text-[13px] font-[800] text-black tracking-tight">{qi.name}</div>
                                            <div className="text-[11px] font-[700] text-[#94A3B8] mt-1">{formatMoney(qi.price, currency)}</div>
=======
                                        <button
                                            key={qi.id}
                                            onClick={() => addItem({ name: qi.name, price: qi.price })}
                                            className="flex-shrink-0 bg-[#F8FAFC] rounded-[24px] p-5 flex flex-col items-center min-w-[124px] active:bg-slate-100 transition-all border border-transparent"
                                        >
                                            <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center text-[22px] mb-3 border border-[#F1F5F9]">
                                                📦
                                            </div>
                                            <div className="text-[13px] font-[800] text-black tracking-tight truncate w-full">{qi.name}</div>
                                            <div className="text-[11px] font-[700] text-[#94A3B8] mt-1">{formatMoney(qi.price)}</div>
>>>>>>> 41f113d (upgrade scanner)
                                        </button>
                                    ))}
                                </div>
                            </section>

<<<<<<< HEAD
                            <section className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl space-y-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-white/10 transition-colors" />
                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-center justify-between opacity-40">
                                        <span className="text-[11px] font-[900] uppercase tracking-widest" style={S.inter}>Gross Subtotal</span>
                                        <span className="font-[800] text-[18px]" style={S.sora}>{formatMoney(subtotal, currency)}</span>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="text-[11px] font-[800] uppercase tracking-widest opacity-40">Add GST</div>
                                                    <button onClick={() => setGstEnabled(!gstEnabled)} className={`w-11 h-6 rounded-full p-1 transition-colors ${gstEnabled ? 'bg-white' : 'bg-white/10'}`}><div className={`w-4 h-4 rounded-full transition-transform ${gstEnabled ? 'bg-black translate-x-5' : 'bg-white/40 translate-x-0'}`} /></button>
                                                </div>
                                                {gstEnabled && <span className="font-[800] text-[16px] text-white">+{formatMoney(gstAmount, currency)}</span>}
                                            </div>
                                            {gstEnabled && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                                    {[5, 12, 18, 28].map(rate => (
                                                        <button key={rate} onClick={() => setGstRate(rate)} className={`flex-shrink-0 px-4 py-2 rounded-xl text-[11px] font-[900] transition-all border ${gstRate === rate ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 border-white/10'}`}>{rate}%</button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="text-[11px] font-[800] uppercase tracking-widest opacity-40">Discount</div>
                                                    <button onClick={() => setDiscountEnabled(!discountEnabled)} className={`w-11 h-6 rounded-full p-1 transition-colors ${discountEnabled ? 'bg-white' : 'bg-white/10'}`}><div className={`w-4 h-4 rounded-full transition-transform ${discountEnabled ? 'bg-black translate-x-5' : 'bg-white/40 translate-x-0'}`} /></button>
                                                </div>
                                                {discountEnabled && <span className="font-[800] text-[16px] text-rose-400">-{formatMoney(discountAmount, currency)}</span>}
                                            </div>
                                            {discountEnabled && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex items-center gap-2 bg-white/10 rounded-2xl p-2">
                                                    <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="bg-transparent text-[11px] font-[900] uppercase text-white/60 outline-none px-2 shadow-none"><option value="percentage">%</option><option value="amount">Amt</option></select>
                                                    <input type="number" value={discountValue || ''} onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)} placeholder="Value" className="bg-transparent flex-1 text-right font-[800] text-[15px] text-white outline-none pr-2" />
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-8 border-t border-white/10 flex items-center justify-between relative z-10">
                                    <div className="text-[11px] font-[900] uppercase tracking-[0.3em] opacity-30">Settlement Total</div>
                                    <div className="text-[40px] font-[900] tracking-tighter tabular-nums" style={S.sora}>{formatMoney(finalTotal, currency)}</div>
                                </div>
                            </section>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="step2" 
                            initial={{ opacity: 0, x: 20 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            exit={{ opacity: 0, x: -20 }}
                            className="p-6 space-y-8 pb-40"
                        >
                            <section className="bg-white rounded-[36px] p-8 border border-slate-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-5 bg-black rounded-full" />
                                    <h3 className="text-[11px] font-[900] text-black uppercase tracking-[0.2em] opacity-50">Customer Details</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 bg-[#F8FAFC] rounded-[24px] p-5 border border-transparent focus-within:border-[#F1F5F9] focus-within:bg-white transition-all shadow-inner">
                                        <User className="w-5 h-5 text-[#CBD5E1]" />
                                        <input className="bg-transparent w-full outline-none font-[700] text-black text-[16px] placeholder:text-[#CBD5E1]" placeholder="Customer Name (Optional)" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
                                    </div>
                                    <div className="flex items-center gap-4 bg-[#F8FAFC] rounded-[24px] p-5 border border-transparent focus-within:border-[#F1F5F9] focus-within:bg-white transition-all shadow-inner">
                                        <Phone className="w-5 h-5 text-[#CBD5E1]" />
                                        <input className="bg-transparent w-full outline-none font-[700] text-black text-[16px] placeholder:text-[#CBD5E1]" placeholder="Phone Number" type="tel" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <label className="text-[11px] font-[900] text-black uppercase tracking-[0.2em] opacity-50 px-2" style={S.inter}>Settlement Mode</label>
                                
                                <div className="flex bg-[#F1F5F9] p-1.5 rounded-[24px] gap-1 mx-1">
                                    {[
                                        { id: 'upi', label: 'Online' },
                                        { id: 'cash', label: 'Cash' },
                                        { id: 'card', label: 'Card' },
                                        { id: 'credit', label: 'Credit' }
                                    ].map(opt => (
                                        <button key={opt.id} onClick={() => setPaymentMethod(opt.id)} className={`flex-1 py-3.5 rounded-[20px] text-[10px] font-[950] uppercase tracking-[0.15em] transition-all duration-300 ${paymentMethod === opt.id ? 'bg-black text-white shadow-xl shadow-black/10' : 'text-[#94A3B8] hover:text-[#64748B]'}`} style={S.inter}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>

                                <AnimatePresence mode="wait">
                                  {paymentMethod === 'cash' && (
                                    <motion.div key="cash" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-4">
                                       <div className="flex items-center gap-3 px-2">
                                          <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                                          <h3 className="text-[11px] font-[800] text-slate-400 uppercase tracking-widest" style={S.inter}>Smart Cash Control</h3>
                                       </div>
                                       <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20 p-1">
                                         <SmartCashPanel expenseAmount={finalTotal} userNotes={cashWallet?.notes || {}} currency={currency} onPaymentConfirmed={handleCreateBill} />
                                       </div>
                                    </motion.div>
                                  )}

                                  {paymentMethod === 'upi' && (
                                    <motion.div key="upi" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 1, y: 15 }} className="space-y-6">
                                       <p className="text-[11px] font-[800] text-slate-400 uppercase tracking-widest px-2" style={S.inter}>Receiving Account</p>
                                       <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-1">
                                          {bankAccounts.map(acc => (
                                            <button key={acc.id} onClick={() => setSelectedBankId(acc.id)} className={`flex-shrink-0 w-48 p-7 rounded-[36px] border transition-all relative text-left group ${selectedBankId === acc.id ? 'border-2 border-black bg-white shadow-2xl shadow-black/5 scale-[1.05]' : 'bg-white border-slate-50 opacity-60'}`}>
                                               <div className="w-12 h-12 rounded-2xl mb-5 flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110" style={{ backgroundColor: acc.bankColor || '#000000' }}><Landmark className="w-6 h-6" /></div>
                                               <div className="space-y-1"><p className="text-[15px] font-[900] text-black tracking-tight" style={S.inter}>{acc.bankName}</p><p className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest" style={S.inter}>{acc.accountNickname || 'Business Account'}</p><p className="text-[18px] font-[900] text-black pt-3 tabular-nums" style={S.sora}>{formatMoney(acc.balance || 0, currency)}</p></div>
                                               {selectedBankId === acc.id && (
                                                 <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-7 right-7 w-7 h-7 bg-black rounded-full flex items-center justify-center shadow-xl shadow-black/20"><Check className="w-4 h-4 text-white" strokeWidth={4} /></motion.div>
                                               )}
                                            </button>
                                          ))}
                                       </div>
                                    </motion.div>
                                  )}

                                  {(paymentMethod === 'card' || paymentMethod === 'credit') && (
                                    <motion.div key="other" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 bg-white rounded-[40px] border border-slate-100 shadow-sm text-center mx-1">
                                       <div className="w-16 h-16 bg-[#F8FAFC] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-50">{paymentMethod === 'card' ? <CardIcon className="w-8 h-8 text-black" /> : <ShoppingBag className="w-8 h-8 text-black" />}</div>
                                       <p className="text-[14px] font-[700] text-slate-400 leading-relaxed" style={S.inter}>Transactions via {paymentMethod === 'card' ? 'Terminal' : 'Credit Book'} <br /> will be logged to history.</p>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                            </section>
=======
                            <section ref={summaryRef} className="bg-black rounded-[32px] p-8 text-white space-y-8 relative overflow-hidden">
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
                                                {GST_RATES.map(rate => (
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
                                    <div className="text-[12px] font-[800] uppercase tracking-widest opacity-30">Total Value</div>
                                    <div className="text-[36px] font-[800] tracking-tight">{formatMoney(finalTotal)}</div>
                                </div>
                            </section>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="p-6 space-y-8"
                        >
                            {/* Section: Customer */}
                            <section ref={customerRef} className="bg-[#F8FAFC] rounded-[32px] p-8 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-5 bg-black rounded-full" />
                                    <h3 className="text-[12px] font-[800] text-black uppercase tracking-widest">Customer</h3>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 bg-white rounded-[24px] p-5 border border-transparent focus-within:border-black transition-all">
                                        <User className="w-5 h-5 text-[#CBD5E1]" />
                                        <input 
                                            className="bg-transparent w-full outline-none font-[700] text-black text-[16px] placeholder:text-[#CBD5E1]"
                                            placeholder="Customer Name"
                                            value={customer.name}
                                            onChange={e => setCustomer({...customer, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="flex items-center gap-4 bg-white rounded-[24px] p-5 border border-transparent focus-within:border-black transition-all">
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
                                                className="bg-white border border-[#F1F5F9] rounded-full px-5 py-2 text-[11px] font-[700] text-[#64748B] whitespace-nowrap active:bg-black active:text-white transition-all"
                                            >
                                                {rc.name}
                                            </button>
                                        ))}
                                    </div>
                                 )}
                             </section>

                             {/* Additional Notes moved after Customer */}
                             <section className="space-y-4">
                                 <div className="flex items-center gap-3">
                                     <div className="w-1 h-5 bg-black rounded-full" />
                                     <h3 className="text-[12px] font-[800] text-black uppercase tracking-widest">Additional Notes</h3>
                                 </div>
                                 <div className="flex items-center gap-4 bg-[#F8FAFC] rounded-[24px] p-5 border border-transparent focus-within:border-black transition-all">
                                     <MessageSquare className="w-5 h-5 text-[#CBD5E1]" />
                                     <input 
                                         className="bg-transparent w-full outline-none font-[700] text-black text-[16px] placeholder:text-[#CBD5E1]"
                                         placeholder="Add a bill note..."
                                         value={notes}
                                         onChange={e => setNotes(e.target.value)}
                                     />
                                 </div>
                             </section>

                             {/* High-Level Payment Category Tabs */}
                             <section ref={payModeRef} className="space-y-4">
                                 <div className="flex items-center justify-between px-2">
                                     <label className="text-[11px] font-[900] text-black uppercase tracking-[0.2em] opacity-80">Payment Category</label>
                                 </div>
                                 <div className="bg-[#F8FAFC] p-1.5 rounded-[32px] border border-[#F1F5F9] flex gap-1">
                                     {[
                                         { id: 'cash', label: 'Cash', emoji: '💵' },
                                         { id: 'bank', label: 'Bank', emoji: '🏦' },
                                         { id: 'credit', label: 'Credit', emoji: '🔖' }
                                     ].map(tab => (
                                         <button
                                             key={tab.id}
                                             onClick={() => setPaymentTab(tab.id)}
                                             className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[26px] transition-all duration-300 ${
                                                 paymentTab === tab.id 
                                                 ? 'bg-black text-white' 
                                                 : 'text-[#94A3B8] hover:text-slate-500'
                                             }`}
                                         >
                                             <span className="text-[18px]">{tab.emoji}</span>
                                             <span className="text-[10px] font-[900] uppercase tracking-widest">{tab.label}</span>
                                         </button>
                                     ))}
                                 </div>
                             </section>

                             <AnimatePresence mode="wait">
                                 {/* CASH FLOW */}
                                 {paymentTab === 'cash' && (
                                     <motion.div 
                                         key="cash"
                                         initial={{ opacity: 0, y: 15 }}
                                         animate={{ opacity: 1, y: 0 }}
                                         exit={{ opacity: 0, y: -15 }}
                                         className="space-y-6"
                                     >
                                        <CounterCashAssistant 
                                          billAmount={finalTotal}
                                          currency={currency}
                                          onFinalize={handleCashFinalize}
                                        />
                                     </motion.div>
                                 )}

                                 {/* BANK FLOW */}
                                 {paymentTab === 'bank' && (
                                     <motion.div 
                                         key="bank"
                                         initial={{ opacity: 0, y: 15 }}
                                         animate={{ opacity: 1, y: 0 }}
                                         exit={{ opacity: 0, y: -15 }}
                                         className="space-y-8"
                                     >
                                         <div className="space-y-4 px-2">
                                             <label className="text-[10px] font-[900] text-slate-400 uppercase tracking-widest">Select Bank Method</label>
                                             <div className="grid grid-cols-3 gap-2">
                                                 {[
                                                     { id: 'upi', label: 'UPI', emoji: '📱' },
                                                     { id: 'card', label: 'Card', emoji: '💳' },
                                                     { id: 'online', label: 'Online', emoji: '🌐' }
                                                 ].map(m => (
                                                     <button 
                                                        key={m.id}
                                                        onClick={() => setBankSubMethod(m.id)}
                                                        className={`py-6 rounded-[28px] border-2 flex flex-col items-center gap-2 transition-all ${
                                                            bankSubMethod === m.id ? 'bg-black border-black text-white' : 'bg-white border-slate-50 text-slate-400'
                                                        }`}
                                                     >
                                                         <span className="text-xl">{m.emoji}</span>
                                                         <span className="text-[10px] font-[900] uppercase">{m.label}</span>
                                                     </button>
                                                 ))}
                                             </div>
                                         </div>

                                         <div className="space-y-4">
                                            <div className="flex items-center justify-between px-2">
                                                <label className="text-[10px] font-[900] text-slate-400 uppercase tracking-widest">Link To Account</label>
                                            </div>
                                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
                                               {bankAccounts.map(acc => (
                                                 <button 
                                                   key={acc.id} 
                                                   onClick={() => setSelectedBankId(acc.id)}
                                                   className={`min-w-[160px] p-5 rounded-[28px] border-2 transition-all flex flex-col items-start gap-4 flex-shrink-0 ${
                                                     selectedBankId === acc.id ? 'border-black bg-slate-50' : 'border-slate-50 bg-white'
                                                   }`}
                                                 >
                                                   <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: acc.bankColor }}>
                                                     <User className="w-5 h-5 text-white" />
                                                   </div>
                                                   <div className="text-left">
                                                      <p className="text-[14px] font-[800] text-black truncate w-full">{acc.bankName}</p>
                                                      <p className="text-[11px] font-[700] text-slate-400 uppercase tracking-widest leading-none mt-1">
                                                          {formatMoney(acc.balance, currency)}
                                                      </p>
                                                   </div>
                                                 </button>
                                               ))}
                                            </div>
                                         </div>
                                     </motion.div>
                                 )}

                                 {/* CREDIT FLOW */}
                                 {paymentTab === 'credit' && (
                                     <motion.div 
                                         key="credit"
                                         initial={{ opacity: 0, y: 15 }}
                                         animate={{ opacity: 1, y: 0 }}
                                         exit={{ opacity: 0, y: -15 }}
                                         className="p-8 bg-rose-50 rounded-[40px] border border-rose-100 flex flex-col items-center text-center gap-4"
                                     >
                                         <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-[32px]">🔖</div>
                                         <div>
                                             <h4 className="text-[16px] font-[900] text-rose-900">Mark as Credit (Udhaar)</h4>
                                             <p className="text-[12px] font-[700] text-rose-600/60 leading-relaxed mt-1">This bill will be marked as outstanding. You can settle it later from customers.</p>
                                         </div>
                                     </motion.div>
                                 )}
                             </AnimatePresence>
>>>>>>> 41f113d (upgrade scanner)
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

<<<<<<< HEAD
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[450px] p-8 pb-[calc(2rem+var(--safe-bottom))] bg-white/80 backdrop-blur-3xl border-t border-[#F1F5F9] z-50">
                {step === 1 ? (
                    <button onClick={() => setStep(2)} disabled={!isValid} className={`w-full h-16 rounded-full flex items-center justify-center gap-4 font-[900] text-[15px] uppercase tracking-widest transition-all ${isValid ? 'bg-black text-white shadow-2xl active:scale-[0.98]' : 'bg-[#F1F5F9] text-[#CBD5E1] cursor-not-allowed'}`}>
                        Procced to Payment <ArrowRight className="w-5 h-5 text-slate-500" />
                    </button>
                ) : (
                    <div className="flex gap-3">
                        <button onClick={() => setStep(1)} className="h-16 w-16 bg-[#F8FAFC] rounded-full flex items-center justify-center border border-[#F1F5F9] active:scale-95 transition-transform"><RotateCcw className="w-5 h-5 text-slate-400" /></button>
                        <button onClick={handleCreateBill} disabled={paymentMethod === 'cash'} className={`flex-1 h-16 rounded-full flex items-center justify-center gap-4 font-[900] text-[15px] uppercase tracking-widest transition-all ${paymentMethod === 'cash' ? 'bg-[#F1F5F9] text-[#CBD5E1] cursor-not-allowed' : 'bg-black text-white shadow-2xl active:scale-[0.98]'}`}>
                            {paymentMethod === 'cash' ? 'Follow Smart Panel' : 'Finish & Create Bill'} <Plus className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
=======
            {/* Bottom Actions - Fixed on Bottom */}
            <div className="fixed bottom-0 left-0 w-full p-6 px-8 bg-white/90 backdrop-blur-xl border-t border-[#F1F5F9] z-50">
                {step === 1 ? (
                    <button 
                        ref={proceedBtnRef}
                        onClick={() => setStep(2)}
                        disabled={!isValid}
                        className={`w-full h-16 rounded-full flex items-center justify-center gap-4 font-[900] text-[17px] tracking-tight transition-all uppercase ${
                            isValid 
                            ? 'bg-black text-white active:scale-[0.98]' 
                            : 'bg-[#F1F5F9] text-[#CBD5E1] cursor-not-allowed'
                        }`}
                    >
                        Proceed to Payment <ArrowRight className="w-5 h-5" />
                    </button>
                ) : (
                    <button 
                        ref={finalBtnRef}
                        onClick={handleCreateBill}
                        className="w-full h-16 rounded-full flex items-center justify-center gap-4 font-[900] text-[17px] tracking-tight transition-all uppercase bg-black text-white active:scale-[0.98]"
                    >
                        Create Digital Bill <QrCode className="w-5 h-5" />
                    </button>
>>>>>>> 41f113d (upgrade scanner)
                )}
            </div>
            <PageGuide 
                show={showGuide} 
                steps={guideSteps} 
                currentStep={currentStep} 
                onNext={(total) => {
                    if (currentStep === 2 && step === 1) {
                        setStep(2);
                        // Wait for mount
                        setTimeout(() => nextStep(total), 100);
                    } else {
                        nextStep(total);
                    }
                }} 
                onPrev={() => {
                    if (currentStep === 3 && step === 2) {
                        setStep(1);
                        setTimeout(() => prevStep(), 100);
                    } else {
                        prevStep();
                    }
                }} 
                onSkip={skipGuide} 
            />
        </div>
    );
};

export default CreateBillScreen;
