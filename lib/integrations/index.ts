/**
 * Point d'entrée pour tous les adaptateurs d'intégration
 */

export { BaseIntegrationAdapter } from './base-adapter';
export type { IntegrationCredentials, SyncResult, ConnectionTestResult } from './base-adapter';

export { QuickBooksAdapter } from './quickbooks-adapter';
export { OdooAdapter } from './odoo-adapter';

// Factory pour créer l'adaptateur approprié
import { IntegrationProvider } from '@/store/integrations';
import { BaseIntegrationAdapter, IntegrationCredentials } from './base-adapter';
import { QuickBooksAdapter } from './quickbooks-adapter';
import { OdooAdapter } from './odoo-adapter';

/**
 * Factory pour instancier le bon adaptateur selon le provider
 */
export function createAdapter(
  provider: IntegrationProvider,
  credentials: IntegrationCredentials
): BaseIntegrationAdapter {
  switch (provider) {
    case 'QUICKBOOKS':
      return new QuickBooksAdapter(credentials);

    case 'ODOO':
      return new OdooAdapter(credentials);

    // Plateformes marocaines (à implémenter)
    case 'SAGE_MAROC':
    case 'CIEL_COMPTA':
    case 'JBS_COMPTA':
      throw new Error(`Adapter for ${provider} is not yet implemented. Coming soon!`);

    // Autres plateformes internationales (à implémenter)
    case 'XERO':
    case 'FRESHBOOKS':
    case 'WAVE':
    case 'ZOHO_BOOKS':
    case 'NETSUITE':
      throw new Error(`Adapter for ${provider} is not yet implemented. Coming soon!`);

    case 'DOLIBARR':
      throw new Error(`Adapter for ${provider} is not yet implemented. Coming soon!`);

    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

/**
 * Helper: Tester une connexion sans créer d'intégration
 */
export async function testIntegrationConnection(
  provider: IntegrationProvider,
  credentials: IntegrationCredentials
) {
  const adapter = createAdapter(provider, credentials);
  return await adapter.testConnection();
}

/**
 * Helper: Synchroniser une entité
 */
export async function syncIntegrationEntity(
  provider: IntegrationProvider,
  credentials: IntegrationCredentials,
  entity: string,
  direction: 'import' | 'export'
) {
  const adapter = createAdapter(provider, credentials);

  if (direction === 'import') {
    return await adapter.importEntity(entity as any);
  } else {
    return await adapter.exportEntity(entity as any);
  }
}
