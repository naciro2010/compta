import { getDataset } from '../views/_utils.js'

export function renderDashboard(){
  const ds = getDataset()
  const invOpen = ds.invoices.filter((i) => ['Validée', 'Partiellement payée'].includes(i.status))
  const toPay = invOpen.reduce((total, invoice) => {
    const paid = (invoice.payments || []).reduce((sum, payment) => sum + payment.amount, 0)
    return total + (invoice.totalTtc - paid)
  }, 0)
  const latestInvoices = ds.invoices.slice(0, 6)
  const latestBank = ds.bank.slice(0, 6)

  return `
    <section class="space-y-8">
      <header class="space-y-2">
        <h1 class="text-2xl font-semibold text-slate-900">Vue d'ensemble</h1>
        <p class="text-sm text-slate-600">Suivi des données mock de la démonstration CGNC.</p>
      </header>

      <div class="grid gap-4 md:grid-cols-3">
        <div class="stat-card">
          <p class="stat-label">Factures ouvertes</p>
          <p class="stat-value">${invOpen.length}</p>
          <p class="text-xs text-slate-500">Inclut les factures validées et partiellement payées.</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Encours clients (MAD)</p>
          <p class="stat-value">${toPay.toFixed(2)}</p>
          <p class="text-xs text-slate-500">Différence entre TTC et paiements enregistrés.</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Lignes bancaires importées</p>
          <p class="stat-value">${ds.bank.length}</p>
          <p class="text-xs text-slate-500">Transactions mock prêtes pour le rapprochement.</p>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <section class="card p-5 space-y-4">
          <header class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">Dernières factures</h2>
              <p class="text-sm text-slate-600">Échantillon mock (6 plus récentes).</p>
            </div>
            <a href="#/sales" class="btn-link text-sm">Voir tout</a>
          </header>
          ${latestInvoices.length ? `
            <div class="table-wrapper">
              <table class="table text-sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th class="text-right">TTC</th>
                  </tr>
                </thead>
                <tbody>
                  ${latestInvoices.map((invoice) => `
                    <tr>
                      <td>${invoice.id}</td>
                      <td>${invoice.customerName}</td>
                      <td>${invoice.date}</td>
                      <td class="text-right">${invoice.totalTtc.toFixed(2)}</td>
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
              <p>Aucune facture disponible dans cet environnement de démonstration.</p>
            </div>
          `}
        </section>

        <section class="card p-5 space-y-4">
          <header class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">Flux bancaires récents</h2>
              <p class="text-sm text-slate-600">Transactions mock pour les tests de rapprochement.</p>
            </div>
            <a href="#/bank" class="btn-link text-sm">Accéder à la banque</a>
          </header>
          ${latestBank.length ? `
            <div class="table-wrapper">
              <table class="table text-sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Libellé</th>
                    <th class="text-right">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  ${latestBank.map((entry) => `
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
              <p>Aucune ligne bancaire importée dans ce scénario.</p>
            </div>
          `}
        </section>
      </div>
    </section>
  `
}
