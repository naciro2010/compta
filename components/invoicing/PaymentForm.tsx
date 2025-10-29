'use client'

import React, { useState } from 'react';
import { useInvoicingStore } from '@/store/invoicing';
import { Invoice, PaymentMethod } from '@/types/invoicing';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { CreditCard, Calendar, FileText, DollarSign } from 'lucide-react';

interface PaymentFormProps {
  invoice: Invoice;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PaymentForm({ invoice, onSuccess, onCancel }: PaymentFormProps) {
  const { addPayment } = useInvoicingStore();

  const [formData, setFormData] = useState({
    amount: invoice.amountDue,
    method: 'BANK_TRANSFER' as PaymentMethod,
    date: new Date().toISOString().split('T')[0],
    valueDate: '',
    reference: '',
    bankAccount: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const paymentMethods = [
    { value: 'CASH', label: 'Espèces' },
    { value: 'CHECK', label: 'Chèque' },
    { value: 'BANK_TRANSFER', label: 'Virement bancaire' },
    { value: 'CARD', label: 'Carte bancaire' },
    { value: 'DIRECT_DEBIT', label: 'Prélèvement automatique' },
    { value: 'MOBILE_PAYMENT', label: 'Paiement mobile' },
    { value: 'OTHER', label: 'Autre' },
  ];

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: invoice.currency,
    }).format(amount);
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Le montant doit être supérieur à 0';
    }

    if (formData.amount > invoice.amountDue) {
      newErrors.amount = `Le montant ne peut pas dépasser le restant dû (${formatAmount(invoice.amountDue)})`;
    }

    if (!formData.date) {
      newErrors.date = 'La date est obligatoire';
    }

    if (formData.method === 'CHECK' && !formData.reference) {
      newErrors.reference = 'Le numéro de chèque est obligatoire';
    }

    if (formData.method === 'BANK_TRANSFER' && !formData.reference) {
      newErrors.reference = 'La référence du virement est recommandée';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Enregistrer le paiement
    addPayment({
      invoiceId: invoice.id,
      amount: Number(formData.amount),
      currency: invoice.currency,
      method: formData.method,
      date: new Date(formData.date),
      valueDate: formData.valueDate ? new Date(formData.valueDate) : undefined,
      reference: formData.reference || undefined,
      bankAccount: formData.bankAccount || undefined,
      notes: formData.notes || undefined,
    });

    onSuccess?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Enregistrer un paiement
        </CardTitle>
        <CardDescription>
          Facture {invoice.number} - Restant dû: {formatAmount(invoice.amountDue)}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Informations facture */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-600 font-medium">Facture</p>
              <p className="text-blue-900">{invoice.number}</p>
            </div>
            <div>
              <p className="text-blue-600 font-medium">Client</p>
              <p className="text-blue-900">{invoice.thirdParty?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-blue-600 font-medium">Montant total TTC</p>
              <p className="text-blue-900 font-semibold">{formatAmount(invoice.totalTTC)}</p>
            </div>
            <div>
              <p className="text-blue-600 font-medium">Déjà payé</p>
              <p className="text-green-700 font-semibold">{formatAmount(invoice.amountPaid)}</p>
            </div>
          </div>
        </div>

        {/* Montant */}
        <div>
          <label className="block text-sm font-medium text-claude-text mb-2">
            Montant du paiement <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-claude-text-muted" />
            <Input
              type="number"
              step="0.01"
              min="0.01"
              max={invoice.amountDue}
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              className={`pl-10 ${errors.amount ? 'border-red-500' : ''}`}
              placeholder="0.00"
            />
          </div>
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
          )}
          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => handleChange('amount', invoice.amountDue)}
            >
              Solde complet
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => handleChange('amount', invoice.amountDue / 2)}
            >
              50%
            </Button>
          </div>
        </div>

        {/* Méthode de paiement */}
        <div>
          <label className="block text-sm font-medium text-claude-text mb-2">
            Méthode de paiement <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.method}
            onChange={(e) => handleChange('method', e.target.value)}
            options={paymentMethods}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-claude-text mb-2">
              Date du paiement <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-claude-text-muted" />
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className={`pl-10 ${errors.date ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-claude-text mb-2">
              Date de valeur (optionnel)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-claude-text-muted" />
              <Input
                type="date"
                value={formData.valueDate}
                onChange={(e) => handleChange('valueDate', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Référence */}
        <div>
          <label className="block text-sm font-medium text-claude-text mb-2">
            Référence
            {(formData.method === 'CHECK' || formData.method === 'BANK_TRANSFER') && (
              <span className="text-red-500"> *</span>
            )}
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-claude-text-muted" />
            <Input
              type="text"
              value={formData.reference}
              onChange={(e) => handleChange('reference', e.target.value)}
              className={`pl-10 ${errors.reference ? 'border-red-500' : ''}`}
              placeholder={
                formData.method === 'CHECK'
                  ? 'Numéro de chèque'
                  : formData.method === 'BANK_TRANSFER'
                  ? 'Référence du virement'
                  : 'Référence du paiement'
              }
            />
          </div>
          {errors.reference && (
            <p className="text-red-500 text-sm mt-1">{errors.reference}</p>
          )}
        </div>

        {/* Compte bancaire */}
        {(formData.method === 'BANK_TRANSFER' || formData.method === 'CHECK') && (
          <div>
            <label className="block text-sm font-medium text-claude-text mb-2">
              Compte bancaire (optionnel)
            </label>
            <Input
              type="text"
              value={formData.bankAccount}
              onChange={(e) => handleChange('bankAccount', e.target.value)}
              placeholder="Compte bancaire utilisé"
            />
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-claude-text mb-2">
            Notes (optionnel)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="w-full px-4 py-2 bg-white border border-claude-border rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-primary focus:border-transparent text-claude-text"
            rows={3}
            placeholder="Notes internes sur ce paiement..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-claude-border">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          )}
          <Button type="submit" variant="primary">
            Enregistrer le paiement
          </Button>
        </div>
      </form>
    </Card>
  );
}
