/**
<<<<<<< HEAD
 * Spendly Smart Cash Calculator
 * Refined logic for finding optimal note combinations (Minimum Change + Minimum Notes).
 */

=======
 * Smart Cash Calculator Utility
 * Handles optimized banknote payment suggestions, change calculation, 
 * and manual payment recalculations for the Spendly PWA.
 */

// Standard banknote denominations for supported currencies
>>>>>>> 41f113d (upgrade scanner)
const STANDARD_DENOMINATIONS = {
  INR: [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1],
  USD: [100, 50, 20, 10, 5, 1],
  EUR: [500, 200, 100, 50, 20, 10, 5],
  GBP: [50, 20, 10, 5],
  AED: [1000, 500, 200, 100, 50, 20, 10, 5, 1],
  SGD: [10000, 1000, 500, 100, 50, 10, 5, 2, 1],
<<<<<<< HEAD
  JPY: [10000, 5000, 1000, 500, 100, 50, 10, 5, 1],
};

/**
 * Calculates total value of a notes object
 */
export const getTotalCash = (userNotes) => {
  if (!userNotes) return 0;
  return Object.entries(userNotes).reduce((total, [denom, count]) => {
    // Sanitize key (e.g. "10_coin" -> 10)
    const val = parseFloat(denom.toString().split('_')[0]);
    return total + (val * (parseInt(count) || 0));
  }, 0);
};

/**
 * Calculates change breakdown using standard denominations (Greedy)
 */
export const calculateChange = (changeAmount, currency = 'INR') => {
  const denominations = STANDARD_DENOMINATIONS[currency] || STANDARD_DENOMINATIONS.INR;
  let remaining = changeAmount;
  const breakdown = {};

  denominations.forEach(denom => {
    const count = Math.floor(remaining / denom);
    if (count > 0) {
      breakdown[denom] = count;
      remaining -= denom * count;
    }
  });

  return breakdown;
};

/**
 * Finds the best combination of notes to pay an expense.
 * Logic: Generate all subset combinations of user notes where total >= expense,
 * then pick the one with the lowest score.
 * Score = (changeAmount * 1000) + (notesCount) - (coinsCount * 0.01)
 * (Coins get a tiny bonus to prioritize using them first)
 */
export const findBestPayment = (expenseAmount, userNotes, currency = 'INR') => {
  if (expenseAmount <= 0) {
    return { isPossible: true, suggestedGive: {}, totalGiven: 0, changeAmount: 0, changeNotes: {}, isExactChange: true };
  }

  const totalAvailable = getTotalCash(userNotes);
  if (totalAvailable < expenseAmount) {
    return { isPossible: false };
  }

  // Prep note types for combination generation
  const noteTypes = Object.entries(userNotes)
    .filter(([_, count]) => count > 0)
    .map(([key, count]) => ({ 
      key, 
      denom: parseFloat(key.toString().split('_')[0]), 
      isCoin: key.toString().includes('_coin') || parseFloat(key) < 10,
      count: parseInt(count) 
    }));

  let bestCombo = null;
  let minScore = Infinity;

  /**
   * Recursive backtrack to find the best combination
   */
  const backtrack = (typeIndex, currentCombo, currentSum, currentNotesCount, currentCoinsCount) => {
    if (typeIndex === noteTypes.length) {
      if (currentSum >= expenseAmount) {
        const changeAmount = currentSum - expenseAmount;
        const score = (changeAmount * 1000) + currentNotesCount - (currentCoinsCount * 0.01);
        
        if (score < minScore) {
          minScore = score;
          bestCombo = {
            suggestedGive: { ...currentCombo },
            totalGiven: currentSum,
            changeAmount,
            isExactChange: changeAmount === 0
          };
        }
      }
      return;
    }

    const { key, denom, count, isCoin } = noteTypes[typeIndex];

    for (let i = 0; i <= count; i++) {
       if (i > 0) currentCombo[key] = i;
       backtrack(
         typeIndex + 1, 
         currentCombo, 
         currentSum + (denom * i), 
         currentNotesCount + i,
         currentCoinsCount + (isCoin ? i : 0)
       );
       if (i > 0) delete currentCombo[key];
    }
  };

  backtrack(0, {}, 0, 0, 0);

  if (!bestCombo) return { isPossible: false };

  return {
    ...bestCombo,
    changeNotes: calculateChange(bestCombo.changeAmount, currency),
    isPossible: true
  };
};

/**
 * Handles manual adjustments to give-notes
 */
export const recalculateWithCustomNotes = (customGiveNotes, expenseAmount, currency = 'INR') => {
  const totalGiven = getTotalCash(customGiveNotes);
  const isUnderpaying = totalGiven < expenseAmount;
  const changeAmount = isUnderpaying ? 0 : totalGiven - expenseAmount;
=======
  JPY: [10000, 5000, 1000, 500, 100, 50, 10, 5, 1]
}

/**
 * Calculates total cash value from a notes object
 * @param {Object} userNotes - { [denomination_type]: count }
 * @returns {number}
 */
