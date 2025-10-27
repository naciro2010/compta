'use client'

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { TrendingUp, Users, FileText, Banknote } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold text-claude-text">Vue d'ensemble</h1>
        <p className="text-claude-text-muted mt-2">
          Suivi en temps réel de votre activité comptable
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="CA du mois"
          value="125 450 MAD"
          change="+12.5%"
          icon={<TrendingUp className="w-5 h-5" />}
          trend="up"
        />
        <StatCard
          title="Factures ouvertes"
          value="24"
          change="+3"
          icon={<FileText className="w-5 h-5" />}
          trend="up"
        />
        <StatCard
          title="Encours clients"
          value="89 230 MAD"
          change="-5.2%"
          icon={<Banknote className="w-5 h-5" />}
          trend="down"
        />
        <StatCard
          title="Clients actifs"
          value="142"
          change="+8"
          icon={<Users className="w-5 h-5" />}
          trend="up"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dernières factures</CardTitle>
            <CardDescription>Activité récente de facturation</CardDescription>
          </CardHeader>
          <div className="space-y-3">
            {[
              { id: 'FAC-2024-001', client: 'Société ABC', amount: '15 250 MAD', status: 'Payée' },
              { id: 'FAC-2024-002', client: 'Client XYZ', amount: '8 900 MAD', status: 'En attente' },
              { id: 'FAC-2024-003', client: 'Entreprise 123', amount: '22 100 MAD', status: 'Payée' },
            ].map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-3 bg-claude-bg rounded-lg border border-claude-border"
              >
                <div>
                  <p className="font-medium text-claude-text">{invoice.id}</p>
                  <p className="text-sm text-claude-text-muted">{invoice.client}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-claude-text">{invoice.amount}</p>
                  <p
                    className={`text-sm ${
                      invoice.status === 'Payée' ? 'text-claude-success' : 'text-claude-warning'
                    }`}
                  >
                    {invoice.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flux bancaires récents</CardTitle>
            <CardDescription>Transactions bancaires importées</CardDescription>
          </CardHeader>
          <div className="space-y-3">
            {[
              { date: '2024-10-25', label: 'Virement client ABC', amount: '+15 250 MAD' },
              { date: '2024-10-24', label: 'Prélèvement CNSS', amount: '-4 500 MAD' },
              { date: '2024-10-23', label: 'Paiement fournisseur', amount: '-12 800 MAD' },
            ].map((transaction, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-claude-bg rounded-lg border border-claude-border"
              >
                <div>
                  <p className="font-medium text-claude-text">{transaction.label}</p>
                  <p className="text-sm text-claude-text-muted">{transaction.date}</p>
                </div>
                <p
                  className={`font-semibold ${
                    transaction.amount.startsWith('+') ? 'text-claude-success' : 'text-claude-danger'
                  }`}
                >
                  {transaction.amount}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  change: string
  icon: React.ReactNode
  trend: 'up' | 'down'
}

function StatCard({ title, value, change, icon, trend }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-claude-text-muted mb-1">{title}</p>
          <p className="text-2xl font-bold text-claude-text">{value}</p>
          <p
            className={`text-sm mt-2 ${
              trend === 'up' ? 'text-claude-success' : 'text-claude-danger'
            }`}
          >
            {change} ce mois
          </p>
        </div>
        <div className="w-12 h-12 bg-claude-accent/10 rounded-lg flex items-center justify-center text-claude-accent">
          {icon}
        </div>
      </div>
    </Card>
  )
}
