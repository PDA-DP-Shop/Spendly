import CryptoJS from 'crypto-js';

const SECRET_KEY = 'spendly-secret-123';

export const decryptBillData = (encryptedBase64) => {
  try {
    // Check if it's just base64 encoded JSON or actually encrypted
    const decoded = atob(encryptedBase64);
    try {
      // Try parsing as JSON first (for non-encrypted fallback or simple btoa cases)
      return JSON.parse(decoded);
    } catch {
      // If JSON parse fails, try AES decryption
      const bytes = CryptoJS.AES.decrypt(decoded, SECRET_KEY);
      const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedStr);
    }
  } catch (error) {
    console.error("Failed to decrypt bill data:", error);
    return null;
  }
};

export const handleIncomingBill = (data, successCallback) => {
  const bill = decryptBillData(data);
  if (bill && successCallback) {
    successCallback(bill);
  }
};
