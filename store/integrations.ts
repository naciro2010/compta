/**
 * Store Zustand pour les intégrations avec les systèmes comptables externes
 * Support des plateformes : Sage, QuickBooks, Xero, Odoo, etc.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type IntegrationProvider =
  // Plateformes marocaines
  | 'SAGE_MAROC'           // Sage Comptabilité Maroc
  | 'CIEL_COMPTA'          // Ciel Compta
  | 'JBS_COMPTA'           // JBS Comptabilité

  // Plateformes internationales
  | 'QUICKBOOKS'           // QuickBooks Online
  | 'XERO'                 // Xero
  | 'FRESHBOOKS'           // FreshBooks
  | 'WAVE'                 // Wave Accounting

  // Open Source
  | 'ODOO'                 // Odoo ERP
  | 'DOLIBARR'             // Dolibarr ERP/CRM

  // Cloud
  | 'ZOHO_BOOKS'           // Zoho Books
  | 'NETSUITE';            // Oracle NetSuite

export type IntegrationStatus =
  | 'DISCONNECTED'         // Non connecté
  | 'CONNECTED'            // Connecté et actif
  | 'ERROR'                // Erreur de connexion
  | 'SYNCING'              // Synchronisation en cours
  | 'EXPIRED';             // Token expiré

export type SyncDirection =
  | 'IMPORT'               // Import uniquement (depuis système externe)
  | 'EXPORT'               // Export uniquement (vers système externe)
  | 'BIDIRECTIONAL';       // Bidirectionnel (sync dans les 2 sens)

export type SyncEntity =
  | 'INVOICES'             // Factures
  | 'CUSTOMERS'            // Clients
  | 'SUPPLIERS'            // Fournisseurs
  | 'PRODUCTS'             // Produits/services
  | 'ACCOUNTS'             // Plan comptable
  | 'ENTRIES'              // Écritures comptables
  | 'PAYMENTS'             // Paiements
  | 'TAXES';               // Taxes/TVA

export interface IntegrationConfig {
  id: string;
  provider: IntegrationProvider;
  name: string;
  description: string;
  logo?: string;
  status: IntegrationStatus;

  // Configuration de connexion
  credentials?: {
    apiKey?: string;
    apiSecret?: string;
    accessToken?: string;
    refreshToken?: string;
    companyId?: string;
    tenantId?: string;
    realm?: string;
    baseUrl?: string;
    expiresAt?: Date;
  };

  // Configuration de synchronisation
  syncConfig: {
    direction: SyncDirection;
    entities: SyncEntity[];
    autoSync: boolean;
    syncFrequency?: 'REALTIME' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MANUAL';
    lastSyncAt?: Date;
    nextSyncAt?: Date;
  };

  // Mapping des champs
  fieldMapping?: Record<string, string>;

  // Webhooks
  webhookUrl?: string;
  webhookSecret?: string;

  // Métadonnées
  isActive: boolean;
  connectedAt?: Date;
  connectedBy?: string;
  lastError?: string;
  lastErrorAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface SyncLog {
  id: string;
  integrationId: string;
  provider: IntegrationProvider;
  entity: SyncEntity;
  direction: 'IMPORT' | 'EXPORT';
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'PARTIAL' | 'FAILED';

  // Statistiques
  totalRecords: number;
  successRecords: number;
  failedRecords: number;
  skippedRecords: number;

  // Détails
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // en secondes
  error?: string;
  errorDetails?: any;

  // Données
  summary?: {
    created: number;
    updated: number;
    deleted: number;
    unchanged: number;
  };
}

export interface IntegrationProviderInfo {
  provider: IntegrationProvider;
  name: string;
  description: string;
  logo: string;
  category: 'MAROC' | 'INTERNATIONAL' | 'OPEN_SOURCE';
  authType: 'API_KEY' | 'OAUTH2' | 'BASIC_AUTH';
  supportedEntities: SyncEntity[];
  documentation?: string;
  website?: string;
  isPremium?: boolean;
  isAvailable: boolean;
}

interface IntegrationsStore {
  // État
  integrations: IntegrationConfig[];
  syncLogs: SyncLog[];
  availableProviders: IntegrationProviderInfo[];

  // Actions - Gestion des intégrations
  createIntegration: (integration: Omit<IntegrationConfig, 'id' | 'createdAt' | 'status'>) => IntegrationConfig;
  updateIntegration: (id: string, updates: Partial<IntegrationConfig>) => void;
  deleteIntegration: (id: string) => void;
  getIntegration: (id: string) => IntegrationConfig | undefined;
  getIntegrationByProvider: (provider: IntegrationProvider) => IntegrationConfig | undefined;
  getActiveIntegrations: () => IntegrationConfig[];

  // Actions - Connexion
  connectIntegration: (id: string, credentials: IntegrationConfig['credentials']) => Promise<void>;
  disconnectIntegration: (id: string) => void;
  refreshToken: (id: string) => Promise<void>;
  testConnection: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Actions - Synchronisation
  syncEntity: (integrationId: string, entity: SyncEntity, direction: 'IMPORT' | 'EXPORT') => Promise<SyncLog>;
  syncAll: (integrationId: string) => Promise<SyncLog[]>;
  getSyncLogs: (integrationId?: string) => SyncLog[];
  getLastSync: (integrationId: string, entity?: SyncEntity) => SyncLog | undefined;

  // Actions - Configuration
  updateSyncConfig: (id: string, syncConfig: Partial<IntegrationConfig['syncConfig']>) => void;
  updateFieldMapping: (id: string, mapping: Record<string, string>) => void;

  // Helpers
  getAvailableProviders: (category?: 'MAROC' | 'INTERNATIONAL' | 'OPEN_SOURCE') => IntegrationProviderInfo[];
  isProviderConnected: (provider: IntegrationProvider) => boolean;
  getSyncStats: (integrationId: string) => {
    totalSyncs: number;
    successRate: number;
    lastSuccessAt?: Date;
    lastErrorAt?: Date;
  };
}

// Liste des fournisseurs disponibles
const AVAILABLE_PROVIDERS: IntegrationProviderInfo[] = [
  // Plateformes marocaines
  {
    provider: 'SAGE_MAROC',
    name: 'Sage Comptabilité Maroc',
    description: 'Leader de la comptabilité au Maroc',
    logo: '/integrations/sage.png',
    category: 'MAROC',
    authType: 'API_KEY',
    supportedEntities: ['INVOICES', 'CUSTOMERS', 'SUPPLIERS', 'ACCOUNTS', 'ENTRIES', 'TAXES'],
    website: 'https://www.sage.com/fr-ma/',
    isPremium: false,
    isAvailable: true,
  },
  {
    provider: 'CIEL_COMPTA',
    name: 'Ciel Compta',
    description: 'Solution comptable pour TPE/PME',
    logo: '/integrations/ciel.png',
    category: 'MAROC',
    authType: 'API_KEY',
    supportedEntities: ['INVOICES', 'CUSTOMERS', 'SUPPLIERS', 'ENTRIES'],
    website: 'https://www.ciel.com/',
    isPremium: false,
    isAvailable: true,
  },
  {
    provider: 'JBS_COMPTA',
    name: 'JBS Comptabilité',
    description: 'Logiciel comptable marocain',
    logo: '/integrations/jbs.png',
    category: 'MAROC',
    authType: 'BASIC_AUTH',
    supportedEntities: ['INVOICES', 'CUSTOMERS', 'SUPPLIERS', 'ACCOUNTS'],
    isPremium: false,
    isAvailable: true,
  },

  // Plateformes internationales
  {
    provider: 'QUICKBOOKS',
    name: 'QuickBooks Online',
    description: 'La référence mondiale de la comptabilité en ligne',
    logo: '/integrations/quickbooks.png',
    category: 'INTERNATIONAL',
    authType: 'OAUTH2',
    supportedEntities: ['INVOICES', 'CUSTOMERS', 'SUPPLIERS', 'PRODUCTS', 'ACCOUNTS', 'ENTRIES', 'PAYMENTS', 'TAXES'],
    documentation: 'https://developer.intuit.com/app/developer/qbo/docs/get-started',
    website: 'https://quickbooks.intuit.com/',
    isPremium: false,
    isAvailable: true,
  },
  {
    provider: 'XERO',
    name: 'Xero',
    description: 'Comptabilité cloud pour PME',
    logo: '/integrations/xero.png',
    category: 'INTERNATIONAL',
    authType: 'OAUTH2',
    supportedEntities: ['INVOICES', 'CUSTOMERS', 'SUPPLIERS', 'PRODUCTS', 'ACCOUNTS', 'ENTRIES', 'PAYMENTS', 'TAXES'],
    documentation: 'https://developer.xero.com/documentation/',
    website: 'https://www.xero.com/',
    isPremium: false,
    isAvailable: true,
  },
  {
    provider: 'FRESHBOOKS',
    name: 'FreshBooks',
    description: 'Facturation et comptabilité simplifiée',
    logo: '/integrations/freshbooks.png',
    category: 'INTERNATIONAL',
    authType: 'OAUTH2',
    supportedEntities: ['INVOICES', 'CUSTOMERS', 'PAYMENTS'],
    documentation: 'https://www.freshbooks.com/api',
    website: 'https://www.freshbooks.com/',
    isPremium: false,
    isAvailable: true,
  },
  {
    provider: 'WAVE',
    name: 'Wave Accounting',
    description: 'Comptabilité gratuite pour petites entreprises',
    logo: '/integrations/wave.png',
    category: 'INTERNATIONAL',
    authType: 'API_KEY',
    supportedEntities: ['INVOICES', 'CUSTOMERS', 'PRODUCTS'],
    documentation: 'https://developer.waveapps.com/',
    website: 'https://www.waveapps.com/',
    isPremium: false,
    isAvailable: true,
  },

  // Open Source
  {
    provider: 'ODOO',
    name: 'Odoo ERP',
    description: 'ERP open-source tout-en-un',
    logo: '/integrations/odoo.png',
    category: 'OPEN_SOURCE',
    authType: 'API_KEY',
    supportedEntities: ['INVOICES', 'CUSTOMERS', 'SUPPLIERS', 'PRODUCTS', 'ACCOUNTS', 'ENTRIES', 'PAYMENTS'],
    documentation: 'https://www.odoo.com/documentation/',
    website: 'https://www.odoo.com/',
    isPremium: false,
    isAvailable: true,
  },
  {
    provider: 'DOLIBARR',
    name: 'Dolibarr ERP/CRM',
    description: 'ERP/CRM open-source pour TPE/PME',
    logo: '/integrations/dolibarr.png',
    category: 'OPEN_SOURCE',
    authType: 'API_KEY',
    supportedEntities: ['INVOICES', 'CUSTOMERS', 'SUPPLIERS', 'PRODUCTS'],
    documentation: 'https://wiki.dolibarr.org/index.php/Module_Web_Services_API_REST',
    website: 'https://www.dolibarr.org/',
    isPremium: false,
    isAvailable: true,
  },

  // Cloud Premium
  {
    provider: 'ZOHO_BOOKS',
    name: 'Zoho Books',
    description: 'Comptabilité en ligne complète',
    logo: '/integrations/zoho.png',
    category: 'INTERNATIONAL',
    authType: 'OAUTH2',
    supportedEntities: ['INVOICES', 'CUSTOMERS', 'SUPPLIERS', 'PRODUCTS', 'ACCOUNTS', 'ENTRIES', 'PAYMENTS', 'TAXES'],
    documentation: 'https://www.zoho.com/books/api/v3/',
    website: 'https://www.zoho.com/books/',
    isPremium: true,
    isAvailable: true,
  },
  {
    provider: 'NETSUITE',
    name: 'Oracle NetSuite',
    description: 'ERP Cloud pour grandes entreprises',
    logo: '/integrations/netsuite.png',
    category: 'INTERNATIONAL',
    authType: 'OAUTH2',
    supportedEntities: ['INVOICES', 'CUSTOMERS', 'SUPPLIERS', 'PRODUCTS', 'ACCOUNTS', 'ENTRIES', 'PAYMENTS', 'TAXES'],
    documentation: 'https://docs.oracle.com/en/cloud/saas/netsuite/',
    website: 'https://www.netsuite.com/',
    isPremium: true,
    isAvailable: true,
  },
];

export const useIntegrationsStore = create<IntegrationsStore>()(
  persist(
    (set, get) => ({
      // État initial
      integrations: [],
      syncLogs: [],
      availableProviders: AVAILABLE_PROVIDERS,

      // ========================================================================
      // Gestion des intégrations
      // ========================================================================

      createIntegration: (integrationData) => {
        const integration: IntegrationConfig = {
          ...integrationData,
          id: `integration-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          status: 'DISCONNECTED',
          createdAt: new Date(),
        };

        set((state) => ({
          integrations: [...state.integrations, integration],
        }));

        return integration;
      },

      updateIntegration: (id, updates) => {
        set((state) => ({
          integrations: state.integrations.map((int) =>
            int.id === id ? { ...int, ...updates, updatedAt: new Date() } : int
          ),
        }));
      },

      deleteIntegration: (id) => {
        set((state) => ({
          integrations: state.integrations.filter((int) => int.id !== id),
          syncLogs: state.syncLogs.filter((log) => log.integrationId !== id),
        }));
      },

      getIntegration: (id) => {
        return get().integrations.find((int) => int.id === id);
      },

      getIntegrationByProvider: (provider) => {
        return get().integrations.find((int) => int.provider === provider);
      },

      getActiveIntegrations: () => {
        return get().integrations.filter((int) => int.isActive && int.status === 'CONNECTED');
      },

      // ========================================================================
      // Connexion
      // ========================================================================

      connectIntegration: async (id, credentials) => {
        const integration = get().getIntegration(id);
        if (!integration) {
          throw new Error('Integration not found');
        }

        // Simuler une connexion (à remplacer par de vraies API calls)
        set((state) => ({
          integrations: state.integrations.map((int) =>
            int.id === id
              ? {
                  ...int,
                  credentials,
                  status: 'CONNECTED' as const,
                  connectedAt: new Date(),
                  isActive: true,
                }
              : int
          ),
        }));
      },

      disconnectIntegration: (id) => {
        set((state) => ({
          integrations: state.integrations.map((int) =>
            int.id === id
              ? {
                  ...int,
                  status: 'DISCONNECTED' as const,
                  credentials: undefined,
                  isActive: false,
                }
              : int
          ),
        }));
      },

      refreshToken: async (id) => {
        // À implémenter avec les vraies API calls OAuth2
        const integration = get().getIntegration(id);
        if (!integration || !integration.credentials?.refreshToken) {
          throw new Error('No refresh token available');
        }

        // Simuler le refresh
        set((state) => ({
          integrations: state.integrations.map((int) =>
            int.id === id
              ? {
                  ...int,
                  credentials: {
                    ...int.credentials,
                    expiresAt: new Date(Date.now() + 3600 * 1000), // +1h
                  },
                  status: 'CONNECTED' as const,
                }
              : int
          ),
        }));
      },

      testConnection: async (id) => {
        const integration = get().getIntegration(id);
        if (!integration) {
          return { success: false, error: 'Integration not found' };
        }

        // Simuler un test de connexion
        return { success: true };
      },

      // ========================================================================
      // Synchronisation
      // ========================================================================

      syncEntity: async (integrationId, entity, direction) => {
        const integration = get().getIntegration(integrationId);
        if (!integration) {
          throw new Error('Integration not found');
        }

        const syncLog: SyncLog = {
          id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          integrationId,
          provider: integration.provider,
          entity,
          direction,
          status: 'IN_PROGRESS',
          totalRecords: 0,
          successRecords: 0,
          failedRecords: 0,
          skippedRecords: 0,
          startedAt: new Date(),
        };

        set((state) => ({
          syncLogs: [...state.syncLogs, syncLog],
          integrations: state.integrations.map((int) =>
            int.id === integrationId ? { ...int, status: 'SYNCING' as const } : int
          ),
        }));

        // Simuler une synchronisation (à remplacer par de vraies API calls)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const completedLog: SyncLog = {
          ...syncLog,
          status: 'SUCCESS',
          completedAt: new Date(),
          duration: 2,
          totalRecords: 10,
          successRecords: 10,
          summary: {
            created: 5,
            updated: 3,
            deleted: 0,
            unchanged: 2,
          },
        };

        set((state) => ({
          syncLogs: state.syncLogs.map((log) =>
            log.id === syncLog.id ? completedLog : log
          ),
          integrations: state.integrations.map((int) =>
            int.id === integrationId
              ? {
                  ...int,
                  status: 'CONNECTED' as const,
                  syncConfig: {
                    ...int.syncConfig,
                    lastSyncAt: new Date(),
                  },
                }
              : int
          ),
        }));

        return completedLog;
      },

      syncAll: async (integrationId) => {
        const integration = get().getIntegration(integrationId);
        if (!integration) {
          throw new Error('Integration not found');
        }

        const logs: SyncLog[] = [];

        for (const entity of integration.syncConfig.entities) {
          if (integration.syncConfig.direction === 'BIDIRECTIONAL') {
            const importLog = await get().syncEntity(integrationId, entity, 'IMPORT');
            const exportLog = await get().syncEntity(integrationId, entity, 'EXPORT');
            logs.push(importLog, exportLog);
          } else if (integration.syncConfig.direction === 'IMPORT') {
            const log = await get().syncEntity(integrationId, entity, 'IMPORT');
            logs.push(log);
          } else {
            const log = await get().syncEntity(integrationId, entity, 'EXPORT');
            logs.push(log);
          }
        }

        return logs;
      },

      getSyncLogs: (integrationId) => {
        const logs = get().syncLogs;
        if (integrationId) {
          return logs.filter((log) => log.integrationId === integrationId);
        }
        return logs;
      },

      getLastSync: (integrationId, entity) => {
        const logs = get().getSyncLogs(integrationId);
        const filtered = entity ? logs.filter((log) => log.entity === entity) : logs;
        return filtered.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0];
      },

      // ========================================================================
      // Configuration
      // ========================================================================

      updateSyncConfig: (id, syncConfig) => {
        set((state) => ({
          integrations: state.integrations.map((int) =>
            int.id === id
              ? {
                  ...int,
                  syncConfig: { ...int.syncConfig, ...syncConfig },
                  updatedAt: new Date(),
                }
              : int
          ),
        }));
      },

      updateFieldMapping: (id, mapping) => {
        set((state) => ({
          integrations: state.integrations.map((int) =>
            int.id === id
              ? {
                  ...int,
                  fieldMapping: { ...int.fieldMapping, ...mapping },
                  updatedAt: new Date(),
                }
              : int
          ),
        }));
      },

      // ========================================================================
      // Helpers
      // ========================================================================

      getAvailableProviders: (category) => {
        const providers = get().availableProviders;
        if (category) {
          return providers.filter((p) => p.category === category && p.isAvailable);
        }
        return providers.filter((p) => p.isAvailable);
      },

      isProviderConnected: (provider) => {
        return get().integrations.some(
          (int) => int.provider === provider && int.status === 'CONNECTED'
        );
      },

      getSyncStats: (integrationId) => {
        const logs = get().getSyncLogs(integrationId);
        const totalSyncs = logs.length;
        const successfulSyncs = logs.filter((log) => log.status === 'SUCCESS').length;
        const successRate = totalSyncs > 0 ? (successfulSyncs / totalSyncs) * 100 : 0;

        const successLogs = logs.filter((log) => log.status === 'SUCCESS');
        const errorLogs = logs.filter((log) => log.status === 'FAILED');

        const lastSuccessAt = successLogs.length > 0
          ? successLogs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0].startedAt
          : undefined;

        const lastErrorAt = errorLogs.length > 0
          ? errorLogs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0].startedAt
          : undefined;

        return {
          totalSyncs,
          successRate,
          lastSuccessAt,
          lastErrorAt,
        };
      },
    }),
    {
      name: 'mizanpro-integrations-storage',
    }
  )
);
