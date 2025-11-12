'use client'

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useInvoicingStore } from '@/store/invoicing';
import { useAuthStore } from '@/store/auth';
import {
  Invoice,
  InvoiceType,
  InvoiceStatus,
  InvoiceLine,
  PaymentTerms,
  ThirdParty,
} from '@/types/invoicing';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Plus, Trash2, Calculator } from 'lucide-react';

// Dynamically import FileImporter to avoid SSR issues with PDF.js
const FileImporter = dynamic(() => import('./FileImporter'), {
  ssr: false,
});

interface InvoiceFormProps {
  invoice?: Invoice;
  defaultType?: InvoiceType;
  defaultThirdPartyId?: string;
  onSave?: (invoice: Invoice) => void;
  onCancel?: () => void;
}

export default function InvoiceForm({
  invoice,
  defaultType = 'INVOICE',
  defaultThirdPartyId,
  onSave,
  onCancel,
}: InvoiceFormProps) {
  const {
    createInvoice,
    updateInvoice,
    calculateInvoiceTotals,
    getCustomers,
    getSuppliers,
    getThirdParty,
  } = useInvoicingStore();

  const { currentUser } = useAuthStore();
  const customers = getCustomers();
  const suppliers = getSuppliers();

  // Form state
  const [formData, setFormData] = useState<Partial<Invoice>>({
    type: defaultType,
    status: 'DRAFT',
    thirdPartyId: defaultThirdPartyId || '',
    companyId: currentUser?.defaultEstablishmentId || 'default-company',
    issueDate: new Date(),
    paymentTerms: 'NET_30',
    currency: 'MAD',
    lines: [],
    globalDiscountRate: 0,
    publicNotes: '',
    privateNotes: '',
    ...invoice,
  });

  const [lines, setLines] = useState<Partial<InvoiceLine>[]>(
    invoice?.lines || [
      {
        description: '',
        quantity: 1,
        unitPrice: 0,
        vatRate: 20,
        discountRate: 0,
        order: 0,
      },
    ]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedThirdParty, setSelectedThirdParty] = useState<ThirdParty | null>(null);

  // Use suppliers for purchase invoices, customers for other types
  const thirdParties = formData.type === 'PURCHASE_INVOICE' ? suppliers : customers;

  // Load third party data when selected
  useEffect(() => {
    if (formData.thirdPartyId) {
      const thirdParty = getThirdParty(formData.thirdPartyId);
      if (thirdParty) {
        setSelectedThirdParty(thirdParty);
        // Set default payment terms from third party
        if (!invoice) {
          setFormData((prev) => ({
            ...prev,
            paymentTerms: thirdParty.paymentTerms,
          }));
        }
      }
    }
  }, [formData.thirdPartyId, getThirdParty, invoice]);

  // Calculate due date based on payment terms
  useEffect(() => {
    if (formData.issueDate && formData.paymentTerms) {
      const issueDate = new Date(formData.issueDate);
      let daysToAdd = 0;

      switch (formData.paymentTerms) {
        case 'IMMEDIATE':
          daysToAdd = 0;
          break;
        case 'NET_30':
          daysToAdd = 30;
          break;
        case 'NET_60':
          daysToAdd = 60;
          break;
        case 'NET_90':
          daysToAdd = 90;
          break;
        case 'CUSTOM':
          daysToAdd = selectedThirdParty?.customPaymentDays || 0;
          break;
      }

      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + daysToAdd);
      setFormData((prev) => ({ ...prev, dueDate }));
    }
  }, [formData.issueDate, formData.paymentTerms, selectedThirdParty]);

  // Calculate line totals
  const calculateLineTotals = (line: Partial<InvoiceLine>): Partial<InvoiceLine> => {
    const quantity = line.quantity || 0;
    const unitPrice = line.unitPrice || 0;
    const discountRate = line.discountRate || 0;
    const vatRate = line.vatRate || 20;

    const subtotalBeforeDiscount = quantity * unitPrice;
    const discountAmount = subtotalBeforeDiscount * (discountRate / 100);
    const subtotal = subtotalBeforeDiscount - discountAmount;
    const vatAmount = subtotal * (vatRate / 100);
    const total = subtotal + vatAmount;

    return {
      ...line,
      discountAmount,
      subtotal,
      vatAmount,
      total,
    };
  };

  // Update line and recalculate
  const updateLine = (index: number, field: keyof InvoiceLine, value: any) => {
    setLines((prevLines) => {
      const newLines = [...prevLines];
      newLines[index] = { ...newLines[index], [field]: value };
      newLines[index] = calculateLineTotals(newLines[index]);
      return newLines;
    });
  };

  // Add new line
  const addLine = () => {
    setLines((prev) => [
      ...prev,
      {
        description: '',
        quantity: 1,
        unitPrice: 0,
        vatRate: 20,
        discountRate: 0,
        order: prev.length,
      },
    ]);
  };

  // Remove line
  const removeLine = (index: number) => {
    if (lines.length === 1) {
      alert('La facture doit contenir au moins une ligne');
      return;
    }
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculate invoice totals
  const totals = calculateInvoiceTotals(
    lines as InvoiceLine[],
    formData.globalDiscountRate || 0
  );

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.thirdPartyId) {
      newErrors.thirdPartyId = 'Veuillez sélectionner un client';
    }

    if (!formData.issueDate) {
      newErrors.issueDate = 'La date d\'émission est obligatoire';
    }

    // Validate lines
    lines.forEach((line, index) => {
      if (!line.description?.trim()) {
        newErrors[`line_${index}_description`] = 'Description obligatoire';
      }
      if (!line.quantity || line.quantity <= 0) {
        newErrors[`line_${index}_quantity`] = 'Quantité invalide';
      }
      if (line.unitPrice === undefined || line.unitPrice < 0) {
        newErrors[`line_${index}_unitPrice`] = 'Prix invalide';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const invoiceData = {
      ...formData,
      lines: lines as InvoiceLine[],
      thirdParty: selectedThirdParty || undefined,
    };

    if (invoice) {
      // Update existing invoice
      updateInvoice(invoice.id, invoiceData);
      onSave?.(invoice);
    } else {
      // Create new invoice
      const newInvoice = createInvoice(invoiceData as any);
      onSave?.(newInvoice);
    }
  };

  const handleChange = (field: keyof Invoice, value: any) => {
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

  const getTypeLabel = () => {
    switch (formData.type) {
      case 'INVOICE':
        return 'Facture';
      case 'QUOTE':
        return 'Devis';
      case 'CREDIT_NOTE':
        return 'Avoir';
      case 'PROFORMA':
        return 'Pro-forma';
      case 'PURCHASE_INVOICE':
        return 'Facture d\'achat';
      default:
        return 'Document';
    }
  };

  // Handle data from file import
  const handleFileImport = (data: any) => {
    // Update form data with extracted information
    if (data.reference) {
      handleChange('reference', data.reference);
    }

    if (data.issueDate) {
      handleChange('issueDate', data.issueDate);
    }

    if (data.dueDate) {
      handleChange('dueDate', data.dueDate);
    }

    // Try to find matching customer or supplier by name or ICE
    if (data.clientName || data.clientICE) {
      const searchList = formData.type === 'PURCHASE_INVOICE' ? suppliers : customers;
      const matchingParty = searchList.find(
        (c) =>
          (data.clientICE && c.ice === data.clientICE) ||
          (data.clientName && c.name.toLowerCase().includes(data.clientName.toLowerCase()))
      );

      if (matchingParty) {
        handleChange('thirdPartyId', matchingParty.id);
      }
    }

    // Update lines if any were extracted
    if (data.lines && data.lines.length > 0) {
      const calculatedLines = data.lines.map((line: any, index: number) => ({
        ...line,
        order: index,
        ...calculateLineTotals(line),
      }));
      setLines(calculatedLines);
    }

    // Set notes if extracted
    if (data.notes) {
      handleChange('publicNotes', data.notes);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* En-tête - Type et Client */}
      <Card>
        <CardHeader>
          <CardTitle>
            {invoice ? `Modifier ${getTypeLabel()}` : `Nouvelle ${getTypeLabel()}`}
          </CardTitle>
          <CardDescription>
            {formData.number || 'Le numéro sera généré automatiquement'}
          </CardDescription>
        </CardHeader>
        <div className="space-y-4 p-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type de document *</Label>
              <Select
                id="type"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value as InvoiceType)}
                options={[
                  { value: 'INVOICE', label: 'Facture' },
                  { value: 'QUOTE', label: 'Devis' },
                  { value: 'CREDIT_NOTE', label: 'Avoir' },
                  { value: 'PROFORMA', label: 'Pro-forma' },
                  { value: 'PURCHASE_INVOICE', label: 'Facture d\'achat' },
                ]}
              />
            </div>

            <div>
              <Label htmlFor="status">Statut</Label>
              <Select
                id="status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value as InvoiceStatus)}
                options={[
                  { value: 'DRAFT', label: 'Brouillon' },
                  { value: 'SENT', label: 'Envoyée' },
                  { value: 'PAID', label: 'Payée' },
                  { value: 'CANCELLED', label: 'Annulée' },
                ]}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="thirdPartyId">
                {formData.type === 'PURCHASE_INVOICE' ? 'Fournisseur' : 'Client'} *
              </Label>
              <Select
                id="thirdPartyId"
                value={formData.thirdPartyId}
                onChange={(e) => handleChange('thirdPartyId', e.target.value)}
                options={[
                  {
                    value: '',
                    label: formData.type === 'PURCHASE_INVOICE'
                      ? 'Sélectionner un fournisseur...'
                      : 'Sélectionner un client...'
                  },
                  ...thirdParties.map((c) => ({
                    value: c.id,
                    label: `${c.code} - ${c.name}`,
                  })),
                ]}
                error={errors.thirdPartyId}
              />
              {selectedThirdParty && (
                <div className="mt-2 p-3 bg-claude-subtle rounded-md text-sm">
                  <div className="font-medium">{selectedThirdParty.name}</div>
                  {selectedThirdParty.ice && (
                    <div className="text-claude-muted">ICE: {selectedThirdParty.ice}</div>
                  )}
                  {selectedThirdParty.address && (
                    <div className="text-claude-muted">{selectedThirdParty.address}</div>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="reference">Référence client/commande</Label>
              <Input
                id="reference"
                value={formData.reference || ''}
                onChange={(e) => handleChange('reference', e.target.value)}
                placeholder="CMD-2025-001"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* File Importer - Only show for new invoices */}
      {!invoice && (
        <FileImporter onDataExtracted={handleFileImport} />
      )}

      {/* Dates et Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Dates et conditions de paiement</CardTitle>
        </CardHeader>
        <div className="space-y-4 p-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="issueDate">Date d'émission *</Label>
              <Input
                id="issueDate"
                type="date"
                value={
                  formData.issueDate instanceof Date
                    ? formData.issueDate.toISOString().split('T')[0]
                    : formData.issueDate
                }
                onChange={(e) => handleChange('issueDate', new Date(e.target.value))}
                error={errors.issueDate}
              />
            </div>

            <div>
              <Label htmlFor="paymentTerms">Conditions de paiement</Label>
              <Select
                id="paymentTerms"
                value={formData.paymentTerms}
                onChange={(e) => handleChange('paymentTerms', e.target.value as PaymentTerms)}
                options={[
                  { value: 'IMMEDIATE', label: 'Comptant' },
                  { value: 'NET_30', label: 'Net 30 jours' },
                  { value: 'NET_60', label: 'Net 60 jours' },
                  { value: 'NET_90', label: 'Net 90 jours' },
                ]}
              />
            </div>

            <div>
              <Label htmlFor="dueDate">Date d'échéance</Label>
              <Input
                id="dueDate"
                type="date"
                value={
                  formData.dueDate instanceof Date
                    ? formData.dueDate.toISOString().split('T')[0]
                    : formData.dueDate || ''
                }
                onChange={(e) => handleChange('dueDate', new Date(e.target.value))}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Lignes de facturation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lignes de facturation</span>
            <Button type="button" variant="outline" size="sm" onClick={addLine}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une ligne
            </Button>
          </CardTitle>
        </CardHeader>
        <div className="p-4">
          <div className="space-y-4">
            {lines.map((line, index) => (
              <div key={index} className="border border-claude-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-sm font-medium text-claude-muted">
                    Ligne {index + 1}
                  </div>
                  {lines.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLine(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid md:grid-cols-12 gap-3">
                  <div className="md:col-span-5">
                    <Label htmlFor={`description_${index}`}>Description *</Label>
                    <Input
                      id={`description_${index}`}
                      value={line.description || ''}
                      onChange={(e) => updateLine(index, 'description', e.target.value)}
                      placeholder="Description du produit/service"
                      error={errors[`line_${index}_description`]}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor={`quantity_${index}`}>Quantité *</Label>
                    <Input
                      id={`quantity_${index}`}
                      type="number"
                      step="0.01"
                      value={line.quantity || ''}
                      onChange={(e) => updateLine(index, 'quantity', parseFloat(e.target.value) || 0)}
                      error={errors[`line_${index}_quantity`]}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor={`unitPrice_${index}`}>Prix unit. (MAD) *</Label>
                    <Input
                      id={`unitPrice_${index}`}
                      type="number"
                      step="0.01"
                      value={line.unitPrice || ''}
                      onChange={(e) => updateLine(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      error={errors[`line_${index}_unitPrice`]}
                    />
                  </div>

                  <div className="md:col-span-1">
                    <Label htmlFor={`vatRate_${index}`}>TVA %</Label>
                    <Select
                      id={`vatRate_${index}`}
                      value={line.vatRate?.toString() || '20'}
                      onChange={(e) => updateLine(index, 'vatRate', parseFloat(e.target.value))}
                      options={[
                        { value: '20', label: '20%' },
                        { value: '14', label: '14%' },
                        { value: '10', label: '10%' },
                        { value: '7', label: '7%' },
                        { value: '0', label: '0%' },
                      ]}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor={`discountRate_${index}`}>Remise %</Label>
                    <Input
                      id={`discountRate_${index}`}
                      type="number"
                      step="0.01"
                      value={line.discountRate || 0}
                      onChange={(e) => updateLine(index, 'discountRate', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {/* Totaux de la ligne */}
                <div className="mt-3 pt-3 border-t border-claude-border flex justify-end gap-6 text-sm">
                  <div>
                    <span className="text-claude-muted">Sous-total HT:</span>
                    <span className="ml-2 font-medium">
                      {(line.subtotal || 0).toFixed(2)} MAD
                    </span>
                  </div>
                  <div>
                    <span className="text-claude-muted">TVA:</span>
                    <span className="ml-2 font-medium">
                      {(line.vatAmount || 0).toFixed(2)} MAD
                    </span>
                  </div>
                  <div>
                    <span className="text-claude-muted">Total TTC:</span>
                    <span className="ml-2 font-bold text-claude-primary">
                      {(line.total || 0).toFixed(2)} MAD
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Totaux et Remise globale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Totaux
          </CardTitle>
        </CardHeader>
        <div className="p-4">
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="globalDiscountRate">Remise globale (%)</Label>
                <Input
                  id="globalDiscountRate"
                  type="number"
                  step="0.01"
                  value={formData.globalDiscountRate || 0}
                  onChange={(e) => handleChange('globalDiscountRate', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Détail TVA */}
            {totals.vatBreakdown.length > 0 && (
              <div className="bg-claude-subtle rounded-lg p-4">
                <div className="text-sm font-medium mb-2">Détail TVA:</div>
                <div className="space-y-1 text-sm">
                  {totals.vatBreakdown.map((vat, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-claude-muted">
                        TVA {vat.rate}% sur {vat.base.toFixed(2)} MAD:
                      </span>
                      <span className="font-medium">{vat.amount.toFixed(2)} MAD</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Totaux finaux */}
            <div className="bg-claude-bg border-2 border-claude-primary rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-claude-muted">Sous-total HT:</span>
                <span className="font-medium">{totals.subtotalHT.toFixed(2)} MAD</span>
              </div>
              {formData.globalDiscountRate! > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Remise globale ({formData.globalDiscountRate}%):</span>
                  <span>
                    -{(totals.subtotalHT - totals.totalHT).toFixed(2)} MAD
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-claude-muted">Total HT:</span>
                <span className="font-medium">{totals.totalHT.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-claude-muted">Total TVA:</span>
                <span className="font-medium">{totals.totalVAT.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-claude-border">
                <span>Total TTC:</span>
                <span className="text-claude-primary">{totals.totalTTC.toFixed(2)} MAD</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes et commentaires</CardTitle>
        </CardHeader>
        <div className="p-4 space-y-4">
          <div>
            <Label htmlFor="publicNotes">Notes publiques (visibles sur la facture)</Label>
            <textarea
              id="publicNotes"
              className="w-full min-h-[80px] px-3 py-2 border border-claude-border rounded-md bg-claude-bg text-claude-text"
              value={formData.publicNotes || ''}
              onChange={(e) => handleChange('publicNotes', e.target.value)}
              placeholder="Ces notes apparaîtront sur le document..."
            />
          </div>

          <div>
            <Label htmlFor="privateNotes">Notes internes (non visibles)</Label>
            <textarea
              id="privateNotes"
              className="w-full min-h-[80px] px-3 py-2 border border-claude-border rounded-md bg-claude-bg text-claude-text"
              value={formData.privateNotes || ''}
              onChange={(e) => handleChange('privateNotes', e.target.value)}
              placeholder="Notes internes uniquement..."
            />
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" variant="primary" size="lg">
          {invoice ? 'Mettre à jour' : 'Créer la facture'}
        </Button>
      </div>
    </form>
  );
}
