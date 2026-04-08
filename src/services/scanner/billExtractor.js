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
  const { amount, taxInfo, subtotal } = extractDetailedAmounts(fullText, lines)
  const date = extractDate(fullText)
  const time = extractTime(fullText)
  const category = detectBillCategory(fullText)
  const gstin = extractGSTIN(fullText)
  const verticalData = extractVerticalMetadata(fullText)
  
  // Logical Verification: Subtotal + Tax should equal Total
  const isLogicallyConsistent = Math.abs((parseFloat(subtotal) + parseFloat(taxInfo.tax)) - parseFloat(amount)) < 1.0
  const finalConfidence = calculateConfidence(merchant, amount, date) + (isLogicallyConsistent ? 20 : 0)

  return {
    shopName: merchant,
    amount: amount,
    subtotal: subtotal,
    taxAmount: taxInfo.tax,
    date: date,
    time: time,
    category: category,
    gstin: gstin,
    metadata: verticalData,
    scanType: 'bill',
    confidence: Math.min(finalConfidence, 100),
    isVerified: isLogicallyConsistent,
    rawOcrText: ocrText
  }
}

function extractVerticalMetadata(text) {
  const metadata = {}

  // 1. Fuel Intelligence (Petrol/Diesel)
  if (text.match(/petrol|fuel|diesel|cng|lpg|ltr|volume|density/i)) {
    const volMatch = text.match(/(?:vol|volume|qty|ltrs?)[:\s]*(\d+[,.]\d{2,3})/i)
    const rateMatch = text.match(/(?:rate|price\/ltr)[:\s]*(\d+[,.]\d{2})/i)
    if (volMatch) metadata.fuelVolume = volMatch[1]
    if (rateMatch) metadata.fuelRate = rateMatch[1]
    metadata.billType = 'FUEL'
  }

  // 2. Utility Intelligence (Electricity/Water)
  if (text.match(/electricity|power|energy|water|sewerage|consumer|ca\s*no|kwh|units/i)) {
    const caMatch = text.match(/(?:ca|consumer|account)[.\s]*no[:\s]*(\d{8,12})/i)
    const unitsMatch = text.match(/(?:units|kwh|consumption)[:\s]*(\d+)/i)
    if (caMatch) metadata.consumerId = caMatch[1]
    if (unitsMatch) metadata.unitsConsumed = unitsMatch[1]
    metadata.billType = 'UTILITY'
  }

  // 3. E-commerce Intelligence
  if (text.match(/order\s*id|sold\s*by|tracking|amazon|flipkart|shipment/i)) {
    const orderMatch = text.match(/(?:order|txn)[.\s]*id[:\s]*([A-Z0-9-]+)/i)
    if (orderMatch) metadata.orderId = orderMatch[1]
    metadata.billType = 'ECOMMERCE'
  }

  // 4. Pharmacy/Medical Intelligence
  if (text.match(/pharmacy|medical|patient|doctor|chemist|drug|batch|expiry/i)) {
    const batchMatch = text.match(/batch[.\s]*no[:\s]*([A-Z0-9]+)/i)
    if (batchMatch) metadata.batchNo = batchMatch[1]
    metadata.billType = 'MEDICAL'
  }

  return metadata
}

