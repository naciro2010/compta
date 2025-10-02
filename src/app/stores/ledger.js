import Alpine from 'alpinejs'

const KEY = 'maacc:ledger'

function loadEntries(){
  const raw = localStorage.getItem(KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.warn('ledger: failed to parse entries, resetting', error)
    return []
  }
}

const state = Alpine.reactive({
  entries: loadEntries()
})

function persist(){
  localStorage.setItem(KEY, JSON.stringify(state.entries))
}

function nextId(prefix){
  return `${prefix}-${crypto.randomUUID?.() || Math.random().toString(16).slice(2)}`
}

function addEntry(entry){
  state.entries.push({ ...entry, id: entry.id || nextId('led') })
  persist()
}

function computeTotals(lines){
  return lines.reduce((acc, line) => {
    acc.debit += Number(line.debit || 0)
    acc.credit += Number(line.credit || 0)
    return acc
  }, { debit: 0, credit: 0 })
}

export const ledgerStore = {
  state,
  list(){
    return state.entries
  },
  addBulk(entries){
    const lines = entries.map((entry) => ({ ...entry, id: entry.id || nextId('led') }))
    state.entries.push(...lines)
    persist()
    return lines
  },
  postPayrollRun({ run, totals }){
    const lines = [
      {
        pieceId: `PAYRUN-${run.id}`,
        date: totals.date,
        journal: 'PAY',
        compte: 'PAY_EXP',
        libelle: `Paie ${run.periode} - Charges salariales`,
        debit: Number((totals.expenses).toFixed(2)),
        credit: 0
      },
      {
        pieceId: `PAYRUN-${run.id}`,
        date: totals.date,
        journal: 'PAY',
        compte: 'NET_PAYABLE',
        libelle: `Paie ${run.periode} - Net à payer`,
        debit: 0,
        credit: Number((totals.net).toFixed(2))
      },
      {
        pieceId: `PAYRUN-${run.id}`,
        date: totals.date,
        journal: 'PAY',
        compte: 'CNSS_PAYABLE',
        libelle: `Paie ${run.periode} - CNSS (sal+emp)`,
        debit: 0,
        credit: Number((totals.cnss).toFixed(2))
      },
      {
        pieceId: `PAYRUN-${run.id}`,
        date: totals.date,
        journal: 'PAY',
        compte: 'IR_PAYABLE',
        libelle: `Paie ${run.periode} - IR`,
        debit: 0,
        credit: Number((totals.ir).toFixed(2))
      }
    ]

    if (totals.otherDeductions > 0) {
      lines.push({
        pieceId: `PAYRUN-${run.id}`,
        date: totals.date,
        journal: 'PAY',
        compte: 'OTHER_WITHHOLDINGS',
        libelle: `Paie ${run.periode} - Retenues diverses`,
        debit: 0,
        credit: Number((totals.otherDeductions).toFixed(2))
      })
    }

    const totalCheck = computeTotals(lines)
    if (Math.abs(totalCheck.debit - totalCheck.credit) > 0.05) {
      console.warn('ledger: payroll entry unbalanced', totalCheck)
    }

    this.addBulk(lines)
    return lines
  },
  markPayrollPaid({ run, amount, date }){
    const lineDate = date
    const lines = [
      {
        pieceId: `PAYPAY-${run.id}`,
        date: lineDate,
        journal: 'BNK',
        compte: 'NET_PAYABLE',
        libelle: `Paie ${run.periode} - Règlement salaires`,
        debit: Number((amount).toFixed(2)),
        credit: 0
      },
      {
        pieceId: `PAYPAY-${run.id}`,
        date: lineDate,
        journal: 'BNK',
        compte: 'BANK',
        libelle: `Paie ${run.periode} - Sortie banque`,
        debit: 0,
        credit: Number((amount).toFixed(2))
      }
    ]
    this.addBulk(lines)
    return lines
  }
}
