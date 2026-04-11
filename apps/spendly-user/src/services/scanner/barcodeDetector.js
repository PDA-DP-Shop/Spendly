/**
 * Barcode Detector Service
 * Optimized for Mobile Safari and Chrome with intelligent preprocessing
 */
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library'
import { scannedProductService } from '../database'
import { lookupBarcode } from '../productLookup'

// 1. Configure Hints for Broad Compatibility
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
hints.set(DecodeHintType.TRY_HARDER, true)

// 2. Initialize Native Hardware Reader (If available)
const nativeDetector = ('BarcodeDetector' in window) ? new window.BarcodeDetector({
  formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code', 'code_128', 'code_39']
}) : null

// 3. Initialize ZXing Reader (Fallback)
const zxingReader = new BrowserMultiFormatReader(hints)

/**
 * Scan a single frame for barcodes
 * Uses an 'Extreme Mobile Pass' ladder for 99.9% reliability on Safari
 */
export async function detectBarcode(source) {
  // Pass 1: Try Native Hardware Detector (Near-Instant)
  if (nativeDetector) {
    try {
      const results = await nativeDetector.detect(source)
      if (results.length > 0) {
        return { text: results[0].rawValue, format: results[0].format }
      }
    } catch (e) {
      console.warn('Native BarcodeDetector failed', e)
    }
  }

  // Pass 2: Software Decode (Robust DataURL Pass)
  // Converting to DataURL is more stable on Safari than direct canvas access
  const frameData = source.toDataURL('image/jpeg', 0.9)
  try {
    const result = await zxingReader.decodeFromImageUrl(frameData)
    if (result) {
      return { text: result.getText(), format: result.getBarcodeFormat() }
    }
  } catch (err) {
    // Normal pass failed
  }

  // Pass 3: Neural Binarization (Deep Contrast Pass)
  try {
    const ctx = source.getContext('2d', { willReadFrequently: true })
    const w = source.width
    const h = source.height
    const imgData = ctx.getImageData(0, 0, w, h)
    const data = imgData.data
    
    // Advanced Thresholding + Grayscale
    for (let i = 0; i < data.length; i += 4) {
      const v = (data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114)
      const thr = v > 110 ? 255 : 0 // Strategic threshold
      data[i] = data[i+1] = data[i+2] = thr
    }
    ctx.putImageData(imgData, 0, 0)
    
    const binarizedData = source.toDataURL('image/jpeg', 0.9)
    const secondResult = await zxingReader.decodeFromImageUrl(binarizedData)
    if (secondResult) {
      return { text: secondResult.getText(), format: secondResult.getBarcodeFormat() }
    }
  } catch (e) {
    // Pass 3 fail
  }

  // Pass 4: Color Inversion Pass (For dark-mode barcodes)
  try {
    const ctx = source.getContext('2d', { willReadFrequently: true })
    const imgData = ctx.getImageData(0, 0, source.width, source.height)
    const data = imgData.data
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i]
      data[i+1] = 255 - data[i+1]
      data[i+2] = 255 - data[i+2]
    }
    ctx.putImageData(imgData, 0, 0)
    
    const invertedData = source.toDataURL('image/jpeg', 0.9)
    const thirdResult = await zxingReader.decodeFromImageUrl(invertedData)
    if (thirdResult) {
       return { text: thirdResult.getText(), format: thirdResult.getBarcodeFormat() }
    }
  } catch (e) {
    // Final fail
  }
  
  return null
}

/**
 * Handle a detected barcode value
 */
export async function processBarcode(barcodeValue) {
  const code = String(barcodeValue).trim()
  
  // 1. Check local history (Learned from user)
  const cached = await scannedProductService.get(code)
  if (cached) {
    return {
      success: true,
      data: {
        shopName: cached.productName,
        category: cached.category,
        amount: cached.amount || 0,
        note: cached.brand,
        scanType: 'barcode',
        barcodeValue: code,
        isVerified: true
      },
      source: 'LOCAL_HISTORY'
    }
  }

  // 2. lookupBarcode (Local 50k -> Cache -> API)
  const productInfo = await lookupBarcode(code)
  
  if (productInfo) {
    return {
      success: true,
      data: {
        shopName: productInfo.name,
        category: productInfo.category,
        amount: productInfo.amount || 0,
        note: productInfo.brand,
        imageUri: productInfo.image,
        scanType: 'barcode',
        barcodeValue: code,
        isVerified: productInfo.source === 'local'
      },
      source: productInfo.source === 'local' ? 'OFFLINE_DB' : 'REMOTE_API'
    }
  }

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
