/**
 * Encodes bill data into a URL-safe Base64 string
 * with UTF-8 support for customer names/items.
 */
export function encodeBillToURL(bill) {
  const billData = {
    ...bill,
    type: 'SPENDLY_BILL',
    shopCategory: bill.shopCategory || 'grocery'
  };

  // Safe Base64 encoding for Unicode
  const jsonStr = JSON.stringify(billData);
  const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
  
  // Use the production URL of the user app
  return `https://spendly-24hrs.pages.dev/?data=${encodeURIComponent(base64)}`;
}
