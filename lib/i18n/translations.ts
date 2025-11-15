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

    // Page d'accueil
    'home.brand': 'MizanPro',
    'home.tagline': 'Conforme au Plan Comptable Marocain (CGNC)',
    'home.hero.title': 'La comptabilité marocaine',
    'home.hero.titleAccent': 'moderne et intelligente',
    'home.hero.description': 'MizanPro transforme votre gestion comptable avec une solution complète, intuitive et 100% conforme aux normes marocaines. Facturation bilingue, TVA, paie CNSS et analytique multi-sociétés.',
    'home.hero.cta.try': 'Essayer gratuitement',
    'home.hero.cta.pricing': 'Voir les tarifs',
    'home.stats.compliance': '100% Conforme CGNC',
    'home.stats.languages': '3 langues',
    'home.stats.languagesDesc': 'FR/AR/EN trilingue',
    'home.stats.multiCompany': 'Multi-Sociétés',
    'home.stats.cloud': 'Accessible partout',

    // Navigation
    'home.nav.features': 'Fonctionnalités',
    'home.nav.pricing': 'Tarifs',
    'home.nav.start': 'Démarrer',

    // Sections
    'home.features.title': 'Tout ce dont vous avez besoin',
    'home.features.subtitle': 'Une suite complète d\'outils pour gérer votre comptabilité efficacement',

    'home.benefits.title': 'Pourquoi choisir MizanPro ?',
    'home.benefits.subtitle': 'Des avantages concrets pour votre entreprise',

    'home.pricing.title': 'Tarifs simples et transparents',
    'home.pricing.subtitle': 'Choisissez l\'offre adaptée à la taille de votre entreprise',
    'home.pricing.note': 'Paiement sécurisé • Sans engagement • Annulation à tout moment',

    // Features
    'feature.invoicing.title': 'Facturation intelligente',
    'feature.invoicing.desc': 'Créez devis, bons de commande et factures en quelques clics. Numérotation automatique et envoi par email.',
    'feature.invoicing.h1': 'Devis → Facture',
    'feature.invoicing.h2': 'Bilingue FR/AR',
    'feature.invoicing.h3': 'PDF automatique',

    'feature.vat.title': 'Gestion TVA & Fiscalité',
    'feature.vat.desc': 'Calcul automatique de la TVA multi-taux (20%, 14%, 10%, 7%). Export SIMPL prêt pour vos déclarations.',
    'feature.vat.h1': 'Multi-taux TVA',
    'feature.vat.h2': 'Export SIMPL',
    'feature.vat.h3': 'Déclarations',

    'feature.accounting.title': 'Plan comptable CGNC',
    'feature.accounting.desc': 'Plan comptable marocain complet et personnalisable. Classe 1 à 8 incluses avec écritures automatiques.',
    'feature.accounting.h1': 'Classe 1-8',
    'feature.accounting.h2': 'Personnalisable',
    'feature.accounting.h3': 'Écritures auto',

    'feature.dashboard.title': 'Tableaux de bord',
    'feature.dashboard.desc': 'Visualisez vos performances en temps réel. KPIs, graphiques et analyses pour piloter votre activité.',
    'feature.dashboard.h1': 'KPIs temps réel',
    'feature.dashboard.h2': 'Graphiques',
    'feature.dashboard.h3': 'Analytics',

    'feature.payroll.title': 'Paie & CNSS',
    'feature.payroll.desc': 'Calcul automatique de la paie avec cotisations CNSS. Bulletins de paie et déclarations conformes.',
    'feature.payroll.h1': 'Calcul CNSS',
    'feature.payroll.h2': 'Bulletins paie',
    'feature.payroll.h3': 'Conformité',

    'feature.multiCompany.title': 'Multi-sociétés',
    'feature.multiCompany.desc': 'Gérez plusieurs entreprises depuis un seul compte. Consolidation et reporting multi-entités.',
    'feature.multiCompany.h1': 'Multi-entités',
    'feature.multiCompany.h2': 'Consolidation',
    'feature.multiCompany.h3': 'Reporting',

    'feature.sales.title': 'Ventes & Achats',
    'feature.sales.desc': 'Module complet pour gérer vos ventes et achats. Suivi des fournisseurs et clients, paiements, échéances.',
    'feature.sales.h1': 'Suivi complet',
    'feature.sales.h2': 'Échéancier',
    'feature.sales.h3': 'Paiements',

    'feature.statements.title': 'États financiers',
    'feature.statements.desc': 'Générez bilan, compte de résultat et annexes automatiquement. Export Excel et PDF.',
    'feature.statements.h1': 'Bilan',
    'feature.statements.h2': 'CPC',
    'feature.statements.h3': 'Export Excel/PDF',

    'feature.security.title': 'Sécurisé & Fiable',
    'feature.security.desc': 'Vos données sont sécurisées et sauvegardées automatiquement. Architecture moderne et performante.',
    'feature.security.h1': 'Données sécurisées',
    'feature.security.h2': 'Backup auto',
    'feature.security.h3': 'Performance',

    // Benefits
    'benefit.time.title': 'Gagnez du temps',
    'benefit.time.desc': 'Automatisez vos tâches comptables répétitives et concentrez-vous sur votre cœur de métier. Jusqu\'à 70% de temps gagné sur la saisie.',

    'benefit.cost.title': 'Réduisez vos coûts',
    'benefit.cost.desc': 'Solution accessible sans frais de licence élevés. Pas besoin d\'expert-comptable pour les opérations courantes.',

    'benefit.simplicity.title': 'Simplicité d\'utilisation',
    'benefit.simplicity.desc': 'Interface moderne et intuitive. Prenez en main l\'application en quelques minutes, même sans être comptable.',

    'benefit.growth.title': 'Pilotez votre croissance',
    'benefit.growth.desc': 'Tableaux de bord et indicateurs pour prendre les bonnes décisions. Visualisez votre performance en temps réel.',

    'benefit.compliance.title': '100% Conforme',
    'benefit.compliance.desc': 'Respecte totalement le plan comptable marocain (CGNC) et les normes fiscales en vigueur.',

    'benefit.exports.title': 'Exports flexibles',
    'benefit.exports.desc': 'Exportez vos données en Excel, PDF ou CSV pour les partager avec votre comptable ou administration.',

    // Pricing
    'pricing.starter.name': 'Starter',
    'pricing.starter.price': 'Gratuit',
    'pricing.starter.desc': 'Parfait pour démarrer et tester toutes les fonctionnalités',
    'pricing.starter.f1': '1 société',
    'pricing.starter.f2': '50 factures/mois',
    'pricing.starter.f3': 'Plan comptable CGNC',
    'pricing.starter.f4': 'TVA multi-taux',
    'pricing.starter.f5': 'États financiers',
    'pricing.starter.f6': 'Support email',
    'pricing.starter.cta': 'Commencer gratuitement',

    'pricing.pro.name': 'Professionnel',
    'pricing.pro.price': '299 DH',
    'pricing.pro.period': '/mois',
    'pricing.pro.desc': 'Pour les petites et moyennes entreprises en croissance',
    'pricing.pro.f1': '3 sociétés',
    'pricing.pro.f2': 'Factures illimitées',
    'pricing.pro.f3': 'Toutes fonctionnalités Starter',
    'pricing.pro.f4': 'Module Paie & CNSS',
    'pricing.pro.f5': 'Multi-utilisateurs (5)',
    'pricing.pro.f6': 'Export SIMPL',
    'pricing.pro.f7': 'Analytique avancée',
    'pricing.pro.f8': 'Support prioritaire',
    'pricing.pro.badge': 'Plus populaire',
    'pricing.pro.cta': 'Essayer 30 jours gratuits',

    'pricing.enterprise.name': 'Entreprise',
    'pricing.enterprise.price': 'Sur mesure',
    'pricing.enterprise.desc': 'Solution complète pour grandes entreprises et cabinets',
    'pricing.enterprise.f1': 'Sociétés illimitées',
    'pricing.enterprise.f2': 'Toutes fonctionnalités Pro',
    'pricing.enterprise.f3': 'Multi-utilisateurs illimité',
    'pricing.enterprise.f4': 'API & Intégrations',
    'pricing.enterprise.f5': 'Formation personnalisée',
    'pricing.enterprise.f6': 'Support dédié 24/7',
    'pricing.enterprise.f7': 'Hébergement dédié',
    'pricing.enterprise.f8': 'SLA garanti',
    'pricing.enterprise.cta': 'Contactez-nous',

    // CTA Final
    'home.cta.title': 'Prêt à transformer votre comptabilité ?',
    'home.cta.subtitle': 'Rejoignez les entreprises marocaines qui font confiance à MizanPro',
    'home.cta.button1': 'Démarrer gratuitement',
    'home.cta.button2': 'Comparer les offres',
    'home.cta.feature1': 'Essai gratuit',
    'home.cta.feature2': 'Sans carte bancaire',
    'home.cta.feature3': 'Configuration en 5 min',

    // Footer
    'footer.tagline': 'Comptabilité marocaine moderne, simple et conforme CGNC.',
    'footer.product': 'Produit',
    'footer.product.features': 'Fonctionnalités',
    'footer.product.pricing': 'Tarifs',
    'footer.product.demo': 'Démo',
    'footer.resources': 'Ressources',
    'footer.resources.guide': 'Guide',
    'footer.resources.docs': 'Documentation',
    'footer.resources.support': 'Support',
    'footer.company': 'Entreprise',
    'footer.company.about': 'À propos',
    'footer.company.contact': 'Contact',
    'footer.company.terms': 'Conditions',
    'footer.copyright': 'Solution de comptabilité pour entreprises marocaines',
  },

  // Traductions arabes (complètes)
  ar: {
    // Navigation
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

    // Commun
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.create': 'إنشاء',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.export': 'تصدير',
    'common.import': 'استيراد',
    'common.print': 'طباعة',
    'common.send': 'إرسال',
    'common.validate': 'تأكيد',
    'common.submit': 'إرسال',
    'common.close': 'إغلاق',
    'common.view': 'عرض',
    'common.download': 'تحميل',
    'common.upload': 'رفع',

    // États
    'status.draft': 'مسودة',
    'status.sent': 'مرسلة',
    'status.paid': 'مدفوعة',
    'status.overdue': 'متأخرة',
    'status.cancelled': 'ملغاة',

    // Factures
    'invoice.title': 'فاتورة',
    'invoice.number': 'رقم',
    'invoice.date': 'تاريخ',
    'invoice.dueDate': 'تاريخ الاستحقاق',
    'invoice.customer': 'عميل',
    'invoice.total': 'المجموع',
    'invoice.totalHT': 'المجموع بدون ضريبة',
    'invoice.totalTTC': 'المجموع مع الضريبة',
    'invoice.vat': 'ضريبة القيمة المضافة',

    // TVA
    'vat.declaration': 'إقرار ضريبة القيمة المضافة',
    'vat.collected': 'ضريبة القيمة المضافة المحصلة',
    'vat.deductible': 'ضريبة القيمة المضافة القابلة للخصم',
    'vat.toPay': 'ضريبة القيمة المضافة المستحقة',
    'vat.credit': 'رصيد ضريبة القيمة المضافة',

    // Messages
    'message.success': 'تمت العملية بنجاح',
    'message.error': 'حدث خطأ',
    'message.confirm': 'هل أنت متأكد؟',
    'message.noData': 'لا توجد بيانات',

    // Chat Assistant
    'chat.title': 'مساعد MizanPro',
    'chat.subtitle': 'متاح دائمًا لمساعدتك',
    'chat.welcome': 'مرحبا! 👋 أنا مساعدك MizanPro. يمكنني مساعدتك في استخدام التطبيق والإجابة على أسئلتك حول المحاسبة المغربية. كيف يمكنني مساعدتك اليوم؟',
    'chat.placeholder': 'اطرح سؤالك...',
    'chat.disclaimer': 'الإجابات مبنية على التنظيم المغربي (CGNC)',
    'chat.frequentQuestions': 'أسئلة متكررة:',
    'chat.noResults': 'لم أجد إجابة دقيقة لسؤالك. إليك بعض الاقتراحات التي قد تساعدك:',
    'chat.reformulate': 'لا تتردد في إعادة صياغة سؤالك أو الاختيار من هذه الاقتراحات.',
    'chat.relatedTopics': '📚 قد تكون مهتمًا أيضًا بـ:',
    'chat.categoryAll': 'الكل',
    'chat.categoryUsage': 'الاستخدام',
    'chat.categoryLegal': 'قانوني',
    'chat.categoryTax': 'الضرائب',

    // Page d'accueil
    'home.brand': 'ميزان برو',
    'home.tagline': 'متوافق مع المخطط المحاسبي المغربي (CGNC)',
    'home.hero.title': 'المحاسبة المغربية',
    'home.hero.titleAccent': 'الحديثة والذكية',
    'home.hero.description': 'ميزان برو يحول إدارتك المحاسبية بحل شامل وبديهي ومتوافق 100% مع المعايير المغربية. فوترة ثنائية اللغة، ضريبة القيمة المضافة، رواتب الضمان الاجتماعي وتحليلات متعددة الشركات.',
    'home.hero.cta.try': 'جرب مجاناً',
    'home.hero.cta.pricing': 'عرض الأسعار',
    'home.stats.compliance': '100% متوافق CGNC',
    'home.stats.languages': '3 لغات',
    'home.stats.languagesDesc': 'FR/AR/EN ثلاثي اللغات',
    'home.stats.multiCompany': 'متعدد الشركات',
    'home.stats.cloud': 'متاح في كل مكان',

    // Navigation
    'home.nav.features': 'الميزات',
    'home.nav.pricing': 'الأسعار',
    'home.nav.start': 'ابدأ',

    // Sections
    'home.features.title': 'كل ما تحتاجه',
    'home.features.subtitle': 'مجموعة كاملة من الأدوات لإدارة محاسبتك بفعالية',

    'home.benefits.title': 'لماذا تختار ميزان برو؟',
    'home.benefits.subtitle': 'مزايا ملموسة لشركتك',

    'home.pricing.title': 'أسعار بسيطة وشفافة',
    'home.pricing.subtitle': 'اختر العرض المناسب لحجم شركتك',
    'home.pricing.note': 'دفع آمن • بدون التزام • إلغاء في أي وقت',

    // Features
    'feature.invoicing.title': 'فوترة ذكية',
    'feature.invoicing.desc': 'أنشئ عروض أسعار وأوامر شراء وفواتير ببضع نقرات. ترقيم تلقائي وإرسال بالبريد الإلكتروني.',
    'feature.invoicing.h1': 'عرض أسعار ← فاتورة',
    'feature.invoicing.h2': 'ثنائي اللغة FR/AR',
    'feature.invoicing.h3': 'PDF تلقائي',

    'feature.vat.title': 'إدارة ضريبة القيمة المضافة',
    'feature.vat.desc': 'حساب تلقائي لضريبة القيمة المضافة متعددة المعدلات (20%، 14%، 10%، 7%). تصدير SIMPL جاهز للإقرارات.',
    'feature.vat.h1': 'معدلات متعددة',
    'feature.vat.h2': 'تصدير SIMPL',
    'feature.vat.h3': 'الإقرارات',

    'feature.accounting.title': 'المخطط المحاسبي CGNC',
    'feature.accounting.desc': 'مخطط محاسبي مغربي كامل وقابل للتخصيص. الفئات من 1 إلى 8 مع قيود تلقائية.',
    'feature.accounting.h1': 'الفئات 1-8',
    'feature.accounting.h2': 'قابل للتخصيص',
    'feature.accounting.h3': 'قيود تلقائية',

    'feature.dashboard.title': 'لوحات المعلومات',
    'feature.dashboard.desc': 'تصور أدائك في الوقت الفعلي. مؤشرات الأداء والرسوم البيانية والتحليلات لقيادة نشاطك.',
    'feature.dashboard.h1': 'مؤشرات فورية',
    'feature.dashboard.h2': 'رسوم بيانية',
    'feature.dashboard.h3': 'تحليلات',

    'feature.payroll.title': 'الرواتب والضمان الاجتماعي',
    'feature.payroll.desc': 'حساب تلقائي للرواتب مع اشتراكات الضمان الاجتماعي. قسائم رواتب وإقرارات متوافقة.',
    'feature.payroll.h1': 'حساب CNSS',
    'feature.payroll.h2': 'قسائم رواتب',
    'feature.payroll.h3': 'التوافق',

    'feature.multiCompany.title': 'متعدد الشركات',
    'feature.multiCompany.desc': 'إدارة عدة شركات من حساب واحد. توحيد وتقارير متعددة الكيانات.',
    'feature.multiCompany.h1': 'متعدد الكيانات',
    'feature.multiCompany.h2': 'توحيد',
    'feature.multiCompany.h3': 'تقارير',

    'feature.sales.title': 'المبيعات والمشتريات',
    'feature.sales.desc': 'وحدة كاملة لإدارة مبيعاتك ومشترياتك. تتبع الموردين والعملاء والمدفوعات والمواعيد.',
    'feature.sales.h1': 'تتبع كامل',
    'feature.sales.h2': 'جدول استحقاقات',
    'feature.sales.h3': 'المدفوعات',

    'feature.statements.title': 'القوائم المالية',
    'feature.statements.desc': 'توليد الميزانية وحساب النتائج والملاحق تلقائياً. تصدير Excel و PDF.',
    'feature.statements.h1': 'الميزانية',
    'feature.statements.h2': 'حساب النتائج',
    'feature.statements.h3': 'تصدير Excel/PDF',

    'feature.security.title': 'آمن وموثوق',
    'feature.security.desc': 'بياناتك آمنة ومحفوظة تلقائياً. بنية حديثة وعالية الأداء.',
    'feature.security.h1': 'بيانات آمنة',
    'feature.security.h2': 'نسخ احتياطي تلقائي',
    'feature.security.h3': 'أداء عالي',

    // Benefits
    'benefit.time.title': 'وفر الوقت',
    'benefit.time.desc': 'أتمتة مهامك المحاسبية المتكررة وركز على عملك الأساسي. توفير يصل إلى 70% من الوقت في الإدخال.',

    'benefit.cost.title': 'قلل التكاليف',
    'benefit.cost.desc': 'حل ميسور التكلفة بدون رسوم ترخيص عالية. لا حاجة لمحاسب خبير للعمليات الروتينية.',

    'benefit.simplicity.title': 'سهولة الاستخدام',
    'benefit.simplicity.desc': 'واجهة حديثة وبديهية. تعلم التطبيق في دقائق، حتى بدون أن تكون محاسباً.',

    'benefit.growth.title': 'قد نموك',
    'benefit.growth.desc': 'لوحات معلومات ومؤشرات لاتخاذ القرارات الصحيحة. تصور أدائك في الوقت الفعلي.',

    'benefit.compliance.title': '100% متوافق',
    'benefit.compliance.desc': 'يحترم بالكامل المخطط المحاسبي المغربي (CGNC) والمعايير الضريبية المعمول بها.',

    'benefit.exports.title': 'تصدير مرن',
    'benefit.exports.desc': 'صدّر بياناتك في Excel أو PDF أو CSV لمشاركتها مع محاسبك أو الإدارة.',

    // Pricing
    'pricing.starter.name': 'مبتدئ',
    'pricing.starter.price': 'مجاناً',
    'pricing.starter.desc': 'مثالي للبدء واختبار جميع الميزات',
    'pricing.starter.f1': 'شركة واحدة',
    'pricing.starter.f2': '50 فاتورة/شهر',
    'pricing.starter.f3': 'المخطط المحاسبي CGNC',
    'pricing.starter.f4': 'ضريبة قيمة مضافة متعددة المعدلات',
    'pricing.starter.f5': 'القوائم المالية',
    'pricing.starter.f6': 'دعم بالبريد الإلكتروني',
    'pricing.starter.cta': 'ابدأ مجاناً',

    'pricing.pro.name': 'احترافي',
    'pricing.pro.price': '299 DH',
    'pricing.pro.period': '/شهر',
    'pricing.pro.desc': 'للشركات الصغيرة والمتوسطة النامية',
    'pricing.pro.f1': '3 شركات',
    'pricing.pro.f2': 'فواتير غير محدودة',
    'pricing.pro.f3': 'جميع ميزات المبتدئ',
    'pricing.pro.f4': 'وحدة الرواتب والضمان الاجتماعي',
    'pricing.pro.f5': 'متعدد المستخدمين (5)',
    'pricing.pro.f6': 'تصدير SIMPL',
    'pricing.pro.f7': 'تحليلات متقدمة',
    'pricing.pro.f8': 'دعم ذو أولوية',
    'pricing.pro.badge': 'الأكثر شعبية',
    'pricing.pro.cta': 'جرب 30 يوماً مجاناً',

    'pricing.enterprise.name': 'مؤسسة',
    'pricing.enterprise.price': 'حسب الطلب',
    'pricing.enterprise.desc': 'حل شامل للشركات الكبيرة والمكاتب',
    'pricing.enterprise.f1': 'شركات غير محدودة',
    'pricing.enterprise.f2': 'جميع ميزات الاحترافي',
    'pricing.enterprise.f3': 'مستخدمون غير محدودين',
    'pricing.enterprise.f4': 'API وتكاملات',
    'pricing.enterprise.f5': 'تدريب مخصص',
    'pricing.enterprise.f6': 'دعم مخصص 24/7',
    'pricing.enterprise.f7': 'استضافة مخصصة',
    'pricing.enterprise.f8': 'SLA مضمون',
    'pricing.enterprise.cta': 'اتصل بنا',

    // CTA Final
    'home.cta.title': 'جاهز لتحويل محاسبتك؟',
    'home.cta.subtitle': 'انضم إلى الشركات المغربية التي تثق في ميزان برو',
    'home.cta.button1': 'ابدأ مجاناً',
    'home.cta.button2': 'قارن العروض',
    'home.cta.feature1': 'تجربة مجانية',
    'home.cta.feature2': 'بدون بطاقة ائتمان',
    'home.cta.feature3': 'إعداد في 5 دقائق',

    // Footer
    'footer.tagline': 'محاسبة مغربية حديثة، بسيطة ومتوافقة مع CGNC.',
    'footer.product': 'المنتج',
    'footer.product.features': 'الميزات',
    'footer.product.pricing': 'الأسعار',
    'footer.product.demo': 'تجربة',
    'footer.resources': 'الموارد',
    'footer.resources.guide': 'الدليل',
    'footer.resources.docs': 'التوثيق',
    'footer.resources.support': 'الدعم',
    'footer.company': 'الشركة',
    'footer.company.about': 'عن الشركة',
    'footer.company.contact': 'اتصل',
    'footer.company.terms': 'الشروط',
    'footer.copyright': 'حل محاسبة للشركات المغربية',
  },

  // Traductions anglaises (complètes)
  en: {
    // Navigation
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

    // Commun
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.print': 'Print',
    'common.send': 'Send',
    'common.validate': 'Validate',
    'common.submit': 'Submit',
    'common.close': 'Close',
    'common.view': 'View',
    'common.download': 'Download',
    'common.upload': 'Upload',

    // États
    'status.draft': 'Draft',
    'status.sent': 'Sent',
    'status.paid': 'Paid',
    'status.overdue': 'Overdue',
    'status.cancelled': 'Cancelled',

    // Factures
    'invoice.title': 'Invoice',
    'invoice.number': 'Number',
    'invoice.date': 'Date',
    'invoice.dueDate': 'Due Date',
    'invoice.customer': 'Customer',
    'invoice.total': 'Total',
    'invoice.totalHT': 'Subtotal',
    'invoice.totalTTC': 'Total (incl. VAT)',
    'invoice.vat': 'VAT',

    // TVA
    'vat.declaration': 'VAT Declaration',
    'vat.collected': 'VAT Collected',
    'vat.deductible': 'Deductible VAT',
    'vat.toPay': 'VAT Payable',
    'vat.credit': 'VAT Credit',

    // Messages
    'message.success': 'Operation successful',
    'message.error': 'An error occurred',
    'message.confirm': 'Are you sure?',
    'message.noData': 'No data available',

    // Chat Assistant
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

    // Home page
    'home.brand': 'MizanPro',
    'home.tagline': 'Compliant with Moroccan Accounting Standards (CGNC)',
    'home.hero.title': 'Moroccan accounting',
    'home.hero.titleAccent': 'modern and smart',
    'home.hero.description': 'MizanPro transforms your accounting management with a complete, intuitive solution that is 100% compliant with Moroccan standards. Bilingual invoicing, VAT, CNSS payroll, and multi-company analytics.',
    'home.hero.cta.try': 'Try for free',
    'home.hero.cta.pricing': 'View pricing',
    'home.stats.compliance': '100% CGNC Compliant',
    'home.stats.languages': '3 languages',
    'home.stats.languagesDesc': 'FR/AR/EN trilingual',
    'home.stats.multiCompany': 'Multi-Company',
    'home.stats.cloud': 'Accessible everywhere',

    // Navigation
    'home.nav.features': 'Features',
    'home.nav.pricing': 'Pricing',
    'home.nav.start': 'Get Started',

    // Sections
    'home.features.title': 'Everything you need',
    'home.features.subtitle': 'A complete suite of tools to manage your accounting efficiently',

    'home.benefits.title': 'Why choose MizanPro?',
    'home.benefits.subtitle': 'Concrete benefits for your business',

    'home.pricing.title': 'Simple and transparent pricing',
    'home.pricing.subtitle': 'Choose the plan that fits your company size',
    'home.pricing.note': 'Secure payment • No commitment • Cancel anytime',

    // Features
    'feature.invoicing.title': 'Smart Invoicing',
    'feature.invoicing.desc': 'Create quotes, purchase orders and invoices in a few clicks. Automatic numbering and email sending.',
    'feature.invoicing.h1': 'Quote → Invoice',
    'feature.invoicing.h2': 'Bilingual FR/AR',
    'feature.invoicing.h3': 'Auto PDF',

    'feature.vat.title': 'VAT & Tax Management',
    'feature.vat.desc': 'Automatic calculation of multi-rate VAT (20%, 14%, 10%, 7%). SIMPL export ready for your declarations.',
    'feature.vat.h1': 'Multi-rate VAT',
    'feature.vat.h2': 'SIMPL Export',
    'feature.vat.h3': 'Declarations',

    'feature.accounting.title': 'CGNC Chart of Accounts',
    'feature.accounting.desc': 'Complete and customizable Moroccan chart of accounts. Classes 1 to 8 included with automatic entries.',
    'feature.accounting.h1': 'Classes 1-8',
    'feature.accounting.h2': 'Customizable',
    'feature.accounting.h3': 'Auto entries',

    'feature.dashboard.title': 'Dashboards',
    'feature.dashboard.desc': 'Visualize your performance in real-time. KPIs, charts and analytics to drive your business.',
    'feature.dashboard.h1': 'Real-time KPIs',
    'feature.dashboard.h2': 'Charts',
    'feature.dashboard.h3': 'Analytics',

    'feature.payroll.title': 'Payroll & CNSS',
    'feature.payroll.desc': 'Automatic payroll calculation with CNSS contributions. Compliant payslips and declarations.',
    'feature.payroll.h1': 'CNSS Calculation',
    'feature.payroll.h2': 'Payslips',
    'feature.payroll.h3': 'Compliance',

    'feature.multiCompany.title': 'Multi-company',
    'feature.multiCompany.desc': 'Manage multiple companies from a single account. Consolidation and multi-entity reporting.',
    'feature.multiCompany.h1': 'Multi-entity',
    'feature.multiCompany.h2': 'Consolidation',
    'feature.multiCompany.h3': 'Reporting',

    'feature.sales.title': 'Sales & Purchases',
    'feature.sales.desc': 'Complete module to manage your sales and purchases. Track suppliers, customers, payments, and due dates.',
    'feature.sales.h1': 'Complete tracking',
    'feature.sales.h2': 'Payment schedule',
    'feature.sales.h3': 'Payments',

    'feature.statements.title': 'Financial Statements',
    'feature.statements.desc': 'Generate balance sheet, income statement and annexes automatically. Excel and PDF export.',
    'feature.statements.h1': 'Balance sheet',
    'feature.statements.h2': 'Income statement',
    'feature.statements.h3': 'Excel/PDF Export',

    'feature.security.title': 'Secure & Reliable',
    'feature.security.desc': 'Your data is secured and backed up automatically. Modern and high-performance architecture.',
    'feature.security.h1': 'Secure data',
    'feature.security.h2': 'Auto backup',
    'feature.security.h3': 'High performance',

    // Benefits
    'benefit.time.title': 'Save time',
    'benefit.time.desc': 'Automate your repetitive accounting tasks and focus on your core business. Save up to 70% of time on data entry.',

    'benefit.cost.title': 'Reduce costs',
    'benefit.cost.desc': 'Affordable solution without high licensing fees. No need for an accountant for routine operations.',

    'benefit.simplicity.title': 'Ease of use',
    'benefit.simplicity.desc': 'Modern and intuitive interface. Get started in minutes, even if you\'re not an accountant.',

    'benefit.growth.title': 'Drive your growth',
    'benefit.growth.desc': 'Dashboards and indicators to make the right decisions. Visualize your performance in real-time.',

    'benefit.compliance.title': '100% Compliant',
    'benefit.compliance.desc': 'Fully complies with the Moroccan chart of accounts (CGNC) and current tax regulations.',

    'benefit.exports.title': 'Flexible exports',
    'benefit.exports.desc': 'Export your data to Excel, PDF or CSV to share with your accountant or administration.',

    // Pricing
    'pricing.starter.name': 'Starter',
    'pricing.starter.price': 'Free',
    'pricing.starter.desc': 'Perfect to get started and test all features',
    'pricing.starter.f1': '1 company',
    'pricing.starter.f2': '50 invoices/month',
    'pricing.starter.f3': 'CGNC Chart of Accounts',
    'pricing.starter.f4': 'Multi-rate VAT',
    'pricing.starter.f5': 'Financial statements',
    'pricing.starter.f6': 'Email support',
    'pricing.starter.cta': 'Start for free',

    'pricing.pro.name': 'Professional',
    'pricing.pro.price': '299 DH',
    'pricing.pro.period': '/month',
    'pricing.pro.desc': 'For growing small and medium businesses',
    'pricing.pro.f1': '3 companies',
    'pricing.pro.f2': 'Unlimited invoices',
    'pricing.pro.f3': 'All Starter features',
    'pricing.pro.f4': 'Payroll & CNSS module',
    'pricing.pro.f5': 'Multi-users (5)',
    'pricing.pro.f6': 'SIMPL Export',
    'pricing.pro.f7': 'Advanced analytics',
    'pricing.pro.f8': 'Priority support',
    'pricing.pro.badge': 'Most popular',
    'pricing.pro.cta': 'Try 30 days free',

    'pricing.enterprise.name': 'Enterprise',
    'pricing.enterprise.price': 'Custom',
    'pricing.enterprise.desc': 'Complete solution for large companies and firms',
    'pricing.enterprise.f1': 'Unlimited companies',
    'pricing.enterprise.f2': 'All Pro features',
    'pricing.enterprise.f3': 'Unlimited users',
    'pricing.enterprise.f4': 'API & Integrations',
    'pricing.enterprise.f5': 'Personalized training',
    'pricing.enterprise.f6': 'Dedicated 24/7 support',
    'pricing.enterprise.f7': 'Dedicated hosting',
    'pricing.enterprise.f8': 'Guaranteed SLA',
    'pricing.enterprise.cta': 'Contact us',

    // CTA Final
    'home.cta.title': 'Ready to transform your accounting?',
    'home.cta.subtitle': 'Join Moroccan companies that trust MizanPro',
    'home.cta.button1': 'Start for free',
    'home.cta.button2': 'Compare plans',
    'home.cta.feature1': 'Free trial',
    'home.cta.feature2': 'No credit card',
    'home.cta.feature3': '5-minute setup',

    // Footer
    'footer.tagline': 'Modern, simple and CGNC-compliant Moroccan accounting.',
    'footer.product': 'Product',
    'footer.product.features': 'Features',
    'footer.product.pricing': 'Pricing',
    'footer.product.demo': 'Demo',
    'footer.resources': 'Resources',
    'footer.resources.guide': 'Guide',
    'footer.resources.docs': 'Documentation',
    'footer.resources.support': 'Support',
    'footer.company': 'Company',
    'footer.company.about': 'About',
    'footer.company.contact': 'Contact',
    'footer.company.terms': 'Terms',
    'footer.copyright': 'Accounting solution for Moroccan businesses',
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
