'use client'

import React, { useState } from 'react';
import { useInvoicingStore } from '@/store/invoicing';
import { ThirdParty } from '@/types/invoicing';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import ThirdPartyForm from '@/components/invoicing/ThirdPartyForm';
import ThirdPartyList from '@/components/invoicing/ThirdPartyList';

export default function SuppliersPage() {
  const { getSuppliers, deleteThirdParty } = useInvoicingStore();
  const [showForm, setShowForm] = useState(false);
  const [editingThirdParty, setEditingThirdParty] = useState<ThirdParty | undefined>();

  const suppliers = getSuppliers();

  const handleNew = () => {
    setEditingThirdParty(undefined);
    setShowForm(true);
  };

  const handleEdit = (thirdParty: ThirdParty) => {
    setEditingThirdParty(thirdParty);
    setShowForm(true);
  };

  const handleDelete = (thirdParty: ThirdParty) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le fournisseur "${thirdParty.name}" ?`)) {
      deleteThirdParty(thirdParty.id);
    }
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingThirdParty(undefined);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingThirdParty(undefined);
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-claude-text">Fournisseurs</h1>
          <p className="text-claude-text-muted mt-2">
            Gestion de vos fournisseurs et contacts d'achat
          </p>
        </div>
        {!showForm && (
          <Button variant="primary" onClick={handleNew}>
            + Nouveau fournisseur
          </Button>
        )}
      </header>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingThirdParty ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
            </CardTitle>
            <CardDescription>
              {editingThirdParty
                ? 'Modifier les informations du fournisseur'
                : 'Créer un nouveau fournisseur'}
            </CardDescription>
          </CardHeader>
          <div className="p-4">
            <ThirdPartyForm
              thirdParty={editingThirdParty}
              defaultType="SUPPLIER"
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </Card>
      ) : (
        <ThirdPartyList
          type="SUPPLIER"
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Aide rapide */}
      {suppliers.length === 0 && !showForm && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              Commencez par ajouter vos fournisseurs
            </h3>
            <p className="text-blue-800 mb-4">
              Les fournisseurs vous permettent d'enregistrer vos achats et de suivre vos
              dettes. Les informations essentielles à renseigner sont :
            </p>
            <ul className="list-disc list-inside text-blue-800 space-y-1 mb-4">
              <li>Raison sociale</li>
              <li>ICE (pour les fournisseurs marocains)</li>
              <li>Adresse et coordonnées</li>
              <li>Conditions de paiement</li>
            </ul>
            <Button variant="primary" onClick={handleNew}>
              Créer mon premier fournisseur
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
