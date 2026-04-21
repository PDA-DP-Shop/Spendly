import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import { 
  ArrowLeft, Smartphone, QrCode, Share2, 
  Copy, Check, RefreshCw, MessageCircle, 
  Send as SendIcon, Download, SmartphoneNfc,
  CheckCircle2, Zap, Globe, Sparkles, ChevronRight, X, Clock
} from 'lucide-react';

import { useBillStore } from '../store/billStore';
import { useShopStore } from '../store/shopStore';
import { formatMoney } from '../utils/formatMoney';
import { formatDate } from '../utils/formatDate';
import { generateBillCode } from '../utils/generateBillCode';
import { encodeBillToURL } from '../services/billSender';
import { sendViaNFC, isNFCSupported, isIOS } from '../services/nfcService';
import { PDFInvoiceTemplate } from '../components/PDFInvoiceTemplate';
<<<<<<< HEAD

const S = {
  inter: { fontFamily: "'Inter', sans-serif" },
  sora: { fontFamily: "'Sora', sans-serif" }
};
=======
>>>>>>> 41f113d (upgrade scanner)

const SendBillScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { bills, updateBill, loadBills } = useBillStore();
  const { shop, loadShop } = useShopStore();

  const [nfcState, setNfcState] = useState('idle');
  const [copied, setCopied] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const pdfRef = useRef(null);
  
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    loadBills();
    loadShop();
  }, []);
  
  const bill = useMemo(() => {
    const found = bills.find(b => b.id === parseInt(id));
    return found || location.state?.billData;
  }, [id, bills, location.state]);

<<<<<<< HEAD
=======
  const isExpired = useMemo(() => {
    if (!bill?.createdAt) return false;
    const created = new Date(bill.createdAt).getTime();
    const now = new Date().getTime();
    const diff = (now - created) / (1000 * 60);
    return diff > 10;
  }, [bill?.createdAt]);

>>>>>>> 41f113d (upgrade scanner)
  const theme = useMemo(() => {
    const defaultTheme = { primary: '#000000', light: '#F1F5F9', text: '#FFFFFF' };
    const themes = {
      food: { primary: '#F97316', light: '#FFF7ED', text: '#FFFFFF' },
      coffee: { primary: '#92400E', light: '#FFFBEB', text: '#FFFFFF' },
      travel: { primary: '#3B82F6', light: '#EFF6FF', text: '#FFFFFF' },
      shopping: { primary: '#EC4899', light: '#FDF2F8', text: '#FFFFFF' },
      bills: { primary: '#EAB308', light: '#FEFCE8', text: '#FFFFFF' },
      health: { primary: '#22C55E', light: '#F0FDF4', text: '#FFFFFF' },
      fun: { primary: '#8B5CF6', light: '#F5F3FF', text: '#FFFFFF' },
      study: { primary: '#06B6D4', light: '#ECFEFF', text: '#FFFFFF' },
      tech: { primary: '#0EA5E9', light: '#F0F9FF', text: '#FFFFFF' },
      gym: { primary: '#EF4444', light: '#FEF2F2', text: '#FFFFFF' },
      other: { primary: '#000000', light: '#F1F5F9', text: '#FFFFFF' }
    };
    return themes[shop?.category] || themes[bill?.category] || defaultTheme;
  }, [shop, bill]);

<<<<<<< HEAD
  // Hierarchical 6-Digit Pack: [Group][Amt3][Qty][Salt]
  const billCode = useMemo(() => {
    if (!bill || !shop) return '000000';
    
    // 1. Group Mapping (Worldwide support)
    const groups = {
        food: '0', coffee: '0', grocery: '0',
        travel: '1', holiday: '1',
        shopping: '2', clothes: '2', gifts: '2', pets: '2',
        bills: '3', rent: '3',
        health: '4',
        fun: '5',
        study: '6',
        tech: '7',
        gym: '8'
    };
    const groupDigit = groups[shop.category] || '9';

    // 2. Amount Last 3 Digits (000-999)
    const amt = Math.floor(bill.total) % 1000;
    const amountStr = String(amt).padStart(3, '0');

    // 3. Quantity (Number of items, capped at 9)
    const qtyDigit = Math.min((bill.items?.length || 1), 9);

    // 4. ID Salt (Last digit of bill ID)
    const salt = (bill.id || 0) % 10;

    return `${groupDigit}${amountStr}${qtyDigit}${salt}`;
  }, [bill, shop]);
