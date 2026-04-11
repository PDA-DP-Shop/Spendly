/**
 * Scan Result Card - World-Class Premium HUD
 * High-end glassmorphic slide-up for data verification
 */
import { motion } from 'framer-motion'
import { Check, Edit3, X, Receipt, Package, QrCode, ScanBarcode, ArrowRight } from 'lucide-react'

export default function ScanResultCard({ result, onConfirm, onEdit, onCancel }) {
  const S = { fontFamily: "'Plus Jakarta Sans', sans-serif" }
  
  if (!result) return null

  const { type, data } = result
  const title = type === 'BILL' ? 'Neural Bill Analysis' : 
                type === 'PRODUCT' ? 'Smart Product ID' :
                type === 'BARCODE' ? 'Barcode Intelligence' :
                type === 'QR' ? 'UPI Matrix Scan' : 'AI Scan Result'

  const icon = type === 'BILL' ? <Receipt className="text-blue-500" /> :
               type === 'PRODUCT' ? <Package className="text-emerald-500" /> :
               type === 'BARCODE' ? <ScanBarcode className="text-purple-500" /> :
               <QrCode className="text-indigo-500" />

  const accentColor = type === 'BILL' ? '#3B82F6' : 
                      type === 'PRODUCT' ? '#10B981' : 
                      '#8B5CF6'

  return (
    <motion.div 
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-2xl rounded-t-[48px] shadow-[0_-30px_100px_rgba(0,0,0,0.25)] border-t border-white/40 pb-safe px-8 pt-7"
    >
      {/* Premium Pull Handle */}
      <div className="flex justify-center mb-7">
        <div className="w-16 h-1.5 rounded-full bg-black/5" />
      </div>

      {/* Header Intelligence */}
      <div className="flex items-center gap-5 mb-9">
        <div className="relative">
          <motion.div 
             animate={{ scale: [0.95, 1.05, 0.95], rotate: [0, 5, -5, 0] }}
             transition={{ duration: 4, repeat: Infinity }}
             className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center border border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
          >
            {icon}
          </motion.div>
          {data.isVerified && (
            <div className="absolute -top-2 -right-2 p-1.5 rounded-full bg-emerald-500 shadow-lg border-2 border-white">
              <Check className="w-3 h-3 text-white" strokeWidth={4} />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
             <span className="text-[10px] font-[900] text-black/30 uppercase tracking-[0.2em]" style={S}>
                {title}
             </span>
             {data.confidence > 80 && (
               <div className="px-2 py-0.5 rounded-full bg-black/5 flex items-center gap-1">
                 <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[8px] font-[900] text-black/50 uppercase">Precision Locked</span>
               </div>
             )}
          </div>
          <h2 className="text-[22px] font-[950] text-black tracking-tighter leading-tight line-clamp-1" style={S}>
            {data.shopName || 'Market Item'}
          </h2>
        </div>

        <button 
          onClick={onCancel} 
          className="w-11 h-11 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors"
        >
          <X className="w-5 h-5 text-black/40" strokeWidth={2.5} />
        </button>
      </div>

      {/* Structured Data Matrix */}
      <div className="grid grid-cols-2 gap-4 mb-9">
        <div className="bg-black/[0.03] p-6 rounded-[32px] border border-black/[0.04]">
          <p className="text-[10px] font-[900] text-black/30 uppercase tracking-[0.2em] mb-2" style={S}>Financial Total</p>
          <div className="flex items-center gap-1">
             <span className="text-[24px] font-[950] text-black" style={S}>
               {data.amount > 0 ? `₹${data.amount}` : '—'}
             </span>
          </div>
        </div>
        <div className="bg-black/[0.03] p-6 rounded-[32px] border border-black/[0.04]">
          <p className="text-[10px] font-[900] text-black/30 uppercase tracking-[0.2em] mb-2" style={S}>Neural Category</p>
          <span className="text-[16px] font-[900] text-black capitalize flex items-center gap-2" style={S}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
            {data.category || 'Shopping'}
          </span>
        </div>
      </div>

      {/* Actions Layer */}
      <div className="flex flex-col gap-4 mb-8">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onConfirm}
          className="group relative w-full py-6 rounded-3xl bg-black text-white overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
        >
          <div className="relative z-10 flex items-center justify-center gap-3">
             <Check className="w-6 h-6" strokeWidth={3} />
             <span className="text-[18px] font-[900] tracking-tight" style={S}>Commit Transaction</span>
          </div>
          <motion.div 
            initial={{ left: '-100%' }}
            whileHover={{ left: '100%' }}
            transition={{ duration: 0.6 }}
            className="absolute top-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
          />
        </motion.button>

        <button 
          onClick={onEdit}
          className="w-full py-5 rounded-3xl bg-white text-black text-[15px] font-[900] border-2 border-black/5 flex items-center justify-center gap-2 hover:bg-black/5 transition-colors"
          style={S}
        >
          <Edit3 className="w-4 h-4" />
          Refine Details
          <ArrowRight className="w-4 h-4 text-black/20" />
        </button>
      </div>
    </motion.div>
  )
}
