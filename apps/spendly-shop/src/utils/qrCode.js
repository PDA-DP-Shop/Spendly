// qrCode.js
// Generates QR code data for bills
// Each QR is completely unique
// Even same shop same item = different QR

import {
  generateBillNumber,
  generateBillId
} from './billNumber'

// Generate complete QR data object
// This goes inside every QR code
export function generateQRData({
  shopId,
  shopName,
  shopAddress,
  items,
  subtotal,
  tax,
  total,
  paymentMethod,
  cashierId
}) {

  const billNumber = generateBillNumber(
    shopName,
    shopId
  )

  const billId = generateBillId(shopId)

  const timestamp = new Date().toISOString()

  const qrData = {
    // Unique identifiers
    billId: billId,
    billNumber: billNumber,
    
    // Shop info
    shop: {
      id: shopId,
      name: shopName,
      address: shopAddress || ''
    },

    // Transaction info
    timestamp: timestamp,
    items: items || [],
    
    // Amounts
    subtotal: subtotal || 0,
    tax: tax || 0,
    total: total || 0,
    
    // Payment
    paymentMethod: paymentMethod || 'cash',
    cashierId: cashierId || null,

    // Version for future compatibility
    version: '1.0',
    
    // Source identifier
    source: 'spendly-shop'
  }

  // Return as compact JSON string
  // for QR code generation
  return {
    billNumber,
    billId,
    qrString: JSON.stringify(qrData),
    qrData
  }
}

// Parse QR code when scanned
// by Spendly expense tracker
export function parseScannedQR(
  qrString
) {
  try {
    const data = JSON.parse(qrString)
    
    // Validate it is a Spendly bill
    if (data.source !== 'spendly-shop' && data.type !== 'SPENDLY_BILL') {
      return {
        isSpendlyBill: false,
        data: null,
        error: 'Not a Spendly bill QR'
      }
    }

    // Adapt old format to new format
    if (data.type === 'SPENDLY_BILL') {
       data.source = 'spendly-shop'
       data.billId = data.billId || `LEGACY-${Date.now()}`
       data.shop = {
         id: data.shopId || data.shop?.id || 'LEGACY',
         name: data.shopName || data.shop?.name || 'Unknown',
         address: data.shopAddress || data.shop?.address || ''
       }
       data.billNumber = data.billNumber || `LEGACY-${Date.now()}`
    }

    // Validate required fields
    if (
      !data.billId ||
      !data.billNumber ||
      !data.shop ||
      !data.total
    ) {
      return {
        isSpendlyBill: false,
        data: null,
        error: 'Invalid bill data'
      }
    }

    return {
      isSpendlyBill: true,
      data: {
        billId: data.billId,
        billNumber: data.billNumber,
        shopName: data.shop.name,
        shopId: data.shop.id,
        shopAddress: data.shop.address,
        items: data.items,
        subtotal: data.subtotal,
        tax: data.tax,
        total: data.total,
        paymentMethod: data.paymentMethod,
        timestamp: data.timestamp
      },
      error: null
    }
  } catch {
    return {
      isSpendlyBill: false,
      data: null,
      error: 'Could not read QR code'
    }
  }
}
