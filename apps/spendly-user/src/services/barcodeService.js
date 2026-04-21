import { db, learnedBarcodeService } from './database'
import OFFLINE_BARCODES from '../data/barcodes.json'

/**
 * Priority order for barcode lookup:
 * 1. Learned barcodes (IndexedDB)
 * 2. Offline dataset (barcodes.json)
 * 3. Online API (Open Food Facts)
 */
export async function lookupBarcode(barcode) {
  if (!barcode) return { barcode, name: null, price: null, source: null }
  const cleanBarcode = String(barcode).trim()

  // 1. Check Learned (User-taught mapping - highest priority)
  try {
    const learned = await learnedBarcodeService.get(cleanBarcode)
    if (learned) {
      return {
        barcode: cleanBarcode,
        name: learned.name,
        price: learned.price || null,
        source: 'learned',
        category: learned.category
      }
    }
  } catch (e) {
    console.warn("Learned lookup failed", e)
  }

  // 2. Check Offline JSON
  const offlineMatch = OFFLINE_BARCODES[cleanBarcode]
  if (offlineMatch) {
    return {
      barcode: cleanBarcode,
      name: offlineMatch.name,
      price: offlineMatch.price || null,
      source: 'offline'
    }
  }

  // 3. Check Online API (Open Food Facts)
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`)
    const data = await response.json()
    if (data.status === 1) {
      return {
        barcode: cleanBarcode,
        name: data.product.product_name,
        price: null,
        source: 'online'
      }
    }
  } catch (e) {}

  // 4. Fallback
  return {
    barcode: cleanBarcode,
    name: null,
    price: null,
    source: null
  }
}

/**
 * Management methods for SavedProductsManager
 */
export async function getAllLearnedBarcodes() {
  return await learnedBarcodeService.getAll()
}

export async function deleteLearnedBarcode(barcode) {
  return await db.learnedBarcodes.delete(String(barcode).trim())
}

export async function updateLearnedBarcode(barcode, name, price, category = 'Other') {
  if (!barcode || !name) return null
  
  const cleanBarcode = String(barcode).trim()
  const cleanPrice = parseFloat(price)
  
  return await learnedBarcodeService.add({
    barcode: cleanBarcode,
    name: String(name).trim(),
    price: isNaN(cleanPrice) ? null : cleanPrice,
    category,
    learnedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
}

export const saveLearnedBarcode = updateLearnedBarcode

export async function clearAllLearnedBarcodes() {
  return await db.learnedBarcodes.clear()
}
