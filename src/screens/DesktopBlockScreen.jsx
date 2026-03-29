// Desktop block screen — shows when screen width > 1024px
import { motion } from 'framer-motion'
import { Smartphone } from 'lucide-react'

export default function DesktopBlockScreen() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-sm"
      >
        {/* App icon */}
        <div className="w-24 h-24 rounded-[28px] mx-auto mb-6 flex items-center justify-center text-5xl"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', boxShadow: '0 8px 28px rgba(124,58,237,0.35)' }}>
          💸
        </div>

        <h1 className="text-[32px] font-sora font-bold text-purple-700 mb-3">Spendly</h1>
        <div className="w-12 h-1 bg-purple-200 rounded-full mx-auto mb-6" />

        <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-5">
          <Smartphone className="w-9 h-9 text-purple-400" />
        </div>

        <h2 className="text-[20px] font-sora font-semibold text-gray-800 mb-3">
          📱 Spendly is made for phones and tablets
        </h2>
        <p className="text-[15px] text-gray-400 leading-relaxed">
          Please open Spendly on your phone or tablet for the best experience.
          Scan the QR code below or visit the URL on your mobile device.
        </p>

        <div className="mt-8 p-4 bg-purple-50 rounded-2xl">
          <p className="text-sm text-purple-600 font-medium">
            💡 Add it to your Home Screen for the full app experience!
          </p>
        </div>
      </motion.div>
    </div>
  )
}
