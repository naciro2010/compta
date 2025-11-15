/**
 * Store Zustand pour l'authentification et la gestion des utilisateurs
 * Adapté au marché marocain avec système d'approbation et gestion des versions
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import bcrypt from 'bcryptjs';
import {
  AuthUser,
  UserSession,
  LoginCredentials,
  LoginResult,
  ModulePermission,
  hasPermission,
  canManageUser,
  canAssignRole,
  UserRole,
  ApprovalRequest,
  ApprovalStatus,
  EntityVersion,
  UserActivity,
  PasswordChangeRequest,
  UserInvitation,
} from '@/types/auth';

interface AuthStore {
  // ============================================================================
  // État de l'authentification
  // ============================================================================
  currentUser: AuthUser | null;
  session: UserSession | null;
  isAuthenticated: boolean;
  isInitialized: boolean;

  // ============================================================================
  // Gestion des utilisateurs
  // ============================================================================
  users: AuthUser[];
  invitations: UserInvitation[];

  // ============================================================================
  // Système d'approbation
  // ============================================================================
  approvalRequests: ApprovalRequest[];
  pendingApprovalsCount: number;

  // ============================================================================
  // Gestion des versions
  // ============================================================================
  versions: EntityVersion[];

  // ============================================================================
  // Logs d'activité
  // ============================================================================
  userActivities: UserActivity[];

  // ============================================================================
  // Actions d'authentification
  // ============================================================================

  /**
   * Connexion utilisateur
   */
  login: (credentials: LoginCredentials) => Promise<LoginResult>;

  /**
   * Déconnexion
   */
  logout: () => void;

  /**
   * Vérifier la session actuelle
   */
  checkSession: () => boolean;

  /**
   * Rafraîchir les données utilisateur
   */
  refreshUser: () => Promise<void>;

  /**
   * Changer de mot de passe
   */
  changePassword: (request: PasswordChangeRequest) => Promise<{ success: boolean; error?: string }>;

  // ============================================================================
  // Gestion des utilisateurs (CRUD)
  // ============================================================================

  /**
   * Créer un utilisateur
   */
  createUser: (user: Omit<AuthUser, 'id' | 'createdAt' | 'failedLoginAttempts'>) => Promise<AuthUser>;

  /**
   * Mettre à jour un utilisateur
   */
  updateUser: (userId: string, updates: Partial<AuthUser>) => Promise<void>;

  /**
   * Supprimer un utilisateur
   */
  deleteUser: (userId: string) => Promise<void>;

  /**
   * Attribuer un rôle
   */
  assignRole: (userId: string, role: UserRole) => Promise<void>;

  /**
   * Activer/désactiver un utilisateur
   */
  toggleUserActive: (userId: string) => void;

  /**
   * Verrouiller/déverrouiller un compte
   */
  toggleUserLock: (userId: string) => void;

  /**
   * Inviter un utilisateur
   */
  inviteUser: (invitation: Omit<UserInvitation, 'id' | 'invitedAt' | 'expiresAt' | 'token' | 'isAccepted'>) => Promise<UserInvitation>;

  /**
   * Accepter une invitation
   */
  acceptInvitation: (token: string, password: string) => Promise<{ success: boolean; error?: string }>;

  // ============================================================================
  // Vérification des permissions
  // ============================================================================

  /**
   * Vérifie si l'utilisateur courant a une permission
   */
  hasPermission: (permission: ModulePermission) => boolean;

  /**
   * Vérifie si l'utilisateur courant peut gérer un autre utilisateur
   */
  canManageUser: (targetUserId: string) => boolean;

  /**
   * Vérifie si l'utilisateur courant peut attribuer un rôle
   */
  canAssignRole: (role: UserRole) => boolean;

  // ============================================================================
  // Système d'approbation
  // ============================================================================

  /**
   * Créer une demande d'approbation
   */
  createApprovalRequest: (request: Omit<ApprovalRequest, 'id' | 'requestedAt' | 'status'>) => Promise<ApprovalRequest>;

  /**
   * Approuver une demande
   */
  approveRequest: (requestId: string, comment?: string) => Promise<void>;

  /**
   * Rejeter une demande
   */
  rejectRequest: (requestId: string, comment: string) => Promise<void>;

  /**
   * Annuler une demande (par le demandeur)
   */
  cancelRequest: (requestId: string) => Promise<void>;

  /**
   * Obtenir les demandes en attente pour l'utilisateur courant
   */
  getPendingApprovals: () => ApprovalRequest[];

  /**
   * Obtenir les demandes créées par l'utilisateur courant
   */
  getMyRequests: () => ApprovalRequest[];

  // ============================================================================
  // Gestion des versions
  // ============================================================================

  /**
   * Créer une version d'une entité
   */
  createVersion: (version: Omit<EntityVersion, 'id' | 'createdAt' | 'versionNumber' | 'isRestored'>) => void;

  /**
   * Obtenir l'historique des versions d'une entité
   */
  getVersionHistory: (entityType: string, entityId: string) => EntityVersion[];

  /**
   * Restaurer une version antérieure
   */
  restoreVersion: (versionId: string) => Promise<void>;

  // ============================================================================
  // Logs d'activité
  // ============================================================================

  /**
   * Enregistrer une activité utilisateur
   */
  logActivity: (activity: Omit<UserActivity, 'id' | 'timestamp'>) => void;

  /**
   * Obtenir les activités d'un utilisateur
   */
  getUserActivities: (userId: string, limit?: number) => UserActivity[];

  // ============================================================================
  // Initialisation
  // ============================================================================

  /**
   * Initialiser le store avec des données par défaut
   */
  initialize: () => void;

  /**
   * Réinitialiser le store
   */
  reset: () => void;
}

