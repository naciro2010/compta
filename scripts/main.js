import { initState, subscribe as subscribeState, setLocale, setTheme, resetState, getState } from './state.js';
import { configureI18n, t } from './utils/format.js';
import { initRouter, subscribe as subscribeRoute, getCurrentRoute } from './router.js';
import Dashboard from './pages/Dashboard.js';
import Sales from './pages/Sales.js';
import Purchases from './pages/Purchases.js';
import Bank from './pages/Bank.js';
import Ledger from './pages/Ledger.js';
import Tax from './pages/Tax.js';
import Payroll from './pages/Payroll.js';
import Settings from './pages/Settings.js';
import FixedAssets from './pages/FixedAssets.js';
import { showToast } from './components/Toast.js';

const routes = {
  dashboard: Dashboard,
  sales: Sales,
  purchases: Purchases,
  bank: Bank,
  ledger: Ledger,
  tax: Tax,
  payroll: Payroll,
  'fixed-assets': FixedAssets,
  settings: Settings,
};

const navConfig = [
  { route: 'dashboard', key: 'nav.dashboard' },
  { route: 'sales', key: 'nav.sales' },
  { route: 'purchases', key: 'nav.purchases' },
  { route: 'bank', key: 'nav.bank' },
  { route: 'ledger', key: 'nav.ledger' },
  { route: 'tax', key: 'nav.tax' },
  { route: 'payroll', key: 'nav.payroll' },
  { route: 'fixed-assets', key: 'nav.fixedAssets' },
  { route: 'settings', key: 'nav.settings' },
];

const view = document.getElementById('view');
const langSelect = document.getElementById('lang-select');
const themeSelect = document.getElementById('theme-select');
const resetBtn = document.getElementById('reset-demo');
const navList = document.getElementById('main-nav');

function renderPage(route, state) {
  const page = routes[route] || routes.dashboard;
  view.innerHTML = '';
  const element = page.render(state, { showToast });
  view.appendChild(element);
  view.focus();
}

function updateNavLabels() {
  navConfig.forEach(({ route, key }) => {
    const link = navList.querySelector(`[data-route="${route}"]`);
    if (link) link.textContent = t(key);
  });
}

function updateNavActive(route) {
  navList.querySelectorAll('.nav-link').forEach((link) => {
    link.classList.toggle('active', link.dataset.route === route);
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeSelect.value = theme;
}

function applyLocale(locale) {
  const state = getState();
  configureI18n(locale, state.i18n[locale], state.settings.company.devise);
  langSelect.value = locale;
  document.documentElement.lang = locale === 'ar' ? 'ar' : 'fr';
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  updateNavLabels();
}

function handleStateChange(state) {
  applyTheme(state.settings.theme);
  applyLocale(state.settings.locale);
  const currentRoute = getCurrentRoute();
  renderPage(currentRoute, state);
  updateNavActive(currentRoute);
}

function initEvents() {
  langSelect.addEventListener('change', (event) => {
    setLocale(event.target.value);
    showToast(t('toast.languageChanged'), 'success');
  });

  themeSelect.addEventListener('change', (event) => {
    setTheme(event.target.value);
    showToast(t('toast.themeChanged'), 'info');
  });

  resetBtn.addEventListener('click', async () => {
    await resetState();
    showToast(t('toast.datasetReset'), 'warning');
  });
}

(async function bootstrap() {
  const state = await initState();
  initEvents();
  subscribeState(handleStateChange);
  subscribeRoute((route) => {
    const currentState = getState();
    updateNavActive(route);
    renderPage(route, currentState);
  });
  initRouter(routes);
  handleStateChange(state);
})();
