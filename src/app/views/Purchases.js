import { getDataset } from './_utils.js'

const STATUS_CLASS = {
  'Validée': 'bg-emerald-100 text-emerald-700',
  'Émise': 'bg-slate-100 text-slate-600',
  'À payer': 'bg-amber-100 text-amber-700'
}

function renderStatus(status){
  const base = 'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium'
  const tone = STATUS_CLASS[status] || 'bg-slate-100 text-slate-600'
  return `<span class="${base} ${tone}">${status}</span>`
}

export function renderPurchases(){
  const ds = getDataset()
  const purchases = ds.purchases.slice(0, 40)

  return `
    <section class="space-y-6">
      <header class="space-y-2">
        <h1 class="text-xl font-semibold text-slate-900">Achats (POC)</h1>
        <p class="text-sm text-slate-600">Commandes mock avec OCR et paiement à implémenter.</p>
      </header>

      ${purchases.length ? `
        <div class="table-wrapper">
          <table class="table text-sm">
            <thead>
              <tr>
                <th>#</th>
                <th>Fournisseur</th>
                <th>Date</th>
                <th class="text-right">TTC</th>
                <th class="text-right">Statut</th>
              </tr>
            </thead>
            <tbody>
              ${purchases.map((purchase) => `
                <tr>
                  <td>${purchase.id}</td>
                  <td>${purchase.supplierName}</td>
                  <td>${purchase.date}</td>
                  <td class="text-right">${purchase.totalTtc.toFixed(2)}</td>
                  <td class="text-right">${renderStatus(purchase.status)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : `
        <div class="empty-state">
          <svg class="h-6 w-6 text-slate-400" aria-hidden="true">
            <use href="./src/assets/icon-pack.svg#icon-double-entry"></use>
          </svg>
          <p>Aucune facture d'achat mock. Importez des données pour tester les workflows.</p>
        </div>
      `}
    </section>
  `
}
