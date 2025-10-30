/**
 * Types pour le système d'authentification et de gestion des utilisateurs
 * Adapté au marché marocain avec système d'approbation et gestion des versions
 */

import { Permission } from './accounting';

// ============================================================================
// Hiérarchie des rôles (du plus élevé au plus bas)
// ============================================================================

export type UserRole =
  | 'SUPER_ADMIN'      // Super Administrateur - Contrôle total du système
  | 'ADMIN'            // Administrateur - Gestion complète sauf super admin
  | 'MANAGER'          // Gestionnaire - Gestion courante avec approbation requise
  | 'CONSULTANT';      // Consultant - Lecture seule et export

// Niveau hiérarchique des rôles (pour les comparaisons)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  MANAGER: 2,
  CONSULTANT: 1,
};

// ============================================================================
// Permissions détaillées par module
// ============================================================================

export type ModulePermission =
  // === Gestion des utilisateurs ===
  | 'users:read'              // Consulter les utilisateurs
  | 'users:create'            // Créer des utilisateurs
  | 'users:update'            // Modifier des utilisateurs
  | 'users:delete'            // Supprimer des utilisateurs
  | 'users:assign_roles'      // Attribuer/retirer des rôles
  | 'users:manage_permissions' // Gérer les permissions personnalisées

  // === Gestion des comptes comptables ===
  | 'accounts:read'
  | 'accounts:create'         // Nécessite approbation pour MANAGER
  | 'accounts:update'         // Nécessite approbation pour MANAGER
  | 'accounts:delete'

  // === Gestion des écritures comptables ===
  | 'entries:read'
  | 'entries:create'          // Nécessite approbation pour MANAGER
  | 'entries:update'          // Nécessite approbation pour MANAGER
  | 'entries:delete'
  | 'entries:validate'        // Valider les écritures
  | 'entries:lock'            // Verrouiller les écritures

  // === Gestion des périodes et exercices ===
  | 'periods:read'
  | 'periods:create'
  | 'periods:close'           // Clôturer une période
  | 'periods:reopen'          // Réouvrir une période

  // === Gestion des journaux ===
  | 'journals:read'
  | 'journals:create'
  | 'journals:update'
  | 'journals:delete'

  // === Facturation ===
  | 'invoices:read'
  | 'invoices:create'
  | 'invoices:update'
  | 'invoices:delete'
  | 'invoices:validate'
  | 'invoices:cancel'

  // === Gestion des tiers (clients/fournisseurs) ===
  | 'third_parties:read'
  | 'third_parties:create'
  | 'third_parties:update'
  | 'third_parties:delete'

  // === Trésorerie ===
  | 'treasury:read'
  | 'treasury:manage'

  // === Déclarations fiscales ===
  | 'tax:read'
  | 'tax:create'              // Créer des déclarations
  | 'tax:validate'            // Valider des déclarations
  | 'tax:submit'              // Soumettre aux autorités

  // === Paie ===
  | 'payroll:read'
  | 'payroll:create'
  | 'payroll:validate'

  // === Rapports et états financiers ===
  | 'reports:read'
  | 'reports:generate'
  | 'reports:export'

  // === Configuration et paramètres ===
  | 'settings:read'
  | 'settings:update'
  | 'settings:company'        // Paramètres de l'entreprise
  | 'settings:fiscal'         // Paramètres fiscaux

  // === Audit et traçabilité ===
  | 'audit:read'              // Consulter les logs d'audit
  | 'audit:export'            // Exporter les logs

  // === Gestion des approbations ===
  | 'approvals:read'          // Voir les demandes d'approbation
  | 'approvals:approve'       // Approuver des demandes
  | 'approvals:reject'        // Rejeter des demandes

  // === Gestion des versions ===
  | 'versions:read'           // Consulter l'historique des versions
  | 'versions:restore'        // Restaurer une version antérieure

  // === Établissements ===
  | 'establishments:read'
  | 'establishments:create'
  | 'establishments:update'
  | 'establishments:delete';

