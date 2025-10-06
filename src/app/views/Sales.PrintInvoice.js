import printStyles from '../utils/print.css?inline'
import { formatMoney } from '../components/Money.js'
import { lineTotals } from '../utils/tax.js'

const TEXT = {
  fr: {
    legalTitle: 'Mentions légales',
    issuerLine: 'ICE: {ice} — IF: {if} — RC: {rc}',
    clientIce: 'Client ICE: {ice}',
    address: 'Adresse: {address} {city}',
    issuerAddress: 'Émetteur: {address} {city}',
    date: 'Date',
    due: 'Échéance',
    reference: 'Référence',
    subtotal: 'Sous-total HT',
    vat: 'TVA {rate}%',
    totalVat: 'Total TVA',
    totalTtc: 'Total TTC',
    dueLeft: 'Reste à payer',
    footer: 'POC démo – données factices – non conforme production.'
  },
  ar: {
    legalTitle: 'معلومات قانونية',
    issuerLine: 'ICE: {ice} — IF: {if} — RC: {rc}',
    clientIce: 'ICE الزبون: {ice}',
    address: 'العنوان: {address} {city}',
    issuerAddress: 'المُصدر: {address} {city}',
    date: 'التاريخ',
    due: 'الاستحقاق',
    reference: 'مرجع',
    subtotal: 'المجموع دون ضريبة',
    vat: 'TVA {rate}%',
    totalVat: 'إجمالي الضريبة',
    totalTtc: 'إجمالي مع الضريبة',
    dueLeft: 'المبلغ المتبقي',
    footer: 'عرض تجريبي – بيانات وهمية – غير صالح للإنتاج.'
  }
}

function t(locale, key, params = {}){
  const dict = TEXT[locale] || TEXT.fr
  const template = dict[key] || TEXT.fr[key] || key
  return Object.entries(params).reduce((acc, [token, value]) => acc.replace(`{${token}}`, value ?? ''), template)
}

function vatLines(totals){
  return Object.entries(totals.vatByRate || {}).map(([rate, amount]) => ({ rate, amount }))
}

function renderLines(doc, locale){
  return (doc.lines || []).map((line, index) => {
    const totals = lineTotals(line)
    return `<tr>
      <td>${index + 1}</td>
      <td>${line.label || ''}</td>
      <td>${Number(line.qty || 0).toFixed(2)}</td>
      <td>${line.unit || ''}</td>
      <td>${formatMoney(line.unitPrice, doc.currency, locale === 'ar' ? 'ar-MA' : 'fr-MA')}</td>
      <td>${line.vatRate || 0}%</td>
      <td>${formatMoney(totals.ht, doc.currency, locale === 'ar' ? 'ar-MA' : 'fr-MA')}</td>
    </tr>`
  }).join('')
}

function renderTotals(doc, locale){
  const totals = doc.totals || { ht: 0, tva: 0, ttc: 0, vatByRate: {} }
  const vatRows = vatLines(totals).map(({ rate, amount }) => `<tr>
      <td>${t(locale, 'vat', { rate })}</td>
      <td>${formatMoney(amount, doc.currency, locale === 'ar' ? 'ar-MA' : 'fr-MA')}</td>
    </tr>`).join('')
  return `
    <table class="print-totals">
      <tbody>
        <tr>
          <td>${t(locale, 'subtotal')}</td>
          <td>${formatMoney(totals.ht, doc.currency, locale === 'ar' ? 'ar-MA' : 'fr-MA')}</td>
        </tr>
        ${vatRows}
        <tr>
          <td>${t(locale, 'totalVat')}</td>
          <td>${formatMoney(totals.tva, doc.currency, locale === 'ar' ? 'ar-MA' : 'fr-MA')}</td>
        </tr>
        <tr>
          <td>${t(locale, 'totalTtc')}</td>
          <td>${formatMoney(totals.ttc, doc.currency, locale === 'ar' ? 'ar-MA' : 'fr-MA')}</td>
        </tr>
        <tr>
          <td>${t(locale, 'dueLeft')}</td>
          <td>${formatMoney(totals.dueLeft || 0, doc.currency, locale === 'ar' ? 'ar-MA' : 'fr-MA')}</td>
        </tr>
      </tbody>
    </table>
  `
}

