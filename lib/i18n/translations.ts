/**
 * Traductions
 * Dictionnaire simple pour MVP
 */

export type TranslationKey = keyof typeof translations.fr;

export const translations = {
  fr: {
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.sales': 'Ventes',
    'nav.invoices': 'Factures',
    'nav.invoices.overdue': 'Factures en retard',
    'nav.quotes': 'Devis',
    'nav.purchases': 'Achats',
    'nav.customers': 'Clients',
    'nav.suppliers': 'Fournisseurs',
    'nav.bank': 'Banque',
    'nav.ledger': 'Grand livre',
    'nav.financial-statements': 'États de synthèse',
    'nav.tax': 'TVA',
    'nav.payroll': 'Paie',
    'nav.guide': 'Guide',
    'nav.contact': 'Contact',
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

    // Chat Assistant
    'chat.title': 'Assistant MizanPro',
    'chat.subtitle': 'Toujours disponible pour vous aider',
    'chat.welcome': 'Bonjour ! 👋 Je suis votre assistant MizanPro. Je peux vous aider avec l\'utilisation de l\'application et répondre à vos questions sur la comptabilité marocaine. Comment puis-je vous aider aujourd\'hui ?',
    'chat.placeholder': 'Posez votre question...',
    'chat.disclaimer': 'Les réponses sont basées sur la réglementation marocaine (CGNC)',
    'chat.frequentQuestions': 'Questions fréquentes :',
    'chat.noResults': 'Je n\'ai pas trouvé de réponse précise à votre question. Voici quelques suggestions qui pourraient vous aider :',
    'chat.reformulate': 'N\'hésitez pas à reformuler votre question ou à choisir parmi ces suggestions.',
    'chat.relatedTopics': '📚 Vous pourriez aussi être intéressé par :',
    'chat.categoryAll': 'Tout',
    'chat.categoryUsage': 'Utilisation',
    'chat.categoryLegal': 'Légal',
    'chat.categoryTax': 'TVA',
  },

  // Traductions arabes (structure de base)
  ar: {
    'nav.dashboard': 'لوحة القيادة',
    'nav.sales': 'المبيعات',
    'nav.invoices': 'الفواتير',
    'nav.invoices.overdue': 'الفواتير المتأخرة',
    'nav.quotes': 'عروض الأسعار',
    'nav.purchases': 'المشتريات',
    'nav.customers': 'العملاء',
    'nav.suppliers': 'الموردون',
    'nav.bank': 'البنك',
    'nav.ledger': 'دفتر الأستاذ',
    'nav.financial-statements': 'القوائم المالية',
    'nav.tax': 'الضرائب',
    'nav.payroll': 'الرواتب',
    'nav.guide': 'الدليل',
    'nav.contact': 'اتصل بنا',
    'nav.settings': 'الإعدادات',

    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',

    'chat.title': 'مساعد MizanPro',
    'chat.subtitle': 'متاح دائمًا لمساعدتك',
    'chat.welcome': 'مرحبا! 👋 أنا مساعدك MizanPro. يمكنني مساعدتك في استخدام التطبيق والإجابة على أسئلتك حول المحاسبة المغربية. كيف يمكنني مساعدتك اليوم؟',
    'chat.placeholder': 'اطرح سؤالك...',
    'chat.disclaimer': 'الإجابات مبنية على التنظيم المغربي (CGNC)',
    'chat.frequentQuestions': 'أسئلة متكررة:',
    'chat.categoryAll': 'الكل',
    'chat.categoryUsage': 'الاستخدام',
    'chat.categoryLegal': 'قانوني',
    'chat.categoryTax': 'الضرائب',
    // ... (autres traductions AR à compléter)
  },

  // Traductions anglaises (structure de base)
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.sales': 'Sales',
    'nav.invoices': 'Invoices',
    'nav.invoices.overdue': 'Overdue Invoices',
    'nav.quotes': 'Quotes',
    'nav.purchases': 'Purchases',
    'nav.customers': 'Customers',
    'nav.suppliers': 'Suppliers',
    'nav.bank': 'Bank',
    'nav.ledger': 'General Ledger',
    'nav.financial-statements': 'Financial Statements',
    'nav.tax': 'Tax',
    'nav.payroll': 'Payroll',
    'nav.guide': 'Guide',
    'nav.contact': 'Contact',
    'nav.settings': 'Settings',

    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',

    'chat.title': 'MizanPro Assistant',
    'chat.subtitle': 'Always available to help you',
    'chat.welcome': 'Hello! 👋 I\'m your MizanPro assistant. I can help you with using the application and answer your questions about Moroccan accounting. How can I help you today?',
    'chat.placeholder': 'Ask your question...',
    'chat.disclaimer': 'Answers are based on Moroccan regulations (CGNC)',
    'chat.frequentQuestions': 'Frequent questions:',
    'chat.noResults': 'I couldn\'t find a precise answer to your question. Here are some suggestions that might help:',
    'chat.reformulate': 'Feel free to rephrase your question or choose from these suggestions.',
    'chat.relatedTopics': '📚 You might also be interested in:',
    'chat.categoryAll': 'All',
    'chat.categoryUsage': 'Usage',
    'chat.categoryLegal': 'Legal',
    'chat.categoryTax': 'Tax',
    // ... (autres traductions EN à compléter)
  },
};

/**
 * Hook simple pour traduction (alternative légère à next-intl)
 * Utilise le LocaleProvider pour obtenir la locale actuelle
 */
export function useTranslation(locale: keyof typeof translations = 'fr') {
  const t = (key: TranslationKey): string => {
    const localeTranslations = translations[locale] as Record<string, string>;
    const frTranslations = translations.fr;
    return localeTranslations[key] || frTranslations[key] || key;
  };

  return { t, locale };
}

/**
 * Hook optimisé qui utilise automatiquement le LocaleContext
 * À utiliser dans les composants clients avec LocaleProvider
 */
import { useLocale } from './LocaleProvider';

export function useT() {
  const { locale } = useLocale();

  const t = (key: TranslationKey): string => {
    const localeTranslations = translations[locale] as Record<string, string>;
    const frTranslations = translations.fr;
    return localeTranslations[key] || frTranslations[key] || key;
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
