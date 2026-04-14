/**
 * Real-world note/coin denominations for major currencies
 * Used for Cash Wallet calculations and UI styling
 */

const CURRENCY_NOTES = {
  INR: {
    symbol: "₹",
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
    }
  },
  USD: {
    symbol: "$",
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
    }
  },
  EUR: {
    symbol: "€",
    notes: [500, 200, 100, 50, 20, 10, 5],
    noteColors: {
      500: "#9C4DC4",
      200: "#E8B84B",
      100: "#4CAF50",
      50: "#FF7043",
      20: "#4A90D9",
      10: "#E91E63",
      5: "#795548"
    }
  },
  GBP: {
    symbol: "£",
    notes: [50, 20, 10, 5],
    noteColors: {
      50: "#E91E63",
      20: "#4A90D9",
      10: "#E8B84B",
      5: "#4CAF50"
    }
  },
  AED: {
    symbol: "د.إ",
    notes: [1000, 500, 200, 100, 50, 20, 10, 5],
    noteColors: {
      1000: "#795548",
      500: "#4A90D9",
      200: "#A1887F",
      100: "#E53935",
      50: "#9C27B0",
      20: "#00ACC1",
      10: "#43A047",
      5: "#8D6E63"
    }
  },
  SGD: {
    symbol: "$",
    notes: [100, 50, 10, 5, 2],
    noteColors: {
      100: "#FF7043",
      50: "#4A90D9",
      10: "#E53935",
      5: "#43A047",
      2: "#9C27B0"
    }
  },
  CAD: {
    symbol: "$",
    notes: [100, 50, 20, 10, 5],
    noteColors: {
      100: "#AF8E44",
      50: "#E53935",
      20: "#43A047",
      10: "#9C27B0",
      5: "#4A90D9"
    }
  },
  AUD: {
    symbol: "$",
    notes: [100, 50, 20, 10, 5],
    noteColors: {
      100: "#43A047",
      50: "#FFD600",
      20: "#E53935",
      10: "#4A90D9",
      5: "#9C27B0"
    }
  },
  JPY: {
    symbol: "¥",
    notes: [10000, 5000, 2000, 1000],
    noteColors: {
      10000: "#A1887F",
      5000: "#9C27B0",
      2000: "#43A047",
      1000: "#4A90D9"
    }
  },
  CNY: {
    symbol: "¥",
    notes: [100, 50, 20, 10, 5, 1],
    noteColors: {
      100: "#E53935",
      50: "#43A047",
      20: "#8D6E63",
      10: "#4A90D9",
      5: "#9C27B0",
      1: "#FFD600"
    }
  }
};

/**
 * Returns the note denominations for a given currency code
 * @param {string} currencyCode 
 * @returns {Array<number>}
 */
export const getNotesByUserCurrency = (currencyCode) => {
  return CURRENCY_NOTES[currencyCode]?.notes || CURRENCY_NOTES.INR.notes;
};

export default CURRENCY_NOTES;