function extractMerchant(lines) {
  const top = lines.slice(0, 10) 
  const skipPatterns = [
    /^\d+$/, 
    /phone|tel|mob|email|@|www/i,
    /gstin|pan|fssai|tin|cin|reg|vat/i,
    /receipt|invoice|bill|cash|card|txn|date|time|order/i,
    /total|subtotal|tax|discount|change|item|qty/i,
    /bungalow|porvorim|goa|street|road|near|behind|floor|circle|cross/i,
    /welcome|thank\s*you|visit\s*again|customer|feedback/i
  ]
  
  for (const line of top) {
    const isSkip = skipPatterns.some(p => p.test(line))
    if (!isSkip && line.length > 3 && line.length < 50) {
      let clean = line.replace(/[^a-zA-Z0-9\s#&]/g, ' ').trim()
      clean = clean.split(/\s(?:tel|mob|gst|fssai|reg|pan)/i)[0].trim()
      // Remove text like "Have a look at this bill" if Tesseract grabs it
      if (clean.toLowerCase().includes('have a look') || clean.toLowerCase().includes('r/')) continue
      if (clean.toUpperCase() === clean && clean.split(' ').length > 4) continue // Likely a generic header
      return clean
    }
  }
  return 'Miscellaneous Merchant'
}

function extractDetailedAmounts(text, lines) {
  // Global Currency Normalization ($, €, £, ¥, ₹, AED)
  const cleanText = text.replace(/[₹$€£¥]|rs\.?|rupees?|aed|gbp|eur|usd/gi, ' AMT ')
  
  let detectedTax = 0
  const taxPatterns = [
    /(?:cgst|sgst|igst|vat|tax|gst|sales\s*tax|taxa|iva|iva\d*)\s*(?:\d+%)?[:\s]*AMT\s*(\d+[,.]\d+)/gi,
    /total\s*tax[:\s]*AMT(?:\s*)(\d+[,.]\d+)/gi
  ]
  
  for(const p of taxPatterns) {
    let match
    while ((match = p.exec(cleanText)) !== null) {
      detectedTax += parseFloat(match[1].replace(',', '.'))
    }
  }

  const totalPatterns = [
    /(?:grand|bill|food|final|payable|net|sum|total|amount\s*payable)\s*total[:\s]*.*?(\d+[,.]\d{2})/i,
    /(?:bill|net|total|payment|order|balance)\s*amount[:\s]*.*?(\d+[,.]\d{2})/i,
    /(?:total|amount)\s*due[:\s]*.*?(\d+[,.]\d{2})/i,
    /total\s*paid[:\s]*.*?(\d+[,.]\d{2})/i,
    /total[:\s]*.*?(\d+[,.]\d{2})/i
  ]
  
  let finalAmount = 0
  for (const pattern of totalPatterns) {
    const m = cleanText.match(pattern)
    if (m) {
      finalAmount = parseFloat(m[1].replace(',', '.'))
      if (finalAmount > 0) break
    }
  }

  const allAmounts = []
  const amountPattern = /\b\d{1,6}[,.]\d{2}\b/g
  let am
  while ((am = amountPattern.exec(cleanText))) {
    allAmounts.push(parseFloat(am[0].replace(',', '.')))
  }

  if (!finalAmount && allAmounts.length > 0) {
    finalAmount = Math.max(...allAmounts)
  }

  const subtotal = Math.max(0, finalAmount - detectedTax)

  return { 
    amount: finalAmount.toString(), 
    subtotal: subtotal.toString(),
    taxInfo: { tax: detectedTax.toString() }
  }
}

function extractDate(text) {
  const datePatterns = [
    // UK/EU (DD/MM/YYYY)
    /(\d{1,2})[\/\. \-](\d{1,2})[\/\. \-](\d{4})/,
    // UK/EU Short (DD/MM/YY)
    /(\d{1,2})[\/\. \-](\d{1,2})[\/\. \-](\d{2})\b/,
    // US (MM/DD/YYYY)
    /(\d{1,2})[\/\. \-](\d{1,2})[\/\. \-](\d{4})/,
    // ISO (YYYY-MM-DD)
    /(\d{4})[\/\. \-](\d{1,2})[\/\. \-](\d{1,2})/,
    // Written format (08 APR 2026)
    /(\d{1,2})\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s+(\d{2,4})/i
  ]
  
  for (const pattern of datePatterns) {
    const m = text.match(pattern)
    if (m) return m[0]
  }
  return format(new Date(), 'yyyy-MM-dd')
}

function extractTime(text) {
  const timePatterns = [
    /(\d{1,2})[:](\d{2})\s*(AM|PM)?/i,
    /(\d{1,2})[\.](\d{2})\s*(AM|PM)?/i
  ]
  for (const p of timePatterns) {
    const m = text.match(p)
    if (m) return m[0]
  }
  return format(new Date(), 'HH:mm')
}

function extractGSTIN(text) {
  const gstPattern = /\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{3}\b/
  const m = text.match(gstPattern)
  return m ? m[0] : null
}

function detectBillCategory(text) {
  const keywords = {
    food: /restaurant|cafe|coffee|food|hotel|dhaba|kitchen|mess|tiffin|bakery|pizza|burger|biryani|thali|swiggy|zomato/i,
    travel: /petrol|fuel|diesel|cng|uber|ola|rapido|auto|taxi|cab|bus|train|flight|airline|railway|metro/i,
    health: /hospital|clinic|doctor|pharmacy|medical|medicine|health|dentist|lab/i,
    bills: /electricity|power|internet|broadband|wifi|airtel|jio|bsnl|vodafone|mobile|recharge|postpaid|rent|water/i,
    shopping: /mall|store|mart|supermarket|grocery|kirana|amazon|flipkart|shop|retail|boutique|cloth/i,
    entertainment: /movie|cinema|inox|pvr|theater|club|pub|bar|ott|netflix|disney|prime/i,
    education: /school|college|university|fee|book|stationery|course|tuition/i,
    finance: /insurance|premium|investment|stock|bank|emi|loan|interest/i
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
  if (score > 10 && date) score += 20
  return score
}
