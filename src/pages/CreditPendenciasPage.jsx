import { useEffect, useMemo, useState } from 'react'
import { FaSave } from 'react-icons/fa'
import AutoDateTimeNotice from '../components/AutoDateTimeNotice'
import AutoLoggedUserField, { getLoggedUserName } from '../components/AutoLoggedUserField'
import { getLocalDateTimeNow } from '../utils/datetime'
import { ensureSinistroDemoProcess, getCreditPendingProcesses, upsertCreditControl } from '../utils/processes'

const PAGE_SIZE = 5

export default function CreditPendenciasPage() {
  const [version, setVersion] = useState(0)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState('')
  const [premioPago, setPremioPago] = useState('Sim')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const created = ensureSinistroDemoProcess()
    if (created) setVersion((value) => value + 1)
  }, [])

  const pendencias = useMemo(() => getCreditPendingProcesses(), [version])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return pendencias
    return pendencias.filter((item) =>
      `${item.numeroSinistro} ${item.cliente} ${item.matricula}`.toLowerCase().includes(q),
    )
  }, [pendencias, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, currentPage])

  const selectProcess = (id) => {
    setSelectedId(id)
    setMessage('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!selectedId) {
      setMessage('Selecione uma pendência para atualizar.')
      return
    }
    const confirmadoEm = getLocalDateTimeNow()
    const updated = upsertCreditControl(selectedId, {
      premioPago,
      dataPagamento: confirmadoEm,
      responsavelCredit: getLoggedUserName(),
      dataRegistoCredit: confirmadoEm,
    })
    if (!updated) {
      setMessage('Não foi possível atualizar a pendência.')
      return
    }
    setVersion((value) => value + 1)
    setSelectedId('')
    setPremioPago('Sim')
    setMessage(
      `Pendência atualizada com sucesso: ${updated.numeroSinistro} (${updated.status}).`,
    )
  }

  return (
    <div className="form-page users-page">
      <h1 className="dash-title">Pendências</h1>
      <p className="form-subtitle">Credit Control valida prémio e encaminha o processo no fluxo.</p>

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

      <div className="table users-table credit-pendencias-table">
        <div className="tr th">
          <div>Nº Sinistro</div>
          <div>Cliente</div>
          <div>Status</div>
          <div>Ações</div>
        </div>
        {paged.map((item) => (
          <div key={item.id} className={`tr credit-row ${selectedId === item.id ? 'tr-selected' : ''}`}>
            <div className="td-strong credit-col credit-col-ref" title={item.numeroSinistro}>{item.numeroSinistro}</div>
            <div className="credit-col">{item.cliente}</div>
            <div className="credit-col">
              <span className="pill iniciado">Aguardando Credit</span>
            </div>
            <div className="action-buttons">
              <button type="button" className="btn-table" onClick={() => selectProcess(item.id)}>
                Selecionar
              </button>
            </div>
          </div>
        ))}
        {paged.length === 0 && (
          <div className="tr">
            <div>Sem pendências para Credit Control.</div>
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

      <form className="form-card form-card--wide sinistro-create-grid" onSubmit={handleSubmit}>
        <div className="form-section-title field-full">Validação de Prémio</div>

        <label className="field-group select-group">
          <span className="field-label">Prémio pago?</span>
          <select value={premioPago} onChange={(event) => setPremioPago(event.target.value)}>
            <option value="Sim">Sim</option>
            <option value="Não">Não</option>
          </select>
        </label>

        <AutoDateTimeNotice label="Data de pagamento e registo" />

        <AutoLoggedUserField label="Nome do responsável" />

        <button type="submit" className="primary-btn form-btn field-full">
          <FaSave />
          Guardar validação
        </button>

        {message && (
          <p className={`form-message field-full ${message.includes('Não foi') ? 'form-message--error' : ''}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  )
}

