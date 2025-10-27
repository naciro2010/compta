'use client'

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'

export default function PurchasesPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-claude-text">Achats</h1>
          <p className="text-claude-text-muted mt-2">
            Gestion des achats et fournisseurs
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          Nouvel achat
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Factures d'achat</CardTitle>
          <CardDescription>Liste des factures fournisseurs</CardDescription>
        </CardHeader>
        <div className="p-12 text-center">
          <p className="text-claude-text-muted">Aucune facture d'achat enregistrée</p>
        </div>
      </Card>
    </div>
  )
}
