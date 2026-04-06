/**
 * Scan Result Card
 * Bottom slide-up card showing extracted data before finalizing the expense
 */
import { motion } from 'framer-motion'
import { Check, Edit3, X, Receipt, Package, QrCode, ScanBarcode } from 'lucide-react'

export default function ScanResultCard({ result, onConfirm, onEdit, onCancel }) {
  const S = { fontFamily: "'Inter', sans-serif" }
  
  if (!result) return null

  const { type, data } = result
  const title = type === 'BILL' ? 'Receipt Detected' : 
                type === 'PRODUCT' ? 'Product Detected' :
                type === 'BARCODE' ? 'Barcode Detected' :
                type === 'QR' ? 'UPI QR Detected' : 'Scan Result'

  const icon = type === 'BILL' ? <Receipt className="text-orange-500" /> :
               type === 'PRODUCT' ? <Package className="text-emerald-500" /> :
               type === 'BARCODE' ? <ScanBarcode className="text-blue-500" /> :
               <QrCode className="text-purple-500" />

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] border-t border-[#EEEEEE] px-8 pt-6 pb-12"
    >
      <div className="flex justify-center mb-6">
        <div className="w-12 h-1.5 rounded-full bg-[#EEEEEE]" />
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-[#F6F6F6] flex items-center justify-center border border-[#EEEEEE]">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-[12px] font-[700] text-[#AFAFAF] uppercase tracking-widest mb-0.5" style={S}>
            {title}
          </p>
          <p className="text-[18px] font-[800] text-black tracking-tight line-clamp-1" style={S}>
            {data.shopName || 'Unknown Item'}
          </p>
        </div>
        <button onClick={onCancel} className="w-10 h-10 rounded-full bg-[#F6F6F6] flex items-center justify-center border border-[#EEEEEE] active:scale-90 transition-transform">
          <X className="w-5 h-5 text-black" strokeWidth={2.5} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-[#F6F6F6] p-5 rounded-3xl border border-[#EEEEEE]">
          <p className="text-[10px] font-[700] text-[#AFAFAF] uppercase tracking-wider mb-1" style={S}>Amount</p>
          <p className="text-[22px] font-[800] text-black" style={S}>
            {data.amount > 0 ? `₹${data.amount}` : '—'}
          </p>
        </div>
        <div className="bg-[#F6F6F6] p-5 rounded-3xl border border-[#EEEEEE]">
          <p className="text-[10px] font-[700] text-[#AFAFAF] uppercase tracking-wider mb-1" style={S}>Category</p>
          <p className="text-[16px] font-[800] text-black capitalize" style={S}>
            {data.category || 'Shopping'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onConfirm}
          className="w-full py-5 rounded-2xl bg-black text-white text-[16px] font-[800] flex items-center justify-center gap-3 shadow-xl"
          style={S}
        >
          <Check className="w-5 h-5" strokeWidth={3} />
          Add This Expense
        </motion.button>
        <button 
          onClick={onEdit}
          className="w-full py-4 rounded-2xl bg-white text-black text-[14px] font-[700] border border-[#EEEEEE] active:bg-[#F6F6F6]"
          style={S}
        >
          Edit Details
        </button>
      </div>
    </motion.div>
  )
}
