const CONTACTS_KEY = 'landing.contacts';
const STATS_KEY = 'landing.stats';
const LOCALE_KEY = 'landing.locale';

const elements = {
  langSwitch: document.getElementById('lang-switch'),
  benefitsList: document.getElementById('benefits-list'),
  complianceList: document.getElementById('compliance-list'),
  featuresGrid: document.getElementById('features-grid'),
  audienceGrid: document.getElementById('audience-grid'),
  testimonials: document.getElementById('testimonials'),
  faqList: document.getElementById('faq-list'),
  contactForm: document.getElementById('contact-form'),
  toastContainer: document.getElementById('toast-container'),
  brochureBtn: document.getElementById('brochure'),
  exportContacts: document.getElementById('export-contacts'),
};

const linksCta = document.querySelectorAll('[data-action="cta-demo"]');

const translations = { fr: null, ar: null };
let currentLocale = localStorage.getItem(LOCALE_KEY) || 'fr';

function sanitize(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getDict(locale) {
  const dict = translations[locale];
  if (!dict) return {};
  return dict.landing || {};
}

function t(key) {
  const parts = key.split('.');
  let value = translations[currentLocale];
  for (const part of parts) {
    if (!value || typeof value !== 'object') return key;
    value = value[part];
  }
  if (typeof value === 'string') return value;
  return key;
}

function showToast(message) {
  if (!elements.toastContainer) return;
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.innerHTML = sanitize(message);
  elements.toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function renderBenefits(dict) {
  if (!elements.benefitsList) return;
  elements.benefitsList.innerHTML = '';
  (dict.benefits || []).forEach((benefit) => {
    const li = document.createElement('li');
    li.innerHTML = sanitize(benefit);
    elements.benefitsList.appendChild(li);
  });
}

function renderCompliance(dict) {
  if (!elements.complianceList) return;
  elements.complianceList.innerHTML = '';
  (dict.complianceItems || []).forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${sanitize(item.title)}</strong><p>${sanitize(item.description)}</p>`;
    elements.complianceList.appendChild(li);
  });
}

function renderFeatures(dict) {
  if (!elements.featuresGrid) return;
  elements.featuresGrid.innerHTML = '';
  (dict.features || []).forEach((feature) => {
    const card = document.createElement('article');
    card.className = 'feature-card';
    card.innerHTML = `<h3>${sanitize(feature.title)}</h3><p>${sanitize(feature.description)}</p>`;
    elements.featuresGrid.appendChild(card);
  });
}

function renderAudience(dict) {
  if (!elements.audienceGrid) return;
  elements.audienceGrid.innerHTML = '';
  (dict.audience || []).forEach((item) => {
    const article = document.createElement('article');
    article.innerHTML = `<h3>${sanitize(item.title)}</h3><p>${sanitize(item.description)}</p>`;
    elements.audienceGrid.appendChild(article);
  });
}

function renderTestimonials(dict) {
  if (!elements.testimonials) return;
  elements.testimonials.innerHTML = '';
  (dict.testimonials || []).forEach((item) => {
    const card = document.createElement('blockquote');
    card.className = 'testimonial';
    card.innerHTML = `<p>“${sanitize(item.quote)}”</p><cite>${sanitize(item.name)} · ${sanitize(item.role)}</cite>`;
    elements.testimonials.appendChild(card);
  });
}

function renderFaq(dict) {
  if (!elements.faqList) return;
  elements.faqList.innerHTML = '';
  (dict.faq || []).forEach((item, index) => {
    const details = document.createElement('details');
    details.className = 'faq-item';
    if (index === 0) details.open = true;
    const summary = document.createElement('summary');
    summary.innerHTML = sanitize(item.question);
    const paragraph = document.createElement('p');
    paragraph.innerHTML = sanitize(item.answer);
    details.append(summary, paragraph);
    elements.faqList.appendChild(details);
  });
}

function updateTextNodes() {
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    node.innerHTML = sanitize(t(node.dataset.i18n));
  });
}

function renderAll() {
  const dict = getDict(currentLocale);
  renderBenefits(dict);
  renderCompliance(dict);
  renderFeatures(dict);
  renderAudience(dict);
  renderTestimonials(dict);
  renderFaq(dict);
  updateTextNodes();
}

function applyLocale(locale) {
  currentLocale = locale;
  localStorage.setItem(LOCALE_KEY, locale);
  document.documentElement.lang = locale === 'ar' ? 'ar' : 'fr';
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  if (elements.langSwitch) {
    elements.langSwitch.textContent = locale === 'ar' ? 'FR' : 'AR';
    elements.langSwitch.setAttribute('aria-label', locale === 'ar' ? 'التبديل إلى الفرنسية' : 'Basculer en arabe');
  }
  renderAll();
}

function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : { demoClicks: 0 };
  } catch (error) {
    console.warn('Stats non lisibles', error);
    return { demoClicks: 0 };
  }
}

function saveStats(stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function registerCtaClicks() {
  const stats = loadStats();
  linksCta.forEach((link) => {
    link.addEventListener('click', () => {
      stats.demoClicks += 1;
      saveStats(stats);
    });
  });
}

function loadContacts() {
  try {
    const raw = localStorage.getItem(CONTACTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn('Contacts non lisibles', error);
    return [];
  }
}

function saveContacts(contacts) {
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
}

function exportContactsCsv() {
  const contacts = loadContacts();
  if (!contacts.length) {
    showToast(t('landing.contactEmpty') || 'Aucun contact enregistré');
    return;
  }
  const headers = ['Nom', 'Société', 'Email', 'Téléphone', 'Message', 'Date'];
  const csv = [headers]
    .concat(
      contacts.map((item) =>
        [item.name, item.company, item.email, item.phone, item.message, item.createdAt]
          .map((field) => `"${(field || '').replace(/"/g, '""')}"`)
          .join(';'),
      ),
    )
    .join('\n');
  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `contacts-atlascompta-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function handleContactSubmit(event) {
  event.preventDefault();
  const formData = new FormData(elements.contactForm);
  const contact = {
    name: formData.get('name')?.trim(),
    company: formData.get('company')?.trim(),
    email: formData.get('email')?.trim(),
    phone: formData.get('phone')?.trim(),
    message: formData.get('message')?.trim(),
    createdAt: new Date().toISOString(),
  };
  if (!contact.name || !contact.company || !contact.email) {
    showToast(t('landing.contactError') || 'Champs requis manquants');
    return;
  }
  const contacts = loadContacts();
  contacts.push(contact);
  saveContacts(contacts);
  elements.contactForm.reset();
  showToast(t('landing.contactSuccess') || 'Merci, on vous recontacte (démo).');
}

async function loadTranslations() {
  if (!translations.fr) {
    const [fr, ar] = await Promise.all([
      fetch('i18n/fr.json').then((res) => res.json()),
      fetch('i18n/ar.json').then((res) => res.json()),
    ]);
    translations.fr = fr;
    translations.ar = ar;
  }
}

function initEvents() {
  if (elements.langSwitch) {
    elements.langSwitch.addEventListener('click', () => {
      applyLocale(currentLocale === 'fr' ? 'ar' : 'fr');
    });
  }
  if (elements.contactForm) {
    elements.contactForm.addEventListener('submit', handleContactSubmit);
  }
  if (elements.exportContacts) {
    elements.exportContacts.addEventListener('click', exportContactsCsv);
  }
  if (elements.brochureBtn) {
    elements.brochureBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

(async function bootstrap() {
  await loadTranslations();
  initEvents();
  registerCtaClicks();
  applyLocale(currentLocale);
})();
