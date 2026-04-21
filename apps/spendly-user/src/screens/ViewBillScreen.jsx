import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Receipt, ShoppingBag, 
  CreditCard, Clock, Tag, ShoppingCart,
  CheckCircle2, Share2, Download, Trash2,
  FileText, Globe, MessageSquare, RefreshCw
} from 'lucide-react';
import { useExpenseStore } from '../store/expenseStore';
import { formatMoney } from '../utils/formatMoney';
import { formatDate, formatTime } from '../utils/formatDate';
import { getCategoryById } from '../constants/categories';
import { useSettingsStore } from '../store/settingsStore';
import TopHeader from '../components/shared/TopHeader';
import { PDFReceiptTemplate } from '../components/PDFReceiptTemplate';
<<<<<<< HEAD
=======
import PageGuide from '../components/shared/PageGuide'
import { usePageGuide } from '../hooks/usePageGuide'
>>>>>>> 41f113d (upgrade scanner)

const S = { fontFamily: "'Inter', sans-serif" };

export default function ViewBillScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { expenses, deleteExpense } = useExpenseStore();
  const settings = useSettingsStore(s => s.settings);
  const currency = settings?.currency || 'USD';
  
  const [expense, setExpense] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const pdfRef = React.useRef(null);

<<<<<<< HEAD
=======
  const amountCardRef = React.useRef(null)
  const itemsListRef = React.useRef(null)
  const pdfBtnRef = React.useRef(null)

  const { showGuide, currentStep, startGuide, nextStep, prevStep, skipGuide } = usePageGuide('view_bill_page')

  const guideSteps = [
    { targetRef: amountCardRef, emoji: '📑', title: 'Payment Proof', description: 'This card contains the verified total and transaction metadata for this specific bill.', borderRadius: 36 },
    { targetRef: itemsListRef, emoji: '🛒', title: 'Item Breakdown', description: 'See every individual product scanned from your physical receipt with unit pricing.', borderRadius: 32 },
    { targetRef: pdfBtnRef, emoji: '📄', title: 'Export PDF', description: 'Need a physical copy? Generate a tax-ready PDF of this receipt in one tap.', borderRadius: 16 }
  ]

>>>>>>> 41f113d (upgrade scanner)
  useEffect(() => {
    const found = expenses.find(e => e.id === (typeof e.id === 'number' ? parseInt(id) : id));
    if (found) {
      setExpense(found);
    } else {
      // If not in store, maybe it's still loading or doesn't exist
    }
  }, [id, expenses]);

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    setIsGeneratingPDF(true);
    const { generateReceiptPDF } = await import('../services/pdfService');
    const fileName = `Spendly_Receipt_${expense.billNumber || expense.id}.pdf`;
    await generateReceiptPDF(pdfRef.current, fileName);
    setIsGeneratingPDF(false);
  };

  if (!expense) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <Receipt className="w-12 h-12 text-slate-200 mb-4" />
        <p className="text-slate-400 font-[500]">Loading bill details...</p>
      </div>
    );
  }

  const handleDelete = async () => {
    await deleteExpense(expense.id);
    navigate('/', { replace: true });
  };

  const items = expense.billItems || [];
  const category = getCategoryById(expense.category);

  return (
    <div className="min-h-screen bg-white safe-top">
      {/* Custom Header */}
      <div className="px-7 pt-12 pb-6 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-30 border-b border-slate-50">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="w-11 h-11 bg-[#F6F6F6] rounded-full flex items-center justify-center border border-[#EEEEEE]"
        >
          <ArrowLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
        </motion.button>
        <div className="flex-1 px-4">
          <div className="flex items-center gap-2 mb-1">
             <p className="text-[10px] font-[800] text-[#AFAFAF] uppercase tracking-widest leading-none">Digital Receipt</p>
             <span className="text-[9px] font-[900] bg-slate-100 px-2 py-0.5 rounded-full text-slate-400">#{expense.billNumber || expense.billId?.slice(-8).toUpperCase() || 'MANUAL'}</span>
          </div>
          <h1 className="text-[17px] font-[900] text-black tracking-tight truncate leading-none">View Bill</h1>
        </div>
<<<<<<< HEAD
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowDeleteConfirm(true)}
          className="w-11 h-11 bg-red-50 rounded-full flex items-center justify-center text-red-500"
        >
          <Trash2 className="w-4.5 h-4.5" strokeWidth={2.5} />
        </motion.button>
