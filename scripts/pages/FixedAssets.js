import { Table } from '../components/Table.js';
import { openModal, closeModal } from '../components/Modal.js';
import { showToast } from '../components/Toast.js';
import { addFixedAsset, updateFixedAsset, deleteFixedAsset, getState } from '../state.js';
import { formatCurrency, formatDate, sanitize, t } from '../utils/format.js';

function generateAssetId(assets = []) {
  const year = new Date().getFullYear();
  const prefix = `IMMO-${year}-`;
  const numbers = assets
    .filter((asset) => asset.id && asset.id.startsWith(prefix))
    .map((asset) => Number(asset.id.split('-').pop()))
    .filter((num) => !Number.isNaN(num));
  const next = numbers.length ? Math.max(...numbers) + 1 : 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
}

function buildSchedule(asset) {
  const start = new Date(asset.startDate);
  if (Number.isNaN(start.getTime())) return [];
  const duration = Number(asset.duration) || 1;
  const cost = Number(asset.cost) || 0;
  const residual = Number(asset.residual) || 0;
  const depreciable = cost - residual;
  if (depreciable <= 0) return [];
  const monthly = Number((depreciable / duration).toFixed(2));
  const schedule = [];
  let accumulated = 0;
  for (let i = 0; i < duration; i += 1) {
    const periodDate = new Date(start);
    periodDate.setMonth(periodDate.getMonth() + i);
    let depreciation = monthly;
    if (i === duration - 1) {
      depreciation = Number((depreciable - accumulated).toFixed(2));
    }
    accumulated = Number((accumulated + depreciation).toFixed(2));
    let net = Number((cost - accumulated).toFixed(2));
    if (net < residual) net = residual;
    schedule.push({
      index: i + 1,
      date: periodDate,
      depreciation,
      accumulated,
      net,
    });
  }
  return schedule;
}

function computeSnapshot(asset) {
  const schedule = buildSchedule(asset);
  if (!schedule.length) {
    return { monthly: 0, accumulated: 0, net: Number(asset.cost) || 0 };
  }
  const today = new Date();
  let current = schedule[0];
  for (const item of schedule) {
    if (item.date <= today) {
      current = item;
    } else {
      break;
    }
  }
  return {
    monthly: schedule[0]?.depreciation || 0,
    accumulated: current?.accumulated || 0,
    net: current ? current.net : asset.cost,
  };
}

function exportScheduleCsv(asset) {
  const schedule = buildSchedule(asset);
  if (!schedule.length) return;
  const headers = ['Période', 'Date', 'Dotation', 'Cumul', 'VNC'];
  const csv = [headers]
    .concat(
      schedule.map((row) =>
        [row.index, formatDate(row.date), row.depreciation.toFixed(2), row.accumulated.toFixed(2), row.net.toFixed(2)]
          .map((value) => `"${value}"`)
          .join(';'),
      ),
    )
    .join('\n');
  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${asset.id}-amortissement.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function openScheduleModal(asset) {
  const schedule = buildSchedule(asset);
  if (!schedule.length) {
    openModal(t('fixedAssets.scheduleTitle', { code: asset.code }), `<p>${t('fixedAssets.noSchedule')}</p>`);
    return;
  }
  const entries = schedule
    .map(
      (row) =>
        `<tr><td>${row.index}</td><td>${formatDate(row.date)}</td><td>${formatCurrency(row.depreciation)}</td><td>${formatCurrency(
          row.accumulated,
        )}</td><td>${formatCurrency(row.net)}</td></tr>`,
    )
    .join('');
  const journalRows = schedule
    .map(
      (row) =>
        `<tr><td>${formatDate(row.date)}</td><td>6811</td><td>${sanitize(asset.label)}</td><td>${formatCurrency(
          row.depreciation,
        )}</td><td>2815</td></tr>`,
    )
    .join('');
  const html = `
    <section class="card-grid">
      <header>
        <h3>${sanitize(asset.label)}</h3>
        <p class="muted">${t('fixedAssets.scheduleIntro')}</p>
      </header>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>${t('fixedAssets.schedule.date')}</th>
              <th>${t('fixedAssets.schedule.dotation')}</th>
              <th>${t('fixedAssets.schedule.cumul')}</th>
              <th>${t('fixedAssets.schedule.net')}</th>
            </tr>
          </thead>
          <tbody>${entries}</tbody>
        </table>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>${t('fixedAssets.entries.date')}</th>
              <th>${t('fixedAssets.entries.debit')}</th>
              <th>${t('fixedAssets.entries.label')}</th>
              <th>${t('fixedAssets.entries.amount')}</th>
              <th>${t('fixedAssets.entries.credit')}</th>
            </tr>
          </thead>
          <tbody>${journalRows}</tbody>
        </table>
      </div>
      <div class="flex-row">
        <button type="button" class="btn" id="export-schedule">${t('fixedAssets.export')}</button>
        <button type="button" class="btn secondary" id="print-schedule">${t('fixedAssets.print')}</button>
      </div>
    </section>
  `;
  openModal(t('fixedAssets.scheduleTitle', { code: asset.code }), html);
  const exportBtn = document.getElementById('export-schedule');
  const printBtn = document.getElementById('print-schedule');
  if (exportBtn) exportBtn.addEventListener('click', () => exportScheduleCsv(asset));
  if (printBtn)
    printBtn.addEventListener('click', () => {
      document.body.classList.add('print-mode');
      window.print();
      setTimeout(() => document.body.classList.remove('print-mode'), 500);
    });
}

function openAssetForm(state, asset = null) {
  const assets = state.data.fixedAssets;
  const editing = asset ? assets.find((item) => item.id === asset.id) : null;
  const form = document.createElement('form');
  form.className = 'form-grid';
  form.innerHTML = `
    <label>${t('fixedAssets.form.code')}<input name="code" value="${sanitize(editing?.code || '')}" required></label>
    <label>${t('fixedAssets.form.label')}<input name="label" value="${sanitize(editing?.label || '')}" required></label>
    <label>${t('fixedAssets.form.category')}<input name="category" value="${sanitize(editing?.category || '')}" required></label>
    <label>${t('fixedAssets.form.start')}<input type="date" name="startDate" value="${
      editing?.startDate || new Date().toISOString().slice(0, 10)
    }" required></label>
    <label>${t('fixedAssets.form.cost')}<input type="number" step="0.01" name="cost" value="${editing?.cost || 0}" required></label>
    <label>${t('fixedAssets.form.residual')}<input type="number" step="0.01" name="residual" value="${
      editing?.residual || 0
    }" required></label>
    <label>${t('fixedAssets.form.duration')}<input type="number" min="12" step="1" name="duration" value="${
      editing?.duration || 36
    }" required></label>
    <div class="flex-row">
      <button type="submit" class="btn">${t('actions.save')}</button>
      <button type="button" class="btn secondary" data-close>${t('modal.close')}</button>
    </div>
  `;
  form.querySelector('[data-close]').addEventListener('click', () => closeModal());
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = {
      id: editing ? editing.id : generateAssetId(assets),
      code: formData.get('code')?.toString().trim(),
      label: formData.get('label')?.toString().trim(),
      category: formData.get('category')?.toString().trim(),
      startDate: formData.get('startDate'),
      cost: Number(formData.get('cost')),
      residual: Number(formData.get('residual')),
      duration: Number(formData.get('duration')),
    };
    if (!payload.code || !payload.label) {
      showToast(t('fixedAssets.formError'), 'danger');
      return;
    }
    if (editing) {
      updateFixedAsset(editing.id, payload);
      showToast(t('fixedAssets.updated'), 'success');
    } else {
      addFixedAsset(payload);
      showToast(t('fixedAssets.created'), 'success');
    }
    closeModal();
  });
  openModal(editing ? t('fixedAssets.editTitle') : t('fixedAssets.createTitle'), form);
}

