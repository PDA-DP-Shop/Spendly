import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import { 
  ArrowLeft, Smartphone, QrCode, Share2, 
  Copy, Check, RefreshCw, MessageCircle, 
  Send as SendIcon, Download, SmartphoneNfc
} from 'lucide-react';

import { useBillStore } from '../store/billStore';
import { useShopStore } from '../store/shopStore';
import { formatMoney } from '../utils/formatMoney';
import { formatDate } from '../utils/formatDate';
import { generateBillCode } from '../utils/generateBillCode';
import { encodeBillToURL } from '../services/billSender';

const SendBillScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { shop } = useShopStore();
  const { bills, updateBill } = useBillStore();

  const [qrUrl, setQrUrl] = useState('');
  const [billCode, setBillCode] = useState(generateBillCode());
  const [nfcState, setNfcState] = useState('idle'); // idle, writing, success, error
  const [copied, setCopied] = useState(false);

  const bill = useMemo(() => {
    return bills.find(b => b.id === parseInt(id)) || location.state?.billData;
  }, [id, bills, location.state]);

  const billUrl = useMemo(() => {
    if (!bill) return '';
    return encodeBillToURL({ ...bill, shopName: shop?.name, shopPhone: shop?.phone, shopUPI: shop?.upiId });
  }, [bill, shop]);

  useEffect(() => {
    if (billUrl) {
      QRCode.toDataURL(billUrl, { margin: 1 })
        .then(url => setQrUrl(url))
        .catch(err => console.error(err));
    }
  }, [billUrl]);

  const handleNfcSend = async () => {
    if (!('NDEFReader' in window)) {
      setNfcState('unsupported');
      return;
    }

    try {
      setNfcState('writing');
      const ndef = new window.NDEFReader();
      await ndef.write({
        records: [{
          recordType: "url",
          data: billUrl
        }]
      });
      setNfcState('success');
      updateBill(bill.id, { status: 'sent', sentVia: 'nfc' });
    } catch (error) {
      console.error("NFC Write failed:", error);
      setNfcState('error');
    }
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
    <div className="p-12 text-center">
      <p className="text-slate-400 font-bold">Bill not found</p>
      <button onClick={() => navigate('/home')} className="mt-4 text-primary font-bold">Return Home</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white p-6 pb-4 flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-slate-50">
        <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-slate-800 font-black">
          <ArrowLeft className="w-5 h-5" /> Bill Created ✅
        </button>
        <div className="text-sm font-black text-primary uppercase tracking-widest">{bill.billNumber}</div>
      </header>

      <div className="p-4 space-y-6">
        {/* Bill Preview Card */}
        <div className="bg-white rounded-card shadow-sm overflow-hidden border border-slate-100">
            <div className="p-8 space-y-4 text-center">
                <div className="text-4xl mx-auto mb-2">{shop?.logoEmoji || '🏪'}</div>
                <h2 className="text-xl font-black text-slate-900 leading-tight">{shop?.name || 'My Shop'}</h2>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {shop?.address || 'Your Shop Address'}<br/>
                    PH: {shop?.phone || 'XXXXXXXXXX'}
                    {shop?.gstNumber && <><br/>GSTIN: {shop.gstNumber}</>}
                </div>
            </div>

            <div className="border-t border-dashed border-slate-200 mx-6" />

            <div className="p-6 flex justify-between">
                <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Bill Number</div>
                    <div className="font-black text-slate-800 text-sm">#{bill.billNumber}</div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Date</div>
                    <div className="font-bold text-slate-800 text-xs">{formatDate(bill.createdAt)}</div>
                </div>
            </div>

            {bill.customerName && (
                <div className="px-6 pb-4">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Customer</div>
                    <div className="font-black text-slate-800 text-sm">{bill.customerName}</div>
                </div>
            )}

            <div className="px-6">
                <table className="w-full text-[10px] font-bold">
                    <thead>
                        <tr className="text-slate-400 uppercase tracking-widest border-b border-slate-50">
                            <th className="py-2 text-left">Item</th>
                            <th className="py-2 text-center">Qty</th>
                            <th className="py-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-600">
                        {bill.items.map((item, i) => (
                            <tr key={i} className="border-b border-slate-50 last:border-0">
                                <td className="py-2">{item.name}</td>
                                <td className="py-2 text-center">{item.quantity}</td>
                                <td className="py-2 text-right">{formatMoney(item.price * item.quantity)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-6 pt-4 space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>Subtotal</span>
                    <span>{formatMoney(bill.subtotal)}</span>
                </div>
                {bill.gstAmount > 0 && (
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                        <span>GST ({bill.gstPercent}%)</span>
                        <span>{formatMoney(bill.gstAmount)}</span>
                    </div>
                )}
                {bill.discountAmount > 0 && (
                    <div className="flex justify-between text-[10px] font-bold text-red-500 uppercase">
                        <span>Discount</span>
                        <span>-{formatMoney(bill.discountAmount)}</span>
                    </div>
                )}
                {bill.roundOff !== 0 && (
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                        <span>Round Off</span>
                        <span>{bill.roundOff > 0 ? '+' : ''}{bill.roundOff.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between items-center py-2 border-t-2 border-slate-50 mt-2">
                    <span className="text-lg font-black text-slate-900">TOTAL</span>
                    <span className="text-2xl font-black text-primary">{formatMoney(bill.total)}</span>
                </div>
            </div>

            <footer className="bg-slate-50/50 p-6 text-center space-y-4">
                {shop?.upiId && (
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 bg-white p-2 border border-slate-100 rounded-xl mb-2">
                            {/* Placeholder for UPI QR or reuse generated bill QR */}
                            {qrUrl && <img src={qrUrl} alt="UPI QR" />}
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pay via UPI</div>
                    </div>
                )}
                <p className="italic text-xs text-slate-500">{shop?.billFooterMessage || 'Thank you for shopping!'}</p>
                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.2em]">Powered by Spendly Shop</p>
            </footer>
        </div>

        <button className="w-full flex items-center justify-center gap-2 text-primary font-black text-sm active:opacity-50 mt-2">
          <Download className="w-4 h-4" /> Download PDF
        </button>

        {/* Send Section */}
        <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Send to Customer</h3>
            
            {/* NFC Tap */}
            <div className="bg-white rounded-card border border-slate-100 shadow-sm p-6 space-y-6">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-40 h-40 bg-emerald-50 rounded-full flex items-center justify-center relative overflow-hidden">
                        <SmartphoneNfc className={`w-20 h-20 text-primary ${nfcState === 'writing' ? 'animate-pulse' : ''}`} />
                        {nfcState === 'writing' && (
                            <motion.div 
                                className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                        )}
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900">Tap Phones Together 📱</h4>
                        <p className="text-[10px] font-bold text-slate-400 px-8 mt-1 uppercase tracking-wide">
                            Hold phones close together. Customer must have Spendly app open.
                        </p>
                    </div>
                </div>

                <button 
                    onClick={handleNfcSend}
                    className={`w-full py-4 rounded-xl font-black text-lg shadow-lg active:scale-95 transition-all ${
                        nfcState === 'success' ? 'bg-emerald-500 text-white' : 'bg-primary text-white shadow-emerald-100'
                    }`}
                >
                    {nfcState === 'writing' ? 'Waiting for phone...' : 
                     nfcState === 'success' ? 'Sent Successfully! ✅' : 'Send via NFC'}
                </button>

                {nfcState === 'error' && <p className="text-center text-[10px] font-bold text-red-500 uppercase tracking-widest">NFC Write failed. Try QR code below.</p>}
                {nfcState === 'unsupported' && <p className="text-center text-[10px] font-bold text-amber-600 uppercase tracking-widest">NFC not available on this device.</p>}
                
                <p className="text-center text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                    Available on Android • iPhone users scan QR
                </p>
            </div>

            {/* QR Code */}
            <div className="bg-white rounded-card border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center space-y-6">
                <div>
                    <h4 className="font-black text-slate-900">Scan QR Code</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Works on iPhone and Android</p>
                </div>

                <div className="w-60 h-60 bg-slate-50 p-4 rounded-3xl border border-slate-100 flex items-center justify-center shadow-inner">
                    {qrUrl ? (
                        <img src={qrUrl} alt="Bill QR" className="w-full h-full" />
                    ) : (
                        <RefreshCw className="w-10 h-10 text-slate-200 animate-spin" />
                    )}
                </div>

                <div className="text-[10px] font-bold text-slate-500 leading-relaxed px-6">
                    Customer scans this with Spendly app<br/>or phone camera
                </div>
                
                <button onClick={() => setBillCode(generateBillCode())} className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 active:opacity-50">
                    <RefreshCw className="w-3 h-3" /> Refresh QR
                </button>
            </div>

            {/* Share Link */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Share via</h3>
                <div className="grid grid-cols-3 gap-3">
                    <button 
                        onClick={handleWhatsAppShare}
                        className="bg-emerald-500 p-4 rounded-2xl flex flex-col items-center gap-2 text-white shadow-lg shadow-emerald-100 active:scale-95 transition-transform"
                    >
                        <MessageCircle className="w-6 h-6" />
                        <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp</span>
                    </button>
                    <button className="bg-blue-500 p-4 rounded-2xl flex flex-col items-center gap-2 text-white shadow-lg shadow-blue-100 active:scale-95 transition-transform">
                        <SendIcon className="w-6 h-6" />
                        <span className="text-[10px] font-black uppercase tracking-widest">SMS</span>
                    </button>
                    <button 
                        onClick={handleCopyLink}
                        className="bg-slate-800 p-4 rounded-2xl flex flex-col items-center gap-2 text-white shadow-lg shadow-slate-200 active:scale-95 transition-transform"
                    >
                        {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                        <span className="text-[10px] font-black uppercase tracking-widest">{copied ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                </div>
            </div>

            {/* 6 Digit Code */}
            <div className="bg-white rounded-card border border-slate-100 shadow-sm p-8 text-center space-y-6">
                <div>
                    <h4 className="font-black text-slate-900">Show this code</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Customer types in Spendly app</p>
                </div>

                <div className="text-4xl font-black text-primary tracking-[0.3em] font-display">
                    {billCode.split('').join(' ')}
                </div>

                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Valid for 24 hours
                </div>

                <button onClick={() => setBillCode(generateBillCode())} className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 active:opacity-50 mx-auto">
                    <RefreshCw className="w-3 h-3" /> Refresh Code
                </button>
            </div>
        </div>

        <button 
          onClick={() => navigate('/home')}
          className="w-full py-4 text-slate-400 font-black text-sm uppercase tracking-widest active:bg-slate-100 rounded-xl transition-colors"
        >
          Done — Skip Sending
        </button>
      </div>
    </div>
  );
};

export default SendBillScreen;