=======
        <div className="flex items-center gap-2">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={startGuide}
            className="w-11 h-11 bg-white border border-slate-100 rounded-full flex items-center justify-center font-bold text-[18px]"
          >
            ?
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowDeleteConfirm(true)}
            className="w-11 h-11 bg-red-50 rounded-full flex items-center justify-center text-red-500"
          >
            <Trash2 className="w-4.5 h-4.5" strokeWidth={2.5} />
          </motion.button>
        </div>
>>>>>>> 41f113d (upgrade scanner)
      </div>

      {/* Hidden template for PDF generation */}
      <PDFReceiptTemplate ref={pdfRef} expense={expense} currency={currency} />

      <div className="bg-white">
        <div className="px-7 pt-8 max-w-[500px] mx-auto">
          {/* Merchant Info */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 bg-black rounded-[28px] flex items-center justify-center text-white shadow-2xl mb-5 relative">
             <ShoppingBag className="w-10 h-10" />
             <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#10B981] rounded-lg flex items-center justify-center border-2 border-white">
                <CheckCircle2 className="w-4 h-4 text-white" />
             </div>
          </div>
          <h2 className="text-[28px] font-[900] text-black tracking-tight mb-2" style={S}>
            {expense.shopName || 'Local Merchant'}
          </h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#10B981] rounded-full" />
            <p className="text-[12px] font-[800] text-[#AFAFAF] uppercase tracking-widest">Verified Digital Receipt</p>
          </div>
        </div>

        {/* Amount Card */}
<<<<<<< HEAD
        <div className="bg-black rounded-[36px] p-8 text-white shadow-2xl mb-10 relative overflow-hidden">
=======
        <div ref={amountCardRef} className="bg-black rounded-[36px] p-8 text-white shadow-2xl mb-10 relative overflow-hidden">
>>>>>>> 41f113d (upgrade scanner)
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="relative z-10 flex flex-col items-center">
            <p className="text-white/40 text-[11px] font-[800] uppercase tracking-[0.2em] mb-3">Total Paid Amount</p>
            <h3 className="text-[42px] font-[900] tracking-tighter mb-6">
              {formatMoney(expense.amount, currency)}
            </h3>
            <div className="grid grid-cols-2 gap-4 w-full pt-6 border-t border-white/10">
              <div>
                <p className="text-white/30 text-[9px] font-[800] uppercase tracking-widest mb-1">Bill Number</p>
                <p className="text-white text-[13px] font-[700] truncate">#{expense.billNumber || '----'}</p>
              </div>
              <div className="text-right">
                <p className="text-white/30 text-[9px] font-[800] uppercase tracking-widest mb-1">Payment</p>
                <p className="text-white text-[13px] font-[700]">{expense.paymentMethod || 'CASH'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Date/Time info */}
        <div className="flex gap-4 mb-10">
            <div className="flex-1 bg-[#F6F6F6] rounded-3xl p-5 border border-[#EEEEEE]">
                <div className="flex items-center gap-3 mb-1">
                    <Clock className="w-4 h-4 text-[#AFAFAF]" />
                    <span className="text-[10px] font-[800] text-[#AFAFAF] uppercase tracking-widest">Time</span>
                </div>
                <p className="text-[15px] font-[800] text-black">{formatTime(expense.date)}</p>
            </div>
            <div className="flex-1 bg-[#F6F6F6] rounded-3xl p-5 border border-[#EEEEEE]">
                <div className="flex items-center gap-3 mb-1">
                    <Tag className="w-4 h-4 text-[#AFAFAF]" />
                    <span className="text-[10px] font-[800] text-[#AFAFAF] uppercase tracking-widest">Category</span>
                </div>
                <p className="text-[15px] font-[800] text-black">{category.name}</p>
            </div>
        </div>

        {/* Items List */}
        {items.length > 0 && (
<<<<<<< HEAD
          <div className="mb-10">
=======
          <div ref={itemsListRef} className="mb-10">
>>>>>>> 41f113d (upgrade scanner)
            <div className="flex items-center gap-3 px-3 mb-5">
              <ShoppingCart className="w-4 h-4 text-black" />
              <h4 className="text-[13px] font-[900] text-black uppercase tracking-wider">Bill Items ({items.length})</h4>
            </div>
            <div className="bg-[#F8FAFC] rounded-[32px] overflow-hidden border border-[#F1F5F9]">
              <div className="divide-y divide-[#F1F5F9]">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-6 hover:bg-white transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-[16px] font-[800] text-[#1E293B] truncate mb-1" style={S}>{item.name}</p>
                      <p className="text-[12px] font-[600] text-[#94A3B8] uppercase tracking-widest">
                        {item.quantity || 1} unit{item.quantity !== 1 ? 's' : ''} × {formatMoney(item.price, currency)}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-[16px] font-[900] text-black tracking-tight">
                        {formatMoney(item.price * (item.quantity || 1), currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Receipt Footer Info */}
              <div className="bg-[#F8FAFC] p-6 space-y-3">
                 <div className="flex justify-between items-center text-[#94A3B8]">
                    <span className="text-[12px] font-[700] uppercase tracking-widest">Subtotal</span>
                    <span className="text-[14px] font-[800]">{formatMoney(expense.subtotal || expense.amount, currency)}</span>
                 </div>
                 {expense.tax > 0 && (
                    <div className="flex justify-between items-center text-[#94A3B8]">
                        <span className="text-[12px] font-[700] uppercase tracking-widest">Tax (GST)</span>
                        <span className="text-[14px] font-[800]">+{formatMoney(expense.tax, currency)}</span>
                    </div>
                 )}
              </div>
            </div>
          </div>
        )}

        {/* Note/Tags */}
        {expense.note && (
           <div className="bg-[#F6F6F6] rounded-3xl p-6 mb-10 border border-dashed border-[#EEEEEE]">
              <div className="flex items-center gap-3 mb-3">
                 <FileText className="w-4 h-4 text-[#AFAFAF]" />
                 <span className="text-[11px] font-[800] text-[#AFAFAF] uppercase tracking-widest">Note</span>
              </div>
              <p className="text-[14px] font-[600] text-[#334155] leading-relaxed italic">
                "{expense.note}"
              </p>
           </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
            <button className="h-16 rounded-2xl bg-[#F6F6F6] text-black font-[800] text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 border border-[#EEEEEE]">
               <Share2 className="w-4 h-4" /> Share
            </button>
            <button 
<<<<<<< HEAD
=======
              ref={pdfBtnRef}
>>>>>>> 41f113d (upgrade scanner)
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="h-16 rounded-2xl bg-[#F6F6F6] text-black font-[800] text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 border border-[#EEEEEE]"
            >
               {isGeneratingPDF ? (
                 <><RefreshCw className="w-4 h-4 animate-spin" /> Working...</>
               ) : (
                 <><Download className="w-4 h-4" /> PDF</>
               )}
            </button>
        </div>

        {/* Read Only Warning */}
      </div>
        <div className="mt-12 flex flex-col items-center opacity-30 text-center px-4">
           <div className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center mb-3">
              <Globe className="w-4 h-4 text-[#94A3B8]" />
           </div>
           <p className="text-[10px] font-[800] text-[#94A3B8] uppercase tracking-widest leading-relaxed">
              This digital receipt is protected and cannot be edited to ensure financial integrity.
           </p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm overflow-hidden" onClick={() => setShowDeleteConfirm(false)}>
             <motion.div 
               initial={{ y: '100%', x: '-50%' }} animate={{ y: 0, x: '-50%' }} exit={{ y: '100%', x: '-50%' }}
               className="absolute bottom-0 left-1/2 w-full max-w-[500px] bg-white rounded-t-[40px] p-8 pb-tab"
               onClick={e => e.stopPropagation()}
             >
                <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />
                <h3 className="text-center text-[24px] font-[900] text-black tracking-tight mb-2">Delete Receipt?</h3>
                <p className="text-center text-[#AFAFAF] text-[14px] font-[600] leading-relaxed mb-10 px-6">
                  This transaction and its associated digital bill will be removed. You can undo this later from settings.
                </p>
                <div className="flex flex-col gap-4">
                  <button onClick={handleDelete} className="w-full h-16 bg-black text-white rounded-2xl font-[800] text-[16px] shadow-xl">
                    Delete Permanently
                  </button>
                  <button onClick={() => setShowDeleteConfirm(false)} className="w-full h-16 text-[#AFAFAF] font-[800] text-[14px] uppercase tracking-widest">
                    Keep Receipt
                  </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
<<<<<<< HEAD
=======
      <PageGuide 
        show={showGuide} 
        steps={guideSteps} 
        currentStep={currentStep} 
        onNext={nextStep} 
        onPrev={prevStep} 
        onSkip={skipGuide} 
      />
>>>>>>> 41f113d (upgrade scanner)
    </div>
  );
}
