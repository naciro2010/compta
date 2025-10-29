'use client'

import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  TrendingUp,
  FileText,
  Clock,
  AlertTriangle,
  DollarSign,
  Users,
  Receipt,
  Percent
} from 'lucide-react'
import { useInvoicingStore } from '@/store/invoicing'
import { StatCard } from '@/components/sales/StatCard'
import { SimpleBarChart } from '@/components/sales/SimpleBarChart'
import { QuickActions } from '@/components/sales/QuickActions'
import { formatCurrency, formatDate } from '@/lib/utils'
import { InvoiceStatus } from '@/types/invoicing'

export default function SalesPage() {
  const { invoices, getCustomers } = useInvoicingStore()
  const customers = getCustomers()

  // Calcul des statistiques
  const stats = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Filtrer les factures de vente (pas d'achat)
    const salesInvoices = invoices.filter(inv =>
      inv.type === 'INVOICE' || inv.type === 'PROFORMA'
    )

    // CA total
    const totalRevenue = salesInvoices
      .filter(inv => inv.status !== 'DRAFT')
      .reduce((sum, inv) => sum + inv.totalTTC, 0)

    // CA du mois en cours
    const monthRevenue = salesInvoices
      .filter(inv => {
        const invDate = new Date(inv.issueDate)
        return invDate.getMonth() === currentMonth &&
               invDate.getFullYear() === currentYear &&
               inv.status !== 'DRAFT'
      })
      .reduce((sum, inv) => sum + inv.totalTTC, 0)

    // Factures en attente
    const pendingInvoices = salesInvoices.filter(inv =>
      inv.status === 'SENT' || inv.status === 'VIEWED' || inv.status === 'PARTIALLY_PAID'
    )
    const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.amountDue, 0)

    // Factures en retard
    const overdueInvoices = salesInvoices.filter(inv =>
      inv.status === 'OVERDUE'
    )
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.amountDue, 0)

    // Taux de recouvrement
    const totalBilled = salesInvoices
      .filter(inv => inv.status !== 'DRAFT')
      .reduce((sum, inv) => sum + inv.totalTTC, 0)
    const totalPaid = salesInvoices
      .reduce((sum, inv) => sum + inv.amountPaid, 0)
    const recoveryRate = totalBilled > 0 ? (totalPaid / totalBilled) * 100 : 0

    // CA par mois (12 derniers mois)
    const monthlyRevenue = []
    for (let i = 11; i >= 0; i--) {
      const targetDate = new Date(currentYear, currentMonth - i, 1)
      const month = targetDate.getMonth()
      const year = targetDate.getFullYear()

      const revenue = salesInvoices
        .filter(inv => {
          const invDate = new Date(inv.issueDate)
          return invDate.getMonth() === month &&
                 invDate.getFullYear() === year &&
                 inv.status !== 'DRAFT'
        })
        .reduce((sum, inv) => sum + inv.totalTTC, 0)

      monthlyRevenue.push({
        label: targetDate.toLocaleDateString('fr-MA', { month: 'short', year: '2-digit' }),
        value: revenue
      })
    }

    // Répartition par statut
    const statusBreakdown = [
      {
        label: 'Payées',
        value: salesInvoices.filter(inv => inv.status === 'PAID').length,
        color: 'bg-green-500'
      },
      {
        label: 'En attente',
        value: pendingInvoices.length,
        color: 'bg-blue-500'
      },
      {
        label: 'En retard',
        value: overdueInvoices.length,
        color: 'bg-red-500'
      },
      {
        label: 'Brouillons',
        value: salesInvoices.filter(inv => inv.status === 'DRAFT').length,
        color: 'bg-gray-500'
      }
    ]

    // Répartition TVA
    const vatBreakdown = salesInvoices
      .filter(inv => inv.status !== 'DRAFT')
      .flatMap(inv => inv.vatBreakdown || [])
      .reduce((acc, vat) => {
        const existing = acc.find(v => v.label === `TVA ${vat.rate}%`)
        if (existing) {
          existing.value += vat.amount
        } else {
          acc.push({
            label: `TVA ${vat.rate}%`,
            value: vat.amount,
            color: vat.rate === 20 ? 'bg-purple-500' :
                   vat.rate === 14 ? 'bg-blue-500' :
                   vat.rate === 10 ? 'bg-green-500' :
                   vat.rate === 7 ? 'bg-orange-500' : 'bg-gray-500'
          })
        }
        return acc
      }, [] as { label: string; value: number; color: string }[])
      .sort((a, b) => b.value - a.value)

    // Top 5 clients par CA
    const customerRevenue = customers.map(customer => {
      const revenue = salesInvoices
        .filter(inv => inv.thirdPartyId === customer.id && inv.status !== 'DRAFT')
        .reduce((sum, inv) => sum + inv.totalTTC, 0)
      return {
        customer,
        revenue
      }
    })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(item => ({
        label: item.customer.name,
        value: item.revenue
      }))

    return {
      totalRevenue,
      monthRevenue,
      pendingAmount,
      pendingCount: pendingInvoices.length,
      overdueAmount,
      overdueCount: overdueInvoices.length,
      recoveryRate,
      monthlyRevenue,
      statusBreakdown,
      vatBreakdown,
      customerRevenue
    }
  }, [invoices, customers])

  // Dernières factures
  const recentInvoices = useMemo(() => {
    return invoices
      .filter(inv => inv.type === 'INVOICE' || inv.type === 'PROFORMA')
      .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
      .slice(0, 5)
  }, [invoices])

  const getStatusBadge = (status: InvoiceStatus) => {
    const statusConfig: Record<InvoiceStatus, { label: string; class: string }> = {
      DRAFT: { label: 'Brouillon', class: 'bg-gray-500/10 text-gray-500' },
      SENT: { label: 'Envoyée', class: 'bg-blue-500/10 text-blue-500' },
      VIEWED: { label: 'Vue', class: 'bg-purple-500/10 text-purple-500' },
      PAID: { label: 'Payée', class: 'bg-green-500/10 text-green-500' },
      PARTIALLY_PAID: { label: 'Part. payée', class: 'bg-orange-500/10 text-orange-500' },
      OVERDUE: { label: 'En retard', class: 'bg-red-500/10 text-red-500' },
      CANCELLED: { label: 'Annulée', class: 'bg-gray-500/10 text-gray-500' },
      CONVERTED: { label: 'Convertie', class: 'bg-cyan-500/10 text-cyan-500' },
    }
    const config = statusConfig[status]
    return (
      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-claude-text">Dashboard Ventes</h1>
          <p className="text-claude-text-muted mt-2">
            Vue d'ensemble de votre activité commerciale
          </p>
        </div>
      </header>

      {/* Actions rapides */}
      <QuickActions />

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="CA du mois"
          value={formatCurrency(stats.monthRevenue)}
          subtitle="Chiffre d'affaires mensuel"
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="En attente"
          value={formatCurrency(stats.pendingAmount)}
          subtitle={`${stats.pendingCount} facture(s) en attente`}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="En retard"
          value={formatCurrency(stats.overdueAmount)}
          subtitle={`${stats.overdueCount} facture(s) en retard`}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Taux recouvrement"
          value={`${stats.recoveryRate.toFixed(1)}%`}
          subtitle="Paiements reçus / Facturé"
          icon={Percent}
          color="green"
        />
      </div>

      {/* KPIs secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="CA total"
          value={formatCurrency(stats.totalRevenue)}
          subtitle="Toutes factures confondues"
          icon={DollarSign}
          color="purple"
        />
        <StatCard
          title="Clients actifs"
          value={customers.filter(c => c.isActive).length}
          subtitle={`sur ${customers.length} clients totaux`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Factures émises"
          value={invoices.filter(inv =>
            (inv.type === 'INVOICE' || inv.type === 'PROFORMA') &&
            inv.status !== 'DRAFT'
          ).length}
          subtitle="Hors brouillons"
          icon={Receipt}
          color="green"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart
          title="📈 CA des 12 derniers mois"
          data={stats.monthlyRevenue}
          formatValue={(v) => formatCurrency(v, false)}
        />
        <SimpleBarChart
          title="📊 Factures par statut"
          data={stats.statusBreakdown}
          formatValue={(v) => `${v} facture(s)`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats.vatBreakdown.length > 0 && (
          <SimpleBarChart
            title="💰 Répartition TVA collectée"
            data={stats.vatBreakdown}
            formatValue={(v) => formatCurrency(v, false)}
          />
        )}
        {stats.customerRevenue.length > 0 && (
          <SimpleBarChart
            title="🏆 Top 5 clients par CA"
            data={stats.customerRevenue}
            formatValue={(v) => formatCurrency(v, false)}
          />
        )}
      </div>

      {/* Dernières factures */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dernières factures</CardTitle>
              <CardDescription>Les 5 factures les plus récentes</CardDescription>
            </div>
            <Button variant="secondary" size="sm" onClick={() => window.location.href = '/invoices'}>
              Voir tout
            </Button>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          {recentInvoices.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto text-claude-text-muted mb-3" />
              <p className="text-claude-text-muted">Aucune facture pour le moment</p>
              <Button className="mt-4" onClick={() => window.location.href = '/invoices'}>
                Créer votre première facture
              </Button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-t border-claude-border">
                  <th className="text-left p-3 text-sm font-medium text-claude-text-muted">Numéro</th>
                  <th className="text-left p-3 text-sm font-medium text-claude-text-muted">Client</th>
                  <th className="text-left p-3 text-sm font-medium text-claude-text-muted">Date</th>
                  <th className="text-left p-3 text-sm font-medium text-claude-text-muted">Échéance</th>
                  <th className="text-right p-3 text-sm font-medium text-claude-text-muted">Montant TTC</th>
                  <th className="text-right p-3 text-sm font-medium text-claude-text-muted">Restant dû</th>
                  <th className="text-left p-3 text-sm font-medium text-claude-text-muted">Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((invoice) => {
                  const thirdParty = customers.find(c => c.id === invoice.thirdPartyId)
                  return (
                    <tr
                      key={invoice.id}
                      className="border-t border-claude-border hover:bg-claude-surface-hover transition-colors cursor-pointer"
                      onClick={() => window.location.href = '/invoices'}
                    >
                      <td className="p-3 text-sm font-medium text-claude-text">
                        {invoice.number || 'DRAFT'}
                      </td>
                      <td className="p-3 text-sm text-claude-text">
                        {thirdParty?.name || 'N/A'}
                      </td>
                      <td className="p-3 text-sm text-claude-text-muted">
                        {formatDate(invoice.issueDate)}
                      </td>
                      <td className="p-3 text-sm text-claude-text-muted">
                        {invoice.dueDate ? formatDate(invoice.dueDate) : '-'}
                      </td>
                      <td className="p-3 text-sm text-right font-semibold text-claude-text">
                        {formatCurrency(invoice.totalTTC)}
                      </td>
                      <td className="p-3 text-sm text-right text-claude-text">
                        {formatCurrency(invoice.amountDue)}
                      </td>
                      <td className="p-3 text-sm">
                        {getStatusBadge(invoice.status)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Footer avec conseils */}
      {stats.overdueCount > 0 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-red-500 mb-2">
                  ⚠️ Action requise : {stats.overdueCount} facture(s) en retard
                </h3>
                <p className="text-claude-text-muted mb-3">
                  Vous avez <strong>{formatCurrency(stats.overdueAmount)}</strong> de créances en souffrance.
                  Pensez à envoyer des relances pour améliorer votre trésorerie.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.location.href = '/invoices'}
                >
                  Voir les factures en retard
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
