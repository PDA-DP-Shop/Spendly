/**
 * productLookup.js
 * ────────────────────────────────────────────────────────────────────────────
 * Three-tier barcode resolution strategy (offline-first):
 *
 *  Tier 1  LOCAL DB    →  /public/data/top-50000-products.json.gz (bundled)
 *                         Loaded once into memory on first call, O(1) Map lookup.
 *                         Works 100% offline, zero latency.
 *
 *  Tier 2  IndexedDB   →  Previously API-resolved barcodes cached forever.
 *                         Second-fastest, still 100% offline after first hit.
 *
 *  Tier 3  Remote API  →  UPCitemdb → OpenProductsFacts → OpenFoodFacts
 *                         Result cached into IndexedDB before returning.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { productCacheService } from './database.js'

// ── Tier 1: In-memory local database ────────────────────────────────────────
// Fallback for extremely common barcodes (hardcoded for reliability)
const commonProductsFallback = [
  { barcode: '8901719101045', name: 'Parle-G Gluco Biscuits', brand: 'Parle', category: 'food' },
  { barcode: '8901491101831', name: 'Parle-G Biscuits', brand: 'Parle', category: 'food' },
  { barcode: '8901058000104', name: 'Amul Butter', brand: 'Amul', category: 'food' },
  { barcode: '8901030660601', name: 'Dove Soap', brand: 'Unilever', category: 'shopping' },
  { barcode: '8901030704916', name: 'Pepsodent Toothpaste', brand: 'HUL', category: 'shopping' },
  { barcode: '8901764312308', name: 'Britannia Good Day', brand: 'Britannia', category: 'food' },
  { barcode: '049000000443', name: 'Coca-Cola 500ml', brand: 'Coca-Cola', category: 'food' },
  { barcode: '8904063229063', name: 'Lays Magic Masala', brand: 'PepsiCo', category: 'food' },
  { barcode: '8901138834131', name: 'Maggi Noodles', brand: 'Nestle', category: 'food' },
]

let localDbMap = null       // Map<barcode, {name, brand, category}>
let localDbLoading = false
let localDbLoadPromise = null

/**
 * Lazily loads the bundled product database from /public/data/.
 * The .json.gz file is served with Content-Encoding: gzip so the browser
 * decompresses it transparently — we just fetch JSON.
 * Falls back gracefully if the file isn't present (e.g., db not yet built).
 */
/**
 * Lazily loads the bundled product database.
 * Optimized for performance: loading is deferred to idle time to prevent UI lag.
 */
async function loadLocalDb() {
  if (localDbMap) return localDbMap
  if (localDbLoading) return localDbLoadPromise

  localDbLoading = true
  localDbLoadPromise = new Promise((resolve) => {
    // Start loading on next idle period or after a short delay
    const startLoad = async () => {
      try {
        console.info('[ProductLookup] Initializing product dataset in background...')
        const res = await fetch('/data/top-50000-products.json.gz')
        if (!res.ok) throw new Error('DB not found')

        let products
        try {
          const clone = res.clone()
          products = await clone.json()
        } catch (err) {
          const ds = new DecompressionStream('gzip')
          const decompressedStream = res.body.pipeThrough(ds)
          products = await new Response(decompressedStream).json()
        }
        
        const map = new Map()
        // Process in chunks if needed, but for 50k a single loop is usually okay if deferred
        for (const p of products) {
          if (p.barcode) map.set(String(p.barcode), { name: p.name, brand: p.brand, category: p.category })
        }
        localDbMap = map
        console.info(`[ProductLookup] Local DB ready: ${map.size} items`)
        resolve(map)
      } catch (e) {
        console.warn('[ProductLookup] Using local fallbacks:', e.message)
        const map = new Map()
        for (const p of commonProductsFallback) {
          map.set(String(p.barcode), { name: p.name, brand: p.brand, category: p.category })
        }
        localDbMap = map
        resolve(map)
      }
    }

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => startLoad(), { timeout: 2000 })
    } else {
      setTimeout(startLoad, 500)
    }
  })

  return localDbLoadPromise
}

