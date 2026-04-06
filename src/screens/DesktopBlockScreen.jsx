// Desktop block screen — redesigned for White Premium
import { motion } from 'framer-motion'
import { Smartphone, ArrowRight } from 'lucide-react'

export default function DesktopBlockScreen() {
  const S = { fontFamily: "'Inter', sans-serif" }
  const APP_URL = "https://spendly-24hrs.pages.dev"

  return (
    <div className="min-h-dvh bg-white flex flex-col items-center justify-center text-center px-8 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F6F6F6] rounded-full -mr-64 -mt-64 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#F6F6F6] rounded-full -ml-64 -mb-64 blur-3xl opacity-50" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 25 }}
        className="max-w-md relative z-10"
      >
        {/* App icon */}
        <div className="w-[100px] h-[100px] rounded-[32px] mx-auto mb-10 flex items-center justify-center shadow-2xl shadow-black/10"
          style={{ background: 'black' }}>
          <Smartphone className="w-10 h-10 text-white" strokeWidth={2.5} />
        </div>

        <h1 className="text-[36px] font-[800] text-black mb-4 tracking-tighter" style={S}>Spendly</h1>
        
        <p className="text-[15px] font-[500] text-[#AFAFAF] mb-12 max-w-sm mx-auto leading-relaxed" style={S}>
          Open Spendly on your phone for the high-performance mobile experience. 
          Scan or visit to begin tracking.
        </p>

        {/* QR Code Section */}
        <div className="bg-[#F6F6F6] p-8 rounded-[48px] border border-[#EEEEEE] mb-10 inline-block">
          <div className="bg-white p-6 rounded-[32px] shadow-sm mb-6 flex items-center justify-center border border-[#EEEEEE]">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(APP_URL)}`}
              alt="Scan to open Spendly"
              className="w-[180px] h-[180px]"
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-[13px] font-[800] text-black uppercase tracking-widest" style={S}>Scan to Start</p>
            <a href={APP_URL} className="text-[11px] font-[700] text-[#AFAFAF] flex items-center gap-1.5 hover:text-black transition-colors" style={S}>
              {APP_URL.replace('https://', '')} <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center">
            <div className="px-5 py-2 rounded-full bg-black text-white inline-flex items-center gap-2 mb-4">
                <span className="text-[10px] font-[800] uppercase tracking-widest" style={S}>PWA Ready</span>
            </div>
            <p className="text-[11px] font-[700] text-[#D8D8D8] uppercase tracking-[0.3em]" style={S}>
                 BUILD v1.0.4 // LOCAL_ONLY
            </p>
        </div>
      </motion.div>
    </div>
  )
}

