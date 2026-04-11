export async function startNFCReceiver(onBillReceived) {
  if (!('NDEFReader' in window)) {
    console.log('NFC not supported on this device/browser');
    return;
  }

  try {
    const ndef = new window.NDEFReader();
    await ndef.scan();
    console.log('NFC Scanning started');

    ndef.addEventListener('reading', ({ message }) => {
      console.log('NFC message received');
      for (const record of message.records) {
        if (record.recordType === 'url') {
          const url = new TextDecoder().decode(record.data);
          console.log('URL from NFC:', url);
          
          if (url.includes('spendly-24hrs.pages.dev/bill') || url.includes('localhost')) {
            const urlObj = new URL(url);
            const data = urlObj.searchParams.get('data');
            
            if (data) {
              onBillReceived(data);
            }
          }
        }
      }
    });

  } catch (err) {
    console.log('NFC access denied or hardware error:', err);
  }
}
