'use client'

import { useState, useEffect } from 'react'
import { useAccountingStore } from '@/store/accounting'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { FileText, Download, CheckCircle, Lock, AlertCircle, FileSpreadsheet } from 'lucide-react'
import type { FinancialStatementsPack } from '@/types/financial-statements'

export default function FinancialStatementsPage() {
  const {
    fiscalYears,
    companySettings,
    currentUser,
    financialStatements,
    currentFinancialStatements,
    generateFinancialStatements,
    getFinancialStatements,
    validateFinancialStatements,
    lockFinancialStatements,
    setCurrentFinancialStatements,
    updateStatementModel,
  } = useAccountingStore()

  const [selectedYear, setSelectedYear] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'BL' | 'CPC' | 'ESG' | 'TF' | 'ETIC'>('BL')

  useEffect(() => {
    if (fiscalYears.length > 0 && !selectedYear) {
      setSelectedYear(fiscalYears[0].id)
      const existing = getFinancialStatements(fiscalYears[0].id)
      if (existing) {
        setCurrentFinancialStatements(existing)
      }
    }
  }, [fiscalYears, selectedYear, getFinancialStatements, setCurrentFinancialStatements])

  const handleGenerate = () => {
    if (!selectedYear) return
    setIsGenerating(true)
    try {
      const pack = generateFinancialStatements(selectedYear)
      if (pack) {
        setCurrentFinancialStatements(pack)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleValidate = () => {
    if (!currentFinancialStatements) return
    validateFinancialStatements(currentFinancialStatements.id)
  }

  const handleLock = () => {
    if (!currentFinancialStatements) return
    lockFinancialStatements(currentFinancialStatements.id)
  }

  const handleYearChange = (yearId: string) => {
    setSelectedYear(yearId)
    const existing = getFinancialStatements(yearId)
    if (existing) {
      setCurrentFinancialStatements(existing)
    } else {
      setCurrentFinancialStatements(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
            <AlertCircle className="w-3 h-3" />
            Brouillon
          </span>
        )
      case 'VALIDATED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
            <CheckCircle className="w-3 h-3" />
            Validé
          </span>
        )
      case 'LOCKED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
            <Lock className="w-3 h-3" />
            Verrouillé
          </span>
        )
      default:
        return null
    }
  }

  const getModelBadge = (model: string) => {
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${
        model === 'NORMAL'
          ? 'bg-blue-100 text-blue-800'
          : 'bg-purple-100 text-purple-800'
      }`}>
        {model}
      </span>
    )
  }

  const renderValidationErrors = () => {
    if (!currentFinancialStatements) return null

    const errors = currentFinancialStatements.validations.flatMap(v => v.errors)
    const warnings = currentFinancialStatements.validations.flatMap(v => v.warnings)

    if (errors.length === 0 && warnings.length === 0) return null

    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 text-base">Contrôles de cohérence</CardTitle>
        </CardHeader>
        <div className="p-4 space-y-4">
          {errors.length > 0 && (
            <div>
              <h4 className="font-semibold text-red-800 mb-2">Erreurs ({errors.length})</h4>
              <ul className="space-y-1">
                {errors.map((error, idx) => (
                  <li key={idx} className="text-sm text-red-700">
                    • {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {warnings.length > 0 && (
            <div>
              <h4 className="font-semibold text-orange-800 mb-2">Avertissements ({warnings.length})</h4>
              <ul className="space-y-1">
                {warnings.map((warning, idx) => (
                  <li key={idx} className="text-sm text-orange-700">
                    • {warning.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>
    )
  }

  const renderBilan = () => {
    if (!currentFinancialStatements) return null
    const { bilan } = currentFinancialStatements

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ACTIF */}
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-lg">ACTIF</CardTitle>
            </CardHeader>
            <div className="p-4">
              <div className="space-y-2 text-sm">
                <div className="font-semibold border-b pb-2">ACTIF IMMOBILISÉ</div>
                {bilan.actif.immobilisationsEnNonValeurs.map(line => (
                  <div key={line.code} className="flex justify-between pl-4">
                    <span>{line.label}</span>
                    <span className="font-mono">{line.currentYear.toLocaleString('fr-MA')} DH</span>
                  </div>
                ))}
                {bilan.actif.immobilisationsIncorporelles.map(line => (
                  <div key={line.code} className="flex justify-between pl-4">
                    <span>{line.label}</span>
                    <span className="font-mono">{line.currentYear.toLocaleString('fr-MA')} DH</span>
                  </div>
                ))}
                {bilan.actif.immobilisationsCorpoelles.map(line => (
                  <div key={line.code} className="flex justify-between pl-4">
                    <span>{line.label}</span>
                    <span className="font-mono">{line.currentYear.toLocaleString('fr-MA')} DH</span>
                  </div>
                ))}
                <div className="font-bold border-t pt-2 flex justify-between bg-blue-50 px-2 py-1">
                  <span>{bilan.actif.totalActifImmobilise.label}</span>
                  <span className="font-mono">
                    {bilan.actif.totalActifImmobilise.currentYear.toLocaleString('fr-MA')} DH
                  </span>
                </div>

                <div className="font-semibold border-b pb-2 mt-4">ACTIF CIRCULANT</div>
                {bilan.actif.stocks.map(line => (
                  <div key={line.code} className="flex justify-between pl-4">
                    <span>{line.label}</span>
                    <span className="font-mono">{line.currentYear.toLocaleString('fr-MA')} DH</span>
                  </div>
                ))}
                {bilan.actif.creances.map(line => (
                  <div key={line.code} className="flex justify-between pl-4">
                    <span>{line.label}</span>
                    <span className="font-mono">{line.currentYear.toLocaleString('fr-MA')} DH</span>
                  </div>
                ))}
                <div className="font-bold border-t pt-2 flex justify-between bg-blue-50 px-2 py-1">
                  <span>{bilan.actif.totalActifCirculant.label}</span>
                  <span className="font-mono">
                    {bilan.actif.totalActifCirculant.currentYear.toLocaleString('fr-MA')} DH
                  </span>
                </div>

                <div className="font-semibold border-b pb-2 mt-4">TRÉSORERIE - ACTIF</div>
                {bilan.actif.tresorerie.map(line => (
                  <div key={line.code} className="flex justify-between pl-4">
                    <span>{line.label}</span>
                    <span className="font-mono">{line.currentYear.toLocaleString('fr-MA')} DH</span>
                  </div>
                ))}
                <div className="font-bold border-t pt-2 flex justify-between bg-blue-50 px-2 py-1">
                  <span>{bilan.actif.totalTresorerie.label}</span>
                  <span className="font-mono">
                    {bilan.actif.totalTresorerie.currentYear.toLocaleString('fr-MA')} DH
                  </span>
                </div>

                <div className="font-bold text-lg border-t-2 pt-2 mt-4 flex justify-between bg-blue-100 px-2 py-2">
                  <span>{bilan.actif.totalGeneral.label}</span>
                  <span className="font-mono">
                    {bilan.actif.totalGeneral.currentYear.toLocaleString('fr-MA')} DH
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* PASSIF */}
          <Card>
            <CardHeader className="bg-green-50">
              <CardTitle className="text-lg">PASSIF</CardTitle>
            </CardHeader>
            <div className="p-4">
              <div className="space-y-2 text-sm">
                <div className="font-semibold border-b pb-2">FINANCEMENT PERMANENT</div>
                {bilan.passif.capitauxPropres.map(line => (
                  <div key={line.code} className="flex justify-between pl-4">
                    <span>{line.label}</span>
                    <span className="font-mono">{line.currentYear.toLocaleString('fr-MA')} DH</span>
                  </div>
                ))}
                {bilan.passif.dettesDeFinancement.map(line => (
                  <div key={line.code} className="flex justify-between pl-4">
                    <span>{line.label}</span>
                    <span className="font-mono">{line.currentYear.toLocaleString('fr-MA')} DH</span>
                  </div>
                ))}
                <div className="font-bold border-t pt-2 flex justify-between bg-green-50 px-2 py-1">
                  <span>{bilan.passif.totalFinancementPermanent.label}</span>
                  <span className="font-mono">
                    {bilan.passif.totalFinancementPermanent.currentYear.toLocaleString('fr-MA')} DH
                  </span>
                </div>

                <div className="font-semibold border-b pb-2 mt-4">PASSIF CIRCULANT</div>
                {bilan.passif.dettesPassifCirculant.map(line => (
                  <div key={line.code} className="flex justify-between pl-4">
                    <span>{line.label}</span>
                    <span className="font-mono">{line.currentYear.toLocaleString('fr-MA')} DH</span>
                  </div>
                ))}
                <div className="font-bold border-t pt-2 flex justify-between bg-green-50 px-2 py-1">
                  <span>{bilan.passif.totalPassifCirculant.label}</span>
                  <span className="font-mono">
                    {bilan.passif.totalPassifCirculant.currentYear.toLocaleString('fr-MA')} DH
                  </span>
                </div>

                <div className="font-semibold border-b pb-2 mt-4">TRÉSORERIE - PASSIF</div>
                {bilan.passif.tresoreriePassif.map(line => (
                  <div key={line.code} className="flex justify-between pl-4">
                    <span>{line.label}</span>
                    <span className="font-mono">{line.currentYear.toLocaleString('fr-MA')} DH</span>
                  </div>
                ))}
                <div className="font-bold border-t pt-2 flex justify-between bg-green-50 px-2 py-1">
                  <span>{bilan.passif.totalTresoreriePassif.label}</span>
                  <span className="font-mono">
                    {bilan.passif.totalTresoreriePassif.currentYear.toLocaleString('fr-MA')} DH
                  </span>
                </div>

                <div className="font-bold text-lg border-t-2 pt-2 mt-4 flex justify-between bg-green-100 px-2 py-2">
                  <span>{bilan.passif.totalGeneral.label}</span>
                  <span className="font-mono">
                    {bilan.passif.totalGeneral.currentYear.toLocaleString('fr-MA')} DH
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Équilibrage */}
        <Card className={bilan.isBalanced ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                {bilan.isBalanced ? '✓ Bilan équilibré' : '⚠ Bilan non équilibré'}
              </span>
              {!bilan.isBalanced && (
                <span className="text-sm text-red-700">
                  Différence: {bilan.difference.toLocaleString('fr-MA')} DH
                </span>
              )}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  const renderCPC = () => {
    if (!currentFinancialStatements) return null
    const { cpc } = currentFinancialStatements

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compte de Produits et Charges</CardTitle>
          </CardHeader>
          <div className="p-4">
            <div className="space-y-4 text-sm">
              {/* Produits d'exploitation */}
              <div>
                <div className="font-semibold border-b pb-2 bg-green-50 px-2 py-1">PRODUITS D'EXPLOITATION</div>
                {cpc.produitsExploitation.map(line => (
                  <div key={line.code} className="flex justify-between pl-4 py-1">
                    <span>{line.label}</span>
                    <span className="font-mono text-green-700">{line.currentYear.toLocaleString('fr-MA')} DH</span>
                  </div>
                ))}
                <div className="font-bold flex justify-between bg-green-100 px-2 py-1 mt-2">
                  <span>{cpc.totalProduitsExploitation.label}</span>
                  <span className="font-mono">{cpc.totalProduitsExploitation.currentYear.toLocaleString('fr-MA')} DH</span>
                </div>
              </div>

              {/* Charges d'exploitation */}
              <div>
                <div className="font-semibold border-b pb-2 bg-red-50 px-2 py-1">CHARGES D'EXPLOITATION</div>
                {cpc.chargesExploitation.map(line => (
                  <div key={line.code} className="flex justify-between pl-4 py-1">
                    <span>{line.label}</span>
                    <span className="font-mono text-red-700">{line.currentYear.toLocaleString('fr-MA')} DH</span>
                  </div>
                ))}
                <div className="font-bold flex justify-between bg-red-100 px-2 py-1 mt-2">
                  <span>{cpc.totalChargesExploitation.label}</span>
                  <span className="font-mono">{cpc.totalChargesExploitation.currentYear.toLocaleString('fr-MA')} DH</span>
                </div>
              </div>

              {/* Résultat d'exploitation */}
              <div className="font-bold text-lg flex justify-between bg-blue-100 px-2 py-2 border-t-2">
                <span>{cpc.resultatExploitation.label}</span>
                <span className="font-mono">{cpc.resultatExploitation.currentYear.toLocaleString('fr-MA')} DH</span>
              </div>

              {/* Résultat financier */}
              <div className="font-bold flex justify-between bg-gray-100 px-2 py-2">
                <span>{cpc.resultatFinancier.label}</span>
                <span className="font-mono">{cpc.resultatFinancier.currentYear.toLocaleString('fr-MA')} DH</span>
              </div>

              {/* Résultat courant */}
              <div className="font-bold text-lg flex justify-between bg-blue-100 px-2 py-2 border-t-2">
                <span>{cpc.resultatCourant.label}</span>
                <span className="font-mono">{cpc.resultatCourant.currentYear.toLocaleString('fr-MA')} DH</span>
              </div>

              {/* Résultat non courant */}
              <div className="font-bold flex justify-between bg-gray-100 px-2 py-2">
                <span>{cpc.resultatNonCourant.label}</span>
                <span className="font-mono">{cpc.resultatNonCourant.currentYear.toLocaleString('fr-MA')} DH</span>
              </div>

              {/* Résultat avant impôts */}
              <div className="font-bold text-lg flex justify-between bg-blue-100 px-2 py-2 border-t-2">
                <span>{cpc.resultatAvantImpots.label}</span>
                <span className="font-mono">{cpc.resultatAvantImpots.currentYear.toLocaleString('fr-MA')} DH</span>
              </div>

              {/* Impôts */}
              <div className="flex justify-between pl-4">
                <span>{cpc.impotsSurResultats.label}</span>
                <span className="font-mono text-red-700">{cpc.impotsSurResultats.currentYear.toLocaleString('fr-MA')} DH</span>
              </div>

              {/* Résultat net */}
              <div className="font-bold text-xl flex justify-between bg-blue-200 px-3 py-3 border-t-4 border-blue-500">
                <span>{cpc.resultatNet.label}</span>
                <span className="font-mono">{cpc.resultatNet.currentYear.toLocaleString('fr-MA')} DH</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  const renderContent = () => {
    if (!currentFinancialStatements) {
      return (
        <Card>
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">Aucun état de synthèse généré pour cet exercice</p>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedYear}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Génération en cours...' : 'Générer les états de synthèse'}
            </button>
          </div>
        </Card>
      )
    }

    return (
      <div className="space-y-6">
        {/* Info et contrôles */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getModelBadge(currentFinancialStatements.model)}
            {getStatusBadge(currentFinancialStatements.status)}
            <span className="text-sm text-gray-600">
              Généré le {new Date(currentFinancialStatements.generatedAt).toLocaleString('fr-MA')}
            </span>
          </div>
          <div className="flex gap-2">
            {currentFinancialStatements.status === 'DRAFT' && (
              <button
                onClick={handleValidate}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Valider
              </button>
            )}
            {currentFinancialStatements.status === 'VALIDATED' && (
              <button
                onClick={handleLock}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Verrouiller
              </button>
            )}
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Erreurs et avertissements */}
        {renderValidationErrors()}

        {/* Onglets */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('BL')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'BL'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bilan (BL)
            </button>
            <button
              onClick={() => setActiveTab('CPC')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'CPC'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              CPC
            </button>
            {currentFinancialStatements.esg && (
              <button
                onClick={() => setActiveTab('ESG')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'ESG'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ESG
              </button>
            )}
            <button
              onClick={() => setActiveTab('TF')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'TF'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tableau de Financement
            </button>
            <button
              onClick={() => setActiveTab('ETIC')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ETIC'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ETIC
            </button>
          </nav>
        </div>

        {/* Contenu de l'onglet */}
        {activeTab === 'BL' && renderBilan()}
        {activeTab === 'CPC' && renderCPC()}
        {activeTab === 'ESG' && (
          <Card>
            <div className="p-12 text-center">
              <FileSpreadsheet className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">État des Soldes de Gestion (ESG)</p>
            </div>
          </Card>
        )}
        {activeTab === 'TF' && (
          <Card>
            <div className="p-12 text-center">
              <FileSpreadsheet className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Tableau de Financement (TF)</p>
            </div>
          </Card>
        )}
        {activeTab === 'ETIC' && (
          <Card>
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">État des Informations Complémentaires (ETIC)</p>
            </div>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-claude-text">États de Synthèse CGNC</h1>
        <p className="text-claude-text-muted mt-2">
          Bilan, CPC, ESG, Tableau de Financement et ETIC conformes au CGNC
        </p>
      </header>

      {/* Sélection de l'exercice */}
      <Card>
        <CardHeader>
          <CardTitle>Exercice comptable</CardTitle>
          <CardDescription>Sélectionnez l'exercice pour lequel générer les états</CardDescription>
        </CardHeader>
        <div className="p-4">
          <div className="flex items-center gap-4">
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionner un exercice</option>
              {fiscalYears.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.label} ({year.year})
                </option>
              ))}
            </select>
            {companySettings && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Modèle:</span>
                {getModelBadge(companySettings.statementModel || 'AUTO')}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Contenu principal */}
      {renderContent()}
    </div>
  )
}
