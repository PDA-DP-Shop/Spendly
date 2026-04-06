// Vite build and PWA configuration file
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
      injectRegister: 'auto',
      includeAssets: [
        'favicon.ico',
        'robots.txt',
        'icon-*.png',
        'splash.png',
        'data/top-50000-products.json.gz'
      ],
      manifest: false,
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,woff,woff2,ttf}'
        ],
        maximumFileSizeToCacheInBytes: 8000000,  // 8 MB — covers our ~5 MB product DB
        runtimeCaching: [
          // ── Local product database ────────────────────────────────────
          {
            urlPattern: /\/data\/top-50000-products\.json\.gz$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'product-db-cache',
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 60 * 60 * 24 * 30  // 30 days
              },
              cacheableResponse: { statuses: [0, 200] },
            }
          },
          {
            urlPattern: /^https:\/\/world\.openfoodfacts\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'product-api-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
          /^\/_/,
          /\/[^/?]+\.[^/]+$/
        ],
        // Essential Safari Redirection Fix: Disable navigation preload and ensure clean responses.
        navigationPreload: false,
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'dexie',
      'zustand',
      'framer-motion',
      'recharts',
      'lucide-react',
      'date-fns'
    ]
  }
})
