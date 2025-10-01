/**
 * Parse a mocked OCR filename to extract metadata.
 * Pattern: FACT_{ICE}_{HT}_{TVA}_{TTC}.pdf
 * @param {string} filename
 * @returns {Promise<object|null>}
 */
export async function parseOcrFile(filename) {
  const pattern = /FACT_(\d{8,})_(\d+(?:\.\d+)?)_(\d{1,2})_(\d+(?:\.\d+)?)/i;
  const match = filename.match(pattern);
  if (!match) return null;
  const [, ice, ht, tva, ttc] = match;
  return {
    ice,
    ht: Number(ht),
    tva: Number(tva),
    ttc: Number(ttc),
    desc: `Facture ${ice}`,
    note: `Pré-rempli depuis ${filename}`,
  };
}
