alert('🚀 Spendly DEBUG: Script is running!')
console.log('🚀 Spendly: Initializing Application...')
// Spendly app entry point — sets up React + BrowserRouter + dark mode init
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { setupSecurity } from './utils/security'

// Initialize security layer
setupSecurity()

// Apply saved theme before render to avoid flash
const savedTheme = localStorage.getItem('spendly-theme')
if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {/* Basic Error Boundary for Production Debug */}
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>
)

function ErrorBoundary({ children }) {
  const [error, setError] = React.useState(null)
  React.useEffect(() => {
    const handleError = (e) => {
      console.error('CRITICAL ERROR:', e)
      setError(e.message)
      alert('CRITICAL ERROR: ' + e.message)
    }
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (error) return <div style={{color:'red', padding: 20}}><h1>App Crash</h1><p>{error}</p></div>
  return children
}
