
const bill = {
    shopName: "Test Shop",
    total: 100,
    paymentMethod: "CASH",
    items: [{ name: "Item 1", price: 100, quantity: 1 }]
};

const miniBill = {
    s: bill.shopName,
    t: bill.total,
    pm: bill.paymentMethod,
    v: 2
};

const jsonStr = JSON.stringify(miniBill);
const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
console.log("Encoded:", base64);

const decoded = decodeURIComponent(escape(atob(base64)));
console.log("Decoded:", decoded);
const parsed = JSON.parse(decoded);
console.log("Parsed Name:", parsed.s);
