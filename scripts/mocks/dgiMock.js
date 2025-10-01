import { buildVatXml } from '../utils/vat.js';

async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function generateDgiXml(company, periodType, totals) {
  const period = `${periodType}-${new Date().toISOString().slice(0, 7)}`;
  const xml = buildVatXml(company, period, totals);
  const checksum = await sha256(xml);
  const payload = `${xml}\n<Signature>${checksum}</Signature>`;
  const blob = new Blob([payload], { type: 'application/xml' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `DGI-${company.ICE}-${Date.now()}.xml`;
  link.click();
  URL.revokeObjectURL(link.href);
}