// ── Tier 3: Remote API lookup (CORS Optimized) ──────────────────────────────
async function fetchFromApi(barcode) {
  const proxy = 'https://corsproxy.io/?'
  
  // 3-A: UPCitemdb (worldwide general products)
  try {
    const url = `${proxy}${encodeURIComponent(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`)}`
    const res = await fetch(url)
    const data = await res.json()
    if (data.code === 'OK' && data.items?.length > 0) {
      const item = data.items[0]
      return {
        name: item.title || '',
        brand: item.brand || '',
        image: item.images?.[0] || null,
        amount: item.lowest_recorded_price || item.highest_recorded_price || null,
        category: item.category ? item.category.split(' > ').pop() : 'General',
        categoryTags: item.category ? item.category.split(' > ') : [],
      }
    }
  } catch (e) {
    console.warn('[ProductLookup] UPCitemdb failed:', e.message)
  }

  // 3-B: Open Products Facts (worldwide general items)
  try {
    const url = `${proxy}${encodeURIComponent(`https://world.openproductsfacts.org/api/v0/product/${barcode}.json`)}`
    const res = await fetch(url)
    const data = await res.json()
    if (data.status === 1 && data.product?.product_name) {
      return {
        name: data.product.product_name,
        brand: data.product.brands || '',
        image: data.product.image_front_url || null,
        category: 'General',
        categoryTags: data.product.categories_tags || [],
      }
    }
  } catch (e) {
    console.warn('[ProductLookup] OpenProductsFacts failed:', e.message)
  }

  // 3-C: Open Food Facts (worldwide food & groceries)
  try {
    const url = `${proxy}${encodeURIComponent(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)}`
    const res = await fetch(url)
    const data = await res.json()
    if (data.status === 1 && data.product?.product_name) {
      return {
        name: data.product.product_name,
        brand: data.product.brands || '',
        image: data.product.image_front_url || null,
        category: 'Food',
        categoryTags: data.product.categories_tags || [],
      }
    }
  } catch (e) {
    console.warn('[ProductLookup] OpenFoodFacts failed:', e.message)
  }

  return null
}

// ── Public API ───────────────────────────────────────────────────────────────
/**
 * lookupBarcode(barcode)
 *
 * Returns: { name, brand, category, categoryTags, image?, source }
 *   source: 'local' | 'cache' | 'api'
 * Returns null if not found anywhere.
 */
export const lookupBarcode = async (barcode) => {
  const code = String(barcode).trim()
  if (!code) return null

  // ── Tier 1: local bundled database (instant, offline) ────────────────────
  const db = await loadLocalDb()
  const local = db.get(code)
  if (local) {
    console.info(`[ProductLookup] ✅ Local hit for ${code}`)
    return { ...local, categoryTags: [local.category], image: null, source: 'local' }
  }

  // ── Tier 2: IndexedDB persistent cache (fast, offline) ──────────────────
  try {
    const cached = await productCacheService.get(code)
    if (cached) {
      console.info(`[ProductLookup] ✅ IndexedDB cache hit for ${code}`)
      return { ...cached, source: 'cache' }
    }
  } catch (e) {
    console.warn('[ProductLookup] IndexedDB read failed:', e.message)
  }

  // ── Tier 3: Remote API (requires internet, cached for next time) ─────────
  console.info(`[ProductLookup] 🌐 API lookup for ${code}`)
  const product = await fetchFromApi(code)
  if (product) {
    // Cache permanently in IndexedDB so next scan is offline
    try {
      await productCacheService.put(code, product)
    } catch (e) {
      console.warn('[ProductLookup] Failed to cache in IndexedDB:', e.message)
    }
    return { ...product, source: 'api' }
  }

  return null
}

/**
 * preloadLocalDb()
 * Call this early (e.g., on app start) to warm up the in-memory map
 * so the first scan is instant.
 */
export const preloadLocalDb = () => loadLocalDb()
