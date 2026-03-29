/**
 * Advanced AES-256-GCM + HMAC-SHA256 encryption for Spendly export files.
 * Follows the Spendly Binary Export Standard.
 */
import { deriveExportKeys } from '../utils/crypto';

const MAGIC = 'SPENDLY';
const VERSION = 2; // Version 2: 600k iterations, SHA-512, 32-byte salt

/**
 * Encrypts app data into a binary buffer for export.
 * @param {object} data - The app data to export.
 * @param {string} password - The user's transfer password.
 * @returns {Promise<ArrayBuffer>}
 */
export async function encryptExport(data, password) {
  const encoder = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(32)); // 32 bytes for Version 2
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const { encKey, hmacKey } = await deriveExportKeys(password, salt);
  
  // 1. Encrypt the data
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-256-GCM', iv },
    encKey,
    encoder.encode(JSON.stringify(data))
  );

  // 2. Calculate HMAC over [Magic + Version + Salt + IV + EncryptedData]
  const magicBytes = encoder.encode(MAGIC);
  const versionByte = new Uint8Array([VERSION]);
  
  const payloadToHashBuffer = await new Blob([magicBytes, versionByte, salt, iv, encrypted]).arrayBuffer();
  const hmac = await window.crypto.subtle.sign('HMAC', hmacKey, payloadToHashBuffer);

  // 3. Assemble binary structure
  // Header: Magic(7) + Version(1) + Salt(32) + IV(12) + HMAC(64) + Data(...)
  return await new Blob([
    magicBytes,
    versionByte,
    salt,
    iv,
    hmac,
    encrypted
  ]).arrayBuffer();
}

/**
 * Decrypts a binary buffer from a .spendly file.
 * @param {ArrayBuffer} buffer - The file contents.
 * @param {string} password - The transfer password.
 * @returns {Promise<object>}
 */
export async function decryptExport(buffer, password) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  
  // Parse header
  const magic = decoder.decode(buffer.slice(0, 7));
  if (magic !== MAGIC) throw new Error('Not a valid Spendly file');
  
  const version = new Uint8Array(buffer.slice(7, 8))[0];
  
  // Versions 1 used 16-byte salt and 32-byte HMAC
  const isV1 = version === 1;
  const saltLen = isV1 ? 16 : 32;
  const hmacLen = isV1 ? 32 : 64; 
  
  const salt = new Uint8Array(buffer.slice(8, 8 + saltLen));
  const iv = new Uint8Array(buffer.slice(8 + saltLen, 8 + saltLen + 12));
  const hmac = new Uint8Array(buffer.slice(8 + saltLen + 12, 8 + saltLen + 12 + hmacLen));
  const encrypted = buffer.slice(8 + saltLen + 12 + hmacLen);

  const { encKey, hmacKey } = await deriveExportKeys(password, salt);

  // 1. Verify HMAC
  const payloadToVerify = await new Blob([
    encoder.encode(MAGIC),
    new Uint8Array([version]),
    salt,
    iv,
    encrypted
  ]).arrayBuffer();
  
  const isValid = await window.crypto.subtle.verify('HMAC', hmacKey, hmac, payloadToVerify);
  if (!isValid) throw new Error('Wrong password or corrupted file');

  // 2. Decrypt
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-256-GCM', iv },
    encKey,
    encrypted
  );

  return JSON.parse(decoder.decode(decrypted));
}
