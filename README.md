# Spendly 💸

Your private expense tracker.
No accounts. No cloud. Works offline.

## Run on your computer

Step 1 - Install Node.js from nodejs.org

Step 2 - Download this project

Step 3 - Open terminal in project folder

Step 4 - Run these commands:
  npm install
  npm run dev

Step 5 - Open on your phone:
  http://[your computer IP]:5173

## Build for production

  npm run build

Files will be in the /dist folder

## Deploy to Cloudflare Pages

Step 1 - Push code to GitHub

Step 2 - Go to pages.cloudflare.com

Step 3 - Connect GitHub repo

Step 4 - Build settings:
  Build command:  npm run build
  Output folder:  dist

Step 5 - Click Deploy

Step 6 - Add these GitHub Secrets
  for auto deploy:
  CLOUDFLARE_API_TOKEN
  CLOUDFLARE_ACCOUNT_ID

## Add to Home Screen

iPhone:
  Open in Safari → Share → Add to Home Screen

Android:
  Open in Chrome → Menu → Add to Home Screen

## Tech used

  React 19 + Vite
  Tailwind CSS 4
  Framer Motion
  Dexie.js (IndexedDB)
  Vite PWA Plugin
  Recharts
  ZXing.js
  Tesseract.js
  Web Crypto API
