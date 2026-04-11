import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { 
  Bell, Receipt, Users, Plus, 
  ChevronRight, CreditCard, Banknote, 
  TrendingUp, Clock, Trophy, Store
} from 'lucide-react';

import { useShopStore } from '../store/shopStore';
import { useBillStore } from '../store/billStore';
import { useCustomerStore } from '../store/customerStore';
import { useItemsStore } from '../store/itemsStore';
import { formatMoney } from '../utils/formatMoney';
import { formatDate } from '../utils/formatDate';

const HomeScreen = () => {
  const navigate = useNavigate();
  const { shop } = useShopStore();
  const { bills, loadBills, getTodaysBills } = useBillStore();
  const { customers, loadCustomers } = useCustomerStore();
  const { items, loadItems, getMostUsedItems } = useItemsStore();

  useEffect(() => {
    loadBills();
    loadCustomers();
    loadItems();
  }, []);

  const todaysBills = getTodaysBills();
  const totalSales = todaysBills.reduce((sum, b) => sum + (b.total || 0), 0);
  const cashSales = todaysBills.filter(b => b.paymentMethod === 'cash').reduce((sum, b) => sum + (b.total || 0), 0);
  const upiSales = todaysBills.filter(b => b.paymentMethod === 'upi').reduce((sum, b) => sum + (b.total || 0), 0);
  
  const quickItems = getMostUsedItems(6);
  const recentBills = bills.slice(0, 8);

  // Animation Variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 overflow-x-hidden">
      {/* Top Header */}
      <header className="bg-white p-6 pb-4 flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-slate-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-100">
            {shop?.logoEmoji || '🏪'}
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-tight">{shop?.name || 'My Shop'}</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Admin Dashboard</p>
          </div>
        </div>
        <div className="relative">
          <div className="w-10 h-10 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform">
            <Bell className="w-5 h-5 text-slate-400" />
            <div className="absolute top-0 right-0 w-3 h-3 bg-primary border-2 border-white rounded-full"></div>
          </div>
        </div>
      </header>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="p-6 space-y-6"
      >
        {/* Greeting */}
        <motion.div variants={item}>
          <h2 className="text-2xl font-black text-slate-900 leading-tight">Good morning, {shop?.ownerName || 'Owner'}! 👋</h2>
          <p className="text-slate-400 font-bold text-sm mt-1">{formatDate(new Date())}</p>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Today's Sales", val: formatMoney(totalSales), icon: TrendingUp },
            { label: "Bills Today", val: todaysBills.length, icon: Receipt },
            { label: "Customers", val: customers.length, icon: Users },
          ].map((stat, idx) => (
            <motion.div 
              key={idx}
              variants={item}
              className="bg-white p-3 rounded-card border border-slate-100 shadow-sm shadow-slate-100 flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 mb-3">
                <stat.icon className="w-full h-full text-primary opacity-20" />
              </div>
              <div className="text-sm font-black text-primary">{stat.val}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Big New Bill Button */}
        <motion.button 
          variants={item}
          onClick={() => navigate('/create-bill')}
          className="w-full bg-gradient-to-r from-primary to-emerald-600 p-5 rounded-card flex items-center justify-between text-white shadow-xl shadow-emerald-100 active:scale-95 transition-transform relative overflow-hidden group"
        >
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:rotate-12 transition-transform">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <div className="text-xl font-bold">Create New Bill</div>
              <div className="text-xs font-bold text-emerald-100 uppercase tracking-widest opacity-80">Tap to start billing →</div>
            </div>
          </div>
          <div className="absolute top-1/2 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        </motion.button>

        {/* Today Earnings Card */}
        <motion.div 
          variants={item}
          className="bg-emerald-900 rounded-card p-6 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-300 opacity-80 mb-2">Today's Total Earnings</div>
            <div className="text-4xl font-black mb-6">{formatMoney(totalSales)}</div>
            
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <Banknote className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-emerald-400 uppercase">Cash</div>
                  <div className="font-bold">{formatMoney(cashSales)}</div>
                </div>
              </div>
              <div className="w-px h-8 bg-white/10 mx-4"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-emerald-400 uppercase">UPI</div>
                  <div className="font-bold">{formatMoney(upiSales)}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-800 rounded-full opacity-50 blur-3xl"></div>
        </motion.div>

        {/* Quick Items Row */}
        <motion.div variants={item} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quick Add</h3>
            <button className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-1 active:opacity-50">
              Manage <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
            {quickItems.map((it, idx) => (
              <button 
                key={idx}
                className="flex-shrink-0 bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm active:scale-95 transition-transform flex flex-col gap-1 min-w-[120px]"
              >
                <div className="font-black text-slate-800 text-sm whitespace-nowrap">{it.name}</div>
                <div className="font-bold text-primary text-xs">{formatMoney(it.price)}</div>
              </button>
            ))}
            <button className="flex-shrink-0 bg-emerald-50 border border-emerald-100 rounded-2xl px-6 py-4 flex items-center gap-2 text-primary font-bold text-sm">
              <Plus className="w-4 h-4" /> Add Items
            </button>
          </div>
        </motion.div>

        {/* Recent Bills List */}
        <motion.div variants={item} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Bills</h3>
            <button onClick={() => navigate('/bills-history')} className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-1 active:opacity-50">
              See All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {recentBills.map((bill, idx) => (
              <div 
                key={bill.id || idx}
                onClick={() => navigate(`/bill/${bill.id}`)}
                className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between active:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-50 to-emerald-100 text-primary font-black rounded-2xl flex items-center justify-center text-lg shadow-sm border border-emerald-50 shadow-emerald-50">
                    {bill.customerName ? bill.customerName.charAt(0).toUpperCase() : 'W'}
                  </div>
                  <div>
                    <div className="font-black text-slate-900 leading-tight">{bill.customerName || 'Walk-in Customer'}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 flex items-center gap-2">
                      {formatDate(bill.createdAt, 'time')} • {bill.paymentMethod || 'CASH'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-primary leading-tight">{formatMoney(bill.total)}</div>
                  <div className="mt-1">
                    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${
                      bill.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {bill.status === 'paid' ? 'Sent ✅' : 'Pending ⏳'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {recentBills.length === 0 && (
              <div className="p-12 text-center bg-white rounded-card border-2 border-dashed border-slate-100">
                <Store className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold text-sm">No bills generated yet.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Insight Card */}
        <motion.div 
          variants={item}
          className="bg-white p-6 rounded-card border-l-4 border-primary shadow-lg shadow-slate-100 space-y-4"
        >
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Trophy className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-black text-slate-900 text-sm">Daily Insight</h3>
          </div>
          <div className="space-y-3">
            {[
              { icon: Trophy, text: "Best seller today: Parle-G", color: "text-amber-500" },
              { icon: TrendingUp, text: "20% more sales than yesterday", color: "text-emerald-500" },
              { icon: Clock, text: "Busiest hour: 11am - 12pm", color: "text-primary" }
            ].map((insight, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className={`w-1 h-1 rounded-full bg-slate-200`}></div>
                <p className="text-sm font-bold text-slate-600">{insight.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Floating Bottom Tab Bar Placeholder */}
      <div className="fixed bottom-6 left-6 right-6 h-18 bg-white/80 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl flex items-center justify-around px-4 z-40">
        <Store className="w-6 h-6 text-primary" />
        <Receipt className="w-6 h-6 text-slate-300" />
        <Users className="w-6 h-6 text-slate-300" />
        <Bell className="w-6 h-6 text-slate-300" />
      </div>
    </div>
  );
};

export default HomeScreen;
