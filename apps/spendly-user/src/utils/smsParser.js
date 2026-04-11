// src/utils/smsParser.js
import { guessCategory } from './guessCategory'

export function parseBankSMS(text) {
  if (!text) return null
  
  const lowerText = text.toLowerCase()
  
  // Basic SMS fast fail — usually bank messages have specific words
  if (!lowerText.includes('debited') && !lowerText.includes('credited') && 
      !lowerText.includes('spent') && !lowerText.includes('paid') && !lowerText.includes('sent')) {
    return null
  }

  // Common Indian Bank SMS formats (HDFC, ICICI, SBI, UPI)
  // E.g., "Rs 500.00 debited from a/c **1234 on 04-10-23 to Swiggy"
  // E.g., "Sent Rs. 1500 to John Doe"
  
  let amount = 0
  let type = 'spent'
  let shopName = ''

  // 1. Extract amount (Rs, INR, ₹ followed by numbers)
  const amountMatch = lowerText.match(/(?:rs\.?|inr|₹|amount|spent|paid)\s*([0-9,]+\.?[0-9]*)/i)
  if (amountMatch && amountMatch[1]) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ''))
  } else {
    // Try to just find any floating point number that looks like an amount
    const rawNumMatch = text.match(/\b\d{1,7}(?:\.\d{2})?\b/)
    if (rawNumMatch) amount = parseFloat(rawNumMatch[0])
  }

  if (!amount) return null

  // 2. Extract Type
  if (lowerText.includes('credited') || lowerText.includes('received') || lowerText.includes('added')) {
    type = 'received'
  }

  // 3. Extract Merchant / To / From
  // "to <merchant>" or "from <person>"
  const toMatch = text.match(/\b(?:to|info|at|vpa)\s+([A-Za-z0-9\s]+?)(?:ref|on|bal|ava|\.|\n|$)/i)
  if (toMatch && toMatch[1]) {
    let cleanVal = toMatch[1].trim()
    // Remove trailing junk
    cleanVal = cleanVal.replace(/(?:is|has|with|via).*$/i, '').trim()
    if (cleanVal.length > 2 && cleanVal.length < 30) {
      shopName = cleanVal
    }
  }

  if (!shopName) {
    shopName = type === 'spent' ? 'Unknown Merchant' : 'Bank Transfer'
  }

  return {
    amount,
    type,
    shopName,
    category: guessCategory(shopName),
    note: `Auto-parsed from SMS/Clipboard:\n${text}`
  }
}
