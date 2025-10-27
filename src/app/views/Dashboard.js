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
    <section class="space-y-8 animate-fade-in-up">
      <header class="space-y-2">
        <h1 class="text-3xl font-bold text-[var(--ink)]">Vue d'ensemble</h1>
        <p class="text-base text-[var(--ink-soft)]">Suivi des données mock de la démonstration CGNC.</p>
      </header>

      <div class="grid gap-5 md:grid-cols-3">
        <div class="stat-card hover-scale delay-1">
          <p class="stat-label">Factures ouvertes</p>
          <p class="stat-value">${invOpen.length}</p>
          <p class="stat-description">Inclut les factures validées et partiellement payées.</p>
        </div>
        <div class="stat-card hover-scale delay-2">
          <p class="stat-label">Encours clients (MAD)</p>
          <p class="stat-value">${toPay.toFixed(2)}</p>
          <p class="stat-description">Différence entre TTC et paiements enregistrés.</p>
        </div>
        <div class="stat-card hover-scale delay-3">
          <p class="stat-label">Lignes bancaires importées</p>
          <p class="stat-value">${ds.bank.length}</p>
          <p class="stat-description">Transactions mock prêtes pour le rapprochement.</p>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <section class="card p-6 space-y-5">
          <header class="flex items-center justify-between pb-3 border-b border-[var(--divider)]">
            <div class="space-y-1">
              <h2 class="text-xl font-bold text-[var(--ink)]">Dernières factures</h2>
              <p class="text-sm text-[var(--ink-soft)]">Échantillon mock (6 plus récentes).</p>
            </div>
            <a href="#/sales" class="btn-link">Voir tout</a>
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
                      <td class="font-semibold text-[var(--ink)]">${invoice.id}</td>
                      <td class="font-medium text-[var(--ink)]">${invoice.customerName}</td>
                      <td class="text-[var(--ink-soft)]">${invoice.date}</td>
                      <td class="text-right font-semibold text-[var(--ink)]">${invoice.totalTtc.toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <div class="empty-state">
              <svg aria-hidden="true">
                <use href="./src/assets/icon-pack.svg#icon-invoice"></use>
              </svg>
              <p>Aucune facture disponible dans cet environnement de démonstration.</p>
            </div>
          `}
        </section>

        <section class="card p-6 space-y-5">
          <header class="flex items-center justify-between pb-3 border-b border-[var(--divider)]">
            <div class="space-y-1">
              <h2 class="text-xl font-bold text-[var(--ink)]">Flux bancaires récents</h2>
              <p class="text-sm text-[var(--ink-soft)]">Transactions mock pour les tests de rapprochement.</p>
            </div>
            <a href="#/bank" class="btn-link">Accéder à la banque</a>
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
                      <td class="text-[var(--ink-soft)]">${entry.date}</td>
                      <td class="font-medium text-[var(--ink)]">${entry.label}</td>
                      <td class="text-right font-semibold text-[var(--ink)]">${entry.amount.toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <div class="empty-state">
              <svg aria-hidden="true">
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
