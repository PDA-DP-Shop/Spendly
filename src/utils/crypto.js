/**
 * Core cryptography module using Web Crypto API for AES-256-GCM and PBKDF2.
 * All operations are local and meet the Spendly Security Standard.
 */

const ITERATIONS = 600000;
const KEY_LENGTH = 256;
const ALGORITHM = 'AES-256-GCM';
const HASH = 'SHA-512';

/**
 * Derives raw cryptographic bits from a user PIN and salt.
 * @param {string} pin - The user's PIN/password.
 * @param {Uint8Array} salt - Random 32-byte salt.
 * @returns {Promise<Uint8Array>}
 */
export async function deriveSessionBits(pin, salt) {
  const encoder = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(pin),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const bits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: HASH,
    },
    baseKey,
    KEY_LENGTH
  );
  
  return new Uint8Array(bits);
}

/**
 * Imports a raw key buffer into a usable CryptoKey.
 * @param {Uint8Array} rawKey - The raw 32-byte key.
 * @returns {Promise<CryptoKey>}
 */
export async function importKey(rawKey) {
  return window.crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: ALGORITHM },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts data using AES-256-GCM.
 * @param {any} data - The data to encrypt.
 * @param {CryptoKey} key - The derived key.
 * @returns {Promise<{encrypted: ArrayBuffer, iv: Uint8Array}>}
 */
export async function encryptData(data, key) {
  const encoder = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(JSON.stringify(data))
  );

  return { encrypted, iv };
}

/**
 * Decrypts data using AES-256-GCM.
 * @param {ArrayBuffer} encrypted - The encrypted buffer.
 * @param {CryptoKey} key - The derived key.
 * @param {Uint8Array} iv - The initialization vector.
 * @returns {Promise<any>}
 */
export async function decryptData(encrypted, key, iv) {
  const decrypted = await window.crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    encrypted
  );

  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(decrypted));
}

/**
 * Hashes a PIN for secure storage using PBKDF2.
 * @param {string} pin - The user's raw PIN.
 * @param {Uint8Array} salt - Random 16-byte salt.
 * @returns {Promise<string>} - Hex string of the hashed PIN.
 */
export async function hashPin(pin, salt) {
  const encoder = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(pin),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: HASH,
    },
    baseKey,
    KEY_LENGTH
  );

  return Array.from(new Uint8Array(derivedBits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Helper to generate a random 32-byte salt.
 * @returns {Uint8Array}
 */
export function generateSalt() {
  return window.crypto.getRandomValues(new Uint8Array(32));
}

/**
 * Wipes sensitive data from an ArrayBuffer by overwriting it with zeros.
 * @param {ArrayBuffer|TypedArray} buffer - The buffer to wipe.
 */
export function secureWipeBuffer(buffer) {
  if (buffer instanceof ArrayBuffer) {
    const view = new Uint8Array(buffer);
    view.fill(0);
  } else if (ArrayBuffer.isView(buffer)) {
    buffer.fill(0);
  }
}

/**
 * Derives both encryption and HMAC keys from a transfer password.
 * @param {string} password - The user's transfer password.
 * @param {Uint8Array} salt - Random 32-byte salt.
 * @returns {Promise<{encKey: CryptoKey, hmacKey: CryptoKey}>}
 */
export async function deriveExportKeys(password, salt) {
  const encoder = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const encKey = await window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: HASH },
    baseKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );

  const hmacKey = await window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: HASH },
    baseKey,
    { name: 'HMAC', hash: 'SHA-512', length: 512 },
    false,
    ['sign', 'verify']
  );

  return { encKey, hmacKey };
}

