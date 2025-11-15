/**
 * Page de configuration de la numérotation des documents
 * Story F.6 - Système de numérotation personnalisable
 */

'use client';

import Link from 'next/link';
import { InvoiceNumberingSettings } from '@/components/invoicing/InvoiceNumberingSettings';
import { ArrowLeft } from 'lucide-react';

export default function NumberingSettingsPage() {
  // TODO: Récupérer le companyId depuis le contexte d'authentification
  // Pour l'instant, on utilise un ID par défaut
  const companyId = 'company-default';

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/settings"
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Paramètres
        </Link>
        <span className="text-gray-600">/</span>
        <span className="text-white">Numérotation</span>
      </div>

      {/* En-tête */}
      <header>
        <h1 className="text-3xl font-bold text-white">Configuration de la numérotation</h1>
        <p className="text-gray-400 mt-2">
          Personnalisez le format de numérotation pour chaque type de document (factures, devis, avoirs, etc.)
        </p>
      </header>

      {/* Composant de configuration */}
      <InvoiceNumberingSettings companyId={companyId} />

      {/* Documentation */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6 space-y-4">
        <h3 className="text-lg font-medium text-white">Comment ça marche ?</h3>

        <div className="space-y-3 text-sm text-gray-300">
          <div>
            <h4 className="font-medium text-white mb-1">Format de numérotation</h4>
            <p className="text-gray-400">
              Chaque type de document peut avoir son propre format de numérotation. Le format se compose de :
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-gray-400">
              <li><strong className="text-gray-300">Préfixe</strong> : Code court identifiant le type de document (ex: FA, DEV, AV)</li>
              <li><strong className="text-gray-300">Année</strong> : L'année en cours (optionnel)</li>
              <li><strong className="text-gray-300">Compteur</strong> : Numéro séquentiel avec zéros de remplissage</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-white mb-1">Exemples de formats</h4>
            <div className="bg-gray-900 rounded border border-gray-700 p-3 space-y-1 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">FA-2025-00001</span>
                <span className="text-gray-500">Préfixe + Année + Compteur</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">DEV/2025/00042</span>
                <span className="text-gray-500">Avec séparateur slash</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">AV_123</span>
                <span className="text-gray-500">Sans année, 3 chiffres</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">PRO-0000001</span>
                <span className="text-gray-500">7 chiffres sans année</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-white mb-1">Réinitialisation annuelle</h4>
            <p className="text-gray-400">
              Si activée, le compteur recommencera à 1 au début de chaque année.
              Recommandé si vous incluez l'année dans le format de numérotation.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-white mb-1">Modifications futures</h4>
            <p className="text-gray-400">
              Les modifications du format s'appliquent uniquement aux nouveaux documents.
              Les documents existants conservent leur numérotation d'origine.
            </p>
          </div>
        </div>
      </div>

      {/* Bonnes pratiques */}
      <div className="bg-blue-500/5 rounded-lg border border-blue-500/20 p-6">
        <h3 className="text-lg font-medium text-blue-400 mb-3">Bonnes pratiques</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>Utilisez des préfixes courts et explicites (2-4 caractères)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>Incluez l'année pour faciliter l'archivage et la recherche</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>Utilisez suffisamment de chiffres pour votre volume (5 chiffres = 99,999 documents/an)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>Activez la réinitialisation annuelle si vous incluez l'année dans le format</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>Testez le format avec l'aperçu avant de sauvegarder</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
