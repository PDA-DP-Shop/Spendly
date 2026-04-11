import DOMPurify from 'dompurify'

/**
 * Sanitizes an HTML string or text to prevent XSS attacks.
 * @param {string} input - The input to sanitize.
 * @returns {string} - The sanitized string.
 */
export const sanitize = (input) => {
  if (typeof input !== 'string') return input
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No tags allowed for basic text sanitization
    ALLOWED_ATTR: []
  })
}

/**
 * Sets up global security protections.
 */
export const setupSecurity = () => {
  // 1. Disable React DevTools in production
  if (import.meta.env.PROD) {
    if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object') {
      for (const key in window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] = typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] === 'function' ? () => {} : null
      }
    }
  }

  // 2. Anti-debugging trap (optional, but can deter some simple attacks)
  // We use a simple console clear if devtools are detected (basic implementation)
  // 2. Anti-debugging / DevTools Detection
  if (import.meta.env.PROD) {
    const isDevToolsOpen = () => {
      const threshold = 160
      return window.outerWidth - window.innerWidth > threshold || 
             window.outerHeight - window.innerHeight > threshold
    }

    // Immediately blur or clear if open
    const check = () => {
      if (isDevToolsOpen()) {
        console.clear()
        // We can't easily "close" devtools, but we can make it useless
        // or trigger a global blur if we want (handled in App.jsx via backgrounding usually)
      }
    }
    
    window.addEventListener('resize', check)
    setInterval(check, 2000)

    // Disable right click
    document.addEventListener('contextmenu', e => e.preventDefault())
  }

  // 3. Prevent Clickjacking via JS (redundant with X-Frame-Options but good for old browsers)
  if (window.self !== window.top) {
    window.top.location = window.self.location
  }
}

/**
 * Throttles a function to prevent it from being called too frequently.
 * Useful for rate-limiting expensive operations like scanner init or data export.
 * @param {Function} func - The function to throttle.
 * @param {number} limit - The time limit in milliseconds.
 * @returns {Function} - The throttled function.
 */
export const throttle = (func, limit) => {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Debounces a function to prevent it from being called too frequently during rapid changes.
 * Useful for search inputs or preventing automated spam.
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The wait time in milliseconds.
 * @returns {Function} - The debounced function.
 */
export const debounce = (func, wait) => {
  let timeout
  return function(...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

