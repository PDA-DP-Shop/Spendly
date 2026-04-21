import { db } from './database'

/**
 * Utility to convert ArrayBuffer to Base64 string
 */
function bufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
}

/**
 * Utility to convert Base64 string to Uint8Array
 */
function base64ToUint8Array(base64) {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

/**
 * FUNCTION 1 — Check what device supports
 * Decides whether to show Face ID or Fingerprint UI options
 */
export async function checkBiometricSupport() {
  const isWebAuthnSupported = !!window.PublicKeyCredential
  let isBiometricAvailable = false
  let type = 'none'

  if (isWebAuthnSupported) {
    try {
      isBiometricAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      
      if (isBiometricAvailable) {
        const ua = navigator.userAgent
        const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream
        
        if (isIOS) {
          // Detection for notch/dynamic island models (Face ID)
          const ratio = window.screen.height / window.screen.width
          const isFaceIDModel = ratio > 2.1
          type = isFaceIDModel ? 'faceid' : 'fingerprint'
        } else {
          // Android and others default to fingerprint label (most common)
          type = 'fingerprint'
        }
      }
    } catch (e) {
      console.error("Biometric support check failed", e)
    }
  }

  return {
    webAuthnSupported: isWebAuthnSupported,
    biometricAvailable: isBiometricAvailable,
    type
  }
}

/**
 * FUNCTION 2 — Register biometric
 * Run during onboarding setup to enroll the device
 */
export async function registerBiometric(userName = 'Spendly User') {
  try {
    const randomChallenge = window.crypto.getRandomValues(new Uint8Array(32))
    const randomUserId = window.crypto.getRandomValues(new Uint8Array(16))

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: randomChallenge,
        rp: {
          name: "Spendly",
          id: window.location.hostname
        },
        user: {
          id: randomUserId,
          name: userName,
          displayName: userName
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" }, // ES256
          { alg: -257, type: "public-key" } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "preferred"
        },
        timeout: 60000
      }
    })

    if (!credential) throw new Error('Failed to create credential')

    const credentialData = {
      id: 'spendly_biometric_credential', // Singleton key
      credentialId: credential.id,
      rawId: bufferToBase64(credential.rawId),
      type: credential.type,
      registeredAt: new Date().toISOString()
    }

    await db.biometric_credentials.put(credentialData)

    return { success: true, credentialId: credential.id }
  } catch (error) {
    console.error("Biometric registration error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * FUNCTION 3 — Verify biometric
 * Run every time the app opens or requires re-auth
 */
export async function verifyBiometric() {
  try {
    const saved = await db.biometric_credentials.get('spendly_biometric_credential')
    if (!saved) return { success: false, error: 'not_registered' }

    const newChallenge = window.crypto.getRandomValues(new Uint8Array(32))
    const savedRawId = base64ToUint8Array(saved.rawId)

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: newChallenge,
        allowCredentials: [{
          id: savedRawId.buffer,
          type: "public-key",
          transports: ["internal"]
        }],
        userVerification: "required",
        timeout: 60000
      }
    })

    if (assertion) {
      return { success: true }
    }
    
    return { success: false, error: 'unknown_failure' }
  } catch (error) {
<<<<<<< HEAD
    console.error("Biometric verification error:", error)
    if (error.name === 'NotAllowedError') {
      return { success: false, error: 'cancelled' }
    }
=======
    if (error.name !== 'NotAllowedError' && error.name !== 'OperationError') {
      console.error("Biometric verification error:", error)
    }
    if (error.name === 'NotAllowedError') {
      return { success: false, error: 'cancelled' }
    }
    if (error.name === 'OperationError') {
      return { success: false, error: 'pending' }
    }
>>>>>>> 41f113d (upgrade scanner)
    if (error.name === 'InvalidStateError') {
      return { success: false, error: 'invalid' }
    }
    return { success: false, error: error.message }
  }
}

/**
 * FUNCTION 4 — Remove biometric
 * Disables biometric auth and clears local credentials
 */
export async function removeBiometric() {
  try {
    await db.biometric_credentials.delete('spendly_biometric_credential')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
