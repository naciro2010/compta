'use client'

import React, { useState } from 'react';
import { useInvoicingStore } from '@/store/invoicing';
import { Invoice } from '@/types/invoicing';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import QuoteForm from '@/components/invoicing/QuoteForm';
import QuoteList from '@/components/invoicing/QuoteList';
import { FileText, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QuotesPage() {
  const { getInvoices, deleteInvoice, getCustomers } = useInvoicingStore();
  const [showForm, setShowForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Invoice | undefined>();
  const router = useRouter();

  const quotes = getInvoices({ type: 'QUOTE' });
  const customers = getCustomers();

  const handleNew = () => {
    // Vérifier qu'il y a au moins un client
    if (customers.length === 0) {
      alert('Veuillez d\'abord créer au moins un client avant de créer un devis.');
      return;
    }
    setEditingQuote(undefined);
    setShowForm(true);
  };

  const handleEdit = (quote: Invoice) => {
    if (quote.status === 'CONVERTED') {
      alert('Ce devis a déjà été converti en facture et ne peut plus être modifié.');
      return;
    }
    setEditingQuote(quote);
    setShowForm(true);
  };

  const handleDelete = (quote: Invoice) => {
    if (quote.status === 'CONVERTED') {
      alert('Les devis convertis ne peuvent pas être supprimés.');
      return;
    }
    // Already handled in QuoteList
  };

  const handleDuplicate = (quote: Invoice) => {
    // La duplication est gérée dans QuoteList
    setEditingQuote(quote);
    setShowForm(true);
  };

  const handleViewPDF = (quote: Invoice) => {
    // TODO: Implémenter la génération/visualisation PDF
    alert(`Aperçu PDF du devis ${quote.number}\n(À implémenter - génération PDF avec bibliothèque comme jsPDF ou react-pdf)`);
  };

  const handleConvertToInvoice = (invoice: Invoice) => {
    alert(`Devis converti en facture ${invoice.number} avec succès !`);
    // Rediriger vers la page de facture
    router.push('/invoices');
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingQuote(undefined);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingQuote(undefined);
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-claude-text">Devis</h1>
          <p className="text-claude-text-muted mt-2">
            Gestion de vos devis clients
          </p>
        </div>
        {!showForm && (
          <Button variant="primary" onClick={handleNew}>
            <FileText className="w-4 h-4 mr-2" />
            Nouveau devis
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
                Vous devez d'abord créer au moins un client avant de pouvoir créer des devis.
              </p>
              <Button
                variant="primary"
                onClick={() => router.push('/customers')}
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
              {editingQuote ? 'Modifier le devis' : 'Nouveau devis'}
            </CardTitle>
            <CardDescription>
              {editingQuote
                ? `Modification du devis ${editingQuote.number}`
                : 'Créer un nouveau devis client'}
            </CardDescription>
          </CardHeader>
          <div className="p-4">
            <QuoteForm
              quote={editingQuote}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </Card>
      ) : (
        <QuoteList
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onViewPDF={handleViewPDF}
          onConvertToInvoice={handleConvertToInvoice}
        />
      )}

      {/* Aide rapide */}
      {quotes.length === 0 && !showForm && customers.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              Créez votre premier devis
            </h3>
            <p className="text-blue-800 mb-4">
              Les devis vous permettent de proposer vos services à vos clients avant facturation.
              Fonctionnalités disponibles :
            </p>
            <ul className="list-disc list-inside text-blue-800 space-y-1 mb-4">
              <li>Gestion multi-lignes avec calculs automatiques HT/TVA/TTC</li>
              <li>Remises par ligne et remise globale</li>
              <li>Conditions de paiement personnalisées</li>
              <li>Numérotation automatique (DEV-2025-00001)</li>
              <li>Conversion automatique en facture en un clic</li>
              <li>Génération PDF conforme aux normes marocaines</li>
              <li>Suivi des statuts (Brouillon, Envoyé, Consulté, Converti)</li>
            </ul>
            <Button variant="primary" onClick={handleNew}>
              Créer mon premier devis
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