// Données initiales avec un super admin par défaut
const INITIAL_SUPER_ADMIN: AuthUser = {
  id: 'super-admin-1',
  email: 'admin@mizanpro.ma',
  firstName: 'Super',
  lastName: 'Admin',
  role: 'SUPER_ADMIN',
  isActive: true,
  isLocked: false,
  isEmailVerified: true,
  language: 'fr',
  timezone: 'Africa/Casablanca',
  mustChangePassword: false, // Pas besoin de changement pour le compte démo
  failedLoginAttempts: 0,
  createdAt: new Date(),
  // Hash bcrypt de "admin123" (pour démo uniquement - changer en production)
  passwordHash: '$2b$10$Ho82bu/vykQkjs5MYekkquTMLAqE1367OA68d9FCzjmaEnV/kO6L6',
};

// Store avec persistence
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // État initial
      currentUser: null,
      session: null,
      isAuthenticated: false,
      isInitialized: false,
      users: [INITIAL_SUPER_ADMIN],
      invitations: [],
      approvalRequests: [],
      pendingApprovalsCount: 0,
      versions: [],
      userActivities: [],

      // ========================================================================
      // Actions d'authentification
      // ========================================================================

      login: async (credentials: LoginCredentials): Promise<LoginResult> => {
        const { users } = get();

        // Trouver l'utilisateur
        const user = users.find((u) => u.email === credentials.email);

        if (!user) {
          return {
            success: false,
            error: 'Email ou mot de passe incorrect',
          };
        }

        // Vérifier si le compte est actif
        if (!user.isActive) {
          return {
            success: false,
            error: 'Votre compte est désactivé. Contactez un administrateur.',
          };
        }

        // Vérifier si le compte est verrouillé
        if (user.isLocked) {
          return {
            success: false,
            error: 'Votre compte est verrouillé suite à plusieurs tentatives échouées. Contactez un administrateur.',
          };
        }

        // Vérifier le hash du mot de passe avec bcrypt
        if (!user.passwordHash) {
          return {
            success: false,
            error: 'Configuration du compte incorrecte. Contactez un administrateur.',
          };
        }
        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
          // Incrémenter les tentatives échouées
          const failedAttempts = user.failedLoginAttempts + 1;
          const shouldLock = failedAttempts >= 5;

          set((state) => ({
            users: state.users.map((u) =>
              u.id === user.id
                ? {
                    ...u,
                    failedLoginAttempts: failedAttempts,
                    lastFailedLoginAt: new Date(),
                    isLocked: shouldLock,
                  }
                : u
            ),
          }));

          // Logger l'activité
          get().logActivity({
            userId: user.id,
            type: 'LOGIN_FAILED',
            metadata: { email: credentials.email },
          });

          return {
            success: false,
            error: shouldLock
              ? 'Compte verrouillé suite à trop de tentatives échouées.'
              : `Email ou mot de passe incorrect. ${5 - failedAttempts} tentative(s) restante(s).`,
          };
        }

        // Réinitialiser les tentatives échouées
        const updatedUser: AuthUser = {
          ...user,
          failedLoginAttempts: 0,
          lastLoginAt: new Date(),
          lastLoginIp: 'N/A', // Dans un vrai système, obtenir l'IP réelle
        };

        // Créer la session
        const session: UserSession = {
          userId: user.id,
          user: updatedUser,
          establishmentId: updatedUser.defaultEstablishmentId,
        };

        // Mettre à jour le store
        set({
          currentUser: updatedUser,
          session,
          isAuthenticated: true,
          users: get().users.map((u) => (u.id === user.id ? updatedUser : u)),
        });

        // Logger l'activité
        get().logActivity({
          userId: user.id,
          type: 'LOGIN',
        });

        return {
          success: true,
          user: updatedUser,
          session,
          requiresPasswordChange: user.mustChangePassword,
          requiresEmailVerification: !user.isEmailVerified,
        };
      },

      logout: () => {
        const { currentUser } = get();

        if (currentUser) {
          get().logActivity({
            userId: currentUser.id,
            type: 'LOGOUT',
          });
        }

        set({
          currentUser: null,
          session: null,
          isAuthenticated: false,
        });
      },

      checkSession: () => {
        const { session } = get();
        if (!session) return false;

        // Vérifier l'expiration de la session si elle existe
        if (session.expiresAt && session.expiresAt < new Date()) {
          get().logout();
          return false;
        }

        return true;
      },

      refreshUser: async () => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const updatedUser = users.find((u) => u.id === currentUser.id);
        if (updatedUser) {
          set({ currentUser: updatedUser });
        }
      },

      changePassword: async (request: PasswordChangeRequest) => {
        const { users, currentUser } = get();

        if (request.newPassword !== request.confirmPassword) {
          return {
            success: false,
            error: 'Les mots de passe ne correspondent pas',
          };
        }

        if (request.newPassword.length < 8) {
          return {
            success: false,
            error: 'Le mot de passe doit contenir au moins 8 caractères',
          };
        }

        // Hasher le mot de passe avec bcrypt (10 rounds)
        const passwordHash = await bcrypt.hash(request.newPassword, 10);

        set((state) => ({
          users: state.users.map((u) =>
            u.id === request.userId
              ? {
                  ...u,
                  passwordHash,
                  lastPasswordChange: new Date(),
                  mustChangePassword: false,
                }
              : u
          ),
        }));

        // Logger l'activité
        get().logActivity({
          userId: request.userId,
          type: 'PASSWORD_CHANGE',
        });

        // Rafraîchir l'utilisateur courant si c'est lui
        if (currentUser?.id === request.userId) {
          await get().refreshUser();
        }

        return { success: true };
      },

      // ========================================================================
      // Gestion des utilisateurs
      // ========================================================================

      createUser: async (userData) => {
        const { currentUser, users } = get();

        if (!currentUser) {
          throw new Error('Non authentifié');
        }

        // Vérifier les permissions
        if (!get().hasPermission('users:create')) {
          throw new Error('Permission refusée');
        }

        // Vérifier si l'email existe déjà
        if (users.some((u) => u.email === userData.email)) {
          throw new Error('Cet email est déjà utilisé');
        }

        // Vérifier si on peut attribuer ce rôle
        if (!get().canAssignRole(userData.role)) {
          throw new Error("Vous n'avez pas le droit d'attribuer ce rôle");
        }

        const newUser: AuthUser = {
          ...userData,
          id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          createdBy: currentUser.id,
          failedLoginAttempts: 0,
          mustChangePassword: true, // Forcer le changement au premier login
        };

        set((state) => ({
          users: [...state.users, newUser],
        }));

        // Logger l'activité
        get().logActivity({
          userId: currentUser.id,
          type: 'LOGIN',
          metadata: {
            action: 'USER_CREATE',
            targetUserId: newUser.id,
            targetEmail: newUser.email,
          },
        });

        return newUser;
      },

      updateUser: async (userId, updates) => {
        const { currentUser } = get();

        if (!currentUser) {
          throw new Error('Non authentifié');
        }

        // Vérifier les permissions
        if (!get().hasPermission('users:update')) {
          throw new Error('Permission refusée');
        }

        // Vérifier si on peut gérer cet utilisateur
        if (!get().canManageUser(userId)) {
          throw new Error("Vous n'avez pas le droit de modifier cet utilisateur");
        }

        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, ...updates, updatedAt: new Date() } : u
          ),
        }));

        // Logger l'activité
        get().logActivity({
          userId: currentUser.id,
          type: 'LOGIN',
          metadata: {
            action: 'USER_UPDATE',
            targetUserId: userId,
            updates,
          },
        });

        // Rafraîchir l'utilisateur courant si c'est lui
        if (currentUser.id === userId) {
          await get().refreshUser();
        }
      },

      deleteUser: async (userId) => {
        const { currentUser } = get();

        if (!currentUser) {
          throw new Error('Non authentifié');
        }

        // Vérifier les permissions
        if (!get().hasPermission('users:delete')) {
          throw new Error('Permission refusée');
        }

        // Vérifier si on peut gérer cet utilisateur
        if (!get().canManageUser(userId)) {
          throw new Error("Vous n'avez pas le droit de supprimer cet utilisateur");
        }

        // Ne pas permettre la suppression du dernier super admin
        const targetUser = get().users.find((u) => u.id === userId);
        if (targetUser?.role === 'SUPER_ADMIN') {
          const superAdminCount = get().users.filter((u) => u.role === 'SUPER_ADMIN').length;
          if (superAdminCount <= 1) {
            throw new Error('Impossible de supprimer le dernier super administrateur');
          }
        }

        set((state) => ({
          users: state.users.filter((u) => u.id !== userId),
        }));

        // Logger l'activité
        get().logActivity({
          userId: currentUser.id,
          type: 'LOGIN',
          metadata: {
            action: 'USER_DELETE',
            targetUserId: userId,
          },
        });
      },

      assignRole: async (userId, role) => {
        const { currentUser } = get();

        if (!currentUser) {
          throw new Error('Non authentifié');
        }

        // Vérifier si on peut attribuer ce rôle
        if (!get().canAssignRole(role)) {
          throw new Error("Vous n'avez pas le droit d'attribuer ce rôle");
        }

        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, role, updatedAt: new Date() } : u
          ),
        }));

        // Logger l'activité
        get().logActivity({
          userId: currentUser.id,
          type: 'LOGIN',
          metadata: {
            action: 'ROLE_CHANGE',
            targetUserId: userId,
            newRole: role,
          },
        });
      },

      toggleUserActive: (userId) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, isActive: !u.isActive } : u
          ),
        }));
      },

      toggleUserLock: (userId) => {
        const { currentUser } = get();

        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  isLocked: !u.isLocked,
                  failedLoginAttempts: !u.isLocked ? u.failedLoginAttempts : 0,
                }
              : u
          ),
        }));

        // Logger l'activité
        if (currentUser) {
          const user = get().users.find((u) => u.id === userId);
          get().logActivity({
            userId: currentUser.id,
            type: user?.isLocked ? 'ACCOUNT_LOCKED' : 'ACCOUNT_UNLOCKED',
            metadata: { targetUserId: userId },
          });
        }
      },

      inviteUser: async (invitationData) => {
        const { currentUser } = get();

        if (!currentUser) {
          throw new Error('Non authentifié');
        }

        if (!get().hasPermission('users:create')) {
          throw new Error('Permission refusée');
        }

        if (!get().canAssignRole(invitationData.role)) {
          throw new Error("Vous n'avez pas le droit d'inviter avec ce rôle");
        }

        const invitation: UserInvitation = {
          ...invitationData,
          id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          invitedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
          token: Math.random().toString(36).substr(2, 32),
          isAccepted: false,
        };

        set((state) => ({
          invitations: [...state.invitations, invitation],
        }));

        return invitation;
      },

      acceptInvitation: async (token, password) => {
        const { invitations } = get();

        const invitation = invitations.find((i) => i.token === token && !i.isAccepted);

        if (!invitation) {
          return {
            success: false,
            error: "Invitation invalide ou déjà utilisée",
          };
        }

        if (invitation.expiresAt < new Date()) {
          return {
            success: false,
            error: "L'invitation a expiré",
          };
        }

        // Hasher le mot de passe
        const passwordHash = await bcrypt.hash(password, 10);

        // Créer l'utilisateur
        try {
          await get().createUser({
            email: invitation.email,
            firstName: '',
            lastName: '',
            role: invitation.role,
            isActive: true,
            isLocked: false,
            isEmailVerified: true,
            language: 'fr',
            timezone: 'Africa/Casablanca',
            mustChangePassword: false,
            passwordHash,
            establishmentIds: invitation.establishmentIds,
          });

          // Marquer l'invitation comme acceptée
          set((state) => ({
            invitations: state.invitations.map((i) =>
              i.id === invitation.id ? { ...i, isAccepted: true, acceptedAt: new Date() } : i
            ),
          }));

          return { success: true };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur lors de la création du compte',
          };
        }
      },

      // ========================================================================
      // Vérification des permissions
      // ========================================================================

      hasPermission: (permission) => {
        const { currentUser } = get();
        if (!currentUser) return false;
        return hasPermission(currentUser, permission);
      },

      canManageUser: (targetUserId) => {
        const { currentUser, users } = get();
        if (!currentUser) return false;

        const targetUser = users.find((u) => u.id === targetUserId);
        if (!targetUser) return false;

        return canManageUser(currentUser, targetUser);
      },

      canAssignRole: (role) => {
        const { currentUser } = get();
        if (!currentUser) return false;
        return canAssignRole(currentUser, role);
      },

      // ========================================================================
      // Système d'approbation
      // ========================================================================

      createApprovalRequest: async (requestData) => {
        const { currentUser } = get();

        if (!currentUser) {
          throw new Error('Non authentifié');
        }

        const request: ApprovalRequest = {
          ...requestData,
          id: `appr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          requestedBy: currentUser.id,
          requestedAt: new Date(),
          status: 'PENDING',
        };

        set((state) => ({
          approvalRequests: [...state.approvalRequests, request],
          pendingApprovalsCount: state.pendingApprovalsCount + 1,
        }));

        return request;
      },

      approveRequest: async (requestId, comment) => {
        const { currentUser } = get();

        if (!currentUser) {
          throw new Error('Non authentifié');
        }

        if (!get().hasPermission('approvals:approve')) {
          throw new Error('Permission refusée');
        }

        set((state) => ({
          approvalRequests: state.approvalRequests.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  status: 'APPROVED' as ApprovalStatus,
                  reviewedBy: currentUser.id,
                  reviewedAt: new Date(),
                  reviewComment: comment,
                }
              : r
          ),
          pendingApprovalsCount: Math.max(0, state.pendingApprovalsCount - 1),
        }));
      },

      rejectRequest: async (requestId, comment) => {
        const { currentUser } = get();

        if (!currentUser) {
          throw new Error('Non authentifié');
        }

        if (!get().hasPermission('approvals:reject')) {
          throw new Error('Permission refusée');
        }

        set((state) => ({
          approvalRequests: state.approvalRequests.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  status: 'REJECTED' as ApprovalStatus,
                  reviewedBy: currentUser.id,
                  reviewedAt: new Date(),
                  reviewComment: comment,
                }
              : r
          ),
          pendingApprovalsCount: Math.max(0, state.pendingApprovalsCount - 1),
        }));
      },

      cancelRequest: async (requestId) => {
        const { currentUser } = get();

        if (!currentUser) {
          throw new Error('Non authentifié');
        }

        const request = get().approvalRequests.find((r) => r.id === requestId);
        if (!request || request.requestedBy !== currentUser.id) {
          throw new Error('Permission refusée');
        }

        set((state) => ({
          approvalRequests: state.approvalRequests.map((r) =>
            r.id === requestId ? { ...r, status: 'CANCELLED' as ApprovalStatus } : r
          ),
          pendingApprovalsCount: Math.max(0, state.pendingApprovalsCount - 1),
        }));
      },

      getPendingApprovals: () => {
        const { approvalRequests, currentUser } = get();

        if (!currentUser || !get().hasPermission('approvals:read')) {
          return [];
        }

        return approvalRequests.filter((r) => r.status === 'PENDING');
      },

      getMyRequests: () => {
        const { approvalRequests, currentUser } = get();

        if (!currentUser) {
          return [];
        }

        return approvalRequests.filter((r) => r.requestedBy === currentUser.id);
      },

      // ========================================================================
      // Gestion des versions
      // ========================================================================

      createVersion: (versionData) => {
        const { currentUser, versions } = get();

        if (!currentUser) return;

        // Calculer le numéro de version
        const existingVersions = versions.filter(
          (v) => v.entityType === versionData.entityType && v.entityId === versionData.entityId
        );
        const versionNumber = existingVersions.length + 1;

        const version: EntityVersion = {
          ...versionData,
          id: `ver-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          versionNumber,
          isRestored: false,
        };

        set((state) => ({
          versions: [...state.versions, version],
        }));
      },

      getVersionHistory: (entityType, entityId) => {
        return get()
          .versions.filter((v) => v.entityType === entityType && v.entityId === entityId)
          .sort((a, b) => b.versionNumber - a.versionNumber);
      },

      restoreVersion: async (versionId) => {
        const { currentUser } = get();

        if (!currentUser) {
          throw new Error('Non authentifié');
        }

        if (!get().hasPermission('versions:restore')) {
          throw new Error('Permission refusée');
        }

        const version = get().versions.find((v) => v.id === versionId);
        if (!version) {
          throw new Error('Version introuvable');
        }

        // Créer une nouvelle version pour la restauration
        get().createVersion({
          entityType: version.entityType,
          entityId: version.entityId,
          data: version.data,
          action: 'RESTORE',
          createdBy: currentUser.id,
          comment: `Restauration de la version ${version.versionNumber}`,
        });

        // TODO: Appliquer effectivement la restauration dans le store concerné
      },

      // ========================================================================
      // Logs d'activité
      // ========================================================================

      logActivity: (activityData) => {
        const activity: UserActivity = {
          ...activityData,
          id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        };

        set((state) => ({
          userActivities: [...state.userActivities, activity],
        }));
      },

      getUserActivities: (userId, limit = 50) => {
        return get()
          .userActivities.filter((a) => a.userId === userId)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, limit);
      },

      // ========================================================================
      // Initialisation
      // ========================================================================

      initialize: () => {
        set({ isInitialized: true });
      },

      reset: () => {
        set({
          currentUser: null,
          session: null,
          isAuthenticated: false,
          users: [INITIAL_SUPER_ADMIN],
          invitations: [],
          approvalRequests: [],
          pendingApprovalsCount: 0,
          versions: [],
          userActivities: [],
        });
      },
    }),
    {
      name: 'mizanpro-auth-storage',
      partialize: (state) => ({
        // On persiste uniquement certaines données
        currentUser: state.currentUser,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        users: state.users,
        approvalRequests: state.approvalRequests,
        versions: state.versions.slice(-100), // Garder seulement les 100 dernières versions
        userActivities: state.userActivities.slice(-500), // Garder seulement les 500 dernières activités
      }),
    }
  )
);

// Hook pour initialiser le store au démarrage
export const initializeAuth = () => {
  const store = useAuthStore.getState();
  if (!store.isInitialized) {
    store.initialize();
    store.checkSession();
  }
};
