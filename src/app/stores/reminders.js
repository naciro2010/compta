import Alpine from 'alpinejs'
import { docTotals } from '../utils/tax.js'

const KEY = 'maacc:sales:reminders'

function nextId(){
  return `REM-${crypto.randomUUID?.() || Math.random().toString(16).slice(2, 10)}`
}

function loadReminders(){
  const raw = localStorage.getItem(KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.warn('reminders: parse failed', error)
    return []
  }
}

const state = Alpine.reactive({
  reminders: loadReminders()
})

function persist(){
  localStorage.setItem(KEY, JSON.stringify(state.reminders))
}

function addReminder(payload){
  const reminder = {
    id: nextId(),
    invoiceId: payload.invoiceId,
    customerId: payload.customerId,
    level: payload.level,
    datePlanned: payload.datePlanned,
    sent: payload.sent || false,
    channel: payload.channel || 'email',
    notes: payload.notes || ''
  }
  state.reminders.push(reminder)
  persist()
  return reminder
}

function downloadFile(filename, content, mime = 'text/csv;charset=utf-8;'){
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function csvEscape(value){
  const str = String(value ?? '')
  if (/[";,\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function scheduleDates(invoice){
  const due = invoice?.dates?.due ? new Date(invoice.dates.due) : new Date()
  return [
    { level: 1, shift: 0, label: 'Courtoise' },
    { level: 2, shift: 7, label: 'Relance ferme' },
    { level: 3, shift: 15, label: 'Pré-contentieux' }
  ].map(({ level, shift, label }) => {
    const planned = new Date(due)
    planned.setDate(planned.getDate() + shift)
    return { level, label, datePlanned: planned.toISOString().slice(0, 10) }
  })
}

export const remindersStore = {
  state,
  list(){
    return state.reminders
  },
  byInvoice(invoiceId){
    return state.reminders.filter((reminder) => reminder.invoiceId === invoiceId)
  },
  generatePlan(invoice){
    if (!invoice || !invoice.id) return []
    const totals = invoice.totals || docTotals(invoice)
    const plan = scheduleDates(invoice)
    const existing = this.byInvoice(invoice.id)
    return plan.reduce((acc, item) => {
      const already = existing.find((rem) => rem.level === item.level)
      if (already) {
        acc.push(already)
        return acc
      }
      const reminder = addReminder({
        invoiceId: invoice.id,
        customerId: invoice.customerId,
        level: item.level,
        datePlanned: item.datePlanned,
        channel: 'email',
        notes: `Relance niveau ${item.level} pour ${invoice.customerSnapshot?.name || ''} - TTC ${totals.ttc.toFixed(2)} MAD`
      })
      acc.push(reminder)
      return acc
    }, [])
  },
  markSent(reminderId){
    const reminder = state.reminders.find((item) => item.id === reminderId)
    if (!reminder) return null
    reminder.sent = true
    reminder.sentAt = new Date().toISOString()
    persist()
    return reminder
  },
  pending(){
    const now = new Date().toISOString().slice(0, 10)
    return state.reminders.filter((reminder) => !reminder.sent && reminder.datePlanned <= now)
  },
  exportCsv({ reminders = state.reminders, filename = 'reminders.csv' } = {}){
    const header = ['id', 'invoiceId', 'customerId', 'level', 'datePlanned', 'sent', 'channel', 'notes']
    const lines = [header.join(';')]
    reminders.forEach((reminder) => {
      const line = header.map((key) => csvEscape(reminder[key]))
      lines.push(line.join(';'))
    })
    const content = lines.join('\n')
    downloadFile(filename, content)
    return content
  },
  removeByInvoice(invoiceId){
    const before = state.reminders.length
    state.reminders = state.reminders.filter((item) => item.invoiceId !== invoiceId)
    if (state.reminders.length !== before) persist()
  }
}

export default remindersStore
