'use client';

/**
 * Menu utilisateur dans la barre de navigation
 * Affiche les informations de l'utilisateur connecté et les options de déconnexion
 */

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import {
  User,
  LogOut,
  Settings,
  Bell,
  ChevronDown,
  Shield,
  Activity,
} from 'lucide-react';

const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrateur',
  MANAGER: 'Gestionnaire',
  CONSULTANT: 'Consultant',
};

const ROLE_COLORS = {
  SUPER_ADMIN: 'text-purple-400',
  ADMIN: 'text-blue-400',
  MANAGER: 'text-green-400',
  CONSULTANT: 'text-yellow-400',
};

export function UserMenu() {
  const router = useRouter();
  const { currentUser, logout, pendingApprovalsCount } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const fullName = `${currentUser.firstName} ${currentUser.lastName}`.trim() || 'Utilisateur';

  return (
    <div className="relative" ref={menuRef}>
      {/* Bouton du menu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-claude-surface/50 transition-colors"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-claude-accent to-orange-600 flex items-center justify-center">
          {currentUser.avatar ? (
            <img
              src={currentUser.avatar}
              alt={fullName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-4 h-4 text-white" />
          )}
        </div>

        {/* Infos utilisateur */}
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-white">{fullName}</div>
          <div className={`text-xs ${ROLE_COLORS[currentUser.role]}`}>
            {ROLE_LABELS[currentUser.role]}
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-claude-muted transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />

        {/* Badge des notifications */}
        {pendingApprovalsCount > 0 && (
          <div className="absolute top-1 right-1 w-5 h-5 bg-claude-accent rounded-full flex items-center justify-center text-xs font-bold text-white">
            {pendingApprovalsCount > 9 ? '9+' : pendingApprovalsCount}
          </div>
        )}
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-claude-surface rounded-lg border border-claude-border shadow-xl z-50 overflow-hidden">
          {/* En-tête du menu */}
          <div className="px-4 py-3 border-b border-claude-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-claude-accent to-orange-600 flex items-center justify-center">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={fullName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{fullName}</div>
                <div className="text-xs text-claude-muted">{currentUser.email}</div>
                <div className={`text-xs font-medium ${ROLE_COLORS[currentUser.role]} mt-1`}>
                  <Shield className="w-3 h-3 inline mr-1" />
                  {ROLE_LABELS[currentUser.role]}
                </div>
              </div>
            </div>
          </div>

          {/* Options du menu */}
          <div className="py-2">
            {/* Profil */}
            <button
              onClick={() => {
                router.push('/settings?tab=profile');
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-claude-text hover:bg-claude-bg transition-colors flex items-center gap-3"
            >
              <User className="w-4 h-4 text-claude-muted" />
              Mon profil
            </button>

            {/* Notifications */}
            {pendingApprovalsCount > 0 && (
              <button
                onClick={() => {
                  router.push('/approvals');
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-claude-text hover:bg-claude-bg transition-colors flex items-center gap-3"
              >
                <Bell className="w-4 h-4 text-claude-accent" />
                <span className="flex-1">Approbations en attente</span>
                <span className="px-2 py-0.5 bg-claude-accent rounded-full text-xs font-bold text-white">
                  {pendingApprovalsCount}
                </span>
              </button>
            )}

            {/* Activité */}
            <button
              onClick={() => {
                router.push('/settings?tab=activity');
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-claude-text hover:bg-claude-bg transition-colors flex items-center gap-3"
            >
              <Activity className="w-4 h-4 text-claude-muted" />
              Mon activité
            </button>

            {/* Paramètres */}
            <button
              onClick={() => {
                router.push('/settings');
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-claude-text hover:bg-claude-bg transition-colors flex items-center gap-3"
            >
              <Settings className="w-4 h-4 text-claude-muted" />
              Paramètres
            </button>
          </div>

          {/* Déconnexion */}
          <div className="border-t border-claude-border py-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3"
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-claude-border bg-claude-bg/50">
            <div className="text-xs text-claude-muted">
              Dernière connexion :{' '}
              {currentUser.lastLoginAt
                ? new Date(currentUser.lastLoginAt).toLocaleString('fr-MA')
                : 'Jamais'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
