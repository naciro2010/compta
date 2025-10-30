'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus, ArrowLeft } from 'lucide-react'
import { useInvoicingStore } from '@/store/invoicing'
import InvoiceForm from '@/components/invoicing/InvoiceForm'
import InvoiceList from '@/components/invoicing/InvoiceList'
import InvoiceDetail from '@/components/invoicing/InvoiceDetail'
import { Invoice } from '@/types/invoicing'

type ViewMode = 'list' | 'form' | 'detail'

export default function PurchasesPage() {
  const [mode, setMode] = useState<ViewMode>('list')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const { getInvoices } = useInvoicingStore()

  // Get purchase invoices
  const purchaseInvoices = getInvoices({ type: 'PURCHASE_INVOICE' })

  const handleNew = () => {
    setSelectedInvoice(null)
    setMode('form')
  }

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setMode('form')
  }

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setMode('detail')
  }

  const handleSave = () => {
    setMode('list')
    setSelectedInvoice(null)
  }

  const handleCancel = () => {
    setMode('list')
    setSelectedInvoice(null)
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          {mode === 'list' ? (
            <>
              <h1 className="text-3xl font-bold text-claude-text">Achats</h1>
              <p className="text-claude-text-muted mt-2">
                Gestion des achats et factures fournisseurs
              </p>
            </>
          ) : (
            <Button variant="ghost" onClick={handleCancel}>
              <ArrowLeft className="w-4 h-4" />
              Retour à la liste
            </Button>
          )}
        </div>
        {mode === 'list' && (
          <Button onClick={handleNew}>
            <Plus className="w-4 h-4" />
            Nouvelle facture d'achat
          </Button>
        )}
      </header>

      {mode === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle>Factures d'achat</CardTitle>
            <CardDescription>Liste des factures fournisseurs</CardDescription>
          </CardHeader>
          {purchaseInvoices.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-claude-text-muted mb-4">
                Aucune facture d'achat enregistrée
              </p>
              <Button onClick={handleNew} variant="outline">
                <Plus className="w-4 h-4" />
                Créer la première facture
              </Button>
            </div>
          ) : (
            <InvoiceList
              type="PURCHASE_INVOICE"
              onSelect={handleView}
              onEdit={handleEdit}
            />
          )}
        </Card>
      )}

      {mode === 'form' && (
        <InvoiceForm
          invoice={selectedInvoice || undefined}
          defaultType="PURCHASE_INVOICE"
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {mode === 'detail' && selectedInvoice && (
        <InvoiceDetail
          invoice={selectedInvoice}
          onEdit={() => handleEdit(selectedInvoice)}
          onBack={handleCancel}
        />
      )}
    </div>
  )
}
