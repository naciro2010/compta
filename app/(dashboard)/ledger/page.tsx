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
      <div className="space-y-4 md:space-y-6 px-4 lg:px-0">
        <header>
          <h1 className="text-2xl md:text-3xl font-bold text-claude-text">Grand livre</h1>
          <p className="text-sm md:text-base text-claude-text-muted mt-2">
            Plan comptable et écritures conformes au CGNC
          </p>
        </header>

        <CompanySetup />
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <header className="px-4 lg:px-0">
        <h1 className="text-2xl md:text-3xl font-bold text-claude-text">Grand livre</h1>
        <p className="text-sm md:text-base text-claude-text-muted mt-2">
          Plan comptable et écritures conformes au CGNC
        </p>
      </header>

      {/* Onglets de navigation - Responsive */}
      <div className="flex gap-1 sm:gap-2 border-b border-claude-border overflow-x-auto px-4 lg:px-0 -mx-4 lg:mx-0">
        <button
          onClick={() => setActiveTab('entries')}
          className={`px-2 sm:px-4 py-2 font-medium transition-colors whitespace-nowrap text-xs sm:text-sm ${
            activeTab === 'entries'
              ? 'text-claude-accent border-b-2 border-claude-accent'
              : 'text-claude-text-muted hover:text-claude-text'
          }`}
        >
          <div className="flex items-center gap-1 sm:gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Saisie d'écritures</span>
            <span className="sm:hidden">Saisie</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-2 sm:px-4 py-2 font-medium transition-colors whitespace-nowrap text-xs sm:text-sm ${
            activeTab === 'ledger'
              ? 'text-claude-accent border-b-2 border-claude-accent'
              : 'text-claude-text-muted hover:text-claude-text'
          }`}
        >
          <div className="flex items-center gap-1 sm:gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Grand Livre</span>
            <span className="sm:hidden">Livre</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('balance')}
          className={`px-2 sm:px-4 py-2 font-medium transition-colors whitespace-nowrap text-xs sm:text-sm ${
            activeTab === 'balance'
              ? 'text-claude-accent border-b-2 border-claude-accent'
              : 'text-claude-text-muted hover:text-claude-text'
          }`}
        >
          <div className="flex items-center gap-1 sm:gap-2">
            <Scale className="w-4 h-4" />
            <span className="hidden sm:inline">Balance Générale</span>
            <span className="sm:hidden">Balance</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-2 sm:px-4 py-2 font-medium transition-colors whitespace-nowrap text-xs sm:text-sm ${
            activeTab === 'accounts'
              ? 'text-claude-accent border-b-2 border-claude-accent'
              : 'text-claude-text-muted hover:text-claude-text'
          }`}
        >
          <div className="flex items-center gap-1 sm:gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden md:inline">Plan de Comptes</span>
            <span className="md:hidden">Comptes</span>
          </div>
        </button>
      </div>

      {/* Contenu des onglets */}
      <div className="px-4 lg:px-0">
        {activeTab === 'entries' && <EntryForm />}
        {activeTab === 'ledger' && <GeneralLedger />}
        {activeTab === 'balance' && <Balance />}
        {activeTab === 'accounts' && <ChartOfAccounts />}
      </div>
    </div>
  )
}
