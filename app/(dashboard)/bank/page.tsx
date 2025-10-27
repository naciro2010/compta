'use client'

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Upload } from 'lucide-react'

export default function BankPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-claude-text">Banque</h1>
          <p className="text-claude-text-muted mt-2">
            Rapprochement bancaire et relevés
          </p>
        </div>
        <Button>
          <Upload className="w-4 h-4" />
          Importer un relevé
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Transactions bancaires</CardTitle>
          <CardDescription>Historique des mouvements bancaires</CardDescription>
        </CardHeader>
        <div className="p-12 text-center">
          <p className="text-claude-text-muted">Aucune transaction bancaire importée</p>
        </div>
      </Card>
    </div>
  )
}
