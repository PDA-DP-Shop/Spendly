// qrCode.js
// Spendly Shop QR Code parser utility

export function parseScannedQR(qrString) {
  try {
    const data = JSON.parse(qrString)
    
    // Adapt old format temporarily if user still testing
    if (data.type === 'SPENDLY_BILL' && data.source !== 'spendly-shop') {
       data.source = 'spendly-shop'
       data.billId = data.billId || `LEGACY-${Date.now()}`
       data.shop = {
         id: data.shopId || data.shop?.id || 'LEGACY',
         name: data.shopName || data.shop?.name || 'Unknown',
         address: data.shopAddress || data.shop?.address || ''
       }
       data.billNumber = data.billNumber || `LEGACY-${Date.now()}`
    }

    if (data.source !== 'spendly-shop') {
      return { isSpendlyBill: false, data: null, error: 'Not a Spendly bill QR' }
    }

    if (!data.billId || !data.billNumber || !data.shop || !data.total) {
      return { isSpendlyBill: false, data: null, error: 'Invalid bill data' }
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
    return { isSpendlyBill: false, data: null, error: 'Could not read QR code' }
  }
}
