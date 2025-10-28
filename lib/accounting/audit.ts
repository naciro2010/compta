/**
 * Système de journal d'audit immuable
 * EPIC 2: Identité légale & Multi-entités
 *
 * Enregistre toutes les actions sensibles de manière immuable (append-only)
 * pour assurer la traçabilité et la conformité.
 */

import { GlobalAuditEntry, AuditAction, User } from '@/types/accounting';

/**
 * Interface pour la création d'une entrée d'audit
 */
export interface CreateAuditEntryParams {
  action: AuditAction;
  userId: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Crée une nouvelle entrée dans le journal d'audit
 * Cette fonction est "append-only" - les entrées ne peuvent jamais être modifiées ou supprimées
 */
export function createAuditEntry(params: CreateAuditEntryParams): GlobalAuditEntry {
  const entry: GlobalAuditEntry = {
    id: crypto.randomUUID(),
    action: params.action,
    userId: params.userId,
    entityType: params.entityType,
    entityId: params.entityId,
    timestamp: new Date(),
    metadata: params.metadata,
    changes: params.changes,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  };

  return entry;
}

/**
 * Obtient le label d'une action d'audit pour l'affichage
 */
export function getAuditActionLabel(action: AuditAction): string {
  const labels: Record<AuditAction, string> = {
    USER_LOGIN: 'Connexion utilisateur',
    USER_LOGOUT: 'Déconnexion utilisateur',
    ENTRY_CREATE: 'Création d\'écriture',
    ENTRY_UPDATE: 'Modification d\'écriture',
    ENTRY_DELETE: 'Suppression d\'écriture',
    ENTRY_VALIDATE: 'Validation d\'écriture',
    PERIOD_CLOSE: 'Clôture de période',
    PERIOD_REOPEN: 'Réouverture de période',
    ACCOUNT_CREATE: 'Création de compte',
    ACCOUNT_UPDATE: 'Modification de compte',
    JOURNAL_CREATE: 'Création de journal',
    REPORT_EXPORT: 'Export de rapport',
    SETTINGS_UPDATE: 'Modification des paramètres',
    USER_CREATE: 'Création d\'utilisateur',
    USER_UPDATE: 'Modification d\'utilisateur',
    USER_DELETE: 'Suppression d\'utilisateur',
  };

  return labels[action] || action;
}

/**
 * Obtient la couleur associée à une action pour l'UI
 */
export function getAuditActionColor(action: AuditAction): string {
  const colors: Partial<Record<AuditAction, string>> = {
    USER_LOGIN: 'text-blue-600',
    USER_LOGOUT: 'text-gray-600',
    ENTRY_CREATE: 'text-green-600',
    ENTRY_UPDATE: 'text-yellow-600',
    ENTRY_DELETE: 'text-red-600',
    ENTRY_VALIDATE: 'text-purple-600',
    PERIOD_CLOSE: 'text-orange-600',
    PERIOD_REOPEN: 'text-orange-400',
    ACCOUNT_CREATE: 'text-green-600',
    ACCOUNT_UPDATE: 'text-yellow-600',
    JOURNAL_CREATE: 'text-green-600',
    REPORT_EXPORT: 'text-blue-600',
    SETTINGS_UPDATE: 'text-yellow-600',
    USER_CREATE: 'text-green-600',
    USER_UPDATE: 'text-yellow-600',
    USER_DELETE: 'text-red-600',
  };

  return colors[action] || 'text-gray-600';
}

/**
 * Obtient l'icône associée à une action pour l'UI
 */
export function getAuditActionIcon(action: AuditAction): string {
  const icons: Partial<Record<AuditAction, string>> = {
    USER_LOGIN: 'LogIn',
    USER_LOGOUT: 'LogOut',
    ENTRY_CREATE: 'Plus',
    ENTRY_UPDATE: 'Edit',
    ENTRY_DELETE: 'Trash2',
    ENTRY_VALIDATE: 'CheckCircle',
    PERIOD_CLOSE: 'Lock',
    PERIOD_REOPEN: 'Unlock',
    ACCOUNT_CREATE: 'Plus',
    ACCOUNT_UPDATE: 'Edit',
    JOURNAL_CREATE: 'Plus',
    REPORT_EXPORT: 'Download',
    SETTINGS_UPDATE: 'Settings',
    USER_CREATE: 'UserPlus',
    USER_UPDATE: 'UserCheck',
    USER_DELETE: 'UserX',
  };

  return icons[action] || 'Activity';
}

/**
 * Formate une entrée d'audit pour l'affichage
 */
export function formatAuditEntry(entry: GlobalAuditEntry): {
  action: string;
  description: string;
  timestamp: string;
} {
  return {
    action: getAuditActionLabel(entry.action),
    description: formatAuditDescription(entry),
    timestamp: entry.timestamp.toLocaleString('fr-MA', {
      dateStyle: 'medium',
      timeStyle: 'medium',
    }),
  };
}

/**
 * Génère une description lisible d'une entrée d'audit
 */
function formatAuditDescription(entry: GlobalAuditEntry): string {
  const action = getAuditActionLabel(entry.action);
  const entityType = entry.entityType;
  const entityId = entry.entityId;

  let description = `${action} - ${entityType} ${entityId}`;

  if (entry.metadata) {
    const metadataStr = Object.entries(entry.metadata)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    if (metadataStr) {
      description += ` (${metadataStr})`;
    }
  }

  return description;
}

/**
 * Filtre les entrées d'audit selon des critères
 */
export interface AuditFilterCriteria {
  userId?: string;
  action?: AuditAction;
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Filtre les entrées d'audit selon les critères donnés
 */
export function filterAuditEntries(
  entries: GlobalAuditEntry[],
  criteria: AuditFilterCriteria
): GlobalAuditEntry[] {
  return entries.filter(entry => {
    if (criteria.userId && entry.userId !== criteria.userId) {
      return false;
    }

    if (criteria.action && entry.action !== criteria.action) {
      return false;
    }

    if (criteria.entityType && entry.entityType !== criteria.entityType) {
      return false;
    }

    if (criteria.entityId && entry.entityId !== criteria.entityId) {
      return false;
    }

    if (criteria.startDate && entry.timestamp < criteria.startDate) {
      return false;
    }

    if (criteria.endDate && entry.timestamp > criteria.endDate) {
      return false;
    }

    return true;
  });
}

/**
 * Exporte les entrées d'audit au format CSV
 */
export function exportAuditToCSV(entries: GlobalAuditEntry[]): string {
  const headers = [
    'ID',
    'Date/Heure',
    'Action',
    'Utilisateur',
    'Type d\'entité',
    'ID entité',
    'Adresse IP',
    'User Agent',
  ];

  const rows = entries.map(entry => [
    entry.id,
    entry.timestamp.toISOString(),
    getAuditActionLabel(entry.action),
    entry.userId,
    entry.entityType,
    entry.entityId,
    entry.ipAddress || '',
    entry.userAgent || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Détecte les actions suspectes dans le journal d'audit
 * (Plusieurs tentatives de suppression, modifications massives, etc.)
 */
export interface SuspiciousActivity {
  type: 'MULTIPLE_DELETIONS' | 'MASS_MODIFICATIONS' | 'UNUSUAL_ACTIVITY';
  description: string;
  entries: GlobalAuditEntry[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Analyse le journal d'audit pour détecter des activités suspectes
 */
export function detectSuspiciousActivities(
  entries: GlobalAuditEntry[],
  timeWindow: number = 3600000 // 1 heure en ms
): SuspiciousActivity[] {
  const suspicious: SuspiciousActivity[] = [];

  // Grouper les entrées par utilisateur et fenêtre de temps
  const userActivities = new Map<string, GlobalAuditEntry[]>();

  entries.forEach(entry => {
    const key = entry.userId;
    if (!userActivities.has(key)) {
      userActivities.set(key, []);
    }
    userActivities.get(key)!.push(entry);
  });

  // Analyser chaque utilisateur
  userActivities.forEach((userEntries, userId) => {
    // Trier par timestamp
    const sorted = [...userEntries].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Détecter les suppressions multiples
    const deletions = sorted.filter(e =>
      e.action === 'ENTRY_DELETE' || e.action === 'USER_DELETE'
    );

    if (deletions.length >= 5) {
      suspicious.push({
        type: 'MULTIPLE_DELETIONS',
        description: `${deletions.length} suppressions détectées pour l'utilisateur ${userId}`,
        entries: deletions,
        severity: 'HIGH',
      });
    }

    // Détecter les modifications massives dans une fenêtre de temps
    for (let i = 0; i < sorted.length; i++) {
      const windowStart = sorted[i].timestamp.getTime();
      const windowEnd = windowStart + timeWindow;

      const modificationsInWindow = sorted.filter(
        e =>
          e.timestamp.getTime() >= windowStart &&
          e.timestamp.getTime() <= windowEnd &&
          (e.action === 'ENTRY_UPDATE' ||
            e.action === 'ACCOUNT_UPDATE' ||
            e.action === 'SETTINGS_UPDATE')
      );

      if (modificationsInWindow.length >= 10) {
        suspicious.push({
          type: 'MASS_MODIFICATIONS',
          description: `${modificationsInWindow.length} modifications en moins d'une heure par l'utilisateur ${userId}`,
          entries: modificationsInWindow,
          severity: 'MEDIUM',
        });
        break; // Éviter les doublons
      }
    }
  });

  return suspicious;
}

/**
 * Calcule des statistiques sur le journal d'audit
 */
export interface AuditStatistics {
  totalEntries: number;
  entriesByAction: Record<AuditAction, number>;
  entriesByUser: Record<string, number>;
  entriesByEntityType: Record<string, number>;
  mostActiveUser: { userId: string; count: number } | null;
  mostCommonAction: { action: AuditAction; count: number } | null;
}

/**
 * Calcule des statistiques à partir du journal d'audit
 */
export function calculateAuditStatistics(
  entries: GlobalAuditEntry[]
): AuditStatistics {
  const stats: AuditStatistics = {
    totalEntries: entries.length,
    entriesByAction: {} as Record<AuditAction, number>,
    entriesByUser: {},
    entriesByEntityType: {},
    mostActiveUser: null,
    mostCommonAction: null,
  };

  entries.forEach(entry => {
    // Par action
    stats.entriesByAction[entry.action] =
      (stats.entriesByAction[entry.action] || 0) + 1;

    // Par utilisateur
    stats.entriesByUser[entry.userId] =
      (stats.entriesByUser[entry.userId] || 0) + 1;

    // Par type d'entité
    stats.entriesByEntityType[entry.entityType] =
      (stats.entriesByEntityType[entry.entityType] || 0) + 1;
  });

  // Trouver l'utilisateur le plus actif
  let maxUserCount = 0;
  Object.entries(stats.entriesByUser).forEach(([userId, count]) => {
    if (count > maxUserCount) {
      maxUserCount = count;
      stats.mostActiveUser = { userId, count };
    }
  });

  // Trouver l'action la plus courante
  let maxActionCount = 0;
  Object.entries(stats.entriesByAction).forEach(([action, count]) => {
    if (count > maxActionCount) {
      maxActionCount = count;
      stats.mostCommonAction = { action: action as AuditAction, count };
    }
  });

  return stats;
}
