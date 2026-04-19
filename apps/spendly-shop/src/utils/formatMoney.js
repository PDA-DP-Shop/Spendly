/**
 * Utility to format money based on currency and locale
 */

export function formatMoney(amount, currency, locale) {
  let activeCurrency = currency;
  let activeLocale = locale;

  // If currency not provided, try to get from settings
  if (!activeCurrency) {
    try {
      const saved = localStorage.getItem('spendly_shop_settings');
      if (saved) {
        const settings = JSON.parse(saved);
        activeCurrency = settings.currency || 'INR';
      } else {
        activeCurrency = 'INR';
      }
    } catch (e) {
      activeCurrency = 'INR';
    }
  }

  // If locale not provided, use default mapping
  if (!activeLocale) {
    const localeMap = {
      'INR': 'en-IN',
      'USD': 'en-US',
      'EUR': 'de-DE',
      'GBP': 'en-GB',
      'AED': 'ar-AE',
      'JPY': 'ja-JP',
      'CAD': 'en-CA',
      'AUD': 'en-AU'
    };
    activeLocale = localeMap[activeCurrency] || 'en-US';
  }

  return new Intl.NumberFormat(activeLocale, {
    style: 'currency',
    currency: activeCurrency,
    maximumFractionDigits: 0
  }).format(amount);
}
