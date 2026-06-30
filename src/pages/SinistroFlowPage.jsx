import { useEffect, useMemo, useRef, useState } from 'react'
import { FaArrowRight, FaCheckCircle, FaClock, FaEdit, FaFileAlt, FaGavel, FaHashtag, FaHistory, FaProjectDiagram, FaSearchDollar, FaUserTie, FaWallet } from 'react-icons/fa'
import { useNavigate, useSearchParams } from 'react-router-dom'
import mammoth from 'mammoth'
import ReactFlow, { addEdge, Background, Controls, MiniMap, useEdgesState, useNodesState } from 'reactflow'
import 'reactflow/dist/style.css'
import PeritagemRelatorioPreview from '../components/peritagem/PeritagemRelatorioPreview'
import SinistroFilterChips from '../components/sinistro/SinistroFilterChips'
import SinistroProcessosDataTable from '../components/sinistro/SinistroProcessosDataTable'
import { ensureSinistroDemoProcess, getHistory, getProcesses, requestPeritagem } from '../utils/processes'

const FLOW_STEPS = [
  { title: 'Iniciado', detail: 'Sinistro cria o processo com dados base.', icon: <FaClock /> },
  { title: 'Credit Control', detail: 'Validação de prémio pago e registo.', icon: <FaSearchDollar /> },
  { title: 'Em andamento', detail: 'Peritagem, ordem de reparação e facturação.', icon: <FaArrowRight /> },
  { title: 'Finalizado', detail: 'Contabilidade anexa comprovativo.', icon: <FaCheckCircle /> },
  { title: 'Encerrado', detail: 'Jurídico emite carta quando necessário.', icon: <FaGavel /> },
]

const PAGE_SIZE = 5
const HISTORY_PAGE_SIZE = 5
const FLOW_NODE_COLOR = '#1f8f5f'

function getProgressPercent(item) {
  const steps = [
    Boolean(item?.ordemReparacaoDocumento),
    Boolean(item?.ordemReparacaoDataEdicao),
    Boolean(item?.ordemReparacaoDataDownload),
    Boolean(item?.ordemReparacaoAssinado),
    Boolean(item?.oficinaFacturacaoDocumento),
  ]
  return Math.round((steps.filter(Boolean).length / steps.length) * 100)
}

function getFinanceStatus(item) {
  if (item?.comprovativoPagamentoDocumento) return { label: 'Pago', className: 'finalizado' }
  if (item?.enviadoContabilidade) return { label: 'Aguardando contabilidade', className: 'emandamento' }
  if (item?.oficinaFacturacaoDocumento) return { label: 'Aguardando envio à contabilidade', className: 'iniciado' }
  return { label: 'Pendente', className: 'iniciado' }
}

function getDisplayStatus(item) {
  if (item?.status === 'Em andamento' && item?.enviadoGestor && !item?.gestorAssinadoDocumento) {
    return { label: 'Aguardando assinatura do gestor', className: 'emandamento' }
  }
  if (item?.status === 'Em andamento' && item?.gestorAssinadoDocumento && !item?.enviadoContabilidade) {
    return { label: 'Assinado pelo gestor', className: 'finalizado' }
  }
  const status = item?.status || 'Iniciado'
  return {
    label: status,
    className: String(status).toLowerCase().replace(' ', ''),
  }
}

