const FR = {
  landing: {
    heroTitle: "Comptabilité marocaine, simple et fluide",
    heroSubtitle: "POC conforme au CGNC (démo), TVA/IS (export factice), facturation, rapprochement, paie CNSS (mock) — FR/AR.",
    ctaDemo: "Ouvrir la démo", ctaBrochure: "Télécharger la brochure",
    benefitsTitle: "Pensé pour le contexte marocain",
    benefits: ["Conforme CGNC (démo)","TVA & IS : exports POC","Factures FR/AR","Rapprochement bancaire","Lettrage","Paie CNSS (mock)"],
    faqTitle: "FAQ",
    faq: [
      {q:"C’est un vrai produit ?", a:"Non. C’est un POC statique avec données factices et stockage local."},
      {q:"Mes données ?", a:"Rien n’est envoyé. Tout reste dans votre navigateur (LocalStorage)."},
      {q:"Compatibilité ?", a:"Chrome/Edge/Firefox récents."}
    ]
  },
  settings: {
    title: "Paramètres & Onboarding",
    subtitle: "Configurez les informations société, TVA et paie fictive utilisées dans le POC.",
    companyCard: {
      title: "Société",
      subtitle: "Identité légale, TVA et préférences de langue.",
      reset: "Réinitialiser",
      labels: {
        name: "Raison sociale",
        city: "Ville",
        ice: "ICE",
        if: "IF",
        rc: "RC",
        tp: "TP",
        currency: "Devise",
        language: "Langue défaut",
        theme: "Thème",
        tvaPeriod: "Périodicité TVA",
        tvaRates: "Taux TVA disponibles"
      },
      noRate: "Aucun taux défini",
      actions: {
        addRate: "Ajouter un taux",
        removeRate: "Supprimer",
        cancel: "Annuler",
        save: "Enregistrer"
      },
      errors: {
        ice: "ICE doit comporter exactement 15 chiffres.",
        flex: "{field} doit contenir 6 à 20 caractères (alphanum + -)."
      }
    },
    payrollCard: {
      title: "Paie (POC)",
      subtitle: "Taux et règles utilisés pour les bulletins fictifs.",
      goToPayroll: "Aller à la paie",
      labels: {
        txCnssSal: "Taux CNSS Salarié (%)",
        txCnssEmp: "Taux CNSS Employeur (%)",
        txIR: "Taux IR Forfait (%)",
        rounding: "Arrondi (MAD)",
        payDateRule: "Date de paie"
      },
      note: "Les taux CNSS & IR sont fictifs et servent uniquement à illustrer le calcul. Aucun respect des barèmes officiels.",
      action: "Sauvegarder",
      messageSaved: "Paramètres enregistrés",
      payDateOptions: {
        lastDay: "Dernier jour du mois"
      }
    }
  },
  payroll: {
    header: {
      badge: "Module Paie",
      title: "Bulletins & CNSS (mock)",
      subtitle: "Gérez une base fictive d'employés, calculez les bulletins, exportez CSV et imprimez les bulletins.",
      settingsLink: "Paramètres paie",
      currency: "Devise"
    },
    tabs: {
      employees: "Employés",
      runs: "Traitements",
      exports: "Exports"
    },
    employees: {
      title: "Employés",
      subtitle: "Base fictive conservée dans votre navigateur.",
      create: "Nouvel employé",
      actions: {
        edit: "Modifier",
        delete: "Supprimer"
      },
      table: {
        name: "Nom",
        role: "Poste",
        cnss: "CNSS",
        salary: "Salaire base",
        actions: "Actions",
        empty: "Aucun employé, ajoutez-en un pour commencer."
      },
      modal: {
        createTitle: "Nouvel employé",
        editTitle: "Modifier un employé",
        labels: {
          name: "Nom",
          role: "Poste",
          cnss: "Matricule CNSS",
          salary: "Salaire base",
          iban: "IBAN (mock)",
          primes: "Primes",
          retenues: "Retenues"
        },
        addPrime: "Ajouter",
        addRetenue: "Ajouter",
        remove: "Retirer",
        noPrime: "Aucune prime définie.",
        noRetenue: "Aucune retenue complémentaire.",
        cancel: "Annuler",
        save: "Enregistrer"
      }
    },
    runs: {
      title: "Traitements mensuels",
      subtitle: "Générez un brouillon puis validez pour poster en comptabilité.",
      generate: "Générer brouillon",
      recompute: "Recalculer",
      emptyRuns: "Aucun traitement généré pour le moment.",
      panelTitle: "Bulletins",
      periodLabel: "Période",
      statusLabel: "Statut",
      actions: {
        validate: "Valider",
        markPaid: "Marquer payé",
        print: "Imprimer bulletins",
        exportCnss: "Exporter CNSS CSV"
      },
      table: {
        employee: "Employé",
        brut: "Brut",
        cnss: "CNSS (Sal+Emp)",
        ir: "IR",
        net: "Net",
        empty: "Aucun bulletin généré.",
        total: "Total"
      }
    },
    exports: {
      title: "Exports",
      subtitle: "Téléchargez les fichiers CNSS fictifs pour un run sélectionné.",
      action: "Exporter CNSS CSV",
      hint: "Le CSV respecte la structure CNSS simplifiée : matricule, nom, période, brut, base CNSS, taux, retenues et net."
    },
    validation: {
      name: "Nom obligatoire",
      matricule: "Matricule CNSS : alphanum + tirets",
      salary: "Salaire de base invalide",
      needEmployee: "Ajoutez au moins un employé avant de générer.",
      confirmDelete: "Supprimer cet employé ?"
    }
  },
  sales: {
    header: {
      title: "Module ventes Maroc",
      subtitle: "Cycle Devis → Commande → BL → Facture → Avoir, TVA débit ou encaissements."
    },
    tabs: {
      quotes: "Devis",
      orders: "Commandes",
      deliveries: "BL",
      invoices: "Factures",
      credits: "Avoirs",
      customers: "Clients",
      reminders: "Relances"
    },
    actions: {
      newQuote: "Nouveau devis",
      newOrder: "Nouvelle commande",
      newDelivery: "Nouveau BL",
      newInvoice: "Nouvelle facture",
      newCredit: "Nouvel avoir",
      edit: "Modifier",
      confirm: "Confirmer",
      transform: "Transformer",
      print: "Imprimer",
      pay: "Enregistrer paiement",
      reminder: "Plan de relances",
      refund: "Créer un avoir",
      cancel: "Annuler",
      save: "Enregistrer"
    },
    labels: {
      customer: "Client",
      issue: "Émission",
      dueDate: "Échéance",
      vatMode: "Mode TVA",
      vatOnCash: "Sur encaissement",
      vatOnDebit: "Sur débits",
      status: "Statut",
      actions: "Actions"
    },
    totals: {
      ht: "HT",
      vat: "TVA",
      ttc: "TTC",
      due: "Reste à payer"
    },
    statuses: {
      DRAFT: "Brouillon",
      CONFIRMED: "Confirmé",
      DELIVERED: "Livré",
      INVOICED: "Facturé",
      PAID: "Payée",
      PARTIAL: "Partielle",
      CANCELLED: "Annulée"
    },
    legal: {
      issuer: "Émetteur",
      ice: "ICE",
      if: "IF",
      rc: "RC",
      footer: "POC démo – données factices – non conforme production."
    }
  },
  customers: {
    title: "Clients",
    new: "Nouveau client",
    form: {
      name: "Nom",
      ice: "ICE",
      if: "IF",
      rc: "RC",
      address: "Adresse",
      city: "Ville",
      email: "Email",
      phone: "Téléphone",
      terms: "Conditions de paiement",
      credit: "Limite de crédit"
    },
    actions: {
      edit: "Modifier",
      delete: "Supprimer",
      save: "Enregistrer"
    },
    deleteConfirm: "Supprimer ce client ?"
  },
  reminders: {
    title: "Relances",
    plan: "Plan de relances",
    sendMark: "Marquer envoyée",
    export: "Exporter CSV"
  }
}

