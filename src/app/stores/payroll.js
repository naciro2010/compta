import Alpine from 'alpinejs'
import { settingsStore } from './settings.js'
import { ledgerStore } from './ledger.js'
import { seedStore } from '../../shared/seed.js'
import printStyles from '../styles/print-payslip.css?inline'

const KEY = 'maacc:payroll'

function nextId(prefix){
  return `${prefix}-${crypto.randomUUID?.() || Math.random().toString(16).slice(2)}`
}

function round(value, step = 0.01){
  const factor = 1 / step
  return Math.round((value + Number.EPSILON) * factor) / factor
}

function lastDayOfPeriod(periode){
  const [year, month] = periode.split('-').map(Number)
  const date = new Date(year, month, 0)
  return date.toISOString().slice(0, 10)
}

function loadSeedEmployees(){
  if (typeof seedStore.ensure === 'function') {
    try { seedStore.ensure() } catch (error) { console.warn('payroll: seed ensure failed', error) }
  }
  const dataset = seedStore.get()
  if (!Array.isArray(dataset.payroll)) return []
  return dataset.payroll.map((item) => ({
    id: item.id || nextId('emp'),
    nom: item.nom || 'Employé(e)',
    matriculeCnss: item.cnss || item.matriculeCnss || '',
    poste: item.poste || '',
    salaireBase: item.salaireBrut || 0,
    primes: item.avantages ? Object.entries(item.avantages).map(([label, amount]) => ({ label, amount: Number(amount) || 0 })) : [],
    retenues: [],
    iban: item.iban || ''
  }))
}

function defaultState(){
  return {
    employees: loadSeedEmployees(),
    runs: []
  }
}

function clone(value){
  return JSON.parse(JSON.stringify(value))
}

function loadState(){
  const raw = localStorage.getItem(KEY)
  if (!raw) return defaultState()
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return defaultState()
    parsed.employees = Array.isArray(parsed.employees) ? parsed.employees : []
    parsed.runs = Array.isArray(parsed.runs) ? parsed.runs : []
    return parsed
  } catch (error) {
    console.warn('payroll: failed to parse state, resetting', error)
    return defaultState()
  }
}

const state = Alpine.reactive(loadState())

function persist(){
  localStorage.setItem(KEY, JSON.stringify(clone(state)))
}

function findRunById(id){
  return state.runs.find((run) => run.id === id)
}

function ensureRun(periode){
  let run = state.runs.find((item) => item.periode === periode)
  if (!run) {
    run = {
      id: nextId('run'),
      periode,
      statut: 'Brouillon',
      lines: [],
      createdAt: new Date().toISOString()
    }
    state.runs.push(run)
    persist()
  }
  return run
}

function buildPayslip(employee, periode){
  const payrollConfig = settingsStore.getPayroll()
  const step = payrollConfig.rounding || 0.01
  const brutBase = Number(employee.salaireBase) || 0
  const primesTotal = Array.isArray(employee.primes) ? employee.primes.reduce((sum, prime) => sum + (Number(prime.amount) || 0), 0) : 0
  const brut = brutBase + primesTotal
  const baseCnss = brut
  const cnssSal = round(baseCnss * (Number(payrollConfig.txCnssSal) || 0) / 100, step)
  const cnssEmp = round(baseCnss * (Number(payrollConfig.txCnssEmp) || 0) / 100, step)
  const baseIR = brut - cnssSal
  const ir = round(baseIR * (Number(payrollConfig.txIR) || 0) / 100, step)
  const retenuesAutres = Array.isArray(employee.retenues) ? employee.retenues.reduce((sum, retenue) => sum + (Number(retenue.amount) || 0), 0) : 0
  const netAPayer = round(brut - cnssSal - ir - retenuesAutres, step)
  return {
    id: nextId('slip'),
    employeeId: employee.id,
    periode,
    brut: round(brut, step),
    baseCnss: round(baseCnss, step),
    txCnssSal: Number(payrollConfig.txCnssSal) || 0,
    txCnssEmp: Number(payrollConfig.txCnssEmp) || 0,
    cnssSal,
    cnssEmp,
    baseIR: round(baseIR, step),
    ir,
    avantagesTotal: round(primesTotal, step),
    retenuesAutres: round(retenuesAutres, step),
    netAPayer,
    details: {
      salaireBase: brutBase,
      primes: clone(employee.primes || []),
      retenues: clone(employee.retenues || [])
    }
  }
}

