'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'
import { Settings, Hash, Building, Percent, ChevronRight } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <header>
        <h1 className="text-3xl font-bold text-claude-text">Paramètres</h1>
        <p className="text-claude-text-muted mt-2">
          Configuration de l'application
        </p>
      </header>

      {/* Navigation rapide */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/settings/numbering">
          <Card className="hover:border-blue-500 transition-colors cursor-pointer h-full">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Hash className="h-6 w-6 text-blue-400" />
                </div>
                <ChevronRight className="h-5 w-5 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-white mt-3">Numérotation</h3>
              <p className="text-sm text-gray-400 mt-1">
                Configurer les formats de numérotation des documents
              </p>
            </div>
          </Card>
        </Link>

        <Card className="opacity-50 cursor-not-allowed h-full">
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="p-2 bg-gray-700 rounded-lg">
                <Building className="h-6 w-6 text-gray-500" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-white mt-3">Informations société</h3>
            <p className="text-sm text-gray-400 mt-1">
              Coordonnées et identifiants fiscaux
            </p>
          </div>
        </Card>

        <Card className="opacity-50 cursor-not-allowed h-full">
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="p-2 bg-gray-700 rounded-lg">
                <Percent className="h-6 w-6 text-gray-500" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-white mt-3">Paramètres TVA</h3>
            <p className="text-sm text-gray-400 mt-1">
              Configuration des taux de TVA
            </p>
          </div>
        </Card>
      </div>

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
