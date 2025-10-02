import Alpine from 'alpinejs'
import { seedStore } from '../../shared/seed.js'

const KEY = 'maacc:settings'

const defaultPayrollConfig = () => ({
  txCnssSal: 4.48,
  txCnssEmp: 8.98,
  txIR: 10.0,
  rounding: 0.01,
  payDateRule: 'last-day'
})

const defaultCompany = () => {
  const dataset = seedStore.get()
  const fallback = {
    raisonSociale: '',
    ICE: '',
    IF: '',
    RC: '',
    TP: '',
    ville: '',
    devise: 'MAD',
    langue: 'fr',
    theme: 'clair',
    tvaPeriode: 'mensuel',
    tvaTaux: [20, 10, 14, 7]
  }
  const fromSeed = dataset.companies?.[0] || {}
  return {
    raisonSociale: fromSeed.raisonSociale ?? fallback.raisonSociale,
    ICE: fromSeed.ICE ?? fallback.ICE,
    IF: fromSeed.IF ?? fallback.IF,
    RC: fromSeed.RC ?? fallback.RC,
    TP: fromSeed.TP ?? fallback.TP,
    ville: fromSeed.ville ?? fallback.ville,
    devise: fromSeed.devise ?? fallback.devise,
    langue: fromSeed.langue ?? fallback.langue,
    theme: fromSeed.theme ?? fallback.theme,
    tvaPeriode: fromSeed.tvaPeriode ?? fallback.tvaPeriode,
    tvaTaux: Array.isArray(fromSeed.tvaTaux) && fromSeed.tvaTaux.length ? [...new Set(fromSeed.tvaTaux)] : [...fallback.tvaTaux]
  }
}

function deepMerge(target, source){
  const output = Array.isArray(target) ? [...target] : { ...target }
  if (typeof source !== 'object' || source === null) {
    return output
  }
  Object.entries(source).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      output[key] = value.map(v => (typeof v === 'object' && v !== null ? deepMerge({}, v) : v))
    } else if (typeof value === 'object') {
      output[key] = deepMerge(output[key] ?? {}, value)
    } else {
      output[key] = value
    }
  })
  return output
}

function loadSettings(){
  const storedRaw = localStorage.getItem(KEY)
  const defaults = { company: defaultCompany(), payroll: defaultPayrollConfig() }
  if (!storedRaw) return defaults
  try {
    const parsed = JSON.parse(storedRaw)
    return deepMerge(defaults, parsed)
  } catch (error) {
    console.warn('settings: unable to parse stored settings, resetting', error)
    return defaults
  }
}

function clone(value){
  return JSON.parse(JSON.stringify(value))
}

const state = Alpine.reactive(loadSettings())

function persist(){
  localStorage.setItem(KEY, JSON.stringify(clone(state)))
}

function normalizeTaux(list){
  const cleaned = list
    .map((item) => Number(String(item).replace(',', '.')))
    .filter((value) => !Number.isNaN(value) && value >= 0)
  return [...new Set(cleaned)]
}

export const settingsStore = {
  state,
  getCompany(){
    return state.company
  },
  getPayroll(){
    return state.payroll
  },
  setCompanyField(field, value){
    if (!(field in state.company)) return
    state.company[field] = value
    persist()
  },
  setPayrollField(field, value){
    if (!(field in state.payroll)) return
    state.payroll[field] = field === 'rounding' ? Math.max(Number(value) || 0.01, 0.001) : Number.isFinite(+value) ? Number(value) : value
    persist()
  },
  updateCompany(payload){
    state.company = { ...state.company, ...payload }
    state.company.tvaTaux = normalizeTaux(state.company.tvaTaux)
    persist()
  },
  updatePayroll(payload){
    state.payroll = { ...state.payroll, ...payload }
    persist()
  },
  setTvaTaux(list){
    state.company.tvaTaux = normalizeTaux(list)
    persist()
  },
  reset(){
    const defaults = loadSettings()
    state.company = defaults.company
    state.payroll = defaults.payroll
    persist()
  },
  refresh(){
    const fresh = loadSettings()
    state.company = fresh.company
    state.payroll = fresh.payroll
  }
}
