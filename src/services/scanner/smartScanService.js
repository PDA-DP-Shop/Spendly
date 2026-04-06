/**
 * Smart Scan Orchestrator
 * Pipeline: Barcode -> Stability Check -> OCR -> Classification -> Extraction
 */
import { detectBarcode, processBarcode } from './barcodeDetector'
import { handleQRCode } from './qrHandler'
import { runOCR } from './ocrProcessor'
import { classifyScannedText } from './textClassifier'
import { extractBillData } from './billExtractor'
import { extractProductData } from './productExtractor'

/**
 * Image Stability Check
 * Compares current frame with previous to ensure no motion/blur
 * Returns true if difference < 8%
 */
let prevFrameData = null

export function isImageStable(canvas) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  const { width, height } = canvas
  
  // Guard against 0, null, undefined, NaN, or negative dimensions
  if (!width || !height || width <= 0 || height <= 0) return false

  let currentFrame;
  try {
    currentFrame = ctx.getImageData(0, 0, width, height).data
  } catch (err) {
    return false
  }
  
  if (!prevFrameData) {
    prevFrameData = new Uint8ClampedArray(currentFrame)
    return false
  }

  let diff = 0
  // Performance: Sample every 32nd byte (8th pixel) for even faster comparison
  for (let i = 0; i < currentFrame.length; i += 32) {
    diff += Math.abs(currentFrame[i] - prevFrameData[i])
  }

  // Relaxed Threshold: 25% difference allowed for shaky hands
  const threshold = (width * height * 4) * 0.25
  const isStable = diff < threshold
  
  prevFrameData = new Uint8ClampedArray(currentFrame)
  return isStable
}

/**
 * Main Scanning Pipeline
 * Runs on every camera frame
 */
export async function runScanPipeline(videoElement, canvasElement, skipStability = false, fastMode = false) {
  if (!canvasElement || canvasElement.width <= 0 || canvasElement.height <= 0) {
    return null
  }

  // Layer 1: Image Stability Check
  // We proceed to OCR only if steady OR if we are forced due to timeout
  if (!skipStability && !isImageStable(canvasElement)) {
    return { type: 'STATUS', message: 'Steady your camera...' }
  }

  // Layer 3: Smart OCR Detection
  try {
    const ocrText = await runOCR(canvasElement, fastMode)
    if (!ocrText || ocrText.trim().length < 5) return null

    const classification = classifyScannedText(ocrText)
    
    if (classification.type === 'BILL') {
      const billData = extractBillData(ocrText)
      return { type: 'BILL', result: billData, confidence: classification.confidence }
    }
    
    if (classification.type === 'PRODUCT_PACKAGE') {
      const productData = extractProductData(ocrText)
      return { type: 'PRODUCT', result: productData }
    }

    return { type: 'STATUS', message: 'Try pointing at a product or bill' }
  } catch (err) {
    console.error("OCR Pipeline error", err)
    return null
  }
}
/**
 * Manual Scanning Pipeline
 * Triggered on user click in SCAN mode
 */
export async function processManualScan(canvasElement) {
  if (!canvasElement || canvasElement.width <= 0 || canvasElement.height <= 0) {
    return null
  }

  try {
    // We skip Barcode/Stability checks and go straight to High-Quality OCR
    const ocrText = await runOCR(canvasElement)
    if (!ocrText || ocrText.trim().length < 5) return null

    const classification = classifyScannedText(ocrText)
    
    if (classification.type === 'BILL') {
      const billData = extractBillData(ocrText)
      return { type: 'BILL', data: billData }
    }
    
    if (classification.type === 'PRODUCT_PACKAGE') {
      const productData = extractProductData(ocrText)
      return { type: 'PRODUCT', data: productData }
    }

    return { type: 'STATUS', message: 'Try pointing at a product or bill' }
  } catch (err) {
    console.error("Manual OCR Pipeline error", err)
    return null
  }
}
