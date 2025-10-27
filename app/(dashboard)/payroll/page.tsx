'use client'

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'

export default function PayrollPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-claude-text">Paie</h1>
          <p className="text-claude-text-muted mt-2">
            Gestion de la paie et déclarations CNSS
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          Nouveau bulletin
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Bulletins de paie</CardTitle>
          <CardDescription>Historique des bulletins et déclarations</CardDescription>
        </CardHeader>
        <div className="p-12 text-center">
          <p className="text-claude-text-muted">Aucun bulletin de paie</p>
        </div>
      </Card>
    </div>
  )
}
