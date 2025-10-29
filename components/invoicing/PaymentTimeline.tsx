'use client'

import React from 'react';
import { Payment, PaymentMethod } from '@/types/invoicing';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  CreditCard,
  Calendar,
  FileText,
  CheckCircle,
  Trash2,
  Banknote,
  Building,
  Smartphone,
  Wallet
} from 'lucide-react';

interface PaymentTimelineProps {
  payments: Payment[];
  currency: string;
  onDeletePayment?: (paymentId: string) => void;
  showActions?: boolean;
}

export default function PaymentTimeline({
  payments,
  currency,
  onDeletePayment,
  showActions = true
}: PaymentTimelineProps) {

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-MA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('fr-MA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'CASH':
        return 'Espèces';
      case 'CHECK':
        return 'Chèque';
      case 'BANK_TRANSFER':
        return 'Virement bancaire';
      case 'CARD':
        return 'Carte bancaire';
      case 'DIRECT_DEBIT':
        return 'Prélèvement';
      case 'MOBILE_PAYMENT':
        return 'Paiement mobile';
      case 'OTHER':
        return 'Autre';
    }
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'CASH':
        return <Banknote className="w-5 h-5 text-green-600" />;
      case 'CHECK':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'BANK_TRANSFER':
        return <Building className="w-5 h-5 text-purple-600" />;
      case 'CARD':
        return <CreditCard className="w-5 h-5 text-orange-600" />;
      case 'DIRECT_DEBIT':
        return <Building className="w-5 h-5 text-indigo-600" />;
      case 'MOBILE_PAYMENT':
        return <Smartphone className="w-5 h-5 text-pink-600" />;
      case 'OTHER':
        return <Wallet className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleDelete = (paymentId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      onDeletePayment?.(paymentId);
    }
  };

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Historique des paiements
          </CardTitle>
        </CardHeader>
        <div className="p-6 text-center text-claude-text-muted">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Aucun paiement enregistré pour le moment</p>
        </div>
      </Card>
    );
  }

  // Sort payments by date (most recent first)
  const sortedPayments = [...payments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Historique des paiements
        </CardTitle>
      </CardHeader>

      <div className="p-6">
        <div className="space-y-4">
          {sortedPayments.map((payment, index) => (
            <div
              key={payment.id}
              className={`border-l-4 border-green-500 bg-white rounded-lg p-4 shadow-sm ${
                index !== sortedPayments.length - 1 ? 'mb-4' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* En-tête */}
                  <div className="flex items-center gap-3 mb-3">
                    {getMethodIcon(payment.method)}
                    <div>
                      <h4 className="font-semibold text-claude-text">
                        {formatAmount(payment.amount)}
                      </h4>
                      <p className="text-sm text-claude-text-muted">
                        {getMethodLabel(payment.method)}
                      </p>
                    </div>
                  </div>

                  {/* Détails */}
                  <div className="space-y-2 text-sm">
                    {/* Date */}
                    <div className="flex items-center gap-2 text-claude-text-muted">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(payment.date)} à {formatTime(payment.createdAt)}
                      </span>
                    </div>

                    {/* Référence */}
                    {payment.reference && (
                      <div className="flex items-center gap-2 text-claude-text-muted">
                        <FileText className="w-4 h-4" />
                        <span>
                          <span className="font-medium">Réf:</span> {payment.reference}
                        </span>
                      </div>
                    )}

                    {/* Compte bancaire */}
                    {payment.bankAccount && (
                      <div className="flex items-center gap-2 text-claude-text-muted">
                        <Building className="w-4 h-4" />
                        <span>{payment.bankAccount}</span>
                      </div>
                    )}

                    {/* Date de valeur */}
                    {payment.valueDate && (
                      <div className="text-xs text-claude-text-muted">
                        Date de valeur: {formatDate(payment.valueDate)}
                      </div>
                    )}

                    {/* Notes */}
                    {payment.notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-claude-text">
                        <p className="text-xs font-medium text-claude-text-muted mb-1">
                          Notes:
                        </p>
                        <p className="text-sm">{payment.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {showActions && onDeletePayment && (
                  <div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(payment.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Supprimer le paiement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Pied de page avec créateur */}
              <div className="mt-3 pt-3 border-t border-claude-border text-xs text-claude-text-muted">
                Enregistré par {payment.createdBy}
              </div>
            </div>
          ))}
        </div>

        {/* Résumé */}
        <div className="mt-6 pt-6 border-t border-claude-border">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-green-700 font-medium">Total payé</p>
                <p className="text-xs text-green-600">
                  {payments.length} paiement{payments.length > 1 ? 's' : ''}
                </p>
              </div>
              <p className="text-2xl font-bold text-green-700">
                {formatAmount(payments.reduce((sum, p) => sum + p.amount, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
