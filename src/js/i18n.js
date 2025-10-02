const LANG_KEY = 'landing.lang';

const getDefaultLang = () => {
  const stored = localStorage.getItem(LANG_KEY);
  if (stored) return stored;
  const navigatorLang = (navigator.language || 'fr').slice(0, 2);
  return navigatorLang === 'ar' ? 'ar' : 'fr';
};

export const createI18n = (content) => ({
  lang: 'fr',
  dir: 'ltr',
  init() {
    this.setLanguage(getDefaultLang());
  },
  setLanguage(lang) {
    if (!content[lang]) lang = 'fr';
    this.lang = lang;
    this.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', this.dir);
  },
  t(path) {
    const source = content[this.lang];
    if (!path) return undefined;
    const segments = Array.isArray(path) ? path : path.split('.');
    const value = segments.reduce((acc, key) => (acc ? acc[key] : undefined), source);
    return value ?? segments[segments.length - 1];
  },
});
