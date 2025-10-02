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
