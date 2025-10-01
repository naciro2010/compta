import { formatNumber } from './format.js';

/**
 * Compute VAT totals for a list of documents (sales/purchases).
 * @param {Array} docs
 * @param {string} type 'collecte' or 'deductible'
 */
export function aggregateVat(docs = [], type = 'collecte') {
  const totals = {};
  docs.forEach((doc) => {
    const date = new Date(doc.date);
    if (Number.isNaN(date.getTime())) return;
    const periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!totals[periodKey]) {
      totals[periodKey] = { collecte: 0, deductible: 0, base: 0 };
    }
    doc.lines.forEach((line) => {
      const base = Number(line.qty) * Number(line.unitPrice);
      const vat = (base * Number(line.vatRate)) / 100;
      totals[periodKey].base += base;
      totals[periodKey][type] += vat;
    });
  });
  return totals;
}

/**
 * Merge sales and purchases VAT to get net by period.
 * @param {Array} sales
 * @param {Array} purchases
 */
export function computeVatSummary(sales = [], purchases = []) {
  const collecte = aggregateVat(sales, 'collecte');
  const deductible = aggregateVat(purchases, 'deductible');
  const periods = new Set([...Object.keys(collecte), ...Object.keys(deductible)]);
  const summary = {};
  periods.forEach((period) => {
    summary[period] = {
      collecte: collecte[period]?.collecte ?? 0,
      deductible: deductible[period]?.deductible ?? 0,
      baseVente: collecte[period]?.base ?? 0,
      baseAchat: deductible[period]?.base ?? 0,
      net: (collecte[period]?.collecte ?? 0) - (deductible[period]?.deductible ?? 0),
    };
  });
  return summary;
}

/**
 * Format summary as printable table rows.
 * @param {object} summary
 */
export function vatSummaryToTable(summary = {}) {
  return Object.entries(summary)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([period, values]) => ({
      period,
      collecte: formatNumber(values.collecte),
      deductible: formatNumber(values.deductible),
      net: formatNumber(values.net),
      baseVente: formatNumber(values.baseVente),
      baseAchat: formatNumber(values.baseAchat),
    }));
}

/**
 * Generate VAT XML payload skeleton.
 * @param {object} company
 * @param {string} period
 * @param {object} data
 */
export function buildVatXml(company, period, data) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<DGI-POC>\n  <Societe>\n    <RaisonSociale>${company.raisonSociale}</RaisonSociale>\n    <ICE>${company.ICE}</ICE>\n    <IF>${company.IF}</IF>\n    <RC>${company.RC}</RC>\n  </Societe>\n  <Periode>${period}</Periode>\n  <TVACollectee>${data.collecte.toFixed(2)}</TVACollectee>\n  <TVADeductible>${data.deductible.toFixed(2)}</TVADeductible>\n  <TVANet>${data.net.toFixed(2)}</TVANet>\n</DGI-POC>`;
}
