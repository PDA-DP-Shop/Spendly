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
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 8000000,

        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,webp,woff2,ttf,json,gz}'
        ],

        navigateFallback: '/index.html',

        runtimeCaching: [
          {
            urlPattern: /\/$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxAgeSeconds: 86400
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 31536000
              }
            }
          },
          {
            urlPattern: /^https:\/\/world\.openfoodfacts\.org/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'products-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 2592000
              }
            }
          }
        ]
      },

      devOptions: { enabled: false }
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
