/**
 * Système de gestion des permissions (RBAC - Role-Based Access Control)
 * EPIC 2: Identité légale & Multi-entités
 */

import { User, UserRole, Permission, ROLE_PERMISSIONS } from '@/types/accounting';

/**
 * Vérifie si un utilisateur a une permission donnée
 */
export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user || !user.isActive) {
    return false;
  }

  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  return rolePermissions.includes(permission);
}

/**
 * Vérifie si un utilisateur a toutes les permissions demandées
 */
export function hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(user, permission));
}

/**
 * Vérifie si un utilisateur a au moins une des permissions demandées
 */
export function hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(user, permission));
}

/**
 * Récupère toutes les permissions d'un rôle
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Vérifie si un utilisateur est administrateur
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === 'ADMIN' && user.isActive;
}

/**
 * Vérifie si un utilisateur peut accéder à un établissement
 */
export function canAccessEstablishment(
  user: User | null,
  establishmentId: string
): boolean {
  if (!user || !user.isActive) {
    return false;
  }

  // Les admins ont accès à tous les établissements
  if (user.role === 'ADMIN') {
    return true;
  }

  // Si aucune restriction d'établissement, accès à tous
  if (!user.establishmentIds || user.establishmentIds.length === 0) {
    return true;
  }

  // Vérifier si l'établissement est dans la liste autorisée
  return user.establishmentIds.includes(establishmentId);
}

/**
 * Filtre les établissements accessibles par un utilisateur
 */
export function filterAccessibleEstablishments<T extends { id: string }>(
  user: User | null,
  establishments: T[]
): T[] {
  if (!user || !user.isActive) {
    return [];
  }

  // Les admins ont accès à tous les établissements
  if (user.role === 'ADMIN') {
    return establishments;
  }

  // Si aucune restriction d'établissement, accès à tous
  if (!user.establishmentIds || user.establishmentIds.length === 0) {
    return establishments;
  }

  // Filtrer selon les autorisations
  return establishments.filter(est => user.establishmentIds!.includes(est.id));
}

/**
 * Vérifie si une action nécessite une permission et la valide
 * Lance une erreur si l'utilisateur n'a pas la permission
 */
export function requirePermission(user: User | null, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    throw new Error(`Permission refusée: ${permission} requise`);
  }
}

/**
 * Obtient le label d'un rôle pour l'affichage
 */
export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    ADMIN: 'Administrateur',
    ACCOUNTANT: 'Comptable',
    REVIEWER: 'Réviseur',
    AUDITOR: 'Auditeur',
  };

  return labels[role] || role;
}

/**
 * Obtient la description d'un rôle
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    ADMIN: 'Accès complet à toutes les fonctionnalités du système',
    ACCOUNTANT: 'Saisie et modification des écritures comptables',
    REVIEWER: 'Validation des écritures et clôture des périodes',
    AUDITOR: 'Lecture seule et export des rapports',
  };

  return descriptions[role] || '';
}

/**
 * Obtient le label d'une permission pour l'affichage
 */
export function getPermissionLabel(permission: Permission): string {
  const labels: Record<Permission, string> = {
    'accounts:read': 'Consulter les comptes',
    'accounts:create': 'Créer des comptes',
    'accounts:update': 'Modifier les comptes',
    'accounts:delete': 'Supprimer les comptes',
    'entries:read': 'Consulter les écritures',
    'entries:create': 'Créer des écritures',
    'entries:update': 'Modifier les écritures',
    'entries:delete': 'Supprimer les écritures',
    'entries:validate': 'Valider les écritures',
    'periods:read': 'Consulter les périodes',
    'periods:create': 'Créer des périodes',
    'periods:close': 'Clôturer les périodes',
    'journals:read': 'Consulter les journaux',
    'journals:create': 'Créer des journaux',
    'journals:update': 'Modifier les journaux',
    'reports:generate': 'Générer des rapports',
    'reports:export': 'Exporter des rapports',
    'settings:read': 'Consulter les paramètres',
    'settings:update': 'Modifier les paramètres',
    'users:read': 'Consulter les utilisateurs',
    'users:create': 'Créer des utilisateurs',
    'users:update': 'Modifier les utilisateurs',
    'users:delete': 'Supprimer des utilisateurs',
    'audit:read': 'Consulter l\'audit',
  };

  return labels[permission] || permission;
}

/**
 * Groupe les permissions par catégorie pour l'affichage
 */
export function groupPermissionsByCategory(): Record<string, Permission[]> {
  return {
    'Comptes': [
      'accounts:read',
      'accounts:create',
      'accounts:update',
      'accounts:delete',
    ],
    'Écritures': [
      'entries:read',
      'entries:create',
      'entries:update',
      'entries:delete',
      'entries:validate',
    ],
    'Périodes': [
      'periods:read',
      'periods:create',
      'periods:close',
    ],
    'Journaux': [
      'journals:read',
      'journals:create',
      'journals:update',
    ],
    'Rapports': [
      'reports:generate',
      'reports:export',
    ],
    'Configuration': [
      'settings:read',
      'settings:update',
    ],
    'Utilisateurs': [
      'users:read',
      'users:create',
      'users:update',
      'users:delete',
    ],
    'Audit': [
      'audit:read',
    ],
  };
}
