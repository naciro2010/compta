'use client';

/**
 * Page de gestion des utilisateurs
 * Permet aux admins de créer, modifier et supprimer des utilisateurs
 */

import { useState } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuthStore } from '@/store/auth';
import { AuthUser, UserRole, ROLE_HIERARCHY } from '@/types/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  User,
  UserPlus,
  Search,
  Edit,
  Trash2,
  Shield,
  Lock,
  Unlock,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Filter,
  Download,
} from 'lucide-react';

const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrateur',
  MANAGER: 'Gestionnaire',
  CONSULTANT: 'Consultant',
};

const ROLE_COLORS = {
  SUPER_ADMIN: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  ADMIN: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  MANAGER: 'bg-green-500/10 text-green-400 border-green-500/20',
  CONSULTANT: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

export default function UsersPage() {
  const {
    users,
    currentUser,
    createUser,
    updateUser,
    deleteUser,
    assignRole,
    toggleUserActive,
    toggleUserLock,
    canManageUser: checkCanManageUser,
    canAssignRole: checkCanAssignRole,
    hasPermission,
  } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);

  // Filtrer les utilisateurs
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'ACTIVE' && user.isActive) ||
      (filterStatus === 'INACTIVE' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = async (userData: Omit<AuthUser, 'id' | 'createdAt' | 'failedLoginAttempts'>) => {
    try {
      await createUser(userData);
      setShowCreateModal(false);
      alert('Utilisateur créé avec succès');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors de la création');
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<AuthUser>) => {
    try {
      await updateUser(userId, updates);
      setShowEditModal(false);
      setSelectedUser(null);
      alert('Utilisateur mis à jour avec succès');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors de la mise à jour');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userName}" ?`)) {
      return;
    }

    try {
      await deleteUser(userId);
      alert('Utilisateur supprimé avec succès');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors de la suppression');
    }
  };

  const handleToggleActive = (userId: string) => {
    toggleUserActive(userId);
  };

  const handleToggleLock = (userId: string) => {
    toggleUserLock(userId);
  };

  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    if (!checkCanAssignRole(newRole)) {
      alert("Vous n'avez pas le droit d'attribuer ce rôle");
      return;
    }

    try {
      await assignRole(userId, newRole);
      alert('Rôle modifié avec succès');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors du changement de rôle');
    }
  };

  return (
    <AuthGuard requiredPermission="users:read">
      <div className="container mx-auto py-8 px-4">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Gestion des utilisateurs
              </h1>
              <p className="text-claude-muted">
                Gérer les comptes utilisateurs et leurs permissions
              </p>
            </div>

            {hasPermission('users:create') && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Nouvel utilisateur
              </Button>
            )}
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-claude-surface rounded-lg border border-claude-border p-4">
              <div className="text-2xl font-bold text-white">{users.length}</div>
              <div className="text-sm text-claude-muted">Total utilisateurs</div>
            </div>
            <div className="bg-claude-surface rounded-lg border border-claude-border p-4">
              <div className="text-2xl font-bold text-green-400">
                {users.filter((u) => u.isActive).length}
              </div>
              <div className="text-sm text-claude-muted">Actifs</div>
            </div>
            <div className="bg-claude-surface rounded-lg border border-claude-border p-4">
              <div className="text-2xl font-bold text-red-400">
                {users.filter((u) => u.isLocked).length}
              </div>
              <div className="text-sm text-claude-muted">Verrouillés</div>
            </div>
            <div className="bg-claude-surface rounded-lg border border-claude-border p-4">
              <div className="text-2xl font-bold text-claude-accent">
                {users.filter((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length}
              </div>
              <div className="text-sm text-claude-muted">Administrateurs</div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-claude-surface rounded-lg border border-claude-border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Recherche */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-claude-muted" />
                <Input
                  placeholder="Rechercher par nom ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtre par rôle */}
            <div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as UserRole | 'ALL')}
                className="w-full px-3 py-2 bg-claude-bg border border-claude-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-claude-accent"
              >
                <option value="ALL">Tous les rôles</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Administrateur</option>
                <option value="MANAGER">Gestionnaire</option>
                <option value="CONSULTANT">Consultant</option>
              </select>
            </div>

            {/* Filtre par statut */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
                className="w-full px-3 py-2 bg-claude-bg border border-claude-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-claude-accent"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="ACTIVE">Actifs</option>
                <option value="INACTIVE">Inactifs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="bg-claude-surface rounded-lg border border-claude-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-claude-bg border-b border-claude-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-claude-muted uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-claude-muted uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-claude-muted uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-claude-muted uppercase tracking-wider">
                    Dernière connexion
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-claude-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-claude-border">
                {filteredUsers.map((user) => {
                  const canManage = checkCanManageUser(user.id);
                  const fullName = `${user.firstName} ${user.lastName}`.trim() || 'Utilisateur';

                  return (
                    <tr key={user.id} className="hover:bg-claude-bg transition-colors">
                      {/* Utilisateur */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-claude-accent to-orange-600 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {fullName}
                              {user.id === currentUser?.id && (
                                <span className="ml-2 text-xs text-claude-accent">(Vous)</span>
                              )}
                            </div>
                            <div className="text-xs text-claude-muted flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Rôle */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${
                            ROLE_COLORS[user.role]
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          {ROLE_LABELS[user.role]}
                        </span>
                      </td>

                      {/* Statut */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {user.isActive ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-400">
                              <CheckCircle className="w-3 h-3" />
                              Actif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-red-400">
                              <XCircle className="w-3 h-3" />
                              Inactif
                            </span>
                          )}
                          {user.isLocked && (
                            <span className="inline-flex items-center gap-1 text-xs text-orange-400">
                              <Lock className="w-3 h-3" />
                              Verrouillé
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Dernière connexion */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-claude-muted">
                        {user.lastLoginAt ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(user.lastLoginAt).toLocaleDateString('fr-MA')}
                          </div>
                        ) : (
                          'Jamais'
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {canManage && hasPermission('users:update') && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowEditModal(true);
                                }}
                                className="p-2 text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleToggleActive(user.id)}
                                className="p-2 text-yellow-400 hover:bg-yellow-500/10 rounded transition-colors"
                                title={user.isActive ? 'Désactiver' : 'Activer'}
                              >
                                {user.isActive ? (
                                  <XCircle className="w-4 h-4" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </button>

                              <button
                                onClick={() => handleToggleLock(user.id)}
                                className="p-2 text-orange-400 hover:bg-orange-500/10 rounded transition-colors"
                                title={user.isLocked ? 'Déverrouiller' : 'Verrouiller'}
                              >
                                {user.isLocked ? (
                                  <Unlock className="w-4 h-4" />
                                ) : (
                                  <Lock className="w-4 h-4" />
                                )}
                              </button>
                            </>
                          )}

                          {canManage && hasPermission('users:delete') && user.id !== currentUser?.id && (
                            <button
                              onClick={() => handleDeleteUser(user.id, fullName)}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-claude-muted mx-auto mb-4" />
                <p className="text-claude-muted">Aucun utilisateur trouvé</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal de création (simplifié pour l'exemple) */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-claude-surface rounded-lg border border-claude-border p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-white mb-4">
                Créer un utilisateur
              </h3>
              <p className="text-claude-muted mb-4">
                Fonctionnalité en cours de développement...
              </p>
              <Button onClick={() => setShowCreateModal(false)}>Fermer</Button>
            </div>
          </div>
        )}

        {/* Modal de modification (simplifié pour l'exemple) */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-claude-surface rounded-lg border border-claude-border p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-white mb-4">
                Modifier l'utilisateur
              </h3>
              <p className="text-claude-muted mb-4">
                Fonctionnalité en cours de développement...
              </p>
              <Button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
              >
                Fermer
              </Button>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
