import Alpine from 'alpinejs'
import { settingsStore } from './settings.js'
import { ledgerStore } from './ledger.js'
import { customersStore } from './customers.js'
import { remindersStore } from './reminders.js'
import numberingStore from './numbering.js'
import { docTotals, computeVatOnCash, money } from '../utils/tax.js'
import { normalizeMoney, normalizeQty, isPositiveQuantity, isNonNegMoney } from '../utils/validators.js'
import { seedStore } from '../../shared/seed.js'

const KEY = 'maacc:sales:documents'
const KEY_SETTINGS = 'maacc:settings.sales'
const COMPANY_DEFAULT = 'default'
const VAT_RATES_DEFAULT = [20, 14, 10, 7]

const STATUS_BY_TYPE = {
  QUOTE: { draft: 'DRAFT', confirmed: 'CONFIRMED' },
  ORDER: { draft: 'DRAFT', confirmed: 'CONFIRMED' },
  DELIVERY: { draft: 'DELIVERED', confirmed: 'DELIVERED' },
  INVOICE: { draft: 'DRAFT', confirmed: 'CONFIRMED', paid: 'PAID', partial: 'PARTIAL', cancelled: 'CANCELLED' },
  CREDIT: { draft: 'CONFIRMED', confirmed: 'CONFIRMED' }
}

const JOURNAL_CODES = {
  invoice: 'VEN',
  payment: 'BNK',
  credit: 'VEN',
  vatCash: 'VEN'
}

function nextId(prefix){
  return `${prefix}-${crypto.randomUUID?.() || Math.random().toString(16).slice(2, 10)}`
}

function defaultSalesSettings(){
  const settingsRaw = localStorage.getItem(KEY_SETTINGS)
  if (settingsRaw) {
    try {
      const parsed = JSON.parse(settingsRaw)
      return normalizeSettings(parsed)
    } catch (error) {
      console.warn('sales: failed to parse settings, using defaults', error)
    }
  }
  return normalizeSettings({})
}

function normalizeSettings(payload){
  const company = settingsStore.getCompany?.() || {}
  return {
    numbering: {
      QUOTE: { prefix: payload?.numbering?.QUOTE?.prefix || 'DV', start: payload?.numbering?.QUOTE?.start || 1 },
      ORDER: { prefix: payload?.numbering?.ORDER?.prefix || 'BC', start: payload?.numbering?.ORDER?.start || 1 },
      DELIVERY: { prefix: payload?.numbering?.DELIVERY?.prefix || 'BL', start: payload?.numbering?.DELIVERY?.start || 1 },
      INVOICE: { prefix: payload?.numbering?.INVOICE?.prefix || 'FA', start: payload?.numbering?.INVOICE?.start || 1 },
      CREDIT: { prefix: payload?.numbering?.CREDIT?.prefix || 'AV', start: payload?.numbering?.CREDIT?.start || 1 }
    },
    vatMode: payload?.vatMode === 'ENCAISSEMENT' ? 'ENCAISSEMENT' : 'DEBIT',
    vatRates: Array.isArray(payload?.vatRates) && payload.vatRates.length ? [...new Set(payload.vatRates.map((rate) => Number(rate) || 0))] : [...VAT_RATES_DEFAULT],
    legalMentions: {
      companyICE: payload?.legalMentions?.companyICE || company.ICE || '',
      IF: payload?.legalMentions?.IF || company.IF || '',
      RC: payload?.legalMentions?.RC || company.RC || '',
      address: payload?.legalMentions?.address || company.raisonSociale || '',
      city: payload?.legalMentions?.city || company.ville || ''
    }
  }
}

function persistSettings(settings){
  localStorage.setItem(KEY_SETTINGS, JSON.stringify(settings))
}

function ensureSeed(){
  try { seedStore.ensure?.() } catch (error) { console.warn('sales: seed ensure failed', error) }
}

function loadDocuments(){
  const raw = localStorage.getItem(KEY)
  if (!raw) {
    return buildSeedDocuments()
  }
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(normalizeDocument) : buildSeedDocuments()
  } catch (error) {
    console.warn('sales: unable to parse stored documents, reseeding', error)
    return buildSeedDocuments()
  }
}

