/**
 * Generates and validates 6-digit bill verification codes
 */

export function generateBillCode() {
  // Generate a random 6-digit number
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Checks if a bill code is valid based on its expiry (24 hours)
 * @param {string|number} createdAt - ISO date string or timestamp
 * @returns {boolean}
 */
export function isBillCodeValid(createdAt) {
  if (!createdAt) return false;
  
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffInHours = (now - createdDate) / (1000 * 60 * 60);
  
  return diffInHours < 24;
}
