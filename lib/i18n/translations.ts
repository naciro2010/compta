/**
 * Traductions
 * Dictionnaire simple pour MVP
 */

export type TranslationKey = keyof typeof translations.fr;

export const translations = {
  fr: {
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.ledger': 'Grand Livre',
    'nav.invoices': 'Factures',
    'nav.customers': 'Clients',
    'nav.suppliers': 'Fournisseurs',
    'nav.quotes': 'Devis',
    'nav.tax': 'TVA & Fiscalité',
    'nav.bank': 'Trésorerie',
    'nav.financial-statements': 'États Financiers',
    'nav.settings': 'Paramètres',

    // Commun
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.create': 'Créer',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.export': 'Exporter',
    'common.import': 'Importer',
    'common.print': 'Imprimer',
    'common.send': 'Envoyer',
    'common.validate': 'Valider',
    'common.submit': 'Soumettre',
    'common.close': 'Fermer',
    'common.view': 'Voir',
    'common.download': 'Télécharger',
    'common.upload': 'Téléverser',

    // États
    'status.draft': 'Brouillon',
    'status.sent': 'Envoyée',
    'status.paid': 'Payée',
    'status.overdue': 'En retard',
    'status.cancelled': 'Annulée',

    // Factures
    'invoice.title': 'Facture',
    'invoice.number': 'Numéro',
    'invoice.date': 'Date',
    'invoice.dueDate': 'Échéance',
    'invoice.customer': 'Client',
    'invoice.total': 'Total',
    'invoice.totalHT': 'Total HT',
    'invoice.totalTTC': 'Total TTC',
    'invoice.vat': 'TVA',

    // TVA
    'vat.declaration': 'Déclaration TVA',
    'vat.collected': 'TVA Collectée',
    'vat.deductible': 'TVA Déductible',
    'vat.toPay': 'TVA à Payer',
    'vat.credit': 'Crédit de TVA',

    // Messages
    'message.success': 'Opération réussie',
    'message.error': 'Une erreur est survenue',
    'message.confirm': 'Êtes-vous sûr ?',
    'message.noData': 'Aucune donnée disponible',
  },

  // Traductions arabes (structure de base)
  ar: {
    'nav.dashboard': 'لوحة القيادة',
    'nav.ledger': 'دفتر الأستاذ',
    'nav.invoices': 'الفواتير',
    'nav.customers': 'العملاء',
    'nav.suppliers': 'الموردون',
    'nav.quotes': 'عروض الأسعار',
    'nav.tax': 'الضرائب',
    'nav.bank': 'الخزينة',
    'nav.financial-statements': 'القوائم المالية',
    'nav.settings': 'الإعدادات',

    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    // ... (autres traductions AR à compléter)
  },

  // Traductions anglaises (structure de base)
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.ledger': 'General Ledger',
    'nav.invoices': 'Invoices',
    'nav.customers': 'Customers',
    'nav.suppliers': 'Suppliers',
    'nav.quotes': 'Quotes',
    'nav.tax': 'Tax & Compliance',
    'nav.bank': 'Treasury',
    'nav.financial-statements': 'Financial Statements',
    'nav.settings': 'Settings',

    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    // ... (autres traductions EN à compléter)
  },
};

/**
 * Hook simple pour traduction (alternative légère à next-intl)
 */
export function useTranslation(locale: keyof typeof translations = 'fr') {
  const t = (key: TranslationKey): string => {
    return translations[locale][key] || translations.fr[key] || key;
  };

  return { t, locale };
}

/**
 * Formatte un montant selon la locale
 */
export function formatCurrency(amount: number, locale: keyof typeof translations = 'fr'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formatte une date selon la locale
 */
export function formatDate(date: Date, locale: keyof typeof translations = 'fr'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
