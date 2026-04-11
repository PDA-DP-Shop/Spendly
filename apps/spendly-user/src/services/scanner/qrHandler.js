/**
 * UPI QR Code Handler
 * Specifically designed for Indian UPI (Unified Payments Interface) QR codes
 */

export function handleQRCode(qrValue) {
  // Check if UPI QR
  if (qrValue.startsWith('upi://')) {
    const url = new URL(qrValue.replace('upi://', 'http://'))
    const params = new URLSearchParams(url.search)

    const merchantName = 
      params.get('pn') ||      // Payee Name
      params.get('pa') ||      // Payee Address (UPI ID)
      'UPI Payment'

    const amount = params.get('am') || ''
    const note = params.get('tn') || '' // Transaction Note
    const upiId = params.get('pa')

    return {
      type: 'UPI_QR',
      shopName: decodeURIComponent(merchantName),
      amount: amount,
      note: note,
      category: autoDetectUPICategory(merchantName),
      upiId: upiId,
      confidence: 'high'
    }
  }

  // Generic QR Code
  if (qrValue.length > 3) {
    return {
      type: 'QR_CODE',
      note: qrValue.substring(0, 50),
      raw: qrValue,
      confidence: 'low'
    }
  }

  return null
}

function autoDetectUPICategory(name) {
  const n = name.toLowerCase()
  
  if (n.match(/zomato|swiggy|restaurant|food|cafe|kitchen|bakery|eat/)) return 'food'
  if (n.match(/uber|ola|rapido|petrol|fuel|cng|taxi|metro/)) return 'travel'
  if (n.match(/amazon|flipkart|meesho|shop|store|mart|mall/)) return 'shopping'
  if (n.match(/jio|airtel|vi|recharge|electricity|bescom|water/)) return 'bills'
  if (n.match(/hospital|clinic|med|pharmacy|doctor/)) return 'health'
  
  return 'shopping' // Default for UPI merchants
}
