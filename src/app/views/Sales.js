import { getDataset } from './_utils.js'
export function renderSales(){
  const ds = getDataset()
  return `
    <div class="card">
      <div class="flex items-center justify-between">
        <h2 class="font-semibold">Ventes (POC)</h2>
        <button class="btn-outline" onclick="alert('Formulaire facture à implémenter via Épic D')">Nouvelle facture</button>
      </div>
      <div class="mt-4 overflow-auto">
        <table class="min-w-full text-sm">
          <thead><tr class="text-left"><th class="p-2">#</th><th class="p-2">Client</th><th class="p-2">Date</th><th class="p-2">TTC</th><th class="p-2">Statut</th></tr></thead>
          <tbody>${ds.invoices.slice(0,30).map(i=>`
            <tr class="border-t"><td class="p-2">${i.id}</td><td class="p-2">${i.customerName}</td><td class="p-2">${i.date}</td><td class="p-2">${i.totalTtc.toFixed(2)}</td><td class="p-2">${i.status}</td></tr>
          `).join('')}</tbody>
        </table>
      </div>
    </div>`
}
