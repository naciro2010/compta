import { formatDate, formatCurrency, sanitize, t } from '../utils/format.js';

const DEFAULT_PAGE_SIZE = 10;

/**
 * Reusable data table component with sorting, filtering and pagination.
 */
export class Table {
  constructor({ columns, data = [], pageSize = DEFAULT_PAGE_SIZE, searchable = true, exportable = true }) {
    this.columns = columns;
    this.data = data;
    this.pageSize = pageSize;
    this.searchable = searchable;
    this.exportable = exportable;
    this.state = { sortKey: columns[0]?.key ?? null, sortDir: 'asc', page: 1, query: '' };
  }

  setData(data = []) {
    this.data = Array.isArray(data) ? data : [];
    this.state.page = 1;
    this.renderRows();
    this.renderPagination();
  }

  createHeaderCell(col) {
    const th = document.createElement('th');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = t(col.label || col.key);
    btn.addEventListener('click', () => this.sortBy(col.key));
    th.appendChild(btn);
    return th;
  }

  sortBy(key) {
    if (this.state.sortKey === key) {
      this.state.sortDir = this.state.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.state.sortKey = key;
      this.state.sortDir = 'asc';
    }
    this.renderRows();
  }

  filterData() {
    let filtered = [...this.data];
    if (this.state.query) {
      const q = this.state.query.toLowerCase();
      filtered = filtered.filter((row) =>
        this.columns.some((col) => String(row[col.key] ?? '').toLowerCase().includes(q)),
      );
    }
    if (this.state.sortKey) {
      const { sortKey, sortDir } = this.state;
      filtered.sort((a, b) => {
        const va = a[sortKey];
        const vb = b[sortKey];
        if (typeof va === 'number' && typeof vb === 'number') {
          return sortDir === 'asc' ? va - vb : vb - va;
        }
        return sortDir === 'asc'
          ? String(va ?? '').localeCompare(String(vb ?? ''))
          : String(vb ?? '').localeCompare(String(va ?? ''));
      });
    }
    return filtered;
  }

  renderRows() {
    if (!this.tbody) return;
    this.tbody.innerHTML = '';
    const filtered = this.filterData();
    const start = (this.state.page - 1) * this.pageSize;
    const pageItems = filtered.slice(start, start + this.pageSize);
    pageItems.forEach((row) => {
      const tr = document.createElement('tr');
      this.columns.forEach((col) => {
        const td = document.createElement('td');
        const value = row[col.key];
        let display = value;
        if (col.type === 'date') display = formatDate(value);
        if (col.type === 'currency') display = formatCurrency(value);
        if (col.render) {
          const rendered = col.render(row);
          if (rendered instanceof HTMLElement) {
            td.appendChild(rendered);
          } else if (rendered != null) {
            td.innerHTML = rendered;
          }
        } else {
          td.innerHTML = sanitize(display ?? '');
        }
        tr.appendChild(td);
      });
      this.tbody.appendChild(tr);
    });
    this.emptyState.hidden = pageItems.length > 0;
    if (pageItems.length === 0) {
      this.emptyState.textContent = t('table.noData');
    }
  }

  renderPagination() {
    if (!this.pagination) return;
    const totalItems = this.filterData().length;
    const totalPages = Math.max(1, Math.ceil(totalItems / this.pageSize));
    this.pagination.innerHTML = '';
    const info = document.createElement('span');
    info.textContent = `${this.state.page}/${totalPages}`;
    const prev = document.createElement('button');
    prev.type = 'button';
    prev.textContent = '‹';
    prev.disabled = this.state.page === 1;
    prev.addEventListener('click', () => {
      if (this.state.page > 1) {
        this.state.page -= 1;
        this.renderRows();
        this.renderPagination();
      }
    });
    const next = document.createElement('button');
    next.type = 'button';
    next.textContent = '›';
    next.disabled = this.state.page >= totalPages;
    next.addEventListener('click', () => {
      if (this.state.page < totalPages) {
        this.state.page += 1;
        this.renderRows();
        this.renderPagination();
      }
    });
    this.pagination.append(prev, info, next);
  }

  exportCsv() {
    const rows = this.filterData();
    const headers = this.columns.map((col) => t(col.label || col.key));
    const csvContent = [headers]
      .concat(
        rows.map((row) =>
          this.columns
            .map((col) => {
              const value = row[col.key];
              if (col.type === 'currency') return formatCurrency(value);
              if (col.type === 'date') return formatDate(value);
              if (col.render) {
                const rendered = col.render(row);
                if (typeof rendered === 'string') {
                  return rendered.replace(/<[^>]+>/g, '').trim();
                }
                return '';
              }
              return sanitize(value ?? '');
            })
            .join(';'),
        ),
      )
      .join('\n');
    const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `export-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  render(container) {
    this.wrapper = container || document.createElement('div');
    this.wrapper.classList.add('card');
    const controls = document.createElement('div');
    controls.classList.add('flex-row');
    if (this.searchable) {
      const search = document.createElement('input');
      search.type = 'search';
      search.placeholder = t('table.search');
      search.addEventListener('input', (event) => {
        this.state.query = event.target.value;
        this.state.page = 1;
        this.renderRows();
        this.renderPagination();
      });
      controls.appendChild(search);
    }
    if (this.exportable) {
      const exportBtn = document.createElement('button');
      exportBtn.className = 'btn secondary';
      exportBtn.type = 'button';
      exportBtn.textContent = t('table.export');
      exportBtn.addEventListener('click', () => this.exportCsv());
      controls.appendChild(exportBtn);
    }
    this.wrapper.appendChild(controls);

    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'table-wrapper';
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    this.columns.forEach((col) => tr.appendChild(this.createHeaderCell(col)));
    thead.appendChild(tr);
    this.tbody = document.createElement('tbody');
    table.append(thead, this.tbody);
    tableWrapper.appendChild(table);
    this.wrapper.appendChild(tableWrapper);

    this.emptyState = document.createElement('p');
    this.emptyState.className = 'muted';
    this.emptyState.hidden = true;
    this.wrapper.appendChild(this.emptyState);

    this.pagination = document.createElement('div');
    this.pagination.className = 'flex-row';
    this.wrapper.appendChild(this.pagination);

    this.renderRows();
    this.renderPagination();
    return this.wrapper;
  }
}
