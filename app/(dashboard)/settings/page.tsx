'use client'

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <header>
        <h1 className="text-3xl font-bold text-claude-text">Paramètres</h1>
        <p className="text-claude-text-muted mt-2">
          Configuration de l'application
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Informations société</CardTitle>
          <CardDescription>Coordonnées et identifiants fiscaux</CardDescription>
        </CardHeader>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company-name">Raison sociale</Label>
              <Input id="company-name" placeholder="Nom de la société" />
            </div>
            <div>
              <Label htmlFor="company-ice">ICE</Label>
              <Input id="company-ice" placeholder="000000000000000" maxLength={15} />
            </div>
            <div>
              <Label htmlFor="company-if">Identifiant fiscal (IF)</Label>
              <Input id="company-if" placeholder="IF..." />
            </div>
            <div>
              <Label htmlFor="company-rc">Registre de commerce (RC)</Label>
              <Input id="company-rc" placeholder="RC..." />
            </div>
          </div>
          <div>
            <Label htmlFor="company-address">Adresse</Label>
            <Input id="company-address" placeholder="Adresse complète" />
          </div>
          <div className="flex justify-end pt-4">
            <Button>Enregistrer</Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Paramètres TVA</CardTitle>
          <CardDescription>Configuration des taux de TVA</CardDescription>
        </CardHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {[20, 14, 10, 7].map((rate) => (
              <div key={rate} className="p-3 bg-claude-bg border border-claude-border rounded-lg text-center">
                <p className="text-2xl font-semibold text-claude-text">{rate}%</p>
                <p className="text-xs text-claude-text-muted mt-1">Taux standard</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
