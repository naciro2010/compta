import Alpine from 'alpinejs'
import { seedStore } from '../../shared/seed.js'
import { normalizeMoney, required, isICE, isIF, isRC } from '../utils/validators.js'
import { docTotals } from '../utils/tax.js'

const KEY = 'maacc:sales:customers'

function nextId(){
  return `CUS-${crypto.randomUUID?.() || Math.random().toString(16).slice(2, 10)}`
}

function loadSeed(){
  try { seedStore.ensure?.() } catch (error) { console.warn('customers: seed ensure failed', error) }
  const dataset = seedStore.get?.() || {}
  if (!Array.isArray(dataset.clients)) return []
  return dataset.clients.slice(0, 20).map((client) => ({
    id: client.id || nextId(),
    name: client.nom || client.name || 'Client',
    ICE: client.ICE || client.ice || '',
    IF: client.IF || '',
    RC: client.RC || '',
    address: client.adresse || client.address || '',
    city: client.ville || client.city || '',
    email: client.email || '',
    phone: client.telephone || client.phone || '',
    paymentTerms: client.conditionsPaiement || '30J',
    creditLimit: client.encoursAutorise || 0,
    tags: client.tags || []
  }))
}

function loadCustomers(){
  const raw = localStorage.getItem(KEY)
  if (!raw) return loadSeed()
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return loadSeed()
    return parsed
  } catch (error) {
    console.warn('customers: parse failed, using seed', error)
    return loadSeed()
  }
}

const state = Alpine.reactive({
  customers: loadCustomers()
})

function persist(){
  localStorage.setItem(KEY, JSON.stringify(state.customers))
}

function assertCustomer(payload){
  const errors = []
  if (!required(payload.name)) errors.push('name')
  if (payload.ICE && !isICE(payload.ICE)) errors.push('ICE')
  if (payload.IF && !isIF(payload.IF)) errors.push('IF')
  if (payload.RC && !isRC(payload.RC)) errors.push('RC')
  return errors
}

function ensureArray(value){
  if (!Array.isArray(value)) return []
  return value
}

function computeStats(customerId, documents = []){
  const docs = documents.filter((doc) => doc.customerId === customerId)
  const invoices = docs.filter((doc) => doc.type === 'INVOICE')
  const credits = docs.filter((doc) => doc.type === 'CREDIT')
  const payments = []

  let caHt = 0
  let caTva = 0
  let caTtc = 0
  let paid = 0
  let encours = 0
  let totalCost = 0

  invoices.forEach((doc) => {
    const totals = doc.totals || docTotals(doc)
    caHt += totals.ht
    caTva += totals.tva
    caTtc += totals.ttc
    const docPaid = (doc.payments || []).reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0)
    paid += docPaid
    encours += Math.max(totals.ttc - docPaid, 0)
    totalCost += totals.ht * 0.7
    (doc.payments || []).forEach((payment) => payments.push({ ...payment, docId: doc.id, issue: doc.dates?.issue }))
  })

  credits.forEach((doc) => {
    const totals = doc.totals || docTotals(doc)
    const ht = Math.abs(totals.ht)
    const tva = Math.abs(totals.tva)
    const ttc = Math.abs(totals.ttc)
    caHt -= ht
    caTva -= tva
    caTtc -= ttc
    const docPaid = (doc.payments || []).reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0)
    paid -= docPaid
    encours -= Math.max(ttc - docPaid, 0)
    totalCost -= ht * 0.7
    (doc.payments || []).forEach((payment) => payments.push({ ...payment, docId: doc.id, issue: doc.dates?.issue }))
  })

  const margin = caHt - totalCost
  const dso = computeDso(invoices)
  const lastPayment = payments.sort((a, b) => new Date(b.date) - new Date(a.date))[0] || null

  return {
    caHt: Math.round((caHt + Number.EPSILON) * 100) / 100,
    caTva: Math.round((caTva + Number.EPSILON) * 100) / 100,
    caTtc: Math.round((caTtc + Number.EPSILON) * 100) / 100,
    encours: Math.round((encours + Number.EPSILON) * 100) / 100,
    paid: Math.round((paid + Number.EPSILON) * 100) / 100,
    margin: Math.round((margin + Number.EPSILON) * 100) / 100,
    marginRate: caHt > 0 ? Math.round(((margin / caHt) * 100 + Number.EPSILON) * 10) / 10 : 0,
    dso,
    documents: docs,
    invoices,
    credits,
    lastPayment
  }
}

