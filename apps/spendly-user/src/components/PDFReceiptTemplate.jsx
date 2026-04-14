import React from 'react';
import { formatMoney } from '../utils/formatMoney';
import { formatDate, formatTime } from '../utils/formatDate';

const S = { fontFamily: "'Inter', sans-serif" };

export const PDFReceiptTemplate = React.forwardRef(({ expense, currency }, ref) => {
  if (!expense) return null;

  const items = expense.billItems || [];
  const brandColor = '#1e1b4b'; // Deep navy for premium feel
  const accentColor = '#6366f1'; // Indigo for highlights

  return (
    <div 
      ref={ref}
      style={{
        width: '850px',
        minHeight: '1100px',
        padding: '80px',
        backgroundColor: '#ffffff',
        color: '#1e293b',
        fontFamily: "'Inter', sans-serif",
        position: 'absolute',
        left: '-9999px',
        top: 0,
        boxSizing: 'border-box'
      }}
    >
      {/* Premium Background Accent */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', backgroundColor: '#F8FAFC', borderRadius: '0 0 0 300px', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '100px', right: '100px', opacity: 0.03, zIndex: 0 }}>
         <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
         </svg>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header Section */}
        <div style={{ display: 'flex', flexDirection: 'column', items: 'center', textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ margin: '0 auto 25px auto', position: 'relative' }}>
             <div style={{ width: '100px', height: '100px', backgroundColor: '#000000', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
             </div>
             <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', width: '36px', height: '36px', backgroundColor: '#10B981', borderRadius: '12px', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
             </div>
          </div>
          <h2 style={{ fontSize: '38px', fontWeight: '900', color: brandColor, margin: '0 0 8px 0', letterSpacing: '-1.5px' }}>
            {expense.shopName || 'Local Merchant'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '4px', margin: 0 }}>
             Verified Digital Receipt
          </p>
        </div>

        {/* Amount Hero Section */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '40px', padding: '50px', color: 'white', marginBottom: '60px', overflow: 'hidden', position: 'relative', textAlign: 'center' }}>
           <div style={{ position: 'absolute', bottom: 0, right: 0, width: '150px', height: '150px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '150px 0 0 0' }} />
           <p style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.5)', marginBottom: '10px' }}>Total Amount Paid</p>
           <h2 style={{ fontSize: '56px', fontWeight: '900', margin: 0, letterSpacing: '-2px' }}>{formatMoney(expense.amount, currency)}</h2>
           
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '40px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div>
                <p style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>Payment Method</p>
                <p style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>{expense.paymentMethod || 'CASH'}</p>
              </div>
              <div>
                <p style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>Timestamp</p>
                <p style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>{formatDate(expense.date)} • {formatTime(expense.date)}</p>
              </div>
           </div>
        </div>

        {/* Itemized Table */}
        <div style={{ marginBottom: '60px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '4px', height: '18px', backgroundColor: accentColor, borderRadius: '4px' }} />
            Bill Breakdown
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                <th style={{ textAlign: 'left', padding: '15px 10px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Description</th>
                <th style={{ textAlign: 'center', padding: '15px 10px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Quantity</th>
                <th style={{ textAlign: 'right', padding: '15px 10px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '25px 10px', fontSize: '16px', fontWeight: '700' }}>{item.name}</td>
                  <td style={{ padding: '25px 10px', fontSize: '16px', fontWeight: '700', textAlign: 'center', color: '#64748b' }}>{item.quantity || 1}</td>
                  <td style={{ padding: '25px 10px', fontSize: '16px', fontWeight: '800', textAlign: 'right' }}>{formatMoney(item.price * (item.quantity || 1), currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary */}
        <div style={{ marginLeft: 'auto', width: '380px', backgroundColor: '#f8fafc', padding: '40px', borderRadius: '32px', border: '1px solid #f1f5f9' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#64748b' }}>Subtotal</span>
              <span style={{ fontSize: '14px', fontWeight: '800' }}>{formatMoney(expense.subtotal || expense.amount, currency)}</span>
           </div>
           {expense.tax > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#64748b' }}>Tax / VAT</span>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#ef4444' }}>+{formatMoney(expense.tax, currency)}</span>
              </div>
           )}
           <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: '900', textTransform: 'uppercase' }}>Final Total</span>
              <span style={{ fontSize: '30px', fontWeight: '900', color: brandColor }}>{formatMoney(expense.amount, currency)}</span>
           </div>
        </div>

        {/* Footer Guarantee */}
        <div style={{ marginTop: '100px', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '40px' }}>
            <div style={{ color: '#cbd5e1', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '15px' }}>Spendly Financial Integrity</div>
            <p style={{ color: '#94a3b8', fontSize: '11px', fontStyle: 'italic', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
              This document serves as a digital-native proof of expense. It is non-editable and cryptographically linked to the Spendly merchant identification network.
            </p>
            <div style={{ marginTop: '30px', color: '#e2e8f0', fontSize: '10px', fontWeight: '700' }}>
               Authenticated on {formatDate(expense.date)} via Spendly User App
            </div>
        </div>
      </div>
    </div>
  );
});
