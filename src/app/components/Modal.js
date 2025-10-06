const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

export function toggleBodyScroll(open) {
  document.documentElement.classList.toggle('overflow-hidden', Boolean(open))
  document.body.classList.toggle('overflow-hidden', Boolean(open))
}

export function trapFocus(event, container) {
  if (event.key !== 'Tab') return
  if (!container) return
  const focusable = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter((element) => element.offsetParent !== null)
  if (!focusable.length) {
    event.preventDefault()
    container.focus()
    return
  }
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const active = document.activeElement
  if (event.shiftKey && active === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

export function focusPanel(panel) {
  if (!panel) return
  panel.focus({ preventScroll: false })
}

export default {
  toggleBodyScroll,
  trapFocus,
  focusPanel
}
