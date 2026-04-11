/**
 * Encodes bill object to a Base64 string for the Spendly User app URL
 */

export function encodeBillToURL(billData) {
  const BASE_URL = 'https://spendly-24hrs.pages.dev';
  
  const billObject = {
    type: "SPENDLY_BILL",
    version: "1.0",
    shopName: billData.shopName || "My Shop",
    shopPhone: billData.shopPhone || "",
    shopUPI: billData.shopUPI || "",
    billNumber: billData.billNumber,
    items: billData.items,
    subtotal: billData.subtotal,
    gstAmount: billData.gstAmount,
    discountAmount: billData.discountAmount,
    total: billData.total,
    paymentMethod: billData.paymentMethod,
    createdAt: billData.createdAt
  };

  try {
    const json = JSON.stringify(billObject);
    // Use btoa with encodeUriComponent to handle unicode characters in item names
    const encoded = btoa(encodeURIComponent(json));
    return `${BASE_URL}/bill?data=${encoded}`;
  } catch (e) {
    console.error("Encoding bill failed", e);
    return BASE_URL;
  }
}
