// smsParser.js — Feature 11: Bank SMS expense extraction
// Supports HDFC, SBI, ICICI, Axis, Kotak, GPay, PhonePe, Paytm

const SMS_PATTERNS = [
  // HDFC: "Rs.450.00 debited from your account ending 1234 at Pizza Hut"
  {
    bank: 'HDFC',
    regex: /(?:rs\.?|inr\s?)(\d[\d,]*(?:\.\d+)?)\s+(?:debited|spent|used).*?(?:ending\s*(\d{4}))?.*?(?:at|to)\s+(.+?)(?:\s+on|\.|$)/i,
    groups: { amount: 1, last4: 2, merchant: 3 },
    type: 'spent',
  },
  // SBI: "Your A/C No. XXXX1234 is debited by Rs 500.00 on 30-03-2025. Info: ZOMATO"
  {
    bank: 'SBI',
    regex: /a\/c\s*(?:no\.?)?\s*(?:x+)?(\d{4}).*?debited by\s*(?:rs\.?|inr\s?)(\d[\d,]*(?:\.\d+)?).*?info[:\s]+(.+?)(?:\.|$)/i,
    groups: { last4: 1, amount: 2, merchant: 3 },
    type: 'spent',
  },
  // ICICI: "ICICI Bank Acct XX1234 debited Rs 1200.00 on 30-Mar-2025; Pizza Hut credited"
  {
    bank: 'ICICI',
    regex: /(?:icici|axis|kotak).*?(?:xx|acct\s*)(\d{4}).*?(?:debited|dr)\s*(?:rs\.?|inr\s?)(\d[\d,]*(?:\.\d+)?).*?[;,]\s*(.+?)(?:\s+credited|$)/i,
    groups: { last4: 1, amount: 2, merchant: 3 },
    type: 'spent',
  },
  // Generic UPI: "Your UPI payment of Rs 350 to Zomato is successful"
  {
    bank: 'UPI',
    regex: /upi\s+(?:payment|txn).*?(?:of\s+)?(?:rs\.?|₹|inr\s?)(\d[\d,]*(?:\.\d+)?)\s+(?:to|from)\s+(.+?)\s+is/i,
    groups: { amount: 1, merchant: 2 },
    type: 'spent',
  },
  // GPay / PhonePe: "Rs.600 paid to Swiggy via PhonePe UPI on 30 Mar"
  {
    bank: 'PhonePe/GPay',
    regex: /(?:rs\.?|₹|inr\s?)(\d[\d,]*(?:\.\d+)?)\s+paid\s+to\s+(.+?)\s+via/i,
    groups: { amount: 1, merchant: 2 },
    type: 'spent',
  },
  // Paytm: "You have sent Rs. 250 to Raj via Paytm"
  {
    bank: 'Paytm',
    regex: /(?:sent|paid)\s+(?:rs\.?|₹)(\d[\d,]*(?:\.\d+)?)\s+to\s+(.+?)\s+via\s+paytm/i,
    groups: { amount: 1, merchant: 2 },
    type: 'spent',
  },
  // Credit: "Rs. 50000 credited to your account"
  {
    bank: 'Generic',
    regex: /(?:rs\.?|inr\s?)(\d[\d,]*(?:\.\d+)?)\s+credited/i,
    groups: { amount: 1 },
    type: 'received',
    merchant: 'Account Credit',
  },
]

/**
 * parseSMS(smsText) → { amount, merchant, last4, type, bank } | null
 */
export const parseSMS = (smsText) => {
  const text = smsText.trim()

  for (const pattern of SMS_PATTERNS) {
    const match = text.match(pattern.regex)
    if (!match) continue

    const { groups } = pattern
    const amount = match[groups.amount] ? parseFloat(match[groups.amount].replace(/,/g, '')) : 0
    const merchant = groups.merchant ? match[groups.merchant]?.trim() : (pattern.merchant || '')
    const last4 = groups.last4 ? match[groups.last4] : null

    if (!amount) continue

    return {
      amount,
      merchant: toTitleCase(merchant),
      last4,
      type: pattern.type,
      bank: pattern.bank,
    }
  }

  return null
}

const toTitleCase = str => (str || '').replace(/\b\w/g, c => c.toUpperCase())
