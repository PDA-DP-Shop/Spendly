import { motion } from 'framer-motion'
import { X, Lock, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PrivacyPolicyScreen() {
  const navigate = useNavigate()
  const S = { fontFamily: "'Inter', sans-serif" }

  const sections = [
    {
      title: "Data Sovereignty",
      content: "Spendly operates as an offline-first PWA. Your personal financial records, budget limits, and category preferences are stored purely in your browser's IndexedDB. We do not maintain any cloud databases or synchronization services."
    },
    {
      title: "No Tracking & No Ads",
      content: "Spendly does not use any tracking pixels, analytics cookies, or targeted advertising services. Your financial consumption patterns are entirely private and stay strictly within the confines of your device storage."
    },
    {
      title: "Scanner & OCR Privacy",
      content: "When you scan a receipt or a barcode, all image processing (OCR) is performed locally on your device's CPU/GPU. No images of your receipts are ever uploaded to any cloud service."
    },
    {
      title: "Third Party Lookup",
      content: "Barcode lookups are performed by sending the barcode ID to Open Food Facts API (an open database). No association between your identity and the scanned product is made during this request."
    },
    {
      title: "Encryption",
      content: "Optional security (PIN, Pattern) is encrypted using AES-256 standard before being stored in your device's secure local storage. If you lose your PIN, we cannot recover your data."
    }
  ]

  return (
    <div className="min-h-dvh bg-white flex flex-col safe-top pb-12">
      <div className="flex items-center justify-between px-8 mt-10 mb-12 sticky top-0 bg-white z-20 pb-4 border-b border-[#F6F6F6]">
        <div>
          <h1 className="text-[28px] font-[800] text-black tracking-tight" style={S}>Privacy Policy</h1>
          <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-[0.2em]" style={S}>Last updated: April 2026</p>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
          className="w-12 h-12 rounded-full bg-[#F6F6F6] border border-[#EEEEEE] flex items-center justify-center">
          <X className="w-6 h-6 text-black" strokeWidth={2.5} />
        </motion.button>
      </div>

      <div className="px-8 flex-1 overflow-y-auto space-y-12">
        <div className="p-8 rounded-[40px] bg-black text-white shadow-2xl shadow-black/10 flex flex-col items-center">
            <EyeOff className="w-12 h-12 mb-4 opacity-90 text-white" strokeWidth={2.5} />
            <h3 className="text-[18px] font-[800] mb-2 text-center" style={S}>Zero Leak Commitment</h3>
            <p className="text-[13px] font-[500] text-white/50 text-center leading-relaxed" style={S}>Every record, scan, and budget limit stays on your device. Period.</p>
        </div>

        {sections.map((sec, idx) => (
          <div key={idx}>
            <h2 className="text-[18px] font-[800] text-black mb-4 tracking-tight" style={S}>{sec.title}</h2>
            <p className="text-[15px] font-[500] text-[#666666] leading-[1.6]" style={S}>{sec.content}</p>
          </div>
        ))}

        <div className="pt-8 border-t border-[#F6F6F6] text-center">
          <p className="text-[11px] font-[800] text-[#D8D8D8] uppercase tracking-[0.3em]" style={S}>Final Integrity SEAL_v1.0.4</p>
        </div>
      </div>
    </div>
  )
}
