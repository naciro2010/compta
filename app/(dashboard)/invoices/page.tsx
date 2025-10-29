'use client'

import React, { useState } from 'react';
import { useInvoicingStore } from '@/store/invoicing';
import { Invoice } from '@/types/invoicing';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import InvoiceForm from '@/components/invoicing/InvoiceForm';
import InvoiceList from '@/components/invoicing/InvoiceList';
import { FileText, AlertCircle } from 'lucide-react';

export default function InvoicesPage() {
  const { getInvoices, deleteInvoice, getCustomers } = useInvoicingStore();
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | undefined>();

  const invoices = getInvoices({ type: 'INVOICE' });
  const customers = getCustomers();

  const handleNew = () => {
    // Vérifier qu'il y a au moins un client
    if (customers.length === 0) {
      alert('Veuillez d\'abord créer au moins un client avant de créer une facture.');
      return;
    }
    setEditingInvoice(undefined);
    setShowForm(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowForm(true);
  };

  const handleDelete = (invoice: Invoice) => {
    if (invoice.status !== 'DRAFT') {
      alert('Seules les factures en brouillon peuvent être supprimées.');
      return;
    }
    if (confirm(`Êtes-vous sûr de vouloir supprimer la facture "${invoice.number}" ?`)) {
      deleteInvoice(invoice.id);
    }
  };

  const handleDuplicate = (invoice: Invoice) => {
    // La duplication est gérée dans InvoiceList
    setEditingInvoice(invoice);
    setShowForm(true);
  };

  const handleViewPDF = (invoice: Invoice) => {
    // TODO: Implémenter la génération/visualisation PDF
    alert(`Génération PDF de la facture ${invoice.number}\n(À implémenter dans Story F.2 - PDF)`);
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingInvoice(undefined);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingInvoice(undefined);
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-claude-text">Factures</h1>
          <p className="text-claude-text-muted mt-2">
            Gestion de vos factures clients
          </p>
        </div>
        {!showForm && (
          <Button variant="primary" onClick={handleNew}>
            <FileText className="w-4 h-4 mr-2" />
            Nouvelle facture
          </Button>
        )}
      </header>

      {/* Alerte si aucun client */}
      {customers.length === 0 && !showForm && (
        <Card className="bg-orange-50 border-orange-200">
          <div className="p-6 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-orange-600 mt-1" />
            <div>
              <h3 className="font-semibold text-orange-900 mb-2">
                Aucun client enregistré
              </h3>
              <p className="text-orange-800 mb-4">
                Vous devez d'abord créer au moins un client avant de pouvoir émettre des factures.
              </p>
              <Button
                variant="primary"
                onClick={() => window.location.href = '/customers'}
              >
                Aller aux clients
              </Button>
            </div>
          </div>
        </Card>
      )}

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingInvoice ? 'Modifier la facture' : 'Nouvelle facture'}
            </CardTitle>
            <CardDescription>
              {editingInvoice
                ? `Modification de la facture ${editingInvoice.number}`
                : 'Créer une nouvelle facture client'}
            </CardDescription>
          </CardHeader>
          <div className="p-4">
            <InvoiceForm
              invoice={editingInvoice}
              defaultType="INVOICE"
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </Card>
      ) : (
        <InvoiceList
          type="INVOICE"
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onViewPDF={handleViewPDF}
        />
      )}

      {/* Aide rapide */}
      {invoices.length === 0 && !showForm && customers.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              Créez votre première facture
            </h3>
            <p className="text-blue-800 mb-4">
              Les factures vous permettent de facturer vos clients et de suivre vos paiements.
              Fonctionnalités disponibles :
            </p>
            <ul className="list-disc list-inside text-blue-800 space-y-1 mb-4">
              <li>Gestion multi-lignes avec calculs automatiques HT/TVA/TTC</li>
              <li>Remises par ligne et remise globale</li>
              <li>Conditions de paiement personnalisées</li>
              <li>Numérotation automatique (FA-2025-00001)</li>
              <li>Génération PDF conforme aux normes marocaines (à venir)</li>
            </ul>
            <Button variant="primary" onClick={handleNew}>
              Créer ma première facture
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
