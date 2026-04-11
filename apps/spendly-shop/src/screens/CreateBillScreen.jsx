import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, User, Phone, Package, Plus, Minus, 
  Trash2, X, Percent, Calculator, MessageSquare,
  ChevronDown, Search
} from 'lucide-react';

import { useBillStore } from '../store/billStore';
import { useCustomerStore } from '../store/customerStore';
import { useItemsStore } from '../store/itemsStore';
import { useShopStore } from '../store/shopStore';
import { formatMoney } from '../utils/formatMoney';
import { generateBillNumber } from '../utils/generateBillNumber';
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
  const [discountType, setDiscountType] = useState('fixed'); // 'fixed' or 'percentage'
  const [discountValue, setDiscountValue] = useState(0);
  const [roundOffEnabled, setRoundOffEnabled] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  useEffect(() => {
    loadCustomers();
    loadItems();
  }, []);

  const nextBillNumber = useMemo(() => {
    const lastNum = bills.length > 0 ? bills.length + 1 : (shop?.startingBillNumber || 1);
    return generateBillNumber(shop?.billPrefix || 'INV', lastNum);
  }, [bills, shop]);

  const recentCustomers = customers.slice(0, 5);
  const quickItems = getMostUsedItems(8);

  // Totals Calculation
  const subtotal = Calc.calculateSubtotal(billItems);
  const gstAmount = gstEnabled ? Calc.calculateGST(subtotal, gstRate) : 0;
  const discountAmount = discountEnabled ? Calc.calculateDiscount(subtotal, discountType, discountValue) : 0;
  const tempTotal = subtotal + gstAmount - discountAmount;
  const roundOff = roundOffEnabled ? Calc.calculateRoundOff(tempTotal) : 0;
  const finalTotal = subtotal + gstAmount - discountAmount + roundOff;

  const addItem = (item = null) => {
    if (item) {
      setBillItems([...billItems, { ...item, id: Date.now(), quantity: 1 }]);
    } else {
      setBillItems([...billItems, { id: Date.now(), name: '', price: 0, quantity: 1 }]);
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
    if (billItems.some(i => !i.name || i.price <= 0)) return;

    const billData = {
      billNumber: nextBillNumber,
      customerName: customer.name,
      customerPhone: customer.phone,
      items: billItems,
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
      createdAt: new Date().toISOString()
    };

    const id = await saveBill(billData);
    navigate(`/send-bill/${id}`, { state: { billData } });
  };

  const isValid = billItems.length > 0 && billItems.every(i => i.name && i.price > 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header */}
      <header className="bg-white p-6 pb-4 flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-slate-50">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-800 font-black">
          <ArrowLeft className="w-5 h-5" /> New Bill
        </button>
        <div className="text-right">
          <div className="text-sm font-black text-primary uppercase tracking-widest">{nextBillNumber}</div>
          <div className="text-[10px] font-bold text-slate-400 mt-0.5">{new Date().toLocaleDateString('en-IN')} • {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Customer Section */}
        <div className="bg-white rounded-card border border-slate-100 shadow-sm p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Customer</h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 focus-within:border-primary focus-within:bg-white transition-all">
              <User className="w-4 h-4 text-slate-300" />
              <input 
                type="text" 
                placeholder="Customer name (optional)"
                className="bg-transparent w-full outline-none font-bold text-slate-700 h-6"
                value={customer.name}
                onChange={e => setCustomer({...customer, name: e.target.value})}
              />
            </div>
            
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 focus-within:border-primary focus-within:bg-white transition-all">
              <Phone className="w-4 h-4 text-slate-300" />
              <input 
                type="tel" 
                placeholder="Phone number (optional)"
                className="bg-transparent w-full outline-none font-bold text-slate-700 h-6"
                value={customer.phone}
                onChange={e => setCustomer({...customer, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Recent:</div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {recentCustomers.map(rc => (
                <button 
                  key={rc.id}
                  onClick={() => setCustomer({ name: rc.name, phone: rc.phone })}
                  className="bg-slate-50 border border-slate-100 rounded-full px-4 py-1.5 text-xs font-bold text-slate-600 active:bg-primary active:text-white transition-colors"
                >
                  {rc.name}
                </button>
              ))}
            </div>
          </div>

          {customer.phone && customers.find(c => c.phone === customer.phone)?.creditAmount > 0 && (
            <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl flex gap-3 mt-4">
                <span className="text-lg">⚠️</span>
                <div className="text-xs font-bold text-amber-900 leading-tight">
                    Owes {formatMoney(customers.find(c => c.phone === customer.phone).creditAmount)} from last visit
                </div>
            </div>
          )}
        </div>

        {/* Items Section */}
        <div className="bg-white rounded-card border border-slate-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Items</h3>
            <button onClick={() => addItem()} className="bg-emerald-50 text-primary px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add Item
            </button>
          </div>

          <div className="space-y-5">
            <AnimatePresence initial={false}>
              {billItems.map((bi) => (
                <motion.div 
                  key={bi.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex gap-3">
                    <div className="flex-1 flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 focus-within:border-primary focus-within:bg-white transition-all">
                      <Package className="w-4 h-4 text-slate-300" />
                      <input 
                        type="text" 
                        placeholder="Item name"
                        className="bg-transparent w-full outline-none font-black text-slate-800"
                        value={bi.name}
                        onChange={e => updateItem(bi.id, 'name', e.target.value)}
                      />
                    </div>
                    <button onClick={() => removeItem(bi.id)} className="w-12 flex items-center justify-center text-slate-300 active:text-red-500">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100">
                      <button onClick={() => updateItem(bi.id, 'quantity', Math.max(0.5, bi.quantity - 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded-xl shadow-sm text-red-500 active:scale-95 transition-transform"><Minus className="w-4 h-4" /></button>
                      <div className="w-10 text-center font-black text-sm">{bi.quantity}</div>
                      <button onClick={() => updateItem(bi.id, 'quantity', bi.quantity + 1)} className="w-8 h-8 flex items-center justify-center bg-primary rounded-xl shadow-sm text-white active:scale-95 transition-transform"><Plus className="w-4 h-4" /></button>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div className="flex items-center bg-slate-50 rounded-xl px-3 py-2 border border-slate-100 focus-within:border-primary transition-all w-28">
                        <span className="text-slate-400 font-bold mr-1">₹</span>
                        <input 
                          type="number" 
                          placeholder="0"
                          className="bg-transparent w-full outline-none font-bold text-slate-700 text-right h-6"
                          value={bi.price || ''}
                          onChange={e => updateItem(bi.id, 'price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total: <span className="text-sm font-black text-slate-900 ml-1">{formatMoney(bi.price * bi.quantity)}</span></div>
                    </div>
                  </div>
                  {bi !== billItems[billItems.length - 1] && <div className="border-b border-slate-50" />}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Quick Items Bar */}
        <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Top Items:</div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide px-2 -mx-2">
                {quickItems.map(qi => (
                    <motion.button
                        key={qi.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addItem({ name: qi.name, price: qi.price })}
                        className="flex-shrink-0 bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm flex flex-col items-center min-w-[100px]"
                    >
                        <div className="text-xs font-black text-slate-800">{qi.name}</div>
                        <div className="text-[10px] font-bold text-primary">{formatMoney(qi.price)}</div>
                    </motion.button>
                ))}
            </div>
        </div>

        {/* Price Summary Card */}
        <div className="bg-white rounded-card border border-slate-100 shadow-sm p-6 space-y-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-slate-600">Subtotal</div>
                    <div className="font-black text-slate-900">{formatMoney(subtotal)}</div>
                </div>

                {/* GST Toggle */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="text-sm font-bold text-slate-600">GST</div>
                            <button 
                                onClick={() => setGstEnabled(!gstEnabled)}
                                className={`w-10 h-6 rounded-full p-1 transition-colors ${gstEnabled ? 'bg-primary' : 'bg-slate-200'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${gstEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        {gstEnabled && <div className="font-black text-primary">+{formatMoney(gstAmount)}</div>}
                    </div>
                    {gstEnabled && (
                        <div className="flex gap-2 overflow-x-auto py-1">
                            {[0, 5, 12, 18, 28].map(rate => (
                                <button 
                                    key={rate} 
                                    onClick={() => setGstRate(rate)}
                                    className={`px-3 py-1 rounded-full text-xs font-black transition-colors ${gstRate === rate ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}
                                >
                                    {rate}%
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Discount Toggle */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="text-sm font-bold text-slate-600">Discount</div>
                            <button 
                                onClick={() => setDiscountEnabled(!discountEnabled)}
                                className={`w-10 h-6 rounded-full p-1 transition-colors ${discountEnabled ? 'bg-primary' : 'bg-slate-200'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${discountEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        {discountEnabled && <div className="font-black text-red-500">-{formatMoney(discountAmount)}</div>}
                    </div>
                    {discountEnabled && (
                        <div className="flex gap-3">
                            <div className="flex bg-slate-100 rounded-xl p-1">
                                <button onClick={() => setDiscountType('fixed')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${discountType === 'fixed' ? 'bg-white shadow-sm' : ''}`}>₹</button>
                                <button onClick={() => setDiscountType('percentage')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${discountType === 'percentage' ? 'bg-white shadow-sm' : ''}`}>%</button>
                            </div>
                            <input 
                                type="number" 
                                placeholder="0"
                                className="bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl text-sm font-bold w-20 text-right outline-none focus:border-primary"
                                value={discountValue || ''}
                                onChange={e => setDiscountValue(parseFloat(e.target.value) || 0)}
                            />
                        </div>
                    )}
                </div>

                {/* Round Off Toggle */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="text-sm font-bold text-slate-600">Round Off</div>
                        <button 
                            onClick={() => setRoundOffEnabled(!roundOffEnabled)}
                            className={`w-10 h-6 rounded-full p-1 transition-colors ${roundOffEnabled ? 'bg-primary' : 'bg-slate-200'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${roundOffEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                    </div>
                    {roundOffEnabled && <div className="font-bold text-slate-400 text-xs">{roundOff > 0 ? '+' : ''}{roundOff.toFixed(2)}</div>}
                </div>
            </div>

            <div className="border-t-2 border-slate-50 pt-4 flex items-center justify-between">
                <div className="text-xl font-black text-slate-900">TOTAL</div>
                <div className="text-3xl font-black text-primary">{formatMoney(finalTotal)}</div>
            </div>
        </div>

        {/* Payment Method */}
        <div className="p-2 space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Payment received via</h3>
            <div className="grid grid-cols-4 gap-2">
                {[
                    { id: 'cash', label: 'Cash', emoji: '💵' },
                    { id: 'upi', label: 'UPI', emoji: '📱' },
                    { id: 'card', label: 'Card', emoji: '💳' },
                    { id: 'credit', label: 'Credit', emoji: '🔖' }
                ].map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => setPaymentMethod(opt.id)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all ${
                            paymentMethod === opt.id 
                            ? 'bg-primary border-primary text-white shadow-lg' 
                            : 'bg-white border-slate-100 text-slate-600'
                        }`}
                    >
                        <span className="text-xl">{opt.emoji}</span>
                        <span className="text-[10px] font-black uppercase">{opt.label}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Notes */}
        <div className="bg-slate-100/50 rounded-2xl p-4 flex items-start gap-3">
            <MessageSquare className="w-4 h-4 text-slate-300 mt-1" />
            <textarea 
                placeholder="Add note (optional)"
                className="bg-transparent w-full outline-none text-sm font-bold text-slate-600 resize-none h-12"
                value={notes}
                onChange={e => setNotes(e.target.value)}
            />
        </div>
      </div>

      {/* Floating Calculator */}
      <button 
        onClick={() => setIsCalculatorOpen(true)}
        className="fixed bottom-32 right-6 w-14 h-14 bg-white text-slate-800 rounded-full shadow-2xl flex items-center justify-center border border-slate-50 active:scale-95 transition-transform z-40"
      >
        <Calculator className="w-6 h-6" />
      </button>

      {/* Create Bill Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-6 border-t border-slate-50 z-30 shadow-[0_-10px_30px_-5px_rgba(0,0,0,0.05)]">
        <button 
          onClick={handleCreateBill}
          disabled={!isValid}
          className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2 font-black text-lg transition-all shadow-xl ${
            isValid 
            ? 'bg-gradient-to-r from-primary to-emerald-600 text-white shadow-emerald-200 active:scale-95' 
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          Create Bill <ArrowLeft className="w-5 h-5 rotate-180" />
        </button>
      </div>
    </div>
  );
};

export default CreateBillScreen;
