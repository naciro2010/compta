const defaultConfig = {
  columns: [],
  rows: [],
  pageSize: 10,
  stickyHeader: true,
  searchField: null
}

function normalize(config){
  return { ...defaultConfig, ...(config || {}) }
}

function sortRows(rows, sort){
  if (!sort || !sort.key) return rows
  const sorted = [...rows]
  sorted.sort((a, b) => {
    const av = a[sort.key]
    const bv = b[sort.key]
    if (av === bv) return 0
    if (av === undefined || av === null) return sort.direction === 'asc' ? -1 : 1
    if (bv === undefined || bv === null) return sort.direction === 'asc' ? 1 : -1
    if (typeof av === 'number' && typeof bv === 'number') {
      return sort.direction === 'asc' ? av - bv : bv - av
    }
    return sort.direction === 'asc'
      ? String(av).localeCompare(String(bv), undefined, { sensitivity: 'base' })
      : String(bv).localeCompare(String(av), undefined, { sensitivity: 'base' })
  })
  return sorted
}

if (typeof document !== 'undefined') {
  document.addEventListener('alpine:init', () => {
    window.Alpine.data('smartTable', (config) => {
      const options = normalize(config)
      return {
        options,
        page: 1,
        search: '',
        sort: { key: null, direction: 'asc' },
        get columns(){
          return Array.isArray(this.options.columns) ? this.options.columns : []
        },
        get rows(){
          return Array.isArray(this.options.rows) ? this.options.rows : []
        },
        get filtered(){
          let data = this.rows
          const search = this.search.trim().toLowerCase()
          if (search) {
            data = data.filter((row) => {
              if (!this.options.searchField) {
                return Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(search))
              }
              const fieldValue = row[this.options.searchField]
              return String(fieldValue ?? '').toLowerCase().includes(search)
            })
          }
          data = sortRows(data, this.sort)
          return data
        },
        get pageCount(){
          return Math.max(1, Math.ceil(this.filtered.length / this.options.pageSize))
        },
        get paginated(){
          const size = this.options.pageSize
          const start = (this.page - 1) * size
          return this.filtered.slice(start, start + size)
        },
        sortBy(key){
          if (this.sort.key === key) {
            this.sort.direction = this.sort.direction === 'asc' ? 'desc' : 'asc'
          } else {
            this.sort.key = key
            this.sort.direction = 'asc'
          }
        },
        goTo(page){
          const pageNumber = Math.min(Math.max(page, 1), this.pageCount)
          this.page = pageNumber
        },
        nextPage(){ this.goTo(this.page + 1) },
        prevPage(){ this.goTo(this.page - 1) }
      }
    })
  })
}

export default {}