function computeDso(invoices){
  if (!invoices.length) return 0
  const sums = invoices.reduce((acc, invoice) => {
    const paidAmount = (invoice.payments || []).reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0)
    const totals = invoice.totals || docTotals(invoice)
    const outstanding = Math.max(totals.ttc - paidAmount, 0)
    const issueDate = invoice.dates?.issue ? new Date(invoice.dates.issue) : null
    const dueDate = invoice.dates?.due ? new Date(invoice.dates.due) : null
    if (!issueDate || !dueDate) return acc
    const delay = (dueDate - issueDate) / (1000 * 3600 * 24)
    acc.weighted += delay * totals.ttc
    acc.ttc += totals.ttc
    acc.outstanding += outstanding
    return acc
  }, { weighted: 0, ttc: 0, outstanding: 0 })

  if (!sums.ttc) return 0
  return Math.round(((sums.weighted / sums.ttc) + Number.EPSILON) * 10) / 10
}

export const customersStore = {
  state,
  list(){
    return state.customers
  },
  byId(id){
    return state.customers.find((customer) => customer.id === id) || null
  },
  add(payload){
    const customer = {
      id: payload.id || nextId(),
      name: payload.name || 'Client',
      ICE: payload.ICE || '',
      IF: payload.IF || '',
      RC: payload.RC || '',
      address: payload.address || '',
      city: payload.city || '',
      email: payload.email || '',
      phone: payload.phone || '',
      paymentTerms: payload.paymentTerms || '30J',
      creditLimit: normalizeMoney(payload.creditLimit || 0),
      tags: ensureArray(payload.tags)
    }
    const errors = assertCustomer(customer)
    if (errors.length) {
      throw new Error(`customers: invalid fields ${errors.join(',')}`)
    }
    state.customers.push(customer)
    persist()
    return customer
  },
  update(id, payload){
    const customer = this.byId(id)
    if (!customer) return null
    Object.assign(customer, {
      name: payload.name ?? customer.name,
      ICE: payload.ICE ?? customer.ICE,
      IF: payload.IF ?? customer.IF,
      RC: payload.RC ?? customer.RC,
      address: payload.address ?? customer.address,
      city: payload.city ?? customer.city,
      email: payload.email ?? customer.email,
      phone: payload.phone ?? customer.phone,
      paymentTerms: payload.paymentTerms ?? customer.paymentTerms,
      creditLimit: payload.creditLimit !== undefined ? normalizeMoney(payload.creditLimit) : customer.creditLimit,
      tags: payload.tags !== undefined ? ensureArray(payload.tags) : customer.tags
    })
    const errors = assertCustomer(customer)
    if (errors.length) {
      throw new Error(`customers: invalid fields ${errors.join(',')}`)
    }
    persist()
    return customer
  },
  remove(id){
    const index = state.customers.findIndex((customer) => customer.id === id)
    if (index === -1) return false
    state.customers.splice(index, 1)
    persist()
    return true
  },
  importSeed(){
    const seeds = loadSeed()
    seeds.forEach((seed) => {
      if (!state.customers.some((customer) => customer.id === seed.id || customer.ICE === seed.ICE)) {
        state.customers.push(seed)
      }
    })
    persist()
  },
  stats(customerId, documents){
    return computeStats(customerId, Array.isArray(documents) ? documents : [])
  }
}

export default customersStore
