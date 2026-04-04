// Formats a number as money with locale-specific rules (e.g., Lakhs/Crores for India)
import { getCurrencyByCode } from '../constants/currencies'

const CURRENCY_TO_LOCALE = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  INR: 'en-IN',
  JPY: 'ja-JP',
  CNY: 'zh-CN',
  AED: 'ar-AE',
  BRL: 'pt-BR',
  MXN: 'es-MX',
  RUB: 'ru-RU',
  CAD: 'en-CA',
}

export const formatMoney = (amount, currencyCode = 'USD', showSign = false) => {
  const currency = getCurrencyByCode(currencyCode)
  const locale = CURRENCY_TO_LOCALE[currencyCode] || 'en-US'
  const absAmount = Math.abs(amount)
  
  const formatted = absAmount.toLocaleString(locale, {
    minimumFractionDigits: currencyCode === 'JPY' ? 0 : 2,
    maximumFractionDigits: currencyCode === 'JPY' ? 0 : 2,
  })

  const prefix = amount < 0 ? '-' : (showSign ? '+ ' : '')
  return `${prefix}${currency.symbol}${formatted}`
}

export const formatMoneyCompact = (amount, currencyCode = 'USD') => {
  const currency = getCurrencyByCode(currencyCode)
  const abs = Math.abs(amount)
  const prefix = amount < 0 ? '-' : ''
  if (abs >= 1000000) return `${prefix}${currency.symbol}${(abs / 1000000).toFixed(1)}M`
  if (abs >= 1000) return `${prefix}${currency.symbol}${(abs / 1000).toFixed(1)}K`
  return `${prefix}${currency.symbol}${abs.toFixed(2)}`
}
