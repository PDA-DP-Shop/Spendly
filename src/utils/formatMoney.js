// Formats a number as money with currency symbol
import { getCurrencyByCode } from '../constants/currencies'

export const formatMoney = (amount, currencyCode = 'USD', showSign = false) => {
  const currency = getCurrencyByCode(currencyCode)
  const absAmount = Math.abs(amount)
  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  // Always show '-' for negative values; optionally show '+' for positive when showSign=true
  if (amount < 0) return `-${currency.symbol}${formatted}`
  const sign = showSign ? '+ ' : ''
  return `${sign}${currency.symbol}${formatted}`
}

export const formatMoneyCompact = (amount, currencyCode = 'USD') => {
  const currency = getCurrencyByCode(currencyCode)
  const abs = Math.abs(amount)
  const prefix = amount < 0 ? '-' : ''
  if (abs >= 1000000) return `${prefix}${currency.symbol}${(abs / 1000000).toFixed(1)}M`
  if (abs >= 1000) return `${prefix}${currency.symbol}${(abs / 1000).toFixed(1)}K`
  return `${prefix}${currency.symbol}${abs.toFixed(2)}`
}
