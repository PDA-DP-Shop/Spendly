/**
 * Barcode Detector Service
 * Uses ZXing to detect EAN, UPC, and other standard barcodes
 */
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library'

// 1. Configure Hints for Broad Compatibility (UPC_A is critical for the user)
const hints = new Map()
hints.set(DecodeHintType.POSSIBLE_FORMATS, [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.QR_CODE,
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39
])
hints.set(DecodeHintType.TRY_HARDER, true) // Enable intensive search for barcodes

// 2. Initialize Reader with Hints
const reader = new BrowserMultiFormatReader(hints)

/**
 * Scan a single frame (canvas or video element) for barcodes
 */
export async function detectBarcode(source) {
  try {
    // ZXing JS decodeFromCanvas handles the canvas image data extraction
    const result = await reader.decodeFromCanvas(source)
    if (result) {
      return {
        text: result.getText(),
        format: result.getBarcodeFormat(),
        points: result.getResultPoints()
      }
    }
  } catch (err) {
    // No barcode found in this frame (standard behavior)
  }
  return null
}

/**
 * Handle a detected barcode value
 * Logic matches the user's PR description
 */
import { scannedProductService, productCacheService } from '../database'
import { lookupBarcode } from '../productLookup'

export async function processBarcode(barcodeValue) {
  const code = String(barcodeValue).trim()
  
  // 1. Check local cache (Scanned by user before / Stored in IndexedDB)
  const cached = await scannedProductService.get(code)
  if (cached) {
    return {
      success: true,
      data: {
        shopName: cached.productName,
        category: cached.category,
        note: cached.brand,
        scanType: 'barcode',
        barcodeValue: code
      },
      source: 'LOCAL_HISTORY'
    }
  }

  // 2. High-Performance Three-Tier Lookup (Local 50k -> Cache -> API)
  const productInfo = await lookupBarcode(code)
  
  if (productInfo) {
    return {
      success: true,
      data: {
        shopName: productInfo.name,
        category: productInfo.category,
        note: productInfo.brand,
        imageUri: productInfo.image,
        scanType: 'barcode',
        barcodeValue: code
      },
      source: productInfo.source === 'local' ? 'OFFLINE_DB' : 'REMOTE_API'
    }
  }

  // Final Fallback: Return raw barcode immediately for sub-second redirect
  return {
    success: true,
    data: {
      shopName: 'New Product',
      note: `Barcode: ${barcodeValue}`,
      scanType: 'barcode',
      barcodeValue
    },
    source: 'UNKNOWN_BARCODE'
  }
}

function mapToSpendlyCategory(tags = []) {
  const t = tags.join(',').toLowerCase()
  if (t.match(/beverage|drink|water|juice|soda/)) return 'food'
  if (t.match(/snack|confection|biscuit|chocolate|chips/)) return 'food'
  if (t.match(/dairy|cheese|milk|yogurt/)) return 'food'
  if (t.match(/cosmetic|personal care|beauty|soap|shampoo/)) return 'shopping'
  if (t.match(/health|medicine|vitamin|supplement/)) return 'health'
  return 'shopping'
}
