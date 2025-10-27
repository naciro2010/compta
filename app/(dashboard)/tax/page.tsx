'use client'

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'

export default function TaxPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-claude-text">TVA & Fiscalité</h1>
        <p className="text-claude-text-muted mt-2">
          Déclarations TVA et exports SIMPL
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Déclarations TVA</CardTitle>
          <CardDescription>Suivi des déclarations fiscales</CardDescription>
        </CardHeader>
        <div className="p-12 text-center">
          <p className="text-claude-text-muted">Aucune déclaration générée</p>
        </div>
      </Card>
    </div>
  )
}
