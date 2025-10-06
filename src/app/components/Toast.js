export function toast({ message, title = '', type = 'info', timeout } = {}) {
  if (!message) return null
  const store = window.Alpine?.store('toast')
  if (!store) return null
  return store.push({ message, title, type, timeout })
}

export function toastSuccess(message, title = '') {
  return toast({ message, title, type: 'success' })
}

export function toastError(message, title = '') {
  return toast({ message, title, type: 'error', timeout: 6000 })
}

export function toastInfo(message, title = '') {
  return toast({ message, title, type: 'info' })
}

export default {
  toast,
  toastSuccess,
  toastError,
  toastInfo
}