=======
  const billCode = useMemo(() => {
    return bill?.claimCode || '------';
  }, [bill]);
>>>>>>> 41f113d (upgrade scanner)

  const billUrl = useMemo(() => {
    if (!bill) return '';
    return encodeBillToURL({ 
      ...bill, 
      shopName: shop?.name, 
      shopPhone: shop?.phone, 
      shopUPI: shop?.upiId,
      shopCategory: shop?.category || 'other'
    });
  }, [bill, shop]);

  useEffect(() => {
    if (!bill || !billUrl) return;

<<<<<<< HEAD
    QRCode.toDataURL(billUrl, { 
      margin: 1, 
      errorCorrectionLevel: 'H',
      scale: 10, // Higher scale for "4K" sharpness
      width: 1024, // High fixed width
      color: { dark: '#000000', light: '#ffffff' } 
    })
      .then(url => setQrUrl(url))
      .catch(err => console.error(err));

    // Simulation removed to prevent automatic locking
  }, [billUrl, bill, nfcState, updateBill]);
=======
    const generateArtisticQR = async () => {
      try {
        const qr = QRCode.create(billUrl, { errorCorrectionLevel: 'H' });
        const size = qr.modules.size;
        const padding = 2; 
        const totalSize = size + (padding * 2);
        const scale = 40;
        const canvas = document.createElement('canvas');
        canvas.width = totalSize * scale;
        canvas.height = totalSize * scale;
        const ctx = canvas.getContext('2d');

        const logoImg = new Image();
        logoImg.src = '/spendly-logo.png';
        await new Promise(r => logoImg.onload = r);

        const logoCanvas = document.createElement('canvas');
        logoCanvas.width = canvas.width;
        logoCanvas.height = canvas.height;
        const logoCtx = logoCanvas.getContext('2d');
        logoCtx.drawImage(logoImg, 0, 0, logoCanvas.width, logoCanvas.height);
        const logoData = logoCtx.getImageData(0, 0, logoCanvas.width, logoCanvas.height).data;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            if (qr.modules.get(c, r)) {
              const isFinder = (r < 7 && c < 7) || (r < 7 && c > size - 8) || (r > size - 8 && c < 7);
              const pixelX = Math.floor((r + padding + 0.5) * scale);
              const pixelY = Math.floor((c + padding + 0.5) * scale);
              const alpha = logoData[((pixelY * logoCanvas.width) + pixelX) * 4 + 3];
              const x = (r + padding) * scale;
              const y = (c + padding) * scale;

              if (isFinder) {
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.roundRect(x + 1, y + 1, scale - 2, scale - 2, scale * 0.3);
                ctx.fill();
              } else {
                ctx.fillStyle = alpha > 40 ? '#000000' : '#94A3B8';
                ctx.beginPath();
                ctx.arc(x + scale/2, y + scale/2, scale * 0.38, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
        }
        setQrUrl(canvas.toDataURL());
      } catch (err) {
        console.error('QR Generation Failed', err);
      }
    };

    generateArtisticQR();
  }, [billUrl, bill]);
 
  useEffect(() => {
    if (isZoomed) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isZoomed]);
