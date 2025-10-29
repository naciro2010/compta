'use client'

import { useState, useEffect } from 'react'
import { useVATStore } from '@/store/vat'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus, FileText, Download, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import type { VATDeclaration, VATDeclarationStatus } from '@/types/vat'
import { formatVATAmount, formatVATRate } from '@/lib/vat/vat-calculation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function TaxPage() {
  const {
    declarations,
    selectedDeclaration,
    setSelectedDeclaration,
    createVATDeclaration,
    calculateVATDeclaration,
    validateVATDeclaration,
    submitVATDeclaration,
    generateSimplTVAXML,
    generateDeductionStatement,
  } = useVATStore()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number | null>(new Date().getMonth() + 1)
  const [period, setPeriod] = useState<'MONTHLY' | 'QUARTERLY'>('MONTHLY')

  // Statistiques
  const stats = {
    total: declarations.length,
    draft: declarations.filter((d) => d.status === 'DRAFT').length,
    submitted: declarations.filter((d) => d.status === 'SUBMITTED').length,
    paid: declarations.filter((d) => d.status === 'PAID').length,
  }

  const handleCreateDeclaration = () => {
    if (!selectedMonth) return

    const startDate = new Date(selectedYear, selectedMonth - 1, 1)
    const endDate = new Date(selectedYear, selectedMonth, 0)

    const declaration = createVATDeclaration({
      year: selectedYear,
      month: selectedMonth,
      period: 'MONTHLY',
      startDate,
      endDate,
    })

    calculateVATDeclaration(declaration.id)
    setShowCreateModal(false)
  }

  const handleValidateAndSubmit = (declarationId: string) => {
    const validation = validateVATDeclaration(declarationId)
    if (validation.valid) {
      submitVATDeclaration(declarationId, 'current-user')
      alert('Déclaration soumise avec succès !')
    } else {
      alert(`Erreurs de validation:\n${validation.errors.map((e) => e.message).join('\n')}`)
    }
  }

  const handleExportXML = (declarationId: string) => {
    try {
      const xmlExport = generateSimplTVAXML(declarationId, 'current-user')

      // Créer et déclencher le téléchargement du fichier XML
      const blob = new Blob([xmlExport.xmlContent], { type: 'application/xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = xmlExport.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      alert(`Export XML téléchargé: ${xmlExport.filename}`)
    } catch (error: any) {
      alert(`Erreur: ${error.message}`)
    }
  }

  const handleGenerateDeductionStatement = (declarationId: string) => {
    const statement = generateDeductionStatement(declarationId)
    alert(`Relevé de déductions généré (${statement.lines.length} lignes)`)
  }

  const getStatusBadge = (status: VATDeclarationStatus) => {
    const variants: Record<VATDeclarationStatus, { color: string; icon: any; label: string }> = {
      DRAFT: { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Brouillon' },
      IN_PROGRESS: { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'En cours' },
      READY: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Prête' },
      SUBMITTED: { color: 'bg-purple-100 text-purple-700', icon: CheckCircle, label: 'Soumise' },
      VALIDATED: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Validée' },
      REJECTED: { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Rejetée' },
      PAID: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Payée' },
      CANCELLED: { color: 'bg-gray-100 text-gray-700', icon: AlertCircle, label: 'Annulée' },
    }

    const variant = variants[status]
    const Icon = variant.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variant.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {variant.label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-claude-text">TVA & Fiscalité</h1>
          <p className="text-claude-text-muted mt-2">
            Déclarations TVA, Relevé de déductions et Export SIMPL-TVA
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Déclaration
        </Button>
      </header>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-claude-text-muted">Total</p>
                <p className="text-2xl font-bold text-claude-text">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-claude-text-muted" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-claude-text-muted">Brouillons</p>
                <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
              </div>
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-claude-text-muted">Soumises</p>
                <p className="text-2xl font-bold text-purple-600">{stats.submitted}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-claude-text-muted">Payées</p>
                <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Liste des déclarations */}
      <Card>
        <CardHeader>
          <CardTitle>Déclarations TVA</CardTitle>
          <CardDescription>Historique et suivi des déclarations</CardDescription>
        </CardHeader>
        <div className="p-6">
          {declarations.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-claude-text-muted mx-auto mb-4" />
              <p className="text-claude-text-muted mb-4">Aucune déclaration générée</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer la première déclaration
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {declarations.map((declaration) => (
                <div
                  key={declaration.id}
                  className="border border-claude-border rounded-lg p-4 hover:border-claude-primary transition-colors cursor-pointer"
                  onClick={() => setSelectedDeclaration(declaration.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-claude-text">
                        Déclaration {declaration.period === 'MONTHLY' ? 'Mensuelle' : 'Trimestrielle'} -{' '}
                        {declaration.month
                          ? format(new Date(declaration.year, declaration.month - 1), 'MMMM yyyy', { locale: fr })
                          : `T${declaration.quarter} ${declaration.year}`}
                      </h3>
                      <p className="text-sm text-claude-text-muted mt-1">
                        Du {format(declaration.startDate, 'dd/MM/yyyy')} au{' '}
                        {format(declaration.endDate, 'dd/MM/yyyy')}
                      </p>
                    </div>
                    {getStatusBadge(declaration.status)}
                  </div>

                  {/* Résumé financier */}
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-claude-text-muted">TVA Collectée</p>
                      <p className="text-sm font-semibold text-green-600">
                        {formatVATAmount(declaration.totalCollectedVAT)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-claude-text-muted">TVA Déductible</p>
                      <p className="text-sm font-semibold text-blue-600">
                        {formatVATAmount(declaration.totalDeductibleVAT)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-claude-text-muted">TVA à Payer</p>
                      <p className={`text-sm font-bold ${declaration.vatToPay >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatVATAmount(Math.abs(declaration.vatToPay))}
                        {declaration.vatToPay < 0 && ' (Crédit)'}
                      </p>
                    </div>
                  </div>

                  {/* Breakdown par taux */}
                  <div className="grid grid-cols-5 gap-2 mb-3 text-xs">
                    {[
                      { rate: 20, data: declaration.collected20 },
                      { rate: 14, data: declaration.collected14 },
                      { rate: 10, data: declaration.collected10 },
                      { rate: 7, data: declaration.collected7 },
                      { rate: 0, data: declaration.collected0 },
                    ].map(({ rate, data }) => (
                      <div key={rate} className="bg-gray-50 p-2 rounded">
                        <p className="text-claude-text-muted">{formatVATRate(rate as any)}</p>
                        <p className="font-medium">{formatVATAmount(data.vat)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-claude-border">
                    {(declaration.status === 'DRAFT' || declaration.status === 'IN_PROGRESS') && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleValidateAndSubmit(declaration.id)
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Soumettre
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleGenerateDeductionStatement(declaration.id)
                      }}
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Relevé Déductions
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleExportXML(declaration.id)
                      }}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Export XML
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Modal Création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-claude-text mb-4">Nouvelle Déclaration TVA</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-claude-text mb-1">Année</label>
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-claude-border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-claude-text mb-1">Période</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-claude-border rounded-md"
                >
                  <option value="MONTHLY">Mensuelle</option>
                  <option value="QUARTERLY">Trimestrielle</option>
                </select>
              </div>

              {period === 'MONTHLY' && (
                <div>
                  <label className="block text-sm font-medium text-claude-text mb-1">Mois</label>
                  <select
                    value={selectedMonth || ''}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-claude-border rounded-md"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <option key={month} value={month}>
                        {format(new Date(2024, month - 1), 'MMMM', { locale: fr })}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateDeclaration} className="flex-1">
                  Créer
                </Button>
                <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
