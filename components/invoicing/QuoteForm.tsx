'use client'

import React from 'react';
import InvoiceForm from './InvoiceForm';
import { Invoice } from '@/types/invoicing';

interface QuoteFormProps {
  quote?: Invoice;
  defaultThirdPartyId?: string;
  onSave?: (quote: Invoice) => void;
  onCancel?: () => void;
}

/**
 * QuoteForm - Wrapper around InvoiceForm specifically for quotes
 * Provides quote-specific defaults and terminology
 */
export default function QuoteForm({
  quote,
  defaultThirdPartyId,
  onSave,
  onCancel,
}: QuoteFormProps) {
  return (
    <InvoiceForm
      invoice={quote}
      defaultType="QUOTE"
      defaultThirdPartyId={defaultThirdPartyId}
      onSave={onSave}
      onCancel={onCancel}
    />
  );
}