>>>>>>> 41f113d (upgrade scanner)

  const isClaimed = nfcState === 'success' || bill?.status === 'claimed' || bill?.status === 'sent';

  const handleNfcSend = async () => {
<<<<<<< HEAD
    if (!bill?.id) return;
=======
    if (!bill?.id || isExpired) return;
>>>>>>> 41f113d (upgrade scanner)
    const numericId = parseInt(bill.id);
    if (isNaN(numericId)) return;

    await sendViaNFC(billUrl, (state) => {
      setNfcState(state);
      if (state === 'success') {
        updateBill(numericId, { status: 'sent', sentVia: 'nfc' });
      }
    });
  };

  const nfcSupported = isNFCSupported();
  const iosDevice = isIOS();

  const getNfcLabel = () => {
    if (iosDevice || !nfcSupported) return 'Not Available on iPhone';
    if (nfcState === 'writing') return 'Hold phones together...';
    if (nfcState === 'success') return 'Sent via NFC ✅';
    if (nfcState === 'denied') return 'Permission Denied — retry';
    if (nfcState === 'error') return 'Failed — tap to retry';
    return 'Send via NFC Tap';
  };

  const handleCopyLink = () => {
    if (isExpired) return;
    navigator.clipboard.writeText(billUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    setIsGeneratingPDF(true);
    const { generateInvoicePDF } = await import('../services/pdfService');
    const fileName = `${shop?.name || 'Shop'}_Bill_${bill.billNumber}.pdf`;
    await generateInvoicePDF(pdfRef.current, fileName);
    setIsGeneratingPDF(false);
  };

  const handleWhatsAppShare = () => {
<<<<<<< HEAD
=======
    if (isExpired) return;
>>>>>>> 41f113d (upgrade scanner)
    const itemsList = (bill?.items || [])
      .map(it => `${it.name.padEnd(15).slice(0, 15)} ${it.quantity}x  ${formatMoney(it.price * it.quantity)}`)
      .slice(0, 10)
      .join('\n');

<<<<<<< HEAD
    const message = `*=========================*
        *TAX INVOICE*
*=========================*
*Shop:* ${shop?.name || 'My Shop'}
*Date:* ${formatDate(bill?.createdAt)}
*Bill:* ${bill?.billNumber}

\`\`\`
ITEMS          QTY   PRICE
-------------------------
${itemsList}
\`\`\`
*-------------------------*
*TOTAL AMOUNT: ${formatMoney(bill?.total)}*
*=========================*

✅ *ADD TO SPENDLY (CLAIM):*
${billUrl}

🔢 *MANUAL ENTRY CODE:*
*${billCode}*

_Thank you for visiting!_ ✨`;
=======
    const message = `*=========================*\n*TAX INVOICE*\n*=========================*\n*Shop:* ${shop?.name || 'My Shop'}\n*Date:* ${formatDate(bill?.createdAt)}\n*Bill:* ${bill?.billNumber}\n\n\`\`\`\nITEMS          QTY   PRICE\n-------------------------\n${itemsList}\n\`\`\`\n*-------------------------*\n*TOTAL AMOUNT: ${formatMoney(bill?.total)}*\n*=========================*\n\n✅ *ADD TO SPENDLY (CLAIM):*\n${billUrl}\n\n🔢 *MANUAL ENTRY CODE:*\n*${billCode}*\n\n_Thank you for visiting!_ ✨`;
>>>>>>> 41f113d (upgrade scanner)
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (!bill) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <X className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-[24px] font-[800] text-black mb-2">Error</h2>
            <p className="text-[#94A3B8] font-[500] mb-8">Could not find bill details.</p>
            <button onClick={() => navigate('/home')} className="bg-black text-white px-8 py-4 rounded-full font-[800] shadow-xl">Back to Home</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-32 relative overflow-x-hidden font-sans">
<<<<<<< HEAD
      {/* 1. PDF Template (Hidden) */}
      <PDFInvoiceTemplate ref={pdfRef} bill={bill} shop={shop} />

      {/* 2. Header */}
=======
      <PDFInvoiceTemplate ref={pdfRef} bill={bill} shop={shop} />

>>>>>>> 41f113d (upgrade scanner)
      <header className="bg-white/80 backdrop-blur-xl p-6 pb-4 flex items-center justify-between sticky top-0 z-40 border-b border-[#F1F5F9] shadow-sm">
        <button onClick={() => navigate('/home')} className="flex items-center gap-3 text-black font-[800] tracking-tight active:scale-95 transition-transform group">
          <div className="p-2 bg-[#F8FAFC] rounded-xl group-hover:bg-black group-hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="text-[17px]">Send Bill</span>
        </button>
        <div className="text-[10px] font-[800] text-[#94A3B8] bg-[#F8FAFC] px-3 py-1 rounded-full uppercase tracking-widest">{bill.billNumber}</div>
      </header>

      {/* 3. Main Content Container */}
      <div className="p-6 space-y-10">
        
        {/* A. Success Status Card */}
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-[32px] p-10 text-white shadow-2xl relative overflow-hidden"
            style={{ backgroundColor: theme.primary }}
        >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -mr-24 -mt-24" />
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-white/10 rounded-[20px] flex items-center justify-center border border-white/5">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                    <h2 className="text-[28px] font-[800] tracking-tight">Bill Created!</h2>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <span className={`w-2 h-2 rounded-full ${isClaimed ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
                        <p className="text-[11px] font-[800] text-white/40 uppercase tracking-widest">
                            {isClaimed ? 'Claimed by Customer ✅' : 'Waiting for Scan...'}
                        </p>
                    </div>
                </div>
                <div className={`text-[36px] font-[800] tracking-tight mt-4 transition-all ${isClaimed ? 'text-emerald-400' : 'text-white'}`}>{formatMoney(bill.total)}</div>
            </div>
        </motion.div>

<<<<<<< HEAD
        {/* B. Sharing Methods Grid */}
        <div className="space-y-6">
            <h3 className="text-[12px] font-[800] text-black uppercase tracking-widest px-2">Handover Options</h3>
            
            <div className="grid grid-cols-1 gap-6">
                {/* i. NFC Tap Transfer */}
                <div className="bg-[#F8FAFC] rounded-[32px] p-8 space-y-8 border border-transparent">
=======
        {/* Sharing Options */}
        <div className="space-y-12">
            <h3 className="text-[12px] font-[800] text-black uppercase tracking-widest px-2">How to share</h3>
            
            <div className="grid grid-cols-1 gap-10">
                {/* NFC Option Card */}
                <div className="bg-[#F8FAFC] rounded-[32px] p-8 space-y-8 border border-transparent shadow-sm">
>>>>>>> 41f113d (upgrade scanner)
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="relative">
                            <div className="w-36 h-36 bg-white rounded-full flex items-center justify-center border border-[#F1F5F9] relative shadow-sm">
                                <SmartphoneNfc className={`w-16 h-16 text-black ${nfcState === 'writing' ? 'animate-pulse' : ''}`} />
                                {nfcState === 'writing' && (
                                    <motion.div 
                                        className="absolute inset-0 border-4 border-black border-t-transparent rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                )}
                            </div>
                            <div className="absolute -top-1 -right-1 w-10 h-10 bg-black rounded-xl shadow-lg flex items-center justify-center text-white">
                                <Zap className="w-5 h-5" />
                            </div>
                        </div>
                        <div>
                            <h4 className="text-[18px] font-[800] text-black tracking-tight">Tap Phones (NFC)</h4>
                            <p className="text-[13px] font-[500] text-[#94A3B8] px-4 mt-2 leading-relaxed">
                                Simply tap your phone with the customer's phone to send the bill instantly.
                            </p>
                        </div>
                    </div>

                    {(iosDevice || !nfcSupported) ? (
                        <div className="w-full py-5 px-6 bg-[#F1F5F9] rounded-full text-center">
                            <p className="text-[12px] font-[800] text-[#94A3B8] uppercase tracking-widest">
                                {iosDevice ? '⚠️ NFC not available on iPhone' : '⚠️ NFC not supported'}
                            </p>
                        </div>
                    ) : (
                        <motion.button 
                            whileTap={{ scale: 0.96 }}
                            onClick={handleNfcSend}
                            disabled={nfcState === 'writing' || nfcState === 'success' || isExpired}
                            className={`w-full h-16 rounded-full font-[800] text-[15px] uppercase tracking-widest shadow-md transition-all ${
                                isExpired ? 'bg-slate-100 text-slate-300 shadow-none' :
                                nfcState === 'success' ? 'bg-emerald-500 text-white' :
                                nfcState === 'error' || nfcState === 'denied' ? 'bg-red-500 text-white' :
                                'bg-black text-white'
                            }`}
                        >
                            {isExpired ? 'Link Locked' : getNfcLabel()}
                        </motion.button>
                    )}
                </div>

<<<<<<< HEAD
                {/* ii. Professional QR Stand */}
                <div className="bg-white rounded-[32px] border border-[#F1F5F9] shadow-xl overflow-hidden relative">
                    <div className="p-6 text-center space-y-3 relative overflow-hidden" style={{ backgroundColor: theme.primary }}>
=======
                {/* Google Pay Inspired QR Stand */}
                <div className="bg-white rounded-[44px] border border-[#F1F5F9] shadow-2xl shadow-slate-200/50 overflow-hidden relative">
                    <div className="p-8 text-center space-y-3 relative overflow-hidden" style={{ backgroundColor: theme.primary }}>
>>>>>>> 41f113d (upgrade scanner)
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl -mr-16 -mt-16" />
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-lg border-2 border-white/20">
                            {shop?.logoEmoji || '🏪'}
                        </div>
                        <div className="space-y-1">
<<<<<<< HEAD
                            <h4 className="text-[20px] font-[800] text-white tracking-tight">{shop?.name}</h4>
                            <p className="text-[12px] font-[600] text-white/60 truncate max-w-[200px] mx-auto">{shop?.upiId}</p>
                        </div>
                    </div>
                    
                    <div 
                        className="p-10 flex flex-col items-center text-center space-y-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat cursor-pointer group"
                        onClick={() => !isClaimed && setIsZoomed(true)}
                    >
                        <div className="relative p-3 bg-white rounded-[40px] border border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.04)] group-active:scale-[0.97] transition-all duration-300">
                            <div className="w-56 h-56 bg-white p-5 rounded-[32px] flex items-center justify-center relative border border-slate-50">
                                {isClaimed && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-[32px]"
                                    >
                                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                        </div>
                                        <span className="text-[12px] font-[900] text-emerald-600 uppercase tracking-widest">Confirmed ✨</span>
                                    </motion.div>
                                )}
                                {qrUrl ? (
                                    <img src={qrUrl} alt="Bill QR" className={`w-full h-full rounded-2xl transition-all ${isClaimed ? 'blur-md grayscale opacity-30 scale-90' : 'group-hover:scale-[1.02]'}`} />
                                ) : (
                                    <RefreshCw className="w-10 h-10 text-slate-200 animate-spin" />
                                )}
                                {!isClaimed && qrUrl && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-11 h-11 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center">
                                            <img src="/spendly-logo.png" className="w-7 h-7" alt="L" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center opacity-40">
                            <p className="text-[10px] font-[900] text-black tracking-[0.1em] uppercase">Digital Bill Claim Ready</p>
                            <div className="w-12 h-0.5 bg-black/10 mt-1.5 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>

            {/* C. Quick Actions Footer */}
            <div className="space-y-6">
                <h3 className="text-[12px] font-[800] text-black uppercase tracking-widest px-2">Other Ways</h3>
                <div className="grid grid-cols-3 gap-3">
                    <button 
                        onClick={handleWhatsAppShare}
                        className="bg-[#F8FAFC] p-6 rounded-[24px] flex flex-col items-center gap-3 active:bg-slate-100 transition-colors"
                    >
                        <MessageCircle className="w-6 h-6 text-emerald-500" />
                        <span className="text-[10px] font-[800] uppercase text-[#94A3B8]">WhatsApp</span>
                    </button>
                    <button 
                        onClick={handleDownloadPDF}
                        disabled={isGeneratingPDF}
                        className={`bg-[#F8FAFC] p-6 rounded-[24px] flex flex-col items-center gap-3 active:bg-slate-100 transition-colors ${isGeneratingPDF ? 'opacity-50' : ''}`}
                    >
                        {isGeneratingPDF ? <RefreshCw className="w-6 h-6 text-black animate-spin" /> : <Download className="w-6 h-6 text-blue-500" />}
                        <span className="text-[10px] font-[800] uppercase text-[#94A3B8]">{isGeneratingPDF ? '...' : 'PDF'}</span>
                    </button>
                    <button 
                        onClick={handleCopyLink}
                        className={`p-6 rounded-[24px] flex flex-col items-center gap-3 transition-colors ${copied ? 'bg-black text-white' : 'bg-[#F8FAFC]'}`}
                    >
                        {copied ? <Check className="w-6 h-6 text-white" /> : <Copy className="w-6 h-6 text-[#94A3B8]" />}
                        <span className="text-[10px] font-[800] uppercase tracking-widest">{copied ? 'Done' : 'Link'}</span>
                    </button>
                </div>

                <div className="bg-[#F8FAFC] rounded-[32px] p-8 text-center space-y-6 border border-transparent">
                    <div>
                        <h4 className="text-[16px] font-[800] text-black tracking-tight">Manual Code</h4>
                        <p className="text-[12px] font-[500] text-[#94A3B8] mt-1">For direct entry in User App</p>
                    </div>
                    <div className="relative">
                        {isClaimed && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-[#F8FAFC]/90 backdrop-blur-sm z-10 flex items-center justify-center">
                                <span className="px-4 py-1.5 bg-emerald-500 rounded-full text-white text-[10px] font-[900] uppercase">Locked</span>
                            </motion.div>
                        )}
                        <div className={`text-[28px] font-[800] text-black tracking-[0.4em] flex justify-center pl-4 bg-white py-5 rounded-2xl border border-[#F1F5F9] ${isClaimed ? 'blur-md' : ''}`}>
                            {billCode}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* 4. Bottom Completion Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50">
          <motion.button 
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/home')}
              className="w-full h-16 bg-black text-white rounded-full font-[900] text-[16px] tracking-tight shadow-2xl flex items-center justify-center gap-3"
          >
              Complete Sale <ChevronRight className="w-5 h-5" />
          </motion.button>
      </div>

      {createPortal(
        <AnimatePresence>
          {isZoomed && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-[40px] flex items-center justify-center p-8 overflow-hidden touch-none"
              style={{ overscrollBehavior: 'contain' }}
              onClick={() => setIsZoomed(false)}
            >
              <motion.div 
                initial={{ scale: 0.7, opacity: 0, y: 50 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.7, opacity: 0, y: 50 }}
                transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                className="bg-white rounded-[56px] p-12 max-w-[440px] w-full flex flex-col items-center space-y-10 shadow-[0_64px_128px_-24px_rgba(0,0,0,0.5)] relative"
                onClick={e => e.stopPropagation()}
              >
                <button 
                  onClick={() => setIsZoomed(false)}
                  className="absolute -top-5 -right-5 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl border border-slate-100 z-[10001] active:scale-90 transition-transform"
                >
                  <X className="w-7 h-7 text-black" strokeWidth={3} />
                </button>
                
                <div className="flex flex-col items-center space-y-5">
                  <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-[48px] shadow-inner border border-slate-100">
                    {shop?.logoEmoji || '🏪'}
                  </div>
                  <div className="text-center">
                    <h3 className="text-[26px] font-[900] text-black tracking-tighter" style={S.inter}>{shop?.name}</h3>
                    <p className="text-[14px] font-[800] text-[#94A3B8] tracking-[0.1em] uppercase mt-1 opacity-50">{shop?.upiId}</p>
                  </div>
                </div>

                <div className="w-full aspect-square bg-[#F8FAFC] rounded-[48px] p-8 border-[6px] border-slate-50 relative">
                  {qrUrl ? (
                    <img src={qrUrl} alt="Bill QR" className="w-full h-full rounded-[24px] mix-blend-multiply" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><RefreshCw className="w-12 h-12 animate-spin text-slate-200" /></div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 bg-white rounded-[24px] shadow-2xl border border-slate-100 flex items-center justify-center">
                      <img src="/spendly-logo.png" className="w-10 h-10" alt="L" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-6 w-full pt-4">
                  <div className="px-8 py-4 bg-black rounded-full flex items-center gap-4 shadow-2xl shadow-black/20">
                    <QrCode className="w-5 h-5 text-emerald-400" />
                    <span className="text-[14px] font-[900] text-white uppercase tracking-[0.2em]">Scan to Collect</span>
                  </div>
                  <p className="text-[14px] font-[600] text-[#94A3B8] text-center leading-relaxed">
                    Scan with <strong className="text-black">Spendly App</strong> <br/> for instant digital bill collection.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      , document.body)}
=======
                            <h4 className="text-[20px] font-[800] text-white tracking-tight">{shop?.name || 'My Shop'}</h4>
                            <p className="text-[12px] font-[600] text-white/60 truncate max-w-[200px] mx-auto">{shop?.upiId || 'shop@upi'}</p>
                        </div>
                    </div>

                    <div 
                        className="p-12 flex flex-col items-center text-center space-y-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat cursor-pointer group relative"
                        onClick={() => !isClaimed && !isExpired && setIsZoomed(true)}
                    >
                        <AnimatePresence mode="wait">
                            {isExpired ? (
                                <motion.div 
                                    key="expired" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                    className="w-[240px] h-[240px] bg-slate-50 rounded-[48px] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 gap-4 shadow-inner"
                                >
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                        <Clock className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-[16px] font-[900] text-slate-600 tracking-tight">Locked</h4>
                                        <p className="text-[11px] font-[600] text-slate-400 leading-relaxed">Claim period expired</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="qr" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                    className={`relative p-8 bg-white rounded-[44px] border-4 shadow-2xl transition-all ${isClaimed ? 'border-emerald-100' : 'border-slate-50'}`}
                                >
                                    <div className="w-48 h-48 bg-white rounded-[24px] flex items-center justify-center relative overflow-hidden">
                                        {isClaimed && (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center"
                                            >
                                                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                                                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                                </div>
                                                <span className="text-[12px] font-[900] text-emerald-600 uppercase tracking-widest">Collected</span>
                                            </motion.div>
                                        )}
                                        {qrUrl ? (
                                            <div className="relative w-full h-full">
                                                <img src={qrUrl} alt="Bill QR" className={`w-full h-full object-contain mx-auto transition-all ${isClaimed ? 'blur-md grayscale opacity-30 scale-90' : ''}`} />
                                                {!isClaimed && (
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                        <div className="w-10 h-10 bg-white rounded-xl shadow-lg border border-[#F1F5F9] flex items-center justify-center">
                                                            <img src="/spendly-logo.png" className="w-7 h-7" alt="L" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <RefreshCw className="w-10 h-10 text-slate-200 animate-spin" />
                                        )}
                                    </div>
                                    {!isClaimed && (
                                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-2.5 rounded-full text-[10px] font-[900] uppercase tracking-[0.2em] whitespace-nowrap shadow-2xl flex items-center gap-2 border border-white/10 z-10">
                                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                            Scan to claim
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Manual Entry Code Card */}
                <div className="bg-[#F8FAFC] rounded-[44px] p-10 text-center space-y-8 border border-transparent shadow-sm relative overflow-hidden">
                    <div className="flex flex-col items-center space-y-3">
                        <Sparkles className="w-6 h-6 text-black/20 mb-1" />
                        <h4 className="text-[18px] font-[800] text-black tracking-tight">Manual Entry Code</h4>
                        <p className="text-[13px] font-[500] text-[#94A3B8] mt-1 px-4 leading-relaxed">For manual typing in the Spendly User App if scan fails.</p>
                    </div>

                    <div className="relative px-4">
                        {(isClaimed || isExpired) && (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-[#F8FAFC]/90 backdrop-blur-sm z-10 flex items-center justify-center"
                            >
                                <div className="px-6 py-3 bg-slate-900 rounded-full text-white text-[10px] font-[900] uppercase tracking-widest flex items-center gap-3 shadow-xl">
                                    {isExpired ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                    {isExpired ? 'Code Locked' : 'Claimed'}
                                </div>
                            </motion.div>
                        )}
                        <div className="flex items-center justify-center">
                            <div className={`flex-1 text-[32px] font-[900] text-black tracking-[0.4em] flex justify-center pl-4 bg-white py-6 rounded-[28px] border border-[#F1F5F9] transition-all font-mono ${isClaimed || isExpired ? 'blur-lg opacity-20' : 'shadow-sm'}`}>
                                {billCode}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Other Share Options */}
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={handleWhatsAppShare}
                        disabled={isExpired}
                        className={`h-24 rounded-[36px] flex flex-col items-center justify-center gap-2 transition-all ${isExpired ? 'bg-slate-50 text-slate-200' : 'bg-emerald-50 border border-emerald-100 text-emerald-600 active:bg-emerald-100 active:scale-95 shadow-sm'}`}
                    >
                        <MessageCircle className="w-6 h-6" />
                        <span className="text-[11px] font-[900] uppercase tracking-widest">WhatsApp</span>
                    </button>
                    <button 
                        onClick={handleDownloadPDF}
                        disabled={isGeneratingPDF}
                        className="h-24 bg-[#F8FAFC] border border-slate-100 rounded-[36px] flex flex-col items-center justify-center gap-2 text-black active:bg-white active:shadow-xl transition-all active:scale-95 shadow-sm"
                    >
                        {isGeneratingPDF ? <RefreshCw className="w-6 h-6 animate-spin text-slate-300" /> : <Download className="w-6 h-6 text-slate-400" />}
                        <span className="text-[11px] font-[900] uppercase tracking-widest">Digital Bill</span>
                    </button>
                </div>
            </div>

            <motion.button 
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/home')}
                className="w-full h-20 bg-black text-white rounded-full font-[900] text-[17px] tracking-tight shadow-2xl flex items-center justify-center gap-4 active:bg-slate-900 transition-all uppercase"
            >
                Done <ChevronRight className="w-5 h-5 opacity-50" />
            </motion.button>
        </div>
      </div>

      {/* Zoom Portal */}
      {typeof document !== 'undefined' && isZoomed && createPortal(
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6" onClick={() => setIsZoomed(false)}>
              <motion.div 
                  initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} 
                  className="bg-white rounded-[48px] p-10 max-w-[420px] w-full flex flex-col items-center gap-8 shadow-2xl relative" 
                  onClick={e => e.stopPropagation()}
              >
                  <button onClick={() => setIsZoomed(false)} className="absolute top-6 right-6 w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                      <X className="w-6 h-6 text-black" />
                  </button>
                  <div className="text-center">
                      <h3 className="text-[22px] font-[900] text-black tracking-tight">{shop?.name}</h3>
                      <p className="text-[12px] font-[600] text-slate-400 mt-1 uppercase tracking-widest">{bill?.billNumber}</p>
                  </div>
                  <div className="w-full aspect-square bg-slate-50 rounded-[40px] flex items-center justify-center p-8 relative">
                      <img src={qrUrl} alt="Bill QR" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-14 h-14 bg-white rounded-2xl shadow-xl border border-slate-50 flex items-center justify-center">
                              <img src="/spendly-logo.png" className="w-10 h-10" alt="" />
                          </div>
                      </div>
                  </div>
                  <div className="text-[11px] font-[900] text-slate-300 uppercase tracking-[0.3em]">Scan to Claim Bill</div>
              </motion.div>
          </motion.div>,
          document.body
      )}
>>>>>>> 41f113d (upgrade scanner)
    </div>
  );
};

export default SendBillScreen;
