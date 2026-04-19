/**
 * Advanced Alphanumeric Bill Encoder (Offline-Enabled)
 * Encodes Amount, Category, Payment Method, and Date into 6 characters.
 * 
 * 30-Bit Schema (5 bits per CHAR):
 * [00-12] Amount (13 bits: 0-8191)
 * [13-16] Category (4 bits: 0-15)
 * [17-17] Payment Method (1 bit: 0=Cash, 1=Bank)
 * [18-22] Day of Month (5 bits: 1-31)
 * [23-29] Checksum (7 bits: prevent guessing)
 */

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Base 32 (5 bits)

export function generateBillCode(data = {}) {
  const { amount = 0, category = 'other', paymentMethod = 'cash', date = new Date() } = data;

  // 1. Get Category Index
  const categories = ['food', 'shopping', 'travel', 'bills', 'health', 'tech', 'fun', 'study', 'gym', 'holiday', 'gifts', 'pets', 'rent', 'coffee', 'grocery', 'other'];
  const catIdx = Math.max(0, categories.indexOf(category.toLowerCase()));
  
  // 2. Normalize and Bound Values
  const valAmount = Math.min(Math.floor(amount), 8191);
  const valCat = Math.min(catIdx, 15);
  const valPay = paymentMethod.toLowerCase() === 'bank' ? 1 : 0;
  const valDay = new Date(date).getDate();
  
  // 3. Construct Bit Bucket
  let bits = 0n;
  bits |= BigInt(valAmount);             // bits 0-12
  bits |= BigInt(valCat) << 13n;         // bits 13-16
  bits |= BigInt(valPay) << 17n;         // bits 17
  bits |= BigInt(valDay) << 18n;         // bits 18-22
  
  // 4. Calculate simple Checksum (sum of bits mod 128)
  const checksum = Number(bits % 127n);
  bits |= BigInt(checksum) << 23n;       // bits 23-29

  // 5. Convert to Base32 String (6 chars)
  let code = '';
  let tempBits = bits;
  for (let i = 0; i < 6; i++) {
    const idx = Number(tempBits & 0x1Fn);
    code = CHARS[idx] + code;
    tempBits >>= 5n;
  }

  return code;
}

export function isValidCodeFormat(code) {
  if (!code || code.length !== 6) return false;
  const regex = new RegExp(`^[${CHARS}]{6}$`);
  return regex.test(code.toUpperCase());
}

export function isBillCodeValid(createdAt) {
  if (!createdAt) return false;
  const diff = (new Date() - new Date(createdAt)) / (1000 * 60 * 60);
  return diff < 72;
}
