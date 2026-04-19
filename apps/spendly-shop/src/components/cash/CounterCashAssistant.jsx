import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Minus, Wallet, ArrowRight, AlertCircle, 
  CheckCircle2, RefreshCcw, Banknote, X, ChevronRight,
  Calculator, History, Coins
} from 'lucide-react';
import { useWalletStore } from '../../store/walletStore';
import { getItemsByUserCurrency } from '../../constants/currencyNotes';
import { formatMoney } from '../../utils/formatMoney';
import NoteCard from './NoteCard';

const SORA = { fontFamily: "'Sora', sans-serif" };

// Helper for deep equality check to prevent infinite loops
const isSameNotes = (a, b) => {
    if (!a || !b) return a === b;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(k => a[k] === b[k]);
};

const CounterCashAssistant = ({ billAmount, currency = 'INR', onFinalize }) => {
    const { cashWallet } = useWalletStore();
    const lastReported = useRef(null);
    const shopInventory = cashWallet?.notes || {};
    const denominations = getItemsByUserCurrency(currency);

    const currencySymbol = useMemo(() => {
        const symbols = { 'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'AED': 'د.إ', 'JPY': '¥' };
        return symbols[currency] || '$';
    }, [currency]);

    const [customerNotes, setCustomerNotes] = useState({});
    const [selectedNotes, setSelectedNotes] = useState(null);

    // 1. Calculate Summary
    const totalReceived = useMemo(() => {
        return Object.entries(customerNotes).reduce((sum, [key, count]) => {
            const val = parseFloat(key.split('_')[0]);
            return sum + (val * count);
        }, 0);
    }, [customerNotes]);

    const changeDue = totalReceived - billAmount;

    // 2. Find All Logical Possibilities (Visual and Diverse)
    const possibilities = useMemo(() => {
        if (changeDue <= 0) return [];
        
        const results = [];
        const sorted = [...denominations].sort((a, b) => b.value - a.value);

        const find = (rem, idx, current) => {
            if (results.length >= 4) return; // Top 4 diverse options
            if (rem < 0.01 && rem > -0.01) {
                if (!results.some(r => JSON.stringify(r.notes) === JSON.stringify(current))) {
                    results.push({ notes: { ...current } });
                }
                return;
            }
            if (idx >= sorted.length) return;

            const item = sorted[idx];
            const key = `${item.value}_${item.type}`;
            const available = shopInventory[key] || 0;
            const canTake = Math.min(Math.floor(rem / item.value), available);

            for (let i = canTake; i >= 0; i--) {
                if (i > 0) current[key] = i;
                find(Math.round((rem - (i * item.value)) * 100) / 100, idx + 1, current);
                delete current[key];
                if (results.length >= 4) return;
            }
        };

        find(Math.round(changeDue * 100) / 100, 0, {});

        // Add "All Small" specifically if not already there
        if (results.length < 4) {
            const smallSorted = [...denominations].sort((a, b) => a.value - b.value);
            const findSmall = (rem, idx, current) => {
                if (results.length >= 6) return;
                if (rem < 0.01 && rem > -0.01) {
                    if (!results.some(r => JSON.stringify(r.notes) === JSON.stringify(current))) {
                        results.push({ notes: { ...current } });
                    }
                    return;
                }
                if (idx >= smallSorted.length) return;
                const item = smallSorted[idx];
                const key = `${item.value}_${item.type}`;
                const available = shopInventory[key] || 0;
                const i = Math.min(Math.floor(rem / item.value), available);
                if (i > 0) current[key] = i;
                findSmall(Math.round((rem - (i * item.value)) * 100) / 100, idx + 1, current);
            };
            findSmall(Math.round(changeDue * 100) / 100, 0, {});
        }

        return results;
    }, [changeDue, shopInventory, denominations]);

    const activeReturnNotes = selectedNotes || (possibilities[0]?.notes || {});

    const updateCustomerCount = (key, delta) => {
        setCustomerNotes(prev => ({
            ...prev,
            [key]: Math.max(0, (prev[key] || 0) + delta)
        }));
    };

    const canFinalize = totalReceived >= billAmount;

    // Intelligent State Synchronization: Auto-report changes to parent
    useEffect(() => {
        const newData = { 
            totalReceived, 
            notes: { given: customerNotes, received: activeReturnNotes } 
        };

        // Only report if data has actually changed to avoid infinite loops
        if (!lastReported.current || 
            lastReported.current.totalReceived !== newData.totalReceived ||
            !isSameNotes(lastReported.current.notes.given, newData.notes.given) ||
            !isSameNotes(lastReported.current.notes.received, newData.notes.received)
        ) {
            lastReported.current = newData;
            onFinalize(newData);
        }
    }, [customerNotes, activeReturnNotes, totalReceived, onFinalize]);

    return (
        <div className="flex flex-col gap-4 w-full max-w-[500px] mx-auto pb-8">
            
            {/* LARGE POS TERMINAL HEADER */}
            <div className="bg-white border-2 border-slate-100 rounded-[32px] overflow-hidden">
                <div className="p-6 bg-slate-50/50 border-b border-slate-100 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-[11px] font-[900] text-slate-400 uppercase tracking-widest leading-none">Bill Amount</p>
                        <p className="text-[32px] font-[900] text-slate-900 tracking-tight" style={SORA}>{formatMoney(billAmount, currency)}</p>
                    </div>
                    <div className="text-right space-y-1">
                        <p className="text-[11px] font-[900] text-slate-400 uppercase tracking-widest leading-none">Received</p>
                        <p className={`text-[32px] font-[900] tracking-tight ${totalReceived >= billAmount ? 'text-emerald-500' : 'text-slate-200'}`} style={SORA}>
                            {formatMoney(totalReceived, currency)}
                        </p>
                    </div>
                </div>

                {/* CASH INPUT GRID */}
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h4 className="text-[11px] font-[900] text-slate-400 uppercase tracking-widest">Select Customer Cash</h4>
                        {totalReceived > 0 && <button onClick={() => setCustomerNotes({})} className="text-[10px] font-[900] text-rose-500 uppercase tracking-widest active:scale-95 transition-all">Clear</button>}
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                        {denominations.map(item => {
                            const key = `${item.value}_${item.type}`;
                            const count = customerNotes[key] || 0;
                            return (
                                <button
                                    key={key}
                                    onClick={() => updateCustomerCount(key, 1)}
                                    className={`relative flex flex-col items-center gap-2 p-3 rounded-3xl border-2 transition-all duration-300 ${
                                        count > 0 
                                            ? 'bg-slate-900 border-slate-900 text-white scale-[1.05]' 
                                            : 'bg-white border-slate-50 hover:border-slate-200 grayscale opacity-60'
                                    }`}
                                >
                                    <NoteCard value={item.value} type={item.type} currency={currency} size="sm" showCount={false} />
                                    <span className={`text-[12px] font-[900] ${count > 0 ? 'text-white' : 'text-slate-500'}`}>{item.value}</span>
                                    {count > 0 && (
                                        <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-emerald-500 text-white font-[902] text-[11px] flex items-center justify-center border-2 border-white">
                                            {count}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* RETURN CHANGE SECTION - "SIMPLE & VISUAL" */}
            <AnimatePresence>
                {totalReceived > billAmount && (
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border-2 border-slate-100 rounded-[32px] overflow-hidden"
                    >
                        <div className="p-6 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between">
                            <div>
                                <h4 className="text-[17px] font-[900] text-emerald-900 leading-tight" style={SORA}>Return Change</h4>
                                <p className="text-[11px] font-[802] text-emerald-600 uppercase tracking-widest mt-0.5">Pick the easiest combo</p>
                            </div>
                            <div className="p-4 bg-white rounded-3xl border border-emerald-100">
                                <p className="text-[24px] font-[900] text-emerald-600 tracking-tighter" style={SORA}>{formatMoney(changeDue, currency)}</p>
                            </div>
                        </div>

                        <div className="p-6 space-y-4 overflow-hidden">
                            <h5 className="text-[11px] font-[900] text-slate-400 uppercase tracking-widest px-2">Combo Options</h5>
                            
                            {possibilities.length > 0 ? (
                                <div className="space-y-3">
                                    {possibilities.map((pos, idx) => {
                                        const isActive = JSON.stringify(activeReturnNotes) === JSON.stringify(pos.notes);
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedNotes(pos.notes)}
                                                className={`w-full relative rounded-[32px] border-2 transition-all p-5 flex flex-col gap-4 ${
                                                    isActive 
                                                        ? 'bg-slate-900 border-slate-900' 
                                                        : 'bg-white border-slate-50 hover:border-slate-200'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between px-1">
                                                    <div className="flex items-center gap-2">
                                                        {idx === 0 && <Calculator className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />}
                                                        <span className={`text-[12px] font-[902] uppercase tracking-widest ${isActive ? 'text-white/60' : 'text-slate-400'}`}>
                                                            {idx === 0 ? 'Optimal Mix' : `Option ${idx + 1}`}
                                                        </span>
                                                    </div>
                                                    {isActive && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                                                </div>

                                                {/* THE VISUAL NOTES - "DIRECT SHOW" */}
                                                <div className="flex flex-wrap gap-x-2 gap-y-2 items-center bg-slate-50/50 rounded-xl p-3 min-h-[60px]">
                                                    {Object.entries(pos.notes).map(([key, count]) => {
                                                        const [val, type] = key.split('_');
                                                        return Array.from({ length: count }).map((_, i) => (
                                                            <div key={`${key}-${i}`} className="flex flex-col items-center gap-1 focus-within:scale-105 transition-transform">
                                                                <div className="transform scale-[0.7] origin-center">
                                                                    <NoteCard value={parseFloat(val)} type={type} currency={currency} size="sm" showCount={false} isHighlighted={isActive} />
                                                                </div>
                                                                <span className={`text-[10px] font-[902] px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-white border border-slate-100 text-slate-500'}`}>
                                                                    {currencySymbol}{val}
                                                                </span>
                                                            </div>
                                                        ));
                                                    })}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-6 bg-rose-50 rounded-[32px] border-2 border-rose-100 flex items-center gap-4 text-rose-800">
                                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                                    <p className="text-[13px] font-[800]">No exact combo in stock. Please mix notes manually.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ACTION FOOTER */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[500px] z-50">
                <button 
                    onClick={() => onFinalize({ 
                        totalReceived, 
                        notes: { given: customerNotes, received: activeReturnNotes } 
                    })}
                    disabled={!canFinalize}
                    className={`w-full py-6 rounded-full text-[17px] font-[902] transition-all flex items-center justify-center gap-3 uppercase tracking-widest ${
                        canFinalize 
                            ? 'bg-slate-900 text-white active:scale-[0.98]' 
                            : 'bg-white/80 backdrop-blur-xl text-slate-300 border border-slate-100'
                    }`}
                >
                    Complete Bill <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default CounterCashAssistant;
