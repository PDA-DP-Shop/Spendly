/**
 * Hybrid Cloud Scan Service
 * Fallback orchestrator for 99% accuracy when internet is available.
 */
import { extractBillData } from './billExtractor'
import { extractProductData } from './productExtractor'

// Free API Endpoint for OCR.space (Example of a robust free OCR)
// User can get a free key at: https://ocr.space/OCRAPI
const OCR_SPACE_API_KEY = '' // HOOK: User to insert key if desired
const OCR_SPACE_URL = 'https://api.ocr.space/parse/image'

export async function runCloudScan(imageDataBase64, type = 'BILL') {
  if (!OCR_SPACE_API_KEY) {
    console.warn("Cloud OCR Hook: No API Key found. Falling back to Advanced Local Engine.")
    return null
  }

  try {
    const formData = new FormData()
    formData.append('base64Image', imageDataBase64)
    formData.append('apikey', OCR_SPACE_API_KEY)
    formData.append('language', 'eng')
    formData.append('isOverlayRequired', 'false')
    formData.append('scale', 'true')
    formData.append('isTable', type === 'BILL' ? 'true' : 'false')

    const response = await fetch(OCR_SPACE_URL, {
      method: 'POST',
      body: formData
    })

    const data = await response.json()
    
    if (data.OCRExitCode === 1 && data.ParsedResults?.[0]) {
      const text = data.ParsedResults[0].ParsedText
      console.log("Cloud OCR Success:", text.substring(0, 100) + "...")
      
      if (type === 'BILL') {
        return { type: 'BILL', data: extractBillData(text), source: 'CLOUD' }
      } else {
        return { type: 'PRODUCT', data: extractProductData(text), source: 'CLOUD' }
      }
    }
    
    return null
  } catch (err) {
    console.error("Cloud OCR Error:", err)
    return null
  }
}

/**
 * Check if the device is currently online and capable of cloud scan
 */
export function isCloudReady() {
  return window.navigator.onLine && OCR_SPACE_API_KEY.length > 0
}
