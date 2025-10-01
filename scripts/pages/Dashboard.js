import { formatCurrency, formatDate, relativeDays, t } from '../utils/format.js';
import { computeVatSummary } from '../utils/vat.js';

function sumCash(entries, days) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return entries
    .filter((entry) => new Date(entry.date) >= cutoff)
    .reduce((acc, entry) => acc + Number(entry.amount || 0), 0);
}

function overdueInvoices(invoices) {
  const today = new Date();
  return invoices.filter((inv) => new Date(inv.dueDate) < today && inv.status !== 'Payée');
}

function buildSparkline(entries) {
  const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
  const points = sorted.slice(-90).map((entry) => ({
    date: new Date(entry.date),
    balance: entry.amount,
  }));
  if (points.length === 0) {
    return `<svg class="sparkline" viewBox="0 0 240 100"></svg>`;
  }
  const balances = points.map((p) => p.balance);
  const max = Math.max(...balances, 1);
  const min = Math.min(...balances, 0);
  const width = 240;
  const height = 100;
  const step = points.length > 1 ? width / (points.length - 1) : width;
  let cumulative = 0;
  const path = points
    .map((point, idx) => {
      cumulative += point.balance;
      const x = idx * step;
      const y = height - ((cumulative - min) / (max - min || 1)) * height;
      return `${idx === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return `<svg class="sparkline" viewBox="0 0 ${width} ${height}" role="img" aria-label="${t('dashboard.cashFlow')}"><path d="${path}" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;
}

function remindersList(invoices) {
  return invoices
    .filter((inv) => relativeDays(inv.dueDate) > 15 && inv.status !== 'Payée')
    .slice(0, 5)
    .map((inv) => `<li>${inv.id} · ${formatCurrency(inv.lines.reduce((acc, line) => acc + line.qty * line.unitPrice * (1 + line.vatRate / 100), 0))} · ${formatDate(inv.dueDate)}</li>`) 
    .join('');
}

export default {
  render(state) {
    const container = document.createElement('div');
    container.className = 'dashboard card-grid';

    const cash30 = sumCash(state.data.bank, 30);
    const cash90 = sumCash(state.data.bank, 90);
    const overdue = overdueInvoices(state.data.invoices);
    const vatSummary = computeVatSummary(state.data.invoices, state.data.purchases);
    const latestPeriod = Object.keys(vatSummary).sort().pop();
    const vat = latestPeriod ? vatSummary[latestPeriod] : { collecte: 0, deductible: 0, net: 0 };

    const kpi = document.createElement('section');
    kpi.className = 'kpi-grid';
    kpi.innerHTML = `
      <article class="card kpi-card">
        <h2>${t('dashboard.cash30')}</h2>
        <strong>${formatCurrency(cash30)}</strong>
        <p class="muted">${t('dashboard.cash90')}: ${formatCurrency(cash90)}</p>
      </article>
      <article class="card kpi-card">
        <h2>${t('dashboard.vatToPay')}</h2>
        <strong>${formatCurrency(vat.net)}</strong>
        <p class="muted">${t('dashboard.vatDetail', { collecte: formatCurrency(vat.collecte), deductible: formatCurrency(vat.deductible) })}</p>
      </article>
      <article class="card kpi-card">
        <h2>${t('dashboard.overdue')}</h2>
        <strong>${overdue.length}</strong>
        <p class="muted">${t('dashboard.nextDue', { date: overdue[0] ? formatDate(overdue[0].dueDate) : '—' })}</p>
      </article>
    `;

    const graph = document.createElement('section');
    graph.className = 'card';
    graph.innerHTML = `
      <header class="flex-row" style="justify-content: space-between; align-items:center;">
        <h2>${t('dashboard.cashFlow')}</h2>
        <span class="badge">${t('dashboard.last90')}</span>
      </header>
      ${buildSparkline(state.data.bank)}
    `;

    const reminders = document.createElement('section');
    reminders.className = 'card';
    reminders.innerHTML = `
      <h2>${t('dashboard.reminders')}</h2>
      <ul>${remindersList(overdue)}</ul>
    `;

    container.append(kpi, graph, reminders);
    return container;
  },
};
