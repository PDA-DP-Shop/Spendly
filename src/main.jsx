// Spendly app entry point — sets up React + BrowserRouter + dark mode init
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { setupSecurity } from './utils/security'

// Initialize security layer
setupSecurity()

// Warm up the local product database in background (lazy, non-blocking)
// so the first barcode scan resolves instantly from the in-memory map.
import('./services/productLookup.js').then(({ preloadLocalDb }) => preloadLocalDb())

// Apply saved theme before render to avoid flash
const savedTheme = localStorage.getItem('spendly-theme')
if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
