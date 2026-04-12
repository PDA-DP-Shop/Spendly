import React from 'react'
import { motion } from 'framer-motion'
import { Store, ArrowRight, ShieldCheck, Zap, Sparkles, QrCode, ClipboardList, TrendingUp } from 'lucide-react'

export default function DesktopBlockScreen() {
  const S = { fontFamily: "'Inter', sans-serif" }
  const USER_APP_URL = "https://spendly-24hrs.pages.dev"
  const SHOP_APP_URL = "https://spendly-shop.pages.dev"

  // Animation variants
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  }

  const itemVars = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring', damping: 25, stiffness: 300 } 
    }
  }

  return (
    <div className="w-full h-full min-h-screen bg-[#F8FAFC] flex overflow-hidden font-sans relative selection:bg-black selection:text-white">
      
      {/* Dynamic Background Blurs for Shop (Emerald/Teal Theme) */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] bg-emerald-100/50 rounded-full blur-[120px] pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] bg-teal-100/50 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />
      <div className="absolute top-[20%] right-[15%] w-[30%] h-[40%] bg-cyan-100/40 rounded-full blur-[80px] pointer-events-none mix-blend-multiply" />

      {/* Left Content Area — Value Proposition */}
      <div className="flex-1 flex flex-col justify-center px-16 lg:px-24 xl:px-32 relative z-10">
        
        {/* Brand Header */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute top-12 left-16 lg:left-24 xl:left-32 flex items-center gap-3"
        >
          <img 
            src="/spendly-logo.png" 
            alt="Spendly Logo" 
            className="w-10 h-10 shadow-lg shadow-black/10" 
            style={{ borderRadius: '50%' }} 
          />
          <span className="text-[20px] font-[900] text-black tracking-tight" style={S}>Spendly Shop</span>
        </motion.div>

        <motion.div variants={containerVars} initial="hidden" animate="show" className="max-w-2xl mt-12">
          
          <motion.div variants={itemVars} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#F1F5F9] shadow-sm mb-8">
            <Sparkles className="w-4 h-4 text-[#10B981]" />
            <span className="text-[11px] font-[800] uppercase tracking-widest text-[#64748B]">Merchant Exclusive</span>
          </motion.div>

          <motion.h1 variants={itemVars} className="text-[56px] xl:text-[72px] font-[900] text-black leading-[1.05] tracking-tighter mb-6">
            Private offline <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-900">merchant tools.</span>
          </motion.h1>

          <motion.p variants={itemVars} className="text-[18px] xl:text-[20px] font-[500] text-[#64748B] leading-relaxed mb-12 max-w-xl">
            Spendly Shop is a 100% offline terminal for your business. Because it runs complex local databases to ensure zero data harvesting, it requires the power of your mobile device.
          </motion.p>

          <motion.div variants={itemVars} className="grid grid-cols-2 gap-6 pb-8">
            <div className="flex gap-4 p-5 rounded-3xl bg-white shadow-sm border border-[#F1F5F9] hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-[12px] bg-emerald-50 flex flex-shrink-0 items-center justify-center text-[#10B981]">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[13px] font-[800] text-black">Instant Billing</h3>
                <p className="text-[11px] font-[500] text-[#94A3B8] mt-1 leading-relaxed">Lightning-fast cart system. Hand off transactions to customers instantly via QR.</p>
              </div>
            </div>
            
            <div className="flex gap-4 p-5 rounded-3xl bg-white shadow-sm border border-[#F1F5F9] hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-[12px] bg-red-50 flex flex-shrink-0 items-center justify-center text-[#EF4444]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[13px] font-[800] text-black">No Cloud Exfil</h3>
                <p className="text-[11px] font-[500] text-[#94A3B8] mt-1 leading-relaxed">Your shop data and customer logs never leave your physical terminal.</p>
              </div>
            </div>

            <div className="flex gap-4 p-5 rounded-3xl bg-white shadow-sm border border-[#F1F5F9] hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-[12px] bg-amber-50 flex flex-shrink-0 items-center justify-center text-[#F59E0B]">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[13px] font-[800] text-black">Ledger & Inventory</h3>
                <p className="text-[11px] font-[500] text-[#94A3B8] mt-1 leading-relaxed">Seamlessly track credits and log reusable business products locally.</p>
              </div>
            </div>

            <div className="flex gap-4 p-5 rounded-3xl bg-white shadow-sm border border-[#F1F5F9] hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-[12px] bg-blue-50 flex flex-shrink-0 items-center justify-center text-[#3B82F6]">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[13px] font-[800] text-black">Sales Analytics</h3>
                <p className="text-[11px] font-[500] text-[#94A3B8] mt-1 leading-relaxed">View daily aggregated sales trends and high-level business intelligence.</p>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>

      {/* Right Content Area — The QR Portal */}
      <div className="flex-1 flex flex-col xl:flex-row items-center justify-center gap-8 relative p-12">
        
        {/* Card 1: Shop App (Prioritized for this screen) */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="relative w-full max-w-[320px] aspect-[4/5] bg-white rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-[#F1F5F9]/60 p-8 flex flex-col items-center justify-between group hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] transition-all duration-700 hover:-translate-y-2 z-10"
        >
          {/* QR Container */}
          <div className="flex flex-col items-center justify-center w-full relative mt-4">
            <div className="absolute inset-[-20px] bg-gradient-to-tr from-emerald-50 to-teal-50 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(SHOP_APP_URL)}&color=000000&bgcolor=ffffff`}
              alt="Scan to open Spendly Shop"
              className="w-[180px] h-[180px] relative z-10 rounded-2xl shadow-sm mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Scanning Laser Animation */}
            <motion.div 
              animate={{ top: ['10%', '90%', '10%'] }}
              transition={{ duration: 4, ease: "linear", repeat: Infinity }}
              className="absolute left-[15%] right-[15%] h-0.5 bg-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.6)] z-20 opacity-0 group-hover:opacity-100"
            />
          </div>

          <div className="mt-8 text-center w-full">
            <h2 className="text-[13px] font-[900] text-black uppercase tracking-[0.2em] mb-2" style={S}>Merchant Terminal</h2>
            <a href={SHOP_APP_URL} className="inline-flex items-center gap-2 text-[12px] font-[600] text-[#94A3B8] hover:text-black transition-colors" style={S}>
              <span className="font-mono bg-[#F1F5F9] px-2 py-0.5 rounded-md text-[10px]">{SHOP_APP_URL.replace('https://', '')}</span>
            </a>
          </div>
        </motion.div>

        {/* Card 2: User App */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4, delay: 0.2 }}
          className="relative w-full max-w-[320px] aspect-[4/5] bg-white rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-[#F1F5F9]/60 p-8 flex flex-col items-center justify-between group hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] transition-all duration-700 hover:-translate-y-2 z-10 opacity-75 hover:opacity-100"
        >
          {/* QR Container */}
          <div className="flex flex-col items-center justify-center w-full relative mt-4">
            <div className="absolute inset-[-20px] bg-gradient-to-tr from-blue-50 to-purple-50 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(USER_APP_URL)}&color=000000&bgcolor=ffffff`}
              alt="Scan to open Spendly Personal"
              className="w-[180px] h-[180px] relative z-10 rounded-2xl shadow-sm mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Scanning Laser Animation */}
            <motion.div 
              animate={{ top: ['10%', '90%', '10%'] }}
              transition={{ duration: 4, ease: "linear", repeat: Infinity }}
              className="absolute left-[15%] right-[15%] h-0.5 bg-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.6)] z-20 opacity-0 group-hover:opacity-100"
            />
          </div>

          <div className="mt-8 text-center w-full">
            <h2 className="text-[13px] font-[900] text-black uppercase tracking-[0.2em] mb-2" style={S}>Users & Customers</h2>
            <a href={USER_APP_URL} className="inline-flex items-center gap-2 text-[12px] font-[600] text-[#94A3B8] hover:text-black transition-colors" style={S}>
              <span className="font-mono bg-[#F1F5F9] px-2 py-0.5 rounded-md text-[10px]">{USER_APP_URL.replace('https://', '')}</span>
            </a>
          </div>
        </motion.div>

        {/* Global decorative background element for cards area */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#F8FAFC] rounded-[64px] border border-[#F1F5F9] -z-10" />
      </div>

    </div>
  )
}
