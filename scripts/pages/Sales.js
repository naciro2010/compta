import { Table } from '../components/Table.js';
import { openModal, closeModal } from '../components/Modal.js';
import { showToast } from '../components/Toast.js';
import { formatCurrency, formatDate, statusClass, t } from '../utils/format.js';
import { addInvoice, updateInvoice, deleteInvoice, recordPayment, getState } from '../state.js';

function statusKey(status = '') {
  return status
    .toLowerCase()
    .replace(/\s+/g, '_')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function invoiceTotal(invoice) {
  return invoice.lines.reduce((acc, line) => acc + line.qty * line.unitPrice * (1 + line.vatRate / 100), 0);
}

function buildTable(state, container) {
  const table = new Table({
    columns: [
      { key: 'id', label: 'sales.table.id' },
      { key: 'customer', label: 'sales.table.customer' },
      { key: 'date', label: 'sales.table.date', type: 'date' },
      { key: 'dueDate', label: 'sales.table.due', type: 'date' },
      {
        key: 'status',
        label: 'sales.table.status',
        render: (row) => `<span class="badge ${statusClass(row.status)}">${t(`status.${statusKey(row.status)}`)}</span>`,
      },
      { key: 'total', label: 'sales.table.total', type: 'currency' },
      {
        key: 'actions',
        label: 'sales.table.actions',
        render: (row) =>
          `<button type="button" class="btn secondary" data-view="${row.id}">${t('actions.view')}</button> <button type="button" class="btn secondary" data-edit="${row.id}">${t('actions.edit')}</button> <button type="button" class="btn danger" data-delete="${row.id}">${t('actions.delete')}</button>`,
      },
    ],
    data: state.data.invoices.map((inv) => ({
      id: inv.id,
      customer: state.data.clients.find((c) => c.id === inv.customerId)?.nom || inv.customerId,
      date: inv.date,
      dueDate: inv.dueDate,
      status: inv.status,
      total: invoiceTotal(inv),
    })),
    pageSize: 12,
  });
  const tableEl = table.render();
  tableEl.addEventListener('click', (event) => {
    const target = event.target;
    const viewId = target.getAttribute('data-view');
    const editId = target.getAttribute('data-edit');
    const deleteId = target.getAttribute('data-delete');
    if (viewId) viewInvoice(viewId);
    if (editId) openInvoiceForm(state, editId);
    if (deleteId) removeInvoice(deleteId);
  });
  container.appendChild(tableEl);
}

function viewInvoice(id) {
  const state = getState();
  const invoice = state.data.invoices.find((inv) => inv.id === id);
  if (!invoice) return;
  const customer = state.data.clients.find((c) => c.id === invoice.customerId);
  const total = invoiceTotal(invoice);
  const lines = invoice.lines
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
    <section class="invoice-print">
      <header>
        <h3>${state.settings.company.raisonSociale}</h3>
        <p>${t('sales.invoiceId', { id: invoice.id })}</p>
      </header>
      <p>${customer?.nom || ''} - ${customer?.ville || ''}</p>
      <p>${t('sales.date')}: ${formatDate(invoice.date)} · ${t('sales.due')}: ${formatDate(invoice.dueDate)}</p>
      <table>
        <thead><tr><th>${t('sales.item')}</th><th>${t('sales.qty')}</th><th>${t('sales.unit')}</th><th>${t('sales.vat')}</th><th>${t('sales.total')}</th></tr></thead>
        <tbody>${lines}</tbody>
      </table>
      <p>${t('sales.totalTTC')}: <strong>${formatCurrency(total)}</strong></p>
      <button class="btn" id="print-invoice">${t('actions.print')}</button>
    </section>
  `;
  openModal(t('sales.viewTitle'), html);
  document.getElementById('print-invoice').addEventListener('click', () => {
    document.body.classList.add('print-mode');
    window.print();
    setTimeout(() => document.body.classList.remove('print-mode'), 500);
  });
}

function removeInvoice(id) {
  deleteInvoice(id);
  showToast(t('sales.deleted'), 'warning');
  closeModal();
}

function generateInvoiceId(existing) {
  const year = new Date().getFullYear();
  const prefix = `FA-${year}-`;
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
    <div class="flex-grow"><label>${t('sales.item')}<input name="desc" value="${line.desc}" required></label></div>
    <div><label>${t('sales.qty')}<input name="qty" type="number" step="0.01" value="${line.qty}" required></label></div>
    <div><label>${t('sales.unit')}<input name="unitPrice" type="number" step="0.01" value="${line.unitPrice}" required></label></div>
    <div><label>${t('sales.vat')}<input name="vatRate" type="number" step="1" value="${line.vatRate}" required></label></div>
    <button type="button" class="btn danger" data-remove-line>&times;</button>
  `;
  wrapper.querySelector('[data-remove-line]').addEventListener('click', () => wrapper.remove());
  return wrapper;
}

function openInvoiceForm(state, id = null) {
  const editing = id ? state.data.invoices.find((inv) => inv.id === id) : null;
  const form = document.createElement('form');
  form.className = 'form-grid';
  form.innerHTML = `
    <label>${t('sales.client')}<select name="customerId" required>${state.data.clients
      .map((client) => `<option value="${client.id}" ${editing?.customerId === client.id ? 'selected' : ''}>${client.nom}</option>`)
      .join('')}</select></label>
    <label>${t('sales.date')}<input type="date" name="date" value="${editing?.date || new Date().toISOString().slice(0, 10)}" required></label>
    <label>${t('sales.due')}<input type="date" name="dueDate" value="${
      editing?.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
    }" required></label>
    <label>${t('sales.status')}<select name="status">${['Brouillon', 'Validée', 'Payée', 'Partiellement payée', 'Annulée']
      .map((status) => `<option value="${status}" ${editing?.status === status ? 'selected' : ''}>${t(`status.${statusKey(status)}`)}</option>`)
      .join('')}</select></label>
    <div id="invoice-lines"></div>
    <button type="button" class="btn secondary" id="add-line">${t('sales.addLine')}</button>
    <label>${t('sales.notes')}<textarea name="notes">${editing?.notes || ''}</textarea></label>
    <div class="flex-row">
      <button type="submit" class="btn">${t('actions.save')}</button>
      ${editing ? `<button type="button" class="btn secondary" id="add-payment">${t('sales.addPayment')}</button>` : ''}
    </div>
  `;
  const linesContainer = form.querySelector('#invoice-lines');
  (editing?.lines || [undefined]).forEach((line) => linesContainer.appendChild(buildLineRow(line)));
  form.querySelector('#add-line').addEventListener('click', () => linesContainer.appendChild(buildLineRow()));
  if (editing) {
    form.querySelectorAll('#invoice-lines [data-remove-line]').forEach((btn) => btn.hidden = form.querySelectorAll('#invoice-lines .flex-row').length <= 1);
  }

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
      id: editing ? editing.id : generateInvoiceId(state.data.invoices),
      companyId: state.settings.company.id,
      customerId: formData.get('customerId'),
      date: formData.get('date'),
      dueDate: formData.get('dueDate'),
      lines,
      currency: state.settings.company.devise,
      status: formData.get('status'),
      payments: editing?.payments || [],
      notes: formData.get('notes'),
    };
    if (editing) updateInvoice(editing.id, payload);
    else addInvoice(payload);
    showToast(t('sales.saved'), 'success');
    closeModal();
  });

  if (editing) {
    const addPaymentBtn = form.querySelector('#add-payment');
    addPaymentBtn.addEventListener('click', () => {
      const amount = prompt(t('sales.paymentAmount'));
      if (!amount) return;
      recordPayment('invoices', editing.id, { amount: Number(amount), date: new Date().toISOString().slice(0, 10) });
      showToast(t('sales.paymentRecorded'), 'success');
    });
  }

  openModal(editing ? t('sales.editTitle') : t('sales.createTitle'), form);
}

export default {
  render(state) {
    const container = document.createElement('div');
    container.className = 'card';

    const header = document.createElement('header');
    header.className = 'flex-row';
    header.innerHTML = `<h2>${t('sales.title')}</h2>`;
    const createBtn = document.createElement('button');
    createBtn.className = 'btn';
    createBtn.textContent = t('sales.createInvoice');
    createBtn.addEventListener('click', () => openInvoiceForm(state));
    header.appendChild(createBtn);

    container.appendChild(header);
    buildTable(state, container);
    return container;
  },
};
