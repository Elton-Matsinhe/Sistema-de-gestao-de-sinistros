import { useEffect, useMemo, useState } from 'react'
import { FaCalendarAlt, FaCheckCircle, FaDownload, FaFileAlt, FaHashtag, FaUserTie, FaWallet } from 'react-icons/fa'
import { ensureSinistroDemoProcess, getContabilidadePaidProcesses } from '../utils/processes'

const PAGE_SIZE = 5

export default function ContabilidadePagosPage() {
  const [version, setVersion] = useState(0)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const processes = useMemo(() => getContabilidadePaidProcesses(), [version])

  useEffect(() => {
    const created = ensureSinistroDemoProcess()
    if (created) setVersion((value) => value + 1)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return processes
    return processes.filter((item) =>
      `${item.numeroSinistro} ${item.cliente} ${item.matricula}`.toLowerCase().includes(q),
    )
  }, [processes, query])
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [currentPage, filtered])

  return (
    <div className="form-page users-page">
      <h1 className="dash-title">Contabilidade - Pagos</h1>
      <p className="form-subtitle">Processos com pagamento concluído e comprovativo anexado.</p>

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

      <div className="table users-table credit-premium-table contabilidade-pagos-table">
        <div className="tr th">
          <div><span className="juridico-th-label"><FaHashtag /> Nº Sinistro</span></div>
          <div><span className="juridico-th-label"><FaUserTie /> Cliente</span></div>
          <div><span className="juridico-th-label"><FaUserTie /> Anexado por</span></div>
          <div><span className="juridico-th-label"><FaCalendarAlt /> Data Comprovativo</span></div>
          <div><span className="juridico-th-label"><FaFileAlt /> Comprovativo</span></div>
          <div><span className="juridico-th-label"><FaWallet /> Status</span></div>
        </div>
        {paged.map((item) => (
          <div key={item.id} className="tr credit-row">
            <div className="td-strong credit-col">{item.numeroSinistro}</div>
            <div className="credit-col">{item.cliente}</div>
            <div className="credit-col">{item.comprovativoPagamentoPor || '--'}</div>
            <div className="credit-col">{item.comprovativoPagamentoData || '--'}</div>
            <div className="credit-col">
              {item.comprovativoPagamentoDocumento?.dataUrl ? (
                <a
                  className="btn-table"
                  href={item.comprovativoPagamentoDocumento.dataUrl}
                  download={item.comprovativoPagamentoDocumento.nome || 'comprovativo'}
                >
                  <FaDownload />
                  Baixar
                </a>
              ) : (
                '--'
              )}
            </div>
            <div className="credit-col">
              <span className="pill finalizado">
                <FaCheckCircle />
                Pago
              </span>
            </div>
          </div>
        ))}
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