export function getTotalCash(userNotes) {
  if (!userNotes) return 0
  return Object.entries(userNotes).reduce((sum, [key, count]) => {
    const value = parseFloat(key.split('_')[0])
    return sum + (value * (count || 0))
  }, 0)
}

/**
 * Breaks down a change amount into denominations (Greedy Algorithm)
 * @param {number} changeAmount 
 * @param {string} currency 
 * @returns {Object} { [note]: count }
 */
export function calculateChange(changeAmount, currency = 'USD') {
  if (changeAmount <= 0) return {}
  
  const denominations = STANDARD_DENOMINATIONS[currency] || STANDARD_DENOMINATIONS.USD
  const breakdown = {}
  let remaining = changeAmount

  for (const note of denominations) {
    const count = Math.floor(remaining / note)
    if (count > 0) {
      breakdown[note] = count
      remaining -= note * count
    }
  }

  return breakdown
}

/**
 * Recalculates change when user manually selects notes to give
 * @param {Object} customGiveNotes 
 * @param {number} expenseAmount 
 * @param {string} currency 
 */
export function recalculateWithCustomNotes(customGiveNotes, expenseAmount, currency) {
  const totalGiven = getTotalCash(customGiveNotes)
  const isUnderpaying = totalGiven < expenseAmount
  
  if (isUnderpaying) {
    return {
      totalGiven,
      changeAmount: 0,
      changeNotes: {},
      isExactChange: false,
      isUnderpaying: true
    }
  }

  const changeAmount = totalGiven - expenseAmount
  const changeNotes = calculateChange(changeAmount, currency)
>>>>>>> 41f113d (upgrade scanner)

  return {
    totalGiven,
    changeAmount,
<<<<<<< HEAD
    changeNotes: isUnderpaying ? {} : calculateChange(changeAmount, currency),
    isExactChange: changeAmount === 0 && !isUnderpaying,
    isUnderpaying
  };
};
=======
    changeNotes,
    isExactChange: changeAmount === 0,
    isUnderpaying: false
  }
}

/**
 * Finds the best combination of notes to pay an expense.
 * Algorithm Priorities (via Scoring):
 * 1. Minimal Change Amount (highest penalty)
 * 2. Minimal Note Count (secondary penalty)
 * 
 * Score = (changeAmount * 1000) + noteCount
 * 
 * @param {number} expenseAmount 
 * @param {Object} userNotes - { [denomination]: count }
 * @param {string} currency 
 */
export function findBestPayment(expenseAmount, userNotes, currency = 'INR') {
  if (!userNotes || expenseAmount <= 0) return { isPossible: false }
  
  const totalAvailable = getTotalCash(userNotes)
  if (totalAvailable < expenseAmount) return { isPossible: false }

  // Prepare denominations list with counts, sorted descending 
  const availableDenoms = Object.entries(userNotes)
    .map(([key, c]) => ({ 
      key,
      denom: parseFloat(key.split('_')[0]), 
      count: c 
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.denom - a.denom)

  let bestResult = {
    suggestedGive: null,
    score: Infinity,
    totalGiven: 0,
    noteCount: 0
  }

  /**
   * Recursive combination generator
   * @param {number} dIndex - Current denomination index
   * @param {number} currentSum - Current sum of subset
   * @param {number} currentNotesCount - Number of notes in subset
   * @param {Object} currentNotes - Currently selected notes { denom: count }
   */
  function solve(dIndex, currentSum, currentNotesCount, currentNotes) {
    // If we've reached or exceeded the target, we have a valid combination
    if (currentSum >= expenseAmount) {
      const change = currentSum - expenseAmount
      const score = (change * 1000) + currentNotesCount
      
      if (score < bestResult.score) {
        bestResult = {
          suggestedGive: { ...currentNotes },
          score,
          totalGiven: currentSum,
          noteCount: currentNotesCount
        }
      }
      return // Pruning: adding more notes will only increase score
    }

    // End of denominations
    if (dIndex >= availableDenoms.length) return

    const { key, denom, count } = availableDenoms[dIndex]

    // Optimization: If currentSum + all remaining potential cash < expenseAmount, skip
    // (Optional, but helps with depth profiling)

    // Try using from 0 up to 'count' of this denomination
    for (let k = 0; k <= count; k++) {
      const addedSum = k * denom
      
      // If we use 'k' notes, update counts and recurse
      if (k > 0) currentNotes[key] = k
      
      solve(dIndex + 1, currentSum + addedSum, currentNotesCount + k, currentNotes)
      
      if (k > 0) delete currentNotes[key]

      // Pruning: if currentSum + k * denom already exceeded the amount, 
      // there's no reason to try adding MORE of this same denomination
      if (currentSum + addedSum >= expenseAmount) break
    }
  }

  solve(0, 0, 0, {})

  if (!bestResult.suggestedGive) return { isPossible: false }

  const changeAmount = bestResult.totalGiven - expenseAmount
  const changeNotes = calculateChange(changeAmount, currency)

  return {
    suggestedGive: bestResult.suggestedGive,
    totalGiven: bestResult.totalGiven,
    changeAmount,
    changeNotes,
    isExactChange: changeAmount === 0,
    isPossible: true
  }
}
>>>>>>> 41f113d (upgrade scanner)