function buildSeedDocuments(){
  ensureSeed()
  const dataset = seedStore.get?.() || {}
  const firstCustomer = (dataset.clients || [])[0]
  if (!firstCustomer) return []
  const customer = customersStore.byId(firstCustomer.id) || customersStore.add({
    id: firstCustomer.id,
    name: firstCustomer.nom || firstCustomer.name,
    ICE: firstCustomer.ICE || '',
    IF: firstCustomer.IF || '',
    RC: firstCustomer.RC || '',
    address: firstCustomer.adresse || '',
    city: firstCustomer.ville || '',
    email: firstCustomer.email || '',
    phone: firstCustomer.telephone || ''
  })
  const issue = new Date().toISOString().slice(0, 10)
  const due = new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().slice(0, 10)
  const seedInvoice = normalizeDocument({
    id: 'FA-2024-000001',
    companyId: COMPANY_DEFAULT,
    type: 'INVOICE',
    status: 'CONFIRMED',
    series: 'FA',
    year: 2024,
    seq: 1,
    customerId: customer.id,
    customerSnapshot: snapshotCustomer(customer),
    dates: { issue, due },
    lines: [
      { label: 'Licence SaaS', qty: 1, unit: 'unité', unitPrice: 10000, vatRate: 20 },
      { label: 'Support annuel', qty: 1, unit: 'unité', unitPrice: 2000, vatRate: 20, discountPct: 10 }
    ],
    totals: {},
    payments: [{ date: issue, amount: 5000, mode: 'bank' }],
    notes: 'Facture démo générée depuis le jeu de données',
    refs: {},
    legal: {
      issuerICE: settingsStore.getCompany()?.ICE || '',
      issuerIF: settingsStore.getCompany()?.IF || '',
      issuerRC: settingsStore.getCompany()?.RC || ''
    },
    accounting: { posted: false }
  })
  const totals = docTotals(seedInvoice, defaultSalesSettings().vatMode)
  seedInvoice.totals = totals
  seedInvoice.totals.dueLeft = money(totals.ttc - (seedInvoice.payments[0]?.amount || 0))
  return [seedInvoice]
}

function normalizeDocument(doc){
  const payments = Array.isArray(doc.payments) ? doc.payments.map((payment) => ({
    date: payment.date || new Date().toISOString().slice(0, 10),
    amount: normalizeMoney(payment.amount || 0),
    mode: payment.mode || 'bank'
  })) : []

  return {
    id: doc.id || nextId('DOC'),
    companyId: doc.companyId || COMPANY_DEFAULT,
    type: doc.type || 'QUOTE',
    status: doc.status || STATUS_BY_TYPE[doc.type || 'QUOTE'].draft,
    series: doc.series || '',
    seq: doc.seq || 0,
    year: doc.year || new Date().getFullYear(),
    customerId: doc.customerId || null,
    customerSnapshot: doc.customerSnapshot || null,
    dates: {
      issue: doc.dates?.issue || new Date().toISOString().slice(0, 10),
      due: doc.dates?.due || new Date().toISOString().slice(0, 10),
      delivery: doc.dates?.delivery || null
    },
    lines: Array.isArray(doc.lines) && doc.lines.length ? doc.lines.map(normalizeLine) : [defaultLine()],
    totals: doc.totals || {},
    payments,
    notes: doc.notes || '',
    refs: doc.refs || {},
    legal: doc.legal || {},
    accounting: doc.accounting || { posted: false },
    currency: doc.currency || (settingsStore.getCompany()?.devise || 'MAD')
  }
}

function defaultLine(){
  return { label: '', qty: 1, unit: 'unité', unitPrice: 0, vatRate: 20, discountPct: 0 }
}

function normalizeLine(line){
  return {
    sku: line.sku || '',
    label: line.label || '',
    qty: normalizeQty(line.qty || 0),
    unit: line.unit || 'unité',
    unitPrice: normalizeMoney(line.unitPrice || 0),
    vatRate: Number(line.vatRate) || 0,
    discountPct: Number(line.discountPct) || 0,
    unitCost: normalizeMoney(line.unitCost || 0)
  }
}

const state = Alpine.reactive({
  documents: loadDocuments(),
  settings: defaultSalesSettings()
})

function persist(){
  localStorage.setItem(KEY, JSON.stringify(state.documents))
}

function findDocument(id){
  return state.documents.find((doc) => doc.id === id) || null
}

function snapshotCustomer(customer){
  if (!customer) return null
  return {
    name: customer.name,
    ICE: customer.ICE || '',
    IF: customer.IF || '',
    RC: customer.RC || '',
    address: customer.address || '',
    city: customer.city || '',
    paymentTerms: customer.paymentTerms || '30J',
    email: customer.email || ''
  }
}

function ensureLegal(doc){
  const settings = state.settings
  return {
    issuerICE: settings.legalMentions.companyICE || '',
    issuerIF: settings.legalMentions.IF || '',
    issuerRC: settings.legalMentions.RC || '',
    issuerAddress: settings.legalMentions.address || '',
    issuerCity: settings.legalMentions.city || ''
  }
}

