import { t } from '../utils/format.js';
import { updateCompany, savePlanComptable, setTheme, setLocale, exportDataset, importDataset } from '../state.js';
import { getStorageKey } from '../utils/storage.js';

function buildCompanyForm(state) {
  const form = document.createElement('form');
  form.className = 'form-grid';
  const company = state.settings.company;
  form.innerHTML = `
    <h3>${t('settings.company')}</h3>
    <label>ICE<span class="required">*</span><input name="ICE" value="${company.ICE}" pattern="\\d{15}" required></label>
    <label>IF<input name="IF" value="${company.IF}" required></label>
    <label>RC<input name="RC" value="${company.RC}" required></label>
    <label>TP<input name="TP" value="${company.TP}" required></label>
    <label>${t('settings.city')}<input name="ville" value="${company.ville}" required></label>
    <label>${t('settings.currency')}<input name="devise" value="${company.devise}" required></label>
    <label>${t('settings.tvaPeriod')}<select name="tvaPeriode">
      <option value="mensuel" ${company.tvaPeriode === 'mensuel' ? 'selected' : ''}>${t('tax.monthly')}</option>
      <option value="trimestriel" ${company.tvaPeriode === 'trimestriel' ? 'selected' : ''}>${t('tax.quarterly')}</option>
    </select></label>
    <button type="submit" class="btn">${t('actions.save')}</button>
  `;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    updateCompany({ ...company, ...Object.fromEntries(formData.entries()) });
  });
  return form;
}

function buildPlanEditor(state) {
  const wrapper = document.createElement('section');
  wrapper.className = 'card';
  wrapper.innerHTML = `<h3>${t('settings.plan')}</h3>`;
  const list = document.createElement('div');
  list.className = 'form-grid';
  state.settings.planComptable.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'flex-row';
    row.innerHTML = `
      <input value="${item.code}" data-index="${index}" data-field="code">
      <input value="${item.label}" data-index="${index}" data-field="label">
    `;
    list.appendChild(row);
  });
  wrapper.appendChild(list);
  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn';
  saveBtn.textContent = t('actions.save');
  saveBtn.addEventListener('click', () => {
    const inputs = list.querySelectorAll('input');
    const plan = [];
    inputs.forEach((input) => {
      const index = Number(input.dataset.index);
      plan[index] = plan[index] || {};
      plan[index][input.dataset.field] = input.value;
    });
    savePlanComptable(plan);
  });
  wrapper.appendChild(saveBtn);
  return wrapper;
}

function buildDatasetSection() {
  const section = document.createElement('section');
  section.className = 'card';
  section.innerHTML = `
    <h3>${t('settings.dataset')}</h3>
    <button class="btn" id="export-dataset">${t('settings.export')}</button>
    <label class="btn secondary" for="import-dataset">${t('settings.import')}</label>
    <input type="file" id="import-dataset" accept="application/json" hidden>
    <p class="muted">${t('settings.storageKey')}: ${getStorageKey()}</p>
  `;
  section.querySelector('#export-dataset').addEventListener('click', () => exportDataset());
  section.querySelector('#import-dataset').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result);
        importDataset(json);
      } catch (error) {
        console.error('Import error', error);
      }
    };
    reader.readAsText(file);
  });
  return section;
}

function buildPreferences(state) {
  const section = document.createElement('section');
  section.className = 'card';
  section.innerHTML = `
    <h3>${t('settings.preferences')}</h3>
    <label>${t('settings.theme')}<select id="pref-theme">
      <option value="light">${t('settings.light')}</option>
      <option value="dark">${t('settings.dark')}</option>
    </select></label>
    <label>${t('settings.language')}<select id="pref-lang">
      <option value="fr">Français</option>
      <option value="ar">العربية</option>
    </select></label>
  `;
  const themeSelect = section.querySelector('#pref-theme');
  const langSelect = section.querySelector('#pref-lang');
  themeSelect.value = state.settings.theme;
  langSelect.value = state.settings.locale;
  themeSelect.addEventListener('change', (event) => setTheme(event.target.value));
  langSelect.addEventListener('change', (event) => setLocale(event.target.value));
  return section;
}

export default {
  render(state) {
    const container = document.createElement('div');
    container.className = 'card';
    container.appendChild(buildCompanyForm(state));
    container.appendChild(buildPlanEditor(state));
    container.appendChild(buildPreferences(state));
    container.appendChild(buildDatasetSection());
    return container;
  },
};
