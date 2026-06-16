import { useMemo, useState } from 'react'
import {
  FaChevronLeft,
  FaChevronRight,
  FaEdit,
  FaEye,
  FaPen,
  FaPrint,
  FaSearch,
  FaTrash,
} from 'react-icons/fa'

const PAGE_SIZE = 5

export default function PeritagemDataTable({
  title,
  titleIcon,
  columns,
  rows,
  filterPlaceholder = 'Pesquisar...',
  emptyMessage = 'Sem registos.',
  onView,
  onEdit,
  onDelete,
  onPrint,
  onCustomAction,
  customActionLabel,
  customActionIcon,
  canEdit = () => true,
  canDelete = () => true,
  showView = true,
  showEdit = true,
  showDelete = true,
  showPrint = true,
}) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) =>
      columns.some((col) => {
        const val = col.render ? col.render(row) : row[col.key]
        return String(val ?? '').toLowerCase().includes(q)
      }),
    )
  }, [rows, query, columns])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, currentPage])

  const hasActions = showView || showEdit || showDelete || showPrint || onCustomAction
  const colCount = columns.length + (hasActions ? 1 : 0)

  return (
    <section className="peritagem-data-table-section">
      <div className="peritagem-data-table__head">
        <h3>
          {titleIcon && <span className="peritagem-data-table__title-icon">{titleIcon}</span>}
          {title}
        </h3>
        <label className="peritagem-data-table__filter">
          <FaSearch aria-hidden="true" />
          <input
            type="text"
            placeholder={filterPlaceholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
          />
        </label>
      </div>

      <div className={`table users-table peritagem-premium-table peritagem-premium-table--${colCount}`}>
        <div className="tr th">
          {columns.map((col) => (
            <div key={col.key} className="peritagem-td-nowrap">
              <span className="peritagem-th-label">
                {col.icon}
                <span>{col.label}</span>
              </span>
            </div>
          ))}
          {hasActions && (
            <div className="peritagem-td-actions">
              <span className="peritagem-th-label">
                <FaPen />
                <span>Ações</span>
              </span>
            </div>
          )}
        </div>

        {paged.map((row) => (
          <div key={row.id} className="tr credit-row peritagem-data-row">
            {columns.map((col) => (
              <div
                key={`${row.id}-${col.key}`}
                className={`peritagem-td-nowrap ${col.strong ? 'td-strong' : ''}`}
                title={col.render ? String(col.render(row) ?? '') : String(row[col.key] ?? '')}
              >
                {col.render ? col.render(row) : row[col.key] || '—'}
              </div>
            ))}
            {hasActions && (
              <div className="peritagem-td-actions">
                <div className="peritagem-action-group">
                  {showView && onView && (
                    <button type="button" className="peritagem-action-btn peritagem-action-btn--view" title="Visualizar" onClick={() => onView(row)}>
                      <FaEye />
                    </button>
                  )}
                  {showEdit && onEdit && canEdit(row) && (
                    <button type="button" className="peritagem-action-btn peritagem-action-btn--edit" title="Editar" onClick={() => onEdit(row)}>
                      <FaEdit />
                    </button>
                  )}
                  {showPrint && onPrint && (
                    <button type="button" className="peritagem-action-btn peritagem-action-btn--print" title="Imprimir" onClick={() => onPrint(row)}>
                      <FaPrint />
                    </button>
                  )}
                  {showDelete && onDelete && canDelete(row) && (
                    <button type="button" className="peritagem-action-btn peritagem-action-btn--delete" title="Eliminar" onClick={() => onDelete(row)}>
                      <FaTrash />
                    </button>
                  )}
                  {onCustomAction && (
                    <button type="button" className="peritagem-action-btn peritagem-action-btn--custom" title={customActionLabel} onClick={() => onCustomAction(row)}>
                      {customActionIcon}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {paged.length === 0 && (
          <div className="tr peritagem-empty-row">
            <div className="peritagem-td-nowrap">{emptyMessage}</div>
          </div>
        )}
      </div>

      <div className="users-pagination peritagem-pagination">
        <button type="button" className="btn-table" disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          <FaChevronLeft /> Anterior
        </button>
        <span>Página {currentPage} de {totalPages} ({filtered.length} registos)</span>
        <button type="button" className="btn-table" disabled={currentPage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
          Seguinte <FaChevronRight />
        </button>
      </div>
    </section>
  )
}
