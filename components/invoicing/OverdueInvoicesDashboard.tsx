'use client';

/**
 * OverdueInvoicesDashboard Component
 * EPIC Facturation - Story F.5
 * Dashboard des factures en retard avec alertes J+30, J+60
 */

import { useState, useMemo } from 'react';
import { useInvoicingStore } from '@/store/invoicing';
import { Invoice } from '@/types/invoicing';
import {
  AlertTriangle,
  AlertOctagon,
  AlertCircle,
  TrendingUp,
  Clock,
  Mail,
  Eye,
  DollarSign,
  Calendar,
} from 'lucide-react';

type SeverityLevel = 'all' | 'recent' | 'moderate' | 'severe';

interface OverdueInvoicesDashboardProps {
  onViewInvoice?: (invoiceId: string) => void;
  onSendReminder?: (invoiceId: string) => void;
}

export default function OverdueInvoicesDashboard({
  onViewInvoice,
  onSendReminder,
}: OverdueInvoicesDashboardProps) {
  const getOverdueSummary = useInvoicingStore((state) => state.getOverdueSummary);
  const getOverdueInvoicesByLevel = useInvoicingStore((state) => state.getOverdueInvoicesByLevel);
  const getOverdueInvoices = useInvoicingStore((state) => state.getOverdueInvoices);
  const getDaysOverdue = useInvoicingStore((state) => state.getDaysOverdue);
  const getThirdParty = useInvoicingStore((state) => state.getThirdParty);

  const [selectedLevel, setSelectedLevel] = useState<SeverityLevel>('all');

  const summary = useMemo(() => getOverdueSummary(), [getOverdueSummary]);

  const invoices = useMemo(() => {
    if (selectedLevel === 'all') {
      return getOverdueInvoices();
    }
    return getOverdueInvoicesByLevel(selectedLevel);
  }, [selectedLevel, getOverdueInvoices, getOverdueInvoicesByLevel]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getSeverityBadge = (invoice: Invoice) => {
    const daysOverdue = getDaysOverdue(invoice.id);

    if (daysOverdue < 30) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded">
          <AlertCircle className="w-3.5 h-3.5" />
          {daysOverdue}j
        </span>
      );
    } else if (daysOverdue < 60) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded">
          <AlertTriangle className="w-3.5 h-3.5" />
          {daysOverdue}j
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded">
          <AlertOctagon className="w-3.5 h-3.5" />
          {daysOverdue}j
        </span>
      );
    }
  };

  if (summary.total === 0) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-12 text-center border border-gray-700">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Aucune facture en retard
        </h3>
        <p className="text-gray-400">
          Toutes vos factures sont à jour. Excellent travail !
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total en retard */}
        <button
          onClick={() => setSelectedLevel('all')}
          className={`p-6 rounded-lg border-2 transition-all text-left ${
            selectedLevel === 'all'
              ? 'border-red-500 bg-red-500/10'
              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-sm text-gray-400 mb-1">Total en retard</p>
          <p className="text-2xl font-bold text-white mb-1">{summary.total}</p>
          <p className="text-sm text-red-400 font-medium">
            {formatCurrency(summary.totalAmount)} MAD
          </p>
        </button>

        {/* Récent (< 30j) */}
        <button
          onClick={() => setSelectedLevel('recent')}
          className={`p-6 rounded-lg border-2 transition-all text-left ${
            selectedLevel === 'recent'
              ? 'border-yellow-500 bg-yellow-500/10'
              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
            </div>
            <Clock className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-sm text-gray-400 mb-1">Récent (&lt; 30j)</p>
          <p className="text-2xl font-bold text-white mb-1">{summary.recent.count}</p>
          <p className="text-sm text-yellow-400 font-medium">
            {formatCurrency(summary.recent.amount)} MAD
          </p>
        </button>

        {/* Modéré (30-60j) */}
        <button
          onClick={() => setSelectedLevel('moderate')}
          className={`p-6 rounded-lg border-2 transition-all text-left ${
            selectedLevel === 'moderate'
              ? 'border-orange-500 bg-orange-500/10'
              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
            </div>
            <Clock className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-sm text-gray-400 mb-1">Modéré (30-60j)</p>
          <p className="text-2xl font-bold text-white mb-1">{summary.moderate.count}</p>
          <p className="text-sm text-orange-400 font-medium">
            {formatCurrency(summary.moderate.amount)} MAD
          </p>
        </button>

        {/* Sévère (> 60j) */}
        <button
          onClick={() => setSelectedLevel('severe')}
          className={`p-6 rounded-lg border-2 transition-all text-left ${
            selectedLevel === 'severe'
              ? 'border-red-600 bg-red-600/10'
              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center">
              <AlertOctagon className="w-6 h-6 text-red-500" />
            </div>
            <Clock className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-sm text-gray-400 mb-1">Sévère (&gt; 60j)</p>
          <p className="text-2xl font-bold text-white mb-1">{summary.severe.count}</p>
          <p className="text-sm text-red-500 font-medium">
            {formatCurrency(summary.severe.amount)} MAD
          </p>
        </button>
      </div>

      {/* Liste des factures */}
      <div className="bg-[#1a1f2e] rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">
            {selectedLevel === 'all' && 'Toutes les factures en retard'}
            {selectedLevel === 'recent' && 'Factures récemment en retard (< 30 jours)'}
            {selectedLevel === 'moderate' && 'Factures modérément en retard (30-60 jours)'}
            {selectedLevel === 'severe' && 'Factures sévèrement en retard (> 60 jours)'}
            <span className="ml-2 text-gray-400">({invoices.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50 text-gray-400 text-sm">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Facture</th>
                <th className="px-6 py-3 text-left font-medium">Client</th>
                <th className="px-6 py-3 text-left font-medium">Échéance</th>
                <th className="px-6 py-3 text-left font-medium">Retard</th>
                <th className="px-6 py-3 text-right font-medium">Montant dû</th>
                <th className="px-6 py-3 text-center font-medium">Relances</th>
                <th className="px-6 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {invoices.map((invoice) => {
                const thirdParty = invoice.thirdParty || getThirdParty(invoice.thirdPartyId);
                const daysOverdue = getDaysOverdue(invoice.id);

                return (
                  <tr
                    key={invoice.id}
                    className="hover:bg-gray-800/30 transition-colors"
                  >
                    {/* Facture */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">{invoice.number}</p>
                        {invoice.reference && (
                          <p className="text-sm text-gray-400">Réf: {invoice.reference}</p>
                        )}
                      </div>
                    </td>

                    {/* Client */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white">{thirdParty?.name || 'Client inconnu'}</p>
                        {thirdParty?.code && (
                          <p className="text-sm text-gray-400">{thirdParty.code}</p>
                        )}
                      </div>
                    </td>

                    {/* Échéance */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        {formatDate(invoice.dueDate)}
                      </div>
                    </td>

                    {/* Retard */}
                    <td className="px-6 py-4">{getSeverityBadge(invoice)}</td>

                    {/* Montant dû */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-white">
                          {formatCurrency(invoice.amountDue)}
                        </span>
                        <span className="text-gray-400 text-sm">{invoice.currency}</span>
                      </div>
                    </td>

                    {/* Relances */}
                    <td className="px-6 py-4 text-center">
                      {invoice.reminders.length > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                          <Mail className="w-3.5 h-3.5" />
                          {invoice.reminders.length}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">Aucune</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onViewInvoice?.(invoice.id)}
                          className="p-2 hover:bg-gray-700 rounded transition-colors"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4 text-gray-400 hover:text-white" />
                        </button>
                        <button
                          onClick={() => onSendReminder?.(invoice.id)}
                          className="p-2 hover:bg-blue-600/20 rounded transition-colors"
                          title="Envoyer une relance"
                        >
                          <Mail className="w-4 h-4 text-blue-400 hover:text-blue-300" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {invoices.length === 0 && (
          <div className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Aucune facture dans cette catégorie</p>
          </div>
        )}
      </div>

      {/* Conseils */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-200">
            <p className="font-medium mb-1">Conseils pour le recouvrement</p>
            <ul className="space-y-1 text-blue-300/80">
              <li>• Envoyez une première relance après 7 jours de retard</li>
              <li>• Relancez tous les 15-30 jours si pas de réponse</li>
              <li>• Contactez par téléphone après 60 jours de retard</li>
              <li>• Envisagez une mise en demeure après 90 jours</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
