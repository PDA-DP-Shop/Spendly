// Currencies list with symbol, flag, and name for Spendly
export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
]

export const getCurrencyByCode = (code) => CURRENCIES.find(c => c.code === code) || CURRENCIES[0]
export const DEFAULT_CURRENCY = 'USD'
