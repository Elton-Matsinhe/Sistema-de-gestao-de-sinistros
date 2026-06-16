import { useEffect, useMemo, useState } from 'react'
import { FaCalendarAlt, FaCar, FaCheckCircle, FaFileInvoice, FaTools, FaUserEdit } from 'react-icons/fa'
import { useSearchParams } from 'react-router-dom'
import { ensureSinistroDemoProcess, getProcesses, updateProcess } from '../utils/processes'

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

  return (
    <div className="form-page">
      <h1 className="dash-title">Editar Processo</h1>
      <p className="form-subtitle">Atualize dados de peritagem, reparação e facturação do processo.</p>

      <div className="users-filter-box">
        <input
          type="text"
          placeholder="Pesquisar por nº sinistro, matrícula ou cliente"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="table users-table" style={{ marginBottom: '0.85rem' }}>
        <div className="tr th">
          <div>Nº Sinistro</div>
          <div>Cliente</div>
          <div>Status</div>
          <div>Ações</div>
        </div>
        {filtered.map((item) => (
          <div key={item.id} className="tr">
            <div className="td-strong">{item.numeroSinistro}</div>
            <div>{item.cliente}</div>
            <div>
              <span className={`pill ${String(item.status || 'Iniciado').toLowerCase().replace(' ', '')}`}>
                {item.status}
              </span>
            </div>
            <div className="action-buttons">
              <button type="button" className="btn-table" onClick={() => selectProcess(item.id)}>
                Selecionar
              </button>
            </div>
          </div>
        ))}
      </div>

      <form className="form-card form-card--wide sinistro-create-grid" onSubmit={handleSubmit}>
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

        <label className="field-group">
          <FaCar className="field-icon" />
          <input
            type="text"
            placeholder="Matrícula"
            required
            value={matricula}
            onChange={(event) => setMatricula(event.target.value)}
          />
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

        <label className="field-group">
          <FaCalendarAlt className="field-icon" />
          <input type="date" value={dataFactura} onChange={(event) => setDataFactura(event.target.value)} />
        </label>

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

