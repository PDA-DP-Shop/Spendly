/**
 * Smart Text Classifier
 * Distinguishes between Bill/Receipt and Product Packaging
 */

export function classifyScannedText(text) {
  const lines = text.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 1)
  
  const fullText = text.toLowerCase()

  // ─── BILL / RECEIPT SIGNALS ───────
  const billSignals = [
    'total', 'subtotal', 'grand total',
    'amount', 'bill', 'receipt',
    'invoice', 'tax', 'gst', 'sgst',
    'cgst', 'igst', 'vat', 'paid',
    'balance', 'cash', 'change',
    'thank you', 'thanks for visiting',
    'welcome', 'items', 'qty', 'price',
    'rate', 'mrp', 'rs.', '₹', 'inr',
    'swiggy', 'zomato', 'order',
    'table', 'waiter', 'server no',
    'gstin', 'pan no', 'fssai'
  ]
  
  const billScore = billSignals.filter(
    signal => fullText.includes(signal)
  ).length
  
  // ─── PRODUCT PACKAGE SIGNALS ─────
  const productSignals = [
    'ingredients', 'contains',
    'nutrition', 'nutritional',
    'serving size', 'calories',
    'protein', 'carbohydrate',
    'fat', 'sodium', 'fiber',
    'manufactured by', 'mfg by',
    'packed by', 'distributed by',
    'best before', 'use by',
    'mfg date', 'exp date',
    'net weight', 'net wt',
    'net content', 'g ', 'kg ',
    'ml ', 'ltr', 'batch no',
    'lot no', 'fssai lic',
    'veg', 'non-veg',
    'country of origin',
    'customer care', 'helpline'
  ]
  
  const productScore = productSignals
    .filter(s => fullText.includes(s))
    .length

  // ─── CLASSIFY RESULT ─────────────
  if (billScore >= 3) {
    return {
      type: 'BILL',
      confidence: billScore,
      rawText: text
    }
  }
  
  if (productScore >= 2) {
    return {
      type: 'PRODUCT_PACKAGE',
      confidence: productScore,
      rawText: text
    }
  }
  
  if (billScore >= 1 && productScore === 0) {
    return {
      type: 'BILL',
      confidence: 'low',
      rawText: text
    }
  }
  
  return {
    type: 'UNKNOWN',
    confidence: 0,
    rawText: text
  }
}
