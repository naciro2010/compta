import { buildDocumentId, padSequence } from '../utils/series.js'

const KEY_PREFIX = 'maacc:numbering'
const LOCK_PREFIX = 'maacc:numbering-lock'
const DEFAULT_START = 1
const DEFAULT_DIGITS = 6
const LOCK_TTL = 2000

function storageKey(companyId, type, year){
  return `${KEY_PREFIX}:${companyId}:${type}:${year}`
}

function lockKey(companyId, type){
  return `${LOCK_PREFIX}:${companyId}:${type}`
}

function acquireLock(key){
  const now = Date.now()
  try {
    const existingRaw = localStorage.getItem(key)
    if (existingRaw) {
      const existing = JSON.parse(existingRaw)
      if (existing && existing.until && existing.until > now) {
        throw new Error('numbering:lock-busy')
      }
    }
  } catch (error) {
    console.warn('numbering: lock parse issue', error)
  }
  const payload = { owner: Math.random().toString(16).slice(2), until: now + LOCK_TTL }
  localStorage.setItem(key, JSON.stringify(payload))
  return () => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('numbering: release lock failed', error)
    }
  }
}

function loadCounter(key, start){
  const raw = localStorage.getItem(key)
  if (!raw) return start - 1
  const parsed = Number(raw)
  if (Number.isNaN(parsed)) return start - 1
  return parsed
}

function persistCounter(key, value){
  localStorage.setItem(key, String(value))
}

export const numberingStore = {
  next({ companyId = 'default', type, year, prefix, start = DEFAULT_START, digits = DEFAULT_DIGITS }){
    if (!type) throw new Error('numbering: type required')
    const resolvedYear = year || new Date().getFullYear()
    const resolvedPrefix = prefix || type.slice(0, 2).toUpperCase()
    const counterKey = storageKey(companyId, type, resolvedYear)
    const release = acquireLock(lockKey(companyId, type))
    let seq
    try {
      const current = loadCounter(counterKey, start)
      seq = current + 1
      persistCounter(counterKey, seq)
      setTimeout(() => {
        try { const latest = loadCounter(counterKey, start); if (latest < seq) persistCounter(counterKey, seq) } catch (error) { console.warn('numbering: ensure sequence failed', error) }
      }, 0)
    } finally {
      release()
    }
    return {
      series: resolvedPrefix,
      seq,
      year: resolvedYear,
      id: buildDocumentId({ prefix: resolvedPrefix, year: resolvedYear, seq, separator: '-' }),
      formattedSeq: padSequence(seq, digits)
    }
  }
}

export default numberingStore
