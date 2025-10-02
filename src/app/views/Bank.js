import { getDataset } from './_utils.js'
export function renderBank(){
  const ds = getDataset()
  return `
    <div class="card">
      <div class="flex items-center justify-between"><h2 class="font-semibold">Banque (POC)</h2></div>
      <div class="mt-4 overflow-auto">
        <table class="min-w-full text-sm">
          <thead><tr><th class="p-2 text-left">Date</th><th class="p-2 text-left">Libellé</th><th class="p-2 text-right">Montant</th></tr></thead>
          <tbody>${ds.bank.slice(0,50).map(b=>`
            <tr class="border-t"><td class="p-2">${b.date}</td><td class="p-2">${b.label}</td><td class="p-2 text-right">${b.amount.toFixed(2)}</td></tr>
          `).join('')}</tbody>
        </table>
      </div>
    </div>`
}
