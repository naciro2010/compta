import { Table } from '../components/Table.js';
import { showToast } from '../components/Toast.js';
import { formatCurrency, t } from '../utils/format.js';
import { savePayrollEntry } from '../state.js';
import { exportCnssCsv } from '../mocks/cnssMock.js';

function netSalary(entry) {
  const retenues = Object.values(entry.retenues || {}).reduce((acc, val) => acc + Number(val), 0);
  const avantages = Object.values(entry.avantages || {}).reduce((acc, val) => acc + Number(val), 0);
  return entry.salaireBrut - retenues + avantages;
}

function buildTable(state, container) {
  const table = new Table({
    columns: [
      { key: 'nom', label: 'payroll.table.name' },
      { key: 'poste', label: 'payroll.table.role' },
      { key: 'periode', label: 'payroll.table.period' },
      { key: 'salaireBrut', label: 'payroll.table.gross', type: 'currency' },
      {
        key: 'retenues',
        label: 'payroll.table.deductions',
        render: (row) => formatCurrency(Object.values(row.retenues || {}).reduce((acc, val) => acc + Number(val), 0)),
      },
      {
        key: 'net',
        label: 'payroll.table.net',
        render: (row) => formatCurrency(netSalary(row)),
      },
    ],
    data: state.data.payroll,
    pageSize: 20,
  });
  container.appendChild(table.render());
}

function openPayrollForm(state) {
  const form = document.createElement('form');
  form.className = 'form-grid';
  form.innerHTML = `
    <label>${t('payroll.name')}<input name="nom" required></label>
    <label>${t('payroll.role')}<input name="poste" required></label>
    <label>${t('payroll.cnss')}<input name="cnss" required></label>
    <label>${t('payroll.period')}<input name="periode" value="${new Date().toISOString().slice(0, 7)}" required></label>
    <label>${t('payroll.gross')}<input type="number" step="1" name="salaireBrut" value="9000" required></label>
    <label>${t('payroll.cnssRate')}<input type="number" step="0.01" name="retenues.cnss" value="400"></label>
    <label>${t('payroll.ir')}<input type="number" step="0.01" name="retenues.ir" value="1200"></label>
    <label>${t('payroll.benefits')}<input type="number" step="0.01" name="avantages.transport" value="400"></label>
    <button type="submit" class="btn">${t('actions.save')}</button>
  `;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const entry = {
      id: `sal-${Date.now()}`,
      nom: formData.get('nom'),
      poste: formData.get('poste'),
      cnss: formData.get('cnss'),
      periode: formData.get('periode'),
      salaireBrut: Number(formData.get('salaireBrut')),
      retenues: { cnss: Number(formData.get('retenues.cnss')), ir: Number(formData.get('retenues.ir')) },
      avantages: { transport: Number(formData.get('avantages.transport')) },
    };
    savePayrollEntry(entry);
    showToast(t('payroll.saved'), 'success');
    form.remove();
  });
  return form;
}

export default {
  render(state) {
    const container = document.createElement('div');
    container.className = 'card';
    const header = document.createElement('header');
    header.className = 'flex-row';
    header.innerHTML = `<h2>${t('payroll.title')}</h2>`;
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn';
    exportBtn.textContent = t('payroll.export');
    exportBtn.addEventListener('click', () => exportCnssCsv(state.data.payroll));
    const addBtn = document.createElement('button');
    addBtn.className = 'btn secondary';
    addBtn.textContent = t('payroll.add');
    addBtn.addEventListener('click', () => {
      const form = openPayrollForm(state);
      container.appendChild(form);
    });
    header.append(exportBtn, addBtn);
    container.appendChild(header);

    buildTable(state, container);
    return container;
  },
};
