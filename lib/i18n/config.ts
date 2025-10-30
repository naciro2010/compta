/**
 * Configuration i18n
 * Framework: Configuration basique pour internationalisation
 */

export const defaultLocale = 'fr';
export const locales = ['fr', 'ar', 'en'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  ar: 'العربية',
  en: 'English',
};

// Formats de nombres par locale
export const numberFormats: Record<Locale, Intl.NumberFormatOptions> = {
  fr: {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  ar: {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    numberingSystem: 'arab',
  },
  en: {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
};

// Formats de devises
export const currencyFormats: Record<Locale, Intl.NumberFormatOptions> = {
  fr: {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2,
  },
  ar: {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2,
    numberingSystem: 'arab',
  },
  en: {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2,
  },
};

// Formats de dates
export const dateFormats: Record<Locale, { short: string; medium: string; long: string }> = {
  fr: {
    short: 'dd/MM/yyyy',
    medium: 'dd MMM yyyy',
    long: 'dd MMMM yyyy',
  },
  ar: {
    short: 'dd/MM/yyyy',
    medium: 'dd MMM yyyy',
    long: 'dd MMMM yyyy',
  },
  en: {
    short: 'MM/dd/yyyy',
    medium: 'MMM dd, yyyy',
    long: 'MMMM dd, yyyy',
  },
};
