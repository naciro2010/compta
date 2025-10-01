import { Table } from '../components/Table.js';
import { showToast } from '../components/Toast.js';
import { formatCurrency, formatDate, t } from '../utils/format.js';
import { docOutstanding } from '../utils/reconcile.js';
import { importBankTransactions, reconcileBank, manualReconciliation, undoLettrage } from '../state.js';

function buildTable(state, container) {
  const table = new Table({
    columns: [
      { key: 'date', label: 'bank.table.date', type: 'date' },
      { key: 'label', label: 'bank.table.label' },
      { key: 'amount', label: 'bank.table.amount', type: 'currency' },
      { key: 'ref', label: 'bank.table.ref' },
      {
        key: 'status',
        label: 'bank.table.status',
        render: (row) => (row.reconciled ? `<span class="badge success">${t('bank.reconciled')}</span>` : `<span class="badge warning">${t('bank.toMatch')}</span>`),
      },
    ],
    data: state.data.bank.map((entry) => ({
      ...entry,
      amount: entry.amount,
      status: entry.reconciled ? t('bank.reconciled') : t('bank.toMatch'),
    })),
    pageSize: 15,
  });
  container.appendChild(table.render());
}

function buildDragZone(state, container) {
  const unmatchedBank = state.data.bank.filter((entry) => !entry.reconciled).slice(0, 15);
  const pendingDocs = [...state.data.invoices, ...state.data.purchases].filter((doc) => docOutstanding(doc) > 0.01 && !doc.reconciled);

  const bankZone = document.createElement('section');
  bankZone.className = 'card';
  bankZone.innerHTML = `<h3>${t('bank.toMatch')}</h3>`;
  unmatchedBank.forEach((entry) => {
    const item = document.createElement('article');
    item.className = 'badge';
    item.draggable = true;
    item.dataset.bankId = entry.id;
    item.textContent = `${formatDate(entry.date)} · ${formatCurrency(entry.amount)} · ${entry.label}`;
    item.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/plain', entry.id);
    });
    bankZone.appendChild(item);
  });

  const docsZone = document.createElement('section');
  docsZone.className = 'card';
  docsZone.innerHTML = `<h3>${t('bank.docs')}</h3>`;
  pendingDocs.forEach((doc) => {
    const card = document.createElement('article');
    card.className = 'badge';
    card.dataset.docId = doc.id;
    card.textContent = `${doc.id} · ${formatCurrency(docOutstanding(doc))}`;
    card.addEventListener('dragover', (event) => event.preventDefault());
    card.addEventListener('drop', (event) => {
      event.preventDefault();
      const bankId = event.dataTransfer.getData('text/plain');
      manualReconciliation(bankId, doc.id);
      showToast(t('bank.manualMatch'), 'success');
    });
    docsZone.appendChild(card);
  });

  const undoZone = document.createElement('section');
  undoZone.className = 'card';
  undoZone.innerHTML = `<h3>${t('bank.matched')}</h3>`;
  state.data.bank
    .filter((entry) => entry.reconciled)
    .slice(0, 20)
    .forEach((entry) => {
      const btn = document.createElement('button');
      btn.className = 'btn secondary';
      btn.textContent = `${formatDate(entry.date)} · ${entry.matchDocId}`;
      btn.addEventListener('click', () => {
        undoLettrage(entry.id, entry.matchDocId);
        showToast(t('bank.undo'), 'warning');
      });
      undoZone.appendChild(btn);
    });

  const wrapper = document.createElement('div');
  wrapper.className = 'flex-row';
  wrapper.append(bankZone, docsZone, undoZone);
  container.appendChild(wrapper);
}

async function importMock() {
  const response = await fetch('./data/bank.json');
  const data = await response.json();
  importBankTransactions(data.slice(0, 10));
  showToast(t('bank.imported'), 'info');
}

export default {
  render(state) {
    const container = document.createElement('div');
    container.className = 'card';
    const header = document.createElement('header');
    header.className = 'flex-row';
    header.innerHTML = `<h2>${t('bank.title')}</h2>`;
    const importBtn = document.createElement('button');
    importBtn.className = 'btn secondary';
    importBtn.textContent = t('bank.import');
    importBtn.addEventListener('click', importMock);
    const reconcileBtn = document.createElement('button');
    reconcileBtn.className = 'btn';
    reconcileBtn.textContent = t('bank.auto');
    reconcileBtn.addEventListener('click', () => {
      const matches = reconcileBank();
      if (matches.length) showToast(t('bank.autoSuccess', { count: matches.length }), 'success');
      else showToast(t('bank.autoEmpty'), 'warning');
    });
    header.append(importBtn, reconcileBtn);
    container.appendChild(header);

    buildDragZone(state, container);
    buildTable(state, container);
    return container;
  },
};