export default function SinistroFlowPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [statusFilter, setStatusFilter] = useState('all')
  const [progressFilter, setProgressFilter] = useState('all')
  const [financeFilter, setFinanceFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [version, setVersion] = useState(0)
  const [page, setPage] = useState(1)
  const [historyProcessId, setHistoryProcessId] = useState('')
  const [historyPage, setHistoryPage] = useState(1)
  const [previewProcessId, setPreviewProcessId] = useState('')
  const [juridicoPreviewProcessId, setJuridicoPreviewProcessId] = useState('')
  const [docxPreviewHtml, setDocxPreviewHtml] = useState('')
  const [docxPreviewMessage, setDocxPreviewMessage] = useState('')
  const [docxJuridicoPreviewHtml, setDocxJuridicoPreviewHtml] = useState('')
  const [docxJuridicoPreviewMessage, setDocxJuridicoPreviewMessage] = useState('')
  const selectedRowRef = useRef(null)
  const processes = useMemo(() => getProcesses(), [version])
  const history = useMemo(() => getHistory(), [version])

  useEffect(() => {
    const created = ensureSinistroDemoProcess()
    if (created) setVersion((value) => value + 1)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return processes.filter((p) => {
      const displayStatus = getDisplayStatus(p)
      const statusOk =
        statusFilter === 'all'
          ? true
          : statusFilter === 'aguardando-gestor'
            ? displayStatus.label === 'Aguardando assinatura do gestor'
            : statusFilter === 'assinado-gestor'
              ? displayStatus.label === 'Assinado pelo gestor'
              : p.status === statusFilter
      const progress = getProgressPercent(p)
      const finance = getFinanceStatus(p)
      const progressOk =
        progressFilter === 'all'
          ? true
          : progressFilter === '0'
            ? progress === 0
            : progressFilter === '1-40'
              ? progress >= 1 && progress <= 40
              : progressFilter === '41-80'
                ? progress >= 41 && progress <= 80
                : progress === 100
      const financeOk =
        financeFilter === 'all'
          ? true
          : financeFilter === 'pendente'
            ? finance.label === 'Pendente' || finance.label === 'Aguardando envio à contabilidade'
            : financeFilter === 'aguardando'
              ? finance.label === 'Aguardando contabilidade'
              : finance.label === 'Pago'
      const textOk = !q
        ? true
        : `${p.numeroSinistro} ${p.matricula} ${p.cliente}`.toLowerCase().includes(q)
      return statusOk && progressOk && financeOk && textOk
    })
  }, [financeFilter, processes, progressFilter, query, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, currentPage])

  const historyItems = useMemo(() => {
    if (!historyProcessId) return []
    return history.filter((item) => item.processoId === historyProcessId)
  }, [history, historyProcessId])

  const selectedProcess = useMemo(
    () => processes.find((item) => item.id === historyProcessId) || null,
    [historyProcessId, processes],
  )
  const previewProcess = useMemo(
    () => processes.find((item) => item.id === previewProcessId) || null,
    [previewProcessId, processes],
  )
  const juridicoPreviewProcess = useMemo(
    () => processes.find((item) => item.id === juridicoPreviewProcessId) || null,
    [juridicoPreviewProcessId, processes],
  )

  const historyTotalPages = Math.max(1, Math.ceil(historyItems.length / HISTORY_PAGE_SIZE))
  const historyCurrentPage = Math.min(historyPage, historyTotalPages)
  const pagedHistoryItems = useMemo(() => {
    const start = (historyCurrentPage - 1) * HISTORY_PAGE_SIZE
    return historyItems.slice(start, start + HISTORY_PAGE_SIZE)
  }, [historyCurrentPage, historyItems])

  useEffect(() => {
    const processId = searchParams.get('id')
    if (!processId) return
    const exists = processes.some((item) => item.id === processId)
    if (!exists) return
    setHistoryProcessId(processId)
    setHistoryPage(1)
  }, [processes, searchParams])

  useEffect(() => {
    if (!selectedRowRef.current) return
    selectedRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [historyProcessId, currentPage])

  const formatDate = (iso) => {
    if (!iso) return '--'
    const date = new Date(iso)
    return date.toLocaleString('pt-PT')
  }

  const stats = useMemo(() => {
    const counts = {
      total: processes.length,
      iniciado: 0,
      emAndamento: 0,
      finalizado: 0,
      encerrado: 0,
    }
    processes.forEach((item) => {
      if (item.status === 'Iniciado') counts.iniciado += 1
      if (item.status === 'Em andamento') counts.emAndamento += 1
      if (item.status === 'Finalizado') counts.finalizado += 1
      if (item.status === 'Encerrado') counts.encerrado += 1
    })
    return counts
  }, [processes])

  const historyStats = useMemo(() => {
    if (!selectedProcess) return null
    return {
      total: historyItems.length,
      status: selectedProcess.status || 'Iniciado',
      cliente: selectedProcess.cliente || '--',
      numero: selectedProcess.numeroSinistro || '--',
    }
  }, [historyItems.length, selectedProcess])

  const initialFlowNodes = useMemo(
    () => [
      { id: 'f1', position: { x: 0, y: 80 }, data: { label: '1. Iniciado' }, type: 'input' },
      { id: 'f2', position: { x: 230, y: 80 }, data: { label: '2. Credit Control' } },
      { id: 'f3', position: { x: 480, y: 80 }, data: { label: '3. Em andamento' } },
      { id: 'f4', position: { x: 760, y: 10 }, data: { label: '4. Finalizado' }, type: 'output' },
      { id: 'f5', position: { x: 760, y: 160 }, data: { label: '5. Encerrado' }, type: 'output' },
    ],
    [],
  )
  const initialFlowEdges = useMemo(
    () => [
      { id: 'e1-2', source: 'f1', target: 'f2', animated: true, label: 'criação' },
      { id: 'e2-3', source: 'f2', target: 'f3', animated: true, label: 'prémio pago' },
      { id: 'e3-4', source: 'f3', target: 'f4', animated: true, label: 'fluxo normal' },
      { id: 'e2-5', source: 'f2', target: 'f5', label: 'não pago / repúdio' },
    ],
    [],
  )
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(initialFlowNodes)
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(initialFlowEdges)

  const onConnect = (params) => setFlowEdges((eds) => addEdge({ ...params, animated: true }, eds))
  useEffect(() => {
    let active = true
    const loadDocxPreview = async () => {
      setDocxPreviewHtml('')
      setDocxPreviewMessage('')
      const file = previewProcess?.peritagemRelatorio
      if (!file?.dataUrl || !file.nome?.toLowerCase().endsWith('.docx')) return
      try {
        const base64 = String(file.dataUrl).split(',')[1] || ''
        const raw = atob(base64)
        const buffer = new ArrayBuffer(raw.length)
        const bytes = new Uint8Array(buffer)
        for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i)
        const result = await mammoth.convertToHtml({ arrayBuffer: buffer })
        if (!active) return
        setDocxPreviewHtml(result.value || '<p>Documento sem conteúdo para mostrar.</p>')
      } catch {
        if (!active) return
        setDocxPreviewMessage('Não foi possível gerar a pré-visualização deste DOCX.')
      }
    }
    loadDocxPreview()
    return () => {
      active = false
    }
  }, [previewProcess])
  useEffect(() => {
    let active = true
    const loadDocxPreview = async () => {
      setDocxJuridicoPreviewHtml('')
      setDocxJuridicoPreviewMessage('')
      const file = juridicoPreviewProcess?.juridicoCartaDocumento
      if (!file?.dataUrl || !file.nome?.toLowerCase().endsWith('.docx')) return
      try {
        const base64 = String(file.dataUrl).split(',')[1] || ''
        const raw = atob(base64)
        const buffer = new ArrayBuffer(raw.length)
        const bytes = new Uint8Array(buffer)
        for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i)
        const result = await mammoth.convertToHtml({ arrayBuffer: buffer })
        if (!active) return
        setDocxJuridicoPreviewHtml(result.value || '<p>Carta sem conteúdo para mostrar.</p>')
      } catch {
        if (!active) return
        setDocxJuridicoPreviewMessage('Não foi possível gerar a pré-visualização desta carta DOCX.')
      }
    }
    loadDocxPreview()
    return () => {
      active = false
    }
  }, [juridicoPreviewProcess])

  return (
    <div className="form-page sinistro-flow-page">
      <div className="sinistro-page-hero">
        <div className="sinistro-page-hero__icon"><FaProjectDiagram /></div>
        <div>
          <h1 className="dash-title sinistro-page-hero__title">Gerir Fluxo</h1>
          <p className="form-subtitle">Acompanhe o ciclo completo do processo de sinistro por etapa.</p>
        </div>
      </div>

      <div className="sinistro-flow-stats">
        <article className="sinistro-stat-card">
          <span>Total</span>
          <strong>{stats.total}</strong>
        </article>
        <article className="sinistro-stat-card">
          <span>Iniciado</span>
          <strong>{stats.iniciado}</strong>
        </article>
        <article className="sinistro-stat-card">
          <span>Em andamento</span>
          <strong>{stats.emAndamento}</strong>
        </article>
        <article className="sinistro-stat-card">
          <span>Finalizado</span>
          <strong>{stats.finalizado}</strong>
        </article>
        <article className="sinistro-stat-card">
          <span>Encerrado</span>
          <strong>{stats.encerrado}</strong>
        </article>
      </div>

      <section className="sinistro-flow-section">
        <h2 className="sinistro-flow-heading">Etapas do Fluxo</h2>
        <div className="flow-stage-grid">
          {FLOW_STEPS.map((step, index) => (
            <div key={step.title} className="flow-stage-card">
              <div className="flow-stage-top">
                <span className="flow-stage-index">{index + 1}</span>
                <span className="flow-stage-icon">{step.icon}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.detail}</p>
            </div>
          ))}
        </div>
        <div className="flow-stage-hint">Fluxograma manipulável: arraste os nós e conecte etapas.</div>
        <div className="flow-stage-board">
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <MiniMap nodeColor={FLOW_NODE_COLOR} />
            <Controls />
            <Background />
          </ReactFlow>
        </div>
      </section>

      <section className="sinistro-flow-section">
      <h2 className="sinistro-flow-heading">Processos em Curso</h2>

      <div className="sinistro-flow-filters-panel">
        <SinistroFilterChips
          label="Status"
          labelIcon={<FaCheckCircle />}
          options={[
            { id: 'all', label: 'Todos' },
            { id: 'Iniciado', label: 'Iniciado' },
            { id: 'Em andamento', label: 'Em andamento' },
            { id: 'aguardando-gestor', label: 'Aguard. gestor' },
            { id: 'assinado-gestor', label: 'Assinado gestor' },
            { id: 'Finalizado', label: 'Finalizado' },
            { id: 'Encerrado', label: 'Encerrado' },
          ]}
          value={statusFilter}
          onChange={(val) => { setStatusFilter(val); setPage(1) }}
        />
        <SinistroFilterChips
          label="Progresso"
          labelIcon={<FaArrowRight />}
          options={[
            { id: 'all', label: 'Todos' },
            { id: '0', label: '0%' },
            { id: '1-40', label: '1–40%' },
            { id: '41-80', label: '41–80%' },
            { id: '100', label: '100%' },
          ]}
          value={progressFilter}
          onChange={(val) => { setProgressFilter(val); setPage(1) }}
        />
        <SinistroFilterChips
          label="Financeiro"
          labelIcon={<FaWallet />}
          options={[
            { id: 'all', label: 'Todos' },
            { id: 'pendente', label: 'Pendente' },
            { id: 'aguardando', label: 'Aguard. contab.' },
            { id: 'pago', label: 'Pago' },
          ]}
          value={financeFilter}
          onChange={(val) => { setFinanceFilter(val); setPage(1) }}
        />
      </div>

      <SinistroProcessosDataTable
        searchPlaceholder="Pesquisar por nº sinistro, matrícula ou cliente"
        searchValue={query}
        onSearchChange={(val) => { setQuery(val); setPage(1) }}
        columns={[
          { key: 'numeroSinistro', label: 'Nº Sinistro', icon: <FaHashtag />, strong: true, minWidth: '130px' },
          { key: 'cliente', label: 'Cliente', icon: <FaUserTie />, minWidth: '170px' },
          {
            key: 'status',
            label: 'Status',
            icon: <FaCheckCircle />,
            minWidth: '160px',
            render: (item) => {
              const displayStatus = getDisplayStatus(item)
              return <span className={`pill ${displayStatus.className}`}>{displayStatus.label}</span>
            },
          },
          {
            key: 'financeiro',
            label: 'Estado Financeiro',
            icon: <FaWallet />,
            minWidth: '180px',
            render: (item) => {
              const finance = getFinanceStatus(item)
              return <span className={`pill ${finance.className}`}>{finance.label}</span>
            },
          },
          {
            key: 'perito',
            label: 'Relatório do Perito',
            icon: <FaFileAlt />,
            minWidth: '200px',
            render: (item) => (
              item.peritagemEnviado || item.peritagemRelatorio?.nome ? (
                <div className="sinistro-premium-actions sinistro-premium-actions--inline">
                  <button type="button" className="sinistro-action-btn sinistro-action-btn--view" onClick={() => setPreviewProcessId(item.id)}>
                    Visualizar
                  </button>
                  {item.peritagemRelatorio?.dataUrl && (
                    <a
                      className="sinistro-action-btn sinistro-action-btn--download"
                      href={item.peritagemRelatorio.dataUrl}
                      download={item.peritagemRelatorio.nome || 'relatorio-pericial'}
                    >
                      Baixar
                    </a>
                  )}
                </div>
              ) : (
                <span className="sinistro-muted-cell">Sem relatório</span>
              )
            ),
          },
        ]}
        rows={paged}
        selectedId={historyProcessId}
        getRowRef={(row, isSelected) => (isSelected ? selectedRowRef : null)}
        renderActions={(item) => (
          <>
            <button
              type="button"
              className="sinistro-action-btn sinistro-action-btn--history"
              onClick={() => { setHistoryProcessId(item.id); setHistoryPage(1) }}
            >
              <FaHistory /> Histórico
            </button>
            <button
              type="button"
              className="sinistro-action-btn sinistro-action-btn--edit"
              title="Editar processo"
              onClick={() => navigate(`/Sinistro/Editar?id=${encodeURIComponent(item.id)}`)}
            >
              <FaEdit />
            </button>
            {item.premioPago === 'Sim' && (
              <button
                type="button"
                className="sinistro-action-btn sinistro-action-btn--flow"
                onClick={() => { requestPeritagem(item.id, 'Edmilson'); setVersion((value) => value + 1) }}
                disabled={item.peritoSolicitado}
                title={item.peritoSolicitado ? 'Peritagem já solicitada' : 'Solicitar peritagem'}
              >
                {item.peritoSolicitado ? 'Enviada' : 'Perito'}
              </button>
            )}
            {item.status === 'Encerrado' && item.juridicoCartaDocumento?.dataUrl && (
              <button type="button" className="sinistro-action-btn sinistro-action-btn--view" onClick={() => setJuridicoPreviewProcessId(item.id)}>
                Carta
              </button>
            )}
          </>
        )}
        emptyMessage="Nenhum processo encontrado."
        pagination={{
          currentPage,
          totalPages,
          totalCount: filtered.length,
          onPageChange: setPage,
        }}
      />
      </section>

      {historyProcessId && (
        <section className="sinistro-flow-section history-section">
          <h2 className="sinistro-flow-heading">Histórico Selecionado</h2>
          <p className="form-subtitle" style={{ marginTop: '0.2rem' }}>
            {selectedProcess
              ? `${selectedProcess.numeroSinistro} • ${selectedProcess.cliente}`
              : 'Processo selecionado'}
          </p>

          {historyStats && (
            <div className="sinistro-history-summary">
              <article className="sinistro-history-summary-card">
                <span>Nº Sinistro</span>
                <strong>{historyStats.numero}</strong>
              </article>
              <article className="sinistro-history-summary-card">
                <span>Cliente</span>
                <strong>{historyStats.cliente}</strong>
              </article>
              <article className="sinistro-history-summary-card">
                <span>Status atual</span>
                <strong>{historyStats.status}</strong>
              </article>
              <article className="sinistro-history-summary-card">
                <span>Registos</span>
                <strong>{historyStats.total}</strong>
              </article>
            </div>
          )}

          {historyItems.length > 0 && (
            <div className="sinistro-history-timeline">
              {pagedHistoryItems.map((item) => (
                <article key={`timeline-${item.id}`} className="sinistro-history-item">
                  <span className="sinistro-history-dot">
                    <FaHistory />
                  </span>
                  <div>
                    <strong>{item.acao}</strong>
                    <p>{item.usuario} - {formatDate(item.data)}</p>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="table users-table history-detail-table">
            <div className="tr th">
              <div>Data</div>
              <div>Ação</div>
              <div>Utilizador</div>
              <div>Referência</div>
            </div>

            {historyItems.length === 0 && (
              <div className="tr history-empty-row">
                <div className="history-empty-cell">Sem histórico para este processo.</div>
                <div />
                <div />
                <div />
              </div>
            )}

            {pagedHistoryItems.map((item) => (
              <div key={item.id} className="tr history-row">
                <div className="history-col history-col-date">{formatDate(item.data)}</div>
                <div className="td-strong history-col history-col-action">{item.acao}</div>
                <div className="history-col history-col-user">{item.usuario}</div>
                <div className="history-col history-col-ref" title={item.processoId}>
                  {item.processoId}
                </div>
              </div>
            ))}
          </div>

          {historyItems.length > 0 && (
            <div className="users-pagination">
              <button
                type="button"
                className="btn-table"
                disabled={historyCurrentPage === 1}
                onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </button>
              <span>Página {historyCurrentPage} de {historyTotalPages}</span>
              <button
                type="button"
                className="btn-table"
                disabled={historyCurrentPage === historyTotalPages}
                onClick={() => setHistoryPage((p) => Math.min(historyTotalPages, p + 1))}
              >
                Seguinte
              </button>
            </div>
          )}
        </section>
      )}

      {previewProcess && (
        <section className="sinistro-flow-section history-section">
          <div className="action-buttons" style={{ justifyContent: 'space-between' }}>
            <h2 className="sinistro-flow-heading" style={{ margin: 0 }}>
              Visualização de Documento
            </h2>
            <button type="button" className="btn-table" onClick={() => setPreviewProcessId('')}>
              Fechar
            </button>
          </div>
          <p className="form-subtitle" style={{ marginTop: '0.4rem' }}>
            {previewProcess.numeroSinistro} - {previewProcess.peritagemRelatorio?.nome || 'Relatório Pericial'}
          </p>
          {(previewProcess.peritagemEnviado || previewProcess.peritagemRelatorio?.tipo === 'formulario-digital') && (
            <PeritagemRelatorioPreview process={previewProcess} />
          )}
          {previewProcess?.peritagemRelatorio?.dataUrl &&
            previewProcess.peritagemRelatorio.nome?.toLowerCase().endsWith('.pdf') && (
              <iframe
                title="Visualização do relatório PDF"
                src={previewProcess.peritagemRelatorio.dataUrl}
                style={{ width: '100%', height: '520px', border: '1px solid #d8e2eb', borderRadius: '12px' }}
              />
            )}
          {previewProcess?.peritagemRelatorio?.dataUrl &&
            previewProcess.peritagemRelatorio.nome?.toLowerCase().endsWith('.docx') && (
              <div
                style={{
                  minHeight: '320px',
                  border: '1px solid #d8e2eb',
                  borderRadius: '12px',
                  padding: '1rem',
                  background: '#fff',
                }}
              >
                {docxPreviewMessage && <p>{docxPreviewMessage}</p>}
                {!docxPreviewMessage && (
                  <div dangerouslySetInnerHTML={{ __html: docxPreviewHtml || '<p>A carregar pré-visualização...</p>' }} />
                )}
              </div>
            )}
          {previewProcess?.peritagemRelatorio?.dataUrl &&
            !previewProcess.peritagemRelatorio.nome?.toLowerCase().endsWith('.pdf') &&
            !previewProcess.peritagemRelatorio.nome?.toLowerCase().endsWith('.docx') && (
              <div className="form-card">
                <p>
                  Este tipo de documento ainda não tem pré-visualização embutida no navegador.
                  Use o botão de download para abrir localmente.
                </p>
              </div>
            )}
        </section>
      )}
      {juridicoPreviewProcess && (
        <section className="sinistro-flow-section history-section">
          <div className="action-buttons" style={{ justifyContent: 'space-between' }}>
            <h2 className="sinistro-flow-heading" style={{ margin: 0 }}>
              Carta Jurídica
            </h2>
            <button type="button" className="btn-table" onClick={() => setJuridicoPreviewProcessId('')}>
              Fechar
            </button>
          </div>
          <p className="form-subtitle" style={{ marginTop: '0.4rem' }}>
            {juridicoPreviewProcess.numeroSinistro} - {juridicoPreviewProcess.juridicoCartaDocumento?.nome || 'Carta'}
          </p>
          {juridicoPreviewProcess?.juridicoCartaDocumento?.dataUrl &&
            juridicoPreviewProcess.juridicoCartaDocumento.nome?.toLowerCase().endsWith('.pdf') && (
              <iframe
                title="Visualização da carta jurídica PDF"
                src={juridicoPreviewProcess.juridicoCartaDocumento.dataUrl}
                style={{ width: '100%', height: '520px', border: '1px solid #d8e2eb', borderRadius: '12px' }}
              />
            )}
          {juridicoPreviewProcess?.juridicoCartaDocumento?.dataUrl &&
            juridicoPreviewProcess.juridicoCartaDocumento.nome?.toLowerCase().endsWith('.docx') && (
              <div
                style={{
                  minHeight: '320px',
                  border: '1px solid #d8e2eb',
                  borderRadius: '12px',
                  padding: '1rem',
                  background: '#fff',
                }}
              >
                {docxJuridicoPreviewMessage && <p>{docxJuridicoPreviewMessage}</p>}
                {!docxJuridicoPreviewMessage && (
                  <div dangerouslySetInnerHTML={{ __html: docxJuridicoPreviewHtml || '<p>A carregar pré-visualização...</p>' }} />
                )}
              </div>
            )}
        </section>
      )}
    </div>
  )
}