// Matrice complète des permissions par rôle
export const ROLE_PERMISSIONS: Record<UserRole, ModulePermission[]> = {
  // Super Admin - Tous les droits
  SUPER_ADMIN: [
    'users:read', 'users:create', 'users:update', 'users:delete',
    'users:assign_roles', 'users:manage_permissions',
    'accounts:read', 'accounts:create', 'accounts:update', 'accounts:delete',
    'entries:read', 'entries:create', 'entries:update', 'entries:delete',
    'entries:validate', 'entries:lock',
    'periods:read', 'periods:create', 'periods:close', 'periods:reopen',
    'journals:read', 'journals:create', 'journals:update', 'journals:delete',
    'invoices:read', 'invoices:create', 'invoices:update', 'invoices:delete',
    'invoices:validate', 'invoices:cancel',
    'third_parties:read', 'third_parties:create', 'third_parties:update', 'third_parties:delete',
    'treasury:read', 'treasury:manage',
    'tax:read', 'tax:create', 'tax:validate', 'tax:submit',
    'payroll:read', 'payroll:create', 'payroll:validate',
    'reports:read', 'reports:generate', 'reports:export',
    'settings:read', 'settings:update', 'settings:company', 'settings:fiscal',
    'audit:read', 'audit:export',
    'approvals:read', 'approvals:approve', 'approvals:reject',
    'versions:read', 'versions:restore',
    'establishments:read', 'establishments:create', 'establishments:update', 'establishments:delete',
  ],

  // Admin - Gestion complète sauf gestion des super admins
  ADMIN: [
    'users:read', 'users:create', 'users:update', 'users:delete', 'users:assign_roles',
    'accounts:read', 'accounts:create', 'accounts:update', 'accounts:delete',
    'entries:read', 'entries:create', 'entries:update', 'entries:delete',
    'entries:validate', 'entries:lock',
    'periods:read', 'periods:create', 'periods:close',
    'journals:read', 'journals:create', 'journals:update',
    'invoices:read', 'invoices:create', 'invoices:update', 'invoices:delete',
    'invoices:validate', 'invoices:cancel',
    'third_parties:read', 'third_parties:create', 'third_parties:update', 'third_parties:delete',
    'treasury:read', 'treasury:manage',
    'tax:read', 'tax:create', 'tax:validate', 'tax:submit',
    'payroll:read', 'payroll:create', 'payroll:validate',
    'reports:read', 'reports:generate', 'reports:export',
    'settings:read', 'settings:update', 'settings:company', 'settings:fiscal',
    'audit:read', 'audit:export',
    'approvals:read', 'approvals:approve', 'approvals:reject',
    'versions:read',
    'establishments:read', 'establishments:create', 'establishments:update',
  ],

  // Manager - Gestion courante avec approbations requises
  MANAGER: [
    'users:read',
    'accounts:read', 'accounts:create', 'accounts:update', // Nécessite approbation
    'entries:read', 'entries:create', 'entries:update',    // Nécessite approbation
    'periods:read',
    'journals:read',
    'invoices:read', 'invoices:create', 'invoices:update',
    'third_parties:read', 'third_parties:create', 'third_parties:update',
    'treasury:read', 'treasury:manage',
    'tax:read', 'tax:create',
    'payroll:read',
    'reports:read', 'reports:generate', 'reports:export',
    'settings:read',
    'approvals:read',
    'versions:read',
    'establishments:read',
  ],

  // Consultant - Lecture seule et exports
  CONSULTANT: [
    'accounts:read',
    'entries:read',
    'periods:read',
    'journals:read',
    'invoices:read',
    'third_parties:read',
    'treasury:read',
    'tax:read',
    'payroll:read',
    'reports:read', 'reports:generate', 'reports:export',
    'settings:read',
    'versions:read',
    'establishments:read',
  ],
};

// ============================================================================
// Types pour le système d'approbation
// ============================================================================

export type ApprovalStatus =
  | 'PENDING'      // En attente d'approbation
  | 'APPROVED'     // Approuvé
  | 'REJECTED'     // Rejeté
  | 'CANCELLED';   // Annulé par le demandeur

export type ApprovalEntityType =
  | 'ACCOUNT'          // Compte comptable
  | 'ENTRY'            // Écriture comptable
  | 'INVOICE'          // Facture
  | 'PAYMENT'          // Paiement
  | 'THIRD_PARTY'      // Tiers (client/fournisseur)
  | 'USER'             // Utilisateur
  | 'SETTINGS';        // Paramètres

export type ApprovalAction =
  | 'CREATE'           // Création
  | 'UPDATE'           // Modification
  | 'DELETE';          // Suppression

// Demande d'approbation
export interface ApprovalRequest {
  id: string;
  entityType: ApprovalEntityType;
  entityId: string;
  action: ApprovalAction;

  // Données de la demande
  currentData?: Record<string, any>;  // Données actuelles (pour UPDATE)
  proposedData: Record<string, any>;  // Données proposées

  // Métadonnées
  reason?: string;                    // Raison de la demande
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  // État de la demande
  status: ApprovalStatus;

  // Qui demande
  requestedBy: string;                // ID de l'utilisateur demandeur
  requestedAt: Date;

  // Qui approuve/rejette
  reviewedBy?: string;                // ID de l'approbateur
  reviewedAt?: Date;
  reviewComment?: string;             // Commentaire de l'approbateur

  // Métadonnées supplémentaires
  establishmentId?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Types pour la gestion des versions
// ============================================================================

export type VersionEntityType =
  | 'ACCOUNT'
  | 'ENTRY'
  | 'INVOICE'
  | 'PAYMENT'
  | 'THIRD_PARTY'
  | 'USER'
  | 'SETTINGS'
  | 'ESTABLISHMENT';

export type VersionAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'RESTORE';

// Version d'une entité
export interface EntityVersion {
  id: string;
  entityType: VersionEntityType;
  entityId: string;
  versionNumber: number;              // Numéro de version incrémental

  // Données
  data: Record<string, any>;          // Snapshot complet de l'entité

  // Changements par rapport à la version précédente
  changes?: {
    added?: Record<string, any>;
    modified?: Record<string, any>;
    removed?: string[];
  };

  // Action effectuée
  action: VersionAction;

