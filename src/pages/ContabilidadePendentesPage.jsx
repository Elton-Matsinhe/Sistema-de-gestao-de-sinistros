import { useEffect, useMemo, useState } from 'react'
import { FaDownload, FaFileAlt, FaFileUpload, FaHashtag, FaSave, FaUserTie } from 'react-icons/fa'
import {
  clearHeavyLocalCache,
  ensureSinistroDemoProcess,
  getContabilidadePendingProcesses,
  registerComprovativoPagamento,
} from '../utils/processes'
import AutoDateTimeNotice from '../components/AutoDateTimeNotice'
import { getSession } from '../utils/auth'
import { getLocalDateTimeNow } from '../utils/datetime'

const PAGE_SIZE = 5

export default function ContabilidadePendentesPage() {
  const session = getSession()
  const [version, setVersion] = useState(0)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState('')
  const [comprovativoFile, setComprovativoFile] = useState(null)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const processes = useMemo(() => getContabilidadePendingProcesses(), [version])
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
  const selectedProcess = useMemo(
    () => processes.find((item) => item.id === selectedId) || null,
    [processes, selectedId],
  )

  useEffect(() => {
    const created = ensureSinistroDemoProcess()
    if (created) setVersion((value) => value + 1)
  }, [])

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Falha ao ler arquivo'))
      reader.readAsDataURL(file)
    })

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return
    if (!selectedProcess) {
      setMessage('Selecione um processo pendente.')
      return
    }
    if (!comprovativoFile) {
      setMessage('Carregue o comprovativo de pagamento.')
      return
    }
    let dataUrl = ''
    try {
      dataUrl = await readFileAsDataUrl(comprovativoFile)
    } catch {
      setMessage('Não foi possível processar o comprovativo.')
      return
    }
    setIsSubmitting(true)
    setMessage('A guardar comprovativo...')
    try {
      const updated = registerComprovativoPagamento(selectedProcess.id, {
        comprovativoPagamentoDocumento: {
          nome: comprovativoFile.name,
          tipo: comprovativoFile.type,
          tamanho: comprovativoFile.size,
          dataUrl,
        },
        comprovativoPagamentoData: getLocalDateTimeNow(),
        comprovativoPagamentoPor: session?.name || 'Contabilidade',
      })
      if (!updated) {
        setMessage('Não foi possível concluir o registo do pagamento.')
        return
      }
      setComprovativoFile(null)
      setVersion((v) => v + 1)
      setMessage(`Pagamento registado e processo finalizado: ${updated.numeroSinistro}.`)
    } catch (error) {
      const msg = String(error?.message || '')
      if (msg.toLowerCase().includes('quota')) {
        setMessage('Armazenamento local cheio. Limpe dados antigos no navegador e tente novamente.')
      } else {
        setMessage(`Erro ao guardar comprovativo: ${msg || 'falha inesperada'}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClearHeavyCache = () => {
    const confirmed = window.confirm(
      'Isto vai limpar anexos pesados antigos do armazenamento local para liberar espaço (a assinatura digital será preservada). Continuar?',
    )
    if (!confirmed) return
    try {
      const result = clearHeavyLocalCache()
      if (!result.changed) {
        setMessage('Não havia dados pesados para limpar.')
        return
      }
      setVersion((v) => v + 1)
      setMessage(`Limpeza concluída. Processos otimizados: ${result.processesUpdated}.`)
    } catch {
      setMessage('Falha ao limpar cache local pesado.')
    }
  }

  return (
    <div className="form-page users-page">
      <h1 className="dash-title">Contabilidade - Pendentes</h1>
      <p className="form-subtitle">Processos enviados pelo Sinistro aguardando comprovativo de pagamento.</p>

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
      <div className="action-buttons" style={{ marginBottom: '0.75rem' }}>
        <button type="button" className="btn-table" onClick={handleClearHeavyCache}>
          Limpar dados pesados antigos
        </button>
      </div>

      <div className="table users-table credit-premium-table contabilidade-pendentes-table">
        <div className="tr th">
          <div><span className="juridico-th-label"><FaHashtag /> Nº Sinistro</span></div>
          <div><span className="juridico-th-label"><FaUserTie /> Cliente</span></div>
          <div><span className="juridico-th-label"><FaFileAlt /> Factura Oficina</span></div>
          <div><span className="juridico-th-label"><FaFileUpload /> Ações</span></div>
        </div>
        {paged.map((item) => (
          <div key={item.id} className={`tr credit-row ${selectedId === item.id ? 'tr-selected' : ''}`}>
            <div className="td-strong credit-col">{item.numeroSinistro}</div>
            <div className="credit-col">{item.cliente}</div>
            <div className="credit-col">{item.oficinaFacturacaoDocumento?.nome || '--'}</div>
            <div className="action-buttons">
              {item.oficinaFacturacaoDocumento?.dataUrl && (
                <a
                  className="btn-table"
                  href={item.oficinaFacturacaoDocumento.dataUrl}
                  download={item.oficinaFacturacaoDocumento.nome || 'facturacao'}
                >
                  <FaDownload />
                  Baixar
                </a>
              )}
              <button type="button" className="btn-table" onClick={() => setSelectedId(item.id)}>
                Selecionar
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

      <form className="form-card form-card--wide" style={{ marginTop: '1rem' }} onSubmit={handleSubmit}>
        <h3 style={{ marginTop: 0 }}>Upload do Comprovativo de Pagamento</h3>
        <p className="form-subtitle" style={{ marginTop: 0 }}>
          Selecione o processo e anexe o comprovativo para finalizar o fluxo.
        </p>
        <label className="field-group" style={{ marginBottom: '0.7rem' }}>
          <FaFileUpload className="field-icon" />
          <input
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            onChange={(event) => setComprovativoFile(event.target.files?.[0] || null)}
          />
        </label>
        <AutoDateTimeNotice label="Data do comprovativo" />
        <button type="submit" className="primary-btn form-btn" disabled={!selectedId || isSubmitting}>
          <FaSave />
          {isSubmitting ? 'A guardar...' : 'Guardar comprovativo e finalizar'}
        </button>
        {message && <p className="form-message" style={{ marginTop: '0.8rem' }}>{message}</p>}
      </form>
    </div>
  )
}

