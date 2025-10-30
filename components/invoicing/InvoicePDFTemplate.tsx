'use client'

import React from 'react';
import { Invoice, ThirdParty } from '@/types/invoicing';

interface InvoicePDFTemplateProps {
  invoice: Invoice;
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
}

/**
 * Template PDF pour factures conformes CGNC
 *
 * Ce composant génère un template HTML prêt pour l'impression ou la conversion PDF.
 * Il respecte les mentions légales obligatoires au Maroc:
 * - ICE émetteur et destinataire
 * - Numéro de facture
 * - Dates (émission, échéance)
 * - Détail TVA par taux
 * - Montants HT, TVA, TTC
 *
 * TODO: Intégrer une bibliothèque de génération PDF (jsPDF, react-pdf, ou API backend)
 */
export default function InvoicePDFTemplate({
  invoice,
  thirdParty,
  companyInfo = {
    name: 'Votre Société SARL',
    ice: '000000000000000',
    address: 'Adresse de votre société',
    city: 'Ville',
    phone: '+212 5XX XX XX XX',
    email: 'contact@societe.ma',
  },
}: InvoicePDFTemplateProps) {
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
      currency: invoice.currency || 'MAD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getTypeLabel = () => {
    switch (invoice.type) {
      case 'INVOICE':
        return 'FACTURE';
      case 'QUOTE':
        return 'DEVIS';
      case 'CREDIT_NOTE':
        return 'AVOIR';
      case 'PROFORMA':
        return 'FACTURE PRO-FORMA';
      default:
        return 'DOCUMENT';
    }
  };

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto" id="invoice-pdf-template">
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
          <h2 className="text-3xl font-bold text-blue-600 mb-2">
            {getTypeLabel()}
          </h2>
          <div className="text-lg font-semibold text-gray-700">
            N° {invoice.number}
          </div>
          {invoice.reference && (
            <div className="text-sm text-gray-600 mt-1">
              Réf: {invoice.reference}
            </div>
          )}
        </div>
      </div>

      {/* Informations facture et client */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Client */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-2">
            FACTURÉ À:
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
              <span className="font-medium">{formatDate(invoice.issueDate)}</span>
            </div>
            {invoice.dueDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Date d'échéance:</span>
                <span className="font-medium">{formatDate(invoice.dueDate)}</span>
              </div>
            )}
            {invoice.deliveryDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Date de livraison:</span>
                <span className="font-medium">{formatDate(invoice.deliveryDate)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-600">Conditions de paiement:</span>
              <span className="font-medium">
                {invoice.paymentTerms === 'IMMEDIATE' && 'Comptant'}
                {invoice.paymentTerms === 'NET_30' && 'Net 30 jours'}
                {invoice.paymentTerms === 'NET_60' && 'Net 60 jours'}
                {invoice.paymentTerms === 'NET_90' && 'Net 90 jours'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lignes de facturation */}
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
              {invoice.lines.some((l) => l.discountRate && l.discountRate > 0) && (
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
            {invoice.lines.map((line, index) => (
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
                {invoice.lines.some((l) => l.discountRate && l.discountRate > 0) && (
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
              <span className="font-medium">{formatAmount(invoice.subtotalHT)}</span>
            </div>

            {invoice.globalDiscountRate && invoice.globalDiscountRate > 0 && (
              <div className="flex justify-between py-2 text-red-600">
                <span>Remise globale ({invoice.globalDiscountRate}%):</span>
                <span className="font-medium">
                  -{formatAmount(invoice.subtotalHT - invoice.totalHT)}
                </span>
              </div>
            )}

            <div className="flex justify-between py-2 border-t border-gray-300">
              <span className="text-gray-600">Total HT:</span>
              <span className="font-medium">{formatAmount(invoice.totalHT)}</span>
            </div>

            {/* Détail TVA */}
            {invoice.vatBreakdown.map((vat, index) => (
              <div key={index} className="flex justify-between py-1">
                <span className="text-gray-600">
                  TVA {vat.rate}% sur {formatAmount(vat.base)}:
                </span>
                <span className="font-medium">{formatAmount(vat.amount)}</span>
              </div>
            ))}

            <div className="flex justify-between py-2 border-t border-gray-300">
              <span className="text-gray-600">Total TVA:</span>
              <span className="font-medium">{formatAmount(invoice.totalVAT)}</span>
            </div>

            <div className="flex justify-between py-3 border-t-2 border-gray-400 bg-blue-50 px-3 rounded">
              <span className="text-lg font-bold text-gray-800">TOTAL TTC:</span>
              <span className="text-xl font-bold text-blue-600">
                {formatAmount(invoice.totalTTC)}
              </span>
            </div>

            {invoice.amountPaid > 0 && (
              <>
                <div className="flex justify-between py-2 text-green-600">
                  <span>Montant payé:</span>
                  <span className="font-medium">-{formatAmount(invoice.amountPaid)}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-300">
                  <span className="font-bold text-gray-800">Restant dû:</span>
                  <span className="font-bold text-orange-600">
                    {formatAmount(invoice.amountDue)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Notes publiques */}
      {invoice.publicNotes && (
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes:</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {invoice.publicNotes}
          </p>
        </div>
      )}

      {/* Mentions légales */}
      <div className="mt-8 pt-6 border-t border-gray-300 text-xs text-gray-500 text-center space-y-1">
        <p>
          Document généré électroniquement - Conforme aux normes comptables marocaines (CGNC)
        </p>
        <p>
          {companyInfo.name} - ICE: {companyInfo.ice}
          {companyInfo.rc && ` - RC: ${companyInfo.rc}`}
        </p>
        <p className="mt-3 font-medium">
          En cas de retard de paiement, des pénalités pourront être appliquées conformément à la législation en vigueur.
        </p>
      </div>
    </div>
  );
}
