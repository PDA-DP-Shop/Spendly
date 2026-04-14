import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, User, Phone, Package, Plus, Minus, 
  Trash2, X, Percent, Calculator, MessageSquare,
  ChevronDown, Search, ArrowRight, Wallet, CreditCard as CardIcon,
  ShoppingBag, Landmark, Banknote, RotateCcw
} from 'lucide-react';

import { useBillStore } from '../store/billStore';
import { useCustomerStore } from '../store/customerStore';
import { useItemsStore } from '../store/itemsStore';
import { useShopStore } from '../store/shopStore';
import { useWalletStore } from '../store/walletStore';
import { useSettingsStore } from '../store/settingsStore';
import { formatMoney } from '../utils/formatMoney';
import { generateQRData } from '../utils/qrCode';
import * as Calc from '../utils/calculateBill';
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

    const [customer, setCustomer] = useState({ name: '', phone: '' });
    const [billItems, setBillItems] = useState([{ id: Date.now(), name: '', price: 0, quantity: 1 }]);
    const [gstEnabled, setGstEnabled] = useState(false);
    const [gstRate, setGstRate] = useState(18);
    const [discountEnabled, setDiscountEnabled] = useState(false);
    const [discountType, setDiscountType] = useState('percentage'); 
    const [discountValue, setDiscountValue] = useState(0);
    const [roundOffEnabled, setRoundOffEnabled] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [selectedBankId, setSelectedBankId] = useState(null);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        loadCustomers();
        loadItems();
        loadCashWallet();
        loadBankAccounts();
    }, []);

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
            tax: gstAmount,
            total: finalTotal,
            paymentMethod: paymentMethod,
        })

        const billData = {
            billId, billNumber,
            customerName: customer.name,
            customerPhone: customer.phone,
            items: validItems,
            subtotal, gstPercent: gstEnabled ? gstRate : 0, gstAmount,
            discountType: discountEnabled ? discountType : 'none',
            discountValue: discountEnabled ? discountValue : 0,
            discountAmount, roundOff, total: finalTotal,
            paymentMethod, status: 'paid', notes, qrString,
            createdAt: new Date().toISOString()
        };

        const id = await saveBill(billData);

        if (paymentMethod === 'cash') {
           await refundToCash(finalTotal);
        } else if (paymentMethod === 'upi' && selectedBankId) {
           await refundToBank(selectedBankId, finalTotal);
        }

        navigate(`/send-bill/${id}`, { state: { billData } });
    };

    const isValid = billItems.filter(i => i.name && i.price > 0).length > 0;

    return (
        <div className="h-dvh bg-white flex flex-col overflow-x-hidden relative font-sans">
            <header className="bg-white/80 backdrop-blur-xl p-6 pb-4 flex items-center justify-between sticky top-0 z-40 border-b border-[#F1F5F9] shadow-sm">
                <button onClick={() => step === 2 ? setStep(1) : navigate(-1)} className="flex items-center gap-3 text-black font-[800] tracking-tight active:scale-95 transition-transform group">
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
                            <section className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1 h-5 bg-black rounded-full" />
                                        <h3 className="text-[12px] font-[800] text-black uppercase tracking-widest">Bill Items</h3>
                                    </div>
                                    <button onClick={() => addItem()} className="bg-black py-3 px-6 rounded-2xl text-white shadow-lg flex items-center gap-2 active:scale-95 transition-transform">
                                        <Plus className="w-5 h-5" />
                                        <span className="text-[13px] font-[800]">Add Item</span>
                                    </button>
                                </div>
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
                                                        <button onClick={() => updateItem(bi.id, 'quantity', Math.max(0.5, bi.quantity - 1))} className="w-10 h-10 bg-[#F8FAFC] rounded-full text-slate-400 flex items-center justify-center active:bg-slate-200"><Minus className="w-4 h-4" /></button>
                                                        <div className="w-10 text-center font-[800] text-[16px] text-black">{bi.quantity}</div>
                                                        <button onClick={() => updateItem(bi.id, 'quantity', bi.quantity + 1)} className="w-10 h-10 bg-black rounded-full text-white flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                                                    </div>
                                                    <div className="flex items-center bg-white rounded-[20px] px-5 h-12 border border-[#F1F5F9]/50 focus-within:border-[#F1F5F9] w-32 shadow-sm">
                                                        <span className="text-[#CBD5E1] font-[800] mr-2 text-[15px]">{currency === 'USD' ? '$' : '₹'}</span>
                                                        <input type="number" className="bg-transparent w-full outline-none font-[800] text-black text-right text-[16px]" value={bi.price || ''} onChange={e => updateItem(bi.id, 'price', parseFloat(e.target.value) || 0)} placeholder="0" />
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
                                        <button key={qi.id} onClick={() => addItem({ name: qi.name, price: qi.price })} className="flex-shrink-0 bg-[#F8FAFC] rounded-[24px] p-5 flex flex-col items-center min-w-[124px] active:bg-slate-100 transition-all border border-transparent shadow-sm">
                                            <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center text-[22px] mb-3 shadow-sm border border-[#F1F5F9]">📦</div>
                                            <div className="text-[13px] font-[800] text-black tracking-tight">{qi.name}</div>
                                            <div className="text-[11px] font-[700] text-[#94A3B8] mt-1">{formatMoney(qi.price, currency)}</div>
                                        </button>
                                    ))}
                                </div>
                            </section>

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
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

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
                )}
            </div>
        </div>
    );
};

export default CreateBillScreen;
