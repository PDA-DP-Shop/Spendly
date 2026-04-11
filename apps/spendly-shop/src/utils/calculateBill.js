/**
 * Utility functions for bill calculations
 */

export function calculateSubtotal(items) {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

export function calculateGST(subtotal, rate) {
  return (subtotal * rate) / 100;
}

export function calculateDiscount(subtotal, type, value) {
  if (type === 'percentage') {
    return (subtotal * value) / 100;
  }
  return value; // fixed amount
}

export function calculateRoundOff(amount) {
  const rounded = Math.round(amount);
  return rounded - amount;
}

export function calculateTotal(subtotal, gst, discount, roundoff) {
  return subtotal + gst - discount + roundoff;
}

export function calculateCGST(gstAmount) {
  return gstAmount / 2;
}

export function calculateSGST(gstAmount) {
  return gstAmount / 2;
}
