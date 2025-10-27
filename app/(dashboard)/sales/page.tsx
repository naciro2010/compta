'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus, Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/Input'

const tabs = [
  { id: 'invoices', label: 'Factures' },
  { id: 'quotes', label: 'Devis' },
  { id: 'orders', label: 'Commandes' },
  { id: 'deliveries', label: 'Bons de livraison' },
  { id: 'credits', label: 'Avoirs' },
  { id: 'customers', label: 'Clients' },
]

const mockInvoices = [
  {
    id: 'FAC-2024-001',
    customer: 'Société ABC',
    date: '2024-10-25',
    due: '2024-11-25',
    ht: '12 708.33',
    tva: '2 541.67',
    ttc: '15 250.00',
    status: 'Payée',
  },
  {
    id: 'FAC-2024-002',
    customer: 'Client XYZ',
    date: '2024-10-24',
    due: '2024-11-24',
    ht: '7 416.67',
    tva: '1 483.33',
    ttc: '8 900.00',
    status: 'En attente',
  },
  {
    id: 'FAC-2024-003',
    customer: 'Entreprise 123',
    date: '2024-10-23',
    due: '2024-11-23',
    ht: '18 416.67',
    tva: '3 683.33',
    ttc: '22 100.00',
    status: 'Payée',
  },
]

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState('invoices')
  const [search, setSearch] = useState('')

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-claude-text">Module ventes</h1>
          <p className="text-claude-text-muted mt-2">
            Cycle complet Devis → Facture → Encaissements
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          Nouvelle facture
        </Button>
      </header>

      {/* Tabs */}
      <div className="border-b border-claude-border">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-1 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-claude-accent text-claude-accent'
                  : 'border-transparent text-claude-text-muted hover:text-claude-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {tabs.find((t) => t.id === activeTab)?.label || 'Documents'}
              </CardTitle>
              <CardDescription>
                Gérez vos documents de vente
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-claude-text-muted" />
                <Input
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button variant="secondary" size="sm">
                <Filter className="w-4 h-4" />
                Filtrer
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-claude-border">
                <th className="text-left p-3 text-sm font-medium text-claude-text-muted">#</th>
                <th className="text-left p-3 text-sm font-medium text-claude-text-muted">Client</th>
                <th className="text-left p-3 text-sm font-medium text-claude-text-muted">Émission</th>
                <th className="text-left p-3 text-sm font-medium text-claude-text-muted">Échéance</th>
                <th className="text-right p-3 text-sm font-medium text-claude-text-muted">HT</th>
                <th className="text-right p-3 text-sm font-medium text-claude-text-muted">TVA</th>
                <th className="text-right p-3 text-sm font-medium text-claude-text-muted">TTC</th>
                <th className="text-left p-3 text-sm font-medium text-claude-text-muted">Statut</th>
                <th className="text-right p-3 text-sm font-medium text-claude-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-t border-claude-border hover:bg-claude-surface-hover transition-colors"
                >
                  <td className="p-3 text-sm font-medium text-claude-text">{invoice.id}</td>
                  <td className="p-3 text-sm text-claude-text">{invoice.customer}</td>
                  <td className="p-3 text-sm text-claude-text-muted">{invoice.date}</td>
                  <td className="p-3 text-sm text-claude-text-muted">{invoice.due}</td>
                  <td className="p-3 text-sm text-right text-claude-text">{invoice.ht}</td>
                  <td className="p-3 text-sm text-right text-claude-text">{invoice.tva}</td>
                  <td className="p-3 text-sm text-right font-semibold text-claude-text">{invoice.ttc}</td>
                  <td className="p-3 text-sm">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'Payée'
                          ? 'bg-claude-success/10 text-claude-success'
                          : 'bg-claude-warning/10 text-claude-warning'
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-right">
                    <Button variant="ghost" size="sm">
                      Voir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
