// Calculates total amounts from expense list
export const calculateTotal = (expenses) => {
  return expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
}

export const calculateSpent = (expenses) => {
  return expenses
    .filter(e => e.type === 'spent')
    .reduce((sum, e) => sum + e.amount, 0)
}

export const calculateReceived = (expenses) => {
  return expenses
    .filter(e => e.type === 'received')
    .reduce((sum, e) => sum + e.amount, 0)
}

export const calculateBalance = (expenses) => {
  return calculateReceived(expenses) - calculateSpent(expenses)
}

export const calculateSavingsRate = (expenses) => {
  const received = calculateReceived(expenses)
  const spent = calculateSpent(expenses)
  if (received === 0) return 0
  return Math.round(((received - spent) / received) * 100)
}
