/**
 * Spendly Smart Cash Calculator
 * Refined logic for finding optimal note combinations (Minimum Change + Minimum Notes).
 */

const STANDARD_DENOMINATIONS = {
  INR: [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1],
  USD: [100, 50, 20, 10, 5, 1],
  EUR: [500, 200, 100, 50, 20, 10, 5],
  GBP: [50, 20, 10, 5],
  AED: [1000, 500, 200, 100, 50, 20, 10, 5, 1],
  SGD: [10000, 1000, 500, 100, 50, 10, 5, 2, 1],
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

  return {
    totalGiven,
    changeAmount,
    changeNotes: isUnderpaying ? {} : calculateChange(changeAmount, currency),
    isExactChange: changeAmount === 0 && !isUnderpaying,
    isUnderpaying
  };
};
