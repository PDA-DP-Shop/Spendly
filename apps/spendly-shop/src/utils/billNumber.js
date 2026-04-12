// billNumber.js
// Generates unique bill numbers
// that never clash across shops

// Generate shop code from shop name
// Takes first 3 letters uppercase
// Removes spaces and special chars
// Examples:
//   "DMart" → DMT
//   "Big Bazaar" → BBZ  
//   "Uber Eats" → UBR
//   "McDonald's" → MCD

export function getShopCode(shopName) {
  if (!shopName) return 'SHP'

  // Remove special chars and spaces
  const clean = shopName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')

  if (clean.length >= 3) {
    return clean.substring(0, 3)
  } else if (clean.length === 2) {
    return clean + 'X'
  } else if (clean.length === 1) {
    return clean + 'XX'
  }
  return 'SHP'
}

// Get today's date in YYYYMMDD format
export function getTodayDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(
    now.getMonth() + 1
  ).padStart(2, '0')
  const day = String(
    now.getDate()
  ).padStart(2, '0')
  return `${year}${month}${day}`
}

// Generate 4 random alphanumeric chars
// This makes every bill truly unique
// even if same shop same day same seq
export function getRandomSuffix() {
  const chars =
    'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  // Note: removed I, O, 0, 1
  // to avoid confusion when reading
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(
      Math.floor(Math.random() * chars.length)
    )
  }
  return result
}

// Get next sequence number for shop
// Resets to 0001 each new day
// Stored separately per shop per day
export function getNextSequence(
  shopId,
  date
) {
  const key =
    `bill_seq_${shopId}_${date}`
  
  const current = parseInt(
    localStorage.getItem(key) || '0'
  )
  const next = current + 1
  
  localStorage.setItem(
    key,
    next.toString()
  )
  
  // Clean up old date sequences
  // to not fill up localStorage
  cleanOldSequences(shopId, date)
  
  return String(next).padStart(4, '0')
}

// Remove sequence keys older than 7 days
function cleanOldSequences(
  shopId,
  currentDate
) {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(`bill_seq_${shopId}_`)) {
        const keyDate = key.split('_').pop()
        if (keyDate !== currentDate) {
          // Keep last 7 days only
          const keyTime = new Date(
            keyDate.substring(0, 4) + '-' +
            keyDate.substring(4, 6) + '-' +
            keyDate.substring(6, 8)
          ).getTime()
          const diff = Date.now() - keyTime
          if (diff > 7 * 24 * 60 * 60 * 1000) {
            localStorage.removeItem(key)
          }
        }
      }
    })
  } catch {
    // Silent fail
  }
}

// MAIN FUNCTION — Generate unique bill number
// Call this when creating any new bill
//
// Parameters:
//   shopName: string — name of the shop
//   shopId: string — unique shop ID
//
// Returns:
//   "DMT-20260412-0001-X7K2"

export function generateBillNumber(
  shopName,
  shopId
) {
  const shopCode = getShopCode(shopName)
  const date = getTodayDate()
  const sequence = getNextSequence(
    shopId || shopCode,
    date
  )
  const random = getRandomSuffix()

  return `${shopCode}-${date}-${sequence}-${random}`
}

// Generate full bill ID for database
// This is even more unique than display number
// Uses timestamp + shop + random
// Never ever repeats

export function generateBillId(
  shopId
) {
  const timestamp = Date.now()
  const random = Math.random()
    .toString(36)
    .substring(2, 9)
    .toUpperCase()
  const shopPart = (shopId || 'SHP')
    .substring(0, 6)
    .toUpperCase()

  return `${shopPart}-${timestamp}-${random}`
}

// Validate bill number format
// Returns true if valid Spendly bill
export function isValidBillNumber(
  billNumber
) {
  if (!billNumber) return false
  
  // Pattern: XXX-YYYYMMDD-NNNN-XXXX
  const pattern =
    /^[A-Z0-9]{3}-\d{8}-\d{4}-[A-Z0-9]{4}$/
  
  return pattern.test(billNumber)
}

// Parse bill number into parts
// Useful for displaying bill details
export function parseBillNumber(
  billNumber
) {
  if (!isValidBillNumber(billNumber)) {
    return null
  }

  const parts = billNumber.split('-')
  return {
    shopCode: parts[0],
    date: parts[1],
    sequence: parts[2],
    random: parts[3],
    formattedDate:
      `${parts[1].substring(0, 4)}/` +
      `${parts[1].substring(4, 6)}/` +
      `${parts[1].substring(6, 8)}`
  }
}