  // Métadonnées
  createdBy: string;                  // Utilisateur ayant créé cette version
  createdAt: Date;
  comment?: string;                   // Commentaire de version

  // Approbation liée (si applicable)
  approvalRequestId?: string;

  // Restauration
  isRestored: boolean;                // Indique si cette version a été restaurée
  restoredFrom?: string;              // ID de la version source (si restauration)
}

// ============================================================================
// Utilisateur étendu
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;

  // Permissions personnalisées (en plus de celles du rôle)
  customPermissions?: ModulePermission[];

  // État du compte
  isActive: boolean;
  isLocked: boolean;                  // Compte verrouillé (tentatives échouées)
  isEmailVerified: boolean;

  // Accès multi-établissements
  establishmentIds?: string[];        // Établissements autorisés (si vide = tous)
  defaultEstablishmentId?: string;    // Établissement par défaut

  // Informations supplémentaires
  phone?: string;
  avatar?: string;
  language: 'fr' | 'ar';              // Langue préférée (français ou arabe)
  timezone: string;                   // Fuseau horaire (Africa/Casablanca)

  // Sécurité
  passwordHash?: string;              // Hash du mot de passe (ne pas exposer côté client)
  lastPasswordChange?: Date;
  mustChangePassword: boolean;        // Forcer le changement de mot de passe

  // Activité
  createdAt: Date;
  createdBy?: string;                 // Qui a créé cet utilisateur
  updatedAt?: Date;
  lastLoginAt?: Date;
  lastLoginIp?: string;
  failedLoginAttempts: number;
  lastFailedLoginAt?: Date;

  // Approbations
  pendingApprovalsCount?: number;     // Nombre d'approbations en attente (pour affichage)
}

// Session utilisateur
export interface UserSession {
  userId: string;
  user: AuthUser;
  token?: string;                     // Token JWT (si implémenté)
  expiresAt?: Date;
  establishmentId?: string;           // Établissement actif dans cette session
}

// Données de connexion
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Résultat de connexion
export interface LoginResult {
  success: boolean;
  user?: AuthUser;
  session?: UserSession;
  error?: string;
  requiresPasswordChange?: boolean;
  requiresEmailVerification?: boolean;
}

// Changement de mot de passe
export interface PasswordChangeRequest {
  userId: string;
  currentPassword?: string;           // Requis sauf pour premier changement
  newPassword: string;
  confirmPassword: string;
}

// Réinitialisation de mot de passe
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// Invitation d'utilisateur
export interface UserInvitation {
  id: string;
  email: string;
  role: UserRole;
  establishmentIds?: string[];
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  isAccepted: boolean;
  acceptedAt?: Date;
  token: string;
}

// ============================================================================
// Helpers pour vérifier les permissions
// ============================================================================

/**
 * Vérifie si un utilisateur a une permission spécifique
 */
export function hasPermission(user: AuthUser, permission: ModulePermission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  const customPermissions = user.customPermissions || [];
  return rolePermissions.includes(permission) || customPermissions.includes(permission);
}

/**
 * Vérifie si un utilisateur peut gérer un autre utilisateur
 * (basé sur la hiérarchie des rôles)
 */
export function canManageUser(manager: AuthUser, target: AuthUser): boolean {
  // Super admin peut tout gérer
  if (manager.role === 'SUPER_ADMIN') return true;

  // Admin peut gérer tous sauf super admin
  if (manager.role === 'ADMIN' && target.role !== 'SUPER_ADMIN') return true;

  // Les autres ne peuvent pas gérer d'utilisateurs
  return false;
}

/**
 * Vérifie si un utilisateur peut attribuer un rôle spécifique
 */
export function canAssignRole(manager: AuthUser, targetRole: UserRole): boolean {
  // Super admin peut attribuer n'importe quel rôle
  if (manager.role === 'SUPER_ADMIN') return true;

  // Admin peut attribuer tous les rôles sauf super admin
  if (manager.role === 'ADMIN' && targetRole !== 'SUPER_ADMIN') return true;

  return false;
}

/**
 * Vérifie si une action nécessite une approbation pour un rôle donné
 */
export function requiresApproval(
  role: UserRole,
  entityType: ApprovalEntityType,
  action: ApprovalAction
): boolean {
  // Manager nécessite une approbation pour certaines actions
  if (role === 'MANAGER') {
    if (entityType === 'ACCOUNT' && (action === 'CREATE' || action === 'UPDATE')) return true;
    if (entityType === 'ENTRY' && (action === 'CREATE' || action === 'UPDATE')) return true;
    if (entityType === 'SETTINGS' && action === 'UPDATE') return true;
  }

  // Autres rôles : pas d'approbation nécessaire (soit interdit, soit autorisé direct)
  return false;
}

// ============================================================================
// Types pour les logs d'activité utilisateur
// ============================================================================

export type UserActivityType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET'
  | 'PROFILE_UPDATE'
  | 'PERMISSION_CHANGE'
  | 'ROLE_CHANGE'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_UNLOCKED'
  | 'EMAIL_VERIFIED';

export interface UserActivity {
  id: string;
  userId: string;
  type: UserActivityType;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}