function renderLegal(doc, locale){
  const localeSafe = locale === 'ar' ? 'ar' : 'fr'
  return `
    <div class="print-meta">
      <strong>${t(localeSafe, 'legalTitle')}</strong><br />
      ${t(localeSafe, 'issuerLine', {
        ice: doc.legal?.issuerICE || '',
        if: doc.legal?.issuerIF || '',
        rc: doc.legal?.issuerRC || ''
      })}<br />
      ${t(localeSafe, 'clientIce', { ice: doc.customerSnapshot?.ICE || '' })}<br />
      ${t(localeSafe, 'address', { address: doc.customerSnapshot?.address || '', city: doc.customerSnapshot?.city || '' })}<br />
      ${t(localeSafe, 'issuerAddress', { address: doc.legal?.issuerAddress || '', city: doc.legal?.issuerCity || '' })}
    </div>
  `
}

export function renderPrintDocument(doc, locale = 'fr'){
  const titleMap = {
    QUOTE: 'Devis',
    ORDER: 'Bon de commande',
    DELIVERY: 'Bon de livraison',
    INVOICE: 'Facture',
    CREDIT: 'Avoir'
  }
  const titleMapAr = {
    QUOTE: 'عرض سعر',
    ORDER: 'طلبية',
    DELIVERY: 'سند تسليم',
    INVOICE: 'فاتورة',
    CREDIT: 'إشعار دائن'
  }
  const isArabic = locale === 'ar'
  const title = isArabic ? (titleMapAr[doc.type] || 'وثيقة') : (titleMap[doc.type] || 'Document')
  return `<!DOCTYPE html>
  <html lang="${locale}">
    <head>
      <meta charset="utf-8" />
      <title>${title} ${doc.id || ''}</title>
      <style>${printStyles}</style>
    </head>
    <body class="print-document ${isArabic ? 'print-rtl' : ''}">
      <header>
        <div>
          <h1>${title}</h1>
          <p>${doc.id || ''}</p>
        </div>
        <div class="print-meta">
          <strong>${doc.customerSnapshot?.name || ''}</strong><br />
          ${doc.customerSnapshot?.address || ''}<br />
          ${doc.customerSnapshot?.city || ''}
        </div>
      </header>
      <section class="print-meta">
        <div>${t(locale, 'date')}: ${doc.dates?.issue || ''}</div>
        <div>${t(locale, 'due')}: ${doc.dates?.due || ''}</div>
        <div>${t(locale, 'reference')}: ${doc.refs?.quoteId || doc.refs?.orderId || doc.refs?.deliveryId || '-'}</div>
      </section>
      ${renderLegal(doc, locale)}
      <table class="print-table">
        <thead>
          <tr>
            <th>#</th>
            <th>${locale === 'ar' ? 'الوصف' : 'Description'}</th>
            <th>${locale === 'ar' ? 'الكمية' : 'Qté'}</th>
            <th>${locale === 'ar' ? 'الوحدة' : 'Unité'}</th>
            <th>${locale === 'ar' ? 'سعر الوحدة' : 'PU HT'}</th>
            <th>TVA</th>
            <th>${locale === 'ar' ? 'المبلغ' : 'Montant'}</th>
          </tr>
        </thead>
        <tbody>
          ${renderLines(doc, locale)}
        </tbody>
      </table>
      ${renderTotals(doc, locale)}
      <footer class="print-footer">
        ${t(locale, 'footer')}
      </footer>
    </body>
  </html>`
}

export function printDocument(doc, locale = 'fr'){
  const html = renderPrintDocument(doc, locale)
  const printWindow = window.open('', '_blank', 'width=1024,height=768')
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => printWindow.print(), 300)
}

export default {
  renderPrintDocument,
  printDocument
}
