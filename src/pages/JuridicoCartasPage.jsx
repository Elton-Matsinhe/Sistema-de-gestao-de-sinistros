import { useEffect, useMemo, useState } from 'react'
import { FaBalanceScale, FaCalendarAlt, FaCheckCircle, FaDownload, FaFileAlt, FaFileUpload, FaHashtag, FaSave, FaUserTie } from 'react-icons/fa'
import mammoth from 'mammoth'
import AutoDateTimeNotice from '../components/AutoDateTimeNotice'
import { getLocalDateTimeNow } from '../utils/datetime'
import {
  emitJuridicoCarta,
  ensureSinistroDemoProcess,
  getJuridicoClosedProcesses,
  getJuridicoPendingProcesses,
} from '../utils/processes'

const PAGE_SIZE = 5

export default function JuridicoCartasPage() {
  const [version, setVersion] = useState(0)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState('')
  const [motivo, setMotivo] = useState('Não pagamento')
  const [descricaoBreve, setDescricaoBreve] = useState('')
  const [cartaFile, setCartaFile] = useState(null)
  const [message, setMessage] = useState('')
  const [previewId, setPreviewId] = useState('')
  const [previewHtml, setPreviewHtml] = useState('')
  const [previewMessage, setPreviewMessage] = useState('')

  const pendentes = useMemo(() => getJuridicoPendingProcesses(), [version])
  const encerrados = useMemo(() => getJuridicoClosedProcesses(), [version])

  useEffect(() => {
    const created = ensureSinistroDemoProcess()
    if (created) setVersion((value) => value + 1)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return pendentes
    return pendentes.filter((item) =>
      `${item.numeroSinistro} ${item.cliente} ${item.matricula}`.toLowerCase().includes(q),
    )
  }, [pendentes, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [currentPage, filtered])

  const selectedProcess = useMemo(
    () => pendentes.find((item) => item.id === selectedId) || null,
    [pendentes, selectedId],
  )
  const previewProcess = useMemo(
    () => encerrados.find((item) => item.id === previewId) || null,
    [encerrados, previewId],
  )

  useEffect(() => {
    let active = true
    const loadDocxPreview = async () => {
      setPreviewHtml('')
      setPreviewMessage('')
      const file = previewProcess?.juridicoCartaDocumento
      if (!file?.dataUrl || !file.nome?.toLowerCase().endsWith('.docx')) return
      try {
        const base64 = String(file.dataUrl).split(',')[1] || ''
        const raw = atob(base64)
        const buffer = new ArrayBuffer(raw.length)
        const bytes = new Uint8Array(buffer)
        for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i)
        const result = await mammoth.convertToHtml({ arrayBuffer: buffer })
        if (!active) return
        setPreviewHtml(result.value || '<p>Carta sem conteúdo para mostrar.</p>')
      } catch {
        if (!active) return
        setPreviewMessage('Não foi possível gerar a pré-visualização da carta.')
      }
    }
    loadDocxPreview()
    return () => {
      active = false
    }
  }, [previewProcess])

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Falha ao ler arquivo'))
      reader.readAsDataURL(file)
    })

  const handleEmitir = async (event) => {
    event.preventDefault()
    if (!selectedProcess) {
      setMessage('Selecione um processo para emissão da carta.')
      return
    }
    if (!descricaoBreve.trim()) {
      setMessage('Preencha a descrição breve da carta.')
      return
    }
    if (!cartaFile) {
      setMessage('Carregue o arquivo da carta (PDF, DOC ou DOCX).')
      return
    }
    let dataUrl = ''
    try {
      dataUrl = await readFileAsDataUrl(cartaFile)
    } catch {
      setMessage('Não foi possível ler o arquivo da carta.')
      return
    }
    const updated = emitJuridicoCarta(selectedProcess.id, {
      juridicoMotivo: motivo,
      juridicoCartaResumo: descricaoBreve,
      juridicoDataCarta: getLocalDateTimeNow(),
      juridicoCartaDocumento: {
        nome: cartaFile.name,
        tipo: cartaFile.type,
        tamanho: cartaFile.size,
        dataUrl,
      },
    })
    if (!updated) {
      setMessage('Não foi possível emitir a carta jurídica.')
      return
    }
    setDescricaoBreve('')
    setCartaFile(null)
    setVersion((v) => v + 1)
    setMessage(`Carta emitida e processo encerrado: ${updated.numeroSinistro}.`)
  }

  return (
    <div className="form-page users-page">
      <h1 className="dash-title">Jurídico - Cartas</h1>
      <p className="form-subtitle">Atua quando o Credit confirma não pagamento, negligência ou repúdio.</p>

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

      <div className="table users-table credit-premium-table juridico-pending-table">
        <div className="tr th">
          <div><span className="juridico-th-label"><FaHashtag /> Nº Sinistro</span></div>
          <div><span className="juridico-th-label"><FaUserTie /> Cliente</span></div>
          <div><span className="juridico-th-label"><FaBalanceScale /> Motivo Base</span></div>
          <div><span className="juridico-th-label"><FaFileAlt /> Ações</span></div>
        </div>
        {paged.map((item) => (
          <div key={item.id} className={`tr credit-row ${selectedId === item.id ? 'tr-selected' : ''}`}>
            <div className="td-strong credit-col">{item.numeroSinistro}</div>
            <div className="credit-col">{item.cliente}</div>
            <div className="credit-col">{item.premioPago === 'Não' ? 'Não pagamento' : '--'}</div>
            <div className="action-buttons">
              <button type="button" className="btn-table" onClick={() => setSelectedId(item.id)}>
                Selecionar
              </button>
            </div>
          </div>
        ))}
        {paged.length === 0 && (
          <div className="tr">
            <div>Sem processos pendentes para o Jurídico.</div>
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

      <form className="form-card form-card--wide" style={{ marginTop: '1rem' }} onSubmit={handleEmitir}>
        <h3 style={{ marginTop: 0 }}>Emitir Carta Jurídica</h3>
        <p className="form-subtitle" style={{ marginTop: 0 }}>
          Processo selecionado: {selectedProcess ? `${selectedProcess.numeroSinistro} - ${selectedProcess.cliente}` : 'nenhum'}
        </p>
        <div className="filter-tabs" style={{ marginBottom: '0.7rem' }}>
          {['Não pagamento', 'Negligência', 'Repúdio'].map((item) => (
            <button
              key={item}
              type="button"
              className={`tab-btn ${motivo === item ? 'active' : ''}`}
              onClick={() => setMotivo(item)}
            >
              <FaBalanceScale />
              <span>{item}</span>
            </button>
          ))}
        </div>
        <AutoDateTimeNotice label="Data da carta" />
        <label className="field-group" style={{ marginBottom: '0.7rem' }}>
          <FaFileUpload className="field-icon" />
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(event) => setCartaFile(event.target.files?.[0] || null)}
            required
          />
        </label>
        <p className="form-subtitle" style={{ marginTop: '0.2rem', marginBottom: '0.35rem' }}>
          Descrição breve
        </p>
        <label className="field-group" style={{ marginBottom: '0.8rem', alignItems: 'start', width: '100%' }}>
          <FaSave className="field-icon" style={{ marginTop: '0.7rem' }} />
          <textarea
            placeholder="Descreva brevemente o conteúdo e contexto da carta."
            value={descricaoBreve}
            onChange={(event) => setDescricaoBreve(event.target.value)}
            rows={5}
            required
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              boxShadow: 'none',
              resize: 'vertical',
            }}
          />
        </label>
        <button type="submit" className="primary-btn form-btn" disabled={!selectedId}>
          <FaSave />
          Emitir carta e encerrar processo
        </button>
        {message && <p className="form-message" style={{ marginTop: '0.8rem' }}>{message}</p>}
      </form>

      <div className="table users-table credit-premium-table juridico-closed-table" style={{ marginTop: '1rem' }}>
        <div className="tr th">
          <div><span className="juridico-th-label"><FaHashtag /> Nº Sinistro</span></div>
          <div><span className="juridico-th-label"><FaBalanceScale /> Motivo</span></div>
          <div><span className="juridico-th-label"><FaCalendarAlt /> Data Carta</span></div>
          <div><span className="juridico-th-label"><FaFileAlt /> Carta</span></div>
          <div><span className="juridico-th-label"><FaCheckCircle /> Status</span></div>
        </div>
        {encerrados.slice(0, 8).map((item) => (
          <div key={`closed-${item.id}`} className="tr credit-row">
            <div className="td-strong credit-col">{item.numeroSinistro}</div>
            <div className="credit-col">{item.juridicoMotivo || '--'}</div>
            <div className="credit-col">{item.juridicoDataCarta || '--'}</div>
            <div className="credit-col">
              {item.juridicoCartaDocumento?.dataUrl ? (
                <div className="action-buttons">
                  <button type="button" className="btn-table" onClick={() => setPreviewId(item.id)}>
                    Visualizar
                  </button>
                  <a
                    className="btn-table"
                    href={item.juridicoCartaDocumento.dataUrl}
                    download={item.juridicoCartaDocumento.nome || 'carta-juridica'}
                  >
                    <FaDownload />
                    Baixar
                  </a>
                </div>
              ) : (
                '--'
              )}
            </div>
            <div className="credit-col">
              <span className="pill encerrado">
                <FaCheckCircle />
                Encerrado
              </span>
            </div>
          </div>
        ))}
      </div>
      {previewProcess && (
        <section className="form-card form-card--wide" style={{ marginTop: '1rem' }}>
          <div className="action-buttons" style={{ justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>Visualização da Carta Jurídica</h3>
            <button type="button" className="btn-table" onClick={() => setPreviewId('')}>
              Fechar
            </button>
          </div>
          <p className="form-subtitle">
            {previewProcess.numeroSinistro} - {previewProcess.juridicoCartaDocumento?.nome || 'Carta'}
          </p>
          {previewProcess?.juridicoCartaDocumento?.dataUrl &&
            previewProcess.juridicoCartaDocumento.nome?.toLowerCase().endsWith('.pdf') && (
              <iframe
                title="Visualização da carta PDF"
                src={previewProcess.juridicoCartaDocumento.dataUrl}
                style={{ width: '100%', height: '520px', border: '1px solid #d8e2eb', borderRadius: '12px' }}
              />
            )}
          {previewProcess?.juridicoCartaDocumento?.dataUrl &&
            previewProcess.juridicoCartaDocumento.nome?.toLowerCase().endsWith('.docx') && (
              <div style={{ minHeight: '320px', border: '1px solid #d8e2eb', borderRadius: '12px', padding: '1rem' }}>
                {previewMessage && <p>{previewMessage}</p>}
                {!previewMessage && (
                  <div dangerouslySetInnerHTML={{ __html: previewHtml || '<p>A carregar carta...</p>' }} />
                )}
              </div>
            )}
          {previewProcess?.juridicoCartaDocumento?.dataUrl &&
            !previewProcess.juridicoCartaDocumento.nome?.toLowerCase().endsWith('.pdf') &&
            !previewProcess.juridicoCartaDocumento.nome?.toLowerCase().endsWith('.docx') && (
              <p>Pré-visualização indisponível para este formato. Use o botão baixar.</p>
            )}
        </section>
      )}
    </div>
  )
}