function computeDocumentTotals(doc){
  const totals = docTotals(doc, state.settings.vatMode)
  doc.totals = totals
  return totals
}

function recalcDocument(doc){
  doc.lines = doc.lines.map(normalizeLine)
  computeDocumentTotals(doc)
  return doc
}

function legalStatusFor(doc){
  const mapping = STATUS_BY_TYPE[doc.type] || STATUS_BY_TYPE.QUOTE
  if (doc.type === 'INVOICE') {
    if (doc.totals?.dueLeft <= 0.01 && doc.payments.length) return mapping.paid
    if (doc.payments.length) return mapping.partial
  }
  return doc.status || mapping.draft
}

function syncStatus(doc){
  doc.status = legalStatusFor(doc)
}

function assignNumber(doc){
  const numbering = state.settings.numbering[doc.type]
  const company = doc.companyId || COMPANY_DEFAULT
  const now = new Date(doc.dates.issue || Date.now())
  const year = now.getFullYear()
  const { id, series, seq } = numberingStore.next({
    companyId: company,
    type: doc.type,
    year,
    prefix: numbering.prefix,
    start: numbering.start
  })
  doc.id = id
  doc.series = series
  doc.seq = seq
  doc.year = year
}

function ledgerLabel(doc){
  return `${doc.type} ${doc.id} - ${doc.customerSnapshot?.name || ''}`
}

function ensureAccounting(doc){
  if (!doc.accounting) doc.accounting = { posted: false }
  if (!Array.isArray(doc.accounting.entries)) doc.accounting.entries = []
  return doc.accounting
}

function postInvoiceToLedger(doc){
  const totals = doc.totals || computeDocumentTotals(doc)
  const vatMode = state.settings.vatMode
  const journal = JOURNAL_CODES.invoice
  if (doc.accounting?.posted) return
  const lines = [
    {
      pieceId: doc.id,
      date: doc.dates.issue,
      journal,
      compte: 'CLT',
      libelle: ledgerLabel(doc),
      debit: money(totals.ttc),
      credit: 0
    },
    {
      pieceId: doc.id,
      date: doc.dates.issue,
      journal,
      compte: 'VTE',
      libelle: `${ledgerLabel(doc)} - Ventes HT`,
      debit: 0,
      credit: money(totals.ht)
    }
  ]

  if (vatMode === 'DEBIT') {
    lines.push({
      pieceId: doc.id,
      date: doc.dates.issue,
      journal,
      compte: 'TVA_C',
      libelle: `${ledgerLabel(doc)} - TVA collectée`,
      debit: 0,
      credit: money(totals.tva)
    })
  } else {
    lines.push({
      pieceId: doc.id,
      date: doc.dates.issue,
      journal,
      compte: 'TVA_C_ENC',
      libelle: `${ledgerLabel(doc)} - TVA à encaissement`,
      debit: 0,
      credit: money(totals.tva)
    })
  }

  const entries = ledgerStore.addBulk(lines)
  const accounting = ensureAccounting(doc)
  accounting.entries = [...(accounting.entries || []), ...entries.map((item) => item.id)]
  accounting.posted = true
  accounting.postedAt = new Date().toISOString()
}

function postCreditToLedger(doc){
  const totals = doc.totals || computeDocumentTotals(doc)
  const journal = JOURNAL_CODES.credit
  if (doc.accounting?.posted) return
  const ht = money(Math.abs(totals.ht))
  const tva = money(Math.abs(totals.tva))
  const ttc = money(Math.abs(totals.ttc))
  const lines = [
    {
      pieceId: doc.id,
      date: doc.dates.issue,
      journal,
      compte: 'VTE',
      libelle: `${ledgerLabel(doc)} - Reprise vente`,
      debit: ht,
      credit: 0
    },
    {
      pieceId: doc.id,
      date: doc.dates.issue,
      journal,
      compte: 'TVA_C',
      libelle: `${ledgerLabel(doc)} - Reprise TVA`,
      debit: tva,
      credit: 0
    },
    {
      pieceId: doc.id,
      date: doc.dates.issue,
      journal,
      compte: 'CLT',
      libelle: `${ledgerLabel(doc)} - Crédit client`,
      debit: 0,
      credit: ttc
    }
  ]

  const entries = ledgerStore.addBulk(lines)
  const accounting = ensureAccounting(doc)
  accounting.entries = [...(accounting.entries || []), ...entries.map((item) => item.id)]
  accounting.posted = true
  accounting.postedAt = new Date().toISOString()
}

