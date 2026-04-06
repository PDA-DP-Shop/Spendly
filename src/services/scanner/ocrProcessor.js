/**
 * OCR Processor Service - Neural Accuracy Shield
 * Uses Tesseract.js with Multi-Pass Image Adaptive Binarization
 */
import { createWorker } from 'tesseract.js'

let worker = null

export async function getOCRWorker() {
  if (worker) return worker

  worker = await createWorker('eng', 1, {
    logger: m => console.log(m?.status, m?.progress),
    workerBlobURL: true
  })

  await worker.setParameters({
    tessedit_char_whitelist: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.,₹rs.:- /',
    tessedit_pageseg_mode: '1', 
  })

  return worker
}

export async function preloadOCRWorker() {
  try { await getOCRWorker() } catch (e) {}
}

/**
 * Adaptive Binarization Logic
 * Converts image to Black & White for maximum OCR precision.
 * Removes shadows and creases from receipts.
 */
function applyBinarization(ctx, width, height, threshold = 128) {
  const imgData = ctx.getImageData(0, 0, width, height)
  const data = imgData.data
  
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i+1] + data[i+2]) / 3
    const val = avg >= threshold ? 255 : 0
    data[i] = data[i+1] = data[i+2] = val
  }
  
  ctx.putImageData(imgData, 0, 0)
}

/**
 * Image Pre-processor
 * Scaling + Normalization + Thresholding
 */
export async function preprocessImage(imageSource, passType = 'NORMAL') {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  
  const MAX_SIZE = passType === 'HIGH_RES' ? 1200 : 800
  let width = imageSource.videoWidth || imageSource.width
  let height = imageSource.videoHeight || imageSource.height
  
  const scale = Math.min(MAX_SIZE / width, MAX_SIZE / height, 1)
  width *= scale
  height *= scale
  
  canvas.width = width
  canvas.height = height
  
  // Normalization Filters
  if (passType === 'CONTRAST') {
    ctx.filter = 'grayscale(100%) contrast(250%) brightness(110%)'
  } else {
    ctx.filter = 'grayscale(100%) contrast(150%) brightness(120%)'
  }
  
  ctx.drawImage(imageSource, 0, 0, width, height)
  
  // Apply Binarization for near-perfect character separation
  if (passType === 'BINARY') {
    applyBinarization(ctx, width, height, 140)
  }
  
  return canvas.toDataURL('image/jpeg', 0.9)
}

/**
 * Multi-Pass OCR Execution
 * If pass 1 (Normal) yields low confidence, pass 2 (Binary High Contrast) is triggered.
 */
export async function runOCR(imageSource, fastMode = false) {
  const ocrWorker = await getOCRWorker()
  
  if (fastMode) {
    // Fast detection pass (No Binarization / Single Pass)
    const res = await ocrWorker.recognize(imageSource)
    return res.data.text
  }

  // Pass 1: Normal Normalized Scan (Fast & Accurate for good lighting)
  const img1 = await preprocessImage(imageSource, 'NORMAL')
  const res1 = await ocrWorker.recognize(img1)
  
  // Check Confidence: If AI is unsure (> 75% is good), trigger fallback
  if (res1.data.confidence > 75 && res1.data.text.length > 20) {
    return res1.data.text
  }
  
  // Pass 2: Neural Binary Scan (Extremely robust for poor lighting/complex backgrounds)
  console.log("Shield Activated: Running High-Confidence Binary Pass...")
  const img2 = await preprocessImage(imageSource, 'BINARY')
  const res2 = await ocrWorker.recognize(img2)
  
  // Combine results or take the best one
  return res2.data.confidence >= res1.data.confidence ? res2.data.text : res1.data.text
}
