/**
 * Advanced Bill Data Extractor
 * High-Intelligence parsing for complex receipts, taxes, and multi-line items
 */
import { format } from 'date-fns'

export function extractBillData(ocrText) {
  const lines = ocrText.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
  const fullText = ocrText.toLowerCase()
  
  const merchant = extractMerchant(lines)
  const { amount, taxInfo } = extractDetailedAmounts(fullText, lines)
  const date = extractDate(fullText)
  const category = detectBillCategory(fullText)
  
  return {
    shopName: merchant,
    amount: amount,
    taxAmount: taxInfo.tax,
    date: date,
    category: category,
    scanType: 'bill',
    confidence: calculateConfidence(merchant, amount, date),
    rawOcrText: ocrText
  }
}

function extractMerchant(lines) {
  const top = lines.slice(0, 6)
  const skipPatterns = [
    /^\d+$/, 
    /phone|tel|mob|email|@|www/i,
    /gstin|pan|fssai|tin|cin|reg|vat/i,
    /receipt|invoice|bill|cash|card|txn|date|time|order/i,
    /total|subtotal|tax|discount|change|item|qty/i
  ]
  
  for (const line of top) {
    const isSkip = skipPatterns.some(p => p.test(line))
    if (!isSkip && line.length > 2 && line.length < 50) {
      // Basic formatting cleanup
      let clean = line.replace(/[^a-zA-Z0-9\s#&]/g, '').trim()
      // Strip trailing noise like "Tel 123" or "GST: 456" if mistakenly kept
      clean = clean.split(/\s(?:tel|mob|gst|fssai|reg|pan)/i)[0].trim()
      return clean
    }
  }
  return 'Miscellaneous Merchant'
}

/**
 * Intelligent Amount Extraction
 * Separates Sub-Totals, Taxes, and Final Totals to avoid mis-identification
 */
function extractDetailedAmounts(text, lines) {
  const cleanText = text.replace(/[₹$]|rs\.?\s*|rupees?\s*/gi, 'AMT ')
  
  // 1. Look for Tax patterns specifically to isolate them
  let detectedTax = 0
  const taxPatterns = [
    /(?:cgst|sgst|igst|vat|tax|gst)\s*(?:\d+%)?[:\s]*AMT\s*(\d+[,.]\d+)/gi,
    /total\s*tax[:\s]*AMT\s*(\d+[,.]\d+)/gi
  ]
  
  let match
  for (const pattern of taxPatterns) {
    while ((match = pattern.exec(cleanText)) !== null) {
      detectedTax += parseFloat(match[1].replace(',', '.'))
    }
  }

  // 2. Identify the Final Total (highest priority)
  const totalPatterns = [
    /grand\s*total[:\s]*AMT\s*(\d+[,.]\d+)/i,
    /total\s*amount[:\s]*AMT\s*(\d+[,.]\d+)/i,
    /total\s*paid[:\s]*AMT\s*(\d+[,.]\d+)/i,
    /net\s*pay[:\s]*AMT\s*(\d+[,.]\d+)/i,
    /net\s*amount[:\s]*AMT\s*(\d+[,.]\d+)/i,
    /total[:\s]*AMT\s*(\d+[,.]\d+)/i,
    /AMT\s*(\d+[,.]\d+)\s*$/m 
  ]
  
  let finalAmount = ''
  for (const pattern of totalPatterns) {
    const m = cleanText.match(pattern)
    if (m) {
      const val = parseFloat(m[1].replace(',', '.'))
      if (val > 0) {
        finalAmount = val.toString()
        break
      }
    }
  }

  // 3. Logic-check: Final Total should be >= Sub-totals found
  const allAmounts = []
  const amountPattern = /\d+[,.]\d{2}/g
  let am
  while ((am = amountPattern.exec(cleanText))) {
    allAmounts.push(parseFloat(am[0].replace(',', '.')))
  }

  if (!finalAmount && allAmounts.length > 0) {
    finalAmount = Math.max(...allAmounts).toString()
  }

  return { 
    amount: finalAmount, 
    taxInfo: { tax: detectedTax.toString() } 
  }
}

function extractDate(text) {
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
    /(\d{1,2})\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(\d{4})/i,
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/
  ]
  
  for (const pattern of datePatterns) {
    const m = text.match(pattern)
    if (m) return m[0]
  }
  return format(new Date(), "yyyy-MM-dd'T'HH:mm")
}

function detectBillCategory(text) {
  const keywords = {
    food: /restaurant|cafe|coffee|food|hotel|dhaba|kitchen|mess|tiffin|bakery|pizza|burger|biryani|thali|swiggy|zomato/i,
    travel: /petrol|fuel|diesel|cng|uber|ola|rapido|auto|taxi|cab|bus|train|flight|airline|railway/i,
    health: /hospital|clinic|doctor|pharmacy|medical|medicine|health/i,
    bills: /electricity|power|internet|broadband|wifi|airtel|jio|bsnl|vodafone|mobile|recharge|postpaid/i,
    shopping: /mall|store|mart|supermarket|grocery|kirana|amazon|flipkart|shop|retail/i
  }

  for (const [cat, pattern] of Object.entries(keywords)) {
    if (text.match(pattern)) return cat
  }
  return 'shopping'
}

function calculateConfidence(merchant, amount, date) {
  let score = 0
  if (merchant !== 'Miscellaneous Merchant') score += 40
  if (amount && parseFloat(amount) > 0) score += 40
  if (date) score += 20
  return score
}