function postPaymentToLedger(doc, payment){
  const amount = money(payment.amount)
  if (amount <= 0) return
  const journal = JOURNAL_CODES.payment
  const compteBank = payment.mode === 'cash' ? 'CAISSE' : payment.mode === 'cheque' ? 'BNK_CHQ' : 'BNK'
  const lines = [
    {
      pieceId: `${doc.id}-PAY-${payment.date}`,
      date: payment.date,
      journal,
      compte: compteBank,
      libelle: `${ledgerLabel(doc)} - Encaissement ${payment.mode}`,
      debit: amount,
      credit: 0
    },
    {
      pieceId: `${doc.id}-PAY-${payment.date}`,
      date: payment.date,
      journal,
      compte: 'CLT',
      libelle: `${ledgerLabel(doc)} - Réglement client`,
      debit: 0,
      credit: amount
    }
  ]

  const entries = ledgerStore.addBulk(lines)
  const accounting = ensureAccounting(doc)
  accounting.entries = [...(accounting.entries || []), ...entries.map((item) => item.id)]

  if (state.settings.vatMode === 'ENCAISSEMENT' && doc.type === 'INVOICE') {
    const vatInfo = computeVatOnCash(doc)
    const paymentVat = vatInfo.perPayment.find((item) => item.date === payment.date && item.amount === payment.amount)
    const vatAmount = paymentVat ? Object.values(paymentVat.vatShare).reduce((sum, value) => sum + value, 0) : 0
    const vatLines = vatAmount > 0 ? ledgerStore.addBulk([
      {
        pieceId: `${doc.id}-VAT-${payment.date}`,
        date: payment.date,
        journal: JOURNAL_CODES.vatCash,
        compte: 'TVA_C_ENC',
        libelle: `${ledgerLabel(doc)} - TVA à encaissement`,
        debit: vatAmount,
        credit: 0
      },
      {
        pieceId: `${doc.id}-VAT-${payment.date}`,
        date: payment.date,
        journal: JOURNAL_CODES.vatCash,
        compte: 'TVA_C',
        libelle: `${ledgerLabel(doc)} - TVA collectée sur encaissement`,
        debit: 0,
        credit: vatAmount
      }
    ]) : []
    if (vatLines.length) {
      accounting.entries = [...accounting.entries, ...vatLines.map((item) => item.id)]
    }
  }
}

function updateReminderPlan(invoice){
  remindersStore.generatePlan(invoice)
}

function removeReminders(invoiceId){
  remindersStore.removeByInvoice(invoiceId)
}

function refreshTotals(doc){
  computeDocumentTotals(doc)
  syncStatus(doc)
}

function ensureSnapshot(doc){
  if (!doc.customerId) {
    doc.customerSnapshot = null
    return
  }
  if (doc.customerSnapshot && doc.customerSnapshot.id === doc.customerId) return
  const customer = customersStore.byId(doc.customerId)
  if (customer) doc.customerSnapshot = { ...snapshotCustomer(customer), id: customer.id }
}

function autoLettrage(doc){
  if (doc.type !== 'INVOICE') return
  if ((doc.totals?.dueLeft || 0) <= 0.01) {
    const accounting = ensureAccounting(doc)
    accounting.letteringId = accounting.letteringId || `LET-${doc.id}`
    accounting.letteredAt = new Date().toISOString()
  } else {
    if (doc.accounting) {
      delete doc.accounting.letteringId
      delete doc.accounting.letteredAt
    }
  }
}

