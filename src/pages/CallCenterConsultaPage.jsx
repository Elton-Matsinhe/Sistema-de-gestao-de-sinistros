import { useEffect, useMemo, useState } from 'react'
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaFileAlt,
  FaFilter,
  FaHashtag,
  FaHistory,
  FaIdCard,
  FaSearch,
  FaUserTie,
} from 'react-icons/fa'
import { ensureSinistroDemoProcess, getHistory, getProcesses } from '../utils/processes'

const PAGE_SIZE = 8

function formatDate(value) {
  if (!value) return '--'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('pt-PT')
}

function processPhases(item) {
  return [
    { id: '1', label: 'Sinistro abriu processo', done: Boolean(item?.numeroSinistro), detail: 'Registo inicial do sinistro' },
    { id: '2', label: 'Credit validou prémio', done: Boolean(item?.premioPago), detail: item?.premioPago ? `Prémio: ${item.premioPago}` : 'Aguardando validação' },
    { id: '3', label: 'Perito enviou relatório', done: Boolean(item?.peritagemEnviado || item?.peritagemRelatorio), detail: item?.peritagemEnviado ? 'Relatório recebido' : 'Aguardando relatório' },
    { id: '4', label: 'Sinistro enviou ordem/quitação', done: Boolean(item?.ordemReparacaoDocumento), detail: item?.ordemReparacaoDocumento ? 'Documento preparado' : 'Aguardando documento' },
    { id: '5', label: 'Gestor assinou digitalmente', done: Boolean(item?.gestorAssinadoDocumento), detail: item?.gestorAssinadoDocumento ? 'Assinatura concluída' : 'Aguardando assinatura' },
    { id: '6', label: 'Processo enviado à Contabilidade', done: Boolean(item?.enviadoContabilidade), detail: item?.enviadoContabilidade ? 'Em processamento financeiro' : 'Aguardando envio' },
    { id: '7', label: 'Comprovativo de pagamento', done: Boolean(item?.comprovativoPagamentoDocumento), detail: item?.comprovativoPagamentoDocumento ? 'Pagamento comprovado' : 'Aguardando comprovativo' },
    { id: '8', label: 'Fecho do processo', done: item?.status === 'Finalizado' || item?.status === 'Encerrado', detail: item?.status === 'Encerrado' ? 'Encerrado com atuação jurídica' : item?.status === 'Finalizado' ? 'Finalizado com sucesso' : 'Em andamento' },
  ]
}

function buildCallCenterSummary(process, historyItems) {
  if (!process) return ''
  const lastHistory = historyItems[0]
  const status = process.status || 'Iniciado'
  const ultimaAtualizacao = process.updatedAt
    ? new Date(process.updatedAt).toLocaleString('pt-PT')
    : '--'

  let proximaEtapa = 'Acompanhar atualização do departamento responsável.'
  if (status === 'Iniciado') proximaEtapa = 'Aguardar validação inicial no Credit Control.'
  if (status === 'Em andamento' && process.premioPago === 'Sim' && !process.peritagemRelatorio) {
    proximaEtapa = 'Aguardar upload do relatório pelo Perito.'
  } else if (status === 'Em andamento' && process.peritagemRelatorio && !process.ordemReparacaoDocumento) {
    proximaEtapa = 'Aguardar emissão da ordem/quitação pelo Sinistro.'
  } else if (status === 'Em andamento' && process.ordemReparacaoDocumento && !process.gestorAssinadoDocumento) {
    proximaEtapa = 'Aguardar assinatura digital do Gestor.'
  } else if (status === 'Em andamento' && process.gestorAssinadoDocumento && !process.enviadoContabilidade) {
    proximaEtapa = 'Aguardar envio para Contabilidade pelo Sinistro.'
  } else if (status === 'Em andamento' && process.enviadoContabilidade && !process.comprovativoPagamentoDocumento) {
    proximaEtapa = 'Aguardar comprovativo de pagamento da Contabilidade.'
  } else if (status === 'Finalizado') {
    proximaEtapa = 'Processo finalizado, sem pendências operacionais.'
  } else if (status === 'Encerrado') {
    proximaEtapa = 'Processo encerrado com atuação jurídica.'
  }

  return [
    `Status atual: ${status}.`,
    `Última atualização: ${ultimaAtualizacao}.`,
    lastHistory ? `Último registo: ${lastHistory.acao}.` : 'Sem registos recentes no histórico.',
    `Próxima etapa prevista: ${proximaEtapa}`,
  ].join(' ')
}

