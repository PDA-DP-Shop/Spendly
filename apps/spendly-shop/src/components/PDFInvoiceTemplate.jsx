import React from 'react';
import { formatMoney } from '../utils/formatMoney';
import { formatDate } from '../utils/formatDate';

export const PDFInvoiceTemplate = React.forwardRef(({ bill, shop }, ref) => {
  if (!bill) return null;

  const items = bill.items || [];
  const brandColor = '#0f172a';
  const accentColor = '#3b82f6';

  return (
    <div 
      ref={ref}
      style={{
        width: '850px',
        minHeight: '1100px',
        padding: '80px',
        backgroundColor: '#ffffff',
        color: '#334155',
        fontFamily: "'Inter', sans-serif",
        position: 'absolute',
        left: '-9999px',
        top: 0,
        boxSizing: 'border-box'
      }}
    >
      {/* Structural Accent */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '10px', backgroundColor: brandColor }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: '250px', height: '250px', backgroundColor: '#F8FAFC', borderRadius: '0 0 0 250px', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '80px' }}>
          <div style={{ margin: '0 auto 25px auto', position: 'relative' }}>
             <div style={{ width: '100px', height: '100px', backgroundColor: '#000000', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
             </div>
             <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', width: '36px', height: '36px', backgroundColor: '#3b82f6', borderRadius: '12px', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                   <polyline points="20 6 9 17 4 12" />
                </svg>
             </div>
          </div>
          <h1 style={{ fontSize: '38px', fontWeight: '900', color: brandColor, margin: '0 0 10px 0', letterSpacing: '-1.5px' }}>{shop?.name || 'Voucher'}</h1>
          <div style={{ backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', display: 'inline-block' }}>
             <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>Merchant Tax Invoice</p>
          </div>
          <p style={{ fontSize: '14px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '3px', marginTop: '15px' }}>Ref: {bill.billNumber || bill.billId || bill.id}</p>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '80px', marginBottom: '80px', borderTop: '1px solid #f1f5f9', paddingTop: '40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <div>
              <p style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Payment</p>
              <p style={{ fontSize: '15px', fontWeight: '700', color: brandColor }}>{bill.paymentMethod || 'CASH'}</p>
            </div>
            <div>
              <p style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Merchant ID</p>
              <p style={{ fontSize: '15px', fontWeight: '700', color: brandColor }}>{shop?.mid || 'SPND-SHOP-01'}</p>
            </div>
            <div style={{ marginTop: '20px' }}>
               <p style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Shop Contact</p>
               <p style={{ fontSize: '14px', fontWeight: '600' }}>{shop?.phone || 'N/A'}</p>
            </div>
          </div>
          <div style={{ backgroundColor: '#F8FAFC', padding: '30px', borderRadius: '24px' }}>
            <p style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '15px' }}>Date Issued</p>
            <p style={{ fontSize: '20px', fontWeight: '900', color: brandColor }}>{formatDate(bill.createdAt || new Date())}</p>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginTop: '10px' }}>Certified by Spendly Network</p>
          </div>
        </div>

        {/* Table Section */}
        <div style={{ marginBottom: '80px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', backgroundColor: '#F8FAFC' }}>
                <th style={{ padding: '20px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', borderRadius: '15px 0 0 15px' }}>Item Description</th>
                <th style={{ padding: '20px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '20px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'right', borderRadius: '0 15px 15px 0' }}>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '30px 20px' }}>
                    <p style={{ fontSize: '17px', fontWeight: '800', color: brandColor, margin: '0 0 5px 0' }}>{item.name}</p>
                    <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>Rate: {formatMoney(item.price)}</p>
                  </td>
                  <td style={{ padding: '30px 20px', fontSize: '17px', fontWeight: '800', textAlign: 'center' }}>{item.quantity || 1}</td>
                  <td style={{ padding: '30px 20px', fontSize: '18px', fontWeight: '900', textAlign: 'right', color: brandColor }}>{formatMoney(item.price * (item.quantity || 1))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* High-Impact Calculation Section */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px' }}>
          <div style={{ width: '400px', borderTop: '4px solid #000000', paddingTop: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#64748b' }}>Subtotal Amount</span>
              <span style={{ fontSize: '15px', fontWeight: '800' }}>{formatMoney(bill.subtotal || bill.total)}</span>
            </div>
            {bill.gstAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#64748b' }}>GST / Service Tax</span>
                <span style={{ fontSize: '15px', fontWeight: '800', color: '#3b82f6' }}>+{formatMoney(bill.gstAmount)}</span>
              </div>
            )}
            {bill.discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#64748b' }}>Special Discount</span>
                <span style={{ fontSize: '15px', fontWeight: '800', color: '#ef4444' }}>-{formatMoney(bill.discountAmount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px', padding: '30px', backgroundColor: brandColor, borderRadius: '24px', color: 'white' }}>
              <span style={{ fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>Total Due</span>
              <span style={{ fontSize: '34px', fontWeight: '900' }}>{formatMoney(bill.total)}</span>
            </div>
          </div>
        </div>

        {/* Professional Footer */}
        <div style={{ marginTop: '120px', paddingTop: '40px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '10px' }}>Merchant Support</p>
            <p style={{ fontSize: '14px', fontWeight: '700', color: brandColor }}>{shop?.upiId || 'No UPI Provided'}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'inline-block', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '12px', marginBottom: '10px' }}>
               <p style={{ fontSize: '9px', fontWeight: '800', color: '#94a3b8', margin: 0 }}>
                  TOKEN: {bill.id}-{new Date(bill.createdAt).getTime()}
               </p>
            </div>
            <p style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8' }}>Powered by Spendly Fintech Ecosystem</p>
          </div>
        </div>
      </div>
    </div>
  );
});
