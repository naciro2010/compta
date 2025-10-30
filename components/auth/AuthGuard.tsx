'use client';

/**
 * Composant de protection des routes
 * Vérifie l'authentification et les permissions
 */

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, initializeAuth } from '@/store/auth';
import { ModulePermission, UserRole } from '@/types/auth';
import { Loader2, Lock } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredPermission?: ModulePermission;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}

export function AuthGuard({
  children,
  requiredPermission,
  requiredRole,
  fallback,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isAuthenticated,
    isInitialized,
    currentUser,
    hasPermission,
    checkSession,
  } = useAuthStore();

  useEffect(() => {
    // Initialiser le store au premier rendu
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized]);

  useEffect(() => {
    // Vérifier la session
    if (isInitialized && !checkSession()) {
      // Session expirée, rediriger vers login
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Si pas authentifié, rediriger vers login
    if (isInitialized && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isInitialized, checkSession, router, pathname]);

  // Afficher un loader pendant l'initialisation
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-claude-bg">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-claude-accent animate-spin mx-auto mb-4" />
          <p className="text-claude-muted">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si pas authentifié, ne rien afficher (redirection en cours)
  if (!isAuthenticated || !currentUser) {
    return null;
  }

  // Vérifier le rôle requis
  if (requiredRole && currentUser.role !== requiredRole) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="min-h-screen flex items-center justify-center bg-claude-bg p-4">
        <div className="max-w-md w-full bg-claude-surface rounded-lg border border-claude-border p-8 text-center">
          <Lock className="w-12 h-12 text-claude-accent mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Accès refusé
          </h2>
          <p className="text-claude-muted mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette
            page.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-claude-accent hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  // Vérifier la permission requise
  if (requiredPermission && !hasPermission(requiredPermission)) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="min-h-screen flex items-center justify-center bg-claude-bg p-4">
        <div className="max-w-md w-full bg-claude-surface rounded-lg border border-claude-border p-8 text-center">
          <Lock className="w-12 h-12 text-claude-accent mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Accès refusé
          </h2>
          <p className="text-claude-muted mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette
            page.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-claude-accent hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  // Si tout est OK, afficher le contenu
  return <>{children}</>;
}

/**
 * Hook pour vérifier les permissions dans les composants
 */
export function useRequireAuth(requiredPermission?: ModulePermission) {
  const { isAuthenticated, currentUser, hasPermission } = useAuthStore();

  if (!isAuthenticated || !currentUser) {
    return {
      isAuthorized: false,
      user: null,
    };
  }

  const isAuthorized = requiredPermission
    ? hasPermission(requiredPermission)
    : true;

  return {
    isAuthorized,
    user: currentUser,
  };
}
