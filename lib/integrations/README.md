# Système d'Intégrations MizanPro

Ce dossier contient tous les adaptateurs pour intégrer MizanPro avec des systèmes comptables externes.

## Architecture

```
lib/integrations/
├── base-adapter.ts          # Classe abstraite de base
├── quickbooks-adapter.ts    # Adaptateur QuickBooks Online
├── odoo-adapter.ts          # Adaptateur Odoo ERP
├── index.ts                 # Factory et exports
└── README.md                # Cette documentation
```

## Adaptateurs disponibles

### ✅ Implémentés

1. **QuickBooks Online** (`quickbooks-adapter.ts`)
   - OAuth2
   - Import/Export : Factures, Clients, Produits, Paiements
   - Documentation: https://developer.intuit.com/

2. **Odoo ERP** (`odoo-adapter.ts`)
   - API Key / XML-RPC
   - Import : Factures, Clients, Fournisseurs, Produits
   - Documentation: https://www.odoo.com/documentation/

### 🚧 À implémenter

**Plateformes marocaines:**
- Sage Comptabilité Maroc
- Ciel Compta
- JBS Comptabilité

**Plateformes internationales:**
- Xero
- FreshBooks
- Wave
- Zoho Books
- Oracle NetSuite

**Open Source:**
- Dolibarr ERP/CRM

## Créer un nouvel adaptateur

### 1. Créer le fichier adaptateur

```typescript
// lib/integrations/myapp-adapter.ts
import { BaseIntegrationAdapter, SyncResult, ConnectionTestResult } from './base-adapter';
import { SyncEntity } from '@/store/integrations';

export class MyAppAdapter extends BaseIntegrationAdapter {
  constructor(credentials: IntegrationCredentials) {
    super(credentials, 'https://api.myapp.com');
  }

  async testConnection(): Promise<ConnectionTestResult> {
    // Implémenter le test de connexion
  }

  async importEntity(entity: SyncEntity): Promise<SyncResult> {
    // Implémenter l'import
  }

  async exportEntity(entity: SyncEntity): Promise<SyncResult> {
    // Implémenter l'export
  }

  getSupportedEntities(): SyncEntity[] {
    return ['INVOICES', 'CUSTOMERS'];
  }

  protected transformToExternal(entity: SyncEntity, data: any): any {
    // Transformer MizanPro → MyApp
  }

  protected transformFromExternal(entity: SyncEntity, data: any): any {
    // Transformer MyApp → MizanPro
  }
}
```

### 2. Enregistrer dans le factory

```typescript
// lib/integrations/index.ts
export { MyAppAdapter } from './myapp-adapter';

// Dans createAdapter()
case 'MY_APP':
  return new MyAppAdapter(credentials);
```

### 3. Ajouter le provider dans le store

```typescript
// store/integrations.ts
export type IntegrationProvider =
  | 'MY_APP'
  | ...

// Dans AVAILABLE_PROVIDERS
{
  provider: 'MY_APP',
  name: 'My App',
  description: 'Description',
  logo: '/integrations/myapp.png',
  category: 'INTERNATIONAL',
  authType: 'API_KEY',
  supportedEntities: ['INVOICES', 'CUSTOMERS'],
  website: 'https://myapp.com',
  isAvailable: true,
}
```

## Utilisation

### Tester une connexion

```typescript
import { testIntegrationConnection } from '@/lib/integrations';

const result = await testIntegrationConnection('QUICKBOOKS', {
  accessToken: 'xxx',
  realm: '123',
});

console.log(result.success); // true/false
```

### Synchroniser des données

```typescript
import { syncIntegrationEntity } from '@/lib/integrations';

const result = await syncIntegrationEntity(
  'QUICKBOOKS',
  { accessToken: 'xxx', realm: '123' },
  'INVOICES',
  'import'
);

console.log(result.records); // Nombre d'enregistrements
console.log(result.created); // Nombre créés
```

### Via le store

