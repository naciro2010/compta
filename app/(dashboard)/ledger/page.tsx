'use client'

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'

export default function LedgerPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-claude-text">Grand livre</h1>
        <p className="text-claude-text-muted mt-2">
          Plan comptable et écritures
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Écritures comptables</CardTitle>
          <CardDescription>Journal des écritures conformes au CGNC</CardDescription>
        </CardHeader>
        <div className="p-12 text-center">
          <p className="text-claude-text-muted">Aucune écriture comptable</p>
        </div>
      </Card>
    </div>
  )
}
