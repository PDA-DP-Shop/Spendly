import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Apply saved theme or default to light for premium white look
const savedSettings = localStorage.getItem('spendly_shop_settings');
const theme = savedSettings ? JSON.parse(savedSettings).theme : 'light';
if (theme === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