const AR = {
  landing: {
    heroTitle: "محاسبة مغربية سهلة وسلسة",
    heroSubtitle: "نموذج تجريبي مطابق لـ CGNC (عرض)، TVA/IS (ملفات تمثيلية)، فواتير، مصالحة، أجور CNSS — فر/ع.",
    ctaDemo: "افتح العرض التجريبي", ctaBrochure: "حمّل الكتيّب",
    benefitsTitle: "ملائم للسياق المغربي",
    benefits: ["مطابقة CGNC (تجريبي)","TVA وIS: ملفات تمثيلية","فواتير فر/ع","مصادقة بنكية","مطابقة","أجور CNSS (تمثيلي)"],
    faqTitle: "الأسئلة الشائعة",
    faq: [
      {q:"هل هذا منتج نهائي؟", a:"لا. هذا نموذج تجريبي ببيانات وهمية وتخزين محلي."},
      {q:"البيانات؟", a:"لا يتم إرسال أي شيء. كل شيء يبقى في المتصفح."},
      {q:"التوافق؟", a:"Chrome/Edge/Firefox الحديثة."}
    ]
  },
  settings: {
    title: "الإعدادات وبدء التشغيل",
    subtitle: "اضبط معلومات الشركة والضريبة والرواتب التجريبية المستعملة في النموذج.",
    companyCard: {
      title: "الشركة",
      subtitle: "الهوية القانونية والضريبة واللغة.",
      reset: "إعادة تعيين",
      labels: {
        name: "الاسم القانوني",
        city: "المدينة",
        ice: "ICE",
        if: "IF",
        rc: "RC",
        tp: "TP",
        currency: "العملة",
        language: "اللغة الافتراضية",
        theme: "السمة",
        tvaPeriod: "دورية الضريبة",
        tvaRates: "نسب TVA المتاحة"
      },
      noRate: "لا توجد نسب محددة",
      actions: {
        addRate: "إضافة نسبة",
        removeRate: "حذف",
        cancel: "إلغاء",
        save: "حفظ"
      },
      errors: {
        ice: "يجب أن يحتوي ICE على 15 رقماً.",
        flex: "{field} يجب أن يتضمن 6 إلى 20 حرفاً (أرقام/حروف و-)."
      }
    },
    payrollCard: {
      title: "الرواتب (تجريبي)",
      subtitle: "النسب والقواعد المستعملة في نشرات الرواتب الوهمية.",
      goToPayroll: "الانتقال إلى الرواتب",
      labels: {
        txCnssSal: "نسبة CNSS الأجير (%)",
        txCnssEmp: "نسبة CNSS المشغل (%)",
        txIR: "نسبة IR الثابتة (%)",
        rounding: "التقريب (درهم)",
        payDateRule: "تاريخ الأداء"
      },
      note: "النسب المعروضة تجريبية فقط ولا تمثل النظام القانوني الرسمي.",
      action: "حفظ",
      messageSaved: "تم حفظ الإعدادات",
      payDateOptions: {
        lastDay: "آخر يوم في الشهر"
      }
    }
  },
  payroll: {
    header: {
      badge: "وحدة الرواتب",
      title: "نشرات الرواتب وCNSS (تمثيلي)",
      subtitle: "أدر قائمة الموظفين الوهمية، احسب النشرات وصدّر ملفات CSV واطبع المستندات.",
      settingsLink: "إعدادات الرواتب",
      currency: "العملة"
    },
    tabs: {
      employees: "الموظفون",
      runs: "المعالجة",
      exports: "الصادرات"
    },
    employees: {
      title: "الموظفون",
      subtitle: "بيانات تجريبية محفوظة في متصفحك.",
      create: "موظف جديد",
      actions: {
        edit: "تعديل",
        delete: "حذف"
      },
      table: {
        name: "الاسم",
        role: "المنصب",
        cnss: "CNSS",
        salary: "الأجر الأساسي",
        actions: "إجراءات",
        empty: "لا يوجد موظفون، أضف واحداً للبدء."
      },
      modal: {
        createTitle: "موظف جديد",
        editTitle: "تعديل موظف",
        labels: {
          name: "الاسم",
          role: "المنصب",
          cnss: "رقم CNSS",
          salary: "الأجر الأساسي",
          iban: "IBAN (اختياري)",
          primes: "المنح",
          retenues: "الاقتطاعات"
        },
        addPrime: "إضافة",
        addRetenue: "إضافة",
        remove: "حذف",
        noPrime: "لا منح محددة.",
        noRetenue: "لا اقتطاعات إضافية.",
        cancel: "إلغاء",
        save: "حفظ"
      }
    },
    runs: {
      title: "معالجات شهرية",
      subtitle: "أنشئ مسودة ثم صادق عليها لإرسالها للمحاسبة.",
      generate: "إنشاء مسودة",
      recompute: "إعادة الحساب",
      emptyRuns: "لا توجد معالجة بعد.",
      panelTitle: "نشرات",
      periodLabel: "الفترة",
      statusLabel: "الحالة",
      actions: {
        validate: "تصديق",
        markPaid: "وضع كمدفوع",
        print: "طباعة النشرات",
        exportCnss: "تصدير CNSS CSV"
      },
      table: {
        employee: "الموظف",
        brut: "إجمالي",
        cnss: "CNSS (أجير+مشغل)",
        ir: "IR",
        net: "الصافي",
        empty: "لا توجد نشرات محسوبة.",
        total: "المجموع"
      }
    },
    exports: {
      title: "الصادرات",
      subtitle: "حمّل ملفات CNSS التجريبية للمعالجة المختارة.",
      action: "تصدير CNSS CSV",
      hint: "الملف يحتوي على الأعمدة: رقم الانخراط، الاسم، الفترة، الإجمالي، قاعدة CNSS، النسب، الاقتطاعات، الصافي."
    },
    validation: {
      name: "الاسم إجباري",
      matricule: "رقم CNSS يجب أن يكون حروفاً/أرقاماً أو شرطات",
      salary: "أجر أساسي غير صالح",
      needEmployee: "أضف موظفاً واحداً على الأقل للمتابعة.",
      confirmDelete: "هل تريد حذف هذا الموظف؟"
    }
  },
  sales: {
    header: {
      title: "وحدة المبيعات المغربية",
      subtitle: "دورة العرض → الطلبية → سند التسليم → الفاتورة → الإشعار الدائن مع TVA على الخصم أو التحصيل."
    },
    tabs: {
      quotes: "عروض أسعار",
      orders: "أوامر شراء",
      deliveries: "سندات تسليم",
      invoices: "فواتير",
      credits: "إشعارات دائنة",
      customers: "الزبائن",
      reminders: "التذكيرات"
    },
    actions: {
      newQuote: "عرض جديد",
      newOrder: "طلبية جديدة",
      newDelivery: "سند تسليم جديد",
      newInvoice: "فاتورة جديدة",
      newCredit: "إشعار دائن جديد",
      edit: "تعديل",
      confirm: "تأكيد",
      transform: "تحويل",
      print: "طباعة",
      pay: "تسجيل دفع",
      reminder: "خطة تذكير",
      refund: "إنشاء إشعار دائن",
      cancel: "إلغاء",
      save: "حفظ"
    },
    labels: {
      customer: "الزبون",
      issue: "تاريخ الإصدار",
      dueDate: "تاريخ الاستحقاق",
      vatMode: "وضع TVA",
      vatOnCash: "على التحصيل",
      vatOnDebit: "على الفوترة",
      status: "الحالة",
      actions: "إجراءات"
    },
    totals: {
      ht: "بدون ضريبة",
      vat: "الضريبة",
      ttc: "شامل الضريبة",
      due: "المبلغ المتبقي"
    },
    statuses: {
      DRAFT: "مسودة",
      CONFIRMED: "مؤكدة",
      DELIVERED: "مسلمة",
      INVOICED: "مفوترة",
      PAID: "مدفوعة",
      PARTIAL: "مدفوعة جزئياً",
      CANCELLED: "ملغاة"
    },
    legal: {
      issuer: "المُصدر",
      ice: "ICE",
      if: "IF",
      rc: "RC",
      footer: "عرض توضيحي – بيانات وهمية – غير صالح للإنتاج."
    }
  },
  customers: {
    title: "الزبائن",
    new: "زبون جديد",
    form: {
      name: "الاسم",
      ice: "ICE",
      if: "IF",
      rc: "RC",
      address: "العنوان",
      city: "المدينة",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      terms: "شروط الأداء",
      credit: "حد الائتمان"
    },
    actions: {
      edit: "تعديل",
      delete: "حذف",
      save: "حفظ"
    },
    deleteConfirm: "هل تريد حذف هذا الزبون؟"
  },
  reminders: {
    title: "التذكيرات",
    plan: "خطة التذكير",
    sendMark: "وضع كمرسلة",
    export: "تصدير CSV"
  }
}

export const i18nStore = {
  lang: 'fr',
  dict: { fr: FR, ar: AR },
  init(lang){ this.lang = lang || 'fr'; this.applyDir() },
  toggle(){ this.lang = this.lang==='fr'?'ar':'fr'; this.applyDir() },
  t(path){
    return path.split('.').reduce((o,k)=>o?.[k], this.dict[this.lang]) ?? path
  },
  applyDir(){
    document.documentElement.setAttribute('lang', this.lang)
    document.documentElement.setAttribute('dir', this.lang==='ar'?'rtl':'ltr')
  }
}
