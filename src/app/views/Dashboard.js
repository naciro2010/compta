import { getDataset } from '../views/_utils.js'
export function renderDashboard(){
  const ds = getDataset()
  const invOpen = ds.invoices.filter(i=>['Validée','Partiellement payée'].includes(i.status))
  const toPay = invOpen.reduce((s,i)=>s + (i.totalTtc - (i.payments||[]).reduce((p,a)=>p+a.amount,0)),0)
  return `
    <div class="grid lg:grid-cols-3 gap-4">
      <div class="card"><div class="text-sm text-slate-500">Factures ouvertes</div><div class="text-2xl font-semibold">${invOpen.length}</div></div>
      <div class="card"><div class="text-sm text-slate-500">Encours clients (MAD)</div><div class="text-2xl font-semibold">${toPay.toFixed(2)}</div></div>
      <div class="card"><div class="text-sm text-slate-500">Lignes banque</div><div class="text-2xl font-semibold">${ds.bank.length}</div></div>
    </div>
  `
}
