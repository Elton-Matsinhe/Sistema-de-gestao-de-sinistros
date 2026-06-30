import { useMemo, useState } from 'react'
import {
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaEdit,
  FaPaperPlane,
  FaPrint,
  FaSearch,
  FaTrash,
} from 'react-icons/fa'

const PAGE_SIZE = 10

const COL_MIN_WIDTH = {
  numeroSinistro: '130px',
  cliente: '200px',
  matricula: '120px',
  tiposFormulario: '160px',
  status: '110px',
  criadoEm: '170px',
  actions: '200px',
}

export default function ParticipacaoDataTable({
  title,
  titleIcon,
  columns,
  rows,
  filterFields = [],
  emptyMessage = 'Sem participações registadas.',
  onEdit,
  onDelete,
  onPrint,
  onDownload,
  onSend,
}) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({})
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let result = rows
    const q = query.trim().toLowerCase()
    if (q) {
      result = result.filter((row) =>
        columns.some((col) => {
          const val = col.render ? col.render(row) : row[col.key]
          return String(val ?? '').toLowerCase().includes(q)
        }),
      )
    }
    filterFields.forEach((ff) => {
      const val = filters[ff.key]
      if (val) {
        result = result.filter((row) => {
          const cell = ff.render ? ff.render(row) : row[ff.key]
          return String(cell ?? '') === val
        })
      }
    })
    return result
  }, [rows, query, columns, filters, filterFields])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, currentPage])

  return (
    <section className="participacao-list-table-section">
      <div className="participacao-list-table__head">
        <h3>
          {titleIcon && <span className="participacao-list-table__title-icon">{titleIcon}</span>}
          {title}
        </h3>
        <div className="participacao-table-filters">
          {filterFields.map((ff) => (
            <label key={ff.key} className="participacao-filter-chip">
              <span>{ff.label}</span>
              <select
                value={filters[ff.key] || ''}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, [ff.key]: e.target.value }))
                  setPage(1)
                }}
              >
                <option value="">Todos</option>
                {(ff.options || []).map((opt) => (
                  <option key={opt} value={opt}>
                    {ff.optionLabels?.[opt] || opt}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <label className="participacao-list-table__search">
            <FaSearch aria-hidden="true" />
            <input
              type="text"
              placeholder="Pesquisar participações..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
            />
          </label>
        </div>
      </div>

      <div className="participacao-table-scroll">
        <table className="participacao-list-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ minWidth: COL_MIN_WIDTH[col.key] || '140px' }}>
                  <span className="participacao-list-th">
                    {col.icon}
                    <span>{col.label}</span>
                  </span>
                </th>
              ))}
              <th style={{ minWidth: COL_MIN_WIDTH.actions }}>
                <span className="participacao-list-th">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => (
              <tr key={row.id}>
                {columns.map((col) => (
                  <td key={`${row.id}-${col.key}`} className={col.strong ? 'is-strong' : ''}>
                    <span className="participacao-list-cell">
                      {col.render ? col.render(row) : row[col.key] || '—'}
                    </span>
                  </td>
                ))}
                <td>
                  <div className="participacao-list-actions">
                    {onEdit && (
                      <button type="button" className="participacao-list-action participacao-list-action--edit" title="Editar" onClick={() => onEdit(row)}>
                        <FaEdit />
                      </button>
                    )}
                    {onPrint && (
                      <button type="button" className="participacao-list-action participacao-list-action--print" title="Imprimir" onClick={() => onPrint(row)}>
                        <FaPrint />
                      </button>
                    )}
                    {onDownload && (
                      <button type="button" className="participacao-list-action participacao-list-action--download" title="Baixar" onClick={() => onDownload(row)}>
                        <FaDownload />
                      </button>
                    )}
                    {onSend && (
                      <button type="button" className="participacao-list-action participacao-list-action--send" title="Enviar" onClick={() => onSend(row)}>
                        <FaPaperPlane />
                      </button>
                    )}
                    {onDelete && (
                      <button type="button" className="participacao-list-action participacao-list-action--delete" title="Eliminar" onClick={() => onDelete(row)}>
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="participacao-list-empty">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="users-pagination peritagem-pagination">
        <button type="button" className="btn-table" disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          <FaChevronLeft /> Anterior
        </button>
        <span>Página {currentPage} de {totalPages} ({filtered.length} participações)</span>
        <button type="button" className="btn-table" disabled={currentPage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
          Seguinte <FaChevronRight />
        </button>
      </div>
    </section>
  )
}
