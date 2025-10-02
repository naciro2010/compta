import Alpine from 'alpinejs';
import landingContent from '@data/landing.json';
import { createI18n } from './i18n.js';
import '@styles/main.css';

const STORAGE_KEYS = {
  THEME: 'landing.theme',
  CONTACTS: 'landing.contacts',
};

const createUiStore = () => ({
  isDark: false,
  init() {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME);
    if (stored) {
      this.isDark = stored === 'dark';
    } else {
      this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.applyTheme();
  },
  toggleTheme() {
    this.isDark = !this.isDark;
    this.applyTheme();
    localStorage.setItem(STORAGE_KEYS.THEME, this.isDark ? 'dark' : 'light');
  },
  applyTheme() {
    document.documentElement.classList.toggle('dark', this.isDark);
  },
});

const intersectionObserver = () => {
  if (typeof window === 'undefined' || typeof window.IntersectionObserver === 'undefined') {
    return {
      observe() {},
      unobserve() {},
    };
  }

  const observer = new window.IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target;
          target.classList.add('is-visible');
          const extra = target.dataset.animate;
          if (extra) {
            extra.split(' ').forEach((cls) => target.classList.add(cls));
          }
          observer.unobserve(target);
        }
      });
    },
    { threshold: 0.2 }
  );

  return observer;
};

let observer;

