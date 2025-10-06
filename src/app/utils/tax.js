const ROUNDING_STEP = 0.01

function round(value, step = ROUNDING_STEP){
  const factor = 1 / step
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor
}

function sanitizeRate(rate){
  const numeric = Number(String(rate).replace(',', '.'))
  if (Number.isNaN(numeric) || numeric < 0) return 0
  return numeric
}

export function lineTotals(line = {}){
  const qty = Number(line.qty) || 0
  const unitPrice = Number(line.unitPrice) || 0
  const discountPct = Number(line.discountPct) || 0
  const rate = sanitizeRate(line.vatRate)

  const discountedUnit = unitPrice * (1 - Math.min(Math.max(discountPct, 0), 100) / 100)
  const ht = round(qty * discountedUnit)
  const vatAmount = round(ht * rate / 100)
  const ttc = round(ht + vatAmount)

  return {
    ht,
    vatAmount,
    vatRate: rate,
    ttc,
    discountValue: round(qty * unitPrice - ht)
  }
}

export function docTotals(doc = {}, vatMode = 'DEBIT'){
  const totals = {
    ht: 0,
    tva: 0,
    ttc: 0,
    discountTotal: 0,
    vatByRate: {},
    dueLeft: 0
  }

  const lines = Array.isArray(doc.lines) ? doc.lines : []
  lines.forEach((line) => {
    const computed = lineTotals(line)
    totals.ht = round(totals.ht + computed.ht)
    totals.tva = round(totals.tva + computed.vatAmount)
    totals.ttc = round(totals.ttc + computed.ttc)
    totals.discountTotal = round(totals.discountTotal + computed.discountValue)
    if (!totals.vatByRate[computed.vatRate]) {
      totals.vatByRate[computed.vatRate] = 0
    }
    totals.vatByRate[computed.vatRate] = round(totals.vatByRate[computed.vatRate] + computed.vatAmount)
  })

  const payments = Array.isArray(doc.payments) ? doc.payments : []
  const paid = payments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0)
  totals.dueLeft = round(totals.ttc - paid)

  if (vatMode === 'ENCAISSEMENT' && doc.type === 'INVOICE') {
    totals.vatOnCash = computeVatOnCash(doc, totals)
  }

  return totals
}

export function computeVatOnCash(invoice, cachedTotals){
  const doc = invoice || {}
  const payments = Array.isArray(doc.payments) ? doc.payments : []
  const totals = cachedTotals || docTotals(doc, 'DEBIT')
  const vatRates = Object.keys(totals.vatByRate)
  const ttc = totals.ttc || 0

  const perPayment = payments.map((payment) => {
    const amount = Number(payment.amount) || 0
    const ratio = ttc > 0 ? Math.min(Math.max(amount / ttc, 0), 1) : 0
    const vatShare = vatRates.reduce((acc, rate) => {
      const vatForRate = totals.vatByRate[rate] || 0
      acc[rate] = round(vatForRate * ratio)
      return acc
    }, {})
    return { ...payment, vatShare }
  })

  const vatCollected = perPayment.reduce((acc, item) => {
    Object.entries(item.vatShare).forEach(([rate, value]) => {
      acc[rate] = round((acc[rate] || 0) + value)
    })
    return acc
  }, {})

  return {
    perPayment,
    vatCollected,
    totalCollected: round(Object.values(vatCollected).reduce((sum, value) => sum + value, 0))
  }
}

export function money(value){
  return round(Number(value) || 0)
}

export const taxUtils = {
  round,
  lineTotals,
  docTotals,
  computeVatOnCash,
  money
}

export default taxUtils
