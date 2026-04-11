/**
 * Permission Service
 * Unified handler for requesting and checking browser permissions (Camera, Mic)
 */

export const permissionService = {
  /**
   * Request multi-permission access early to avoid contextual interrupts later
   */
  requestAllPermissions: async () => {
    const results = {
      camera: false,
      mic: false
    }

    try {
      // 1. Request Camera
      const camStream = await navigator.mediaDevices.getUserMedia({ video: true })
      camStream.getTracks().forEach(track => track.stop())
      results.camera = true
    } catch (e) {
      console.warn("Camera permission denied", e)
    }

    try {
      // 2. Request Mic
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      micStream.getTracks().forEach(track => track.stop())
      results.mic = true
    } catch (e) {
      console.warn("Mic permission denied", e)
    }

    return results
  },

  /**
   * Check current status without prompting
   */
  checkStatus: async () => {
    if (!navigator.permissions || !navigator.permissions.query) {
      return { camera: 'unknown', mic: 'unknown' }
    }

    const [cam, mic] = await Promise.all([
      navigator.permissions.query({ name: 'camera' }).catch(() => ({ state: 'unknown' })),
      navigator.permissions.query({ name: 'microphone' }).catch(() => ({ state: 'unknown' }))
    ])

    return {
      camera: cam.state,
      mic: mic.state
    }
  }
}
