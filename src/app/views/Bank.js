import { getDataset } from './_utils.js'

export function renderBank(){
  const ds = getDataset()
  const entries = ds.bank.slice(0, 80)

  return `
    <section class="space-y-6">
      <header class="space-y-2">
        <h1 class="text-xl font-semibold text-slate-900">Banque (POC)</h1>
        <p class="text-sm text-slate-600">Transactions mock pour tester les algorithmes de rapprochement.</p>
      </header>

      ${entries.length ? `
        <div class="table-wrapper">
          <table class="table text-sm">
            <thead>
              <tr>
                <th>Date</th>
                <th>Libellé</th>
                <th class="text-right">Montant (MAD)</th>
              </tr>
            </thead>
            <tbody>
              ${entries.map((entry) => `
                <tr>
                  <td>${entry.date}</td>
                  <td>${entry.label}</td>
                  <td class="text-right">${entry.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : `
        <div class="empty-state">
          <svg class="h-6 w-6 text-slate-400" aria-hidden="true">
            <use href="./src/assets/icon-pack.svg#icon-bank"></use>
          </svg>
          <p>Aucune transaction importée. Chargez un CSV mock pour lancer le rapprochement.</p>
        </div>
      `}
    </section>
  `
}
