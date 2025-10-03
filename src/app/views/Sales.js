import { getDataset } from './_utils.js'

const STATUS_CLASS = {
  'Validée': 'bg-emerald-100 text-emerald-700',
  'Brouillon': 'bg-slate-100 text-slate-600',
  'Partiellement payée': 'bg-amber-100 text-amber-700',
  'Échue': 'bg-rose-100 text-rose-700'
}

function renderStatus(status){
  const base = 'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium'
  const tone = STATUS_CLASS[status] || 'bg-slate-100 text-slate-600'
  return `<span class="${base} ${tone}">${status}</span>`
}

export function renderSales(){
  const ds = getDataset()
  const invoices = ds.invoices.slice(0, 40)

  return `
    <section class="space-y-6">
      <header class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-semibold text-slate-900">Ventes (POC)</h1>
          <p class="text-sm text-slate-600">Factures mock issues du jeu de données démo.</p>
        </div>
        <button class="btn-secondary" type="button" onclick="alert('Formulaire facture à implémenter via Épic D')">Nouvelle facture</button>
      </header>

      ${invoices.length ? `
        <div class="table-wrapper">
          <table class="table text-sm">
            <thead>
              <tr>
                <th>#</th>
                <th>Client</th>
                <th>Date</th>
                <th class="text-right">TTC</th>
                <th class="text-right">Statut</th>
              </tr>
            </thead>
            <tbody>
              ${invoices.map((invoice) => `
                <tr>
                  <td>${invoice.id}</td>
                  <td>${invoice.customerName}</td>
                  <td>${invoice.date}</td>
                  <td class="text-right">${invoice.totalTtc.toFixed(2)}</td>
                  <td class="text-right">${renderStatus(invoice.status)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : `
        <div class="empty-state">
          <svg class="h-6 w-6 text-slate-400" aria-hidden="true">
            <use href="./src/assets/icon-pack.svg#icon-invoice"></use>
          </svg>
          <p>Aucune facture enregistrée dans ce POC. Ajoutez-en pour visualiser la liste.</p>
        </div>
      `}
    </section>
  `
}
