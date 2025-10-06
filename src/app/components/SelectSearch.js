const defaultConfig = {
  items: [],
  valueKey: 'id',
  labelKey: 'name',
  placeholder: '',
  onSelect: null,
  clearOnSelect: false
}

function normalizeConfig(config){
  return { ...defaultConfig, ...(config || {}) }
}

if (typeof document !== 'undefined') {
  document.addEventListener('alpine:init', () => {
    window.Alpine.data('selectSearch', (config) => {
      const options = normalizeConfig(config)
      return {
        options,
        query: '',
        open: false,
        highlightedIndex: -1,
        get items(){
          const source = this.options.items
          if (typeof source === 'function') {
            try {
              const value = source()
              return Array.isArray(value) ? value : []
            } catch (error) {
              console.warn('selectSearch: items() failed', error)
              return []
            }
          }
          return Array.isArray(source) ? source : []
        },
        get filtered(){
          const term = this.query.trim().toLowerCase()
          if (!term) return this.items
          return this.items.filter((item) => {
            const label = String(item[this.options.labelKey] ?? '').toLowerCase()
            return label.includes(term)
          })
        },
        toggle(){
          this.open = !this.open
          if (this.open) this.highlightedIndex = 0
        },
        select(item){
          if (!item) return
          const label = item[this.options.labelKey] || ''
          if (this.options.clearOnSelect) {
            this.query = ''
          } else {
            this.query = label
          }
          this.open = false
          if (typeof this.options.onSelect === 'function') {
            try {
              this.options.onSelect(item)
            } catch (error) {
              console.warn('selectSearch: onSelect handler failed', error)
            }
          }
        },
        highlightNext(){
          if (!this.filtered.length) return
          this.highlightedIndex = (this.highlightedIndex + 1) % this.filtered.length
        },
        highlightPrev(){
          if (!this.filtered.length) return
          this.highlightedIndex = (this.highlightedIndex - 1 + this.filtered.length) % this.filtered.length
        },
        onKeydown(event){
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            this.highlightNext()
          } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            this.highlightPrev()
          } else if (event.key === 'Enter') {
            event.preventDefault()
            this.select(this.filtered[this.highlightedIndex])
          } else if (event.key === 'Escape') {
            this.open = false
          }
        }
      }
    })
  })
}

export default {}
