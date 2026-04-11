/**
 * Generates formatted bill number based on shop settings
 */

export function generateBillNumber(prefix = 'BILL', number = 1) {
  // Pad number with 3 leading zeros (e.g., 1 -> 001)
  const paddedNumber = String(number).padStart(3, '0');
  return `${prefix}${paddedNumber}`;
}
