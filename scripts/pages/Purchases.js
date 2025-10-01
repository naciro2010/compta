import { Table } from '../components/Table.js';
import { openModal, closeModal } from '../components/Modal.js';
import { showToast } from '../components/Toast.js';
import { formatCurrency, formatDate, statusClass, t } from '../utils/format.js';
import { addPurchase, updatePurchase, deletePurchase, recordPayment, getState } from '../state.js';
import { parseOcrFile } from '../mocks/ocrMock.js';

function statusKey(status = '') {
  return status
    .toLowerCase()
    .replace(/\s+/g, '_')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function purchaseTotal(purchase) {
  return purchase.lines.reduce((acc, line) => acc + line.qty * line.unitPrice * (1 + line.vatRate / 100), 0);
}

function buildTable(state, container) {
  const table = new Table({
    columns: [
      { key: 'id', label: 'purchases.table.id' },
      { key: 'supplier', label: 'purchases.table.supplier' },
      { key: 'date', label: 'purchases.table.date', type: 'date' },
      { key: 'dueDate', label: 'purchases.table.due', type: 'date' },
      {
        key: 'status',
        label: 'purchases.table.status',
        render: (row) => `<span class="badge ${statusClass(row.status)}">${t(`status.${statusKey(row.status)}`)}</span>`,
      },
      { key: 'total', label: 'purchases.table.total', type: 'currency' },
      {
        key: 'actions',
        label: 'purchases.table.actions',
        render: (row) =>
          `<button type="button" class="btn secondary" data-view="${row.id}">${t('actions.view')}</button> <button type="button" class="btn secondary" data-edit="${row.id}">${t('actions.edit')}</button> <button type="button" class="btn danger" data-delete="${row.id}">${t('actions.delete')}</button>`,
      },
    ],
    data: state.data.purchases.map((purchase) => ({
      id: purchase.id,
      supplier: state.data.suppliers.find((c) => c.id === purchase.supplierId)?.nom || purchase.supplierId,
      date: purchase.date,
      dueDate: purchase.dueDate,
      status: purchase.status,
      total: purchaseTotal(purchase),
    })),
  });
  const tableEl = table.render();
  tableEl.addEventListener('click', (event) => {
    const target = event.target;
    const viewId = target.getAttribute('data-view');
    const editId = target.getAttribute('data-edit');
    const deleteId = target.getAttribute('data-delete');
    if (viewId) viewPurchase(viewId);
    if (editId) openPurchaseForm(state, editId);
    if (deleteId) removePurchase(deleteId);
  });
  container.appendChild(tableEl);
}

function viewPurchase(id) {
  const state = getState();
  const purchase = state.data.purchases.find((inv) => inv.id === id);
  if (!purchase) return;
  const supplier = state.data.suppliers.find((c) => c.id === purchase.supplierId);
  const total = purchaseTotal(purchase);
  const lines = purchase.lines
    .map(
      (line) => `
        <tr>
          <td>${line.desc}</td>
          <td>${line.qty}</td>
          <td>${formatCurrency(line.unitPrice)}</td>
          <td>${line.vatRate}%</td>
          <td>${formatCurrency(line.qty * line.unitPrice)}</td>
        </tr>`,
    )
    .join('');
  const html = `
    <section>
      <header>
        <h3>${supplier?.nom || ''}</h3>
        <p>${t('purchases.invoiceId', { id: purchase.id })}</p>
      </header>
      <p>${t('purchases.date')}: ${formatDate(purchase.date)} · ${t('purchases.due')}: ${formatDate(purchase.dueDate)}</p>
      <table>
        <thead><tr><th>${t('purchases.item')}</th><th>${t('purchases.qty')}</th><th>${t('purchases.unit')}</th><th>${t('purchases.vat')}</th><th>${t('purchases.total')}</th></tr></thead>
        <tbody>${lines}</tbody>
      </table>
      <p>${t('purchases.totalTTC')}: <strong>${formatCurrency(total)}</strong></p>
    </section>
  `;
  openModal(t('purchases.viewTitle'), html);
}

function removePurchase(id) {
  deletePurchase(id);
  showToast(t('purchases.deleted'), 'warning');
  closeModal();
}

function generatePurchaseId(existing) {
  const year = new Date().getFullYear();
  const prefix = `AC-${year}-`;
  const numbers = existing
    .filter((inv) => inv.id.startsWith(prefix))
    .map((inv) => Number(inv.id.split('-').pop()));
  const next = numbers.length ? Math.max(...numbers) + 1 : 1;
  return `${prefix}${String(next).padStart(4, '0')}`;
}

function buildLineRow(line = { desc: '', qty: 1, unitPrice: 0, vatRate: 20 }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'flex-row';
  wrapper.innerHTML = `
    <div class="flex-grow"><label>${t('purchases.item')}<input name="desc" value="${line.desc}" required></label></div>
    <div><label>${t('purchases.qty')}<input name="qty" type="number" step="0.01" value="${line.qty}" required></label></div>
    <div><label>${t('purchases.unit')}<input name="unitPrice" type="number" step="0.01" value="${line.unitPrice}" required></label></div>
    <div><label>${t('purchases.vat')}<input name="vatRate" type="number" step="1" value="${line.vatRate}" required></label></div>
    <button type="button" class="btn danger" data-remove-line>&times;</button>
  `;
  wrapper.querySelector('[data-remove-line]').addEventListener('click', () => wrapper.remove());
  return wrapper;
}

function handleDrop(zone, callback) {
  zone.addEventListener('dragover', (event) => {
    event.preventDefault();
    zone.classList.add('drag-over');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', async (event) => {
    event.preventDefault();
    zone.classList.remove('drag-over');
    const file = event.dataTransfer.files[0];
    if (file) {
      const parsed = await parseOcrFile(file.name);
      if (parsed) callback(parsed);
    }
  });
}

function openPurchaseForm(state, id = null) {
  const editing = id ? state.data.purchases.find((inv) => inv.id === id) : null;
  const form = document.createElement('form');
  form.className = 'form-grid';
  form.innerHTML = `
    <label>${t('purchases.supplier')}<select name="supplierId" required>${state.data.suppliers
      .map((supplier) => `<option value="${supplier.id}" ${editing?.supplierId === supplier.id ? 'selected' : ''}>${supplier.nom}</option>`)
      .join('')}</select></label>
    <label>${t('purchases.date')}<input type="date" name="date" value="${editing?.date || new Date().toISOString().slice(0, 10)}" required></label>
    <label>${t('purchases.due')}<input type="date" name="dueDate" value="${
      editing?.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
    }" required></label>
    <label>${t('purchases.status')}<select name="status">${['Reçue', 'Payée', 'Partiellement payée', 'Annulée']
      .map((status) => `<option value="${status}" ${editing?.status === status ? 'selected' : ''}>${t(`status.${statusKey(status)}`)}</option>`)
      .join('')}</select></label>
    <div class="drop-zone" id="ocr-zone">${t('purchases.ocrHint')}</div>
    <div id="purchase-lines"></div>
    <button type="button" class="btn secondary" id="add-line">${t('purchases.addLine')}</button>
    <label>${t('purchases.notes')}<textarea name="notes">${editing?.notes || ''}</textarea></label>
    <div class="flex-row">
      <button type="submit" class="btn">${t('actions.save')}</button>
      ${editing ? `<button type="button" class="btn secondary" id="add-payment">${t('purchases.addPayment')}</button>` : ''}
    </div>
  `;
  const linesContainer = form.querySelector('#purchase-lines');
  (editing?.lines || [undefined]).forEach((line) => linesContainer.appendChild(buildLineRow(line)));
  form.querySelector('#add-line').addEventListener('click', () => linesContainer.appendChild(buildLineRow()));
  handleDrop(form.querySelector('#ocr-zone'), (parsed) => {
    form.querySelector('textarea[name="notes"]').value = parsed.note;
    const lineRow = buildLineRow({ desc: parsed.desc, qty: 1, unitPrice: parsed.ht, vatRate: parsed.tva });
    linesContainer.innerHTML = '';
    linesContainer.appendChild(lineRow);
    showToast(t('purchases.ocrSuccess'), 'info');
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const lines = Array.from(linesContainer.children).map((row) => {
      const inputs = row.querySelectorAll('input');
      return {
        desc: inputs[0].value,
        qty: Number(inputs[1].value),
        unitPrice: Number(inputs[2].value),
        vatRate: Number(inputs[3].value),
      };
    });
    const payload = {
      id: editing ? editing.id : generatePurchaseId(state.data.purchases),
      companyId: state.settings.company.id,
      supplierId: formData.get('supplierId'),
      date: formData.get('date'),
      dueDate: formData.get('dueDate'),
      lines,
      currency: state.settings.company.devise,
      status: formData.get('status'),
      payments: editing?.payments || [],
      notes: formData.get('notes'),
    };
    if (editing) updatePurchase(editing.id, payload);
    else addPurchase(payload);
    showToast(t('purchases.saved'), 'success');
    closeModal();
  });

  if (editing) {
    const addPaymentBtn = form.querySelector('#add-payment');
    addPaymentBtn.addEventListener('click', () => {
      const amount = prompt(t('purchases.paymentAmount'));
      if (!amount) return;
      recordPayment('purchases', editing.id, { amount: Number(amount), date: new Date().toISOString().slice(0, 10) });
      showToast(t('purchases.paymentRecorded'), 'success');
    });
  }

  openModal(editing ? t('purchases.editTitle') : t('purchases.createTitle'), form);
}

export default {
  render(state) {
    const container = document.createElement('div');
    container.className = 'card';
    const header = document.createElement('header');
    header.className = 'flex-row';
    header.innerHTML = `<h2>${t('purchases.title')}</h2>`;
    const createBtn = document.createElement('button');
    createBtn.className = 'btn';
    createBtn.textContent = t('purchases.create');
    createBtn.addEventListener('click', () => openPurchaseForm(state));
    header.appendChild(createBtn);
    container.appendChild(header);
    buildTable(state, container);
    return container;
  },
};
