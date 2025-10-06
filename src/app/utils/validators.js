function strip(value){
  return String(value ?? '').trim()
}

export function isICE(value){
  const cleaned = strip(value)
  return /^\d{15}$/.test(cleaned)
}

export function isIF(value){
  const cleaned = strip(value)
  return cleaned === '' || /^[A-Z0-9-]{4,20}$/i.test(cleaned)
}

export function isRC(value){
  const cleaned = strip(value)
  return cleaned === '' || /^[0-9]{1,10}$/i.test(cleaned)
}

export function isDate(value){
  const date = new Date(value)
  return !Number.isNaN(date.getTime())
}

export function isNonNegMoney(value){
  const num = Number(value)
  return Number.isFinite(num) && num >= 0
}

export function isPositiveQuantity(value){
  const num = Number(value)
  return Number.isFinite(num) && num >= 0.01
}

export function required(value){
  return strip(value).length > 0
}

export function normalizeMoney(value){
  const num = Number(String(value).replace(',', '.'))
  if (Number.isNaN(num)) return 0
  return Math.round((num + Number.EPSILON) * 100) / 100
}

export function normalizeQty(value){
  const num = Number(String(value).replace(',', '.'))
  if (Number.isNaN(num)) return 0
  return Math.round((num + Number.EPSILON) * 1000) / 1000
}

export const validators = {
  isICE,
  isIF,
  isRC,
  isDate,
  isNonNegMoney,
  isPositiveQuantity,
  required,
  normalizeMoney,
  normalizeQty
}

export default validators
