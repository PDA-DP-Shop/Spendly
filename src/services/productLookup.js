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
let localDbMap = null       // Map<barcode, {name, brand, category}>
let localDbLoading = false
let localDbLoadPromise = null

/**
 * Lazily loads the bundled product database from /public/data/.
 * The .json.gz file is served with Content-Encoding: gzip so the browser
 * decompresses it transparently — we just fetch JSON.
 * Falls back gracefully if the file isn't present (e.g., db not yet built).
 */
async function loadLocalDb() {
  if (localDbMap) return localDbMap
  if (localDbLoading) return localDbLoadPromise

  localDbLoading = true
  localDbLoadPromise = (async () => {
    try {
      const res = await fetch('/data/top-50000-products.json.gz')

      if (!res.ok) throw new Error(`Local DB not found (${res.status})`)

      let products
      try {
        // Attempt to parse directly (if Vite/server already decompressed it via Content-Encoding: gzip)
        const clone = res.clone()
        products = await clone.json()
      } catch (err) {
        // If it's a raw gzip blob, manually decompress it
        const ds = new DecompressionStream('gzip')
        const decompressedStream = res.body.pipeThrough(ds)
        products = await new Response(decompressedStream).json()
      }
      
      const map = new Map()
      for (const p of products) {
        if (p.barcode) map.set(p.barcode, { name: p.name, brand: p.brand, category: p.category })
      }
      localDbMap = map
      console.info(`[ProductLookup] Local DB loaded: ${map.size.toLocaleString()} products`)
      return map
    } catch (e) {
      console.warn('[ProductLookup] Local DB unavailable, falling back to API only.', e.message)
      localDbMap = new Map()  // empty map — tier 1 always misses gracefully
      return localDbMap
    }
  })()

  return localDbLoadPromise
}

// ── Tier 3: Remote API lookup ────────────────────────────────────────────────
async function fetchFromApi(barcode) {
  // 3-A: UPCitemdb (worldwide general products)
  try {
    const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`)
    const data = await res.json()
    if (data.code === 'OK' && data.items?.length > 0) {
      const item = data.items[0]
      return {
        name: item.title || '',
        brand: item.brand || '',
        image: item.images?.[0] || null,
        category: item.category ? item.category.split(' > ').pop() : 'General',
        categoryTags: item.category ? item.category.split(' > ') : [],
      }
    }
  } catch (e) {
    console.warn('[ProductLookup] UPCitemdb failed:', e.message)
  }

  // 3-B: Open Products Facts (worldwide general items)
  try {
    const res = await fetch(`https://world.openproductsfacts.org/api/v0/product/${barcode}.json`)
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
    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
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
