#!/usr/bin/env node
/**
 * build-product-db.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Downloads Open Food Facts export, filters the top 50 000 products by scan
 * count (with extra weight for Indian & globally popular items), and writes a
 * compact gzipped JSON file to public/data/top-50000-products.json.gz.
 *
 * Usage:
 *   node scripts/build-product-db.mjs
 *
 * Or add to package.json:
 *   "build:db": "node scripts/build-product-db.mjs"
 *
 * Requirements (all built-in to Node ≥ 18):
 *   fetch, fs, zlib, readline, path, url
 *
 * The output format per product:
 *   { "barcode": "8901058851829", "name": "Maggi 2-Minute Noodles",
 *     "brand": "Nestle", "category": "Food" }
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from 'fs'
import path from 'path'
import readline from 'readline'
import zlib from 'zlib'
import { pipeline } from 'stream/promises'
import { createWriteStream, createReadStream } from 'fs'
import { Writable } from 'stream'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'public', 'data')
const TMP_CSV = path.join(OUT_DIR, '_off_products.csv.gz')
const OUT_JSON = path.join(OUT_DIR, 'top-50000-products.json')
const OUT_GZ   = path.join(OUT_DIR, 'top-50000-products.json.gz')

// Open Food Facts full CSV export (tab-separated, gzipped, ~4 GB uncompressed)
// We stream it so we never load the full file into RAM.
const OFF_URL = 'https://static.openfoodfacts.org/data/en.openfoodfacts.org.products.csv.gz'

const TARGET_COUNT  = 50_000
const CHUNK_LOG     = 100_000   // log progress every N rows

// ── Category mapping ────────────────────────────────────────────────────────
// Maps Open Food Facts category tags → human-readable single-word categories.
const CAT_MAP = {
  'beverage': 'Beverages', 'beverages': 'Beverages', 'drink': 'Beverages',
  'water': 'Beverages', 'juice': 'Beverages', 'soda': 'Beverages',
  'dairy': 'Dairy', 'milk': 'Dairy', 'cheese': 'Dairy', 'yogurt': 'Dairy',
  'snack': 'Snacks', 'snacks': 'Snacks', 'chips': 'Snacks', 'biscuit': 'Snacks',
  'chocolate': 'Snacks', 'candy': 'Snacks', 'sweets': 'Snacks',
  'bread': 'Bakery', 'bakery': 'Bakery', 'cereal': 'Breakfast',
  'breakfast': 'Breakfast', 'oat': 'Breakfast',
  'meat': 'Meat', 'chicken': 'Meat', 'beef': 'Meat', 'pork': 'Meat',
  'seafood': 'Seafood', 'fish': 'Seafood',
  'vegetable': 'Produce', 'fruit': 'Produce',
  'pasta': 'Pantry', 'rice': 'Pantry', 'noodle': 'Pantry', 'sauce': 'Pantry',
  'condiment': 'Pantry', 'oil': 'Pantry', 'spice': 'Pantry', 'flour': 'Pantry',
  'frozen': 'Frozen',
  'baby': 'Baby',
  'health': 'Health', 'supplement': 'Health', 'vitamin': 'Health',
  'beauty': 'Personal Care', 'hygiene': 'Personal Care', 'soap': 'Personal Care',
  'cleaning': 'Household', 'detergent': 'Household',
  'pet': 'Pet',
  'alcohol': 'Alcohol', 'beer': 'Alcohol', 'wine': 'Alcohol', 'spirits': 'Alcohol',
}

function mapCategory(tagsStr) {
  if (!tagsStr) return 'Food'
  const tags = tagsStr.toLowerCase()
  for (const [key, cat] of Object.entries(CAT_MAP)) {
    if (tags.includes(key)) return cat
  }
  return 'Food'
}

// ── Parse TSV header ─────────────────────────────────────────────────────────
function parseHeader(line) {
  return line.split('\t').map(h => h.trim())
}

// ── Determine score for ranking ──────────────────────────────────────────────
// Higher scans_n = higher priority. Indian products get a boost.
function score(row, headers) {
  const scans = parseInt(row[headers.indexOf('unique_scans_n')] || '0', 10) || 0
  const countries = (row[headers.indexOf('countries_en')] || '').toLowerCase()
  const isIndian = countries.includes('india') || countries.includes('in:')
  return scans + (isIndian ? 2000 : 0)
}

// ── Clean a field ────────────────────────────────────────────────────────────
function clean(str) {
  if (!str) return ''
  return str.trim().replace(/\s+/g, ' ').slice(0, 120)
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  // ── Step 1: Download ──────────────────────────────────────────────────────
  let downloaded = 0
  let isResuming = false
  const reqHeaders = {}

  if (fs.existsSync(TMP_CSV)) {
    downloaded = fs.statSync(TMP_CSV).size
    if (downloaded > 0) {
      console.log(`\n📄 Found partial download (${(downloaded / 1e6).toFixed(1)} MB). Attempting to resume...`)
      reqHeaders['Range'] = `bytes=${downloaded}-`
      isResuming = true
    }
  } else {
    console.log('⬇  Downloading Open Food Facts export (~1.5 GB) …')
    console.log('   URL:', OFF_URL)
    console.log('   This may take several minutes on a slow connection.\n')
  }

  const res = await fetch(OFF_URL, { headers: reqHeaders })
  
  if (!res.ok) {
    if (res.status === 416) {
      console.log('✅ File appears to be already fully downloaded. Proceeding to parsing...')
    } else {
      throw new Error(`Download failed: ${res.status} ${res.statusText}`)
    }
  }

  if (res.ok) {
    const isPartial = res.status === 206
    if (isResuming && !isPartial) {
      console.log('   Server does not support resume. Restarting download...')
      downloaded = 0
    } else if (isResuming && isPartial) {
      console.log('   Resuming download from where it left off...')
    }

    const contentLength = parseInt(res.headers.get('content-length') || '0', 10)
    const total = isPartial ? downloaded + contentLength : contentLength

    const fileStream = createWriteStream(TMP_CSV, { flags: isPartial ? 'a' : 'w' })
    const progressStream = new Writable({
      write(chunk, _enc, cb) {
        downloaded += chunk.length
        if (total > 0) {
          process.stdout.write(`   ${(downloaded / 1e6).toFixed(0)} MB / ${(total / 1e6).toFixed(0)} MB\r`)
        } else {
          process.stdout.write(`   ${(downloaded / 1e6).toFixed(0)} MB downloaded\r`)
        }
        cb()
      }
    })

    // Tee: write to file and track progress
    const reader = res.body.getReader()
    const writer = fileStream
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      progressStream.write(value)
      writer.write(value)
    }
    writer.end()
    progressStream.end()
    await new Promise(r => writer.on('finish', r))
    console.log('\n✅ Download complete:', (downloaded / 1e6).toFixed(1), 'MB\n')
  }

  // ── Step 2: Stream-parse & rank ───────────────────────────────────────────
  // We do TWO passes.
  // Pass 1: collect (barcode, score) into a sorted heap to find the score
  //         threshold for the top 50k.
  // Pass 2: collect the actual product records above the threshold.
  //
  // To save RAM we keep only up to 60k items in Pass 1.

  console.log('🔍 Pass 1 — scanning and ranking …')

  const topScores = []   // [{code, score}]
  let lineNum = 0
  let headers = null

  async function streamPass(onRow) {
    const rl = readline.createInterface({
      input: createReadStream(TMP_CSV).pipe(zlib.createGunzip()),
      crlfDelay: Infinity,
    })
    for await (const line of rl) {
      lineNum++
      if (lineNum === 1) {
        headers = parseHeader(line)
        continue
      }
      if (lineNum % CHUNK_LOG === 0) process.stdout.write(`   ${(lineNum / 1e6).toFixed(2)}M rows\r`)
      const row = line.split('\t')
      if (row.length < 5) continue
      await onRow(row, headers)
    }
    process.stdout.write('\n')
  }

  lineNum = 0
  const codeCol = () => headers.indexOf('code')
  const nameCol = () => headers.indexOf('product_name')

  await streamPass((row, hdrs) => {
    const code = (row[codeCol()] || '').trim()
    const name = (row[nameCol()] || '').trim()
    if (!code || !name) return
    const s = score(row, hdrs)
    topScores.push({ code, s })
  })

  console.log(`   Total rows parsed: ${lineNum.toLocaleString()}`)

  // Sort descending and find the threshold score
  topScores.sort((a, b) => b.s - a.s)
  const threshold = topScores.length > TARGET_COUNT
    ? topScores[TARGET_COUNT - 1].s
    : 0

  const topCodes = new Set(topScores.slice(0, TARGET_COUNT).map(x => x.code))
  console.log(`✅ Threshold score: ${threshold} | Top codes: ${topCodes.size.toLocaleString()}\n`)

  // ── Pass 2: collect product data ──────────────────────────────────────────
  console.log('📦 Pass 2 — collecting product data …')
  const products = []
  lineNum = 0
  headers = null

  await streamPass((row, hdrs) => {
    const code = (row[hdrs.indexOf('code')] || '').trim()
    if (!topCodes.has(code)) return

    const name  = clean(row[hdrs.indexOf('product_name')])
    const brand = clean(row[hdrs.indexOf('brands')])
    const catTags = row[hdrs.indexOf('categories_en')] || row[hdrs.indexOf('categories')] || ''
    const cat   = mapCategory(catTags)

    if (!name) return

    products.push({ barcode: code, name, brand, category: cat })
  })

  console.log(`✅ Collected ${products.length.toLocaleString()} products\n`)

  // ── Step 3: Write JSON ────────────────────────────────────────────────────
  console.log('💾 Writing JSON …')
  // Index by barcode for O(1) lookup — the app will convert to Map on load
  const json = JSON.stringify(products, null, 0)
  fs.writeFileSync(OUT_JSON, json, 'utf8')
  const jsonSize = fs.statSync(OUT_JSON).size
  console.log(`   Raw JSON: ${(jsonSize / 1e6).toFixed(2)} MB`)

  // ── Step 4: Gzip compress ─────────────────────────────────────────────────
  console.log('🗜  Compressing …')
  await pipeline(
    createReadStream(OUT_JSON),
    zlib.createGzip({ level: 9 }),
    createWriteStream(OUT_GZ)
  )
  const gzSize = fs.statSync(OUT_GZ).size
  console.log(`   Compressed: ${(gzSize / 1e6).toFixed(2)} MB  (${Math.round((1 - gzSize / jsonSize) * 100)}% reduction)`)

  // Remove uncompressed JSON
  fs.unlinkSync(OUT_JSON)

  // ── Step 5: Cleanup temp file ─────────────────────────────────────────────
  fs.unlinkSync(TMP_CSV)
  console.log('\n🎉 Done!  Output:', OUT_GZ)
  console.log(`   Final size: ${(gzSize / 1e6).toFixed(2)} MB`)

  if (gzSize > 5_000_000) {
    console.warn('\n⚠  Final file exceeds the 5 MB target. Consider reducing TARGET_COUNT.')
  }
}

main().catch(err => {
  console.error('\n❌ Build failed:', err)
  process.exit(1)
})