document.addEventListener('alpine:init', () => {
  const i18n = createI18n(landingContent);

  Alpine.store('i18n', i18n);
  Alpine.store('ui', createUiStore());

  if (!observer) {
    observer = intersectionObserver();
  }

  Alpine.directive('animate', (el, { expression }) => {
    el.classList.add('animate-on-scroll');
    if (expression) {
      el.dataset.animate = expression;
    }
    observer.observe(el);
  });

  Alpine.data('landingPage', () => ({
    init() {
      this.$store.ui.init();
      this.$store.i18n.init();
      this.setupScrollSpy();
    },
    setupScrollSpy() {
      if (typeof window === 'undefined' || typeof window.IntersectionObserver === 'undefined') {
        return;
      }
      const links = document.querySelectorAll('header nav a');
      const sections = Array.from(links).map((link) => document.querySelector(link.getAttribute('href')));
      const spyObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const idx = sections.indexOf(entry.target);
            if (idx >= 0) {
              links[idx]?.classList.toggle('text-primary-600', entry.isIntersecting);
            }
          });
        },
        { threshold: 0.4 }
      );
      sections.filter(Boolean).forEach((section) => spyObserver.observe(section));
    },
    scrollToSection(selector) {
      const el = document.querySelector(selector);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    printBrochure() {
      window.print();
    },
  }));

  Alpine.data('header', () => ({
    mobileMenu: false,
    langMenu: false,
    scrolled: false,
    init() {
      this.scrolled = window.scrollY > 20;
      window.addEventListener('scroll', this.handleScroll.bind(this));
    },
    handleScroll() {
      this.scrolled = window.scrollY > 20;
    },
    toggleLangMenu() {
      this.langMenu = !this.langMenu;
    },
    changeLang(lang) {
      this.$store.i18n.setLanguage(lang);
      this.langMenu = false;
      this.mobileMenu = false;
    },
  }));

  Alpine.data('heroIllustration', () => ({
    tilt: { x: 0, y: 0 },
    init() {
      this.$el.addEventListener('mousemove', (event) => {
        const rect = this.$el.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
        this.tilt = { x, y };
        if (!this.$refs.card) return;
        this.$refs.card.style.transform = `rotateX(${ -y }deg) rotateY(${ x }deg)`;
      });
      this.$el.addEventListener('mouseleave', () => {
        if (!this.$refs.card) return;
        this.$refs.card.style.transform = 'rotateX(0deg) rotateY(0deg)';
      });
    },
  }));

  Alpine.data('accordion', () => ({
    open: new Set(),
    toggle(id) {
      if (this.open.has(id)) {
        this.open.delete(id);
      } else {
        this.open.add(id);
      }
    },
    isOpen(id) {
      return this.open.has(id);
    },
  }));

  Alpine.data('contactForm', () => ({
    form: {
      name: '',
      company: '',
      email: '',
      phone: '',
      message: '',
      agree: false,
    },
    errors: {},
    loading: false,
    submit: async function () {
      if (!this.validate()) return;
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const contacts = this.getContacts();
        contacts.push({ ...this.form, date: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
        window.dispatchEvent(
          new CustomEvent('toast', {
            detail: {
              type: 'success',
              message: this.$store.i18n.t('contact.toast_success'),
            },
          })
        );
        this.reset();
      } finally {
        this.loading = false;
      }
    },
    validate() {
      const errors = {};
      if (!this.form.name.trim()) errors.name = this.$store.i18n.t('contact.errors.name');
      if (!this.form.company.trim()) errors.company = this.$store.i18n.t('contact.errors.company');
      if (!this.form.email.trim()) {
        errors.email = this.$store.i18n.t('contact.errors.email');
      } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/i.test(this.form.email)) {
        errors.email = this.$store.i18n.t('contact.errors.email_invalid');
      }
      if (!this.form.phone.trim()) errors.phone = this.$store.i18n.t('contact.errors.phone');
      if (!this.form.message.trim()) errors.message = this.$store.i18n.t('contact.errors.message');
      if (!this.form.agree) errors.agree = this.$store.i18n.t('contact.errors.agree');
      this.errors = errors;
      return Object.keys(errors).length === 0;
    },
    reset() {
      this.form = { name: '', company: '', email: '', phone: '', message: '', agree: false };
      this.errors = {};
    },
    getContacts() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTACTS)) || [];
      } catch (error) {
        console.warn('Failed to parse contacts', error);
        return [];
      }
    },
  }));

  Alpine.data('contactActions', () => ({
    init() {},
    exportCSV() {
      const contacts = this.getContacts();
      if (!contacts.length) {
        window.dispatchEvent(
          new CustomEvent('toast', {
            detail: {
              type: 'info',
              message: this.$store.i18n.t('contact.toast_empty'),
            },
          })
        );
        return;
      }
      const headers = ['name', 'company', 'email', 'phone', 'message', 'date'];
      const rows = contacts.map((contact) => headers.map((key) => `"${(contact[key] ?? '').replace(/"/g, '""')}"`).join(','));
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'contacts-comptaflow.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      window.dispatchEvent(
        new CustomEvent('toast', {
          detail: {
            type: 'success',
            message: this.$store.i18n.t('contact.toast_export'),
          },
        })
      );
    },
    resetContacts() {
      localStorage.removeItem(STORAGE_KEYS.CONTACTS);
      window.dispatchEvent(
        new CustomEvent('toast', {
          detail: {
            type: 'success',
            message: this.$store.i18n.t('contact.toast_reset'),
          },
        })
      );
    },
    getContacts() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTACTS)) || [];
      } catch (error) {
        console.warn('Failed to parse contacts', error);
        return [];
      }
    },
  }));

  Alpine.data('toastManager', () => ({
    toasts: [],
    push({ type = 'info', message }) {
      const id = (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
      const toast = { id, type, message, visible: true };
      this.toasts.push(toast);
      setTimeout(() => this.hide(id), 3500);
    },
    hide(id) {
      const toast = this.toasts.find((item) => item.id === id);
      if (toast) {
        toast.visible = false;
        setTimeout(() => {
          this.toasts = this.toasts.filter((item) => item.id !== id);
        }, 350);
      }
    },
  }));

  Alpine.data('modal', () => ({
    open: false,
    title: '',
    message: '',
    show({ title, message }) {
      this.title = title;
      this.message = message;
      this.open = true;
    },
    close() {
      this.open = false;
    },
  }));
});

Alpine.start();
