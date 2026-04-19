/**
 * Spendly Biometric Authentication Service
 * Implements hardware-backed authentication (Face ID / Fingerprint) via WebAuthn
 * Zero-Knowledge Architecture: No biometric data ever leaves the device hardware
 */

export const biometricAuth = {
  /**
   * Checks if the current hardware supports biometric authentication
   * @returns {Promise<{biometricAvailable: boolean, type: 'faceid' | 'fingerprint' | 'none' }>}
   */
  checkSupport: async () => {
    try {
      if (!window.PublicKeyCredential) return { biometricAvailable: false, type: 'none' }
      
      const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      
      if (available) {
        // Heuristic to guess if it's Face ID (iPhone with notch) or Fingerprint
        const userAgent = window.navigator.userAgent.toLowerCase()
        const isIOS = /iphone|ipad|ipod/.test(userAgent)
        const hasNotch = window.screen.height / window.screen.width > 2 // iPhone X and later have higher aspect ratios
        
        return {
          biometricAvailable: true,
          type: (isIOS && hasNotch) ? 'faceid' : 'fingerprint'
        }
      }
      
      return { biometricAvailable: false, type: 'none' }
    } catch (e) {
      console.error('Biometric support check failed', e)
      return { biometricAvailable: false, type: 'none' }
    }
  },

  /**
   * Registers a new biometric credential for this device
   * @param {string} userId - Unique identifier for the user record
   * @returns {Promise<{credentialId: string, publicKey: string}>}
   */
  register: async (userId) => {
    const challenge = window.crypto.getRandomValues(new Uint8Array(32))
    const userHandle = window.crypto.getRandomValues(new Uint8Array(16))

    const createOptions = {
      publicKey: {
        challenge,
        rp: { name: "Spendly Shop" },
        user: {
          id: userHandle,
          name: userId,
          displayName: userId
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 }, // ES256
          { type: "public-key", alg: -257 } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "preferred"
        },
        timeout: 60000,
        attestation: "none"
      }
    }

    const credential = await navigator.credentials.create(createOptions)
    
    return {
      credentialId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
      publicKey: 'hardware-backed' // We don't need the actual public key for local-only storage validation
    }
  },

  /**
   * Verifies the user's identity using biometrics
   * @param {string} storedCredentialId - The base64 encoded credentialId from registration
   * @returns {Promise<boolean>}
   */
  verify: async (storedCredentialId) => {
    try {
      const challenge = window.crypto.getRandomValues(new Uint8Array(32))
      const rawId = Uint8Array.from(atob(storedCredentialId), c => c.charCodeAt(0))

      const getOptions = {
        publicKey: {
          challenge,
          allowCredentials: [{
            id: rawId,
            type: 'public-key',
            transports: ['internal']
          }],
          userVerification: 'required',
          timeout: 60000
        }
      }

      await navigator.credentials.get(getOptions)
      return true
    } catch (e) {
      console.error('Biometric verification failed', e)
      return false
    }
  }
}
