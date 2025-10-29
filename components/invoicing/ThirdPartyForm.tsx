'use client'

import React, { useState, useEffect } from 'react';
import { useInvoicingStore } from '@/store/invoicing';
import { ThirdParty, ThirdPartyType, PaymentTerms } from '@/types/invoicing';
import { validateICE } from '@/lib/accounting/validation';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';

interface ThirdPartyFormProps {
  thirdParty?: ThirdParty;
  defaultType?: ThirdPartyType;
  onSave?: (thirdParty: ThirdParty) => void;
  onCancel?: () => void;
}

export default function ThirdPartyForm({
  thirdParty,
  defaultType = 'CLIENT',
  onSave,
  onCancel,
}: ThirdPartyFormProps) {
  const {
    createThirdParty,
    updateThirdParty,
    generateThirdPartyCode,
  } = useInvoicingStore();

  const [formData, setFormData] = useState<Partial<ThirdParty>>({
    type: defaultType,
    name: '',
    code: '',
    country: 'Maroc',
    paymentTerms: 'NET_30',
    vatRegime: 'STANDARD',
    currency: 'MAD',
    isActive: true,
    ...thirdParty,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [iceError, setIceError] = useState<string>('');

  // Générer code automatiquement si nouveau tiers
  useEffect(() => {
    if (!thirdParty && !formData.code) {
      setFormData((prev) => ({
        ...prev,
        code: generateThirdPartyCode(formData.type!),
      }));
    }
  }, [thirdParty, formData.code, formData.type, generateThirdPartyCode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'La raison sociale est obligatoire';
    }

    if (!formData.code?.trim()) {
      newErrors.code = 'Le code est obligatoire';
    }

    // Validation ICE si fourni
    if (formData.ice) {
      const iceValidation = validateICE(formData.ice);
      if (!iceValidation.valid) {
        setIceError(iceValidation.errors[0] || 'ICE invalide');
        newErrors.ice = 'ICE invalide';
      } else {
        setIceError('');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (thirdParty) {
      // Mise à jour
      updateThirdParty(thirdParty.id, formData);
      onSave?.(thirdParty);
    } else {
      // Création
      const newThirdParty = createThirdParty(formData as Omit<ThirdParty, 'id' | 'createdAt' | 'createdBy'>);
      onSave?.(newThirdParty);
    }
  };

  const handleChange = (field: keyof ThirdParty, value: any) => {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type & Code */}
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <div className="space-y-4 p-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select
                id="type"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value as ThirdPartyType)}
                options={[
                  { value: 'CLIENT', label: 'Client' },
                  { value: 'SUPPLIER', label: 'Fournisseur' },
                  { value: 'BOTH', label: 'Client et Fournisseur' },
                ]}
              />
            </div>

            <div>
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                placeholder="CLI-0001"
                error={errors.code}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="name">Raison sociale *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Société ABC SARL"
              error={errors.name}
            />
          </div>

          <div>
            <Label htmlFor="commercialName">Nom commercial</Label>
            <Input
              id="commercialName"
              value={formData.commercialName || ''}
              onChange={(e) => handleChange('commercialName', e.target.value)}
              placeholder="Nom commercial"
            />
          </div>
        </div>
      </Card>

      {/* Identifiants légaux */}
      <Card>
        <CardHeader>
          <CardTitle>Identifiants légaux</CardTitle>
          <CardDescription>Identifiants fiscaux marocains</CardDescription>
        </CardHeader>
        <div className="space-y-4 p-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ice">ICE</Label>
              <Input
                id="ice"
                value={formData.ice || ''}
                onChange={(e) => handleChange('ice', e.target.value)}
                placeholder="000000000000000"
                maxLength={15}
                error={iceError}
              />
              {iceError && (
                <p className="text-sm text-red-600 mt-1">{iceError}</p>
              )}
            </div>

            <div>
              <Label htmlFor="if">Identifiant Fiscal (IF)</Label>
              <Input
                id="if"
                value={formData.if || ''}
                onChange={(e) => handleChange('if', e.target.value)}
                placeholder="IF..."
              />
            </div>

            <div>
              <Label htmlFor="rc">Registre de Commerce (RC)</Label>
              <Input
                id="rc"
                value={formData.rc || ''}
                onChange={(e) => handleChange('rc', e.target.value)}
                placeholder="RC..."
              />
            </div>

            <div>
              <Label htmlFor="cnss">CNSS</Label>
              <Input
                id="cnss"
                value={formData.cnss || ''}
                onChange={(e) => handleChange('cnss', e.target.value)}
                placeholder="CNSS..."
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Coordonnées */}
      <Card>
        <CardHeader>
          <CardTitle>Coordonnées</CardTitle>
        </CardHeader>
        <div className="space-y-4 p-4">
          <div>
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={formData.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Adresse complète"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                value={formData.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Casablanca"
              />
            </div>

            <div>
              <Label htmlFor="postalCode">Code postal</Label>
              <Input
                id="postalCode"
                value={formData.postalCode || ''}
                onChange={(e) => handleChange('postalCode', e.target.value)}
                placeholder="20000"
              />
            </div>

            <div>
              <Label htmlFor="country">Pays</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder="Maroc"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+212 5 22 XX XX XX"
              />
            </div>

            <div>
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                value={formData.mobile || ''}
                onChange={(e) => handleChange('mobile', e.target.value)}
                placeholder="+212 6 XX XX XX XX"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contact@societe.ma"
              />
            </div>

            <div>
              <Label htmlFor="website">Site web</Label>
              <Input
                id="website"
                value={formData.website || ''}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="www.societe.ma"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Contact principal */}
      <Card>
        <CardHeader>
          <CardTitle>Contact principal</CardTitle>
        </CardHeader>
        <div className="space-y-4 p-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactName">Nom du contact</Label>
              <Input
                id="contactName"
                value={formData.contactName || ''}
                onChange={(e) => handleChange('contactName', e.target.value)}
                placeholder="Nom Prénom"
              />
            </div>

            <div>
              <Label htmlFor="contactTitle">Fonction</Label>
              <Input
                id="contactTitle"
                value={formData.contactTitle || ''}
                onChange={(e) => handleChange('contactTitle', e.target.value)}
                placeholder="Directeur Financier"
              />
            </div>

            <div>
              <Label htmlFor="contactPhone">Téléphone</Label>
              <Input
                id="contactPhone"
                value={formData.contactPhone || ''}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                placeholder="+212 6 XX XX XX XX"
              />
            </div>

            <div>
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail || ''}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                placeholder="contact@societe.ma"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Paramètres commerciaux (pour clients) */}
      {(formData.type === 'CLIENT' || formData.type === 'BOTH') && (
        <Card>
          <CardHeader>
            <CardTitle>Paramètres commerciaux</CardTitle>
          </CardHeader>
          <div className="space-y-4 p-4">
            <div className="grid md:grid-cols-2 gap-4">
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
                    { value: 'CUSTOM', label: 'Personnalisé' },
                  ]}
                />
              </div>

              {formData.paymentTerms === 'CUSTOM' && (
                <div>
                  <Label htmlFor="customPaymentDays">Nombre de jours</Label>
                  <Input
                    id="customPaymentDays"
                    type="number"
                    value={formData.customPaymentDays || ''}
                    onChange={(e) => handleChange('customPaymentDays', parseInt(e.target.value))}
                    placeholder="45"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="creditLimit">Limite d'encours (MAD)</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  value={formData.creditLimit || ''}
                  onChange={(e) => handleChange('creditLimit', parseFloat(e.target.value))}
                  placeholder="100000"
                />
              </div>

              <div>
                <Label htmlFor="discountRate">Remise par défaut (%)</Label>
                <Input
                  id="discountRate"
                  type="number"
                  step="0.01"
                  value={formData.discountRate || ''}
                  onChange={(e) => handleChange('discountRate', parseFloat(e.target.value))}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Paramètres fiscaux */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres fiscaux</CardTitle>
        </CardHeader>
        <div className="space-y-4 p-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="vatRegime">Régime TVA</Label>
              <Select
                id="vatRegime"
                value={formData.vatRegime}
                onChange={(e) => handleChange('vatRegime', e.target.value)}
                options={[
                  { value: 'STANDARD', label: 'Standard' },
                  { value: 'EXEMPT', label: 'Exonéré' },
                  { value: 'INTRACOMMUNITY', label: 'Intracommunautaire' },
                  { value: 'EXPORT', label: 'Export' },
                ]}
              />
            </div>

            <div>
              <Label htmlFor="vatRate">Taux TVA par défaut (%)</Label>
              <Select
                id="vatRate"
                value={formData.vatRate?.toString() || '20'}
                onChange={(e) => handleChange('vatRate', parseFloat(e.target.value))}
                options={[
                  { value: '20', label: '20%' },
                  { value: '14', label: '14%' },
                  { value: '10', label: '10%' },
                  { value: '7', label: '7%' },
                  { value: '0', label: '0% (Exonéré)' },
                ]}
              />
            </div>

            <div>
              <Label htmlFor="currency">Devise</Label>
              <Input
                id="currency"
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                placeholder="MAD"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes internes</CardTitle>
        </CardHeader>
        <div className="p-4">
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            className="w-full min-h-[100px] px-3 py-2 border border-claude-border rounded-md bg-claude-bg text-claude-text"
            value={formData.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Notes internes..."
          />
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" variant="primary">
          {thirdParty ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  );
}
