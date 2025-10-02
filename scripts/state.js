import { readStorage, writeStorage, clearStorage } from './utils/storage.js';
import { configureI18n } from './utils/format.js';
import { autoReconcile, applyReconciliation, undoReconciliation } from './utils/reconcile.js';

const subscribers = new Set();
let store = null;

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Erreur chargement ${path}`);
  return response.json();
}

async function bootstrap() {
  const [companies, clients, suppliers, invoices, purchases, bank, payroll, fr, ar] = await Promise.all([
    fetchJson('./data/companies.json'),
    fetchJson('./data/clients.json'),
    fetchJson('./data/suppliers.json'),
    fetchJson('./data/invoices.json'),
    fetchJson('./data/purchases.json'),
    fetchJson('./data/bank.json'),
    fetchJson('./data/payroll.json'),
    fetchJson('./i18n/fr.json'),
    fetchJson('./i18n/ar.json'),
  ]);
  const company = companies[0];
  return {
    meta: {
      lastSynced: new Date().toISOString(),
      version: 1,
    },
    settings: {
      locale: 'fr',
      theme: 'light',
      tvaPeriode: company.tvaPeriode,
      company,
      planComptable: [
        { code: 'VTE', label: 'Ventes' },
        { code: 'CLT', label: 'Clients' },
        { code: 'TVA_C', label: 'TVA collectée' },
        { code: 'ACH', label: 'Achats' },
        { code: 'FNR', label: 'Fournisseurs' },
        { code: 'TVA_D', label: 'TVA déductible' },
        { code: 'BNK', label: 'Banque' },
        { code: 'OD', label: 'Opérations diverses' },
      ],
    },
    data: {
      companies,
      clients,
      suppliers,
      invoices,
      purchases,
      bank,
      payroll,
      fixedAssets: (company.immobilisations || []).map((asset, index) => ({
        id: asset.id || `IMMO-${String(index + 1).padStart(3, '0')}`,
        code: asset.code,
        label: asset.label,
        category: asset.category,
        startDate: asset.startDate,
        cost: asset.cost,
        residual: asset.residual,
        duration: asset.duration,
      })),
    },
    i18n: { fr, ar },
    reconciliation: [],
  };
}

function notify() {
  subscribers.forEach((fn) => fn(store));
  persist();
}

function persist() {
  writeStorage(store);
}

export async function initState() {
  const cached = readStorage();
  store = cached || (await bootstrap());
  configureI18n(store.settings.locale, store.i18n[store.settings.locale], store.settings.company.devise);
  notify();
  return store;
}

export function subscribe(fn) {
  subscribers.add(fn);
  if (store) fn(store);
  return () => subscribers.delete(fn);
}

export function getState() {
  return structuredClone(store);
}

export function setLocale(locale) {
  store.settings.locale = locale;
  configureI18n(locale, store.i18n[locale], store.settings.company.devise);
  notify();
}

export function setTheme(theme) {
  store.settings.theme = theme;
  notify();
}

export function updateCompany(company) {
  store.settings.company = company;
  store.settings.tvaPeriode = company.tvaPeriode;
  configureI18n(store.settings.locale, store.i18n[store.settings.locale], company.devise);
  notify();
}

export function addInvoice(invoice) {
  store.data.invoices.unshift(invoice);
  notify();
}

export function updateInvoice(id, patch) {
  const idx = store.data.invoices.findIndex((item) => item.id === id);
  if (idx >= 0) {
    store.data.invoices[idx] = { ...store.data.invoices[idx], ...patch };
    notify();
  }
}

export function deleteInvoice(id) {
  store.data.invoices = store.data.invoices.filter((item) => item.id !== id);
  notify();
}

export function addPurchase(purchase) {
  store.data.purchases.unshift(purchase);
  notify();
}

export function updatePurchase(id, patch) {
  const idx = store.data.purchases.findIndex((item) => item.id === id);
  if (idx >= 0) {
    store.data.purchases[idx] = { ...store.data.purchases[idx], ...patch };
    notify();
  }
}

export function deletePurchase(id) {
  store.data.purchases = store.data.purchases.filter((item) => item.id !== id);
  notify();
}

export function importBankTransactions(transactions) {
  store.data.bank = [...transactions, ...store.data.bank];
  notify();
}

export function reconcileBank() {
  const matches = autoReconcile(store.data.bank, [...store.data.invoices, ...store.data.purchases]);
  matches.forEach((match) => {
    const entry = store.data.bank.find((item) => item.id === match.bankId);
    const doc = [...store.data.invoices, ...store.data.purchases].find((d) => d.id === match.docId);
    if (entry && doc) {
      applyReconciliation(entry, doc);
      store.reconciliation.push({ ...match, appliedAt: new Date().toISOString() });
    }
  });
  notify();
  return matches;
}

export function manualReconciliation(bankId, docId) {
  const entry = store.data.bank.find((item) => item.id === bankId);
  const doc = [...store.data.invoices, ...store.data.purchases].find((d) => d.id === docId);
  if (entry && doc) {
    applyReconciliation(entry, doc);
    store.reconciliation.push({ bankId, docId, score: 1, appliedAt: new Date().toISOString(), manual: true });
    notify();
  }
}

export function undoLettrage(bankId, docId) {
  const entry = store.data.bank.find((item) => item.id === bankId);
  const doc = [...store.data.invoices, ...store.data.purchases].find((d) => d.id === docId);
  if (entry && doc) {
    undoReconciliation(entry, doc);
    store.reconciliation = store.reconciliation.filter((item) => item.bankId !== bankId);
    notify();
  }
}

export function recordPayment(collection, id, payment) {
  const list = store.data[collection];
  const doc = list.find((item) => item.id === id);
  if (doc) {
    doc.payments = doc.payments || [];
    doc.payments.push(payment);
    notify();
  }
}

export function savePlanComptable(plan) {
  store.settings.planComptable = plan;
  notify();
}

export function savePayrollEntry(entry) {
  const idx = store.data.payroll.findIndex((item) => item.id === entry.id);
  if (idx >= 0) store.data.payroll[idx] = entry;
  else store.data.payroll.push(entry);
  notify();
}

export function addFixedAsset(asset) {
  store.data.fixedAssets.push(asset);
  notify();
}

export function updateFixedAsset(id, patch) {
  const idx = store.data.fixedAssets.findIndex((item) => item.id === id);
  if (idx >= 0) {
    store.data.fixedAssets[idx] = { ...store.data.fixedAssets[idx], ...patch };
    notify();
  }
}

export function deleteFixedAsset(id) {
  store.data.fixedAssets = store.data.fixedAssets.filter((item) => item.id !== id);
  notify();
}

export async function resetState() {
  clearStorage();
  store = await bootstrap();
  configureI18n(store.settings.locale, store.i18n[store.settings.locale], store.settings.company.devise);
  notify();
}

export function exportDataset() {
  const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `atlas-compta-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function importDataset(json) {
  store = json;
  configureI18n(store.settings.locale, store.i18n[store.settings.locale], store.settings.company.devise);
  notify();
}