```typescript
import { useIntegrationsStore } from '@/store/integrations';

const { createIntegration, connectIntegration, syncEntity } = useIntegrationsStore();

// 1. Créer l'intégration
const integration = createIntegration({
  provider: 'QUICKBOOKS',
  name: 'QuickBooks Online',
  description: 'Sync avec QuickBooks',
  syncConfig: {
    direction: 'BIDIRECTIONAL',
    entities: ['INVOICES', 'CUSTOMERS'],
    autoSync: false,
  },
  isActive: false,
});

// 2. Connecter
await connectIntegration(integration.id, {
  accessToken: 'xxx',
  realm: '123',
});

// 3. Synchroniser
const log = await syncEntity(integration.id, 'INVOICES', 'IMPORT');
```

## Types de synchronisation

### IMPORT (Import uniquement)
Données viennent du système externe → MizanPro

### EXPORT (Export uniquement)
Données viennent de MizanPro → système externe

### BIDIRECTIONAL (Bidirectionnel)
Synchronisation dans les 2 sens avec gestion des conflits

## Entités supportées

- `INVOICES` - Factures
- `CUSTOMERS` - Clients
- `SUPPLIERS` - Fournisseurs
- `PRODUCTS` - Produits/Services
- `ACCOUNTS` - Plan comptable
- `ENTRIES` - Écritures comptables
- `PAYMENTS` - Paiements
- `TAXES` - Taxes/TVA

## Authentification

### API Key
```typescript
{
  apiKey: 'sk_xxx',
  companyId: '123',
}
```

### OAuth2
```typescript
{
  accessToken: 'ya29.xxx',
  refreshToken: 'xxx',
  expiresAt: new Date(),
}
```

### Basic Auth
```typescript
{
  apiKey: 'username',
  apiSecret: 'password',
  baseUrl: 'https://instance.com',
}
```

## Logs de synchronisation

Chaque sync génère un `SyncLog`:

```typescript
{
  id: 'sync-xxx',
  integrationId: 'integration-xxx',
  provider: 'QUICKBOOKS',
  entity: 'INVOICES',
  direction: 'IMPORT',
  status: 'SUCCESS',
  totalRecords: 100,
  successRecords: 98,
  failedRecords: 2,
  summary: {
    created: 50,
    updated: 48,
    deleted: 0,
    unchanged: 0,
  },
  duration: 5, // secondes
  startedAt: new Date(),
  completedAt: new Date(),
}
```

## Bonnes pratiques

1. **Toujours tester la connexion** avant de synchroniser
2. **Gérer les erreurs de rate limit** avec retry + backoff exponentiel
3. **Paginer les requêtes** pour les grands volumes
4. **Logger les erreurs** avec détails pour debugging
5. **Transformer les données** correctement selon les schémas
6. **Valider les données** avant import/export
7. **Gérer les conflits** en cas de sync bidirectionnel

## Exemples de transformation

### Facture MizanPro → QuickBooks

```typescript
{
  // MizanPro
  number: 'FA-2025-001',
  thirdPartyId: 'client-123',
  issueDate: new Date('2025-01-15'),
  lines: [...]
}
↓
{
  // QuickBooks
  DocNumber: 'FA-2025-001',
  CustomerRef: { value: 'client-123' },
  TxnDate: '2025-01-15',
  Line: [...]
}
```

### Client QuickBooks → MizanPro

```typescript
{
  // QuickBooks
  Id: '123',
  DisplayName: 'Client ABC',
  PrimaryEmailAddr: { Address: 'client@abc.com' },
  BillAddr: { Line1: '123 Rue Mohammed V' }
}
↓
{
  // MizanPro
  id: 'qb-123',
  name: 'Client ABC',
  email: 'client@abc.com',
  address: '123 Rue Mohammed V',
  type: 'CUSTOMER'
}
```

## Support

Pour toute question sur les intégrations :
1. Consulter la documentation de l'API du provider
2. Vérifier les logs de sync dans le store
3. Tester avec l'environnement sandbox du provider
4. Contacter le support technique

## Roadmap

- [ ] Support webhooks pour sync en temps réel
- [ ] Gestion des conflits avancée
- [ ] Mapping de champs personnalisés via UI
- [ ] Sync incrémental (delta sync)
- [ ] Multi-tenant support
- [ ] Retry automatique avec backoff
- [ ] Métriques et monitoring
