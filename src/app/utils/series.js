export function padSequence(seq, width = 6){
  return String(seq).padStart(width, '0')
}

export function buildDocumentId({ prefix, year, seq, separator = '-' }){
  const padded = padSequence(seq)
  return `${prefix}${separator}${year}${separator}${padded}`
}

export function parseDocumentId(id = ''){
  const parts = id.split('-')
  if (parts.length < 3) return null
  const [prefix, year, seq] = parts
  return { prefix, year: Number(year), seq: Number(seq) }
}

export default {
  padSequence,
  buildDocumentId,
  parseDocumentId
}
