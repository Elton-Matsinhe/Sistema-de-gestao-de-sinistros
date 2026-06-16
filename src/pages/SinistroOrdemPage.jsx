import { useEffect, useMemo, useState } from 'react'
import { FaCheckCircle, FaEye, FaFileUpload, FaPaperPlane, FaTimesCircle } from 'react-icons/fa'
import mammoth from 'mammoth'
import { getSession } from '../utils/auth'
import { createStampedPdfDataUrl } from '../utils/pdfStamp'
import AutoDateTimeNotice from '../components/AutoDateTimeNotice'
import { getLocalDateTimeNow } from '../utils/datetime'
import {
  getSinistroDocumentProcesses,
  sendDocumentoToGestor,
  sendToContabilidade,
} from '../utils/processes'

const PAGE_SIZE = 5

export default function SinistroOrdemPage() {
  const [version, setVersion] = useState(0)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [ordemFile, setOrdemFile] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [docxPreviewHtml, setDocxPreviewHtml] = useState('')
  const [docxPreviewMessage, setDocxPreviewMessage] = useState('')
  const session = getSession()

  const processos = useMemo(() => getSinistroDocumentProcesses(), [version])
  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase()
    return processos.filter((p) => {
      if (!q) return true
      return `${p.numeroSinistro} ${p.cliente} ${p.matricula}`.toLowerCase().includes(q)
    })
  }, [processos, query])

  const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtrados.slice(start, start + PAGE_SIZE)
  }, [filtrados, currentPage])

  const selectedProcess = useMemo(
    () => processos.find((item) => item.id === selectedId) || null,
    [processos, selectedId],
  )
  const signedFile = selectedProcess?.gestorAssinadoDocumento || null
  const sourceFile = selectedProcess?.ordemReparacaoDocumento || null
  const signedDataUrl = signedFile?.dataUrl || sourceFile?.dataUrl || ''
  const signedName = signedFile?.nome || sourceFile?.nome || ''
  const signedSignatureImage =
    signedFile?.assinaturaDigital?.imagemDataUrl || selectedProcess?.gestorAssinaturaMeta?.assinaturaImagem || ''
  const signedSignatureOpacity =
    signedFile?.assinaturaDigital?.opacity ?? selectedProcess?.gestorAssinaturaMeta?.opacity ?? 0.75
  const signedSignatureX = signedFile?.assinaturaDigital?.x || selectedProcess?.gestorAssinaturaMeta?.x || 40
  const signedSignatureY = signedFile?.assinaturaDigital?.y || selectedProcess?.gestorAssinaturaMeta?.y || 40

  const handleDownloadSigned = async () => {
    if (!selectedProcess) return
    if (!signedDataUrl) return
    const fileName = signedName || `assinado-${selectedProcess.numeroSinistro}.pdf`
    let finalDataUrl = signedDataUrl
    if (String(fileName).toLowerCase().endsWith('.pdf') && signedSignatureImage) {
      finalDataUrl = await createStampedPdfDataUrl({
        pdfDataUrl: signedDataUrl,
        signatureImageDataUrl: signedSignatureImage,
        x: signedSignatureX,
        y: signedSignatureY,
        opacity: signedSignatureOpacity,
      })
    }
    const anchor = document.createElement('a')
    anchor.href = finalDataUrl
    anchor.download = fileName
    anchor.click()
  }

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Falha ao ler arquivo'))
      reader.readAsDataURL(file)
    })

  const handleEnviarGestor = async () => {
    if (!selectedProcess) return
    if (!ordemFile) {
      setMensagem('Carregue o documento da Ordem/Quitação.')
      return
    }
    let dataUrl = ''
    try {
      dataUrl = await readFileAsDataUrl(ordemFile)
    } catch {
      setMensagem('Não foi possível ler o documento.')
      return
    }
    const updated = sendDocumentoToGestor(selectedProcess.id, {
      ordemReparacaoDocumento: {
        nome: ordemFile.name,
        tipo: ordemFile.type,
        tamanho: ordemFile.size,
        dataUrl,
      },
      ordemReparacaoDataUpload: getLocalDateTimeNow(),
      enviadoGestorData: getLocalDateTimeNow(),
    })
    if (!updated) {
      setMensagem('Falha ao enviar o documento para o gestor.')
      return
    }
    setOrdemFile(null)
    setVersion((v) => v + 1)
    setMensagem(`Documento enviado ao gestor para assinatura: ${updated.numeroSinistro}.`)
  }

  const handleEnviarContabilidade = () => {
    if (!selectedProcess) return
    if (!selectedProcess.gestorAssinadoDocumento) {
      setMensagem('Este processo ainda não foi assinado pelo gestor.')
      return
    }
    const confirmadoEm = getLocalDateTimeNow()
    const updated = sendToContabilidade(selectedProcess.id, {
      aprovacaoGestorNome: session?.name || 'Gestor Técnico',
      aprovacaoGestorData: confirmadoEm,
      enviadoContabilidadeData: confirmadoEm,
    })
    if (!updated) {
      setMensagem('Não foi possível enviar para a Contabilidade.')
      return
    }
    setVersion((v) => v + 1)
    setMensagem(`Processo ${updated.numeroSinistro} enviado para Contabilidade.`)
  }

  const etapaDocumento = (item) => {
    if (item.comprovativoPagamentoDocumento) return { label: 'Pagamento comprovado', className: 'finalizado' }
    if (item.enviadoContabilidade) return { label: 'Enviado para Contabilidade', className: 'emandamento' }
    if (item.gestorAssinadoDocumento) return { label: 'Assinado pelo gestor', className: 'finalizado' }
    if (item.enviadoGestor) return { label: 'Aguardando assinatura do gestor', className: 'emandamento' }
    if (item.ordemReparacaoDocumento) return { label: 'Documento carregado', className: 'iniciado' }
    return { label: 'Aguardando ordem', className: 'iniciado' }
  }

  const podeEnviarContabilidade = Boolean(selectedProcess?.gestorAssinadoDocumento) && !selectedProcess?.enviadoContabilidade

  useEffect(() => {
    let active = true
    const loadDocxPreview = async () => {
      setDocxPreviewHtml('')
      setDocxPreviewMessage('')
      const file = signedDataUrl ? { dataUrl: signedDataUrl, nome: signedName } : null
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
    if (previewOpen) loadDocxPreview()
    return () => {
      active = false
    }
  }, [previewOpen, signedDataUrl, signedName])

  return (
    <div className="form-page users-page">
      <h1 className="dash-title">Ordem de Reparação e Quitação</h1>
      <p className="form-subtitle">
        Carregue a Ordem/Quitação, informe a data e envie ao Gestor para assinatura digital.
      </p>

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
      <div className="table users-table credit-premium-table">
        <div className="tr th">
          <div>Nº Sinistro</div>
          <div>Cliente</div>
          <div>Etapa Documento</div>
          <div>Documento</div>
          <div>Ações</div>
        </div>
        {paged.map((item) => {
          const etapa = etapaDocumento(item)
          return (
          <div key={item.id} className={`tr credit-row ${selectedId === item.id ? 'tr-selected' : ''}`}>
            <div className="td-strong credit-col">{item.numeroSinistro}</div>
            <div className="credit-col">{item.cliente}</div>
            <div className="credit-col">
              <span className={`pill ${etapa.className}`}>{etapa.label}</span>
            </div>
            <div className="credit-col">
              {item.ordemReparacaoDocumento?.nome || '--'}
            </div>
            <div className="action-buttons">
              <button type="button" className="btn-table" onClick={() => setSelectedId(item.id)}>
                Selecionar
              </button>
            </div>
          </div>
          )
        })}
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

      {selectedProcess && (
        <section className="form-card form-card--wide" style={{ marginTop: '1rem' }}>
          <h3 style={{ marginTop: 0 }}>
            {selectedProcess.numeroSinistro} - {selectedProcess.cliente}
          </h3>

          <p className="form-subtitle" style={{ marginBottom: '0.3rem' }}>Documento Word da Ordem/Quitação</p>
          <div
            style={{
              border: '1px dashed #c8d7e7',
              borderRadius: '10px',
              padding: '0.8rem',
              marginBottom: '0.8rem',
              background: '#f8fbff',
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              const droppedFile = event.dataTransfer.files?.[0]
              if (droppedFile) setOrdemFile(droppedFile)
            }}
          >
            <div className="field-group" style={{ marginBottom: '0.5rem' }}>
              <FaFileUpload className="field-icon" />
              <input
                type="file"
                accept=".doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx"
                onChange={(event) => setOrdemFile(event.target.files?.[0] || null)}
              />
            </div>
            <small>Também pode arrastar e largar o documento aqui.</small>
          </div>

          <AutoDateTimeNotice label="Data da edição da ordem" />

          <button type="button" className="btn-table" onClick={handleEnviarGestor}>
            <FaPaperPlane /> Enviar ao Gestor para assinatura
          </button>

          {selectedProcess?.gestorAssinadoDocumento && (
            <button
              type="button"
              className="btn-table"
              style={{ marginLeft: '0.55rem' }}
              onClick={() => setPreviewOpen(true)}
            >
              <FaEye /> Visualizar documento assinado
            </button>
          )}

          <div style={{ marginTop: '1rem' }}>
            <AutoDateTimeNotice label="Data de aprovação para envio à Contabilidade" />
          </div>
          <button type="button" className="btn-table" onClick={handleEnviarContabilidade} disabled={!podeEnviarContabilidade}>
            <FaCheckCircle /> Assinar e enviar para Contabilidade
          </button>

          {mensagem && <p className="form-message" style={{ marginTop: '0.8rem' }}>{mensagem}</p>}
        </section>
      )}

      {selectedProcess && previewOpen && (
        <section className="form-card form-card--wide" style={{ marginTop: '1rem' }}>
          <div className="action-buttons" style={{ justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>
              Preview assinado - {selectedProcess.numeroSinistro}
            </h3>
            <div className="action-buttons">
              <button type="button" className="btn-table" onClick={handleDownloadSigned}>
                Baixar assinado
              </button>
              <button type="button" className="btn-table" onClick={() => setPreviewOpen(false)}>
                <FaTimesCircle /> Fechar
              </button>
            </div>
          </div>

          {signedDataUrl && signedName?.toLowerCase().endsWith('.pdf') && (
            <div style={{ position: 'relative' }}>
              <iframe
                title="Preview do documento assinado PDF"
                src={signedDataUrl}
                style={{ width: '100%', height: '520px', border: '1px solid #d8e2eb', borderRadius: '12px' }}
              />
              {signedSignatureImage && !signedFile?.pdfStamped && (
                <img
                  src={signedSignatureImage}
                  alt="Assinatura aplicada"
                  style={{
                    position: 'absolute',
                    left: `${signedSignatureX}px`,
                    top: `${signedSignatureY}px`,
                    maxWidth: '180px',
                    maxHeight: '72px',
                    background: 'transparent',
                    opacity: signedSignatureOpacity,
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
          )}

          {signedDataUrl && signedName?.toLowerCase().endsWith('.docx') && (
              <div
                style={{
                  position: 'relative',
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
                {signedSignatureImage && (
                  <img
                    src={signedSignatureImage}
                    alt="Assinatura aplicada"
                    style={{
                      position: 'absolute',
                      left: `${signedSignatureX}px`,
                      top: `${signedSignatureY}px`,
                      maxWidth: '180px',
                      maxHeight: '72px',
                      background: 'transparent',
                      opacity: signedSignatureOpacity,
                    }}
                  />
                )}
              </div>
            )}
        </section>
      )}
    </div>
  )
}

