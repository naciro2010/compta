import { renderDashboard } from './views/Dashboard.js'
import { renderSales } from './views/Sales.js'
import { renderPurchases } from './views/Purchases.js'
import { renderBank } from './views/Bank.js'
import { renderLedger } from './views/Ledger.js'
import { renderTax } from './views/Tax.js'
import { renderPayroll } from './views/Payroll.js'
import { renderSettings } from './views/Settings.js'
import { renderFixedAssets } from './views/FixedAssets.js'
const routes = {
  '#/dashboard': renderDashboard,
  '#/sales': renderSales,
  '#/purchases': renderPurchases,
  '#/bank': renderBank,
  '#/ledger': renderLedger,
  '#/tax': renderTax,
  '#/payroll': renderPayroll,
  '#/settings': renderSettings,
  '#/fixed-assets': renderFixedAssets,
}
export const router = {
  start(){
    window.addEventListener('hashchange', ()=>this.render())
    if(!location.hash) location.hash = '#/dashboard'
    this.render()
  },
  render(){
    const fn = routes[location.hash] || renderDashboard
    document.getElementById('view').innerHTML = fn()
  }
}
