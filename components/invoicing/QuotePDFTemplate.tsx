'use client'

import React from 'react';
import { Invoice, ThirdParty } from '@/types/invoicing';

interface QuotePDFTemplateProps {
  quote: Invoice;
  thirdParty: ThirdParty;
  companyInfo?: {
    name: string;
    ice: string;
    rc?: string;
    if?: string;
    address: string;
    city: string;
    phone: string;
    email: string;
  };
  validityDays?: number; // Durée de validité du devis en jours
}

/**
 * Template PDF pour devis conformes aux normes marocaines
 *
 * Ce composant génère un template HTML prêt pour l'impression ou la conversion PDF.
 * Adapté spécifiquement pour les devis avec:
 * - Durée de validité
 * - Mention "Devis" au lieu de "Facture"
 * - Pas de mentions de paiement
 * - Note sur la conversion en facture
 */
export default function QuotePDFTemplate({
  quote,
  thirdParty,
  companyInfo = {
    name: 'Votre Société SARL',
    ice: '000000000000000',
    address: 'Adresse de votre société',
    city: 'Ville',
    phone: '+212 5XX XX XX XX',
    email: 'contact@societe.ma',
  },
  validityDays = 30,
}: QuotePDFTemplateProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-MA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: quote.currency || 'MAD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto" id="quote-pdf-template">
      {/* En-tête */}
      <div className="flex justify-between mb-8 pb-6 border-b-2 border-gray-300">
        {/* Informations émetteur */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {companyInfo.name}
          </h1>
          <div className="text-sm text-gray-600 space-y-1">
            <p>{companyInfo.address}</p>
            <p>{companyInfo.city}</p>
            <p>ICE: {companyInfo.ice}</p>
            {companyInfo.rc && <p>RC: {companyInfo.rc}</p>}
            {companyInfo.if && <p>IF: {companyInfo.if}</p>}
            <p>Tél: {companyInfo.phone}</p>
            <p>Email: {companyInfo.email}</p>
          </div>
        </div>

        {/* Type et numéro */}
        <div className="text-right">
          <h2 className="text-3xl font-bold text-purple-600 mb-2">
            DEVIS
          </h2>
          <div className="text-lg font-semibold text-gray-700">
            N° {quote.number}
          </div>
          {quote.reference && (
            <div className="text-sm text-gray-600 mt-1">
              Réf: {quote.reference}
            </div>
          )}
        </div>
      </div>

      {/* Informations devis et client */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Client */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-2">
            DEVIS POUR:
          </h3>
          <div className="text-gray-800">
            <p className="font-bold text-lg">{thirdParty.name}</p>
            {thirdParty.commercialName && (
              <p className="text-sm text-gray-600">{thirdParty.commercialName}</p>
            )}
            <div className="text-sm mt-2 space-y-1">
              {thirdParty.address && <p>{thirdParty.address}</p>}
              {thirdParty.city && <p>{thirdParty.city} {thirdParty.postalCode}</p>}
              {thirdParty.ice && <p className="font-medium">ICE: {thirdParty.ice}</p>}
              {thirdParty.if && <p>IF: {thirdParty.if}</p>}
              {thirdParty.rc && <p>RC: {thirdParty.rc}</p>}
              {thirdParty.phone && <p>Tél: {thirdParty.phone}</p>}
              {thirdParty.email && <p>Email: {thirdParty.email}</p>}
            </div>
          </div>
        </div>

        {/* Dates */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-2">
            INFORMATIONS:
          </h3>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Date d'émission:</span>
              <span className="font-medium">{formatDate(quote.issueDate)}</span>
            </div>
            {quote.dueDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Valide jusqu'au:</span>
                <span className="font-medium">{formatDate(quote.dueDate)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-600">Durée de validité:</span>
              <span className="font-medium">{validityDays} jours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Conditions de paiement:</span>
              <span className="font-medium">
                {quote.paymentTerms === 'IMMEDIATE' && 'Comptant'}
                {quote.paymentTerms === 'NET_30' && 'Net 30 jours'}
                {quote.paymentTerms === 'NET_60' && 'Net 60 jours'}
                {quote.paymentTerms === 'NET_90' && 'Net 90 jours'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lignes du devis */}
      <div className="mb-8">
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3 text-sm font-semibold text-gray-700 border-b border-gray-300">
                Description
              </th>
              <th className="text-center p-3 text-sm font-semibold text-gray-700 border-b border-gray-300">
                Qté
              </th>
              <th className="text-right p-3 text-sm font-semibold text-gray-700 border-b border-gray-300">
                P.U. HT
              </th>
              <th className="text-center p-3 text-sm font-semibold text-gray-700 border-b border-gray-300">
                TVA
              </th>
              {quote.lines.some((l) => l.discountRate && l.discountRate > 0) && (
                <th className="text-center p-3 text-sm font-semibold text-gray-700 border-b border-gray-300">
                  Remise
                </th>
              )}
              <th className="text-right p-3 text-sm font-semibold text-gray-700 border-b border-gray-300">
                Total HT
              </th>
            </tr>
          </thead>
          <tbody>
            {quote.lines.map((line, index) => (
              <tr key={line.id} className="border-b border-gray-200">
                <td className="p-3 text-sm text-gray-800">
                  {line.description}
                  {line.productCode && (
                    <span className="text-gray-500 text-xs ml-2">({line.productCode})</span>
                  )}
                </td>
                <td className="p-3 text-sm text-gray-800 text-center">
                  {line.quantity} {line.unit || ''}
                </td>
                <td className="p-3 text-sm text-gray-800 text-right">
                  {formatAmount(line.unitPrice)}
                </td>
                <td className="p-3 text-sm text-gray-800 text-center">
                  {line.vatRate}%
                </td>
                {quote.lines.some((l) => l.discountRate && l.discountRate > 0) && (
                  <td className="p-3 text-sm text-gray-800 text-center">
                    {line.discountRate ? `${line.discountRate}%` : '-'}
                  </td>
                )}
                <td className="p-3 text-sm text-gray-800 text-right font-medium">
                  {formatAmount(line.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totaux */}
      <div className="flex justify-end mb-8">
        <div className="w-96">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Sous-total HT:</span>
              <span className="font-medium">{formatAmount(quote.subtotalHT)}</span>
            </div>

            {quote.globalDiscountRate && quote.globalDiscountRate > 0 && (
              <div className="flex justify-between py-2 text-red-600">
                <span>Remise globale ({quote.globalDiscountRate}%):</span>
                <span className="font-medium">
                  -{formatAmount(quote.subtotalHT - quote.totalHT)}
                </span>
              </div>
            )}

            <div className="flex justify-between py-2 border-t border-gray-300">
              <span className="text-gray-600">Total HT:</span>
              <span className="font-medium">{formatAmount(quote.totalHT)}</span>
            </div>

            {/* Détail TVA */}
            {quote.vatBreakdown.map((vat, index) => (
              <div key={index} className="flex justify-between py-1">
                <span className="text-gray-600">
                  TVA {vat.rate}% sur {formatAmount(vat.base)}:
                </span>
                <span className="font-medium">{formatAmount(vat.amount)}</span>
              </div>
            ))}

            <div className="flex justify-between py-2 border-t border-gray-300">
              <span className="text-gray-600">Total TVA:</span>
              <span className="font-medium">{formatAmount(quote.totalVAT)}</span>
            </div>

            <div className="flex justify-between py-3 border-t-2 border-gray-400 bg-purple-50 px-3 rounded">
              <span className="text-lg font-bold text-gray-800">MONTANT TOTAL TTC:</span>
              <span className="text-xl font-bold text-purple-600">
                {formatAmount(quote.totalTTC)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes publiques */}
      {quote.publicNotes && (
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes:</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {quote.publicNotes}
          </p>
        </div>
      )}

      {/* Mentions spécifiques au devis */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          Conditions d'acceptation:
        </h3>
        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
          <li>
            Ce devis est valable {validityDays} jours à compter de la date d'émission.
          </li>
          <li>
            L'acceptation de ce devis vaut accord sur les prix, délais et conditions de paiement.
          </li>
          <li>
            Pour accepter ce devis, veuillez le retourner signé avec la mention "Bon pour accord".
          </li>
          <li>
            Une facture sera émise lors de l'acceptation du devis.
          </li>
        </ul>
      </div>

      {/* Signature client */}
      <div className="border-t-2 border-gray-300 pt-6">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-4">Pour l'entreprise:</p>
            <p className="text-sm text-gray-600">{companyInfo.name}</p>
            <div className="h-20 border-b border-gray-300 mt-8"></div>
            <p className="text-xs text-gray-500 mt-2">Signature et cachet</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-4">Bon pour accord:</p>
            <p className="text-sm text-gray-600">{thirdParty.name}</p>
            <div className="h-20 border-b border-gray-300 mt-8"></div>
            <p className="text-xs text-gray-500 mt-2">Signature et date</p>
          </div>
        </div>
      </div>

      {/* Mentions légales */}
      <div className="mt-8 pt-6 border-t border-gray-300">
        <p className="text-xs text-gray-500 text-center">
          {companyInfo.name} - ICE: {companyInfo.ice}
          {companyInfo.rc && ` - RC: ${companyInfo.rc}`}
          {companyInfo.if && ` - IF: ${companyInfo.if}`}
        </p>
        <p className="text-xs text-gray-500 text-center mt-1">
          {companyInfo.address}, {companyInfo.city} - Tél: {companyInfo.phone} - Email: {companyInfo.email}
        </p>
      </div>

      {/* CSS pour impression */}
      <style jsx>{`
        @media print {
          #quote-pdf-template {
            margin: 0;
            padding: 20mm;
          }
          button {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
