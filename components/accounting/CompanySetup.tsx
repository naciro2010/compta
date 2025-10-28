'use client';

import React, { useState } from 'react';
import { useAccountingStore } from '@/store/accounting';
import { SectorModel, VATRegime } from '@/types/accounting';
import {
  validateICE,
  validateIF,
  formatICE,
  validateCompanySettings,
} from '@/lib/accounting/validation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Building2, Check, AlertCircle } from 'lucide-react';

export const CompanySetup: React.FC = () => {
  const { companySettings, initializeCompany } = useAccountingStore();
  const [formData, setFormData] = useState({
    name: '',
    legalForm: '',
    // EPIC 2: Identifiants légaux
    ice: '',
    if: '',
    rc: '',
    cnss: '',
    patente: '',
    // Informations de contact
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    // Paramètres
    sectorModel: 'GENERAL' as SectorModel,
    fiscalYearStart: 1,
    vatRegime: 'STANDARD' as VATRegime,
    vatRate: 20,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});

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

        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-claude-text mb-3">Identifiants légaux</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-claude-text-muted">ICE</div>
                <div className="font-medium text-claude-text font-mono">
                  {formatICE(companySettings.legalIdentifiers.ice)}
                </div>
              </div>
              <div>
                <div className="text-sm text-claude-text-muted">IF</div>
                <div className="font-medium text-claude-text">{companySettings.legalIdentifiers.if}</div>
              </div>
              {companySettings.legalIdentifiers.rc && (
                <div>
                  <div className="text-sm text-claude-text-muted">RC</div>
                  <div className="font-medium text-claude-text">{companySettings.legalIdentifiers.rc}</div>
                </div>
              )}
              {companySettings.legalIdentifiers.cnss && (
                <div>
                  <div className="text-sm text-claude-text-muted">CNSS</div>
                  <div className="font-medium text-claude-text">{companySettings.legalIdentifiers.cnss}</div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-claude-text mb-3">Informations générales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-claude-text-muted">Forme juridique</div>
                <div className="font-medium text-claude-text">{companySettings.legalForm}</div>
              </div>
              <div>
                <div className="text-sm text-claude-text-muted">Régime de TVA</div>
                <div className="font-medium text-claude-text">{companySettings.vatRegime}</div>
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
                <div className="text-sm text-claude-text-muted">Établissements</div>
                <div className="font-medium text-claude-text">{companySettings.establishments.length}</div>
              </div>
            </div>
          </div>

          {(companySettings.address || companySettings.phone || companySettings.email) && (
            <div>
              <h3 className="font-semibold text-claude-text mb-3">Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companySettings.address && (
                  <div>
                    <div className="text-sm text-claude-text-muted">Adresse</div>
                    <div className="font-medium text-claude-text">{companySettings.address}</div>
                  </div>
                )}
                {companySettings.phone && (
                  <div>
                    <div className="text-sm text-claude-text-muted">Téléphone</div>
                    <div className="font-medium text-claude-text">{companySettings.phone}</div>
                  </div>
                )}
                {companySettings.email && (
                  <div>
                    <div className="text-sm text-claude-text-muted">Email</div>
                    <div className="font-medium text-claude-text">{companySettings.email}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Valider un champ en temps réel
  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };
    const newWarnings = { ...warnings };

    if (field === 'ice') {
      const iceValidation = validateICE(value);
      if (value && !iceValidation.isValid) {
        newErrors.ice = iceValidation.error || 'ICE invalide';
      } else {
        delete newErrors.ice;
      }
    }

    if (field === 'if') {
      const ifValidation = validateIF(value);
      if (value && !ifValidation.isValid) {
        newErrors.if = ifValidation.error || 'IF invalide';
      } else {
        delete newErrors.if;
      }
    }

    setErrors(newErrors);
    setWarnings(newWarnings);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Valider les données
    const validation = validateCompanySettings({
      name: formData.name,
      legalForm: formData.legalForm,
      legalIdentifiers: {
        ice: formData.ice,
        if: formData.if,
        rc: formData.rc,
        cnss: formData.cnss,
        patente: formData.patente,
      },
      baseCurrency: 'MAD',
      sectorModel: formData.sectorModel,
      fiscalYearStart: formData.fiscalYearStart,
      vatRegime: formData.vatRegime,
      vatRate: formData.vatRate,
      address: formData.address,
      city: formData.city,
      postalCode: formData.postalCode,
      phone: formData.phone,
      email: formData.email,
      website: formData.website,
      establishments: [],
    });

    if (!validation.isValid) {
      const newErrors: Record<string, string> = {};
      validation.errors.forEach(error => {
        if (error.field) {
          newErrors[error.field] = error.message;
        }
      });
      setErrors(newErrors);
      alert('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    // Afficher les avertissements s'il y en a
    if (validation.warnings.length > 0) {
      const newWarnings: Record<string, string> = {};
      validation.warnings.forEach(warning => {
        if (warning.field) {
          newWarnings[warning.field] = warning.message;
        }
      });
      setWarnings(newWarnings);
    }

    initializeCompany({
      name: formData.name,
      legalForm: formData.legalForm,
      legalIdentifiers: {
        ice: formData.ice,
        if: formData.if,
        rc: formData.rc,
        cnss: formData.cnss,
        patente: formData.patente,
      },
      baseCurrency: 'MAD',
      sectorModel: formData.sectorModel,
      fiscalYearStart: formData.fiscalYearStart,
      vatRegime: formData.vatRegime,
      vatRate: formData.vatRate,
      address: formData.address,
      city: formData.city,
      postalCode: formData.postalCode,
      phone: formData.phone,
      email: formData.email,
      website: formData.website,
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
        {/* Informations de base */}
        <div className="space-y-4">
          <h3 className="font-semibold text-claude-text">Informations de base</h3>

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

            <Select
              label="Régime de TVA *"
              value={formData.vatRegime}
              onChange={(e) =>
                setFormData({ ...formData, vatRegime: e.target.value as VATRegime })
              }
              options={[
                { value: 'STANDARD', label: 'Standard (20%)' },
                { value: 'REDUCED', label: 'Réduit' },
                { value: 'EXEMPT', label: 'Exonéré' },
                { value: 'AUTO_ENTREPRENEUR', label: 'Auto-entrepreneur' },
              ]}
            />
          </div>
        </div>

        {/* EPIC 2: Identifiants légaux */}
        <div className="space-y-4">
          <h3 className="font-semibold text-claude-text">Identifiants légaux marocains</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="ICE (15 chiffres) *"
                value={formData.ice}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, ice: value });
                  validateField('ice', value);
                }}
                placeholder="002345678000012"
                maxLength={15}
                required
              />
              {errors.ice && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {errors.ice}
                </div>
              )}
              <p className="text-xs text-claude-text-muted mt-1">
                Format: 9 chiffres entreprise + 4 établissement + 2 clé
              </p>
            </div>

            <div>
              <Input
                label="IF - Identifiant Fiscal (8 chiffres) *"
                value={formData.if}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, if: value });
                  validateField('if', value);
                }}
                placeholder="12345678"
                maxLength={8}
                required
              />
              {errors.if && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {errors.if}
                </div>
              )}
            </div>

            <Input
              label="RC - Registre de Commerce"
              value={formData.rc}
              onChange={(e) => setFormData({ ...formData, rc: e.target.value })}
              placeholder="Ex: 123456"
            />

            <Input
              label="CNSS - Numéro d'affiliation"
              value={formData.cnss}
              onChange={(e) => setFormData({ ...formData, cnss: e.target.value })}
              placeholder="Ex: 1234567"
            />

            <Input
              label="Patente"
              value={formData.patente}
              onChange={(e) => setFormData({ ...formData, patente: e.target.value })}
              placeholder="Ex: 12345678"
            />
          </div>

          {Object.keys(warnings).length > 0 && (
            <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <p className="text-sm text-yellow-800">
                {Object.values(warnings).map((warning, i) => (
                  <div key={i}>• {warning}</div>
                ))}
              </p>
            </div>
          )}
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h3 className="font-semibold text-claude-text">Coordonnées</h3>

          <Input
            label="Adresse"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Ex: 123 Rue Mohammed V"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Ville"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Ex: Casablanca"
            />

            <Input
              label="Code postal"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              placeholder="Ex: 20000"
            />

            <Input
              label="Téléphone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Ex: +212 522 123456"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@exemple.ma"
            />

            <Input
              label="Site web"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://www.exemple.ma"
            />
          </div>
        </div>

        {/* Paramètres comptables */}
        <div className="space-y-4">
          <h3 className="font-semibold text-claude-text">Paramètres comptables</h3>

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
        </div>

        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">EPIC 2 : Nouveautés</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Validation automatique de l&apos;ICE (format 9+4+2)</li>
            <li>• Création automatique de l&apos;établissement principal</li>
            <li>• Création d&apos;un utilisateur administrateur par défaut</li>
            <li>• Enregistrement dans le journal d&apos;audit immuable</li>
            <li>• Monnaie de tenue : Dirham Marocain (MAD) conformément à la Loi 9-88</li>
            <li>• Plan de comptes CGNC chargé automatiquement</li>
            <li>• Journaux comptables de base créés</li>
          </ul>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={Object.keys(errors).length > 0}>
            <Building2 className="w-4 h-4 mr-2" />
            Initialiser la comptabilité
          </Button>
        </div>
      </form>
    </Card>
  );
};
