import { FaChevronLeft, FaChevronRight, FaSearch } from 'react-icons/fa'

export default function SinistroProcessosDataTable({
  title,
  titleIcon,
  toolbar,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  showSearch = true,
  columns,
  rows,
  rowKey = 'id',
  selectedId,
  getRowRef,
  renderActions,
  emptyMessage = 'Nenhum processo encontrado.',
  pagination,
  pageSizeLabel = 'processos',
}) {
  const { currentPage, totalPages, totalCount, onPageChange } = pagination || {}

  return (
    <section className="sinistro-premium-table-section">
      {(title || showSearch || toolbar) && (
        <div className="sinistro-premium-table__head">
          {title && (
            <h3>
              {titleIcon && <span className="sinistro-premium-table__title-icon">{titleIcon}</span>}
              {title}
            </h3>
          )}
          <div className="sinistro-premium-table__toolbar">
            {toolbar}
            {showSearch && onSearchChange && (
              <label className="sinistro-premium-table__search">
                <FaSearch aria-hidden="true" />
                <input
                  type="text"
                  placeholder={searchPlaceholder || 'Pesquisar...'}
                  value={searchValue || ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </label>
            )}
          </div>
        </div>
      )}

      <div className="sinistro-premium-table-scroll">
        <table className="sinistro-premium-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ minWidth: col.minWidth || '140px' }}>
                  <span className="sinistro-premium-th">
                    {col.icon}
                    <span>{col.label}</span>
                  </span>
                </th>
              ))}
              {renderActions && (
                <th style={{ minWidth: '160px' }}>
                  <span className="sinistro-premium-th">Ações</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const id = row[rowKey]
              const isSelected = selectedId != null && selectedId === id
              return (
                <tr
                  key={id}
                  ref={getRowRef?.(row, isSelected) || undefined}
                  className={isSelected ? 'is-selected' : ''}
                >
                  {columns.map((col) => (
                    <td key={`${id}-${col.key}`} className={col.strong ? 'is-strong' : ''}>
                      <span className="sinistro-premium-cell">
                        {col.render ? col.render(row) : row[col.key] ?? '—'}
                      </span>
                    </td>
                  ))}
                  {renderActions && (
                    <td>
                      <div className="sinistro-premium-actions">{renderActions(row)}</div>
                    </td>
                  )}
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + (renderActions ? 1 : 0)} className="sinistro-premium-empty">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="users-pagination sinistro-premium-pagination">
          <button
            type="button"
            className="btn-table"
            disabled={currentPage === 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          >
            <FaChevronLeft /> Anterior
          </button>
          <span>
            Página {currentPage} de {totalPages}
            {totalCount != null ? ` (${totalCount} ${pageSizeLabel})` : ''}
          </span>
          <button
            type="button"
            className="btn-table"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          >
            Seguinte <FaChevronRight />
          </button>
        </div>
      )}
    </section>
  )
}
