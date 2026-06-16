import { useEffect, useMemo, useState } from 'react'
import {
  FaCalendarAlt,
  FaDownload,
  FaEye,
  FaFileAlt,
  FaFileSignature,
  FaHashtag,
  FaTimesCircle,
  FaUserTie,
} from 'react-icons/fa'
import mammoth from 'mammoth'
import { getGestorSignedProcesses } from '../utils/processes'
import { createStampedPdfDataUrl } from '../utils/pdfStamp'

export default function GestorDocumentosAssinadosPage() {
  const assinados = useMemo(() => getGestorSignedProcesses(), [])
  const [previewId, setPreviewId] = useState('')
  const [docxHtml, setDocxHtml] = useState('')
  const [docxMessage, setDocxMessage] = useState('')
  const previewProcess = useMemo(
    () => assinados.find((item) => item.id === previewId) || null,
    [assinados, previewId],
  )
  const previewFile = previewProcess?.gestorAssinadoDocumento || null
  const sourceFile = previewProcess?.ordemReparacaoDocumento || null
  const previewDataUrl = previewFile?.dataUrl || sourceFile?.dataUrl || ''
  const previewName = previewFile?.nome || sourceFile?.nome || ''
  const assinaturaImagem =
    previewFile?.assinaturaDigital?.imagemDataUrl || previewProcess?.gestorAssinaturaMeta?.assinaturaImagem || ''
  const assinaturaOpacity =
    previewFile?.assinaturaDigital?.opacity ?? previewProcess?.gestorAssinaturaMeta?.opacity ?? 0.75
  const assinaturaPosX = previewFile?.assinaturaDigital?.x || previewProcess?.gestorAssinaturaMeta?.x || 40
  const assinaturaPosY = previewFile?.assinaturaDigital?.y || previewProcess?.gestorAssinaturaMeta?.y || 40

  const handleDownload = async (item) => {
    const signed = item?.gestorAssinadoDocumento
    const source = item?.ordemReparacaoDocumento
    const dataUrl = signed?.dataUrl || source?.dataUrl
    const name = signed?.nome || source?.nome || `assinado-${item?.numeroSinistro || 'documento'}`
    if (!dataUrl) return

    let finalDataUrl = dataUrl
    if (String(name).toLowerCase().endsWith('.pdf')) {
      const signatureImage =
        signed?.assinaturaDigital?.imagemDataUrl || item?.gestorAssinaturaMeta?.assinaturaImagem || ''
      if (signatureImage) {
        finalDataUrl = await createStampedPdfDataUrl({
          pdfDataUrl: dataUrl,
          signatureImageDataUrl: signatureImage,
          x: signed?.assinaturaDigital?.x || item?.gestorAssinaturaMeta?.x || 40,
          y: signed?.assinaturaDigital?.y || item?.gestorAssinaturaMeta?.y || 40,
          opacity: signed?.assinaturaDigital?.opacity ?? item?.gestorAssinaturaMeta?.opacity ?? 0.75,
        })
      }
    }

    const anchor = document.createElement('a')
    anchor.href = finalDataUrl
    anchor.download = name
    anchor.click()
  }

  useEffect(() => {
    let active = true
    const loadDocxPreview = async () => {
      setDocxHtml('')
      setDocxMessage('')
      const file = previewDataUrl ? { dataUrl: previewDataUrl, nome: previewName } : null
      if (!file?.dataUrl || !file.nome?.toLowerCase().endsWith('.docx')) return
      try {
        const base64 = String(file.dataUrl).split(',')[1] || ''
        const raw = atob(base64)
        const buffer = new ArrayBuffer(raw.length)
        const bytes = new Uint8Array(buffer)
        for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i)
        const result = await mammoth.convertToHtml({ arrayBuffer: buffer })
        if (!active) return
        setDocxHtml(result.value || '<p>Documento sem conteúdo para mostrar.</p>')
      } catch {
        if (!active) return
        setDocxMessage('Não foi possível gerar a pré-visualização deste DOCX.')
      }
    }
    loadDocxPreview()
    return () => {
      active = false
    }
  }, [previewDataUrl, previewName])

  return (
    <div className="form-page users-page">
      <h1 className="dash-title">Gestor - Documentos Assinados</h1>
      <p className="form-subtitle">Histórico de documentos assinados digitalmente e devolvidos ao Sinistro.</p>

      <div className="table users-table credit-premium-table">
        <div className="tr th">
          <div><span className="juridico-th-label"><FaHashtag /> Nº Sinistro</span></div>
          <div><span className="juridico-th-label"><FaUserTie /> Cliente</span></div>
          <div><span className="juridico-th-label"><FaFileSignature /> Assinado por</span></div>
          <div><span className="juridico-th-label"><FaCalendarAlt /> Data</span></div>
          <div><span className="juridico-th-label"><FaFileAlt /> Documento</span></div>
          <div><span className="juridico-th-label"><FaDownload /> Ações</span></div>
        </div>
        {assinados.map((item) => (
          <div key={item.id} className="tr">
            <div className="td-strong credit-col">{item.numeroSinistro}</div>
            <div className="credit-col">{item.cliente}</div>
            <div className="credit-col">{item.gestorAssinadoPor || '--'}</div>
            <div className="credit-col">{item.gestorAssinadoData || '--'}</div>
            <div className="credit-col">{item.gestorAssinadoDocumento?.nome || '--'}</div>
            <div className="action-buttons">
              <button type="button" className="btn-table" onClick={() => setPreviewId(item.id)}>
                <FaEye /> Visualizar
              </button>
              {(item.gestorAssinadoDocumento?.dataUrl || item.ordemReparacaoDocumento?.dataUrl) ? (
                <button type="button" className="btn-table" onClick={() => handleDownload(item)}>
                  <FaDownload /> Baixar
                </button>
              ) : (
                '--'
              )}
            </div>
          </div>
        ))}
        {assinados.length === 0 && (
          <div className="tr">
            <div>Nenhum documento assinado ainda.</div>
            <div />
            <div />
            <div />
            <div />
            <div />
          </div>
        )}
      </div>

      {previewProcess && (
        <section className="form-card form-card--wide" style={{ marginTop: '1rem' }}>
          <div className="action-buttons" style={{ justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>
              Preview assinado - {previewProcess.numeroSinistro}
            </h3>
            <button type="button" className="btn-table" onClick={() => setPreviewId('')}>
              <FaTimesCircle /> Fechar
            </button>
          </div>
          <p className="form-subtitle" style={{ marginTop: '0.4rem' }}>
            {previewName || 'Documento assinado'}
          </p>

          {previewDataUrl && previewName?.toLowerCase().endsWith('.pdf') && (
            <div style={{ position: 'relative' }}>
              <iframe
                title="Preview do documento assinado PDF"
                src={previewDataUrl}
                style={{ width: '100%', height: '520px', border: '1px solid #d8e2eb', borderRadius: '12px' }}
              />
              {assinaturaImagem && !previewFile?.pdfStamped && (
                <img
                  src={assinaturaImagem}
                  alt="Assinatura aplicada"
                  style={{
                    position: 'absolute',
                    left: `${assinaturaPosX}px`,
                    top: `${assinaturaPosY}px`,
                    maxWidth: '180px',
                    maxHeight: '72px',
                    background: 'transparent',
                    opacity: assinaturaOpacity,
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
          )}

          {previewDataUrl && previewName?.toLowerCase().endsWith('.docx') && (
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
                {docxMessage && <p>{docxMessage}</p>}
                {!docxMessage && (
                  <div dangerouslySetInnerHTML={{ __html: docxHtml || '<p>A carregar pré-visualização...</p>' }} />
                )}
                {assinaturaImagem && (
                  <img
                    src={assinaturaImagem}
                    alt="Assinatura aplicada"
                    style={{
                      position: 'absolute',
                      left: `${assinaturaPosX}px`,
                      top: `${assinaturaPosY}px`,
                      maxWidth: '180px',
                      maxHeight: '72px',
                      background: 'transparent',
                      opacity: assinaturaOpacity,
                    }}
                  />
                )}
              </div>
            )}

          {previewDataUrl &&
            !previewName?.toLowerCase().endsWith('.pdf') &&
            !previewName?.toLowerCase().endsWith('.docx') && (
              <div className="form-card">
                <p>Este formato não suporta preview embutido. Use o botão de download para visualizar localmente.</p>
              </div>
            )}
        </section>
      )}
    </div>
  )
}
