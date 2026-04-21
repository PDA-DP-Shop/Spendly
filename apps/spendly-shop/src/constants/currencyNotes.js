/**
<<<<<<< HEAD
 * Real-world note/coin denominations for major currencies
 * Used for Cash Wallet calculations and UI styling
=======
 * Real-world currency note/banknote denominations and coins.
>>>>>>> 41f113d (upgrade scanner)
 */

const CURRENCY_NOTES = {
  INR: {
    symbol: "₹",
<<<<<<< HEAD
    notes: [2000, 500, 200, 100, 50, 20, 10, "20_coin", "10_coin", 5, 2, 1],
    noteColors: {
      2000: "#9C4DC4",
      500: "#4A90D9",
      200: "#E8B84B",
      100: "#4CAF50",
      50: "#FF7043",
      20: "#26A69A",
      "20_coin": "#26A69A",
      10: "#8D6E63",
      "10_coin": "#8D6E63",
      5: "#78909C",
      2: "#78909C",
      1: "#78909C"
=======
    items: [
      { value: 2000, type: 'note' },
      { value: 500, type: 'note' },
      { value: 200, type: 'note' },
      { value: 100, type: 'note' },
      { value: 50, type: 'note' },
      { value: 20, type: 'note' },
      { value: 10, type: 'note' },
      { value: 20, type: 'coin' },
      { value: 10, type: 'coin' },
      { value: 5, type: 'coin' },
      { value: 2, type: 'coin' },
      { value: 1, type: 'coin' }
    ],
    noteColors: {
      2000: "#BC439B", 500: "#94A3B8", 200: "#E8B84B", 100: "#A2A2D0", 50: "#26A69A", 20: "#E6EE9C", 10: "#8D6E63", 5: "#4CAF50"
>>>>>>> 41f113d (upgrade scanner)
    }
  },
  USD: {
    symbol: "$",
<<<<<<< HEAD
    notes: [100, 50, 20, 10, 5, 2, 1, "1_coin", "0.5_coin", "0.25_coin", "0.1_coin", "0.05_coin", "0.01_coin"],
    noteColors: {
      100: "#1B5E20",
      50: "#2E7D32",
      20: "#388E3C",
      10: "#43A047",
      5: "#4CAF50",
      2: "#66BB6A",
      1: "#81C784",
      "1_coin": "#FFD700",
      "0.5_coin": "#C0C0C0",
      "0.25_coin": "#C0C0C0",
      "0.1_coin": "#C0C0C0",
      "0.05_coin": "#C0C0C0",
      "0.01_coin": "#CD7F32"
=======
    items: [
      { value: 100, type: 'note' },
      { value: 50, type: 'note' },
      { value: 10, type: 'note' },
      { value: 5, type: 'note' },
      { value: 2, type: 'note' },
      { value: 1, type: 'note' },
      { value: 1, type: 'coin' },
      { value: 0.50, type: 'coin' },
      { value: 0.25, type: 'coin' },
      { value: 0.10, type: 'coin' },
      { value: 0.05, type: 'coin' },
      { value: 0.01, type: 'coin' }
    ],
    noteColors: {
      100: "#2E7D32", 50: "#388E3C", 20: "#43A047", 10: "#4CAF50", 5: "#66BB6A", 2: "#81C784", 1: "#A5D6A7"
>>>>>>> 41f113d (upgrade scanner)
    }
  },
  EUR: {
    symbol: "€",
<<<<<<< HEAD
    notes: [500, 200, 100, 50, 20, 10, 5],
    noteColors: {
      500: "#9C4DC4",
      200: "#E8B84B",
      100: "#4CAF50",
      50: "#FF7043",
      20: "#4A90D9",
      10: "#E91E63",
      5: "#795548"
=======
    items: [
      { value: 500, type: 'note' },
      { value: 200, type: 'note' },
      { value: 100, type: 'note' },
      { value: 50, type: 'note' },
      { value: 20, type: 'note' },
      { value: 10, type: 'note' },
      { value: 5, type: 'note' },
      { value: 2, type: 'coin' },
      { value: 1, type: 'coin' },
      { value: 0.50, type: 'coin' },
      { value: 0.20, type: 'coin' },
      { value: 0.10, type: 'coin' },
      { value: 0.05, type: 'coin' },
      { value: 0.02, type: 'coin' },
      { value: 0.01, type: 'coin' }
    ],
    noteColors: {
      500: "#9C4DC4", 200: "#E8B84B", 100: "#4CAF50", 50: "#FF7043", 20: "#4A90D9", 10: "#E91E63", 5: "#795548"
>>>>>>> 41f113d (upgrade scanner)
    }
  },
  GBP: {
    symbol: "£",
<<<<<<< HEAD
    notes: [50, 20, 10, 5, 2, 1],
    noteColors: {
      50: "#E91E63",
      20: "#9C27B0",
      10: "#E8B84B",
      5: "#3F51B5",
      2: "#607D8B",
      1: "#607D8B"
    }
  }
};

/**
 * Returns the note denominations for a given currency code
 * @param {string} currencyCode 
 * @returns {Array<number|string>}
 */
export const getNotesByUserCurrency = (currencyCode = 'INR') => {
  return CURRENCY_NOTES[currencyCode]?.notes || CURRENCY_NOTES.INR.notes;
};
=======
    items: [
      { value: 50, type: 'note' },
      { value: 20, type: 'note' },
      { value: 10, type: 'note' },
      { value: 5, type: 'note' },
      { value: 2, type: 'coin' },
      { value: 1, type: 'coin' },
      { value: 0.50, type: 'coin' },
      { value: 0.20, type: 'coin' },
      { value: 0.10, type: 'coin' },
      { value: 0.05, type: 'coin' },
      { value: 0.02, type: 'coin' },
      { value: 0.01, type: 'coin' }
    ],
    noteColors: {
      50: "#E91E63", 20: "#4A90D9", 10: "#FF7043", 5: "#4CAF50"
    }
  },
  AED: {
    symbol: "DH",
    items: [
      { value: 1000, type: 'note' },
      { value: 500, type: 'note' },
      { value: 200, type: 'note' },
      { value: 100, type: 'note' },
      { value: 50, type: 'note' },
      { value: 20, type: 'note' },
      { value: 10, type: 'note' },
      { value: 5, type: 'note' },
      { value: 1, type: 'coin' },
      { value: 0.50, type: 'coin' },
      { value: 0.25, type: 'coin' }
    ],
    noteColors: {
      1000: "#37474F", 500: "#455A64", 200: "#546E7A", 100: "#607D8B", 50: "#78909C", 20: "#90A4AE", 10: "#B0BEC5", 5: "#CFD8DC"
    }
  },
  CAD: {
    symbol: "$",
    items: [
      { value: 100, type: 'note' },
      { value: 50, type: 'note' },
      { value: 20, type: 'note' },
      { value: 10, type: 'note' },
      { value: 5, type: 'note' },
      { value: 2, type: 'coin' },
      { value: 1, type: 'coin' },
      { value: 0.25, type: 'coin' },
      { value: 0.10, type: 'coin' },
      { value: 0.05, type: 'coin' }
    ],
    noteColors: {
      100: "#9C27B0", 50: "#F44336", 20: "#4CAF50", 10: "#3F51B5", 5: "#3F51B5"
    }
  },
  AUD: {
    symbol: "$",
    items: [
      { value: 100, type: 'note' },
      { value: 50, type: 'note' },
      { value: 20, type: 'note' },
      { value: 10, type: 'note' },
      { value: 5, type: 'note' },
      { value: 2, type: 'coin' },
      { value: 1, type: 'coin' },
      { value: 0.50, type: 'coin' },
      { value: 0.20, type: 'coin' },
      { value: 0.10, type: 'coin' },
      { value: 0.05, type: 'coin' }
    ],
    noteColors: {
      100: "#2E7D32", 50: "#E91E63", 20: "#F97316", 10: "#3B82F6", 5: "#EC4899"
    }
  },
  JPY: {
    symbol: "¥",
    items: [
      { value: 10000, type: 'note' },
      { value: 5000, type: 'note' },
      { value: 2000, type: 'note' },
      { value: 1000, type: 'note' },
      { value: 500, type: 'coin' },
      { value: 100, type: 'coin' },
      { value: 50, type: 'coin' },
      { value: 10, type: 'coin' },
      { value: 5, type: 'coin' },
      { value: 1, type: 'coin' }
    ],
    noteColors: {
      10000: "#A1887F", 5000: "#9575CD", 2000: "#4DB6AC", 1000: "#81C784"
    }
  }
}

export const getItemsByUserCurrency = (currencyCode) => {
  return CURRENCY_NOTES[currencyCode]?.items || CURRENCY_NOTES.INR.items
}

// For backward compatibility during migration
export const getNotesByUserCurrency = (currencyCode) => {
  return getItemsByUserCurrency(currencyCode).map(i => i.value)
}
>>>>>>> 41f113d (upgrade scanner)

export default CURRENCY_NOTES;