function renderTable(state, container) {
  const table = new Table({
    columns: [
      { key: 'code', label: 'fixedAssets.table.code' },
      { key: 'label', label: 'fixedAssets.table.label' },
      { key: 'category', label: 'fixedAssets.table.category' },
      { key: 'startDate', label: 'fixedAssets.table.start', type: 'date' },
      { key: 'cost', label: 'fixedAssets.table.cost', type: 'currency' },
      { key: 'monthly', label: 'fixedAssets.table.monthly', type: 'currency' },
      { key: 'net', label: 'fixedAssets.table.net', type: 'currency' },
      {
        key: 'actions',
        label: 'fixedAssets.table.actions',
        render: (row) =>
          `<button class="btn secondary" type="button" data-view="${row.id}">${t('actions.view')}</button> <button class="btn secondary" type="button" data-edit="${row.id}">${t('actions.edit')}</button> <button class="btn danger" type="button" data-remove="${row.id}">${t('actions.delete')}</button>`,
      },
    ],
    data: state.data.fixedAssets.map((asset) => {
      const snapshot = computeSnapshot(asset);
      return {
        ...asset,
        startDate: asset.startDate,
        monthly: snapshot.monthly,
        net: snapshot.net,
      };
    }),
    pageSize: 8,
  });
  const tableElement = table.render();
  tableElement.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const { view, edit, remove } = target.dataset;
    const freshState = getState();
    if (view) {
      const asset = freshState.data.fixedAssets.find((item) => item.id === view);
      if (asset) openScheduleModal(asset);
    }
    if (edit) {
      const asset = freshState.data.fixedAssets.find((item) => item.id === edit);
      if (asset) openAssetForm(freshState, asset);
    }
    if (remove) {
      if (confirm(t('fixedAssets.confirmDelete'))) {
        deleteFixedAsset(remove);
        showToast(t('fixedAssets.deleted'), 'warning');
      }
    }
  });
  container.appendChild(tableElement);
}

export default {
  render(state) {
    const container = document.createElement('section');
    container.className = 'card';

    const header = document.createElement('header');
    header.className = 'flex-row';
    header.innerHTML = `<h2>${t('fixedAssets.title')}</h2>`;
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn';
    addBtn.textContent = t('fixedAssets.add');
    addBtn.addEventListener('click', () => openAssetForm(state));
    header.appendChild(addBtn);
    container.appendChild(header);

    const subtitle = document.createElement('p');
    subtitle.className = 'muted';
    subtitle.textContent = t('fixedAssets.subtitle');
    container.appendChild(subtitle);

    const summary = document.createElement('div');
    summary.className = 'kpi-grid';
    const totalCost = state.data.fixedAssets.reduce((acc, asset) => acc + Number(asset.cost || 0), 0);
    const totalNet = state.data.fixedAssets.reduce((acc, asset) => acc + computeSnapshot(asset).net, 0);
    summary.innerHTML = `
      <div class="card kpi-card"><h2>${t('fixedAssets.totalCost')}</h2><strong>${formatCurrency(totalCost)}</strong></div>
      <div class="card kpi-card"><h2>${t('fixedAssets.totalNet')}</h2><strong>${formatCurrency(totalNet)}</strong></div>
    `;
    container.appendChild(summary);

    const tableHost = document.createElement('div');
    renderTable(state, tableHost);
    container.appendChild(tableHost);

    return container;
  },
};
