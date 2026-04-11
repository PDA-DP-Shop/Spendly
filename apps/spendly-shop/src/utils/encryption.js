import CryptoJS from 'crypto-js';

const SECRET_KEY = 'spendly-secret-123'; // In real app, this would be device specific

export const encryptBillData = (data) => {
  const jsonStr = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(jsonStr, SECRET_KEY).toString();
  // Return base64 encoded version for URL safety
  return btoa(encrypted);
};

export const generateBillURL = (billData) => {
  const encrypted = encryptBillData(billData);
  return `https://spendly-24hrs.pages.dev/bill?data=${encrypted}`;
};
