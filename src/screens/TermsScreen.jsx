import { motion } from 'framer-motion'
import { X, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function TermsScreen() {
  const navigate = useNavigate()
  const S = { fontFamily: "'Inter', sans-serif" }

  const sections = [
    {
      title: "Local Data Stewardship",
      content: "Spendly is a local-first application. All financial records, scanned receipts, and profile data are stored exclusively on your device's internal storage. We do not maintain any cloud-based copies of your information."
    },
    {
      title: "Liability & Loss",
      content: "As we do not synchronize data to external servers, you are solely responsible for managing your own backups (via our Export Backup tool). Spendly is not liable for data loss due to device damage, app deletion, or forgotten security PINs."
    },
    {
      title: "Barcode Lookup API",
      content: "When using the Scan feature, your device may send anonymized barcode IDs to Open Food Facts (or similar providers) for product matching. No personal financial information is ever transmitted during this process."
    },
    {
      title: "Authentication",
      content: "Security measures like PINs, Patterns, and Biometrics are handled locally by your device OS. Decoy Mode is a privacy-at-a-glance feature only; it does not replace the requirement for high-level personal diligence."
    }
  ]

  return (
    <div className="min-h-dvh bg-white flex flex-col safe-top pb-12">
      <div className="flex items-center justify-between px-8 mt-10 mb-12 sticky top-0 bg-white z-20 pb-4 border-b border-[#F6F6F6]">
        <div>
          <h1 className="text-[28px] font-[800] text-black tracking-tight" style={S}>Terms of Service</h1>
          <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-[0.2em]" style={S}>Last updated: April 2026</p>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
          className="w-12 h-12 rounded-full bg-[#F6F6F6] border border-[#EEEEEE] flex items-center justify-center">
          <X className="w-6 h-6 text-black" strokeWidth={2.5} />
        </motion.button>
      </div>

      <div className="px-8 flex-1 overflow-y-auto space-y-12">
        <div className="p-8 rounded-[40px] bg-black text-white shadow-2xl shadow-black/10 flex flex-col items-center">
            <ShieldCheck className="w-12 h-12 mb-4 opacity-90 text-white" strokeWidth={2.5} />
            <h3 className="text-[18px] font-[800] mb-2 text-center" style={S}>User Agreement</h3>
            <p className="text-[13px] font-[500] text-white/50 text-center leading-relaxed" style={S}>By using Spendly, you acknowledge that your financial data is your exclusive property and responsibility.</p>
        </div>

        {sections.map((sec, idx) => (
          <div key={idx}>
            <h2 className="text-[18px] font-[800] text-black mb-4 tracking-tight" style={S}>{sec.title}</h2>
            <p className="text-[15px] font-[500] text-[#666666] leading-[1.6]" style={S}>{sec.content}</p>
          </div>
        ))}

        <div className="pt-8 border-t border-[#F6F6F6] text-center">
          <p className="text-[11px] font-[800] text-[#D8D8D8] uppercase tracking-[0.3em]" style={S}>Final Protocol SEAL_v1.0.4</p>
        </div>
      </div>
    </div>
  )
}
