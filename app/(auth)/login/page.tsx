'use client';

/**
 * Page de connexion
 * Système d'authentification adapté au marché marocain
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { LoginCredentials } from '@/types/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertCircle, Lock, Mail, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, currentUser } = useAuthStore();

  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Rediriger si déjà authentifié
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(credentials);

      if (result.success) {
        // Rediriger vers le dashboard
        if (result.requiresPasswordChange) {
          router.push('/change-password');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(result.error || 'Une erreur est survenue');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-claude-bg via-claude-surface to-claude-bg p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-claude-accent to-orange-600 mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">MizanPro</h1>
          <p className="text-claude-muted">
            Logiciel de gestion comptable marocain
          </p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-claude-surface rounded-lg border border-claude-border p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6">Connexion</h2>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-400">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-claude-text mb-2"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-claude-muted" />
                <Input
                  id="email"
                  type="email"
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({ ...credentials, email: e.target.value })
                  }
                  placeholder="votre@email.ma"
                  className="pl-10"
                  required
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-claude-text mb-2"
              >
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-claude-muted" />
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="pl-10"
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Se souvenir de moi */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={credentials.rememberMe}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      rememberMe: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded border-claude-border bg-claude-bg text-claude-accent focus:ring-2 focus:ring-claude-accent focus:ring-offset-0 focus:ring-offset-claude-surface"
                  disabled={isLoading}
                />
                <span className="text-sm text-claude-muted">
                  Se souvenir de moi
                </span>
              </label>

              <button
                type="button"
                className="text-sm text-claude-accent hover:text-orange-400 transition-colors"
                disabled={isLoading}
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Bouton de connexion */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Se connecter
                </>
              )}
            </Button>
          </form>

          {/* Informations de démonstration */}
          <div className="mt-6 p-4 rounded-lg bg-claude-accent/10 border border-claude-accent/20">
            <p className="text-sm text-claude-accent font-medium mb-2">
              Compte de démonstration :
            </p>
            <div className="text-xs text-claude-muted space-y-1">
              <p>Email : admin@mizanpro.ma</p>
              <p>Mot de passe : admin123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-claude-muted">
          <p>© 2025 MizanPro - Gestion comptable marocaine</p>
          <p className="mt-2">
            Conforme au Plan Comptable Marocain (CGNC)
          </p>
        </div>
      </div>
    </div>
  );
}
