import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import { 
  ArrowLeft, Smartphone, QrCode, Share2, 
  Copy, Check, RefreshCw, MessageCircle, 
  Send as SendIcon, Download, SmartphoneNfc,
  CheckCircle2, Zap, Globe, Sparkles, ChevronRight, X
} from 'lucide-react';

import { useBillStore } from '../store/billStore';
import { useShopStore } from '../store/shopStore';
import { formatMoney } from '../utils/formatMoney';
import { formatDate } from '../utils/formatDate';
import { generateBillCode } from '../utils/generateBillCode';
import { encodeBillToURL } from '../services/billSender';
import { sendViaNFC, isNFCSupported, isIOS } from '../services/nfcService';

const SendBillScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { shop } = useShopStore();
  const { bills, updateBill } = useBillStore();

  const [qrUrl, setQrUrl] = useState('');
  const [billCode, setBillCode] = useState(generateBillCode());
  const [nfcState, setNfcState] = useState('idle');
  const [copied, setCopied] = useState(false);

  const bill = useMemo(() => {
    return bills.find(b => b.id === parseInt(id)) || location.state?.billData;
  }, [id, bills, location.state]);

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
    if (billUrl) {
      QRCode.toDataURL(billUrl, { margin: 1, color: { dark: '#000000', light: '#ffffff' } })
        .then(url => setQrUrl(url))
        .catch(err => console.error(err));
    }
  }, [billUrl]);

  const handleNfcSend = async () => {
    await sendViaNFC(billUrl, (state) => {
      setNfcState(state);
      if (state === 'success') {
        updateBill(bill.id, { status: 'sent', sentVia: 'nfc' });
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
    navigator.clipboard.writeText(billUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const message = `Bill from ${shop?.name || 'Shop'}
₹${bill?.total} — ${bill?.items?.length} items
Tap to add to Spendly:
${billUrl}`;
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
      <header className="bg-white/80 backdrop-blur-xl p-6 pb-4 flex items-center justify-between sticky top-0 z-40 border-b border-[#F1F5F9] shadow-sm">
        <button onClick={() => navigate('/home')} className="flex items-center gap-3 text-black font-[800] tracking-tight active:scale-95 transition-transform group">
          <div className="p-2 bg-[#F8FAFC] rounded-xl group-hover:bg-black group-hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="text-[17px]">Send Bill</span>
        </button>
        <div className="text-[10px] font-[800] text-[#94A3B8] bg-[#F8FAFC] px-3 py-1 rounded-full uppercase tracking-widest">{bill.billNumber}</div>
      </header>

      <div className="p-6 space-y-10">
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-black rounded-[32px] p-10 text-white shadow-2xl relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -mr-24 -mt-24" />
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-white/10 rounded-[20px] flex items-center justify-center border border-white/5">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h2 className="text-[28px] font-[800] tracking-tight">Bill Created!</h2>
                    <p className="text-[11px] font-[800] text-white/40 uppercase tracking-widest mt-2">Ready to share with customer</p>
                </div>
                <div className="text-[36px] font-[800] text-white tracking-tight mt-4">{formatMoney(bill.total)}</div>
            </div>
        </motion.div>

        {/* Sharing Options */}
        <div className="space-y-6">
            <h3 className="text-[12px] font-[800] text-black uppercase tracking-widest px-2">How to share</h3>
            
            <div className="grid grid-cols-1 gap-6">
                {/* NFC Option */}
                <div className="bg-[#F8FAFC] rounded-[32px] p-8 space-y-8 border border-transparent">
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
                                {iosDevice ? '⚠️ NFC not available on iPhone — use QR or WhatsApp below' : '⚠️ NFC not supported on this browser'}
                            </p>
                        </div>
                    ) : (
                        <motion.button 
                            whileTap={{ scale: 0.96 }}
                            onClick={handleNfcSend}
                            disabled={nfcState === 'writing' || nfcState === 'success'}
                            className={`w-full h-16 rounded-full font-[800] text-[15px] uppercase tracking-widest shadow-md transition-all ${
                                nfcState === 'success' ? 'bg-emerald-500 text-white' :
                                nfcState === 'error' || nfcState === 'denied' ? 'bg-red-500 text-white' :
                                'bg-black text-white'
                            }`}
                        >
                            {getNfcLabel()}
                        </motion.button>
                    )}
                </div>

                {/* QR Code Option */}
                <div className="bg-[#F8FAFC] rounded-[32px] p-10 flex flex-col items-center text-center space-y-8 border border-transparent">
                    <div>
                        <h4 className="text-[18px] font-[800] text-black tracking-tight">Scan QR Code</h4>
                        <p className="text-[13px] font-[500] text-[#94A3B8] mt-2">Customer can scan to see invoice</p>
                    </div>

                    <div className="w-56 h-56 bg-white p-4 rounded-[28px] border border-[#F1F5F9] flex items-center justify-center shadow-sm">
                        {qrUrl ? (
                            <img src={qrUrl} alt="Bill QR" className="w-full h-full rounded-xl" />
                        ) : (
                            <RefreshCw className="w-10 h-10 text-slate-200 animate-spin" />
                        )}
                    </div>

                    <div className="text-[11px] font-[700] text-[#CBD5E1] uppercase tracking-widest leading-relaxed">
                        Compatible with all cameras
                    </div>
                </div>

                {/* Other Share Options */}
                <div className="space-y-4">
                    <h3 className="text-[12px] font-[800] text-black uppercase tracking-widest px-2">Other Ways</h3>
                    <div className="grid grid-cols-3 gap-3">
                        <button 
                            onClick={handleWhatsAppShare}
                            className="bg-[#F8FAFC] p-6 rounded-[24px] flex flex-col items-center gap-3 transition-active active:bg-slate-100"
                        >
                            <MessageCircle className="w-6 h-6 text-emerald-500" />
                            <span className="text-[10px] font-[800] uppercase text-[#94A3B8]">WhatsApp</span>
                        </button>
                        <button 
                            className="bg-[#F8FAFC] p-6 rounded-[24px] flex flex-col items-center gap-3 transition-active active:bg-slate-100"
                        >
                            <Globe className="w-6 h-6 text-blue-500" />
                            <span className="text-[10px] font-[800] uppercase text-[#94A3B8]">Browser</span>
                        </button>
                        <button 
                            onClick={handleCopyLink}
                            className={`p-6 rounded-[24px] flex flex-col items-center gap-3 transition-all ${copied ? 'bg-black' : 'bg-[#F8FAFC]'}`}
                        >
                            {copied ? <Check className="w-6 h-6 text-white" /> : <Copy className="w-6 h-6 text-[#94A3B8]" />}
                            <span className={`text-[10px] font-[800] uppercase tracking-widest ${copied ? 'text-white' : 'text-[#94A3B8]'}`}>{copied ? 'Copied' : 'Copy Link'}</span>
                        </button>
                    </div>
                </div>

                {/* Bill Code */}
                <div className="bg-[#F8FAFC] rounded-[32px] p-10 text-center space-y-8 border border-transparent">
                    <div className="flex flex-col items-center space-y-2">
                        <Sparkles className="w-6 h-6 text-black/20 mb-1" />
                        <h4 className="text-[18px] font-[800] text-black tracking-tight">Manual Entry Code</h4>
                        <p className="text-[13px] font-[500] text-[#94A3B8] mt-1">For manual typing in User App</p>
                    </div>

                    <div className="text-[32px] font-[800] text-black tracking-[0.4em] flex justify-center pl-4">
                        {billCode}
                    </div>

                    <button 
                        onClick={() => setBillCode(generateBillCode())} 
                        className="text-[10px] font-[800] text-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto px-5 py-2.5 bg-white border border-[#F1F5F9] rounded-full shadow-sm active:bg-slate-50 transition-all"
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh Code
                    </button>
                </div>
            </div>

            <motion.button 
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/home')}
                className="w-full h-20 bg-black text-white rounded-full font-[800] text-[17px] tracking-tight shadow-xl flex items-center justify-center gap-4 active:bg-slate-900 transition-all mt-6"
            >
                Done <ChevronRight className="w-5 h-5" />
            </motion.button>
        </div>
      </div>
    </div>
  );
};

export default SendBillScreen;
