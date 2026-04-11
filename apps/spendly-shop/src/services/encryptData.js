/**
 * Spendly Encryption Service
 * AES-256-GCM using Web Crypto API
 */

const ITERATIONS = 600000;
const KEY_LENGTH = 256;
const ALGORITHM = 'AES-GCM';
const HASH = 'SHA-512';

export async function importKey(rawKey) {
  return window.crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: ALGORITHM },
    false,
    ['encrypt', 'decrypt']
  );
}

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

export async function decryptData(encrypted, key, iv) {
  const decrypted = await window.crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    encrypted
  );

  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(decrypted));
}

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

export function generateSalt() {
  return window.crypto.getRandomValues(new Uint8Array(32));
}

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
