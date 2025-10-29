'use client'

import React, { useState } from 'react';
import { useInvoicingStore } from '@/store/invoicing';
import { Invoice } from '@/types/invoicing';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import PaymentForm from './PaymentForm';
import PaymentTimeline from './PaymentTimeline';
import {
  FileText,
  Building,
  Calendar,
  CreditCard,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Eye,
  Edit,
  ArrowLeft,
  Plus
} from 'lucide-react';

interface InvoiceDetailProps {
  invoice: Invoice;
  onBack?: () => void;
  onEdit?: () => void;
  onViewPDF?: () => void;
}

export default function InvoiceDetail({
  invoice,
  onBack,
  onEdit,
  onViewPDF
}: InvoiceDetailProps) {
  const { getThirdParty, deletePayment } = useInvoicingStore();
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const thirdParty = getThirdParty(invoice.thirdPartyId);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: invoice.currency,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-MA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      DRAFT: 'Brouillon',
      SENT: 'Envoyée',
      VIEWED: 'Vue',
      PARTIALLY_PAID: 'Payée partiellement',
      PAID: 'Payée',
      OVERDUE: 'En retard',
      CANCELLED: 'Annulée',
      CONVERTED: 'Convertie',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SENT: 'bg-blue-100 text-blue-800',
      VIEWED: 'bg-cyan-100 text-cyan-800',
      PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      OVERDUE: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-600',
      CONVERTED: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const isOverdue = invoice.dueDate &&
    new Date(invoice.dueDate) < new Date() &&
    invoice.status !== 'PAID' &&
    invoice.status !== 'CANCELLED';

  const canAddPayment = invoice.amountDue > 0 &&
    invoice.status !== 'CANCELLED' &&
    invoice.status !== 'DRAFT';

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
  };

  const paymentPercentage = invoice.totalTTC > 0
    ? (invoice.amountPaid / invoice.totalTTC) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-claude-text flex items-center gap-3">
              <FileText className="w-8 h-8" />
              {invoice.number}
            </h1>
            <p className="text-claude-text-muted mt-1">
              Détails de la facture
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onViewPDF && (
            <Button variant="outline" onClick={onViewPDF}>
              <Eye className="w-4 h-4 mr-2" />
              Voir PDF
            </Button>
          )}
          {onEdit && invoice.status === 'DRAFT' && (
            <Button variant="outline" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          )}
          {canAddPayment && !showPaymentForm && (
            <Button variant="primary" onClick={() => setShowPaymentForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Enregistrer un paiement
            </Button>
          )}
        </div>
      </div>

      {/* Alerte si en retard */}
      {isOverdue && (
        <Card className="bg-red-50 border-red-200">
          <div className="p-4 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 mt-1" />
            <div>
              <h3 className="font-semibold text-red-900">Facture en retard</h3>
              <p className="text-red-800 text-sm mt-1">
                La date d'échéance ({formatDate(invoice.dueDate!)}) est dépassée.
                Montant restant dû: {formatAmount(invoice.amountDue)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Alerte si payée */}
      {invoice.status === 'PAID' && (
        <Card className="bg-green-50 border-green-200">
          <div className="p-4 flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
            <div>
              <h3 className="font-semibold text-green-900">Facture payée intégralement</h3>
              <p className="text-green-800 text-sm mt-1">
                Cette facture a été entièrement réglée le {invoice.paidAt ? formatDate(invoice.paidAt) : 'N/A'}.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-claude-text-muted mb-1">Numéro de facture</p>
                  <p className="font-mono font-semibold text-claude-text">{invoice.number}</p>
                </div>
                <div>
                  <p className="text-sm text-claude-text-muted mb-1">Statut</p>
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded ${getStatusColor(invoice.status)}`}>
                    {getStatusLabel(invoice.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-claude-text-muted mb-1">Date d'émission</p>
                  <p className="text-claude-text flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(invoice.issueDate)}
                  </p>
                </div>
                {invoice.dueDate && (
                  <div>
                    <p className="text-sm text-claude-text-muted mb-1">Date d'échéance</p>
                    <p className={`flex items-center gap-2 ${isOverdue ? 'text-red-600 font-semibold' : 'text-claude-text'}`}>
                      <Calendar className="w-4 h-4" />
                      {formatDate(invoice.dueDate)}
                    </p>
                  </div>
                )}
                {invoice.reference && (
                  <div className="col-span-2">
                    <p className="text-sm text-claude-text-muted mb-1">Référence client</p>
                    <p className="text-claude-text">{invoice.reference}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Client */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Client
              </CardTitle>
            </CardHeader>
            <div className="p-6">
              {thirdParty ? (
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-claude-text">{thirdParty.name}</p>
                  <p className="text-sm text-claude-text-muted">Code: {thirdParty.code}</p>
                  {thirdParty.ice && (
                    <p className="text-sm text-claude-text-muted">ICE: {thirdParty.ice}</p>
                  )}
                  {thirdParty.address && (
                    <p className="text-sm text-claude-text">{thirdParty.address}</p>
                  )}
                  {thirdParty.city && (
                    <p className="text-sm text-claude-text">{thirdParty.city}</p>
                  )}
                  {thirdParty.email && (
                    <p className="text-sm text-blue-600">{thirdParty.email}</p>
                  )}
                  {thirdParty.phone && (
                    <p className="text-sm text-claude-text">{thirdParty.phone}</p>
                  )}
                </div>
              ) : (
                <p className="text-claude-text-muted">Client non trouvé</p>
              )}
            </div>
          </Card>

          {/* Lignes de facturation */}
          <Card>
            <CardHeader>
              <CardTitle>Lignes de facturation</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-claude-border text-left">
                    <th className="p-3 text-sm font-medium text-claude-text-muted">Description</th>
                    <th className="p-3 text-sm font-medium text-claude-text-muted text-right">Qté</th>
                    <th className="p-3 text-sm font-medium text-claude-text-muted text-right">P.U.</th>
                    <th className="p-3 text-sm font-medium text-claude-text-muted text-right">TVA</th>
                    <th className="p-3 text-sm font-medium text-claude-text-muted text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lines.map((line) => (
                    <tr key={line.id} className="border-b border-claude-border">
                      <td className="p-3 text-claude-text">{line.description}</td>
                      <td className="p-3 text-right text-claude-text">{line.quantity}</td>
                      <td className="p-3 text-right text-claude-text">{formatAmount(line.unitPrice)}</td>
                      <td className="p-3 text-right text-claude-text">{line.vatRate}%</td>
                      <td className="p-3 text-right font-semibold text-claude-text">
                        {formatAmount(line.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Formulaire de paiement si actif */}
          {showPaymentForm && (
            <PaymentForm
              invoice={invoice}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setShowPaymentForm(false)}
            />
          )}

          {/* Timeline des paiements */}
          <PaymentTimeline
            payments={invoice.payments}
            currency={invoice.currency}
            onDeletePayment={deletePayment}
            showActions={true}
          />
        </div>

        {/* Colonne latérale - Résumé financier */}
        <div className="space-y-6">
          {/* Totaux */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Résumé financier
              </CardTitle>
            </CardHeader>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-claude-text-muted">Sous-total HT</span>
                  <span className="text-claude-text">{formatAmount(invoice.subtotalHT)}</span>
                </div>

                {invoice.globalDiscountRate && invoice.globalDiscountRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-claude-text-muted">
                      Remise globale ({invoice.globalDiscountRate}%)
                    </span>
                    <span className="text-red-600">
                      -{formatAmount(invoice.globalDiscountAmount || 0)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-medium pt-2 border-t border-claude-border">
                  <span className="text-claude-text-muted">Total HT</span>
                  <span className="text-claude-text">{formatAmount(invoice.totalHT)}</span>
                </div>

                {/* Détail TVA */}
                {invoice.vatBreakdown.map((vat) => (
                  <div key={vat.rate} className="flex justify-between text-sm">
                    <span className="text-claude-text-muted">TVA {vat.rate}%</span>
                    <span className="text-claude-text">{formatAmount(vat.amount)}</span>
                  </div>
                ))}

                <div className="flex justify-between text-lg font-bold pt-3 border-t-2 border-claude-border">
                  <span className="text-claude-text">Total TTC</span>
                  <span className="text-claude-text">{formatAmount(invoice.totalTTC)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* État des paiements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                État des paiements
              </CardTitle>
            </CardHeader>
            <div className="p-6 space-y-4">
              {/* Barre de progression */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-claude-text-muted">Progression</span>
                  <span className="font-semibold text-claude-text">
                    {paymentPercentage.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      paymentPercentage === 100
                        ? 'bg-green-500'
                        : paymentPercentage > 0
                        ? 'bg-yellow-500'
                        : 'bg-gray-400'
                    }`}
                    style={{ width: `${Math.min(paymentPercentage, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-700 font-medium mb-1">Montant payé</p>
                  <p className="text-xl font-bold text-green-700">
                    {formatAmount(invoice.amountPaid)}
                  </p>
                </div>

                <div className={`border rounded-lg p-3 ${
                  invoice.amountDue > 0
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`text-xs font-medium mb-1 ${
                    invoice.amountDue > 0 ? 'text-orange-700' : 'text-gray-700'
                  }`}>
                    Restant dû
                  </p>
                  <p className={`text-xl font-bold ${
                    invoice.amountDue > 0 ? 'text-orange-700' : 'text-gray-700'
                  }`}>
                    {formatAmount(invoice.amountDue)}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-claude-border text-xs text-claude-text-muted">
                <p>{invoice.payments.length} paiement{invoice.payments.length > 1 ? 's' : ''} enregistré{invoice.payments.length > 1 ? 's' : ''}</p>
              </div>
            </div>
          </Card>

          {/* Notes */}
          {(invoice.publicNotes || invoice.privateNotes) && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <div className="p-6 space-y-4">
                {invoice.publicNotes && (
                  <div>
                    <p className="text-sm font-medium text-claude-text mb-2">Notes publiques</p>
                    <p className="text-sm text-claude-text bg-gray-50 p-3 rounded">
                      {invoice.publicNotes}
                    </p>
                  </div>
                )}
                {invoice.privateNotes && (
                  <div>
                    <p className="text-sm font-medium text-claude-text mb-2">Notes privées</p>
                    <p className="text-sm text-claude-text bg-yellow-50 p-3 rounded">
                      {invoice.privateNotes}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
