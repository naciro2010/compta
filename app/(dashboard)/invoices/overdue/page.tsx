'use client';

/**
 * Page: Factures en retard
 * EPIC Facturation - Story F.5
 * Dashboard des factures en retard avec système de relances
 */

import { useState } from 'react';
import { useInvoicingStore } from '@/store/invoicing';
import OverdueInvoicesDashboard from '@/components/invoicing/OverdueInvoicesDashboard';
import InvoiceDetail from '@/components/invoicing/InvoiceDetail';
import ReminderForm from '@/components/invoicing/ReminderForm';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

type ViewMode = 'dashboard' | 'detail' | 'reminder';

export default function OverdueInvoicesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const getInvoice = useInvoicingStore((state) => state.getInvoice);

  const selectedInvoice = selectedInvoiceId ? getInvoice(selectedInvoiceId) : null;

  const handleViewInvoice = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setViewMode('detail');
  };

  const handleSendReminder = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setViewMode('reminder');
  };

  const handleBack = () => {
    setViewMode('dashboard');
    setSelectedInvoiceId(null);
  };

  const handleReminderSuccess = () => {
    setViewMode('dashboard');
    setSelectedInvoiceId(null);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {viewMode !== 'dashboard' && (
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              {viewMode === 'dashboard' && 'Factures en retard'}
              {viewMode === 'detail' && 'Détails de la facture'}
              {viewMode === 'reminder' && 'Envoyer une relance'}
            </h1>
            <p className="text-gray-400 mt-1">
              {viewMode === 'dashboard' && 'Gestion et relances des factures impayées'}
              {viewMode === 'detail' && selectedInvoice && `Facture ${selectedInvoice.number}`}
              {viewMode === 'reminder' && selectedInvoice && `Relance pour ${selectedInvoice.number}`}
            </p>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      {viewMode === 'dashboard' && (
        <OverdueInvoicesDashboard
          onViewInvoice={handleViewInvoice}
          onSendReminder={handleSendReminder}
        />
      )}

      {viewMode === 'detail' && selectedInvoice && (
        <InvoiceDetail
          invoice={selectedInvoice}
          onBack={handleBack}
        />
      )}

      {viewMode === 'reminder' && selectedInvoiceId && (
        <div className="max-w-4xl">
          <ReminderForm
            invoiceId={selectedInvoiceId}
            onSuccess={handleReminderSuccess}
            onCancel={handleBack}
          />
        </div>
      )}
    </div>
  );
}
