/**
 * NFC Service for Spendly Shop
 * Writes a Spendly bill URL to an NFC tag / peer device.
 * Web NFC (NDEFReader) is only available on Chrome for Android.
 */

export function isNFCSupported() {
  return 'NDEFReader' in window;
}

export function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

/**
 * Write a bill URL to NFC.
 * @param {string} billUrl - The full encoded bill URL
 * @param {function} onStateChange - Callback: 'writing' | 'success' | 'error' | 'unsupported'
 */
export async function sendViaNFC(billUrl, onStateChange) {
  if (!isNFCSupported()) {
    onStateChange('unsupported');
    return;
  }

  try {
    onStateChange('writing');
    const ndef = new window.NDEFReader();

    // Write the URL record — the user app will pick this up via its NFC scanner
    await ndef.write({
      records: [{ recordType: 'url', data: billUrl }]
    });

    onStateChange('success');
  } catch (err) {
    console.error('[NFC Send] Failed:', err.message);

    if (err.name === 'NotAllowedError') {
      // User denied permission
      onStateChange('denied');
    } else if (err.name === 'NotSupportedError') {
      onStateChange('unsupported');
    } else {
      onStateChange('error');
    }
  }
}
