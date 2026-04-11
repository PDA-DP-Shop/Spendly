/**
 * generate-icons.mjs
 * Uses Jimp v1 to resize spendly-logo.png into every required
 * icon size for PWA, favicon, og-image, and splash screen.
 *
 * Run: node scripts/generate-icons.mjs
 */

import { Jimp } from 'jimp'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC  = path.join(ROOT, 'public', 'spendly-logo.png')
const OUT  = path.join(ROOT, 'public')

// All sizes needed by the app
const icons = [
  // PWA manifest icons
  { file: 'icon-72.png',            size: 72  },
  { file: 'icon-96.png',            size: 96  },
  { file: 'icon-128.png',           size: 128 },
  { file: 'icon-152.png',           size: 152 },
  { file: 'icon-180.png',           size: 180 },
  { file: 'icon-192.png',           size: 192 },
  { file: 'icon-512.png',           size: 512 },
  // Maskable (same image)
  { file: 'icon-maskable-192.png',  size: 192 },
  { file: 'icon-maskable-512.png',  size: 512 },
  // Browser favicons
  { file: 'favicon-32.png',         size: 32  },
  { file: 'favicon-16.png',         size: 16  },
  // OG image: 1200×630 white canvas, 360px logo centred
  { file: 'og-image.png',           logoSize: 360, canvasW: 1200, canvasH: 630 },
  // Splash: 512×512 white canvas, 256px logo centred
  { file: 'splash.png',             logoSize: 256, canvasW: 512,  canvasH: 512 },
]

async function main() {
  console.log('🖼  Source:', SRC)
  const base = await Jimp.read(SRC)

  for (const icon of icons) {
    const dest = path.join(OUT, icon.file)

    if (icon.canvasW) {
      // Canvas mode: white background + centred logo
      const canvas = new Jimp({ width: icon.canvasW, height: icon.canvasH, color: 0xffffffff })
      const logo = (await Jimp.read(SRC)).resize({ w: icon.logoSize, h: icon.logoSize })
      const x = Math.floor((icon.canvasW - icon.logoSize) / 2)
      const y = Math.floor((icon.canvasH - icon.logoSize) / 2)
      canvas.composite(logo, x, y)
      await canvas.write(dest)
    } else {
      // Simple resize
      const img = await Jimp.read(SRC)
      img.resize({ w: icon.size, h: icon.size })
      await img.write(dest)
    }

    const kb = Math.round(fs.statSync(dest).size / 1024)
    const dim = icon.canvasW
      ? `${icon.canvasW}×${icon.canvasH}`
      : `${icon.size}×${icon.size}`
    console.log(`  ✅ ${icon.file.padEnd(28)} ${dim.padEnd(10)} (${kb} KB)`)
  }

  console.log('\n🎉 All icons generated from spendly-logo.png!')
}

main().catch(err => {
  console.error('❌ Failed:', err.message || err)
  process.exit(1)
})
