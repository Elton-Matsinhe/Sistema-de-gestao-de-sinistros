import { useEffect, useMemo, useState } from 'react'
import { FaCheckCircle, FaEdit, FaFileAlt, FaHashtag, FaListUl, FaUserTie } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import SinistroFilterChips from '../components/sinistro/SinistroFilterChips'
import SinistroProcessosDataTable from '../components/sinistro/SinistroProcessosDataTable'
import { ensureSinistroDemoProcess, getProcesses } from '../utils/processes'

const PAGE_SIZE = 5

const STATUS_OPTIONS = [
  { id: 'all', label: 'Todos' },
  { id: 'Iniciado', label: 'Iniciado' },
  { id: 'Em andamento', label: 'Em andamento' },
  { id: 'Finalizado', label: 'Finalizado' },
  { id: 'Encerrado', label: 'Encerrado' },
]

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

  const statusPill = (item) => (
    <span className={`pill ${String(item.status || 'Iniciado').toLowerCase().replace(' ', '')}`}>
      {item.status || 'Iniciado'}
    </span>
  )

  return (
    <div className="form-page users-page">
      <div className="sinistro-page-hero">
        <div className="sinistro-page-hero__icon"><FaListUl /></div>
        <div>
          <h1 className="dash-title sinistro-page-hero__title">Listar Processo</h1>
          <p className="form-subtitle">Tabela de processos com filtros, paginação e ações rápidas.</p>
        </div>
      </div>

      <SinistroProcessosDataTable
        title="Processos registados"
        titleIcon={<FaFileAlt />}
        searchPlaceholder="Pesquisar por nº sinistro, cliente ou matrícula"
        searchValue={query}
        onSearchChange={(val) => { setQuery(val); setPage(1) }}
        toolbar={(
          <SinistroFilterChips
            label="Status"
            labelIcon={<FaCheckCircle />}
            options={STATUS_OPTIONS}
            value={status}
            onChange={(val) => { setStatus(val); setPage(1) }}
          />
        )}
        columns={[
          { key: 'numeroSinistro', label: 'Nº Sinistro', icon: <FaHashtag />, strong: true, minWidth: '140px' },
          { key: 'cliente', label: 'Cliente', icon: <FaUserTie />, minWidth: '200px' },
          { key: 'status', label: 'Status', icon: <FaCheckCircle />, minWidth: '130px', render: statusPill },
        ]}
        rows={paged}
        renderActions={(item) => (
          <>
            <button
              type="button"
              className="sinistro-action-btn sinistro-action-btn--edit"
              title="Editar processo"
              onClick={() => navigate(`/Sinistro/Editar?id=${encodeURIComponent(item.id)}`)}
            >
              <FaEdit />
            </button>
            <button
              type="button"
              className="sinistro-action-btn sinistro-action-btn--flow"
              title="Gerir fluxo"
              onClick={() => navigate(`/Sinistro/Fluxo?id=${encodeURIComponent(item.id)}`)}
            >
              <FaFileAlt />
            </button>
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
    </div>
  )
}
