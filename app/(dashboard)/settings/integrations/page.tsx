'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'
import { Plus, CheckCircle2, XCircle, RefreshCw, Settings, ExternalLink, Zap } from 'lucide-react'
import { useIntegrationsStore, IntegrationProvider, IntegrationProviderInfo } from '@/store/integrations'

export default function IntegrationsPage() {
  const {
    integrations,
    availableProviders,
    getAvailableProviders,
    isProviderConnected,
    createIntegration,
    connectIntegration,
    disconnectIntegration,
    syncAll,
    getSyncStats,
  } = useIntegrationsStore()

  const [selectedProvider, setSelectedProvider] = useState<IntegrationProviderInfo | null>(null)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [credentials, setCredentials] = useState({
    apiKey: '',
    apiSecret: '',
    companyId: '',
    baseUrl: '',
  })

  const marocProviders = getAvailableProviders('MAROC')
  const internationalProviders = getAvailableProviders('INTERNATIONAL')
  const openSourceProviders = getAvailableProviders('OPEN_SOURCE')

  const handleConnect = async (provider: IntegrationProviderInfo) => {
    setSelectedProvider(provider)
    setShowConnectModal(true)
    setCredentials({ apiKey: '', apiSecret: '', companyId: '', baseUrl: '' })
  }

  const handleSubmitConnection = async () => {
    if (!selectedProvider) return

    const integration = createIntegration({
      provider: selectedProvider.provider,
      name: selectedProvider.name,
      description: selectedProvider.description,
      syncConfig: {
        direction: 'BIDIRECTIONAL',
        entities: selectedProvider.supportedEntities,
        autoSync: false,
      },
      isActive: false,
    })

    await connectIntegration(integration.id, {
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret,
      companyId: credentials.companyId,
      baseUrl: credentials.baseUrl || undefined,
    })

    setShowConnectModal(false)
    setSelectedProvider(null)
  }

  const handleDisconnect = (provider: IntegrationProvider) => {
    const integration = integrations.find((i) => i.provider === provider)
    if (integration) {
      disconnectIntegration(integration.id)
    }
  }

  const handleSync = async (provider: IntegrationProvider) => {
    const integration = integrations.find((i) => i.provider === provider)
    if (integration) {
      await syncAll(integration.id)
    }
  }

  const getStatusBadge = (provider: IntegrationProvider) => {
    const integration = integrations.find((i) => i.provider === provider)
    if (!integration) return null

    const styles = {
      CONNECTED: 'bg-green-100 text-green-800',
      DISCONNECTED: 'bg-gray-100 text-gray-800',
      ERROR: 'bg-red-100 text-red-800',
      SYNCING: 'bg-blue-100 text-blue-800 animate-pulse',
      EXPIRED: 'bg-orange-100 text-orange-800',
    }

    const labels = {
      CONNECTED: 'Connecté',
      DISCONNECTED: 'Déconnecté',
      ERROR: 'Erreur',
      SYNCING: 'Sync en cours...',
      EXPIRED: 'Expiré',
    }

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[integration.status]}`}>
        {labels[integration.status]}
      </span>
    )
  }

  const renderProviderCard = (provider: IntegrationProviderInfo) => {
    const connected = isProviderConnected(provider.provider)
    const integration = integrations.find((i) => i.provider === provider.provider)
    const stats = integration ? getSyncStats(integration.id) : null

    return (
      <Card key={provider.provider} className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-claude-surface rounded-lg flex items-center justify-center">
                  {/* Placeholder for logo */}
                  <span className="text-2xl">{provider.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-claude-text">{provider.name}</h3>
                  <p className="text-sm text-claude-text-muted">{provider.description}</p>
                </div>
              </div>
            </div>
            {getStatusBadge(provider.provider)}
          </div>

          <div className="space-y-3">
            {/* Stats si connecté */}
            {connected && stats && (
              <div className="grid grid-cols-2 gap-2 p-3 bg-claude-bg rounded-lg text-sm">
                <div>
                  <div className="text-claude-text-muted">Synchronisations</div>
                  <div className="font-medium text-claude-text">{stats.totalSyncs}</div>
                </div>
                <div>
                  <div className="text-claude-text-muted">Taux de succès</div>
                  <div className="font-medium text-claude-text">{stats.successRate.toFixed(0)}%</div>
                </div>
              </div>
            )}

            {/* Entités supportées */}
            <div>
              <div className="text-xs text-claude-text-muted mb-1">Entités supportées:</div>
              <div className="flex flex-wrap gap-1">
                {provider.supportedEntities.slice(0, 4).map((entity) => (
                  <span
                    key={entity}
                    className="px-2 py-1 bg-claude-surface rounded text-xs text-claude-text"
                  >
                    {entity}
                  </span>
                ))}
                {provider.supportedEntities.length > 4 && (
                  <span className="px-2 py-1 text-xs text-claude-text-muted">
                    +{provider.supportedEntities.length - 4}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {!connected ? (
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleConnect(provider)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Connecter
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSync(provider.provider)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Synchroniser
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDisconnect(provider.provider)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Documentation link */}
            {provider.documentation && (
              <a
                href={provider.documentation}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                Documentation API
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-claude-text">Intégrations</h1>
        <p className="text-claude-text-muted mt-2">
          Connectez MizanPro avec vos outils comptables préférés
        </p>
      </header>

      {/* Stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-claude-text-muted">Intégrations actives</div>
                <div className="text-2xl font-bold text-claude-text">
                  {integrations.filter((i) => i.status === 'CONNECTED').length}
                </div>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-claude-text-muted">Plateformes disponibles</div>
                <div className="text-2xl font-bold text-claude-text">{availableProviders.length}</div>
              </div>
              <Zap className="w-8 h-8 text-orange-accent" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-claude-text-muted">Sync aujourd'hui</div>
                <div className="text-2xl font-bold text-claude-text">0</div>
              </div>
              <RefreshCw className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plateformes marocaines */}
      <div>
        <h2 className="text-xl font-semibold text-claude-text mb-4">🇲🇦 Plateformes Marocaines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {marocProviders.map(renderProviderCard)}
        </div>
      </div>

      {/* Plateformes internationales */}
      <div>
        <h2 className="text-xl font-semibold text-claude-text mb-4">🌍 Plateformes Internationales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {internationalProviders.map(renderProviderCard)}
        </div>
      </div>

      {/* Open Source */}
      <div>
        <h2 className="text-xl font-semibold text-claude-text mb-4">💻 Solutions Open Source</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {openSourceProviders.map(renderProviderCard)}
        </div>
      </div>

      {/* Modal de connexion */}
      {showConnectModal && selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Connecter {selectedProvider.name}</CardTitle>
              <CardDescription>
                {selectedProvider.authType === 'API_KEY'
                  ? 'Entrez votre clé API'
                  : selectedProvider.authType === 'OAUTH2'
                  ? 'Configuration OAuth2'
                  : 'Authentification basique'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedProvider.authType === 'API_KEY' && (
                <>
                  <div>
                    <Label>Clé API</Label>
                    <Input
                      type="password"
                      value={credentials.apiKey}
                      onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
                      placeholder="Entrez votre clé API"
                    />
                  </div>
                  <div>
                    <Label>ID Entreprise (optionnel)</Label>
                    <Input
                      value={credentials.companyId}
                      onChange={(e) => setCredentials({ ...credentials, companyId: e.target.value })}
                      placeholder="ID de votre entreprise"
                    />
                  </div>
                </>
              )}

              {selectedProvider.authType === 'OAUTH2' && (
                <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
                  OAuth2 nécessite une configuration serveur. Contactez le support pour activer cette intégration.
                </div>
              )}

              {selectedProvider.authType === 'BASIC_AUTH' && (
                <>
                  <div>
                    <Label>Nom d'utilisateur</Label>
                    <Input
                      value={credentials.apiKey}
                      onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
                      placeholder="Nom d'utilisateur"
                    />
                  </div>
                  <div>
                    <Label>Mot de passe</Label>
                    <Input
                      type="password"
                      value={credentials.apiSecret}
                      onChange={(e) => setCredentials({ ...credentials, apiSecret: e.target.value })}
                      placeholder="Mot de passe"
                    />
                  </div>
                  <div>
                    <Label>URL de base (optionnel)</Label>
                    <Input
                      value={credentials.baseUrl}
                      onChange={(e) => setCredentials({ ...credentials, baseUrl: e.target.value })}
                      placeholder="https://votre-instance.com"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowConnectModal(false)}>
                  Annuler
                </Button>
                <Button variant="primary" className="flex-1" onClick={handleSubmitConnection}>
                  Connecter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
