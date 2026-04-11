/**
 * Product Data Extractor
 * Extracts Product Name, Brand, Weight/Quantity, and MRP from OCR text
 */

export function extractProductData(ocrText) {
  const lines = ocrText.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 1)
  
  const productName = extractProductName(lines)
  const brand = extractBrand(lines)
  const quantity = extractQuantity(ocrText)
  const mrp = extractMRP(ocrText)
  const category = autoCategory(ocrText)
  
  const displayName = productName || (brand ? `${brand} Product` : 'Unknown Product')
  
  return {
    shopName: displayName,
    category: category,
    note: [brand, quantity].filter(Boolean).join(' • '),
    amount: mrp || '',
    scanType: 'product_package',
    rawOcrText: ocrText
  }
}

function extractProductName(lines) {
  const meaningful = lines.filter(l => l.length > 3)
  const skipWords = [
    'ingredients', 'nutrition', 'manufactured', 'best before',
    'net weight', 'mfg', 'exp', 'batch', 'fssai', 'customer',
    'helpline', 'www', 'http'
  ]
  const nameCandidates = meaningful.filter(
    line => !skipWords.some(skip => line.toLowerCase().includes(skip))
  )
  return nameCandidates[0] || ''
}

function extractBrand(lines) {
  const brandKeywords = [
    'by ', 'from ', 'brand:',
    'manufactured by', 'marketed by', 'a product of'
  ]
  for (const line of lines) {
    const lower = line.toLowerCase()
    for (const kw of brandKeywords) {
      if (lower.includes(kw)) {
        return line.split(new RegExp(kw, 'i'))[1]?.trim() || ''
      }
    }
  }
  return ''
}

function extractQuantity(text) {
  const match = text.match(/(\d+\.?\d*)\s*(g|gm|kg|ml|l|ltr|oz)\b/i)
  return match ? match[0] : ''
}

function extractMRP(text) {
  const patterns = [
    /mrp[:\s₹rs.]*(\d+\.?\d*)/i,
    /rs\.?\s*(\d+\.?\d*)/i,
    /₹\s*(\d+\.?\d*)/,
    /price[:\s₹rs.]*(\d+\.?\d*)/i
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) return match[1]
  }
  return ''
}

function autoCategory(text) {
  const t = text.toLowerCase()
  if (t.match(/biscuit|chips|snack|namkeen|cookie|chocolate|candy|sweets|mithai|noodle|pasta|rice|dal|flour|atta|oil|ghee|milk|butter|cheese|yogurt|curd|juice|drink|water|cola|soda/)) return 'food'
  if (t.match(/shampoo|soap|toothpaste|face wash|moisturizer|cream|lotion|deodorant|perfume|powder|talc|body wash|hair/)) return 'shopping'
  if (t.match(/tablet|capsule|syrup|medicine|pharma|health|vitamin|supplement|protein|glucose/)) return 'health'
  if (t.match(/battery|bulb|wire|electronic|cable|charger/)) return 'bills'
  return 'shopping'
}