function computeTotals(run){
  return run.lines.reduce((acc, line) => {
    acc.brut += line.brut
    acc.cnssSal += line.cnssSal
    acc.cnssEmp += line.cnssEmp
    acc.ir += line.ir
    acc.net += line.netAPayer
    acc.otherDeductions += line.retenuesAutres
    return acc
  }, { brut: 0, cnssSal: 0, cnssEmp: 0, ir: 0, net: 0, otherDeductions: 0 })
}

function getPayDate(periode){
  const payrollConfig = settingsStore.getPayroll()
  if (payrollConfig.payDateRule === 'last-day') {
    return lastDayOfPeriod(periode)
  }
  return lastDayOfPeriod(periode)
}

function downloadFile(filename, content, mime = 'text/plain'){
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const payrollStore = {
  state,
  employees: {
    list(){
      return state.employees
    },
    add(payload){
      const employee = {
        id: nextId('emp'),
        nom: payload.nom || 'Employé(e)',
        matriculeCnss: payload.matriculeCnss || '',
        poste: payload.poste || '',
        salaireBase: Number(payload.salaireBase) || 0,
        primes: payload.primes || [],
        retenues: payload.retenues || [],
        iban: payload.iban || ''
      }
      state.employees.push(employee)
      persist()
      return employee
    },
    update(id, payload){
      const employee = state.employees.find((item) => item.id === id)
      if (!employee) return null
      Object.assign(employee, {
        ...payload,
        salaireBase: Number(payload.salaireBase) || 0
      })
      persist()
      return employee
    },
    remove(id){
      const index = state.employees.findIndex((item) => item.id === id)
      if (index === -1) return false
      state.employees.splice(index, 1)
      persist()
      return true
    }
  },
  runs: {
    list(){
      return state.runs
    },
    create(periode){
      const run = ensureRun(periode)
      run.lines = []
      run.statut = 'Brouillon'
      persist()
      return run
    },
    ensureComputed(periode){
      const run = ensureRun(periode)
      if (!run.lines.length) {
        run.lines = state.employees.map((employee) => buildPayslip(employee, periode))
        run.statut = run.statut === 'Validé' ? 'Validé' : 'Brouillon'
        persist()
      }
      return run
    },
    compute(periode){
      const run = ensureRun(periode)
      run.lines = state.employees.map((employee) => buildPayslip(employee, periode))
      if (run.statut !== 'Validé') {
        run.statut = 'Brouillon'
      }
      run.updatedAt = new Date().toISOString()
      persist()
      return run
    },
    getById(id){
      return findRunById(id)
    },
    validate(id){
      const run = findRunById(id)
      if (!run) return null
      if (!run.lines.length) {
        this.compute(run.periode)
      }
      const totals = computeTotals(run)
      const postDate = getPayDate(run.periode)
      ledgerStore.postPayrollRun({
        run,
        totals: {
          date: postDate,
          expenses: totals.brut + totals.cnssEmp,
          net: totals.net,
          cnss: totals.cnssSal + totals.cnssEmp,
          ir: totals.ir,
          otherDeductions: totals.otherDeductions
        }
      })
      run.statut = 'Validé'
      run.validatedAt = new Date().toISOString()
      run.ledgerPosted = true
      persist()
      return run
    },
    markPaid(id){
      const run = findRunById(id)
      if (!run) return null
      if (!run.lines.length) {
        this.compute(run.periode)
      }
      const totals = computeTotals(run)
      const payDate = getPayDate(run.periode)
      ledgerStore.markPayrollPaid({
        run,
        amount: totals.net,
        date: payDate
      })
      run.statut = 'Payé'
      run.paidAt = new Date().toISOString()
      persist()
      return run
    },
    exportCnssCsv(id){
      const run = findRunById(id)
      if (!run) return null
      if (!run.lines.length) {
        this.compute(run.periode)
      }
      const header = ['matricule','nom','periode','brut','base_cnss','tx_sal','tx_emp','cnss_sal','cnss_emp','base_ir','ir','net']
      const rows = run.lines.map((line) => {
        const employee = state.employees.find((item) => item.id === line.employeeId) || {}
        return [
          employee.matriculeCnss || '',
          employee.nom || '',
          run.periode,
          line.brut.toFixed(2),
          line.baseCnss.toFixed(2),
          line.txCnssSal.toFixed(2),
          line.txCnssEmp.toFixed(2),
          line.cnssSal.toFixed(2),
          line.cnssEmp.toFixed(2),
          line.baseIR.toFixed(2),
          line.ir.toFixed(2),
          line.netAPayer.toFixed(2)
        ].map((col) => `"${col}"`).join(',')
      })
      const csv = [header.join(','), ...rows].join('\n')
      downloadFile(`cnss-${run.periode}.csv`, csv, 'text/csv')
      return csv
    },
    printPayslips(id){
      const run = findRunById(id)
      if (!run) return null
      if (!run.lines.length) {
        this.compute(run.periode)
      }
      const company = settingsStore.getCompany()
      const win = window.open('', '_blank', 'width=900,height=1200')
      if (!win) return null
      const doc = win.document
      const slipsHtml = run.lines.map((line) => {
        const employee = state.employees.find((item) => item.id === line.employeeId) || {}
        return `
          <article class="payslip">
            <header class="payslip__header">
              <div>
                <h1>${company.raisonSociale || 'MA-ACC POC'}</h1>
                <p>${company.ville || ''} · ICE ${company.ICE || '-'}</p>
              </div>
              <div class="text-right">
                <h2>${employee.nom || ''}</h2>
                <p>${employee.poste || ''}</p>
                <p>CNSS: ${employee.matriculeCnss || '-'}</p>
              </div>
            </header>
            <section class="payslip__body">
              <div class="grid">
                <div>
                  <h3>Période / الفترة</h3>
                  <p>${run.periode}</p>
                </div>
                <div>
                  <h3>Brut</h3>
                  <p>${line.brut.toFixed(2)} ${company.devise || 'MAD'}</p>
                </div>
                <div>
                  <h3>Net à payer</h3>
                  <p class="font-bold">${line.netAPayer.toFixed(2)} ${company.devise || 'MAD'}</p>
                </div>
              </div>
              <table>
                <thead>
                  <tr><th>Rubrique</th><th>Montant</th></tr>
                </thead>
                <tbody>
                  <tr><td>Salaire de base</td><td>${line.details.salaireBase.toFixed(2)}</td></tr>
                  ${line.avantagesTotal ? `<tr><td>Primes</td><td>${line.avantagesTotal.toFixed(2)}</td></tr>` : ''}
                  <tr><td>CNSS (Salarié)</td><td>- ${line.cnssSal.toFixed(2)}</td></tr>
                  <tr><td>CNSS (Employeur)</td><td>${line.cnssEmp.toFixed(2)}</td></tr>
                  <tr><td>IR</td><td>- ${line.ir.toFixed(2)}</td></tr>
                  ${line.retenuesAutres ? `<tr><td>Retenues diverses</td><td>- ${line.retenuesAutres.toFixed(2)}</td></tr>` : ''}
                </tbody>
              </table>
            </section>
            <footer class="payslip__footer">
              <p>Total charges employeur: ${(line.cnssEmp).toFixed(2)} ${company.devise || 'MAD'}</p>
              <p>Date de paiement estimée: ${getPayDate(run.periode)}</p>
            </footer>
          </article>
        `
      }).join('\n')
      doc.write(`<!doctype html>
        <html>
        <head>
          <meta charset="utf-8" />
          <title>Bulletins ${run.periode}</title>
          <style>${printStyles}</style>
        </head>
        <body class="payslip-print">
          ${slipsHtml}
        </body>
        </html>`)
      doc.close()
      win.focus()
      return run
    }
  }
}

window.__maaccPayrollStore = payrollStore
