'use client'

import { useState } from 'react'
import { useAccountingStore } from '@/store/accounting'
import { CompanySetup } from '@/components/accounting/CompanySetup'
import { ChartOfAccounts } from '@/components/accounting/ChartOfAccounts'
import { EntryForm } from '@/components/accounting/EntryForm'
import { GeneralLedger } from '@/components/accounting/GeneralLedger'
import { Balance } from '@/components/accounting/Balance'
import { Button } from '@/components/ui/Button'
import { BookOpen, FileText, Scale, Plus } from 'lucide-react'

export default function LedgerPage() {
  const { companySettings } = useAccountingStore()
  const [activeTab, setActiveTab] = useState<'entries' | 'ledger' | 'balance' | 'accounts'>(
    'entries'
  )

  if (!companySettings) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-claude-text">Grand livre</h1>
          <p className="text-claude-text-muted mt-2">
            Plan comptable et écritures conformes au CGNC
          </p>
        </header>

        <CompanySetup />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-claude-text">Grand livre</h1>
        <p className="text-claude-text-muted mt-2">
          Plan comptable et écritures conformes au CGNC
        </p>
      </header>

      {/* Onglets de navigation */}
      <div className="flex gap-2 border-b border-claude-border">
        <button
          onClick={() => setActiveTab('entries')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'entries'
              ? 'text-claude-accent border-b-2 border-claude-accent'
              : 'text-claude-text-muted hover:text-claude-text'
          }`}
        >
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Saisie d'écritures
          </div>
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'ledger'
              ? 'text-claude-accent border-b-2 border-claude-accent'
              : 'text-claude-text-muted hover:text-claude-text'
          }`}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Grand Livre
          </div>
        </button>
        <button
          onClick={() => setActiveTab('balance')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'balance'
              ? 'text-claude-accent border-b-2 border-claude-accent'
              : 'text-claude-text-muted hover:text-claude-text'
          }`}
        >
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4" />
            Balance Générale
          </div>
        </button>
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'accounts'
              ? 'text-claude-accent border-b-2 border-claude-accent'
              : 'text-claude-text-muted hover:text-claude-text'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Plan de Comptes
          </div>
        </button>
      </div>

      {/* Contenu des onglets */}
      <div>
        {activeTab === 'entries' && <EntryForm />}
        {activeTab === 'ledger' && <GeneralLedger />}
        {activeTab === 'balance' && <Balance />}
        {activeTab === 'accounts' && <ChartOfAccounts />}
      </div>
    </div>
  )
}
