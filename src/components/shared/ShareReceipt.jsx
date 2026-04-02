import { forwardRef } from 'react'
import { format } from 'date-fns'
import { formatMoney } from '../../utils/formatMoney'
import { getCategoryById } from '../../constants/categories'
import { PAYMENT_METHODS } from '../../constants/paymentMethods'

// A visually stunning receipt template meant to be captured by html2canvas
export const ShareReceipt = forwardRef(({ expense, currency }, ref) => {
  if (!expense) return <div ref={ref} className="hidden" />

  const cat = getCategoryById(expense.category)
  const pm = PAYMENT_METHODS.find(p => p.id === expense.paymentMethod) || PAYMENT_METHODS[0]
  const isSpent = expense.type === 'spent'

  return (
    <div className="fixed top-[-9999px] left-[-9999px]">
      <div ref={ref} className="w-[400px] h-[700px] relative overflow-hidden flex flex-col items-center justify-center p-8 bg-[#0F0F1A]">
        {/* Background Gradients */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full blur-[80px]" style={{ backgroundColor: cat.color + '40' }} />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full blur-[80px] bg-purple-600/30" />

        {/* The Card */}
        <div className="relative z-10 w-full bg-white/10 backdrop-blur-xl rounded-[32px] p-8 shadow-2xl border border-white/20 flex flex-col items-center text-center">
          
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-6 shadow-lg bg-white/20 border-2 border-white/30">
            {cat.emoji}
          </div>

          <p className="text-white/60 font-semibold uppercase tracking-widest text-[12px] mb-2">{isSpent ? 'Spent At' : 'Received From'}</p>
          <h2 className="text-white font-sans font-bold text-[28px] leading-tight mb-8 drop-shadow-md">
            {expense.shopName}
          </h2>

          <div className="w-full bg-black/20 rounded-2xl p-6 mb-8 border border-white/10">
            <p className="text-[48px] font-sans font-black tracking-tighter drop-shadow-md" style={{ color: isSpent ? '#F97316' : '#22C55E' }}>
              {isSpent ? '-' : '+'}{formatMoney(expense.amount, currency)}
            </p>
          </div>

          <div className="w-full flex justify-between px-2 mb-4">
            <p className="text-white/60 text-[13px] font-medium">Date</p>
            <p className="text-white font-semibold text-[14px]">
              {format(new Date(expense.date), 'MMM dd, yyyy · h:mm a')}
            </p>
          </div>
          
          <div className="w-full flex justify-between px-2 mb-8">
            <p className="text-white/60 text-[13px] font-medium">Payment</p>
            <p className="text-white font-semibold text-[14px] flex items-center gap-1.5">
              <span>{pm.icon}</span> {pm.label}
            </p>
          </div>

          <div className="w-16 h-1 bg-white/20 rounded-full mb-6" />

          {/* Branding */}
          <div className="flex items-center gap-2 opacity-80">
            <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center text-[10px] text-white font-bold">S</div>
            <p className="text-white/80 font-sans font-bold tracking-widest text-[12px] uppercase">Spendly Tracked</p>
          </div>

        </div>
      </div>
    </div>
  )
})
