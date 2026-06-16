import { useEffect, useMemo, useState } from 'react'
import { FaBalanceScale, FaCalendarAlt, FaCheckCircle, FaFilter, FaHashtag, FaSearch, FaUserTie } from 'react-icons/fa'
import { ensureSinistroDemoProcess, getJuridicoClosedProcesses } from '../utils/processes'

const PAGE_SIZE = 8

function formatDate(value) {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('pt-PT')
}

export default function JuridicoProcessosPage() {
  const [version, setVersion] = useState(0)
  const [query, setQuery] = useState('')
  const [motivoFilter, setMotivoFilter] = useState('all')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [page, setPage] = useState(1)

  const processos = useMemo(() => getJuridicoClosedProcesses(), [version])

  useEffect(() => {
    const created = ensureSinistroDemoProcess()
    if (created) setVersion((value) => value + 1)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const start = dataInicio ? new Date(`${dataInicio}T00:00:00`) : null
    const end = dataFim ? new Date(`${dataFim}T23:59:59`) : null

    return processos.filter((item) => {
      const byText = !q
        ? true
        : `${item.numeroSinistro} ${item.cliente} ${item.matricula}`.toLowerCase().includes(q)
      const byMotivo = motivoFilter === 'all' ? true : item.juridicoMotivo === motivoFilter
      const cartaDate = item.juridicoDataCarta ? new Date(`${item.juridicoDataCarta}T12:00:00`) : null
      const byDateStart = !start || (cartaDate && cartaDate >= start)
      const byDateEnd = !end || (cartaDate && cartaDate <= end)
      return byText && byMotivo && byDateStart && byDateEnd
    })
  }, [dataFim, dataInicio, motivoFilter, processos, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [currentPage, filtered])

  return (
    <div className="form-page users-page">
      <h1 className="dash-title">Jurídico - Processos Encerrados</h1>
      <p className="form-subtitle">
        Consulta completa dos processos encerrados com carta jurídica e respetivo motivo.
      </p>

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

      <div className="filter-tabs">
        <button type="button" className={`tab-btn ${motivoFilter === 'all' ? 'active' : ''}`} onClick={() => { setMotivoFilter('all'); setPage(1) }}>
          <FaFilter />
          <span>Todos motivos</span>
        </button>
        {['Não pagamento', 'Negligência', 'Repúdio'].map((motivo) => (
          <button
            key={motivo}
            type="button"
            className={`tab-btn ${motivoFilter === motivo ? 'active' : ''}`}
            onClick={() => {
              setMotivoFilter(motivo)
              setPage(1)
            }}
          >
            <FaBalanceScale />
            <span>{motivo}</span>
          </button>
        ))}
      </div>

      <div className="form-card" style={{ marginTop: '0.8rem' }}>
        <p className="form-subtitle" style={{ marginTop: 0, marginBottom: '0.5rem' }}>Filtrar por data da carta</p>
        <div className="sinistro-create-grid">
          <label className="field-group">
            <input
              type="date"
              value={dataInicio}
              onChange={(event) => {
                setDataInicio(event.target.value)
                setPage(1)
              }}
            />
          </label>
          <label className="field-group">
            <input
              type="date"
              value={dataFim}
              onChange={(event) => {
                setDataFim(event.target.value)
                setPage(1)
              }}
            />
          </label>
        </div>
      </div>

      <div className="table users-table credit-premium-table juridico-processos-table" style={{ marginTop: '0.9rem' }}>
        <div className="tr th">
          <div><span className="juridico-th-label"><FaHashtag /> Nº Sinistro</span></div>
          <div><span className="juridico-th-label"><FaUserTie /> Cliente</span></div>
          <div><span className="juridico-th-label"><FaBalanceScale /> Motivo</span></div>
          <div><span className="juridico-th-label"><FaCalendarAlt /> Data da Carta</span></div>
          <div><span className="juridico-th-label"><FaCheckCircle /> Status</span></div>
        </div>
        {paged.map((item) => (
          <div key={item.id} className="tr credit-row">
            <div className="td-strong credit-col">{item.numeroSinistro}</div>
            <div className="credit-col">{item.cliente}</div>
            <div className="credit-col">{item.juridicoMotivo || '--'}</div>
            <div className="credit-col">{formatDate(item.juridicoDataCarta)}</div>
            <div className="credit-col">
              <span className="pill encerrado">Encerrado</span>
            </div>
          </div>
        ))}
        {paged.length === 0 && (
          <div className="tr">
            <div>Nenhum processo encontrado.</div>
            <div />
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

