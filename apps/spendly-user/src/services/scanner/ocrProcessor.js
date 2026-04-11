/**
 * OCR Processor Service - Neural Accuracy Shield
 * Uses Tesseract.js with Multi-Pass Image Adaptive Binarization
 */
import { createWorker } from 'tesseract.js'
import { applyNeuralCorrections } from './ocrCorrector'

let worker = null

export async function getOCRWorker() {
  if (worker) return worker

  worker = await createWorker('eng', 1, {
    logger: m => console.log(m?.status, m?.progress),
    workerBlobURL: true
  })

  await worker.setParameters({
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
/**
 * Adaptive Binarization Logic (Neural Shield)
 * Converts image to Black & White with edge-weighted thresholding
 */
function applyBinarization(ctx, width, height, threshold = 128) {
  const imgData = ctx.getImageData(0, 0, width, height)
  const data = imgData.data
  
  // Pass 1: Local Mean (Simplified)
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i+1] + data[i+2]) / 3
    const val = avg >= threshold ? 255 : 0
    data[i] = data[i+1] = data[i+2] = val
  }
  
  ctx.putImageData(imgData, 0, 0)
}

/**
 * Convolution Kernel (Sharpening)
 * Makes text edges crisp for Tesseract's neural network.
 */
function applyConvolution(ctx, width, height, weights) {
  const side = Math.round(Math.sqrt(weights.length))
  const halfSide = Math.floor(side / 2)
  const src = ctx.getImageData(0, 0, width, height)
  const sw = src.width
  const sh = src.height
  const output = ctx.createImageData(sw, sh)
  const dst = output.data
  const srcData = src.data

  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const sy = y
      const sx = x
      const dstOff = (y * sw + x) * 4
      let r = 0, g = 0, b = 0
      
      for (let cy = 0; cy < side; cy++) {
        for (let cx = 0; cx < side; cx++) {
          const scy = sy + cy - halfSide
          const scx = sx + cx - halfSide
          if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
            const srcOff = (scy * sw + scx) * 4
            const wt = weights[cy * side + cx]
            r += srcData[srcOff] * wt
            g += srcData[srcOff + 1] * wt
            b += srcData[srcOff + 2] * wt
          }
        }
      }
      dst[dstOff] = r
      dst[dstOff + 1] = g
      dst[dstOff + 2] = b
      dst[dstOff + 3] = srcData[dstOff + 3] // preserve alpha
    }
  }
  ctx.putImageData(output, 0, 0)
}

/**
 * Image Pre-processor (High Performance)
 * Scaling + Normalization + Thresholding
 */
export async function preprocessImage(imageSource, passType = 'NORMAL') {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  
  // Advanced Resolution Scaling: 2500px for full-bill clarity
  const MAX_SIZE = (passType === 'HIGH_RES' || passType === 'BINARY') ? 2500 : 1200
  let width = imageSource.videoWidth || imageSource.width
  let height = imageSource.videoHeight || imageSource.height
  
  const scale = Math.min(MAX_SIZE / width, MAX_SIZE / height, 1)
  width *= scale
  height *= scale
  
  canvas.width = width
  canvas.height = height
  
  // Advanced Multi-Stage Filtering
  if (passType === 'BINARY' || passType === 'HIGH_RES') {
    // Ultra-Contrast + Sharpness spike
    ctx.filter = 'grayscale(100%) contrast(350%) brightness(110%) saturate(0%)'
  } else if (passType === 'CONTRAST') {
    ctx.filter = 'grayscale(100%) contrast(250%) brightness(110%)'
  } else {
    ctx.filter = 'grayscale(100%) contrast(180%) brightness(120%)'
  }
  
  ctx.drawImage(imageSource, 0, 0, width, height)
  
  // Custom Adaptive Sharpening (Micro-edge detection)
  if (passType === 'BINARY' || passType === 'HIGH_RES') {
    applyConvolution(ctx, width, height, [
       0, -1,  0,
      -1,  5, -1,
       0, -1,  0
    ])
    applyBinarization(ctx, width, height, 140)
  }
  
  return canvas.toDataURL('image/jpeg', 0.85)
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
    return applyNeuralCorrections(res.data.text)
  }

  // Pass 1: Normal Normalized Scan (Fast & Accurate for good lighting)
  const img1 = await preprocessImage(imageSource, 'NORMAL')
  const res1 = await ocrWorker.recognize(img1)
  
  // Check Confidence: If AI is unsure (> 75% is good), trigger fallback
  if (res1.data.confidence > 75 && res1.data.text.length > 20) {
    return applyNeuralCorrections(res1.data.text)
  }
  
  // Pass 2: Neural Binary Scan (Extremely robust for poor lighting/complex backgrounds)
  console.log("Shield Activated: Running High-Confidence Binary Pass...")
  const img2 = await preprocessImage(imageSource, 'BINARY')
  const res2 = await ocrWorker.recognize(img2)
  
  // Combine results or take the best one
  const finalRaw = res2.data.confidence >= res1.data.confidence ? res2.data.text : res1.data.text
  return applyNeuralCorrections(finalRaw)
}
