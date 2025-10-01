import { Table } from '../components/Table.js';
import { formatCurrency, t } from '../utils/format.js';
import { computeVatSummary, vatSummaryToTable } from '../utils/vat.js';
import { generateDgiXml } from '../mocks/dgiMock.js';

function buildVatData(state, periodType) {
  const summary = computeVatSummary(state.data.invoices, state.data.purchases);
  if (periodType === 'trimestriel') {
    const aggregated = {};
    Object.entries(summary).forEach(([period, values]) => {
      const [year, month] = period.split('-');
      const quarter = Math.floor((Number(month) - 1) / 3) + 1;
      const key = `${year}-Q${quarter}`;
      if (!aggregated[key]) aggregated[key] = { collecte: 0, deductible: 0, baseVente: 0, baseAchat: 0, net: 0 };
      aggregated[key].collecte += values.collecte;
      aggregated[key].deductible += values.deductible;
      aggregated[key].baseVente += values.baseVente;
      aggregated[key].baseAchat += values.baseAchat;
      aggregated[key].net += values.net;
    });
    return aggregated;
  }
  return summary;
}

function buildTable(state, container, periodType) {
  const data = vatSummaryToTable(buildVatData(state, periodType));
  const table = new Table({
    columns: [
      { key: 'period', label: 'tax.table.period' },
      { key: 'baseVente', label: 'tax.table.baseSales' },
      { key: 'baseAchat', label: 'tax.table.basePurchases' },
      { key: 'collecte', label: 'tax.table.collecte' },
      { key: 'deductible', label: 'tax.table.deductible' },
      { key: 'net', label: 'tax.table.net' },
    ],
    data,
    pageSize: 12,
  });
  container.appendChild(table.render());
}

function buildTotals(state, periodType) {
  const data = Object.values(buildVatData(state, periodType));
  return data.reduce(
    (acc, row) => {
      acc.collecte += row.collecte;
      acc.deductible += row.deductible;
      acc.net += row.net;
      return acc;
    },
    { collecte: 0, deductible: 0, net: 0 },
  );
}

export default {
  render(state) {
    const container = document.createElement('div');
    container.className = 'card';
    const header = document.createElement('header');
    header.className = 'flex-row';
    header.innerHTML = `<h2>${t('tax.title')}</h2>`;
    const periodSelect = document.createElement('select');
    periodSelect.innerHTML = `<option value="mensuel">${t('tax.monthly')}</option><option value="trimestriel">${t('tax.quarterly')}</option>`;
    periodSelect.value = state.settings.tvaPeriode;
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn';
    exportBtn.textContent = t('tax.exportXml');
    exportBtn.addEventListener('click', () => {
      const periodType = periodSelect.value;
      const totals = buildTotals(state, periodType);
      generateDgiXml(state.settings.company, periodType, totals);
    });
    const printBtn = document.createElement('button');
    printBtn.className = 'btn secondary';
    printBtn.textContent = t('tax.print');
    printBtn.addEventListener('click', () => {
      document.body.classList.add('print-mode');
      window.print();
      setTimeout(() => document.body.classList.remove('print-mode'), 500);
    });
    header.append(periodSelect, exportBtn, printBtn);
    container.appendChild(header);

    const summaryCard = document.createElement('section');
    summaryCard.className = 'card';
    const totals = buildTotals(state, state.settings.tvaPeriode);
    summaryCard.innerHTML = `
      <h3>${t('tax.current')}</h3>
      <p>${t('tax.collecte')}: <strong>${formatCurrency(totals.collecte)}</strong></p>
      <p>${t('tax.deductible')}: <strong>${formatCurrency(totals.deductible)}</strong></p>
      <p>${t('tax.net')}: <strong>${formatCurrency(totals.net)}</strong></p>
    `;

    container.appendChild(summaryCard);
    buildTable(state, container, state.settings.tvaPeriode);

    periodSelect.addEventListener('change', (event) => {
      const periodType = event.target.value;
      container.querySelectorAll('.table-wrapper').forEach((el) => el.parentElement.remove());
      const section = document.createElement('section');
      section.className = 'card';
      container.appendChild(section);
      buildTable(state, section, periodType);
    });

    return container;
  },
};
