import { useEffect, useMemo, useState } from 'react'
import { FaCheckCircle, FaFilter, FaTimesCircle } from 'react-icons/fa'
import { getCreditReceivedProcesses, ensureSinistroDemoProcess } from '../utils/processes'

const PAGE_SIZE = 5

function paymentLabel(value) {
  if (value === 'Sim') return 'Pago'
  if (value === 'Não') return 'Não pago'
  return 'Pendente'
}

export default function CreditProcessosPage() {
  const [version, setVersion] = useState(0)
  const [mode, setMode] = useState('todos')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const processes = useMemo(() => getCreditReceivedProcesses(), [version])

  useEffect(() => {
    const created = ensureSinistroDemoProcess()
    if (created) setVersion((value) => value + 1)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return processes.filter((item) => {
      const modeOk =
        mode === 'todos'
          ? true
          : mode === 'pendente'
            ? !item.premioPago
            : mode === 'pago'
              ? item.premioPago === 'Sim'
              : item.premioPago === 'Não'
      const textOk = !q
        ? true
        : `${item.numeroSinistro} ${item.cliente} ${item.matricula}`.toLowerCase().includes(q)
      return modeOk && textOk
    })
  }, [mode, processes, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [currentPage, filtered])

  return (
    <div className="form-page users-page">
      <h1 className="dash-title">Processos Credit</h1>
      <p className="form-subtitle">Acompanhamento de processos recebidos do Sinistro com estado de prémio.</p>

      <div className="filter-tabs">
        <button type="button" className={`tab-btn ${mode === 'todos' ? 'active' : ''}`} onClick={() => { setMode('todos'); setPage(1) }}>
          <FaFilter />
          <span>Todos</span>
        </button>
        <button type="button" className={`tab-btn ${mode === 'pendente' ? 'active' : ''}`} onClick={() => { setMode('pendente'); setPage(1) }}>
          <span>Pendente</span>
        </button>
        <button type="button" className={`tab-btn ${mode === 'pago' ? 'active' : ''}`} onClick={() => { setMode('pago'); setPage(1) }}>
          <FaCheckCircle />
          <span>Pago</span>
        </button>
        <button type="button" className={`tab-btn ${mode === 'naopago' ? 'active' : ''}`} onClick={() => { setMode('naopago'); setPage(1) }}>
          <FaTimesCircle />
          <span>Não pago</span>
        </button>
      </div>

      <div className="users-filter-box">
        <input
          type="text"
          placeholder="Pesquisar por nº sinistro, cliente ou matrícula"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setPage(1)
          }}
        />
      </div>

      <div className="table users-table credit-premium-table">
        <div className="tr th">
          <div>Nº Sinistro</div>
          <div>Cliente</div>
          <div>Prémio</div>
          <div>Status Fluxo</div>
        </div>
        {paged.map((item) => (
          <div key={item.id} className="tr credit-row">
            <div className="td-strong credit-col credit-col-ref" title={item.numeroSinistro}>
              {item.numeroSinistro}
            </div>
            <div className="credit-col">{item.cliente}</div>
            <div className="credit-col">
              <span className={`pill ${item.premioPago === 'Sim' ? 'finalizado' : item.premioPago === 'Não' ? 'encerrado' : 'iniciado'}`}>
                {paymentLabel(item.premioPago)}
              </span>
            </div>
            <div className="credit-col">
              <span className={`pill ${String(item.status || 'Iniciado').toLowerCase().replace(' ', '')}`}>
                {item.status || 'Iniciado'}
              </span>
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

