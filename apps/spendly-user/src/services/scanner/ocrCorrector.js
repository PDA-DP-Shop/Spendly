/**
 * Neural Correction Layer
 * Fixes common OCR artifacts, abbreviations, and mis-read characters
 * based on financial and retail context.
 */

const CORRECTIONS = [
  { pattern: /\bTH\b/g, replacement: 'THE' },
  { pattern: /\bTOT[AL]{0,2}L\b/gi, replacement: 'TOTAL' },
  { pattern: /\bSUB[.\s]*TOT[AL]{0,2}L\b/gi, replacement: 'SUBTOTAL' },
  { pattern: /\bAM[NU]{1,2}T\b/gi, replacement: 'AMOUNT' },
  { pattern: /\bGS[Tl1I]N\b/gi, replacement: 'GSTIN' },
  { pattern: /\bRE[C|]EIPT\b/gi, replacement: 'RECEIPT' },
  { pattern: /\bINVO[I1|]CE\b/gi, replacement: 'INVOICE' },
  { pattern: /\bB[I1|]LL\b/gi, replacement: 'BILL' },
  { pattern: /\bGR[A4]ND\b/gi, replacement: 'GRAND' },
  { pattern: /\bST[O0]RE\b/gi, replacement: 'STORE' },
  { pattern: /\bMA[R|][T|]\b/gi, replacement: 'MART' },
  { pattern: /\bME[R|]CH[A4]NT\b/gi, replacement: 'MERCHANT' },
  { pattern: /\bC[A4]SH\b/gi, replacement: 'CASH' },
  { pattern: /\bCH[A4]NGE\b/gi, replacement: 'CHANGE' },
  { pattern: /\bB[A4]L[A4]NCE\b/gi, replacement: 'BALANCE' },
  { pattern: /\bTR[A4]NS[A4]CTI[O0]N\b/gi, replacement: 'TRANSACTION' },
  { pattern: /\bQTY\b/gi, replacement: 'QTY' },
  { pattern: /\bRS[.\s]*(\d+)/gi, replacement: 'Rs. $1' }, // Standardize Rs.
  { pattern: /\b[I1|]N[R|]\b/gi, replacement: 'INR' },
  { pattern: /\bTH[A4]NK\s+Y[O0]U\b/gi, replacement: 'THANK YOU' },
]

export function applyNeuralCorrections(text) {
  if (!text) return ''
  
  let corrected = text
  
  // 1. apply dictionary corrections
  CORRECTIONS.forEach(c => {
    corrected = corrected.replace(c.pattern, c.replacement)
  })
  
  // 2. Clean up common digit mis-reads in price areas
  // (e.g. S.00 -> 5.00)
  corrected = corrected.replace(/(\d)[.\s]?([S])/gi, '$1.5')
  corrected = corrected.replace(/([S])[.\s]?(\d)/gi, '5.$2')
  
  // 3. Fix | or I mis-read as 1 in numbers
  corrected = corrected.replace(/(\d)[|I1i](\d{2})\b/g, '$1.$2')

  return corrected
}
