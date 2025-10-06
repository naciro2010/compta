const DEBUG_KEY = 'maacc:debug'
let cachedFlag = null

function safeRead(){
  if (cachedFlag !== null) return cachedFlag
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    cachedFlag = false
    return cachedFlag
  }
  try {
    cachedFlag = localStorage.getItem(DEBUG_KEY) === '1'
  } catch (error) {
    cachedFlag = false
  }
  return cachedFlag
}

function label(scope){
  return scope ? `[maacc:${scope}]` : '[maacc]'
}

export function isDebugEnabled({ refresh = false } = {}){
  if (refresh) cachedFlag = null
  return safeRead()
}

export function debugLog(scope, ...args){
  if (!safeRead()) return
  const tag = typeof scope === 'string' ? label(scope) : label()
  const payload = typeof scope === 'string' ? args : [scope, ...args]
  console.debug(tag, ...payload)
}

export function withDebug(fn){
  if (!safeRead()) return
  try {
    fn()
  } catch (error) {
    console.debug(label('debug'), 'callback error', error)
  }
}

export function resetDebugCache(){
  cachedFlag = null
}

export default {
  isDebugEnabled,
  debugLog,
  withDebug,
  resetDebugCache
}
