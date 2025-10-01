import { Table } from '../components/Table.js';
import { formatCurrency, t } from '../utils/format.js';
import { docOutstanding } from '../utils/reconcile.js';
import { undoLettrage } from '../state.js';

function entriesFromInvoice(invoice, plan) {
  const lines = [];
  const totalHT = invoice.lines.reduce((acc, line) => acc + line.qty * line.unitPrice, 0);
  const totalVAT = invoice.lines.reduce((acc, line) => acc + (line.qty * line.unitPrice * line.vatRate) / 100, 0);
  const totalTTC = totalHT + totalVAT;
  lines.push({ date: invoice.date, journal: 'VTE', compte: plan.find((p) => p.code === 'CLT')?.code || 'CLT', libelle: invoice.id, debit: totalTTC, credit: 0 });
  lines.push({ date: invoice.date, journal: 'VTE', compte: plan.find((p) => p.code === 'VTE')?.code || 'VTE', libelle: invoice.id, debit: 0, credit: totalHT });
  lines.push({ date: invoice.date, journal: 'VTE', compte: plan.find((p) => p.code === 'TVA_C')?.code || 'TVA_C', libelle: invoice.id, debit: 0, credit: totalVAT });
  return lines;
}

function entriesFromPurchase(purchase, plan) {
  const lines = [];
  const totalHT = purchase.lines.reduce((acc, line) => acc + line.qty * line.unitPrice, 0);
  const totalVAT = purchase.lines.reduce((acc, line) => acc + (line.qty * line.unitPrice * line.vatRate) / 100, 0);
  const totalTTC = totalHT + totalVAT;
  lines.push({ date: purchase.date, journal: 'ACH', compte: plan.find((p) => p.code === 'ACH')?.code || 'ACH', libelle: purchase.id, debit: totalHT, credit: 0 });
  lines.push({ date: purchase.date, journal: 'ACH', compte: plan.find((p) => p.code === 'TVA_D')?.code || 'TVA_D', libelle: purchase.id, debit: totalVAT, credit: 0 });
  lines.push({ date: purchase.date, journal: 'ACH', compte: plan.find((p) => p.code === 'FNR')?.code || 'FNR', libelle: purchase.id, debit: 0, credit: totalTTC });
  return lines;
}

function entriesFromBank(entry, plan) {
  const lines = [];
  if (entry.amount > 0 && entry.matchDocId) {
    lines.push({ date: entry.date, journal: 'BNK', compte: plan.find((p) => p.code === 'BNK')?.code || 'BNK', libelle: entry.matchDocId, debit: entry.amount, credit: 0 });
    lines.push({ date: entry.date, journal: 'BNK', compte: plan.find((p) => p.code === 'CLT')?.code || 'CLT', libelle: entry.matchDocId, debit: 0, credit: entry.amount });
  } else if (entry.amount < 0 && entry.matchDocId) {
    const amount = Math.abs(entry.amount);
    lines.push({ date: entry.date, journal: 'BNK', compte: plan.find((p) => p.code === 'FNR')?.code || 'FNR', libelle: entry.matchDocId, debit: amount, credit: 0 });
    lines.push({ date: entry.date, journal: 'BNK', compte: plan.find((p) => p.code === 'BNK')?.code || 'BNK', libelle: entry.matchDocId, debit: 0, credit: amount });
  }
  return lines;
}

function buildEntries(state) {
  const plan = state.settings.planComptable;
  let entries = [];
  state.data.invoices.forEach((invoice) => {
    entries = entries.concat(entriesFromInvoice(invoice, plan));
  });
  state.data.purchases.forEach((purchase) => {
    entries = entries.concat(entriesFromPurchase(purchase, plan));
  });
  state.data.bank.forEach((entry) => {
    entries = entries.concat(entriesFromBank(entry, plan));
  });
  return entries.sort((a, b) => new Date(a.date) - new Date(b.date));
}

function buildTable(state, container) {
  const entries = buildEntries(state);
  const table = new Table({
    columns: [
      { key: 'date', label: 'ledger.table.date', type: 'date' },
      { key: 'journal', label: 'ledger.table.journal' },
      { key: 'compte', label: 'ledger.table.compte' },
      { key: 'libelle', label: 'ledger.table.libelle' },
      { key: 'debit', label: 'ledger.table.debit', type: 'currency' },
      { key: 'credit', label: 'ledger.table.credit', type: 'currency' },
    ],
    data: entries,
    pageSize: 20,
  });
  container.appendChild(table.render());
}

function buildLettrage(state, container) {
  const section = document.createElement('section');
  section.className = 'card';
  section.innerHTML = `<h3>${t('ledger.lettrage')}</h3>`;
  state.reconciliation.slice(0, 20).forEach((item) => {
    const button = document.createElement('button');
    button.className = 'btn secondary';
    button.textContent = `${item.docId} ⇄ ${item.bankId}`;
    button.addEventListener('click', () => {
      undoLettrage(item.bankId, item.docId);
    });
    section.appendChild(button);
  });

  const pendingClients = state.data.invoices.filter((inv) => docOutstanding(inv) > 0.01);
  const pendingSuppliers = state.data.purchases.filter((inv) => docOutstanding(inv) > 0.01);
  const list = document.createElement('ul');
  pendingClients.slice(0, 10).forEach((doc) => {
    const li = document.createElement('li');
    li.textContent = `${doc.id} · ${formatCurrency(docOutstanding(doc))}`;
    list.appendChild(li);
  });
  pendingSuppliers.slice(0, 10).forEach((doc) => {
    const li = document.createElement('li');
    li.textContent = `${doc.id} · ${formatCurrency(docOutstanding(doc))}`;
    list.appendChild(li);
  });
  section.appendChild(list);
  container.appendChild(section);
}

export default {
  render(state) {
    const container = document.createElement('div');
    container.className = 'card';
    const header = document.createElement('header');
    header.innerHTML = `<h2>${t('ledger.title')}</h2>`;
    container.appendChild(header);
    buildLettrage(state, container);
    buildTable(state, container);
    return container;
  },
};