export default function CallCenterConsultaPage() {
  const [version, setVersion] = useState(0)
  const [query, setQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState('')

  const processes = useMemo(() => getProcesses(), [version])
  const history = useMemo(() => getHistory(), [version])

  useEffect(() => {
    const created = ensureSinistroDemoProcess()
    if (created) setVersion((value) => value + 1)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return processes.filter((item) => {
      const byStatus = statusFilter === 'all' ? true : item.status === statusFilter
      const byText = !q
        ? true
        : `${item.numeroApolice || ''} ${item.cliente || ''} ${item.matricula || ''} ${item.numeroSinistro || ''}`
            .toLowerCase()
            .includes(q)
      const byDate = !dateFilter
        ? true
        : item.dataAcidente === dateFilter ||
          item.dataNotificacao === dateFilter ||
          item.dataFactura === dateFilter ||
          item.comprovativoPagamentoData === dateFilter ||
          item.juridicoDataCarta === dateFilter
      return byStatus && byText && byDate
    })
  }, [dateFilter, processes, query, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [currentPage, filtered])

  const selected = useMemo(() => processes.find((item) => item.id === selectedId) || null, [processes, selectedId])
  const selectedHistory = useMemo(
    () => history.filter((item) => item.processoId === selectedId),
    [history, selectedId],
  )
  const resumoAtendimento = useMemo(
    () => buildCallCenterSummary(selected, selectedHistory),
    [selected, selectedHistory],
  )

  return (
    <div className="form-page users-page">
      <h1 className="dash-title">Call Center - Consulta</h1>
      <p className="form-subtitle">
        Painel de atendimento rápido em modo leitura para informar o cliente sobre o estágio exato do processo.
      </p>

      <div className="users-filter-box">
        <label className="field-group">
          <FaSearch className="field-icon" />
          <input
            type="text"
            placeholder="Pesquisar por nº apólice, nome, matrícula ou nº sinistro"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
          />
        </label>
      </div>

      <div className="sinistro-create-grid" style={{ marginBottom: '0.8rem' }}>
        <label className="field-group">
          <FaCalendarAlt className="field-icon" />
          <input type="date" value={dateFilter} onChange={(event) => { setDateFilter(event.target.value); setPage(1) }} />
        </label>
        <label className="field-group select-group">
          <span className="field-label">Status</span>
          <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1) }}>
            {['all', 'Iniciado', 'Em andamento', 'Finalizado', 'Encerrado'].map((status) => (
              <option key={status} value={status}>{status === 'all' ? 'Todos' : status}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="table users-table credit-premium-table">
        <div className="tr th">
          <div><span className="juridico-th-label"><FaIdCard /> Nº Apólice</span></div>
          <div><span className="juridico-th-label"><FaUserTie /> Cliente</span></div>
          <div><span className="juridico-th-label"><FaHashtag /> Matrícula</span></div>
          <div><span className="juridico-th-label"><FaFilter /> Status</span></div>
          <div><span className="juridico-th-label"><FaFileAlt /> Consulta</span></div>
        </div>
        {paged.map((item) => (
          <div key={item.id} className={`tr credit-row ${selectedId === item.id ? 'tr-selected' : ''}`}>
            <div className="td-strong credit-col">{item.numeroApolice || '--'}</div>
            <div className="credit-col">{item.cliente}</div>
            <div className="credit-col">{item.matricula}</div>
            <div className="credit-col">
              <span className={`pill ${String(item.status || 'Iniciado').toLowerCase().replace(' ', '')}`}>{item.status || 'Iniciado'}</span>
            </div>
            <div className="action-buttons">
              <button type="button" className="btn-table" onClick={() => setSelectedId(item.id)}>
                Ver detalhe
              </button>
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

      {selected && (
        <section className="sinistro-flow-section history-section" style={{ marginTop: '1rem' }}>
          <h2 className="sinistro-flow-heading">Consulta Detalhada (Somente leitura)</h2>
          <p className="form-subtitle">{selected.numeroSinistro} • {selected.cliente} • Apólice {selected.numeroApolice || '--'}</p>

          <article className="form-card form-card--wide" style={{ maxWidth: '100%', marginBottom: '0.7rem' }}>
            <div className="form-section-title">Resumo para resposta ao cliente</div>
            <p className="form-subtitle" style={{ marginBottom: 0 }}>
              {resumoAtendimento}
            </p>
          </article>

          <div className="sinistro-history-summary" style={{ marginBottom: '0.8rem' }}>
            <article className="sinistro-history-summary-card">
              <span>Status Atual</span>
              <strong>{selected.status || 'Iniciado'}</strong>
              <span>{selected.enviadoContabilidade ? 'Contabilidade ativa' : 'Fluxo operacional'}</span>
            </article>
            <article className="sinistro-history-summary-card">
              <span>Sinistro</span>
              <strong>{selected.numeroSinistro || '--'}</strong>
              <span>{selected.matricula || '--'}</span>
            </article>
            <article className="sinistro-history-summary-card">
              <span>Última Atualização</span>
              <strong>{formatDate(selected.updatedAt)}</strong>
              <span>{selected.comprovativoPagamentoDocumento ? 'Pagamento registado' : 'Aguardando próxima etapa'}</span>
            </article>
          </div>

          <div className="sinistro-history-summary">
            {processPhases(selected).map((phase) => (
              <article key={phase.id} className="sinistro-history-summary-card">
                <span>Fase {phase.id}</span>
                <strong>{phase.label}</strong>
                <span>{phase.detail}</span>
                <span className={`pill ${phase.done ? 'finalizado' : 'iniciado'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FaCheckCircle style={{ fontSize: '0.74rem' }} />
                  {phase.done ? 'Concluída' : 'Pendente'}
                </span>
              </article>
            ))}
          </div>

          <div className="table users-table history-detail-table">
            <div className="tr th">
              <div>Data</div>
              <div>Ação</div>
              <div>Utilizador</div>
              <div>Ref</div>
            </div>
            {selectedHistory.map((item) => (
              <div key={item.id} className="tr history-row">
                <div className="history-col">{formatDate(item.data)}</div>
                <div className="history-col">{item.acao}</div>
                <div className="history-col">{item.usuario}</div>
                <div className="history-col">{item.processoId}</div>
              </div>
            ))}
            {selectedHistory.length === 0 && (
              <div className="tr">
                <div>Sem histórico.</div>
                <div />
                <div />
                <div />
              </div>
            )}
          </div>
          <p className="form-subtitle" style={{ marginTop: '0.8rem' }}>
            <FaHistory /> Call Center não pode editar processos. Apenas consulta e resposta ao cliente.
          </p>
        </section>
      )}
    </div>
  )
}

