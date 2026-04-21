/**
 * Encodes bill data into a URL-safe Base64 string
 * with UTF-8 support for customer names/items.
 */
export function encodeBillToURL(bill) {
  // Minify data for lower QR density
  const miniBill = {
    s: bill.shopName,
    t: bill.total,
    c: bill.shopCategory || 'other',
    bn: bill.billNumber,
    bi: bill.billId,
    ts: bill.timestamp || bill.createdAt,
    i: (bill.items || []).slice(0, 5).map(item => ({
      n: item.name,
      p: item.price,
      q: item.quantity
    })),
<<<<<<< HEAD
=======
    pm: bill.paymentMethod,
    pd: bill.paymentDetails,
>>>>>>> 41f113d (upgrade scanner)
    v: 2 // Version 2 (Minified)
  };

  const jsonStr = JSON.stringify(miniBill);
  const base64 = btoa(unescape(encodeURIComponent(jsonStr)));

  // Auto-detect environment for scanning
  const devUrl = 'http://localhost:5173';
  const prodUrl = 'https://spendly-24hrs.pages.dev';
  const baseUrl = window.location.origin.includes('localhost') ? devUrl : prodUrl;

  return `${baseUrl}/?data=${encodeURIComponent(base64)}`;
}
