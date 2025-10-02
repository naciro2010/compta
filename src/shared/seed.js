import companies from '../data/companies.json'
import clients from '../data/clients.json'
import suppliers from '../data/suppliers.json'
import invoices from '../data/invoices.json'
import purchases from '../data/purchases.json'
import bank from '../data/bank.json'
import payroll from '../data/payroll.json'
const KEY = 'maacc:dataset:v1'
export const seedStore = {
  ensure(){ if(!localStorage.getItem(KEY)){ localStorage.setItem(KEY, JSON.stringify({ companies, clients, suppliers, invoices, purchases, bank, payroll })) } },
  reset(){ localStorage.removeItem(KEY); location.reload() },
  get(){ return JSON.parse(localStorage.getItem(KEY) || '{}') },
  set(data){ localStorage.setItem(KEY, JSON.stringify(data)) }
}
