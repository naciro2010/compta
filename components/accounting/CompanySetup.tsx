'use client';

import React, { useState } from 'react';
import { useAccountingStore } from '@/store/accounting';
import { SectorModel } from '@/types/accounting';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Building2, Check } from 'lucide-react';

export const CompanySetup: React.FC = () => {
  const { companySettings, initializeCompany } = useAccountingStore();
  const [formData, setFormData] = useState({
    name: '',
    legalForm: '',
    taxId: '',
    sectorModel: 'GENERAL' as SectorModel,
    fiscalYearStart: 1,
  });

  if (companySettings) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <CardTitle>Société configurée</CardTitle>
              <CardDescription>{companySettings.name}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-claude-text-muted">Forme juridique</div>
              <div className="font-medium text-claude-text">{companySettings.legalForm}</div>
            </div>
            <div>
              <div className="text-sm text-claude-text-muted">ICE / IF</div>
              <div className="font-medium text-claude-text">{companySettings.taxId}</div>
            </div>
            <div>
              <div className="text-sm text-claude-text-muted">Monnaie de tenue</div>
              <div className="font-medium text-claude-text">{companySettings.baseCurrency}</div>
            </div>
            <div>
              <div className="text-sm text-claude-text-muted">Modèle sectoriel</div>
              <div className="font-medium text-claude-text">{companySettings.sectorModel}</div>
            </div>
            <div>
              <div className="text-sm text-claude-text-muted">Début d'exercice</div>
              <div className="font-medium text-claude-text">
                {new Date(2024, companySettings.fiscalYearStart - 1, 1).toLocaleDateString(
                  'fr-MA',
                  { month: 'long' }
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-claude-text-muted">Date de création</div>
              <div className="font-medium text-claude-text">
                {companySettings.createdAt.toLocaleDateString('fr-MA')}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.legalForm || !formData.taxId) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    initializeCompany({
      name: formData.name,
      legalForm: formData.legalForm,
      taxId: formData.taxId,
      baseCurrency: 'MAD',
      sectorModel: formData.sectorModel,
      fiscalYearStart: formData.fiscalYearStart,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-claude-accent/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-claude-accent" />
          </div>
          <div>
            <CardTitle>Configuration de la société</CardTitle>
            <CardDescription>
              Configurez votre société pour démarrer la comptabilité CGNC
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-4">
          <Input
            label="Nom de la société *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: SARL ATLAS TRADING"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Forme juridique *"
              value={formData.legalForm}
              onChange={(e) => setFormData({ ...formData, legalForm: e.target.value })}
              options={[
                { value: '', label: 'Sélectionner' },
                { value: 'SARL', label: 'SARL' },
                { value: 'SARL AU', label: 'SARL AU' },
                { value: 'SA', label: 'SA' },
                { value: 'SAS', label: 'SAS' },
                { value: 'SNC', label: 'SNC' },
                { value: 'SCS', label: 'SCS' },
                { value: 'Entreprise Individuelle', label: 'Entreprise Individuelle' },
                { value: 'Auto-entrepreneur', label: 'Auto-entrepreneur' },
              ]}
            />

            <Input
              label="ICE / IF *"
              value={formData.taxId}
              onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
              placeholder="Ex: 002345678000056"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Modèle sectoriel"
              value={formData.sectorModel}
              onChange={(e) =>
                setFormData({ ...formData, sectorModel: e.target.value as SectorModel })
              }
              options={[
                { value: 'GENERAL', label: 'Général' },
                { value: 'ASSOCIATION', label: 'Association' },
                { value: 'REAL_ESTATE', label: 'Immobilier' },
                { value: 'COMMERCE', label: 'Commerce' },
                { value: 'SERVICE', label: 'Services' },
                { value: 'INDUSTRY', label: 'Industrie' },
              ]}
            />

            <Select
              label="Mois de début d'exercice"
              value={formData.fiscalYearStart.toString()}
              onChange={(e) =>
                setFormData({ ...formData, fiscalYearStart: parseInt(e.target.value) })
              }
              options={[
                { value: '1', label: 'Janvier' },
                { value: '2', label: 'Février' },
                { value: '3', label: 'Mars' },
                { value: '4', label: 'Avril' },
                { value: '5', label: 'Mai' },
                { value: '6', label: 'Juin' },
                { value: '7', label: 'Juillet' },
                { value: '8', label: 'Août' },
                { value: '9', label: 'Septembre' },
                { value: '10', label: 'Octobre' },
                { value: '11', label: 'Novembre' },
                { value: '12', label: 'Décembre' },
              ]}
            />
          </div>

          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Information importante</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• La monnaie de tenue est le Dirham Marocain (MAD) conformément à la Loi 9-88</li>
              <li>• Le plan de comptes CGNC sera chargé automatiquement</li>
              <li>• Les journaux comptables de base seront créés</li>
              <li>• L'exercice comptable courant sera initialisé</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit">
            <Building2 className="w-4 h-4 mr-2" />
            Initialiser la comptabilité
          </Button>
        </div>
      </form>
    </Card>
  );
};
