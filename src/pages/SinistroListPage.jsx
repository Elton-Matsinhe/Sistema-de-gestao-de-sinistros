import { useEffect, useMemo, useState } from 'react'
import { FaEdit, FaFileAlt, FaSearch } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { ensureSinistroDemoProcess, getProcesses } from '../utils/processes'

const PAGE_SIZE = 5

export default function SinistroListPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0)
  const processes = useMemo(() => getProcesses(), [version])

  useEffect(() => {
    const created = ensureSinistroDemoProcess()
    if (created) setVersion((value) => value + 1)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return processes.filter((item) => {
      const statusOk = status === 'all' ? true : item.status === status
      const searchOk = !q
        ? true
        : `${item.numeroSinistro} ${item.cliente} ${item.matricula}`.toLowerCase().includes(q)
      return statusOk && searchOk
    })
  }, [processes, query, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [currentPage, filtered])

  return (
    <div className="form-page users-page">
      <h1 className="dash-title">Listar Processo</h1>
      <p className="form-subtitle">Tabela de processos com filtros, paginação e ações rápidas.</p>

      <div className="filter-tabs">
        {['all', 'Iniciado', 'Em andamento', 'Finalizado', 'Encerrado'].map((item) => (
          <button
            key={item}
            type="button"
            className={`tab-btn ${status === item ? 'active' : ''}`}
            onClick={() => {
              setStatus(item)
              setPage(1)
            }}
          >
            <span>{item === 'all' ? 'Todos' : item}</span>
          </button>
        ))}
      </div>

      <div className="users-filter-box">
        <label className="field-group">
          <FaSearch className="field-icon" />
          <input
            type="text"
            placeholder="Pesquisar por nº sinistro, cliente ou matrícula"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
          />
        </label>
      </div>

      <div className="table users-table">
        <div className="tr th">
          <div>Nº Sinistro</div>
          <div>Cliente</div>
          <div>Status</div>
          <div>Ações</div>
        </div>

        {paged.map((item) => (
          <div key={item.id} className="tr">
            <div className="td-strong">{item.numeroSinistro}</div>
            <div>{item.cliente}</div>
            <div>
              <span className={`pill ${String(item.status || 'Iniciado').toLowerCase().replace(' ', '')}`}>
                {item.status || 'Iniciado'}
              </span>
            </div>
            <div className="action-buttons">
              <button
                type="button"
                className="btn-table icon-only"
                title="Editar processo"
                onClick={() => navigate(`/Sinistro/Editar?id=${encodeURIComponent(item.id)}`)}
              >
                <FaEdit />
              </button>
              <button
                type="button"
                className="btn-table icon-only"
                title="Gerir fluxo"
                onClick={() => navigate(`/Sinistro/Fluxo?id=${encodeURIComponent(item.id)}`)}
              >
                <FaFileAlt />
              </button>
            </div>
          </div>
        ))}

        {paged.length === 0 && (
          <div className="tr">
            <div>Nenhum processo encontrado.</div>
            <div />
            <div />
            <div />
          </div>
        )}
      </div>

      <div className="users-pagination">
        <button type="button" className="btn-table" disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Anterior
        </button>
        <span>Página {currentPage} de {totalPages}</span>
        <button type="button" className="btn-table" disabled={currentPage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
          Seguinte
        </button>
      </div>
    </div>
  )
}

