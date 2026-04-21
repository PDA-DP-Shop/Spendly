import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'qr-scanner-worker.min.js'],
      manifest: {
        name: 'Spendly',
        short_name: 'Spendly',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm,json}'],
        maximumFileSizeToCacheInBytes: 10000000, // 10MB to cover WASM + DB
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/world\.openfoodfacts\.org\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'product-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
              }
            }
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    exclude: [
      'tesseract.js',
      '@undecaf/zbar-wasm',
      'qr-scanner'
    ]
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          scanner: ['qr-scanner'],
          zbar: ['@undecaf/zbar-wasm'],
          tesseract: ['tesseract.js'],
          react: ['react', 'react-dom'],
          motion: ['framer-motion']
        }
      }
    },
    chunkSizeWarningLimit: 4000
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  }
})
