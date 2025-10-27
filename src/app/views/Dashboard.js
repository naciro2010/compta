import { getDataset } from '../views/_utils.js'

export function renderDashboard(){
  const ds = getDataset()
  const invOpen = ds.invoices.filter((i) => ['Validée', 'Partiellement payée'].includes(i.status))
  const toPay = invOpen.reduce((total, invoice) => {
    const paid = (invoice.payments || []).reduce((sum, payment) => sum + payment.amount, 0)
    return total + (invoice.totalTtc - paid)
  }, 0)

  // Calculate additional stats
  const totalRevenue = ds.invoices.reduce((sum, inv) => sum + (inv.totalTtc || 0), 0)
  const paidInvoices = ds.invoices.filter((i) => i.status === 'Payée')
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + (inv.totalTtc || 0), 0)

  const latestInvoices = ds.invoices.slice(0, 6)
  const latestBank = ds.bank.slice(0, 6)

  return `
    <div class="space-y-8">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <h1 class="text-3xl md:text-4xl font-bold text-[var(--ink)]">Tableau de bord</h1>
          <p class="text-base text-[var(--ink-soft)]">Vue d'ensemble de votre activité</p>
        </div>
        <div class="flex items-center gap-3">
          <button class="btn-outline">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exporter
          </button>
        </div>
      </div>

      <!-- Modern KPI Cards -->
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Revenue Card -->
        <div class="stat-card group hover-lift">
          <div class="flex items-start justify-between">
            <div class="space-y-3 flex-1">
              <div class="flex items-center gap-2">
                <span class="icon-circle-success">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <span class="stat-label">Chiffre d'affaires</span>
              </div>
              <div>
                <p class="stat-value">${totalRevenue.toLocaleString('fr-FR')} <span class="text-lg text-[var(--ink-muted)]">MAD</span></p>
                <p class="stat-description mt-1">Total des factures émises</p>
              </div>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-[var(--divider)]">
            <span class="stat-trend up">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              +12.5% ce mois
            </span>
          </div>
        </div>

        <!-- Open Invoices Card -->
        <div class="stat-card group hover-lift">
          <div class="flex items-start justify-between">
            <div class="space-y-3 flex-1">
              <div class="flex items-center gap-2">
                <span class="icon-circle-warning">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
                <span class="stat-label">Factures ouvertes</span>
              </div>
              <div>
                <p class="stat-value">${invOpen.length}</p>
                <p class="stat-description mt-1">En attente de paiement</p>
              </div>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-[var(--divider)]">
            <a href="#/sales" class="text-xs font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] inline-flex items-center gap-1">
              Voir les factures
              <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        <!-- Outstanding Amount Card -->
        <div class="stat-card group hover-lift">
          <div class="flex items-start justify-between">
            <div class="space-y-3 flex-1">
              <div class="flex items-center gap-2">
                <span class="icon-circle-danger">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <span class="stat-label">Encours clients</span>
              </div>
              <div>
                <p class="stat-value">${toPay.toLocaleString('fr-FR', {maximumFractionDigits: 0})} <span class="text-lg text-[var(--ink-muted)]">MAD</span></p>
                <p class="stat-description mt-1">Montant à recouvrer</p>
              </div>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-[var(--divider)]">
            <span class="stat-trend down">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
              </svg>
              -5% vs mois dernier
            </span>
          </div>
        </div>

        <!-- Bank Transactions Card -->
        <div class="stat-card group hover-lift">
          <div class="flex items-start justify-between">
            <div class="space-y-3 flex-1">
              <div class="flex items-center gap-2">
                <span class="icon-circle-accent">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </span>
                <span class="stat-label">Transactions</span>
              </div>
              <div>
                <p class="stat-value">${ds.bank.length}</p>
                <p class="stat-description mt-1">Opérations bancaires</p>
              </div>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-[var(--divider)]">
            <a href="#/bank" class="text-xs font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] inline-flex items-center gap-1">
              Rapprocher
              <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Latest Invoices -->
        <section class="card overflow-hidden">
          <div class="p-6 border-b border-[var(--divider)] bg-gradient-to-r from-[var(--surface-alt)] to-white">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="icon-circle-primary">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-lg font-bold text-[var(--ink)]">Dernières factures</h2>
                  <p class="text-xs text-[var(--ink-soft)]">6 plus récentes</p>
                </div>
              </div>
              <a href="#/sales" class="btn-outline btn-sm text-xs">
                Voir tout
                <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
          <div class="p-6">
            ${latestInvoices.length ? `
              <div class="space-y-4">
                ${latestInvoices.map((invoice) => `
                  <div class="flex items-center justify-between p-4 rounded-[var(--radius-lg)] border border-[var(--divider)] hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] transition-all duration-[var(--duration-fast)] cursor-pointer group">
                    <div class="flex items-center gap-4 flex-1">
                      <div class="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary-soft)] text-[var(--primary)] font-semibold text-sm group-hover:bg-[var(--primary)] group-hover:text-white transition-all">
                        ${invoice.id.split('-')[0]}
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="font-semibold text-[var(--ink)] truncate">${invoice.customerName}</p>
                        <p class="text-xs text-[var(--ink-muted)] mt-0.5">${invoice.id} • ${invoice.date}</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="font-bold text-[var(--ink)]">${invoice.totalTtc.toLocaleString('fr-FR')} <span class="text-xs text-[var(--ink-muted)]">MAD</span></p>
                      <span class="badge-${invoice.status === 'Payée' ? 'success' : invoice.status === 'Validée' ? 'warning' : 'soft'} text-xs mt-1">${invoice.status || 'Brouillon'}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="empty-state py-12">
                <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p class="empty-state-title">Aucune facture</p>
                <p class="empty-state-description">Commencez par créer votre première facture</p>
              </div>
            `}
          </div>
        </section>

        <!-- Latest Bank Transactions -->
        <section class="card overflow-hidden">
          <div class="p-6 border-b border-[var(--divider)] bg-gradient-to-r from-[var(--surface-alt)] to-white">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="icon-circle-accent">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-lg font-bold text-[var(--ink)]">Opérations bancaires</h2>
                  <p class="text-xs text-[var(--ink-soft)]">Transactions récentes</p>
                </div>
              </div>
              <a href="#/bank" class="btn-outline btn-sm text-xs">
                Voir tout
                <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
          <div class="p-6">
            ${latestBank.length ? `
              <div class="space-y-4">
                ${latestBank.map((entry) => `
                  <div class="flex items-center justify-between p-4 rounded-[var(--radius-lg)] border border-[var(--divider)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] transition-all duration-[var(--duration-fast)] cursor-pointer">
                    <div class="flex items-center gap-4 flex-1">
                      <div class="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] ${entry.amount >= 0 ? 'bg-[var(--success-soft)] text-[var(--success)]' : 'bg-[var(--danger-soft)] text-[var(--danger)]'}">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${entry.amount >= 0 ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' : 'M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6'}" />
                        </svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="font-medium text-[var(--ink)] truncate">${entry.label}</p>
                        <p class="text-xs text-[var(--ink-muted)] mt-0.5">${entry.date}</p>
                      </div>
                    </div>
                    <p class="font-bold text-lg ${entry.amount >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}">
                      ${entry.amount >= 0 ? '+' : ''}${entry.amount.toLocaleString('fr-FR')} <span class="text-xs text-[var(--ink-muted)]">MAD</span>
                    </p>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="empty-state py-12">
                <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <p class="empty-state-title">Aucune transaction</p>
                <p class="empty-state-description">Importez vos relevés bancaires pour commencer</p>
              </div>
            `}
          </div>
        </section>
      </div>
    </div>
  `
}
