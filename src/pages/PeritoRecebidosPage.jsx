import { useEffect, useMemo, useState } from 'react'
import { FaCheckCircle, FaFileUpload, FaSearch } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import {
  ensureSinistroDemoProcess,
  getPeritoCompletedProcesses,
  getPeritoPendingProcesses,
} from '../utils/processes'

const PAGE_SIZE = 5

export default function PeritoRecebidosPage() {
  const navigate = useNavigate()
  const [version, setVersion] = useState(0)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const pendingProcesses = useMemo(() => getPeritoPendingProcesses(), [version])
  const completedProcesses = useMemo(() => getPeritoCompletedProcesses(), [version])

  useEffect(() => {
    const created = ensureSinistroDemoProcess()
    if (created) setVersion((value) => value + 1)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return pendingProcesses
    return pendingProcesses.filter((item) =>
      `${item.numeroSinistro} ${item.cliente} ${item.matricula}`.toLowerCase().includes(q),
    )
  }, [pendingProcesses, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, currentPage])

  return (
    <div className="form-page users-page">
      <h1 className="dash-title">Processos Recebidos</h1>
      <p className="form-subtitle">Veja os processos recebidos e preencha o formulário digital de peritagem.</p>

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

      <div className="table users-table credit-premium-table">
        <div className="tr th">
          <div>Nº Sinistro</div>
          <div>Cliente</div>
          <div>Perito</div>
          <div>Ações</div>
        </div>

        {paged.map((item) => (
          <div key={item.id} className="tr credit-row">
            <div className="td-strong credit-col">{item.numeroSinistro}</div>
            <div className="credit-col">{item.cliente}</div>
            <div className="credit-col">{item.peritoNome || 'Edmilson'}</div>
            <div className="action-buttons">
              <button
                type="button"
                className="btn-table"
                onClick={() => navigate(`/Perito/Upload?id=${encodeURIComponent(item.id)}`)}
              >
                <FaFileUpload />
                Preencher
              </button>
            </div>
          </div>
        ))}

        {paged.length === 0 && (
          <div className="tr">
            <div>Sem processos solicitados para peritagem.</div>
            <div />
            <div />
            <div />
          </div>
        )}
      </div>

      <div className="table users-table credit-premium-table" style={{ marginTop: '1rem' }}>
        <div className="tr th">
          <div>Nº Sinistro</div>
          <div>Cliente</div>
          <div>Data Envio</div>
          <div>Status</div>
        </div>
        {completedProcesses.map((item) => (
          <div key={`completed-${item.id}`} className="tr credit-row">
            <div className="td-strong credit-col">{item.numeroSinistro}</div>
            <div className="credit-col">{item.cliente}</div>
            <div className="credit-col">{item.peritagemEnviadoData || item.peritagemData || '--'}</div>
            <div className="credit-col" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <FaCheckCircle />
              Relatório enviado
            </div>
          </div>
        ))}
        {completedProcesses.length === 0 && (
          <div className="tr">
            <div>Sem uploads concluídos até o momento.</div>
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

