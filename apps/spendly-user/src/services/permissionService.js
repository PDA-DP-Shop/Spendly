/**
 * Permission Service — Spendly User
 * Handles Camera, Notifications with:
 * - Persistent decision storage (localStorage)
 * - Skip / postpone support
 * - Status query without prompting
 */

const STORAGE_KEY = 'spendly_permissions_v1'

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}

function savePerm(key, value) {
  const cur = loadSaved()
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...cur, [key]: value }))
}

export const permissionService = {

  /** Persist skip decision — don't ask again this session */
  skip() {
    savePerm('skipped', true)
    savePerm('skippedAt', Date.now())
  },

  /** Has the user made any decision (grant/deny/skip)? */
  hasDecided() {
    const s = loadSaved()
    return s.decided === true || s.skipped === true
  },

  /** Mark that decisions have been made */
  markDecided() {
    savePerm('decided', true)
  },

  /** Request all permissions — Camera + Notifications */
  async requestAllPermissions() {
    const results = { camera: false, notifications: false }

    // ── Camera ──────────────────────────────────────────────────────────────
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(t => t.stop())
      results.camera = true
      savePerm('camera', 'granted')
    } catch {
      savePerm('camera', 'denied')
    }

    // ── Notifications ───────────────────────────────────────────────────────
    try {
      if ('Notification' in window) {
        const res = await Notification.requestPermission()
        results.notifications = res === 'granted'
        savePerm('notifications', res)
      }
    } catch {
      savePerm('notifications', 'denied')
    }

    this.markDecided()
    return results
  },

  /** Request only camera permission */
  async requestCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(t => t.stop())
      savePerm('camera', 'granted')
      return true
    } catch {
      savePerm('camera', 'denied')
      return false
    }
  },

  /** Check current status without prompting the user */
  async checkStatus() {
    const saved = loadSaved()
    const result = {
      camera: saved.camera || 'prompt',
      notifications: saved.notifications || 'prompt',
      skipped: saved.skipped || false,
      decided: saved.decided || false,
    }

    // Also verify via Permissions API if available
    if (navigator.permissions?.query) {
      try {
        const cam = await navigator.permissions.query({ name: 'camera' })
        if (cam && cam.state) {
          result.camera = cam.state
          savePerm('camera', cam.state)
        }
      } catch (e) {
        console.log('[PermissionService] Camera query not supported')
      }
      
      try {
        const notif = await navigator.permissions.query({ name: 'notifications' })
        if (notif && notif.state) {
          result.notifications = notif.state
          savePerm('notifications', notif.state)
        }
      } catch (e) {
        console.log('[PermissionService] Notifications query not supported')
      }
    }

    if ('Notification' in window && Notification.permission !== 'default') {
      result.notifications = Notification.permission
    }

    return result
  },

  /** Open browser settings page for this origin (shows a toast since browsers don't support direct nav) */
  openSettings() {
    // We can only guide — browsers don't allow direct permission settings navigation.
    // Return the helpful message instead.
    return 'Open your browser Settings → Site Settings → this site to manage permissions.'
  },

  /** Get human-readable label for a permission state */
  label(state) {
    if (state === 'granted') return 'Allowed'
    if (state === 'denied') return 'Blocked'
    return 'Not set'
  },

  /** Color class for permission state */
  color(state) {
    if (state === 'granted') return 'text-emerald-600'
    if (state === 'denied') return 'text-red-500'
    return 'text-[#AFAFAF]'
  },

  /** Dot color for permission state */
  dotColor(state) {
    if (state === 'granted') return 'bg-emerald-500'
    if (state === 'denied') return 'bg-red-400'
    return 'bg-[#D8D8D8]'
  }
}
