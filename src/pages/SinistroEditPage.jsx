import { useEffect, useMemo, useState } from 'react'
import {
  FaCalendarAlt,
  FaCar,
  FaCheckCircle,
  FaEdit,
  FaFileInvoice,
  FaHashtag,
  FaTools,
  FaUserEdit,
  FaUserTie,
} from 'react-icons/fa'
import { useSearchParams } from 'react-router-dom'
import SinistroDateField from '../components/sinistro/SinistroDateField'
import SinistroProcessosDataTable from '../components/sinistro/SinistroProcessosDataTable'
import { ensureSinistroDemoProcess, getProcesses, updateProcess } from '../utils/processes'
import { normalizeMatricula } from '../utils/matriculaInput'

export default function SinistroEditPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [version, setVersion] = useState(0)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(searchParams.get('id') || '')
  const [numeroSinistro, setNumeroSinistro] = useState('')
  const [numeroApolice, setNumeroApolice] = useState('')
  const [matricula, setMatricula] = useState('')
  const [oficina, setOficina] = useState('')
  const [numeroFactura, setNumeroFactura] = useState('')
  const [dataFactura, setDataFactura] = useState('')
  const [perito, setPerito] = useState('')
  const [status, setStatus] = useState('Iniciado')
  const [message, setMessage] = useState('')

  const processes = useMemo(() => getProcesses(), [version])

  useEffect(() => {
    const created = ensureSinistroDemoProcess()
    if (created) setVersion((value) => value + 1)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return processes
    return processes.filter(
      (p) =>
        (p.numeroSinistro || '').toLowerCase().includes(q) ||
        (p.matricula || '').toLowerCase().includes(q) ||
        (p.cliente || '').toLowerCase().includes(q),
    )
  }, [processes, query])

  useEffect(() => {
    if (!selectedId) return
    const process = processes.find((item) => item.id === selectedId)
    if (!process) return
    setNumeroSinistro(process.numeroSinistro || '')
    setNumeroApolice(process.numeroApolice || '')
    setMatricula(process.matricula || '')
    setOficina(process.oficina || '')
    setNumeroFactura(process.numeroFactura || '')
    setDataFactura(process.dataFactura || '')
    setPerito(process.perito || '')
    setStatus(process.status || 'Iniciado')
  }, [processes, selectedId])

  const selectProcess = (id) => {
    setSelectedId(id)
    setSearchParams({ id })
    setMessage('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!selectedId) {
      setMessage('Selecione um processo para editar.')
      return
    }
    updateProcess(selectedId, {
      numeroSinistro,
      numeroApolice,
      matricula,
      oficina,
      numeroFactura,
      dataFactura,
      perito,
      status,
    })
    setVersion((value) => value + 1)
    setMessage('Processo atualizado com sucesso.')
  }

  const statusPill = (item) => (
    <span className={`pill ${String(item.status || 'Iniciado').toLowerCase().replace(' ', '')}`}>
      {item.status}
    </span>
  )

  return (
    <div className="form-page users-page">
      <div className="sinistro-page-hero">
        <div className="sinistro-page-hero__icon"><FaEdit /></div>
        <div>
          <h1 className="dash-title sinistro-page-hero__title">Editar Processo</h1>
          <p className="form-subtitle">Atualize dados de peritagem, reparação e facturação do processo.</p>
        </div>
      </div>

      <SinistroProcessosDataTable
        title="Selecionar processo"
        titleIcon={<FaHashtag />}
        searchPlaceholder="Pesquisar por nº sinistro, matrícula ou cliente"
        searchValue={query}
        onSearchChange={setQuery}
        columns={[
          { key: 'numeroSinistro', label: 'Nº Sinistro', icon: <FaHashtag />, strong: true, minWidth: '140px' },
          { key: 'cliente', label: 'Cliente', icon: <FaUserTie />, minWidth: '180px' },
          {
            key: 'status',
            label: 'Status',
            icon: <FaCheckCircle />,
            minWidth: '130px',
            render: statusPill,
          },
        ]}
        rows={filtered}
        selectedId={selectedId}
        renderActions={(item) => (
          <button type="button" className="sinistro-action-btn sinistro-action-btn--select" onClick={() => selectProcess(item.id)}>
            Selecionar
          </button>
        )}
        emptyMessage="Nenhum processo encontrado."
      />

      <form className="form-card form-card--wide sinistro-create-grid sinistro-edit-form" onSubmit={handleSubmit}>
        <div className="form-section-title field-full">Dados do processo</div>

        <label className="field-group">
          <FaFileInvoice className="field-icon" />
          <input
            type="text"
            placeholder="Nº do sinistro"
            required
            value={numeroSinistro}
            onChange={(event) => setNumeroSinistro(event.target.value)}
          />
        </label>

        <label className="field-group">
          <FaFileInvoice className="field-icon" />
          <input
            type="text"
            placeholder="Nº da apólice"
            required
            value={numeroApolice}
            onChange={(event) => setNumeroApolice(event.target.value)}
          />
        </label>

        <label className="field-group sinistro-matricula-field">
          <FaCar className="field-icon" />
          <input
            type="text"
            placeholder="Matrícula"
            required
            value={matricula}
            onChange={(event) => setMatricula(normalizeMatricula(event.target.value))}
            style={{ textTransform: 'uppercase' }}
            autoComplete="off"
            spellCheck={false}
          />
          <small></small>
        </label>

        <div className="form-section-title field-full">Facturação e operação</div>

        <label className="field-group">
          <FaTools className="field-icon" />
          <input
            type="text"
            placeholder="Oficina / Ordem de reparação"
            value={oficina}
            onChange={(event) => setOficina(event.target.value)}
          />
        </label>

        <label className="field-group">
          <FaFileInvoice className="field-icon" />
          <input
            type="text"
            placeholder="Nº da factura"
            value={numeroFactura}
            onChange={(event) => setNumeroFactura(event.target.value)}
          />
        </label>

        <SinistroDateField
          label="Data da factura"
          hint=""
          value={dataFactura}
          onChange={(event) => setDataFactura(event.target.value)}
        />

        <label className="field-group">
          <FaUserEdit className="field-icon" />
          <input
            type="text"
            placeholder="Perito responsável"
            value={perito}
            onChange={(event) => setPerito(event.target.value)}
          />
        </label>

        <div className="form-section-title field-full">Controle de status</div>

        <label className="field-group select-group field-full">
          <span className="field-label">Status do processo</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="Iniciado">Iniciado</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Finalizado">Finalizado</option>
            <option value="Encerrado">Encerrado</option>
          </select>
        </label>

        <button type="submit" className="primary-btn form-btn field-full">
          <FaCheckCircle />
          Salvar alterações
        </button>

        {message && <p className="form-message field-full">{message}</p>}
      </form>
    </div>
  )
}
