const formatters = new Map()

function getFormatter(currency = 'MAD', locale = 'fr-MA'){
  const key = `${locale}:${currency}`
  if (!formatters.has(key)) {
    formatters.set(key, new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }))
  }
  return formatters.get(key)
}

export function formatMoney(value, currency = 'MAD', locale = 'fr-MA'){
  const num = Number(value) || 0
  return getFormatter(currency, locale).format(num)
}

export function formatPercent(value, locale = 'fr-MA', digits = 1){
  const formatter = new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  })
  return formatter.format(Number(value) / 100)
}

if (typeof document !== 'undefined') {
  document.addEventListener('alpine:init', () => {
    window.Alpine.magic('money', () => (value, currency = 'MAD', locale) => {
      const localeToUse = locale || (window.Alpine?.store('settings')?.getCompany?.().langue === 'ar' ? 'ar-MA' : 'fr-MA')
      return formatMoney(value, currency, localeToUse)
    })
  })
}

export default {
  formatMoney,
  formatPercent
}
