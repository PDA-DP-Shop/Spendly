import { jsPDF } from 'jspdf';
import { formatMoney } from '../utils/formatMoney';
import { formatDate } from '../utils/formatDate';

/**
 * Generates a PDF of the bill for download/sharing
 */
export async function generateBillPDF(bill, shop) {
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a6', // Convenient size for bills
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  let y = 15;

  // Header
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(shop?.name || 'My Shop', pageWidth / 2, y, { align: 'center' });
  
  y += 6;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(shop?.address || '', pageWidth / 2, y, { align: 'center' });
  
  y += 4;
  doc.text(`Ph: ${shop?.phone || ''}`, pageWidth / 2, y, { align: 'center' });

  y += 8;
  doc.line(margin, y, pageWidth - margin, y);
  
  // Bill Info
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text(`Bill No: ${bill.billNumber}`, margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(bill.createdAt, 'short'), pageWidth - margin, y, { align: 'right' });
  
  if (bill.customerName) {
    y += 5;
    doc.text(`Customer: ${bill.customerName}`, margin, y);
  }

  y += 4;
  doc.line(margin, y, pageWidth - margin, y);
  
  // Items Table Header
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Item', margin, y);
  doc.text('Qty', pageWidth - 25, y, { align: 'right' });
  doc.text('Total', pageWidth - margin, y, { align: 'right' });

  y += 2;
  doc.line(margin, y, pageWidth - margin, y);

  // Items
  doc.setFont('helvetica', 'normal');
  bill.items.forEach(item => {
    y += 6;
    doc.text(item.name, margin, y);
    doc.text(item.quantity.toString(), pageWidth - 25, y, { align: 'right' });
    doc.text(formatMoney(item.price * item.quantity), pageWidth - margin, y, { align: 'right' });
  });

  y += 4;
  doc.line(margin, y, pageWidth - margin, y);

  // Totals
  y += 6;
  doc.text('Subtotal:', pageWidth - 30, y, { align: 'right' });
  doc.text(formatMoney(bill.subtotal), pageWidth - margin, y, { align: 'right' });

  if (bill.gstAmount > 0) {
    y += 5;
    doc.text(`GST (${bill.gstPercent}%):`, pageWidth - 30, y, { align: 'right' });
    doc.text(formatMoney(bill.gstAmount), pageWidth - margin, y, { align: 'right' });
  }

  if (bill.discountAmount > 0) {
    y += 5;
    doc.text('Discount:', pageWidth - 30, y, { align: 'right' });
    doc.text(`-${formatMoney(bill.discountAmount)}`, pageWidth - margin, y, { align: 'right' });
  }

  y += 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', pageWidth - 30, y, { align: 'right' });
  doc.text(formatMoney(bill.total), pageWidth - margin, y, { align: 'right' });

  // Footer
  y += 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(shop?.billFooterMessage || 'Thank you!', pageWidth / 2, y, { align: 'center' });
  
  y += 5;
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('Powered by Spendly Shop', pageWidth / 2, y, { align: 'center' });

  doc.save(`${bill.billNumber}.pdf`);
}