export const salesStore = {
  state,
  settings(){
    return state.settings
  },
  updateSettings(patch){
    state.settings = normalizeSettings({ ...state.settings, ...patch })
    persistSettings(state.settings)
  },
  resetSettings(){
    state.settings = defaultSalesSettings()
    persistSettings(state.settings)
  },
  list(filters = {}){
    return state.documents.filter((doc) => {
      if (filters.type && doc.type !== filters.type) return false
      if (filters.status && doc.status !== filters.status) return false
      if (filters.customerId && doc.customerId !== filters.customerId) return false
      if (filters.search) {
        const term = String(filters.search).toLowerCase()
        const haystack = [doc.id, doc.customerSnapshot?.name, doc.notes].join(' ').toLowerCase()
        if (!haystack.includes(term)) return false
      }
      if (filters.periodStart && doc.dates?.issue < filters.periodStart) return false
      if (filters.periodEnd && doc.dates?.issue > filters.periodEnd) return false
      return true
    })
  },
  byId(id){
    return findDocument(id)
  },
  create(type = 'QUOTE', options = {}){
    const now = new Date().toISOString().slice(0, 10)
    const due = new Date()
    due.setDate(due.getDate() + 30)
    const doc = normalizeDocument({
      id: nextId(type),
      type,
      status: STATUS_BY_TYPE[type]?.draft || 'DRAFT',
      customerId: options.customerId || null,
      customerSnapshot: null,
      dates: options.dates || { issue: now, due: due.toISOString().slice(0, 10), delivery: null },
      lines: options.lines || [defaultLine()],
      payments: [],
      refs: options.refs || {},
      notes: options.notes || ''
    })

    ensureSnapshot(doc)
    doc.legal = ensureLegal(doc)
    refreshTotals(doc)

    state.documents.push(doc)
    persist()
    return doc
  },
  update(id, payload){
    const doc = findDocument(id)
    if (!doc) return null
    if (payload.customerId) {
      doc.customerId = payload.customerId
      ensureSnapshot(doc)
    }
    if (payload.lines) {
      doc.lines = payload.lines.map(normalizeLine)
    }
    if (payload.dates) {
      doc.dates = { ...doc.dates, ...payload.dates }
    }
    if (payload.notes !== undefined) doc.notes = payload.notes
    if (payload.status) doc.status = payload.status
    doc.legal = ensureLegal(doc)
    recalcDocument(doc)
    persist()
    return doc
  },
  remove(id){
    const index = state.documents.findIndex((doc) => doc.id === id)
    if (index === -1) return false
    const [doc] = state.documents.splice(index, 1)
    persist()
    if (doc && doc.type === 'INVOICE') removeReminders(doc.id)
    return true
  },
  transform(id, targetType){
    const source = findDocument(id)
    if (!source) throw new Error('sales: source document not found')
    const doc = this.create(targetType, {
      customerId: source.customerId,
      lines: source.lines,
      refs: { ...source.refs, [`${source.type.toLowerCase()}Id`]: source.id }
    })
    ensureSnapshot(doc)
    doc.customerSnapshot = source.customerSnapshot
    doc.notes = source.notes
    doc.legal = ensureLegal(doc)
    refreshTotals(doc)
    persist()
    return doc
  },
  confirm(id){
    const doc = findDocument(id)
    if (!doc) throw new Error('sales: document not found')
    if (doc.status === STATUS_BY_TYPE[doc.type]?.confirmed) return doc
    assignNumber(doc)
    doc.status = STATUS_BY_TYPE[doc.type]?.confirmed || 'CONFIRMED'
    ensureSnapshot(doc)
    doc.legal = ensureLegal(doc)
    refreshTotals(doc)
  if (doc.type === 'INVOICE') {
      postInvoiceToLedger(doc)
      updateReminderPlan(doc)
    }
    if (doc.type === 'CREDIT') {
      postCreditToLedger(doc)
    }
    persist()
    return doc
  },
  recordPayment(id, payload){
    const doc = findDocument(id)
    if (!doc) throw new Error('sales: document not found')
    const payment = {
      date: payload.date || new Date().toISOString().slice(0, 10),
      amount: normalizeMoney(payload.amount || 0),
      mode: payload.mode || 'bank',
      reference: payload.reference || ''
    }
    if (!isNonNegMoney(payment.amount) || payment.amount <= 0) {
      throw new Error('sales: invalid payment amount')
    }
    doc.payments.push(payment)
    refreshTotals(doc)
    autoLettrage(doc)
    if (doc.type === 'INVOICE') {
      postPaymentToLedger(doc, payment)
    }
    persist()
    return payment
  },
  createCredit(invoiceId, customLines = null){
    const invoice = findDocument(invoiceId)
    if (!invoice || invoice.type !== 'INVOICE') throw new Error('sales: invoice not found')
    const lines = (customLines && customLines.length ? customLines : invoice.lines).map((line) => ({
      ...line,
      qty: normalizeQty(line.qty),
      unitPrice: normalizeMoney(line.unitPrice),
      unitCost: normalizeMoney(line.unitCost),
      qtySign: -1
    })).map((line) => ({ ...line, qty: line.qty * -1 }))

    const credit = this.create('CREDIT', {
      customerId: invoice.customerId,
      lines,
      refs: { ...invoice.refs, invoiceId: invoice.id }
    })
    credit.customerSnapshot = invoice.customerSnapshot
    credit.dates.issue = new Date().toISOString().slice(0, 10)
    credit.dates.due = credit.dates.issue
    credit.legal = ensureLegal(credit)
    refreshTotals(credit)
    this.confirm(credit.id)
    persist()
    return credit
  },
  computeTotals(doc){
    return computeDocumentTotals(doc)
  },
  computeVatOnCash(invoice){
    return computeVatOnCash(invoice)
  }
}

export default salesStore
