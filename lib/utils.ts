/**
 * Utilitaires généraux pour l'application
 */

import { formatCurrency as i18nFormatCurrency, formatDate as i18nFormatDate } from './i18n/translations'

/**
 * Formate un montant en devise MAD
 * @param amount - Montant à formater
 * @param showSymbol - Afficher le symbole de devise (défaut: true)
 * @param locale - Locale à utiliser (défaut: 'fr')
 */
export function formatCurrency(
  amount: number,
  showSymbol: boolean = true,
  locale: 'fr' | 'ar' | 'en' = 'fr'
): string {
  if (showSymbol) {
    return i18nFormatCurrency(amount, locale)
  }

  // Sans symbole, juste le formatage numérique
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formate une date selon la locale
 * @param date - Date à formater (string ISO ou Date)
 * @param locale - Locale à utiliser (défaut: 'fr')
 */
export function formatDate(
  date: string | Date,
  locale: 'fr' | 'ar' | 'en' = 'fr'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return i18nFormatDate(dateObj, locale)
}

/**
 * Classe les noms CSS de manière conditionnelle
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Tronque un texte à une longueur donnée
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

/**
 * Génère un ID aléatoire
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
