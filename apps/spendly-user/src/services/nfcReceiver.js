/**
 * Starts NFC scanning on the user app side.
 * Web NFC is only available on Chrome for Android.
 * The shop encodes bills as: https://spendly-24hrs.pages.dev/?data=BASE64
 */
export async function startNFCReceiver(onBillReceived) {
  if (!('NDEFReader' in window)) {
    console.log('[NFC] Not supported on this device/browser');
    return false;
  }

  try {
    const ndef = new window.NDEFReader();
    await ndef.scan();
    console.log('[NFC] Scanning started');

    ndef.addEventListener('reading', ({ message }) => {
      for (const record of message.records) {
        if (record.recordType === 'url' || record.recordType === 'text') {
          const url = new TextDecoder().decode(record.data);
          console.log('[NFC] Record received:', url);

          // Extract ?data= param from any Spendly URL (prod or localhost)
          if (url.includes('?data=')) {
            try {
              const paramStr = url.includes('?') ? url.split('?')[1] : url;
              const params = new URLSearchParams(paramStr);
              const data = params.get('data');

              if (!data) continue;

              // UTF-8 safe decode (same as URL deep-link handler in App.jsx)
              const decoded = decodeURIComponent(data);
              const jsonStr = decodeURIComponent(escape(atob(decoded)));
              const bill = JSON.parse(jsonStr);

              if (bill?.type === 'SPENDLY_BILL') {
                console.log('[NFC] Valid Spendly bill received:', bill.billNumber);
                onBillReceived(bill);
              }
            } catch (e) {
              console.error('[NFC] Bill decode failed:', e);
            }
          }
        }
      }
    });

    ndef.addEventListener('readingerror', () => {
      console.warn('[NFC] Reading error — could not read NFC tag');
    });

    return true;
  } catch (err) {
    console.log('[NFC] Access denied or hardware error:', err.message);
    return false;
  }
}
