/**
 * Browser Service — Detect and manage browser-specific PWA behavior
 */
import { db } from './database'

export const browserService = {
  /**
   * Detect running environment
   */
  detect() {
    const ua = navigator.userAgent.toLowerCase()
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
    
    let browser = 'other'
    if (isStandalone) browser = 'pwa'
    else if (ua.indexOf('safari') > -1 && ua.indexOf('chrome') === -1) browser = 'safari'
    else if (ua.indexOf('chrome') > -1) browser = 'chrome'
    else if (ua.indexOf('firefox') > -1) browser = 'firefox'
    
    return {
      browser,
      isPWA: isStandalone,
      isIOS: /iphone|ipad|ipod/.test(ua),
      isAndroid: /android/.test(ua)
    }
  },

  /**
   * Initialize browser tracking on app open
   */
  async initTracking() {
    const { browser } = this.detect()
    const info = await db.browserInfo.get(1)
    
    if (!info) {
      await db.browserInfo.add({
        id: 1,
        firstOpenedAt: new Date().toISOString(),
        lastOpenedAt: new Date().toISOString(),
        preferredBrowser: null // Set later by user
      })
    } else {
      await db.browserInfo.update(1, {
        lastOpenedAt: new Date().toISOString()
      })
    }
  },

  /**
   * Save user's main browser choice
   */
  async setPreferredBrowser(browserName) {
    await db.browserInfo.update(1, { preferredBrowser: browserName })
    // Also save to localStorage for cross-browser detection (best effort)
    localStorage.setItem('spendly_preferred_browser', browserName)
  },

  /**
   * Get preferred browser
   */
  async getPreferredBrowser() {
    const info = await db.browserInfo.get(1)
    return info?.preferredBrowser || localStorage.getItem('spendly_preferred_browser')
  },

  /**
   * Check if user is in 'wrong' browser
   */
  async isWrongBrowser() {
    const { browser, isPWA } = this.detect()
    if (isPWA) return false // PWA is always right
    
    const preferred = await this.getPreferredBrowser()
    if (!preferred) return false // No preference set yet
    
    return browser !== preferred
  }
}
