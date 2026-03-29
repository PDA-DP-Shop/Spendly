// Formats a number as money with currency symbol
import { getCurrencyByCode } from '../constants/currencies'

export const formatMoney = (amount, currencyCode = 'USD', showSign = false) => {
  const currency = getCurrencyByCode(currencyCode)
  const absAmount = Math.abs(amount)
  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const sign = showSign ? (amount < 0 ? '- ' : '+ ') : ''
  return `${sign}${currency.symbol}${formatted}`
}

export const formatMoneyCompact = (amount, currencyCode = 'USD') => {
  const currency = getCurrencyByCode(currencyCode)
  if (amount >= 1000000) return `${currency.symbol}${(amount / 1000000).toFixed(1)}M`
  if (amount >= 1000) return `${currency.symbol}${(amount / 1000).toFixed(1)}K`
  return `${currency.symbol}${amount.toFixed(2)}`
}
