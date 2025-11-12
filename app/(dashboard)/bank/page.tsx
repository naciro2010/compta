'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Upload, Plus, CheckCircle2, XCircle } from 'lucide-react'
import { useBankStore } from '@/store/bank'

export default function BankPage() {
  const { accounts, transactions, getTransactionsByAccount, getReconciliationStats, selectedAccountId, selectAccount } = useBankStore()
  const [showAddAccount, setShowAddAccount] = useState(false)

  const currentAccount = selectedAccountId ? accounts.find(a => a.id === selectedAccountId) : accounts[0]
  const currentTransactions = currentAccount ? getTransactionsByAccount(currentAccount.id) : []
  const stats = currentAccount ? getReconciliationStats(currentAccount.id) : null

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-MA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-claude-text">Banque</h1>
          <p className="text-claude-text-muted mt-2">
            Rapprochement bancaire et relevés
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAddAccount(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un compte
          </Button>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Importer un relevé
          </Button>
        </div>
      </header>

      {/* Sélection de compte */}
      {accounts.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {accounts.map((account) => (
            <Button
              key={account.id}
              variant={currentAccount?.id === account.id ? 'primary' : 'outline'}
              onClick={() => selectAccount(account.id)}
            >
              {account.name}
            </Button>
          ))}
        </div>
      )}

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-claude-text-muted">Total transactions</div>
              <div className="text-2xl font-bold text-claude-text">{stats.totalTransactions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-claude-text-muted">Rapprochées</div>
              <div className="text-2xl font-bold text-green-600">{stats.reconciledCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-claude-text-muted">Non rapprochées</div>
              <div className="text-2xl font-bold text-orange-600">{stats.unreconciledCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-claude-text-muted">Solde</div>
              <div className="text-2xl font-bold text-claude-text">
                {formatAmount(currentAccount?.balance || 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Liste des transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions bancaires</CardTitle>
          <CardDescription>
            {currentAccount ? `Historique du compte ${currentAccount.name}` : 'Sélectionnez un compte'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-claude-text-muted">
                {accounts.length === 0
                  ? 'Ajoutez un compte bancaire pour commencer'
                  : 'Aucune transaction importée pour ce compte'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-claude-border">
                    <th className="text-left p-3 text-sm font-medium text-claude-text-muted">Date</th>
                    <th className="text-left p-3 text-sm font-medium text-claude-text-muted">Description</th>
                    <th className="text-left p-3 text-sm font-medium text-claude-text-muted">Référence</th>
                    <th className="text-right p-3 text-sm font-medium text-claude-text-muted">Montant</th>
                    <th className="text-center p-3 text-sm font-medium text-claude-text-muted">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-claude-border hover:bg-claude-surface">
                      <td className="p-3 text-sm text-claude-text">{formatDate(tx.date)}</td>
                      <td className="p-3 text-sm text-claude-text">{tx.description}</td>
                      <td className="p-3 text-sm text-claude-text-muted">{tx.reference || '-'}</td>
                      <td className={`p-3 text-sm text-right font-medium ${
                        tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {tx.type === 'CREDIT' ? '+' : '-'}{formatAmount(Math.abs(tx.amount))}
                      </td>
                      <td className="p-3 text-center">
                        {tx.isReconciled ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 inline-block" />
                        ) : (
                          <XCircle className="w-5 h-5 text-orange-600 inline-block" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
