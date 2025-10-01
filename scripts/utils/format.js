let currentLocale = 'fr';
let currentCurrency = 'MAD';
let translations = {};

/**
 * Configure locale and translation dictionary.
 * @param {string} locale
 * @param {object} dict
 * @param {string} currency
 */
export function configureI18n(locale, dict, currency = 'MAD') {
  currentLocale = locale;
  translations = dict || {};
  currentCurrency = currency;
}

/**
 * Resolve translation key with dot-notation fallback.
 * @param {string} key
 * @param {Record<string,string|number>} vars
 * @returns {string}
 */
export function t(key, vars = {}) {
  const value = key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), translations);
  const template = typeof value === 'string' ? value : key;
  return template.replace(/\{(.*?)\}/g, (_, k) => (vars[k.trim()] ?? ''));
}

/**
 * Format currency according to locale.
 * @param {number} amount
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat(currentLocale === 'ar' ? 'ar-MA' : 'fr-MA', {
    style: 'currency',
    currency: currentCurrency,
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
  }).format(amount || 0);
}

/**
 * Format date to readable string.
 * @param {string|Date} input
 */
export function formatDate(input) {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(currentLocale === 'ar' ? 'ar-MA' : 'fr-MA', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date);
}

export function formatNumber(value, digits = 2) {
  return new Intl.NumberFormat(currentLocale === 'ar' ? 'ar' : 'fr', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(Number(value) || 0);
}

/**
 * Simple sanitization by escaping HTML entities.
 * @param {string} input
 */
export function sanitize(input) {
  if (input == null) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate a badge class according to status value.
 * @param {string} status
 */
export function statusClass(status = '') {
  const normalized = status.toLowerCase();
  if (['payée', 'payé', 'validée', 'match'].includes(normalized)) return 'success';
  if (['partiellement payée', 'brouillon', 'ébauche', 'draft', 'pending'].includes(normalized)) return 'warning';
  if (['annulée', 'overdue', 'late', 'erreur'].includes(normalized)) return 'danger';
  return '';
}

export function relativeDays(fromDate, toDate = new Date()) {
  const from = new Date(fromDate);
  const diff = toDate - from;
  return Math.round(diff / (1000 * 60 * 60 * 24));
}
