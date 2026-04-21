import Tesseract from 'tesseract.js'
import { db as database } from './database'

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

/**
 * Run OCR on a bill image using Tesseract.js
 * Uses intelligent paths for PWA/Mobile compatibility
 */
export const runOCR = async (imageFile) => {
  const worker = await Tesseract.createWorker('eng', 1, {
    workerPath: isIOS
      ? 'https://unpkg.com/tesseract.js@4/dist/worker.min.js'
      : '/tesseract/worker.min.js',
    corePath: isIOS
      ? 'https://unpkg.com/tesseract.js-core@4/tesseract-core.wasm.js'
      : '/tesseract/tesseract-core.wasm.js',
    langPath: 'https://tessdata.projectnaptha.com/4.0.0'
  })

  try {
    const result = await worker.recognize(imageFile)
    await worker.terminate()
    return extractBillData(result.data.text)
  } catch (err) {
    console.error('OCR Error:', err)
    await worker.terminate()
    return {
      shopName: null,
      totalAmount: null,
      date: null,
      time: null,
      confidence: 'low',
      rawText: ''
    }
  }
}

/**
 * Intelligent regex-based extraction for bill data
 */
function extractBillData(rawText) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 2)
  
  // 1. Shop name: usually the first large line at the top
  const shopName = lines[0] || null

  // 2. Total amount: Look for "Total" or "Grand Total" followed by a number
  let totalAmount = null
  const totalMatch = rawText.match(/(?:TOTAL|GRAND TOTAL|NET AMOUNT|AMOUNT DUE)[\s:]*[\d.,]+/i)
  if (totalMatch) {
    const numPart = totalMatch[0].match(/[\d.,]+/)[0].replace(',', '')
    totalAmount = parseFloat(numPart)
  }

  // 3. Date: Look for common date patterns
  const dateMatch = rawText.match(/\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4})|(?:\d{4}[/-]\d{1,2}[/-]\d{1,2})\b/)
  const date = dateMatch ? dateMatch[0] : null

  // 4. Time: Look for common time patterns
  const timeMatch = rawText.match(/\b\d{1,2}[:.]\d{2}(?:\s?[AP]M)?\b/i)
  const time = timeMatch ? timeMatch[0] : null

  // 5. Confidence logic
  let confidence = 'low'
  if (shopName && totalAmount) confidence = 'high'
  else if (totalAmount || shopName) confidence = 'medium'

  return {
    shopName,
    totalAmount,
    date,
    time,
    confidence,
    rawText
  }
}

/**
 * Persistence methods for Scan History
 */
export async function getScanHistory() {
  try {
    return await database.billScans.orderBy('scannedAt').reverse().toArray()
  } catch (e) {
    return []
  }
}

export async function deleteScan(id) {
  return await database.billScans.delete(id)
}

export async function markScanAsAdded(id) {
  return await database.billScans.update(id, { addedAsExpense: true })
}
